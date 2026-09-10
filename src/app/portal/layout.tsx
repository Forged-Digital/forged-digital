import Link from "next/link";
import "./portal-live.css";
import "./layout.css";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <><div className="portal-shortcuts"><Link href="/portal/workflow">PROJECT HUB</Link><Link href="/portal/billing">BILLING & INVOICES</Link></div>{children}</>;
}
