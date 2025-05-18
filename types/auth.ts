export interface userData {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  createdAt: string | null;
}

export interface adminData {
  admin_id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  last_login: string | null;
  createdAt: string | null;
}
