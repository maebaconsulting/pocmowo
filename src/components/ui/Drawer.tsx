// Panneau latéral (.mw-drawer) glissant depuis la droite.
import type { ReactNode } from "react";
import { IconClose } from "@/lib/icons";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  header: ReactNode;
  children: ReactNode;
}

export function Drawer({ open, onClose, header, children }: DrawerProps) {
  if (!open) return null;
  return (
    <div className="mw-overlay" style={{ justifyContent: "flex-end" }} onMouseDown={onClose}>
      <div className="mw-drawer" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="mw-drawer__head">
          <div style={{ flex: 1 }}>{header}</div>
          <button className="mw-btn mw-btn--ghost mw-btn--icon mw-btn--sm" onClick={onClose} aria-label="Fermer">
            <IconClose size={18} />
          </button>
        </div>
        <div className="mw-drawer__body">{children}</div>
      </div>
    </div>
  );
}
