import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface StudentSettings {
  name: string;
  email: string;
  studentId: string;
  department: string;
  semester: number;
  emailAlerts: boolean;
  pushNotifications: boolean;
  language: string;
  twoFactorEnabled: boolean;
}

export interface UpdateSettingsPayload {
  name?: string;
  emailAlerts?: boolean;
  pushNotifications?: boolean;
  language?: string;
  twoFactorEnabled?: boolean;
}

export function useStudentSettings() {
  const [settings, setSettings] = useState<StudentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; data: StudentSettings }>("/student/settings");
      setSettings(res.data.data);
    } catch {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (payload: UpdateSettingsPayload): Promise<boolean> => {
    try {
      setSaving(true);
      const res = await api.put<{ success: boolean; data: StudentSettings }>("/student/settings", payload);
      setSettings(res.data.data);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ ok: boolean; message: string }> => {
    try {
      await api.post("/student/change-password", { currentPassword, newPassword });
      return { ok: true, message: "Password changed successfully" };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      return {
        ok: false,
        message: axiosErr.response?.data?.message ?? "Failed to change password",
      };
    }
  }, []);

  return { settings, loading, error, saving, updateSettings, changePassword };
}
