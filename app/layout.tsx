import type { Metadata } from "next";
import "./globals.css";
import WorkspaceShell from "../components/workspace-shell";

export const metadata: Metadata = {
  title: "AI BUSINESS",
  description: "A guided business workspace for aspiring virtual assistants and business owners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><WorkspaceShell>{children}</WorkspaceShell></body></html>;
}
