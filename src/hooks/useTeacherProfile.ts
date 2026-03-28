import { useState, useEffect } from "react";
import api from "@/lib/api";

interface ITeacherProfile {
	_id: string;
	name: string;
	email: string;
	teacherId: string;
	department: string;
	accentColorIndex: number;
}

export const useTeacherProfile = () => {
	const [profile, setProfile] = useState<ITeacherProfile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const { data } = await api.get("/teacher/profile");
				setProfile(data.data);
			} catch {
				// fail silently — UI falls back to placeholder text
			} finally {
				setLoading(false);
			}
		};
		fetchProfile();
	}, []);

	return { profile, loading };
};
