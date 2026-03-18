import React, { useEffect, useState, useCallback } from "react";
import {
  Network, Database, Activity, MessageSquare, Cloud,
  Edit, Save, X, Mail, Plus, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Switch } from "../../../ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../ui/collapsible";
import { useSelector } from "react-redux";
import { fetchEhTool, patchEhTool } from "../../../../store/slices/ehToolsSlice";
import { toast } from "sonner";
import { useAppDispatch } from "../../../../hooks";
import { ENRICHMENT_TOOLS } from "../../../../utils/constants";
import {
  IP_ALLOWED_PATTERN,
  PORT_ALLOWED_PATTERN,
  isValidIP,
  isValidPort,
  isValidEmail,
  IP_ERROR_MESSAGE,
  PORT_ERROR_MESSAGE,
  EMAIL_ERROR_MESSAGE,
  sanitizeByPattern,
} from "../../../../utils/validation.constants";

// ─── IP / Port field maps ─────────────────────────────────────────────────────

const IP_FIELDS: Record<string, string[]> = {
  dicomReceiver: ["ipAddress"],
  lisConnector:  ["ipAddress"],
  hl7Messaging:  ["ipAddress"],
};

const PORT_FIELDS: Record<string, string[]> = {
  dicomReceiver: ["port"],
  lisConnector:  ["receivingPort", "incomingPort"],
  hl7Messaging:  ["receivingPort", "outputPort"],
};

// ─── Component ────────────────────────────────────────────────────────────────

