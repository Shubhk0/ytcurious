import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YTCurious",
  description: "AI copilot for YouTube creators to plan better videos faster."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
