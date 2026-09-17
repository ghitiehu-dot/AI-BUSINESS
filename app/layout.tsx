import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"AI BUSINESS",description:"A guided workspace for aspiring virtual assistants."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
