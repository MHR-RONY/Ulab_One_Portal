import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface DashboardClass {
  courseCode: string;
  courseName: string;
  startTime: string;
  endTime: string;
  room: string;
  teacher: string;
  status: "COMPLETED" | "NOW" | "UPCOMING";
}

export interface DashboardStats {
  upcomingClassesCount: number;
  nextClass: { code: string; time: string } | null;
  totalSessionsToday: number;
  completedSessionsToday: number;
}

export interface AttendanceSummary {
  courseCode: string;
  courseName: string;
  attendedClasses: number;
  totalClasses: number;
  percentage: number;
}

export interface DashboardStudent {
  name: string;
  studentId: string;
  department: string;
  semester: number;
}

export interface DashboardData {
  student: DashboardStudent;
  todaysClasses: DashboardClass[];
  stats: DashboardStats;
  attendance: AttendanceSummary[];
}

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

export function useStudentDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<{ success: boolean; message: string; data: DashboardData }>(
          "/student/dashboard"
        );
        if (!cancelled) {
          setData(response.data.data);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load dashboard data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
