import Link from "next/link";

export default function AdminLayout({children}:{children:React.ReactNode}){
  return <><Link className="admin-billing-shortcut" href="/admin/billing">BILLING & INVOICES</Link>{children}</>;
}
