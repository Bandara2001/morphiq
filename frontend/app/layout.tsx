import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morphiq | Explore Biology Beyond Dimensions",
  description:
    "Discover biology through interactive 3D models, AI-powered explanations and intelligent learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}