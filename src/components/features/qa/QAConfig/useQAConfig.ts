import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../../hooks';
import { useSelector } from 'react-redux';
import { 
  fetchQAParameters, 
  fetchDicomStores,
  addQAParameter,
  updateQAParameter,
  deleteQAParameter,
  updateDicomStore
} from '../../../../store/slices/qaSlice';
import { QASlideParameter, QAFormData } from '../../../../types/qa.types';
import { validateQAParameter } from '../../../../utils/validation';
import { toast } from 'sonner';

const initialFormData: QAFormData = {
  barcode: '',
  activationCode: ''
};

export const useQAConfig = () => {
  const dispatch = useAppDispatch();
  const [parameterModalOpen, setParameterModalOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<QASlideParameter | null>(null);
  const [parameterFormData, setParameterFormData] = useState<QAFormData>(initialFormData);
  const [parameterErrors, setParameterErrors] = useState<{ [key: string]: string }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [parameterToDelete, setParameterToDelete] = useState<QASlideParameter | null>(null);
  const [visibleActivationCodes, setVisibleActivationCodes] = useState<{ [id: string]: boolean }>({});

  const qaParameters = useSelector((state: any) => state.qa.qaParameters);
  const dicomStores = useSelector((state: any) => state.qa.dicomStores);
  const dicomStoreAddress = useSelector((state: any) => state.qa.dicomStoreAddress);

  useEffect(() => {
    dispatch(fetchQAParameters());
    dispatch(fetchDicomStores());
  }, [dispatch]);

  const handleAddParameter = () => {
    setEditingParameter(null);
    setParameterFormData(initialFormData);
    setParameterErrors({});
    setParameterModalOpen(true);
  };

  const handleEditParameter = (parameter: QASlideParameter) => {
    setEditingParameter(parameter);
    setParameterFormData({
      barcode: parameter.barcode,
      activationCode: parameter.activationCode
    });
    setParameterErrors({});
    setParameterModalOpen(true);
  };

  const handleParameterInputChange = (field: keyof QAFormData, value: string) => {
    setParameterFormData(prev => ({ ...prev, [field]: value }));
    if (parameterErrors[field]) {
      setParameterErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSaveParameter = async () => {
    const existingBarcodes = qaParameters.map((p: QASlideParameter) => p.barcode);
    const errors = validateQAParameter(
      parameterFormData, 
      existingBarcodes, 
      editingParameter?.barcode
    );

    if (Object.keys(errors).length > 0) {
      setParameterErrors(errors);
      toast.error('Please correct the errors in the form');
      return;
    }

    const payload = {
      barcode: parameterFormData.barcode,
      activationCode: parameterFormData.activationCode
    };

    try {
      if (editingParameter) {
        await dispatch(updateQAParameter(payload));
        toast.success('QA Slide Parameter updated successfully');
      } else {
        await dispatch(addQAParameter(payload));
        toast.success('QA Slide Parameter added successfully');
      }
      setParameterModalOpen(false);
      setEditingParameter(null);
      setParameterFormData(initialFormData);
    } catch (err: any) {
      toast.error(err.message || 'Error saving QA Slide Parameter');
    }
  };

  const handleDeleteClick = (parameter: QASlideParameter) => {
    setParameterToDelete(parameter);
    setDeleteDialogOpen(true);
  };

  // FIX: extracted cancel logic into its own handler so QAConfig can call it directly
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setParameterToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (parameterToDelete) {
      try {
        await dispatch(deleteQAParameter(parameterToDelete.barcode));
        toast.success(`QA Slide Parameter "${parameterToDelete.barcode}" deleted successfully`);
      } catch (err: any) {
        toast.error(err.message || 'Error deleting QA Slide Parameter');
      } finally {
        setDeleteDialogOpen(false);
        setParameterToDelete(null);
      }
    }
  };

  const toggleActivationCodeVisibility = (id: string) => {
    setVisibleActivationCodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSaveDicomStore = async (dicomStoreAddress: string) => {
    if (!dicomStoreAddress.trim()) {
      toast.error('DICOM store address cannot be empty');
      return;
    }

    try {
      await dispatch(updateDicomStore(dicomStoreAddress));
      toast.success('DICOM store address updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error updating DICOM store');
    }
  };

  return {
    qaParameters,
    dicomStores,
    dicomStoreAddress,
    parameterModalOpen,
    editingParameter,
    parameterFormData,
    parameterErrors,
    deleteDialogOpen,
    parameterToDelete,
    visibleActivationCodes,
    setParameterModalOpen,
    setDeleteDialogOpen,       // FIX: was missing — needed by AlertDialog onOpenChange
    handleAddParameter,
    handleEditParameter,
    handleParameterInputChange,
    handleSaveParameter,
    handleDeleteClick,
    handleDeleteCancel,        // FIX: new — explicit cancel handler for the Cancel button
    handleDeleteConfirm,
    toggleActivationCodeVisibility,
    handleSaveDicomStore
  };
};