import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function IconSend(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12L20 4L14 20L11 13L4 12Z" />
      <path d="M11 13L15.5 8.5" />
    </svg>
  );
}

export function IconPaperclip(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M18.5 12.5L11 20a4.2 4.2 0 0 1-6-6l8-8a2.8 2.8 0 0 1 4 4l-7.6 7.6a1.4 1.4 0 0 1-2-2L14.5 8.5" />
    </svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6L18 18M18 6L6 18" />
    </svg>
  );
}

export function IconKey(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12L20 3M20 3H16M20 3V7" />
    </svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2V4M12 20V22M4 12H2M22 12H20M5 5L6.5 6.5M18.5 6.5L20 5M5 19L6.5 17.5M18.5 17.5L20 19" />
    </svg>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 9L12 15L18 9" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21L16.5 16.5" />
    </svg>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 13L9.5 17.5L19 7" />
    </svg>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7H20M9 7V4.8C9 4.36 9.36 4 9.8 4H14.2C14.64 4 15 4.36 15 4.8V7M18 7L17.3 19.2C17.26 19.9 16.68 20.5 15.98 20.5H8.02C7.32 20.5 6.74 19.9 6.7 19.2L6 7" />
    </svg>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3V15M12 15L7 10M12 15L17 10" />
      <path d="M4 19H20" />
    </svg>
  );
}

export function IconLoader(props: IconProps) {
  return (
    <svg {...base(props)} className={`animate-spin ${props.className ?? ""}`}>
      <path d="M12 3A9 9 0 1 0 21 12" />
    </svg>
  );
}

export function IconSparkles(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3L13.6 8.4L19 10L13.6 11.6L12 17L10.4 11.6L5 10L10.4 8.4L12 3Z" />
      <path d="M19 15L19.8 17.2L22 18L19.8 18.8L19 21L18.2 18.8L16 18L18.2 17.2L19 15Z" />
    </svg>
  );
}

export function IconImage(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16L16 11L5 20" />
    </svg>
  );
}

export function IconMic(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18V21M9 21H15" />
    </svg>
  );
}

export function IconAlertTriangle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4L22 20H2L12 4Z" />
      <path d="M12 10V14.5" />
      <circle cx="12" cy="17.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function IconExternalLink(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 6H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4" />
      <path d="M14 4H20V10M20 4L11 13" />
    </svg>
  );
}

export function IconFile(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3H13L18 8V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M13 3V8H18" />
    </svg>
  );
}

export function IconAudio(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 10V14M8 7V17M12 4V20M16 8V16M20 11V13" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5V19M5 12H19" />
    </svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2 12S5.5 5 12 5S22 12 22 12S18.5 19 12 19S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconHelpCircle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.2C9.5 7.5 10.6 6.5 12 6.5C13.4 6.5 14.5 7.4 14.5 8.7C14.5 10.7 12 10.5 12 13" />
      <circle cx="12" cy="16.3" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function IconWand(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20L15 9" />
      <path d="M13 3L13.6 5.4L16 6L13.6 6.6L13 9L12.4 6.6L10 6L12.4 5.4L13 3Z" />
      <path d="M19 12L19.5 13.7L21.2 14.2L19.5 14.7L19 16.4L18.5 14.7L16.8 14.2L18.5 13.7L19 12Z" />
    </svg>
  );
}

export function IconActivity(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12H7L9.5 5L14.5 19L17 12H21" />
    </svg>
  );
}

export function IconEyeOff(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 3L21 21" />
      <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5C18.5 5 22 12 22 12A19.4 19.4 0 0 1 17.9 17M6.1 6.9A19.4 19.4 0 0 0 2 12S5.5 19 12 19A10.6 10.6 0 0 0 15 18.5" />
      <path d="M9.9 9.9A3 3 0 0 0 14.1 14.1" />
    </svg>
  );
}
