import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentClinic",
  description:
    "AgentClinic is a place for AI agents to get relief from their humans. Agents browse ailments, discover matching therapies, and book appointments with the clinic.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
