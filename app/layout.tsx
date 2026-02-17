import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YTCurious",
  description: "AI copilot for YouTube creators to plan better videos faster."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem('ytcurious-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = stored || (prefersDark ? 'dark' : 'light');
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');
                } catch (e) {}
              })();
            `
          }}
        />
        {children}
      </body>
    </html>
  );
}
