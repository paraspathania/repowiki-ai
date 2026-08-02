import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "RepoWiki AI — Transform Repositories into Navigable Technical Knowledge",
  description: "AI-powered repository understanding platform. Structural analysis, technical Wiki, architecture diagrams, and grounded AI exploration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-accent/30">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
