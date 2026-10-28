import type { Metadata, Viewport } from "next";
import { SITE } from "@/lib/site";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: SITE.name,
  description: SITE.description,
};

// Next.js already emits width=device-width, initial-scale=1; never disable zoom.
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0fdfa" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
