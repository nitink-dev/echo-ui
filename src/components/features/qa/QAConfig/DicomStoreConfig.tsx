import { Database, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { usePermissions } from "../../../../hooks/usePermissions";
import { Button } from "../../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Label } from "../../../ui/label";
import { useSlideScan } from "../../status/SlideScanContext";

interface DicomStoreConfigProps {
  dicomStores: string[];
  dicomStoreAddress: string;
  onSave: (address: string) => void;
}

export function DicomStoreConfig({
  dicomStores,
  dicomStoreAddress,
  onSave,
}: DicomStoreConfigProps) {
  const [isEditingDicom, setIsEditingDicom] = useState(false);
  const [tempDicomAddress, setTempDicomAddress] = useState(dicomStoreAddress);
  const { canWrite } = usePermissions();
  const canEditDicomStore = canWrite("qa-analysis");

  const { inProgressCunt} = useSlideScan();
  const isScanInProgress = inProgressCunt > 0;

    useEffect(() => {
    setTempDicomAddress(dicomStoreAddress);
    console.log("Dicom Store Address updated:", dicomStoreAddress);
  }, [dicomStoreAddress]);

  const handleEditDicom = () => {
    setIsEditingDicom(true);
    setTempDicomAddress(dicomStoreAddress);
  };

  const handleSaveDicom = () => {
    onSave(tempDicomAddress);
    setIsEditingDicom(false);
  };

  const handleCancelDicom = () => {
    setTempDicomAddress(dicomStoreAddress);
    setIsEditingDicom(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          DICOM Store for QA
        </CardTitle>
        <CardDescription>
          Configure the DICOM store address for QA slide analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="dicomStore">DICOM Store Address</Label>
            <div className="flex gap-2 mt-2">
              <select
                id="dicomStore"
                disabled={!isEditingDicom}
                value={tempDicomAddress}
                onChange={(e) => setTempDicomAddress(e.target.value)}
                className="h-11 w-full rounded-md bg-[#f8faff] border border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
              >
                <option value="">Select DICOM Store</option>
                {dicomStores.map((store, i) => {
                  const value =
                    typeof store === "object"
                      ? (store as any).dicomUrl || store
                      : store;
                  return (
                    <option key={i} value={value}>
                      {value}
                    </option>
                  );
                })}
              </select>
              {canEditDicomStore && (
                <>
                  {isEditingDicom ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveDicom}
                        disabled={isScanInProgress}
                        title={
                        isScanInProgress
                          ? "A slide scan is currently in progress. Editing is disabled."
                          : undefined
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Save
                      </Button>
                      <Button variant="outline" onClick={handleCancelDicom}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={handleEditDicom} 
                    disabled={isScanInProgress} 
                    title={
                        isScanInProgress
                          ? "A slide scan is currently in progress. Editing is disabled."
                          : undefined
                      }>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Full path to the Google Cloud DICOM store for QA slide storage
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
