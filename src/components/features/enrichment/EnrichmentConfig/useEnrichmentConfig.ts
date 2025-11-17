import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../../hooks';
import { fetchEhTool, patchEhTool } from '../../../../store/slices/ehToolsSlice';
import { toast } from 'sonner';
import { ENRICHMENT_TOOLS } from '../../../../utils/constants';
import { getChangedFields } from '../../../../utils/helpers';
import { EnrichmentFormData, EnrichmentSection } from '../../../../types/enrichment.types';

export const useEnrichmentConfig = () => {
  const dispatch = useAppDispatch();
  const {
    dicomReceiver,
    lisConnector,
    enrichmentService,
    exportService,
    hl7Connector,
    emailService,
    loading
  } = useSelector((s: any) => s.ehTools || {});

  const [editMode, setEditMode] = useState<Record<EnrichmentSection, boolean>>({
    dicom: false,
    lis: false,
    enrichment: false,
    export: false,
    hl7: false,
    email: false
  });

  const [form, setForm] = useState<EnrichmentFormData>({
    dicomReceiver: { aet: '', ipAddress: '', port: '', networkDrive: '' },
    lisConnector: {
      applicationName: '',
      ipAddress: '',
      receivingPort: '',
      incomingPort: '',
      receivingFacility: '',
      receivingAppName: '',
      sendingFacility: ''
    },
    enrichmentService: { messageType: '' },
    exportService: {
      synapseServerFolder: '',
      synapseEnabled: false,
      visioPharmEnabled: false,
      ibexEnabled: false
    },
    hl7Messaging: {
      applicationName: '',
      ipAddress: '',
      receivingPort: '',
      outputPort: '',
      receivingFacility: '',
      receivingAppName: '',
      sendingFacility: ''
    },
    emailService: {
      emailFrom: '',
      emailTo: [],
      emailIbexTo: []
    }
  });

  const [originalForm, setOriginalForm] = useState(form);

  // Fetch all tools once
  useEffect(() => {
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.DICOM_RECEIVER }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.LIS_CONNECTOR }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.ENRICHMENT_SERVICE }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.EXPORT_SERVICE }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.HL7_CONNECTOR }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.EMAIL_SERVICE }));
  }, [dispatch]);

  // Sync DICOM Receiver
  useEffect(() => {
    if (dicomReceiver && Object.keys(dicomReceiver).length > 0) {
      const newData = {
        aet: dicomReceiver.aet || dicomReceiver['storescp.aetitle'] || '',
        port: dicomReceiver.port || dicomReceiver['server.port'] || '',
        ipAddress: dicomReceiver.ipAddress || dicomReceiver['server.ipAddress'] || '',
        networkDrive: dicomReceiver['network-drive'] || dicomReceiver['storescp.storage.path'] || ''
      };
      setForm(prev => ({ ...prev, dicomReceiver: newData }));
      setOriginalForm(prev => ({ ...prev, dicomReceiver: newData }));
    }
  }, [dicomReceiver]);

  // Sync LIS Connector
  useEffect(() => {
    if (lisConnector && Object.keys(lisConnector).length > 0) {
      setForm(prev => ({ ...prev, lisConnector }));
      setOriginalForm(prev => ({ ...prev, lisConnector }));
    }
  }, [lisConnector]);

  // Sync Enrichment Service
  useEffect(() => {
    if (enrichmentService && Object.keys(enrichmentService).length > 0) {
      setForm(prev => ({ ...prev, enrichmentService }));
      setOriginalForm(prev => ({ ...prev, enrichmentService }));
    }
  }, [enrichmentService]);

  // Sync Export Service
  useEffect(() => {
    if (exportService && Object.keys(exportService).length > 0) {
      setForm(prev => ({ ...prev, exportService }));
      setOriginalForm(prev => ({ ...prev, exportService }));
    }
  }, [exportService]);

  // Sync HL7 Connector
  useEffect(() => {
    if (hl7Connector && Object.keys(hl7Connector).length > 0) {
      setForm(prev => ({ ...prev, hl7Messaging: hl7Connector }));
      setOriginalForm(prev => ({ ...prev, hl7Messaging: hl7Connector }));
    }
  }, [hl7Connector]);

  // Sync Email Service
  useEffect(() => {
    if (emailService && Object.keys(emailService).length > 0) {
      setForm(prev => ({ ...prev, emailService }));
      setOriginalForm(prev => ({ ...prev, emailService }));
    }
  }, [emailService]);

  // Handle edit toggle
  const handleEdit = (key: EnrichmentSection, enable: boolean) => {
    setEditMode(prev => ({ ...prev, [key]: enable }));
    if (!enable) setForm(originalForm);
  };

  // Handle value change
  const handleChange = (section: keyof EnrichmentFormData, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  // Handle save per section
  const handleSave = async (type: EnrichmentSection) => {
    let toolKey = '';
    let body: any = {};
    let sectionName = '';

    switch (type) {
      // 🩺 DICOM Receiver
      case 'dicom':
        toolKey = ENRICHMENT_TOOLS.DICOM_RECEIVER;
        sectionName = 'DICOM Receiver';
        const dicomDiff = getChangedFields(form.dicomReceiver, originalForm.dicomReceiver);
        if (Object.keys(dicomDiff).length === 0) return toast.info('No changes detected');
        body = {
          ...(dicomDiff.aet && { aet: dicomDiff.aet }),
          ...(dicomDiff.port && { port: dicomDiff.port }),
          ...(dicomDiff.ipAddress && { ipAddress: dicomDiff.ipAddress }),
          ...(dicomDiff.networkDrive && { 'network-drive': dicomDiff.networkDrive })
        };
        break;

      // 🧩 LIS Connector
      case 'lis':
        toolKey = ENRICHMENT_TOOLS.LIS_CONNECTOR;
        sectionName = 'LIS Connector';
        const lisDiff = getChangedFields(form.lisConnector, originalForm.lisConnector);
        if (Object.keys(lisDiff).length === 0) return toast.info('No changes detected');
        body = { ...lisDiff };
        break;

      // 🧠 Enrichment Service
      case 'enrichment':
        toolKey = ENRICHMENT_TOOLS.ENRICHMENT_SERVICE;
        sectionName = 'Enrichment Service';
        const enrichDiff = getChangedFields(form.enrichmentService, originalForm.enrichmentService);
        if (Object.keys(enrichDiff).length === 0) return toast.info('No changes detected');
        body = { ...enrichDiff };
        break;

      // 📤 Export Service
      case 'export':
        toolKey = ENRICHMENT_TOOLS.EXPORT_SERVICE;
        sectionName = 'Export Service';
        const exportDiff = getChangedFields(form.exportService, originalForm.exportService);
        if (Object.keys(exportDiff).length === 0) return toast.info('No changes detected');
        body = {
          ...(exportDiff.synapseServerFolder && { synapseServerFolder: exportDiff.synapseServerFolder }),
          ...(exportDiff.synapseEnabled !== undefined && { synapseEnabled: exportDiff.synapseEnabled }),
          ...(exportDiff.visioPharmEnabled !== undefined && { visioPharmEnabled: exportDiff.visioPharmEnabled }),
          ...(exportDiff.ibexEnabled !== undefined && { ibexEnabled: exportDiff.ibexEnabled })
        };
        break;

      // 🧬 HL7 Messaging
      case 'hl7':
        toolKey = ENRICHMENT_TOOLS.HL7_CONNECTOR;
        sectionName = 'HL7 Connector';
        const hl7Diff = getChangedFields(form.hl7Messaging, originalForm.hl7Messaging);
        if (Object.keys(hl7Diff).length === 0) return toast.info('No changes detected');
        body = { ...hl7Diff };
        break;

      // 📧 Email Service
      case 'email':
        toolKey = ENRICHMENT_TOOLS.EMAIL_SERVICE;
        sectionName = 'Email Service';
        const emailDiff = getChangedFields(form.emailService, originalForm.emailService);
        if (Object.keys(emailDiff).length === 0) return toast.info('No changes detected');
        body = {
          ...(emailDiff.emailFrom && { emailFrom: emailDiff.emailFrom }),
          ...(emailDiff.emailTo && { emailTo: emailDiff.emailTo }),
          ...(emailDiff.emailIbexTo && { emailIbexTo: emailDiff.emailIbexTo })
        };
        break;

      default:
        toast.error('Unknown section');
        return;
    }

    try {
      await dispatch(patchEhTool({ toolKey, body })).unwrap();
      toast.success(`${sectionName} updated successfully`);
      setOriginalForm(prev => ({ ...prev, [type]: form[type as keyof EnrichmentFormData] }));
      setEditMode(prev => ({ ...prev, [type]: false }));
    } catch (error) {
      toast.error(`Failed to update ${sectionName}`);
    }
  };

  return {
    form,
    editMode,
    loading,
    handleEdit,
    handleChange,
    handleSave
  };
};
