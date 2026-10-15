import type { DeviceType } from "@/lib/dashboard/types";

export type SessionRecord = {
  record_id: string;
  record_kind: "gaming" | "movie";
  device_id: string | null;
  device_name: string | null;
  device_type: DeviceType;
  primary_user_id: string | null;
  primary_user_name: string | null;
  primary_user_phone: string | null;
  starts_at: string;
  ends_at: string | null;
  status: "scheduled" | "active" | "paused" | "completed" | "cancelled";
  participant_count: number;
  title: string | null;
  description: string | null;
};

export type SessionStation = {
  device_id: string;
  code: string;
  name: string;
  device_type: DeviceType;
  availability: "available" | "occupied" | "reserved" | "offline" | "maintenance" | "disabled";
  starts_at: string | null;
  ends_at: string | null;
};

export type SessionCustomer = {
  id: string;
  full_name: string;
  phone: string | null;
};

export type SessionFilter = "all" | "pc" | "ps5" | "cinema";
