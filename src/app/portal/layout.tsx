import Link from "next/link";
import "./portal-live.css";
import "./layout.css";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <><Link className="portal-billing-shortcut" href="/portal/billing">BILLING & INVOICES</Link>{children}</>;
}
