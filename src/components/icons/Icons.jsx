export function IconTray({ color = '#1F2A44', size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="9" width="24" height="17" rx="3" fill={color} opacity="0.14" />
      <path d="M5 9.5A2.5 2.5 0 0 1 7.5 7h17A2.5 2.5 0 0 1 27 9.5V15h-6.2a1 1 0 0 0-.85.47l-1.1 1.75a1 1 0 0 1-.85.48h-4a1 1 0 0 1-.85-.48l-1.1-1.75A1 1 0 0 0 11.2 15H5V9.5Z" fill={color} />
      <rect x="5" y="15" width="22" height="10.5" rx="2.4" fill={color} opacity="0.9" />
    </svg>
  );
}
export function IconApplied({ color = '#6B84A3', size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="3" y="8" width="20" height="15" rx="2.5" fill={color} opacity="0.9" />
      <path d="M4 9l9 6.5L22 9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
export function IconHourglass({ color = '#C98A2E', size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="8" y="5" width="16" height="3" rx="1.4" fill={color} />
      <rect x="8" y="24" width="16" height="3" rx="1.4" fill={color} />
      <path d="M10 8h12c0 5-4.2 6.6-4.2 8s4.2 3 4.2 8H10c0-5 4.2-6.6 4.2-8S10 13 10 8Z" fill={color} opacity="0.85" />
    </svg>
  );
}
export function IconInterview({ color = '#6B5FA3', size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="5" y="6" width="22" height="20" rx="3" fill={color} opacity="0.15" />
      <rect x="5" y="6" width="22" height="6" rx="3" fill={color} />
      <circle cx="16" cy="19" r="4.2" fill={color} />
      <path d="M14.3 19l1.2 1.2 2.2-2.4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
export function IconBadgeCheck({ color = '#4C8B57', size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="9.5" fill={color} />
      <path d="M11.8 16.3l2.6 2.6 5.3-5.6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
export function IconBadgeX({ color = '#B85C50', size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="9.5" fill={color} />
      <path d="M13 13l6 6M19 13l-6 6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}
export function IconEnvelopePlus({ color = '#6B84A3', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="3" y="8" width="20" height="15" rx="2.5" fill={color} opacity="0.9" />
      <path d="M4 9l9 6.5L22 9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="25" cy="21" r="6.4" fill="#fff" />
      <circle cx="25" cy="21" r="6.4" fill={color} opacity="0.18" />
      <path d="M25 17.6v6.8M21.6 21h6.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
export function IconTrashFlat({ color = '#B85C50', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="9" y="12" width="14" height="14" rx="2" fill={color} opacity="0.85" />
      <rect x="7" y="8.5" width="18" height="3" rx="1.4" fill={color} />
      <rect x="12.5" y="5" width="7" height="3" rx="1.3" fill={color} />
      <path d="M13.5 15.5v7M18.5 15.5v7" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
export function IconBadgePencil({ color = '#C98A2E', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12.5" fill={color} opacity="0.16" />
      <path d="M12 20.5l1-4L20.2 9.3a1.4 1.4 0 0 1 2 0l.5.5a1.4 1.4 0 0 1 0 2L15.5 19l-4 1.5Z" fill={color} />
    </svg>
  );
}
export function IconCalendar({ color = '#6B5FA3', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="5" y="6" width="22" height="20" rx="3" fill={color} opacity="0.15" />
      <rect x="5" y="6" width="22" height="6" rx="3" fill={color} />
      <rect x="10" y="16" width="4" height="4" rx="1" fill={color} />
      <rect x="18" y="16" width="4" height="4" rx="1" fill={color} />
    </svg>
  );
}
export function IconAi({ color = '#6B5FA3', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12.5" fill={color} opacity="0.16" />
      <path d="M16 8l1.8 4.2L22 14l-4.2 1.8L16 20l-1.8-4.2L10 14l4.2-1.8L16 8Z" fill={color} />
    </svg>
  );
}

export function IconWallet({ color = '#1F2A44', size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="8" width="24" height="18" rx="3" fill={color} opacity="0.14" />
      <path d="M4 11.5A3.5 3.5 0 0 1 7.5 8h17A3.5 3.5 0 0 1 28 11.5V13H4v-1.5Z" fill={color} />
      <rect x="4" y="13" width="24" height="13" rx="2.5" fill={color} opacity="0.9" />
      <circle cx="21.5" cy="19.5" r="2.4" fill="#fff" />
    </svg>
  );
}
export function IconBank({ color = '#1F2A44', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4l12 6.5H4L16 4Z" fill={color} />
      <rect x="6" y="12" width="4" height="12" rx="1" fill={color} opacity="0.85" />
      <rect x="14" y="12" width="4" height="12" rx="1" fill={color} opacity="0.85" />
      <rect x="22" y="12" width="4" height="12" rx="1" fill={color} opacity="0.85" />
      <rect x="4" y="25.5" width="24" height="3" rx="1.2" fill={color} />
    </svg>
  );
}
export function IconTarget({ color = '#4C8B57', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="11" fill={color} opacity="0.15" />
      <circle cx="16" cy="16" r="7.5" fill={color} opacity="0.3" />
      <circle cx="16" cy="16" r="4" fill={color} />
    </svg>
  );
}
export function IconCopy({ color = '#5B6478', size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.3" stroke={color} strokeWidth="1.3" />
      <path d="M3 10.5V3.8A1.3 1.3 0 0 1 4.3 2.5h6.7" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
export function IconTrendDown({ color = '#B85C50', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M6 10l7 7 4-4 9 9" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M20 22h6v-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export const TOAST_ICONS = {
  added: IconEnvelopePlus,
  updated: IconBadgePencil,
  deleted: IconTrashFlat,
  accepted: IconBadgeCheck,
  rejected: IconBadgeX,
  interview: IconInterview,
};
