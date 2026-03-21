import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface ProfileCourse {
  courseCode: string;
  courseName: string;
  credits: number;
  teacher: string;
  attendedClasses: number;
  totalClasses: number;
  attendancePercentage: number;
}

export interface ProfileData {
  name: string;
  studentId: string;
  department: string;
  semester: number;
  email: string;
  phone: string;
  enrolledCourses: ProfileCourse[];
  overallAttendancePercentage: number;
  totalCredits: number;
}

export interface UpdateProfilePayload {
  name: string;
  department: string;
  semester: number;
  phone: string;
}

interface UseProfileReturn {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
}

export function useStudentProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; data: ProfileData }>("/student/profile");
      setProfile(res.data.data);
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    setSaving(true);
    try {
      await api.put("/student/profile", payload);
      await fetchProfile();
    } finally {
      setSaving(false);
    }
  }, [fetchProfile]);

  return { profile, loading, error, saving, updateProfile };
}
