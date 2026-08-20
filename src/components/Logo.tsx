export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="hg-logo-grad" x1="2" y1="4" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="0.55" stopColor="#fb7185" />
          <stop offset="1" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#hg-logo-grad)" />
      <path
        d="M9.5 12.5C9.5 9.5 12 8 14.5 9.5C16 10.4 16 13 16 13C16 13 16 10.4 17.5 9.5C20 8 22.5 9.5 22.5 12.5C22.5 17 17 21 16 21.7C15 21 9.5 17 9.5 12.5Z"
        fill="white"
        fillOpacity="0.95"
      />
    </svg>
  );
}

export function Logo({ size = 28, showWordmark = true }: { size?: number; showWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      {showWordmark && (
        <span className="text-[17px] font-semibold tracking-tight text-fg">
          Hugging Ground
        </span>
      )}
    </div>
  );
}
