import type { ReactNode } from "react";

import "./globals.css";

export const metadata = {
  title: "BetAgent",
  description: "BetAgent dashboard scaffold",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
