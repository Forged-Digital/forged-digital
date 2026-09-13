"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PortalShortcuts() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!signedIn) return null;

  return <div className="portal-shortcuts"><Link href="/portal/proposals">PROPOSALS</Link><Link href="/portal/workflow">PROJECT HUB</Link><Link href="/portal/billing">BILLING & INVOICES</Link></div>;
}
