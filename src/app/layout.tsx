import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const metadata: Metadata = {
  title: "متابعة الإنجاز الإنشائي - عرض",
  description: "نظام عرض متابعة إنجاز الأعمال الإنشائية",
  icons: { icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-foreground`}>
        {children}<Toaster />
      </body>
    </html>
  );
}