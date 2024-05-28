import ThemeRegistry from "@/app/components/ThemeRegistry/ThemeRegistry";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeRegistry>{children}</ThemeRegistry>;
}
