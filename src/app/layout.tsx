import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "MedRylo — Pharmacy Management Platform",
    template: "%s | MedRylo",
  },
  description:
    "Modern pharmacy management platform for medicine inventory, suppliers, invoices, and more. MedRylo is a smart pharmacy management platform that helps pharmacies organize medicines, track inventory, manage sales, handle purchases, and control daily operations from one system",
  keywords: ["pharmacy", "medicine", "inventory", "management", "medrylo"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
         <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="bottom-right"
              richColors
              expand
              closeButton
              toastOptions={{
                duration: 4000,
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
