import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BLAKBOD — Blakblad RC",
  description: "The squad's social network. Find your teammates, follow the team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
