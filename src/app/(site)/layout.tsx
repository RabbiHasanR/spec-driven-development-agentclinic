import { MainLayout } from "@/components/layout";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <MainLayout>{children}</MainLayout>;
}
