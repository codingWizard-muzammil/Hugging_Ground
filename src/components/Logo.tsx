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
      <rect width="32" height="32" rx="9" fill="#2563eb" />
      {/* face */}
      <circle cx="16" cy="13" r="8.3" fill="white" fillOpacity="0.95" />
      {/* closed, smiling eyes */}
      <path
        d="M12 11.5Q13.4 9.8 14.8 11.5M17.2 11.5Q18.6 9.8 20 11.5"
        stroke="#2563eb"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* hugging hands */}
      <path
        d="M7.5 19C7 16.5 9 14.5 11.5 15C13.5 15.4 14.3 17.3 13.8 19.3C13.2 21.6 10.5 22.8 8.8 21.5C7.8 20.7 7.5 20 7.5 19Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M24.5 19C25 16.5 23 14.5 20.5 15C18.5 15.4 17.7 17.3 18.2 19.3C18.8 21.6 21.5 22.8 23.2 21.5C24.2 20.7 24.5 20 24.5 19Z"
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
