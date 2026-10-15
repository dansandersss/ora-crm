export type DeviceType = "pc" | "ps5" | "xbox" | "cinema";

export type StationAvailability =
  | "available"
  | "occupied"
  | "reserved"
  | "offline"
  | "maintenance"
  | "disabled";

export type DashboardOverview = {
  active_sessions: number;
  pc_total: number;
  pc_occupied: number;
  ps5_total: number;
  ps5_occupied: number;
  xbox_total: number;
  xbox_occupied: number;
  cinema_total: number;
  cinema_occupied: number;
  revenue_today_mdl: number;
};

export type DashboardStation = {
  device_id: string;
  code: string;
  name: string;
  device_type: DeviceType;
  operational_status: string;
  is_enabled: boolean;
  connection_state: "unknown" | "online" | "offline";
  last_heartbeat_at: string | null;
  availability: StationAvailability;
  current_session_id: string | null;
  current_session_status: string | null;
  current_user_id: string | null;
  current_user_name: string | null;
  current_user_phone: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

export type DashboardActiveSession = {
  session_id: string;
  device_id: string;
  device_code: string;
  device_name: string;
  device_type: DeviceType;
  session_status: "active" | "paused";
  user_id: string;
  user_name: string | null;
  user_phone: string | null;
  starts_at: string;
  ends_at: string;
  activated_at: string | null;
  paused_at: string | null;
  total_seconds: number;
  remaining_seconds: number;
};

export type DashboardHistoryItem = {
  session_id: string;
  device_id: string;
  device_code: string;
  device_name: string;
  device_type: DeviceType;
  session_status: "completed" | "cancelled";
  user_id: string;
  user_name: string | null;
  user_phone: string | null;
  starts_at: string;
  ends_at: string;
  duration_seconds: number;
  earned_points: number;
  amount_paid_mdl: number;
  total_count: number;
};

export type HistoryFilter = DeviceType | null;
export type HistoryCounts = Record<"all" | DeviceType, number>;

