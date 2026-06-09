import { createAsyncThunk } from "@reduxjs/toolkit";
import { AlertTriangle, Cloud, Edit, Save, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import apiClient, { extractApiErrorMessage } from "../../../api/services/apiClient";
import { useAppDispatch } from "../../../hooks";
import { useRefetchOnFocus } from "../../../hooks/useRefetchOnFocus";
import {
  IP_ALLOWED_PATTERN,
  IP_ERROR_MESSAGE,
  PORT_ALLOWED_PATTERN,
  PORT_ERROR_MESSAGE,
  isValidIP,
  isValidPort,
  sanitizeByPattern,
  type FieldRule,
} from "../../../utils/validation.constants";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { SERVICE_URL } from "../../../api/services/enrichmentService";
import { useFeaturePermissions } from "../../../auth/permissions/useFeaturePermissions";
import { useSlideScan } from "../status/SlideScanContext";

export const fetchSynapse = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("synapse/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(SERVICE_URL + "/synapse");
    return res.data;
  } catch (err: any) {
    const data = err?.response?.data;
    if (data) {
      if (typeof data === "string") return rejectWithValue(data);
      const msg =
        data.message ||
        data.error ||
        data.errorDescription ||
        data.errorMessage ||
        null;
      if (msg) return rejectWithValue(msg);
    }
    return rejectWithValue(err.message || "An unexpected error occurred.");
  }
});

export const patchSynapse = createAsyncThunk<
  any,
  { body: any },
  { rejectValue: string }
>("synapse/patch", async ({ body }, { rejectWithValue }) => {
  try {
    const res = await apiClient.patch(SERVICE_URL + "/synapse", body);
    return res.data;
  } catch (err: any) {
    const data = err?.response?.data;
    if (data) {
      if (typeof data === "string") return rejectWithValue(data);
      const msg =
        data.message ||
        data.error ||
        data.errorDescription ||
        data.errorMessage ||
        null;
      if (msg) return rejectWithValue(msg);
    }
    return rejectWithValue(err.message || "An unexpected error occurred.");
  }
});

const FIELD_RULES: Record<string, FieldRule> = {
  imsName: {
    label: "IMS Name",
    allowedPattern: /^[a-zA-Z0-9 _-]*$/,
    validPattern: /^[a-zA-Z0-9 _-]{1,100}$/,
    errorMessage:
      "Only letters, numbers, spaces, hyphens and underscores are allowed (max 100 chars)",
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
    label: "IMS Port",
    allowedPattern: PORT_ALLOWED_PATTERN,
    validate: isValidPort,
    errorMessage: PORT_ERROR_MESSAGE,
    required: true,
  },
  networkFolder: {
    label: "Network Folder Location",
    allowedPattern: /^[a-zA-Z0-9 /\\:_\-.]*$/,
    validPattern: /^[a-zA-Z0-9 /\\:_\-.]{1,260}$/,
    errorMessage:
      "Only letters, digits, spaces and path characters (/ \\ : _ - .) are allowed (max 260 chars)",
    required: true,
  },
  networkFolder2: {
    label: "Network Folder Location 2",
    allowedPattern: /^[a-zA-Z0-9 /\\:_\-.]*$/,
    validPattern: /^[a-zA-Z0-9 /\\:_\-.]{1,260}$/,
    errorMessage:
      "Only letters, digits, spaces and path characters (/ \\ : _ - .) are allowed (max 260 chars)",
    required: false,
  },
  applicationName: {
    label: "Application Name",
    allowedPattern: /^[a-zA-Z0-9 _-]*$/,
    validPattern: /^[a-zA-Z0-9 _-]{1,100}$/,
    errorMessage:
      "Only letters, numbers, spaces, hyphens and underscores are allowed (max 100 chars)",
    required: false,
  },
  receivingFacility: {
    label: "Application Facility",
    allowedPattern: /^[a-zA-Z0-9 _-]*$/,
    validPattern: /^[a-zA-Z0-9 _-]{1,100}$/,
    errorMessage:
      "Only letters, numbers, spaces, hyphens and underscores are allowed (max 100 chars)",
    required: false,
  },
};

type FormState = {
  applicationName: string;
  ipAddress: string;
  receivingPort: string;
  networkFolder: string;
  receivingFacility: string;
  imsName: string;
  networkFolder2: string;
};

const INITIAL_FORM: FormState = {
  applicationName: "",
  ipAddress: "",
  receivingPort: "",
  networkFolder: "",
  receivingFacility: "",
  imsName: "",
  networkFolder2: "",
};

