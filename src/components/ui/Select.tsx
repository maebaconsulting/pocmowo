// Liste déroulante personnalisée, cohérente avec le design system MoWoBank
// (déclencheur + panneau .mw-menu). Remplace les <select> natifs au rendu OS.
import { useEffect, useId, useRef, useState } from "react";
import { IconChevronDown, IconCheck } from "@/lib/icons";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  variant?: "field" | "pill";
  disabled?: boolean;
  ariaLabel?: string;
  block?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Sélectionner…",
  variant = "field",
  disabled = false,
  ariaLabel,
  block = true,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const triggerClass = variant === "pill" ? "mw-select" : "mw-select-trigger";

  return (
    <div
      className="mw-select-wrap"
      ref={ref}
      style={block && variant === "field" ? { width: "100%" } : undefined}
    >
      <button
        type="button"
        className={`${triggerClass}${open ? " is-open" : ""}`}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        style={block && variant === "field" ? { width: "100%" } : undefined}
      >
        <span className={selected ? undefined : "mw-select-trigger__ph"}>
          {selected ? selected.label : placeholder}
        </span>
        <IconChevronDown size={16} className="mw-select__chev" />
      </button>

      {open && (
        <div className="mw-menu mw-select-menu" role="listbox" id={listId}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              className={`mw-menu__item${o.value === value ? " is-active" : ""}`}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              <span style={{ flex: 1 }}>{o.label}</span>
              {o.value === value && <IconCheck size={15} style={{ color: "var(--mw-fg)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
