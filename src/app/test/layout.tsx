import ThemeRegistry from "@/app/components/ThemeRegistry/ThemeRegistry";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeRegistry>{children}</ThemeRegistry>;
}
