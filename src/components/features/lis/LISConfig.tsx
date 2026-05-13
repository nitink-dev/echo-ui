import { AlertTriangle, Database, Edit, Save, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useAppDispatch } from "../../../hooks";
import { useRefetchOnFocus } from "../../../hooks/useRefetchOnFocus";
import { extractApiErrorMessage } from "../../../api/services/apiClient";
import { fetchEhTool, patchEhTool } from "../../../store/slices/ehToolsSlice";
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
import { usePermissions } from "../../../auth/permissions/usePermissions";

const FIELD_RULES: Record<string, FieldRule> = {
  applicationName: {
    label: "LIS App Name",
    allowedPattern: /^[a-zA-Z0-9 _-]*$/,
    validPattern: /^[a-zA-Z0-9 _-]{1,100}$/,
    errorMessage:
      "Only letters, numbers, spaces, hyphens and underscores allowed (max 100 chars)",
    required: true,
  },
  ipAddress: {
    label: "LIS IP Address",
    allowedPattern: IP_ALLOWED_PATTERN,
    validate: isValidIP,
    errorMessage: IP_ERROR_MESSAGE,
    required: true,
  },
  receivingFacility: {
    label: "LIS Facility",
    allowedPattern: /^[a-zA-Z0-9 _-]*$/,
    validPattern: /^[a-zA-Z0-9 _-]{1,100}$/,
    errorMessage:
      "Only letters, numbers, spaces, hyphens and underscores allowed (max 100 chars)",
    required: false,
  },
  incomingPort: {
    label: "LIS Port",
    allowedPattern: PORT_ALLOWED_PATTERN,
    validate: isValidPort,
    errorMessage: PORT_ERROR_MESSAGE,
    required: true,
  },
};

type FormState = {
  applicationName: string;
  ipAddress: string;
  incomingPort: string;
  receivingFacility: string;
};

const INITIAL_FORM: FormState = {
  applicationName: "",
  ipAddress: "",
  incomingPort: "",
  receivingFacility: "",
};

export function LisConfig() {
  const dispatch = useAppDispatch();
  const { lisConnector, loading } = useSelector((s: any) => s.ehTools || {});

  const [editMode, setEditMode] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [originalForm, setOriginalForm] = useState<FormState>(INITIAL_FORM);
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({});
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const [cardError, setCardError] = useState<string | null>(null);

  const { canPatch, canPut } = usePermissions();
  const canEditLis = canPatch("/api/enrichment/tools/eh-lis-connector");

  useEffect(() => {
    dispatch(fetchEhTool({ toolKey: "eh-lis-connector" }))
      .unwrap()
      .catch((err: unknown) => {
        setCardError(extractApiErrorMessage(err));
      });
  }, [dispatch]);

  useRefetchOnFocus([() => fetchEhTool({ toolKey: "eh-lis-connector" })]);

  useEffect(() => {
    if (!lisConnector || Object.keys(lisConnector).length === 0 || initialized)
      return;
    const newData: FormState = {
      applicationName: lisConnector.receivingAppName || lisConnector.name || "",
      ipAddress: lisConnector.ipAddress || "",
      incomingPort: lisConnector["incoming-port"]?.toString() || "",
      receivingFacility: lisConnector.receivingFacility || "",
    };
    setForm(newData);
    setOriginalForm(newData);
    setInitialized(true);
    setCardError(null);
  }, [lisConnector, initialized]);

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
    if (changes.applicationName) body.appName = changes.applicationName;
    if (changes.ipAddress) body.ipAddress = changes.ipAddress;
    if (changes.incomingPort)
      body["incoming-port"] = parseInt(changes.incomingPort, 10);
    if (changes.receivingFacility !== undefined)
      body.receivingFacility = changes.receivingFacility;

    setCardError(null);

    try {
      await dispatch(
        patchEhTool({ toolKey: "eh-lis-connector", body }),
      ).unwrap();
      toast.success("LIS configuration updated successfully");
      setOriginalForm(form);
      setEditMode(false);
      setErrors({});
      setTouched({});
    } catch (error: unknown) {
      setCardError(extractApiErrorMessage(error));
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          LIS Application Details
        </h1>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Database className="h-5 w-5 text-[#007BFF]" />
              LIS
            </CardTitle>
          </CardHeader>

          {cardError && (
            <div className="mx-6 mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3.5 shadow-sm">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 mt-0.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-700 leading-none mb-1">
                  Request Failed : {cardError} 
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCardError(null)}
                className="shrink-0 rounded-md p-0.5 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
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
              {renderInput("receivingFacility", !editMode)}
              {renderInput("incomingPort", !editMode)}
            </div>

            <div className="flex justify-end gap-2 pt-6 mt-2 border-t border-gray-200">
              {canEditLis && (
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
                      className="h-9 px-4 border-gray-200 text-gray-700 hover:bg-gray-50"
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