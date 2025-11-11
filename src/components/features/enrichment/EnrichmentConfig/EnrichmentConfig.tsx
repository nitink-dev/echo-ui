import React, { useEffect, useState } from "react";
import {
  Network,
  Database,
  Activity,
  Settings,
  MessageSquare,
  FolderOpen,
  Cloud,
  Clock,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X,
  Mail,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Switch } from "../../../ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../ui/collapsible";
import { useSelector } from "react-redux";
import { fetchEhTool, patchEhTool } from "../../../../store/slices/ehToolsSlice";
import { toast } from "sonner";
import { useAppDispatch } from "../../../../hooks";
import { ENRICHMENT_TOOLS } from "../../../../utils/constants";

export function EnrichmentToolConfig() {
  const dispatch = useAppDispatch();
  const {
    dicomReceiver,
    lisConnector,
    enrichmentService,
    exportService,
    hl7Connector,
    emailService,
    loading,
  } = useSelector((s: any) => s.ehTools || {});

  const [initializedSections, setInitializedSections] = useState({
    dicom: false,
    lis: false,
    enrichment: false,
    export: false,
    hl7: false,
    email: false,
  });
  

  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({
    dicom: false,
    lis: false,
    enrichment: false,
    export: false,
    hl7: false,
    email: false,
  });

  // Initialize empty form (no static defaults)
const [form, setForm] = useState<any>({
  dicomReceiver: { aet: "", ipAddress: "", port: "", networkDrive: "" },
  lisConnector: {
    applicationName: "",
    ipAddress: "",
    receivingPort: "",
    incomingPort: "",
    receivingFacility: "",
    receivingAppName: "",
    sendingFacility: "",
  },
  enrichmentService: { messageType: "" },
  exportService: {
    synapseServerFolder: "",
    synapseEnabled: false,
    visioPharmEnabled: false,
    ibexEnabled: false,
  },
  hl7Messaging: {
    applicationName: "",
    ipAddress: "",
    receivingPort: "",
    outputPort: "",
    receivingFacility: "",
    receivingAppName: "",
    sendingFacility: "",
  },
  emailService: {
    emailFrom: "",
    emailTo: [] as string[],
    emailIbexTo: [] as string[],
  },
});


  const [originalForm, setOriginalForm] = useState(form);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.DICOM_RECEIVER }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.LIS_CONNECTOR }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.ENRICHMENT_SERVICE }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.EXPORT_SERVICE }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.HL7_CONNECTOR }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.EMAIL_SERVICE }));
  }, [dispatch]);

  // Sync dicomReceiver
  useEffect(() => {
    if (!dicomReceiver || Object.keys(dicomReceiver).length === 0 || initializedSections.dicom)
      return;
  
    const newData = {
      aet: dicomReceiver.aet || dicomReceiver["storescp.aetitle"] || "",
      port: dicomReceiver.port || dicomReceiver["server.port"] || "",
      ipAddress: dicomReceiver.ipAddress || dicomReceiver["server.ipAddress"] || "",
      networkDrive: dicomReceiver["network-drive"] || dicomReceiver["storescp.storage.path"] || "",
    };
  
    setForm((prev: any) => ({ ...prev, dicomReceiver: newData }));
    setOriginalForm((prev: any) => ({ ...prev, dicomReceiver: newData }));
    setInitializedSections((p) => ({ ...p, dicom: true }));
  }, [dicomReceiver]);
  
  

  // Sync lisConnector
  useEffect(() => {
    if (lisConnector && !initializedSections.lisConnector) {
      const newData = {
        applicationName: lisConnector.name || lisConnector.appName || "",
        ipAddress: lisConnector["lis.ipAddress"] || lisConnector.ipAddress || "",
        receivingPort:
          lisConnector["lis.port"]?.toString() ||
          lisConnector.receivingPort?.toString() ||
          lisConnector.port?.toString() ||
          "",
        incomingPort:
          lisConnector["incoming-port"]?.toString() ||
          lisConnector.incomingPort?.toString() ||
          lisConnector.incoming?.toString() ||
          "",
        receivingFacility: lisConnector.receivingFacility || "",
        receivingAppName: lisConnector.receivingAppName || lisConnector.receivingApp || lisConnector.receivingAppName || "",
        sendingFacility: lisConnector.sendingFacility || "",
      };
      setForm((prev: any) => ({ ...prev, lisConnector: newData }));
      setOriginalForm((prev: any) => ({ ...prev, lisConnector: newData }));
      setInitializedSections((p) => ({ ...p, lisConnector: true }));
    }
  }, [lisConnector]);

  // Sync enrichmentService
  useEffect(() => {
    if (enrichmentService && enrichmentService.messageType && !initializedSections.enrichmentService) {
      const newData = {
        messageType: enrichmentService.messageType || "OUL",
      };
      setForm((prev: any) => ({ ...prev, enrichmentService: newData }));
      setOriginalForm((prev: any) => ({ ...prev, enrichmentService: newData }));
      setInitializedSections((p) => ({ ...p, enrichmentService: true }));
    }
  }, [enrichmentService]);

  // Sync exportService
  useEffect(() => {
    if (exportService && !initializedSections.exportService) {
      const newData = {
        synapseServerFolder: exportService.synapseServerFolder || "gt450dx",
        synapseEnabled:
          typeof exportService.synapseEnabled === "boolean"
            ? exportService.synapseEnabled
            : exportService.synapseEnabled === "true",
        visioPharmEnabled:
          typeof exportService.visioPharmEnabled === "boolean"
            ? exportService.visioPharmEnabled
            : exportService.visioPharmEnabled === "true",
        ibexEnabled:
          typeof exportService.ibexEnabled === "boolean"
            ? exportService.ibexEnabled
            : exportService.ibexEnabled === "true",
      };
      setForm((prev: any) => ({ ...prev, exportService: newData }));
      setOriginalForm((prev: any) => ({ ...prev, exportService: newData }));
      setInitializedSections((p) => ({ ...p, enrichmentService: true }));

    }
  }, [exportService]);

  // HL7 Connector
  useEffect(() => {
    if (!hl7Connector || initializedSections.hl7Connector) return;
  
    const raw =
      hl7Connector?.data ||
      hl7Connector?.payload?.data ||
      hl7Connector?.payload ||
      hl7Connector;
  
    console.log("Normalized HL7 Connector Data:", raw);
  
    if (raw && Object.keys(raw).length > 0) {
      const newData = {
        applicationName: raw.appName || raw.name || "",
        ipAddress: raw.ipAddress || "",
        receivingPort:
          raw["receive-port"]?.toString() ||
          raw.receivePort?.toString() ||
          raw.receivingPort?.toString() ||
          "",
        outputPort: raw.outputPort?.toString() || "",
        receivingFacility: raw.receivingFacility || "",
        receivingAppName: raw.receivingAppName || raw.receivingApp || "",
        sendingFacility: raw.sendingFacility || "",
      };
      setForm((prev: any) => ({ ...prev, hl7Messaging: newData }));
      setOriginalForm((prev: any) => ({ ...prev, hl7Messaging: newData }));
      setInitializedSections((p) => ({ ...p, hl7Connector: true }));

    }
  }, [hl7Connector]);
  

