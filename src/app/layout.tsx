import "./globals.css";
import AccountProvider from "@/context/AccountContext";
import NostrProvider from "@/context/NostrContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AKA Profiles",
  description: "Access without identity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NostrProvider>
          <AccountProvider>{children}</AccountProvider>
        </NostrProvider>
      </body>
    </html>
  );
}
