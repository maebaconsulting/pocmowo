// Icônes SVG inline (style trait, 1.6px) cohérentes avec le design system MoWoBank.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export const IconDashboard = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6" />
    <path d="M17.5 13.5a5.5 5.5 0 0 1 3 5" />
  </svg>
);

export const IconWallet = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1" />
    <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
    <circle cx="16.5" cy="13.5" r="1.4" />
  </svg>
);

export const IconTransactions = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 7h12" />
    <path d="m16 4 3 3-3 3" />
    <path d="M17 17H5" />
    <path d="m8 14-3 3 3 3" />
  </svg>
);

export const IconDeposit = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4v11" />
    <path d="m7 11 5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
);

export const IconWithdraw = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20V9" />
    <path d="m7 13 5-5 5 5" />
    <path d="M5 4h14" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const IconBell = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 1.5 6 2 7H4c.5-1 2-2 2-7Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconLogout = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 12H3" />
    <path d="m6 8-4 4 4 4" />
  </svg>
);

export const IconChevronDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
);

export const IconAlert = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
  </svg>
);

export const IconCoins = (p: IconProps) => (
  <svg {...base(p)}>
    <ellipse cx="9" cy="7" rx="5.5" ry="2.8" />
    <path d="M3.5 7v5c0 1.5 2.5 2.8 5.5 2.8s5.5-1.3 5.5-2.8V7" />
    <path d="M9 14.8v3c0 1.5 2.5 2.8 5.5 2.8s5.5-1.3 5.5-2.8v-5" />
    <ellipse cx="14.5" cy="12" rx="5.5" ry="2.8" />
  </svg>
);

export const IconSettings = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13a7.9 7.9 0 0 0 0-2l1.6-1.2-2-3.4-1.9.8a7.9 7.9 0 0 0-1.7-1l-.3-2H10.9l-.3 2a7.9 7.9 0 0 0-1.7 1l-1.9-.8-2 3.4L6.6 11a7.9 7.9 0 0 0 0 2l-1.6 1.2 2 3.4 1.9-.8a7.9 7.9 0 0 0 1.7 1l.3 2h4.2l.3-2a7.9 7.9 0 0 0 1.7-1l1.9.8 2-3.4Z" />
  </svg>
);

export const IconPhone = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V19a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 1-2Z" />
  </svg>
);

export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const IconUserCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="m16 11 2 2 4-4" />
  </svg>
);

export const IconCash = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 9.5v5M18 9.5v5" />
  </svg>
);

export const IconTransfer = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 8h13" />
    <path d="m14 5 3 3-3 3" />
    <path d="M20 16H7" />
    <path d="m10 13-3 3 3 3" />
  </svg>
);

export const IconClient = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="9" r="3.4" />
    <circle cx="12" cy="12" r="9" />
    <path d="M5.5 18.5a7 7 0 0 1 13 0" />
  </svg>
);

export const IconGroup = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="8" cy="9" r="2.6" />
    <circle cx="16" cy="9" r="2.6" />
    <path d="M3.5 18a4.5 4.5 0 0 1 9 0" />
    <path d="M11.5 18a4.5 4.5 0 0 1 9 0" />
  </svg>
);

export const IconCredit = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 21V8.5L12 3l7 5.5V21" />
    <path d="M9.5 21v-5a2.5 2.5 0 0 1 5 0v5" />
    <path d="M3.5 21h17" />
  </svg>
);

export const IconSchedule = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
    <path d="M3.5 9h17M8 3v3M16 3v3" />
    <path d="M7.5 13h4M7.5 16.5h6" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconBuilding = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16" />
    <path d="M15 9h3a2 2 0 0 1 2 2v10" />
    <path d="M3 21h18" />
    <path d="M8 7h3M8 11h3M8 15h3" />
  </svg>
);

export const IconReport = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="3" width="16" height="18" rx="2.5" />
    <path d="M8.5 14v3M12 11v6M15.5 8v9" />
  </svg>
);

export const IconId = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <circle cx="8" cy="11" r="2.2" />
    <path d="M4.8 16.5a3.4 3.4 0 0 1 6.4 0" />
    <path d="M14 10h4M14 13.5h4" />
  </svg>
);

export const IconMail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const IconLocation = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const IconBriefcase = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="7" width="18" height="13" rx="2.5" />
    <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" />
    <path d="M3 12h18" />
  </svg>
);

export const IconPiggy = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 12c0-3.3 3.1-6 7-6 1.2 0 2.3.3 3.3.7L16 5l-.5 3c1 .9 1.5 2 1.5 3.2 0 .9.9 1 .9 1V15h-2.2l-1 1.6V19h-2.5v-1.5H9V19H6.5v-2.4C4 15.6 2 14 2 12Z" />
    <circle cx="7.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
