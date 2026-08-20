import { LogoMark } from "@/components/Logo";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <LogoMark />
    ),
    { ...size }
  );
}
