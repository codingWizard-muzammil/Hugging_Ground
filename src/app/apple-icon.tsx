import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2563eb",
        }}
      >
        <svg width="124" height="124" viewBox="0 0 32 32" fill="none">
          <path
            d="M9.5 12.5C9.5 9.5 12 8 14.5 9.5C16 10.4 16 13 16 13C16 13 16 10.4 17.5 9.5C20 8 22.5 9.5 22.5 12.5C22.5 17 17 21 16 21.7C15 21 9.5 17 9.5 12.5Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
