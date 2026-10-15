import { SessionsManagement } from "@/components/sessions/SessionsManagement";
import { requireActiveStaff } from "@/lib/auth/server";

export default async function SessionsPage() {
  await requireActiveStaff();
  return <SessionsManagement />;
}
