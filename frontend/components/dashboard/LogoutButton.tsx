
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error.message);
      setLoading(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="dashboard-logout"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? (
        <Loader2 size={17} className="animate-spin" />
      ) : (
        <LogOut size={17} />
      )}
      <span>{loading ? "Signing out..." : "Sign out"}</span>
    </button>
  );
}