export function SynapseConfig() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [originalForm, setOriginalForm] = useState<FormState>(INITIAL_FORM);
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({});
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const [cardError, setCardError] = useState<string | null>(null);

  const { enrichment } = useFeaturePermissions();
  const canEditSynapse = enrichment.canEditSynapse;
  const { inProgressCount } = useSlideScan();
  const isScanInProgress = inProgressCount > 0;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setCardError(null);
      try {
        const result = await dispatch(fetchSynapse()).unwrap();
        if (result && Object.keys(result).length > 0) {
          const newData: FormState = {
            applicationName: result.receivingAppName || "",
            ipAddress: result.ipAddress || "",
            receivingPort: result["receive-port"]?.toString() || "",
            networkFolder: result.synapseServerFolder || "",
            receivingFacility: result.receivingFacility || "",
            imsName: result.imsName || "",
            networkFolder2: result.networkFolder2 || "",
          };
          setForm(newData);
          setOriginalForm(newData);
        }
      } catch (error: unknown) {
        setCardError(extractApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch]);

  useRefetchOnFocus([() => fetchSynapse()]);

  const validateField = useCallback(
    (field: keyof FormState, value: string): string => {
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
    },
    [],
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    let valid = true;
    (Object.keys(FIELD_RULES) as Array<keyof FormState>).forEach((field) => {
      const err = validateField(field, form[field]);
      if (err) {
        newErrors[field] = err;
        valid = false;
      }
    });
    setErrors(newErrors);
    setTouched(
      Object.keys(FIELD_RULES).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
    );
    return valid;
  }, [form, validateField]);

  const handleChange = useCallback(
    (field: keyof FormState, value: string) => {
      const rule = FIELD_RULES[field];
      const sanitized = rule
        ? sanitizeByPattern(value, rule.allowedPattern)
        : value;
      setForm((prev) => ({ ...prev, [field]: sanitized }));
      if (touched[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: validateField(field, sanitized),
        }));
      }
    },
    [touched, validateField],
  );

  const handleBlur = useCallback(
    (field: keyof FormState) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, form[field]),
      }));
    },
    [form, validateField],
  );

  const handlePaste = useCallback(
    (field: keyof FormState, e: React.ClipboardEvent<HTMLInputElement>) => {
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
        handleChange(
          field,
          current.slice(0, start) + sanitized + current.slice(end),
        );
      }
    },
    [form, handleChange],
  );

  const handleEdit = (enable: boolean) => {
    if (enable && isScanInProgress) {
      toast.warning(
        "A slide scan is currently in progress. Configuration changes may affect the ongoing scan.",
      );
      return;
    }
    setEditMode(enable);
    if (!enable) {
      setForm(originalForm);
      setErrors({});
      setTouched({});
    }
    setCardError(null);
  };

  const getChangedFields = (
    current: FormState,
    original: FormState,
  ): Partial<FormState> => {
    const diff: Partial<FormState> = {};
    (Object.keys(current) as Array<keyof FormState>).forEach((k) => {
      if (
        (current[k] || "").toString().trim() !==
        (original[k] || "").toString().trim()
      )
        (diff as any)[k] = current[k];
    });
    return diff;
  };

  const handleSave = async () => {
    if (!validateAll()) {
      toast.error("Please fix the validation errors before saving");
      return;
    }
    const changes = getChangedFields(form, originalForm);
    if (Object.keys(changes).length === 0) {
      toast.info("No changes detected");
      setEditMode(false);
      return;
    }

    const body: any = {};
    if (changes.applicationName)
      body.receivingAppName = changes.applicationName;
    if (changes.ipAddress) body.ipAddress = changes.ipAddress;
    if (changes.receivingPort)
      body["receive-port"] = parseInt(changes.receivingPort, 10);
    if (changes.networkFolder) body.synapseServerFolder = changes.networkFolder;
    if (changes.receivingFacility)
      body.receivingFacility = changes.receivingFacility;
    if (changes.imsName) body.imsName = changes.imsName;
    if (changes.networkFolder2) body.networkFolder2 = changes.networkFolder2;

    setCardError(null);
    setLoading(true);

    try {
      await dispatch(patchSynapse({ body })).unwrap();
      toast.success("Synapse configuration updated successfully");
      setOriginalForm(form);
      setEditMode(false);
      setErrors({});
      setTouched({});
    } catch (error: unknown) {
      setCardError(extractApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field: keyof FormState, disabled: boolean) => {
    const rule = FIELD_RULES[field];
    const label = rule?.label ?? field;
    const error = touched[field] ? errors[field] : "";
    const hasError = Boolean(error);

    return (
      <div className="space-y-2">
        <Label htmlFor={field} className="text-sm font-medium text-gray-700">
          {label}
          {rule?.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={field}
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
          className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${
            hasError ? "border-red-500 focus:border-red-500" : ""
          } ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : ""}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${field}-error` : undefined}
        />
        {hasError && (
          <p
            id={`${field}-error`}
            className="text-sm text-red-600 flex items-center gap-1"
          >
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">IMS Details</h1>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Cloud className="h-5 w-5 text-[#007BFF]" />
              IMS
            </CardTitle>
          </CardHeader>

          {cardError && (
            <div className="mx-6 mb-4 flex items-start gap-3 rounded-lg border border-[#F09595] bg-[#FCEBEB] px-4 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7C1C1] mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#791F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#791F1F] leading-snug mb-0.5">
                  Request failed
                </p>
                <p className="text-sm text-[#A32D2D] leading-snug">{cardError}</p>
              </div>
              <button
                type="button"
                onClick={() => setCardError(null)}
                className="shrink-0 rounded-md p-1 text-[#A32D2D] hover:bg-[#F7C1C1] transition-colors"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput("applicationName", !editMode)}
              {renderInput("ipAddress", !editMode)}
              {renderInput("receivingPort", !editMode)}
              {renderInput("networkFolder", !editMode)}
              {renderInput("receivingFacility", !editMode)}
              {renderInput("imsName", !editMode)}
              {renderInput("networkFolder2", !editMode)}
            </div>

            <div className="flex justify-end gap-2 pt-6 mt-2 border-t border-gray-200">
              {canEditSynapse && (
                <>
                  {editMode ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={loading}
                        className="h-9 px-4 bg-[#007BFF] hover:bg-[#0069d9] text-white border-0"
                      >
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(false)}
                        className="h-9 px-4 border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(true)}
                      disabled={isScanInProgress}
                      title={
                        isScanInProgress
                          ? "A slide scan is currently in progress. Editing is disabled."
                          : undefined
                      }
                      className="h-9 px-4 border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}