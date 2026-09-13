import "./portal-live.css";
import "./layout.css";
import PortalShortcuts from "./portal-shortcuts";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <><PortalShortcuts />{children}</>;
}
