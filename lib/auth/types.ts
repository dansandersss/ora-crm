export type StaffRole = "owner" | "admin" | "reception";
export type StaffStatus = "pending" | "active" | "disabled";

export type StaffProfile = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: StaffRole;
  status: StaffStatus;
  created_at: string;
  updated_at: string;
};
