import Link from "next/link";
import "./layout.css";

export default function AdminLayout({children}:{children:React.ReactNode}){
  return <><div className="admin-shortcuts"><Link href="/admin/workflow">PROJECT HUB</Link><Link href="/admin/billing">BILLING & INVOICES</Link></div>{children}</>;
}
