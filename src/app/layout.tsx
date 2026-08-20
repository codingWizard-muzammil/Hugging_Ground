import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ApiKeyProvider } from "@/context/api-key-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hugging Ground — a playground for every Hugging Face model",
  description:
    "Bring your own Hugging Face API key and play with any model on the Hub — chat, images, audio, and more. No login, no signup, streamed live in your browser.",
};

const THEME_INIT_SCRIPT = `
try {
  var stored = localStorage.getItem("hg:theme");
  var isDark = stored ? stored === "dark" : true;
  document.documentElement.classList.toggle("dark", isDark);
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="h-dvh flex flex-col overflow-hidden bg-bg text-fg">
        <ApiKeyProvider>{children}</ApiKeyProvider>
      </body>
    </html>
  );
}
