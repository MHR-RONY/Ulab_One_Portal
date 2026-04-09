import { useState, useEffect } from "react";
import api from "@/lib/api";

interface ITeacherProfile {
	_id: string;
	name: string;
	email: string;
	teacherId: string;
	department: string;
	accentColorIndex: number;
	avatar?: string | null;
	bio?: string;
}

export const useTeacherProfile = () => {
	const [profile, setProfile] = useState<ITeacherProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [version, setVersion] = useState(0);

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
	}, [version]);

	const refetch = () => setVersion((v) => v + 1);

	return { profile, loading, refetch };
};
