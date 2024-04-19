import ThemeRegistry from "@/app/components/ThemeRegistry/ThemeRegistry";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeRegistry>{children}</ThemeRegistry>;
}
