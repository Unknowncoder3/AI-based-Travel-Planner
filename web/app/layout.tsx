import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roamly — Find your kind of elsewhere",
  description: "Discover destinations, hidden gems, local food and experiences, then turn them into a personal travel plan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
