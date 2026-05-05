import api from "@/lib/axios";

export type UserRole = "ADMIN" | "PHARMACY" | "STAFF" | "USER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  status: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    session: {
      id: string;
      expiresAt: string;
    };
  };
}

export interface DemoLoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    } | null;
  };
}

/**
 * Get current user session
 */
export async function getMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data;
}

/**
 * Demo login by role
 */
export async function demoLogin(role: string): Promise<DemoLoginResponse> {
  const { data } = await api.post<DemoLoginResponse>(`/auth/demo-login/${role}`);
  return data;
}

export async function updateProfileImage(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await api.put("/auth/profile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function removeProfileImage() {
  const { data } = await api.delete("/auth/profile-image");
  return data;
}
