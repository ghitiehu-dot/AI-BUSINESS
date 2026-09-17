"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primary = [
  ["Overview", "/dashboard"],
  ["VA Guide", "/guide"],
  ["Skills", "/skills"],
  ["Tasks", "/tasks"],
  ["Workflows", "/workflows"],
  ["Practice", "/tasks"],
  ["Templates", "/templates"],
  ["SOPs", "/sops"],
  ["AI Guide", "/ai-guide"],
  ["Portfolio", "/portfolio"],
] as const;

const business = [
  ["Business", "/business"],
  ["Business Tasks", "/business/tasks"],
  ["Business Workflows", "/business/workflows"],
  ["Team", "/business/team"],
] as const;

function isPublic(pathname: string) {
  return pathname === "/" || pathname === "/login" || pathname.startsWith("/create-account") || pathname.startsWith("/onboarding");
}

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isPublic(pathname)) return <>{children}</>;

  const active = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <Link href="/dashboard" className="workspace-brand">AI BUSINESS</Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="workspace-nav">
          {primary.map(([label, href]) => (
            <Link key={href + label} href={href} className={active(href) ? "active" : ""}>{label}</Link>
          ))}
        </nav>
        <div className="workspace-label business-label">BUSINESS</div>
        <nav className="workspace-nav">
          {business.map(([label, href]) => (
            <Link key={href} href={href} className={active(href) ? "active" : ""}>{label}</Link>
          ))}
        </nav>
        <div className="workspace-bottom">
          <Link href="/plans">Plans & Usage</Link>
          <Link href="/promos">Promos</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/settings">Settings</Link>
        </div>
      </aside>
      <main className="workspace-main">{children}</main>
    </div>
  );
}
