// Système de notifications (toasts) basé sur le composant .mw-toast du design system.
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { IconCheck, IconAlert, IconClose } from "@/lib/icons";

type ToastTone = "success" | "danger" | "info";
interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  body?: string;
}

interface ToastContextValue {
  notify: (title: string, opts?: { body?: string; tone?: ToastTone }) => void;
  success: (title: string, body?: string) => void;
  error: (title: string, body?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (title: string, opts?: { body?: string; tone?: ToastTone }) => {
      const id = ++counter;
      const item: ToastItem = { id, title, body: opts?.body, tone: opts?.tone ?? "info" };
      setItems((prev) => [...prev, item]);
      setTimeout(() => remove(id), 4200);
    },
    [remove],
  );

  const value: ToastContextValue = {
    notify,
    success: (title, body) => notify(title, { body, tone: "success" }),
    error: (title, body) => notify(title, { body, tone: "danger" }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="mw-toast-stack">
        {items.map((t) => (
          <div key={t.id} className="mw-toast" role="status">
            <div className="mw-toast__icon" style={{ color: toneColor(t.tone) }}>
              {t.tone === "danger" ? <IconAlert size={18} /> : <IconCheck size={18} />}
            </div>
            <div style={{ flex: 1 }}>
              <div className="mw-toast__title">{t.title}</div>
              {t.body && <div className="mw-toast__body">{t.body}</div>}
            </div>
            <button className="mw-toast__close" onClick={() => remove(t.id)} aria-label="Fermer">
              <IconClose size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function toneColor(tone: ToastTone): string {
  if (tone === "success") return "var(--mw-success-solid)";
  if (tone === "danger") return "var(--mw-danger-solid)";
  return "var(--mw-accent)";
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans ToastProvider");
  return ctx;
}
