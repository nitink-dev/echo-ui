import React, { useEffect, useState } from "react";
import { Cloud, Edit, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useAppDispatch } from "../../../hooks";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Create separate thunks for Synapse since it uses different endpoint
export const fetchSynapse = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("synapse/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/api/enrichment/tools/synapse");
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const patchSynapse = createAsyncThunk<
  any,
  { body: any },
  { rejectValue: string }
>("synapse/patch", async ({ body }, { rejectWithValue }) => {
  try {
    const res = await axios.patch("/api/enrichment/tools/synapse", body);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export function SynapseConfig() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({
    applicationName: "",
    ipAddress: "",
    receivingPort: "",
    networkFolder: "",
    synapsePluginUrl: "",
    synapseVmDetails: "",
  });

  const [originalForm, setOriginalForm] = useState(form);

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await dispatch(fetchSynapse()).unwrap();
        
        if (result && Object.keys(result).length > 0) {
          const newData = {
            applicationName: result.appName || "",
            ipAddress: result.ipAddress || "",
            receivingPort: result["receive-port"]?.toString() || "",
            networkFolder: result.synapseServerFolder || "",
            synapsePluginUrl: result.synapsePluginUrl || "",
            synapseVmDetails: result.synapseVmDetails || "",
          };

          setForm(newData);
          setOriginalForm(newData);
          setInitialized(true);
        }
      } catch (error) {
        console.error("Failed to fetch Synapse config:", error);
        toast.error("Failed to load Synapse configuration");
      } finally {
        setLoading(false);
      }
    };

    if (!initialized) {
      loadData();
    }
  }, [dispatch, initialized]);

  const handleEdit = (enable: boolean) => {
    setEditMode(enable);
    if (!enable) setForm(originalForm);
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const getChangedFields = (current: any, original: any) => {
    const diff: any = {};
    Object.keys(current).forEach((k) => {
      if ((current[k] || "").toString().trim() !== (original[k] || "").toString().trim()) {
        diff[k] = current[k];
      }
    });
    return diff;
  };

  const handleSave = async () => {
    const changes = getChangedFields(form, originalForm);
    
    if (Object.keys(changes).length === 0) {
      toast.info("No changes detected");
      setEditMode(false);
      return;
    }

    const body: any = {};
    if (changes.applicationName) body.appName = changes.applicationName;
    if (changes.ipAddress) body.ipAddress = changes.ipAddress;
    if (changes.receivingPort) body["receive-port"] = parseInt(changes.receivingPort);
    if (changes.networkFolder) body.synapseServerFolder = changes.networkFolder;
    if (changes.synapsePluginUrl !== undefined) body.synapsePluginUrl = changes.synapsePluginUrl;
    if (changes.synapseVmDetails !== undefined) body.synapseVmDetails = changes.synapseVmDetails;

    setLoading(true);
    try {
      await dispatch(patchSynapse({ body })).unwrap();
      toast.success("Synapse configuration updated successfully");
      setOriginalForm(form);
      setEditMode(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field: string, label: string, disabled: boolean) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Input
        value={(form as any)[field] ?? ""}
        onChange={(e) => handleChange(field, e.target.value)}
        disabled={disabled}
        className={disabled ? "bg-gray-50 text-gray-600" : ""}
      />
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Synapse Configuration</h1>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cloud className="h-5 w-5 text-blue-600" />
              Synapse Connector
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative pb-20">
            <div className="grid md:grid-cols-2 gap-6">
              {renderInput("applicationName", "Name of Application", !editMode)}
              {renderInput("ipAddress", "IP Address", !editMode)}
              {renderInput("receivingPort", "Receiving Port", !editMode)}
              {renderInput("networkFolder", "Network Folder Location", !editMode)}
              {renderInput("synapsePluginUrl", "Synapse Plugin URL", !editMode)}
              {renderInput("synapseVmDetails", "Synapse VM Details", !editMode)}
            </div>

            <div className="mt-4 bottom-4 right-4 flex gap-2">
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