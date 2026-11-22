import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maatram VolunteerHub",
  description: "Multi-role volunteer coordination and approval portal for Maatram Foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F5F2] text-[#1F1624] antialiased">
        {children}
      </body>
    </html>
  );
}