// Sync emailService (load once when API gives first data)
useEffect(() => {
  if (!emailService || Object.keys(emailService).length === 0) return;

  setForm((prev: any) => {
    // only initialize if empty
    const alreadyInitialized =
      prev.emailService.emailFrom ||
      prev.emailService.emailTo.length ||
      prev.emailService.emailIbexTo.length;

    if (alreadyInitialized) return prev;

    const normalizeToArray = (v: any) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      if (typeof v === "string")
        return v.split(",").map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const newData = {
      emailFrom: Array.isArray(emailService.emailFrom)
        ? emailService.emailFrom[0] || ""
        : emailService.emailFrom || "",
      emailTo: normalizeToArray(emailService.emailTo),
      emailIbexTo: normalizeToArray(emailService.emailIbexTo),
    };

    return { ...prev, emailService: newData };
  });

  setOriginalForm((prev: any) => {
    const alreadyInitialized =
      prev.emailService.emailFrom ||
      prev.emailService.emailTo.length ||
      prev.emailService.emailIbexTo.length;
    if (alreadyInitialized) return prev;

    const normalizeToArray = (v: any) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      if (typeof v === "string")
        return v.split(",").map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const newData = {
      emailFrom: Array.isArray(emailService.emailFrom)
        ? emailService.emailFrom[0] || ""
        : emailService.emailFrom || "",
      emailTo: normalizeToArray(emailService.emailTo),
      emailIbexTo: normalizeToArray(emailService.emailIbexTo),
    };

    return { ...prev, emailService: newData };
  });
}, [emailService]);


  

  const handleEdit = (key: keyof typeof editMode, enable: boolean) => {
    setEditMode((prev) => ({ ...prev, [key]: enable }));
    if (!enable) setForm(originalForm);
  };

  const handleChange = (section: keyof typeof form, field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  // helper function for diff
  const getChangedFields = (current: any, original: any) => {
    const diff: any = {};
    Object.keys(current).forEach((k) => {
      const cur = current[k];
      const orig = original?.[k];

      // normalize arrays to string for comparison
      if (Array.isArray(cur) || Array.isArray(orig)) {
        const curStr = Array.isArray(cur) ? cur.join(",") : (cur || "").toString();
        const origStr = Array.isArray(orig) ? orig.join(",") : (orig || "").toString();
        if (curStr.trim() !== origStr.trim()) diff[k] = cur;
      } else {
        if ((cur || "").toString().trim() !== (orig || "").toString().trim()) {
          diff[k] = cur;
        }
      }
    });
    return diff;
  };

  const handleSave = async (type: keyof typeof editMode) => {
    let toolKey = "";
    let body: any = {};
    let sectionName = "";

    switch (type) {
      case "dicom":
        toolKey = "eh-dicom-receiver";
        sectionName = "DICOM Receiver";

        const dicomDiff = getChangedFields(
          form.dicomReceiver,
          originalForm.dicomReceiver
        );
        if (Object.keys(dicomDiff).length === 0) {
          toast.info("No changes detected");
          setEditMode((prev) => ({ ...prev, [type]: false }));
          return;
        }

        body = {
          ...(dicomDiff.aet && { aet: dicomDiff.aet }),
          ...(dicomDiff.port && { port: dicomDiff.port }),
          ...(dicomDiff.ipAddress && { ipAddress: dicomDiff.ipAddress }),
          ...(dicomDiff.networkDrive && { "network-drive": dicomDiff.networkDrive }),
        };
        break;

      case "lis":
        toolKey = "eh-lis-connector";
        sectionName = "LIS Connector";

        const lisDiff = getChangedFields(form.lisConnector, originalForm.lisConnector);
        if (Object.keys(lisDiff).length === 0) {
          toast.info("No changes detected");
          setEditMode((prev) => ({ ...prev, [type]: false }));
          return;
        }

        body = {
          ...(lisDiff.applicationName && { appName: lisDiff.applicationName }),
          ...(lisDiff.ipAddress && { ipAddress: lisDiff.ipAddress }),
          ...(lisDiff.receivingPort && { port: parseInt(lisDiff.receivingPort) }),
          ...(lisDiff.incomingPort && { "incoming-port": parseInt(lisDiff.incomingPort) }),
          // new fields
          ...(lisDiff.receivingFacility !== undefined && { receivingFacility: lisDiff.receivingFacility }),
          ...(lisDiff.receivingAppName !== undefined && { receivingAppName: lisDiff.receivingAppName }),
          ...(lisDiff.sendingFacility !== undefined && { sendingFacility: lisDiff.sendingFacility }),
        };
        break;

      case "enrichment":
        toolKey = "eh-enrichment-service";
        sectionName = "Enrichment Service";
        body = getChangedFields(form.enrichmentService, originalForm.enrichmentService);
        if (Object.keys(body).length === 0) {
          toast.info("No changes detected");
          setEditMode((prev) => ({ ...prev, [type]: false }));
          return;
        }
        break;

      case "export":
        toolKey = "eh-export-service";
        sectionName = "Export Service";
        const exportDiff = getChangedFields(form.exportService, originalForm.exportService);
        if (Object.keys(exportDiff).length === 0) {
          toast.info("No changes detected");
          setEditMode((prev) => ({ ...prev, [type]: false }));
          return;
        }
        body = {
          ...(exportDiff.synapseServerFolder && { synapseServerFolder: exportDiff.synapseServerFolder }),
          ...(exportDiff.synapseEnabled !== undefined && { synapseEnabled: !!exportDiff.synapseEnabled }),
          ...(exportDiff.visioPharmEnabled !== undefined && { visioPharmEnabled: !!exportDiff.visioPharmEnabled }),
          ...(exportDiff.ibexEnabled !== undefined && { ibexEnabled: !!exportDiff.ibexEnabled }),
        };
        break;

      case "hl7":
        toolKey = "eh-hl7-connector";
        sectionName = "HL7 Messaging";

        const hl7Diff = getChangedFields(form.hl7Messaging, originalForm.hl7Messaging);
        if (Object.keys(hl7Diff).length === 0) {
          toast.info("No changes detected");
          setEditMode((prev) => ({ ...prev, [type]: false }));
          return;
        }
        body = {
          ...(hl7Diff.applicationName && { appName: hl7Diff.applicationName }),
          ...(hl7Diff.ipAddress && { ipAddress: hl7Diff.ipAddress }),
          ...(hl7Diff.receivingPort && { "receive-port": parseInt(hl7Diff.receivingPort) }),
          ...(hl7Diff.outputPort && { outputPort: parseInt(hl7Diff.outputPort) }),
          ...(hl7Diff.receivingFacility !== undefined && { receivingFacility: hl7Diff.receivingFacility }),
          ...(hl7Diff.receivingAppName !== undefined && { receivingAppName: hl7Diff.receivingAppName }),
          ...(hl7Diff.sendingFacility !== undefined && { sendingFacility: hl7Diff.sendingFacility }),
        };
        break;

      case "email":
        toolKey = "eh-email-service";
        sectionName = "Email Service";
        const emailDiff = getChangedFields(form.emailService, originalForm.emailService);
        if (Object.keys(emailDiff).length === 0) {
          toast.info("No changes detected");
          setEditMode((prev) => ({ ...prev, [type]: false }));
          return;
        }

        // Ensure arrays are sent as arrays and emailFrom as array (to match sample payload)
        const cleanEmailTo = (form.emailService.emailTo || []).filter((e: string) => e.trim() !== "");
        const cleanEmailIbexTo = (form.emailService.emailIbexTo || []).filter((e: string) => e.trim() !== "");

        body = {
          ...(emailDiff.emailFrom !== undefined && { emailFrom: [form.emailService.emailFrom] }),
          ...(emailDiff.emailTo !== undefined && { emailTo: cleanEmailTo }),
          ...(emailDiff.emailIbexTo !== undefined && { emailIbexTo: cleanEmailIbexTo }),
        };

        break;
    }

    console.log("PATCH Request Body:", body);
    console.log("Tool Key:", toolKey);

    try {
      await dispatch(patchEhTool({ toolKey, body })).unwrap();
      toast.success(`${sectionName} updated successfully`);

      // Update only that section in originalForm
      setOriginalForm((prev: any) => ({
        ...prev,
        [type === "dicom"
          ? "dicomReceiver"
          : type === "lis"
          ? "lisConnector"
          : type === "enrichment"
          ? "enrichmentService"
          : type === "export"
          ? "exportService"
          : type === "hl7"
          ? "hl7Messaging"
          : "emailService"]: { ...form[
            type === "dicom"
              ? "dicomReceiver"
              : type === "lis"
              ? "lisConnector"
              : type === "enrichment"
              ? "enrichmentService"
              : type === "export"
              ? "exportService"
              : type === "hl7"
              ? "hl7Messaging"
              : "emailService"
          ] },
      }));

      setEditMode((prev) => ({ ...prev, [type]: false }));
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Update failed. Try again.");
    }
  };

  const renderInput = (
    section: keyof typeof form,
    field: string,
    label: string,
    disabled: boolean
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Input
        value={(form as any)[section][field] ?? ""}
        onChange={(e) => handleChange(section, field, e.target.value)}
        disabled={disabled}
        className={disabled ? "bg-gray-50 text-gray-600" : ""}
      />
    </div>
  );

  const renderDynamicCard = (
    title: string,
    icon: JSX.Element,
    keyName: keyof typeof editMode,
    body: JSX.Element
  ) => (
    <Card className="border border-gray-200 shadow-sm relative">
      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center gap-2 text-lg">
              {icon} {title}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="grid md:grid-cols-2 gap-6 relative pb-16">
            {body}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {editMode[keyName] ? (
                <>
                  <Button size="sm" onClick={() => handleSave(keyName)} disabled={loading}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(keyName, false)}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => handleEdit(keyName, true)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );

  // Email array UI helpers
  const addEmail = (which: "emailTo" | "emailIbexTo") => {
    const arr = [...(form.emailService[which] || [])];
    arr.push("");
    handleChange("emailService", which, arr);
  };
  const updateEmailAt = (which: "emailTo" | "emailIbexTo", idx: number, val: string) => {
    const arr = [...(form.emailService[which] || [])];
    arr[idx] = val;
    handleChange("emailService", which, arr);
  };
  const removeEmailAt = (which: "emailTo" | "emailIbexTo", idx: number) => {
    const arr = [...(form.emailService[which] || [])];
    arr.splice(idx, 1);
    handleChange("emailService", which, arr);
  };

  return (
    <div className="space-y-6 p-6 bg-white">
      {/* DICOM Receiver */}
      {renderDynamicCard(
        "DICOM Receiver",
        <Network className="h-5 w-5 text-blue-600" />,
        "dicom",
        <>
          {renderInput("dicomReceiver", "aet", "AET", !editMode.dicom)}
          {renderInput("dicomReceiver", "ipAddress", "IP Address", !editMode.dicom)}
          {renderInput("dicomReceiver", "port", "Port", !editMode.dicom)}
          {renderInput("dicomReceiver", "networkDrive", "Network Drive", !editMode.dicom)}
        </>
      )}

      {/* LIS Connector */}
      {renderDynamicCard(
        "LIS Connector",
        <Database className="h-5 w-5 text-blue-600" />,
        "lis",
        <>
          {renderInput("lisConnector", "applicationName", "Application Name", !editMode.lis)}
          {renderInput("lisConnector", "ipAddress", "IP Address", !editMode.lis)}
          {renderInput("lisConnector", "receivingPort", "Receiving Port", !editMode.lis)}
          {renderInput("lisConnector", "incomingPort", "Incoming Port", !editMode.lis)}
          {renderInput("lisConnector", "receivingFacility", "Receiving Facility", !editMode.lis)}
          {renderInput("lisConnector", "receivingAppName", "Receiving App Name", !editMode.lis)}
          {renderInput("lisConnector", "sendingFacility", "Sending Facility", !editMode.lis)}
        </>
      )}

      {/* Enrichment Service */}
      {renderDynamicCard(
        "Enrichment Service",
        <Activity className="h-5 w-5 text-blue-600" />,
        "enrichment",
        <>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Message Type</Label>
            <select
              value={form.enrichmentService.messageType}
              onChange={(e) => handleChange("enrichmentService", "messageType", e.target.value)}
              disabled={!editMode.enrichment}
              className={`w-full border rounded p-2 ${!editMode.enrichment ? "bg-gray-50 text-gray-600" : ""}`}
            >
              
             
       <option value="OUL">Powerpath (OUL)</option>
              <option value="QBP">DPIA Profile (OML)</option>
             
            </select>
          </div>
        </>
      )}

      {/* Export Service */}
      {renderDynamicCard(
        "Export Service",
        <Cloud className="h-5 w-5 text-blue-600" />,
        "export",
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Synapse Enabled</Label>
              <Switch
                checked={!!form.exportService.synapseEnabled}
                onCheckedChange={(v: boolean) => handleChange("exportService", "synapseEnabled", v)}
                disabled={!editMode.export}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">VisioPharm Enabled</Label>
              <Switch
                checked={!!form.exportService.visioPharmEnabled}
                onCheckedChange={(v: boolean) => handleChange("exportService", "visioPharmEnabled", v)}
                disabled={!editMode.export}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">IBEX Enabled</Label>
              <Switch
                checked={!!form.exportService.ibexEnabled}
                onCheckedChange={(v: boolean) => handleChange("exportService", "ibexEnabled", v)}
                disabled={!editMode.export}
              />
            </div>
          </div>

          {renderInput("exportService", "synapseServerFolder", "Synapse Server Folder", !editMode.export)}
        </>
      )}

      {/* HL7 Messaging */}
      {renderDynamicCard(
        "HL7 Messaging",
        <MessageSquare className="h-5 w-5 text-blue-600" />,
        "hl7",
        <>
          {renderInput("hl7Messaging", "applicationName", "Application Name", !editMode.hl7)}
          {renderInput("hl7Messaging", "ipAddress", "IP Address", !editMode.hl7)}
          {renderInput("hl7Messaging", "receivingPort", "Receiving Port", !editMode.hl7)}
          {renderInput("hl7Messaging", "outputPort", "Output Port", !editMode.hl7)}
          {renderInput("hl7Messaging", "receivingFacility", "Receiving Facility", !editMode.hl7)}
          {renderInput("hl7Messaging", "receivingAppName", "Receiving App Name", !editMode.hl7)}
          {renderInput("hl7Messaging", "sendingFacility", "Sending Facility", !editMode.hl7)}
        </>
      )}

      {/* Email Service */}
      {renderDynamicCard(
        "Email Service",
        <Mail className="h-5 w-5 text-blue-600" />,
        "email",
        <>
          {renderInput("emailService", "emailFrom", "Email From", !editMode.email)}

          <div className="col-span-2">
            <Label className="text-sm font-medium text-gray-700">Registered Email Ids for Enrichment Service Notifications</Label>
            <div className="space-y-2 mt-2">
              {(form.emailService.emailTo || []).map((em: string, idx: number) => (
                <div key={`to-${idx}`} className="flex gap-2">
                  <Input
                    value={em}
                    onChange={(e) => updateEmailAt("emailTo", idx, e.target.value)}
                    disabled={!editMode.email}
                  />
                  {editMode.email ? (
                    <Button size="sm" variant="outline" onClick={() => removeEmailAt("emailTo", idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              ))}
              {editMode.email ? (
                <Button size="sm" onClick={() => addEmail("emailTo")}>
                  <Plus className="h-4 w-4 mr-1" /> Add Email
                </Button>
              ) : null}
            </div>
          </div>

          <div className="col-span-2">
            <Label className="text-sm font-medium text-gray-700">Email for IBEX Slide Analysis Event </Label>
            <div className="space-y-2 mt-2">
              {(form.emailService.emailIbexTo || []).map((em: string, idx: number) => (
                <div key={`ibex-${idx}`} className="flex gap-2">
                  <Input
                    value={em}
                    onChange={(e) => updateEmailAt("emailIbexTo", idx, e.target.value)}
                    disabled={!editMode.email}
                  />
                  {editMode.email ? (
                    <Button size="sm" variant="outline" onClick={() => removeEmailAt("emailIbexTo", idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              ))}
              {editMode.email ? (
                <Button size="sm" onClick={() => addEmail("emailIbexTo")}>
                  <Plus className="h-4 w-4 mr-1" /> Add Email
                </Button>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}