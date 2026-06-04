// Fenêtre modale (.mw-modal) — superposition centrée avec fermeture par fond ou bouton.
import type { ReactNode } from "react";
import { IconClose } from "@/lib/icons";

interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, title, subtitle, onClose, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div className="mw-overlay" onMouseDown={onClose}>
      <div className="mw-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="mw-modal__head">
          <div>
            <h3 className="mw-h3">{title}</h3>
            {subtitle && (
              <p className="mw-sm mw-muted" style={{ marginTop: 4 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button className="mw-btn mw-btn--ghost mw-btn--icon mw-btn--sm" onClick={onClose} aria-label="Fermer">
            <IconClose size={18} />
          </button>
        </div>
        <div className="mw-modal__scroll">{children}</div>
        {footer && <div className="mw-modal__actions">{footer}</div>}
      </div>
    </div>
  );
}
