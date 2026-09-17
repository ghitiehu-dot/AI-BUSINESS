"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primary = [["Overview", "/dashboard"], ["VA Guide", "/guide"], ["Skills", "/skills"], ["Tasks", "/tasks"], ["Workflows", "/workflows"], ["Practice", "/practice"], ["Templates", "/templates"], ["SOPs", "/sops"], ["Resources", "/resources"], ["AI Guide", "/ai-guide"], ["Portfolio", "/portfolio"]] as const;
const business = [["Business", "/business"], ["Business Tasks", "/business/tasks"], ["Business Workflows", "/business/workflows"], ["Team", "/business/team"]] as const;

function isPublic(pathname: string) { return pathname === "/" || pathname === "/login" || pathname.startsWith("/create-account") || pathname.startsWith("/onboarding"); }

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isPublic(pathname)) return <>{children}</>;
  const active = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  return <>
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <Link href="/dashboard" className="workspace-brand">AI BUSINESS</Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="workspace-nav">{primary.map(([label, href]) => <Link key={href} href={href} className={active(href) ? "active" : ""}>{label}</Link>)}</nav>
        <div className="workspace-label business-label">BUSINESS</div>
        <nav className="workspace-nav">{business.map(([label, href]) => <Link key={href} href={href} className={active(href) ? "active" : ""}>{label}</Link>)}</nav>
        <div className="workspace-bottom"><Link href="/plans">Plans & Usage</Link><Link href="/promos">Promos</Link><Link href="/profile">Profile</Link><Link href="/settings">Settings</Link></div>
      </aside>
      <main className="workspace-main">{children}</main>
    </div>
    <style>{`\n.workspace-shell{min-height:100vh;display:grid;grid-template-columns:250px minmax(0,1fr);background:#f7f8fa}.workspace-sidebar{position:sticky;top:0;height:100vh;overflow-y:auto;background:#0b0b0c;color:#fff;padding:24px 16px;display:flex;flex-direction:column;border-right:1px solid #222}.workspace-brand{font-weight:850;letter-spacing:-.04em;font-size:19px;padding:8px 12px 20px}.workspace-label{font-size:10px;font-weight:800;letter-spacing:.14em;color:#8b8b91;padding:16px 12px 8px}.workspace-nav{display:grid;gap:3px}.workspace-nav a,.workspace-bottom a{padding:9px 12px;border-radius:9px;color:#b9b9c0;font-size:13px;transition:background .15s,color .15s}.workspace-nav a:hover,.workspace-nav a.active,.workspace-bottom a:hover{background:#1c1c1f;color:#fff}.workspace-nav a.active{font-weight:750;box-shadow:inset 2px 0 #fff}.business-label{margin-top:8px}.workspace-bottom{margin-top:auto;display:grid;gap:3px;padding-top:18px;border-top:1px solid #242427}.workspace-main{min-width:0}.workspace-dashboard{max-width:1180px!important}.workspace-main>.page{max-width:1180px;margin:0 auto}.workspace-main>.content{max-width:1180px}.workspace-main .topbar{max-width:none}@media(max-width:800px){.workspace-shell{display:block}.workspace-sidebar{position:relative;height:auto;max-height:none;padding:12px;display:block}.workspace-brand{display:block;padding:6px 8px 12px}.workspace-label,.workspace-bottom{display:none}.workspace-nav{display:flex;gap:4px;overflow-x:auto;padding-bottom:2px}.workspace-nav a{white-space:nowrap}.workspace-main>.page,.workspace-main>.content{max-width:none;padding-left:18px;padding-right:18px}}\n`}</style>
  </>;
}
