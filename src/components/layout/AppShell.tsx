// Disposition principale : sidebar + colonne (topbar + zone de contenu crème).
import { Outlet, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { IconSearch, IconBell } from "@/lib/icons";
import { NAV_TITLES } from "@/lib/nav";

export function AppShell() {
  const { pathname } = useLocation();
  const meta = NAV_TITLES[pathname] ?? { title: "CAMPOST", subtitle: "" };

  return (
    <div className="mw-app" style={{ height: "100vh" }}>
      <Sidebar />
      <div className="mw-main">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <div className="mw-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function Topbar({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <header className="mw-topbar">
      <div className="mw-topbar__title">
        <h1 className="mw-h2">{title}</h1>
        {subtitle && <span className="mw-caption">{subtitle}</span>}
      </div>
      <div className="mw-topbar__spacer" />
      <div className="mw-topbar__search">
        <IconSearch size={18} />
        <input placeholder="Rechercher…" aria-label="Rechercher" />
      </div>
      <div className="mw-topbar__tools">
        {actions}
        <button className="mw-topbar__iconbtn" aria-label="Notifications">
          <IconBell size={19} />
          <span className="mw-dot" />
        </button>
      </div>
    </header>
  );
}
