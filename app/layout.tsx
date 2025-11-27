import type { Metadata } from "next";
import "./globals.css";
import Chatbot from "@/components/Chatbot";
import { CartProvider } from "@/contexts/CartContext";
import Cart from "@/components/Cart";

export const metadata: Metadata = {
  title: "Depth and Complexity Platform",
  description: "Professional development and learning platform",
};

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

