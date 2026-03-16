import React, { useEffect, useState, useCallback } from "react";
import { Cloud, Edit, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { toast } from "sonner";
import { useAppDispatch } from "../../../hooks";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../api/services/apiClient";
import {
  IP_ALLOWED_PATTERN,
  PORT_ALLOWED_PATTERN,
  isValidIP,
  isValidPort,
  IP_ERROR_MESSAGE,
  PORT_ERROR_MESSAGE,
  sanitizeByPattern,
  type FieldRule,
} from "../../../utils/validation.constants";

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchSynapse = createAsyncThunk<any, void, { rejectValue: string }>(
  "synapse/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/api/enrichment/tools/synapse");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const patchSynapse = createAsyncThunk<any, { body: any }, { rejectValue: string }>(
  "synapse/patch",
  async ({ body }, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch("/api/enrichment/tools/synapse", body);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ─── Field Rules ──────────────────────────────────────────────────────────────

const FIELD_RULES: Record<string, FieldRule> = {
  applicationName: {
    label: "Name of Application",
    allowedPattern: /^[a-zA-Z0-9 _-]*$/,
    validPattern: /^[a-zA-Z0-9 _-]{1,100}$/,
    errorMessage: "Only letters, numbers, spaces, hyphens and underscores are allowed (max 100 chars)",
    required: true,
  },
  ipAddress: {
    label: "IP Address",
    allowedPattern: IP_ALLOWED_PATTERN,
    validate: isValidIP,
    errorMessage: IP_ERROR_MESSAGE,
    required: true,
  },
  receivingPort: {
    label: "Synapse Port",
    allowedPattern: PORT_ALLOWED_PATTERN,
    validate: isValidPort,
    errorMessage: PORT_ERROR_MESSAGE,
    required: true,
  },
  networkFolder: {
    label: "Network Folder Location",
    allowedPattern: /^[a-zA-Z0-9 /\\:_\-.]*$/,
    validPattern: /^[a-zA-Z0-9 /\\:_\-.]{1,260}$/,
    errorMessage: "Only letters, digits, spaces and path characters (/ \\ : _ - .) are allowed (max 260 chars)",
    required: true,
  },
};

type FormState = {
  applicationName: string;
  ipAddress: string;
  receivingPort: string;
  networkFolder: string;
  synapsePluginUrl: string;
  synapseVmDetails: string;
};

const INITIAL_FORM: FormState = {
  applicationName: "",
  ipAddress: "",
  receivingPort: "",
  networkFolder: "",
  synapsePluginUrl: "",
  synapseVmDetails: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SynapseConfig() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [originalForm, setOriginalForm] = useState<FormState>(INITIAL_FORM);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Fetch on every mount — fixes blank name after navigation
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await dispatch(fetchSynapse()).unwrap();
        if (result && Object.keys(result).length > 0) {
          const newData: FormState = {
            applicationName: result.receivingAppName || "",
            ipAddress: result.ipAddress || "",
            receivingPort: result["receive-port"]?.toString() || "",
            networkFolder: result.synapseServerFolder || "",
            synapsePluginUrl: result.synapsePluginUrl || "",
            synapseVmDetails: result.synapseVmDetails || "",
          };
          setForm(newData);
          setOriginalForm(newData);
        }
      } catch (error) {
        console.error("Failed to fetch Synapse config:", error);
        toast.error("Failed to load Synapse configuration");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validateField = useCallback((field: keyof FormState, value: string): string => {
    const rule = FIELD_RULES[field];
    if (!rule) return "";
    if (rule.required && !value.trim()) return `${rule.label} is required`;
    if (value) {
      const invalid = rule.validate
        ? !rule.validate(value)
        : rule.validPattern && !rule.validPattern.test(value);
      if (invalid) return rule.errorMessage;
    }
    return "";
  }, []);

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    let valid = true;
    (Object.keys(FIELD_RULES) as Array<keyof FormState>).forEach((field) => {
      const err = validateField(field, form[field]);
      if (err) { newErrors[field] = err; valid = false; }
    });
    setErrors(newErrors);
    setTouched(Object.keys(FIELD_RULES).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    return valid;
  }, [form, validateField]);

  // ── Input handling ────────────────────────────────────────────────────────
  const handleChange = useCallback((field: keyof FormState, value: string) => {
    const rule = FIELD_RULES[field];
    const sanitized = rule ? sanitizeByPattern(value, rule.allowedPattern) : value;
    setForm((prev) => ({ ...prev, [field]: sanitized }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, sanitized) }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  }, [form, validateField]);

  const handlePaste = useCallback((field: keyof FormState, e: React.ClipboardEvent<HTMLInputElement>) => {
    const rule = FIELD_RULES[field];
    if (!rule) return;
    const pasted = e.clipboardData.getData("text");
    const sanitized = sanitizeByPattern(pasted, rule.allowedPattern);
    if (sanitized !== pasted) {
      e.preventDefault();
      const input = e.currentTarget;
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      const current = form[field];
      handleChange(field, current.slice(0, start) + sanitized + current.slice(end));
    }
  }, [form, handleChange]);

  // ── Edit / Cancel ─────────────────────────────────────────────────────────
  const handleEdit = (enable: boolean) => {
    setEditMode(enable);
    if (!enable) { setForm(originalForm); setErrors({}); setTouched({}); }
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const getChangedFields = (current: FormState, original: FormState): Partial<FormState> => {
    const diff: Partial<FormState> = {};
    (Object.keys(current) as Array<keyof FormState>).forEach((k) => {
      if ((current[k] || "").toString().trim() !== (original[k] || "").toString().trim())
        (diff as any)[k] = current[k];
    });
    return diff;
  };

  const handleSave = async () => {
    if (!validateAll()) { toast.error("Please fix the validation errors before saving"); return; }
    const changes = getChangedFields(form, originalForm);
    if (Object.keys(changes).length === 0) { toast.info("No changes detected"); setEditMode(false); return; }

    const body: any = {};
    if (changes.applicationName) body.receivingAppName = changes.applicationName;
    if (changes.ipAddress) body.ipAddress = changes.ipAddress;
    if (changes.receivingPort) body["receive-port"] = parseInt(changes.receivingPort, 10);
    if (changes.networkFolder) body.synapseServerFolder = changes.networkFolder;
    if (changes.synapsePluginUrl !== undefined) body.synapsePluginUrl = changes.synapsePluginUrl;
    if (changes.synapseVmDetails !== undefined) body.synapseVmDetails = changes.synapseVmDetails;

    setLoading(true);
    try {
      await dispatch(patchSynapse({ body })).unwrap();
      toast.success("Synapse configuration updated successfully");
      setOriginalForm(form);
      setEditMode(false);
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render input ──────────────────────────────────────────────────────────
  const renderInput = (field: keyof FormState, disabled: boolean) => {
    const rule = FIELD_RULES[field];
    const label = rule?.label ?? field;
    const error = touched[field] ? errors[field] : "";
    const hasError = Boolean(error);

    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium text-gray-700">
          {label}
          {rule?.required && !disabled && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          value={form[field] ?? ""}
          onChange={(e) => handleChange(field, e.target.value)}
          onBlur={() => handleBlur(field)}
          onPaste={(e) => handlePaste(field, e)}
          onKeyDown={(e) => {
            if (!rule) return;
            const isCtrl = e.ctrlKey || e.metaKey || e.key.length > 1;
            if (isCtrl) return;
            if (!rule.allowedPattern.test(e.key)) e.preventDefault();
          }}
          disabled={disabled}
          className={
            disabled ? "bg-gray-50 text-gray-600"
              : hasError ? "border-red-500 focus-visible:ring-red-400" : ""
          }
          aria-invalid={hasError}
          aria-describedby={hasError ? `${field}-error` : undefined}
        />
        {hasError && (
          <p id={`${field}-error`} className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Synapse Details</h1>
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cloud className="h-5 w-5 text-blue-600" /> Synapse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              {renderInput("applicationName", !editMode)}
              {renderInput("ipAddress", !editMode)}
              {renderInput("receivingPort", !editMode)}
              {renderInput("networkFolder", !editMode)}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              {editMode ? (
                <>
                  <Button size="sm" onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(false)}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => handleEdit(true)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}