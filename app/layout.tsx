import type { Metadata } from "next";
import "./globals.css";
import Chatbot from "@/components/Chatbot";
import { CartProvider } from "@/contexts/CartContext";
import Cart from "@/components/Cart";
import { getSiteSettings } from "@/lib/siteSettings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSiteSettings();
  
  const title = settings.meta_title || "Depth and Complexity Platform";
  const description = settings.meta_description || "Professional development and learning platform";
  const keywords = settings.meta_keywords || "depth and complexity, education, professional development, learning platform";
  
  return {
    title,
    description,
    icons: {
      icon: settings.site_favicon || "/favicon.ico",
    },
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    other: {
      'keywords': keywords,
      'author': settings.company_name || '',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
          <Cart />
          <Chatbot />
        </CartProvider>
      </body>
    </html>
  );
}