export function EnrichmentToolConfig() {
  const dispatch = useAppDispatch();
  const { dicomReceiver, lisConnector, enrichmentService, exportService, hl7Connector, emailService, loading } =
    useSelector((s: any) => s.ehTools || {});

  const [initializedSections, setInitializedSections] = useState({
    dicom: false, lis: false, enrichment: false, export: false, hl7: false, email: false,
  });

  const [editMode, setEditMode] = useState<Record<string, boolean>>({
    dicom: false, lis: false, enrichment: false, export: false, hl7: false, email: false,
  });

  // field-level errors: key = "section.field"
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<any>({
    dicomReceiver:    { aet: "", ipAddress: "", port: "", networkDrive: "" },
    lisConnector:     { applicationName: "", ipAddress: "", receivingPort: "", incomingPort: "", receivingFacility: "", receivingAppName: "", sendingFacility: "" },
    enrichmentService:{ messageType: "" },
    exportService:    { synapseServerFolder: "", synapseEnabled: false, visioPharmEnabled: false, ibexEnabled: false },
    hl7Messaging:     { applicationName: "", ipAddress: "", receivingPort: "", outputPort: "", receivingFacility: "", receivingAppName: "", sendingFacility: "" },
    emailService:     { emailFrom: "", emailTo: [] as string[], emailIbexTo: [] as string[] },
  });

  const [originalForm, setOriginalForm] = useState(form);

  // email add-input state
  const [emailToInput,       setEmailToInput]       = useState("");
  const [emailToInputError,  setEmailToInputError]  = useState("");
  const [emailIbexInput,     setEmailIbexInput]     = useState("");
  const [emailIbexInputError,setEmailIbexInputError]= useState("");

  // ── Fetches ───────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.DICOM_RECEIVER }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.LIS_CONNECTOR }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.ENRICHMENT_SERVICE }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.EXPORT_SERVICE }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.HL7_CONNECTOR }));
    dispatch(fetchEhTool({ toolKey: ENRICHMENT_TOOLS.EMAIL_SERVICE }));
  }, [dispatch]);

  // ── Sync helpers ──────────────────────────────────────────────────────────
  const syncSection = useCallback((sectionKey: string, formKey: string, newData: any) => {
    setForm((p: any) => ({ ...p, [formKey]: newData }));
    setOriginalForm((p: any) => ({ ...p, [formKey]: newData }));
    setInitializedSections((p) => ({ ...p, [sectionKey]: true }));
  }, []);

  useEffect(() => {
    if (!dicomReceiver || Object.keys(dicomReceiver).length === 0 || initializedSections.dicom) return;
    syncSection("dicom", "dicomReceiver", {
      aet: dicomReceiver.aet || dicomReceiver["storescp.aetitle"] || "",
      port: dicomReceiver.port || dicomReceiver["server.port"] || "",
      ipAddress: dicomReceiver.ipAddress || dicomReceiver["server.ipAddress"] || "",
      networkDrive: dicomReceiver["network-drive"] || dicomReceiver["storescp.storage.path"] || "",
    });
  }, [dicomReceiver]);

  useEffect(() => {
    if (!lisConnector || initializedSections.lis) return;
    syncSection("lis", "lisConnector", {
      applicationName: lisConnector.name || lisConnector.appName || "",
      ipAddress: lisConnector["lis.ipAddress"] || lisConnector.ipAddress || "",
      receivingPort: lisConnector["lis.port"]?.toString() || lisConnector.port?.toString() || "",
      incomingPort: lisConnector["incoming-port"]?.toString() || lisConnector.incomingPort?.toString() || "",
      receivingFacility: lisConnector.receivingFacility || "",
      receivingAppName: lisConnector.receivingAppName || "",
      sendingFacility: lisConnector.sendingFacility || "",
    });
  }, [lisConnector]);

  useEffect(() => {
    if (!enrichmentService || initializedSections.enrichment) return;
    syncSection("enrichment", "enrichmentService", { messageType: enrichmentService.messageType || "OUL" });
  }, [enrichmentService]);

  useEffect(() => {
    if (!exportService || initializedSections.export) return;
    const bool = (v: any) => (typeof v === "boolean" ? v : v === "true");
    syncSection("export", "exportService", {
      synapseServerFolder: exportService.synapseServerFolder || "",
      synapseEnabled:    bool(exportService.synapseEnabled),
      visioPharmEnabled: bool(exportService.visioPharmEnabled),
      ibexEnabled:       bool(exportService.ibexEnabled),
    });
  }, [exportService]);

  useEffect(() => {
    if (!hl7Connector || initializedSections.hl7) return;
    const raw = hl7Connector?.data || hl7Connector?.payload?.data || hl7Connector?.payload || hl7Connector;
    if (!raw || Object.keys(raw).length === 0) return;
    syncSection("hl7", "hl7Messaging", {
      applicationName: raw.appName || raw.name || "",
      ipAddress: raw.ipAddress || "",
      receivingPort: raw["receive-port"]?.toString() || raw.receivePort?.toString() || "",
      outputPort: raw.outputPort?.toString() || "",
      receivingFacility: raw.receivingFacility || "",
      receivingAppName: raw.receivingAppName || raw.receivingApp || "",
      sendingFacility: raw.sendingFacility || "",
    });
  }, [hl7Connector]);

  useEffect(() => {
    if (!emailService || Object.keys(emailService).length === 0 || initializedSections.email) return;
    const toArr = (v: any) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
      return [];
    };
    syncSection("email", "emailService", {
      emailFrom: Array.isArray(emailService.emailFrom) ? emailService.emailFrom[0] || "" : emailService.emailFrom || "",
      emailTo:     toArr(emailService.emailTo),
      emailIbexTo: toArr(emailService.emailIbexTo),
    });
  }, [emailService]);

  // ── Field change with sanitisation ───────────────────────────────────────
  const handleChange = useCallback((section: string, field: string, value: any) => {
    const isIP   = IP_FIELDS[section]?.includes(field);
    const isPort = PORT_FIELDS[section]?.includes(field);

    let sanitized = value;
    if (typeof value === "string") {
      if (isIP)        sanitized = sanitizeByPattern(value, IP_ALLOWED_PATTERN);
      else if (isPort) sanitized = sanitizeByPattern(value, PORT_ALLOWED_PATTERN);
    }

    setForm((prev: any) => ({ ...prev, [section]: { ...prev[section], [field]: sanitized } }));

    const key = `${section}.${field}`;
    if (isIP && sanitized && !isValidIP(sanitized)) {
      setFieldErrors((p) => ({ ...p, [key]: IP_ERROR_MESSAGE }));
    } else if (isPort && sanitized && !isValidPort(sanitized)) {
      setFieldErrors((p) => ({ ...p, [key]: PORT_ERROR_MESSAGE }));
    } else {
      setFieldErrors((p) => { const n = { ...p }; delete n[key]; return n; });
    }
  }, []);

  // ── Email helpers ─────────────────────────────────────────────────────────
  const addEmail = useCallback((
    which: "emailTo" | "emailIbexTo",
    inputVal: string,
    setInput: (v: string) => void,
    setErr: (v: string) => void
  ) => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) { setErr(EMAIL_ERROR_MESSAGE); return; }
    const current: string[] = form.emailService[which] || [];
    if (current.includes(trimmed)) { setErr("This email is already added"); return; }
    handleChange("emailService", which, [...current, trimmed]);
    setInput(""); setErr("");
  }, [form.emailService, handleChange]);

  const removeEmail = useCallback((which: "emailTo" | "emailIbexTo", idx: number) => {
    const arr = [...(form.emailService[which] || [])];
    arr.splice(idx, 1);
    handleChange("emailService", which, arr);
  }, [form.emailService, handleChange]);

  // ── Validate section before save ──────────────────────────────────────────
  const validateSection = (type: string): boolean => {
    const errors: Record<string, string> = {};

    const checkSection = (section: string, data: any) => {
      (IP_FIELDS[section] || []).forEach((f) => {
        if (data[f] && !isValidIP(data[f])) errors[`${section}.${f}`] = IP_ERROR_MESSAGE;
      });
      (PORT_FIELDS[section] || []).forEach((f) => {
        if (data[f] && !isValidPort(data[f])) errors[`${section}.${f}`] = PORT_ERROR_MESSAGE;
      });
    };

    if (type === "dicom")   checkSection("dicomReceiver", form.dicomReceiver);
    if (type === "lis")     checkSection("lisConnector",  form.lisConnector);
    if (type === "hl7")     checkSection("hl7Messaging",  form.hl7Messaging);

    if (type === "email") {
      if (form.emailService.emailFrom && !isValidEmail(form.emailService.emailFrom))
        errors["emailService.emailFrom"] = EMAIL_ERROR_MESSAGE;
      (form.emailService.emailTo || []).forEach((e: string, i: number) => {
        if (!isValidEmail(e)) errors[`emailService.emailTo.${i}`] = `Invalid: ${e}`;
      });
      (form.emailService.emailIbexTo || []).forEach((e: string, i: number) => {
        if (!isValidEmail(e)) errors[`emailService.emailIbexTo.${i}`] = `Invalid: ${e}`;
      });
    }

    setFieldErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  // ── Edit / Cancel ─────────────────────────────────────────────────────────
  const handleEdit = (key: string, enable: boolean) => {
    setEditMode((prev) => ({ ...prev, [key]: enable }));
    if (!enable) {
      setForm(originalForm);
      setFieldErrors({});
      setEmailToInput(""); setEmailToInputError("");
      setEmailIbexInput(""); setEmailIbexInputError("");
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const getChangedFields = (current: any, original: any) => {
    const diff: any = {};
    Object.keys(current).forEach((k) => {
      const cur = current[k]; const orig = original?.[k];
      if (Array.isArray(cur) || Array.isArray(orig)) {
        const cs = Array.isArray(cur) ? cur.join(",") : String(cur || "");
        const os = Array.isArray(orig) ? orig.join(",") : String(orig || "");
        if (cs.trim() !== os.trim()) diff[k] = cur;
      } else {
        if (String(cur || "").trim() !== String(orig || "").trim()) diff[k] = cur;
      }
    });
    return diff;
  };

  const SECTION_FORM_KEY: Record<string, string> = {
    dicom: "dicomReceiver", lis: "lisConnector", enrichment: "enrichmentService",
    export: "exportService", hl7: "hl7Messaging", email: "emailService",
  };

  const handleSave = async (type: string) => {
    if (!validateSection(type)) { toast.error("Please fix validation errors before saving"); return; }

    let toolKey = ""; let body: any = {}; let sectionName = "";

    switch (type) {
      case "dicom": {
        toolKey = "eh-dicom-receiver"; sectionName = "DICOM Receiver";
        const d = getChangedFields(form.dicomReceiver, originalForm.dicomReceiver);
        if (!Object.keys(d).length) { toast.info("No changes"); setEditMode((p) => ({ ...p, [type]: false })); return; }
        body = { ...(d.aet && { aet: d.aet }), ...(d.port && { port: d.port }), ...(d.ipAddress && { ipAddress: d.ipAddress }), ...(d.networkDrive && { "network-drive": d.networkDrive }) };
        break;
      }
      case "lis": {
        toolKey = "eh-lis-connector"; sectionName = "LIS Connector";
        const d = getChangedFields(form.lisConnector, originalForm.lisConnector);
        if (!Object.keys(d).length) { toast.info("No changes"); setEditMode((p) => ({ ...p, [type]: false })); return; }
        body = {
          ...(d.applicationName && { appName: d.applicationName }),
          ...(d.ipAddress && { ipAddress: d.ipAddress }),
          ...(d.receivingPort && { port: parseInt(d.receivingPort) }),
          ...(d.incomingPort && { "incoming-port": parseInt(d.incomingPort) }),
          ...(d.receivingFacility !== undefined && { receivingFacility: d.receivingFacility }),
          ...(d.receivingAppName !== undefined && { receivingAppName: d.receivingAppName }),
          ...(d.sendingFacility !== undefined && { sendingFacility: d.sendingFacility }),
        };
        break;
      }
      case "enrichment": {
        toolKey = "eh-dicom-enricher"; sectionName = "Enrichment Service";
        body = getChangedFields(form.enrichmentService, originalForm.enrichmentService);
        if (!Object.keys(body).length) { toast.info("No changes"); setEditMode((p) => ({ ...p, [type]: false })); return; }
        break;
      }
      case "export": {
        toolKey = "eh-export-service"; sectionName = "Export Service";
        const d = getChangedFields(form.exportService, originalForm.exportService);
        if (!Object.keys(d).length) { toast.info("No changes"); setEditMode((p) => ({ ...p, [type]: false })); return; }
        body = {
          ...(d.synapseServerFolder && { synapseServerFolder: d.synapseServerFolder }),
          ...(d.synapseEnabled    !== undefined && { synapseEnabled:    !!d.synapseEnabled }),
          ...(d.visioPharmEnabled !== undefined && { visioPharmEnabled: !!d.visioPharmEnabled }),
          ...(d.ibexEnabled       !== undefined && { ibexEnabled:       !!d.ibexEnabled }),
        };
        break;
      }
      case "hl7": {
        toolKey = "eh-hl7-connector"; sectionName = "HL7 Messaging";
        const d = getChangedFields(form.hl7Messaging, originalForm.hl7Messaging);
        if (!Object.keys(d).length) { toast.info("No changes"); setEditMode((p) => ({ ...p, [type]: false })); return; }
        body = {
          ...(d.applicationName && { appName: d.applicationName }),
          ...(d.ipAddress && { ipAddress: d.ipAddress }),
          ...(d.receivingPort && { "receive-port": parseInt(d.receivingPort) }),
          ...(d.outputPort && { outputPort: parseInt(d.outputPort) }),
          ...(d.receivingFacility !== undefined && { receivingFacility: d.receivingFacility }),
          ...(d.receivingAppName !== undefined && { receivingAppName: d.receivingAppName }),
          ...(d.sendingFacility !== undefined && { sendingFacility: d.sendingFacility }),
        };
        break;
      }
      case "email": {
        toolKey = "eh-email-service"; sectionName = "Email Service";
        const d = getChangedFields(form.emailService, originalForm.emailService);
        if (!Object.keys(d).length) { toast.info("No changes"); setEditMode((p) => ({ ...p, [type]: false })); return; }
        body = {
          ...(d.emailFrom !== undefined && { emailFrom: [form.emailService.emailFrom] }),
          ...(d.emailTo !== undefined && { emailTo: (form.emailService.emailTo || []).filter((e: string) => e.trim()) }),
          ...(d.emailIbexTo !== undefined && { emailIbexTo: (form.emailService.emailIbexTo || []).filter((e: string) => e.trim()) }),
        };
        break;
      }
    }

    try {
      await dispatch(patchEhTool({ toolKey, body })).unwrap();
      toast.success(`${sectionName} updated successfully`);
      const fk = SECTION_FORM_KEY[type];
      setOriginalForm((prev: any) => ({ ...prev, [fk]: { ...form[fk] } }));
      setEditMode((prev) => ({ ...prev, [type]: false }));
      setFieldErrors({});
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Update failed. Try again.");
    }
  };

  // ── renderInput ───────────────────────────────────────────────────────────
  const renderInput = (section: string, field: string, label: string, disabled: boolean) => {
    const key   = `${section}.${field}`;
    const error = fieldErrors[key];
    const isIP   = IP_FIELDS[section]?.includes(field);
    const isPort = PORT_FIELDS[section]?.includes(field);

    return (
      <div className="space-y-2">
        <Label htmlFor={`${section}-${field}`} className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        <Input
          id={`${section}-${field}`}
          value={(form as any)[section][field] ?? ""}
          onChange={(e) => handleChange(section, field, e.target.value)}
          onKeyDown={(e) => {
            if (disabled) return;
            const isCtrl = e.ctrlKey || e.metaKey || e.key.length > 1;
            if (isCtrl) return;
            if (isIP   && !IP_ALLOWED_PATTERN.test(e.key))   e.preventDefault();
            if (isPort && !PORT_ALLOWED_PATTERN.test(e.key)) e.preventDefault();
          }}
          onPaste={(e) => {
            if (disabled || (!isIP && !isPort)) return;
            const pasted    = e.clipboardData.getData("text");
            const pattern   = isIP ? IP_ALLOWED_PATTERN : PORT_ALLOWED_PATTERN;
            const sanitized = sanitizeByPattern(pasted, pattern);
            if (sanitized !== pasted) {
              e.preventDefault();
              const inp   = e.currentTarget;
              const start = inp.selectionStart ?? 0;
              const end   = inp.selectionEnd   ?? 0;
              const cur   = (form as any)[section][field] ?? "";
              handleChange(section, field, cur.slice(0, start) + sanitized + cur.slice(end));
            }
          }}
          disabled={disabled}
          className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${
            error ? "border-red-500 focus:border-red-500" : ""
          } ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : ""}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${section}-${field}-error` : undefined}
        />
        {error && (
          <p id={`${section}-${field}-error`} className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {error}
          </p>
        )}
        {isIP && !disabled && !error && (
          <p className="text-xs text-gray-500">IPv4 (e.g. 192.168.1.1) or IPv6 (e.g. 2001:db8::1)</p>
        )}
      </div>
    );
  };

  // ── renderEmailList ───────────────────────────────────────────────────────
  const renderEmailList = (
    which: "emailTo" | "emailIbexTo",
    label: string,
    inputVal: string,
    setInput: (v: string) => void,
    inputErr: string,
    setErr: (v: string) => void
  ) => {
    const emails: string[] = form.emailService[which] || [];
    const inEdit = editMode.email;

    return (
      <div className="col-span-2 space-y-2">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        {emails.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-md bg-gray-50 min-h-[40px]">
            {emails.map((em, idx) => {
              const invalid = !isValidEmail(em);
              return (
                <span key={idx}
                  title={invalid ? "Invalid email — remove and re-add" : em}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm border ${
                    invalid ? "bg-red-50 border-red-400 text-red-700" : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  {invalid && <AlertCircle className="h-3 w-3 text-red-500 shrink-0" />}
                  {em}
                  {(inEdit || invalid) && (
                    <button type="button" onClick={() => removeEmail(which, idx)}
                      className="text-gray-400 hover:text-red-500 ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}
        {emails.filter((e) => !isValidEmail(e)).length > 0 && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {emails.filter((e) => !isValidEmail(e)).length} invalid email(s) — remove before saving
          </p>
        )}
        {inEdit && (
          <div className="space-y-1">
            <div className="flex gap-2">
              <Input
                type="email"
                value={inputVal}
                placeholder="Enter email and press Enter or click Add"
                onChange={(e) => { setInput(e.target.value); if (inputErr) setErr(""); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addEmail(which, inputVal, setInput, setErr);
                  }
                }}
                className={`flex-1 h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${
                  inputErr ? "border-red-500 focus:border-red-500" : ""
                }`}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 h-11 px-4 border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={() => addEmail(which, inputVal, setInput, setErr)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {inputErr && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {inputErr}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Press <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">Enter</kbd> or{" "}
              <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">,</kbd> to add
            </p>
          </div>
        )}
        {!inEdit && emails.length === 0 && (
          <p className="text-sm text-gray-400 italic">No emails configured</p>
        )}
      </div>
    );
  };

  // ── renderDynamicCard ─────────────────────────────────────────────────────
  const renderDynamicCard = (title: string, icon: JSX.Element, keyName: string, body: JSX.Element) => (
    <Card className="border border-gray-200 shadow-sm">
      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              {icon} {title}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{body}</div>
            <div className="flex justify-end gap-2 pt-6 mt-2 border-t border-gray-200">
              {editMode[keyName] ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleSave(keyName)}
                    disabled={loading}
                    className="h-9 px-4 bg-[#007BFF] hover:bg-[#0069d9] text-white border-0"
                  >
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(keyName, false)}
                    className="h-9 px-4 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(keyName, true)}
                  className="h-9 px-4 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6 bg-white">

      {renderDynamicCard("DICOM Receiver", <Network className="h-5 w-5 text-[#007BFF]" />, "dicom", <>
        {renderInput("dicomReceiver", "aet",          "AET",           !editMode.dicom)}
        {renderInput("dicomReceiver", "ipAddress",    "IP Address",    !editMode.dicom)}
        {renderInput("dicomReceiver", "port",         "Port",          !editMode.dicom)}
        {renderInput("dicomReceiver", "networkDrive", "Network Drive", !editMode.dicom)}
      </>)}

      {renderDynamicCard("LIS Connector", <Database className="h-5 w-5 text-[#007BFF]" />, "lis", <>
        {renderInput("lisConnector", "applicationName",  "Application Name",   !editMode.lis)}
        {renderInput("lisConnector", "ipAddress",        "IP Address",         !editMode.lis)}
        {renderInput("lisConnector", "receivingPort",    "Sending To Port",    !editMode.lis)}
        {renderInput("lisConnector", "incomingPort",     "LIS Connector Port", !editMode.lis)}
        {renderInput("lisConnector", "receivingFacility","Receiving Facility", !editMode.lis)}
        {renderInput("lisConnector", "receivingAppName", "Receiving App Name", !editMode.lis)}
        {renderInput("lisConnector", "sendingFacility",  "Sending Facility",   !editMode.lis)}
      </>)}

      {renderDynamicCard("Enrichment Service", <Activity className="h-5 w-5 text-[#007BFF]" />, "enrichment", <>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Message Type</Label>
          <select
            value={form.enrichmentService.messageType}
            onChange={(e) => handleChange("enrichmentService", "messageType", e.target.value)}
            disabled={!editMode.enrichment}
            className={`h-11 w-full rounded-md border border-gray-200 bg-[#f8faff] px-3 text-sm focus:border-[#007BFF] focus:outline-none focus:ring-2 focus:ring-[#007BFF]/20 ${
              !editMode.enrichment ? "opacity-60 cursor-not-allowed bg-gray-100" : ""
            }`}
          >
            <option value="OUL">Powerpath (OUL)</option>
            <option value="QBP">DPIA Profile (OML)</option>
          </select>
        </div>
      </>)}

      {renderDynamicCard("Export Service", <Cloud className="h-5 w-5 text-[#007BFF]" />, "export", <>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Integrations</Label>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {[
              ["synapseEnabled",    "Synapse Enabled"],
              ["visioPharmEnabled", "VisioPharm Enabled"],
              ["ibexEnabled",       "IBEX Enabled"],
            ].map(([field, label], idx, arr) => (
              <div
                key={field}
                className={`flex items-center justify-between px-4 py-3 bg-white ${
                  idx < arr.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <Label className="text-sm font-medium text-gray-700">{label}</Label>
                <Switch
                  checked={!!form.exportService[field]}
                  onCheckedChange={(v: boolean) => handleChange("exportService", field, v)}
                  disabled={!editMode.export}
                />
              </div>
            ))}
          </div>
        </div>
        {renderInput("exportService", "synapseServerFolder", "Synapse Server Folder", !editMode.export)}
      </>)}

      {renderDynamicCard("HL7 Messaging", <MessageSquare className="h-5 w-5 text-[#007BFF]" />, "hl7", <>
        {renderInput("hl7Messaging", "applicationName",  "Application Name",              !editMode.hl7)}
        {renderInput("hl7Messaging", "ipAddress",        "IP Address (HL7 Provider)",     !editMode.hl7)}
        {renderInput("hl7Messaging", "receivingPort",    "Receiving Port (HL7 Provider)", !editMode.hl7)}
        {renderInput("hl7Messaging", "outputPort",       "Receiving App Port",            !editMode.hl7)}
        {renderInput("hl7Messaging", "receivingFacility","Receiving Facility",            !editMode.hl7)}
        {renderInput("hl7Messaging", "receivingAppName", "Receiving App Name",            !editMode.hl7)}
        {renderInput("hl7Messaging", "sendingFacility",  "Sending Facility",              !editMode.hl7)}
      </>)}

      {renderDynamicCard("Email Service", <Mail className="h-5 w-5 text-[#007BFF]" />, "email", <>
        <div className="space-y-2">
          <Label htmlFor="emailFrom" className="text-sm font-medium text-gray-700">Email From</Label>
          <Input
            id="emailFrom"
            type="email"
            value={form.emailService.emailFrom ?? ""}
            disabled={!editMode.email}
            onChange={(e) => handleChange("emailService", "emailFrom", e.target.value)}
            placeholder="sender@example.com"
            className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${
              fieldErrors["emailService.emailFrom"] ? "border-red-500 focus:border-red-500" : ""
            } ${!editMode.email ? "opacity-60 cursor-not-allowed bg-gray-100" : ""}`}
          />
          {form.emailService.emailFrom && !isValidEmail(form.emailService.emailFrom) && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Invalid email format
            </p>
          )}
        </div>
        <div /> {/* grid spacer */}
        {renderEmailList("emailTo",     "Registered Email Ids for Enrichment Service Notifications",
          emailToInput,   setEmailToInput,   emailToInputError,   setEmailToInputError)}
        {renderEmailList("emailIbexTo", "Email for IBEX Slide Analysis Event",
          emailIbexInput, setEmailIbexInput, emailIbexInputError, setEmailIbexInputError)}
      </>)}

    </div>
  );
}