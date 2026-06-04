// Barre latérale sombre : navigation core banking en sections, accent jaune sur l'actif,
// repère « Bientôt » sur les modules à venir. Brand et utilisateur restent fixes.
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/lib/types";
import { initials } from "@/lib/format";
import { NAV_SECTIONS, type NavItem } from "@/lib/nav";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { IconLogout } from "@/lib/icons";

export function Sidebar() {
  const { user, logout } = useAuth();

  const visible = (item: NavItem) => !item.adminOnly || user?.role === "admin";

  return (
    <aside className="mw-sidebar">
      <div className="mw-sidebar__brand">
        <BrandLogo size={38} />
        <div style={{ lineHeight: 1.1 }}>
          <span className="mw-sidebar__brandname">CAMPOST</span>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: "var(--mw-fg-on-ink-muted)",
            }}
          >
            Core Banking
          </div>
        </div>
      </div>

      <div className="mw-sidebar__scroll">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter(visible);
          if (items.length === 0) return null;
          return (
            <div key={section.title}>
              <div className="mw-sidebar__section">{section.title}</div>
              <nav className="mw-nav">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) => `mw-nav__item${isActive ? " is-active" : ""}`}
                  >
                    <span className="mw-nav__ico">{item.icon}</span>
                    <span className="mw-nav__label">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          );
        })}
      </div>

      <div className="mw-sidebar__foot">
        <div className="mw-sidebar__user">
          <span className="mw-avatar mw-avatar--sm" style={{ background: "var(--mw-accent)", color: "var(--mw-ink)" }}>
            {initials(user?.fullName ?? "")}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mw-sidebar__user-name">{user?.fullName}</div>
            <div className="mw-sidebar__user-role">{user ? ROLE_LABELS[user.role] : ""}</div>
          </div>
          <button
            className="mw-btn mw-btn--ghost mw-btn--icon mw-btn--sm"
            onClick={logout}
            title="Se déconnecter"
            style={{ color: "var(--mw-fg-on-ink-muted)" }}
          >
            <IconLogout size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
