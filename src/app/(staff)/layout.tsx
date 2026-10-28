import { MainLayout } from "@/components/layout";

// Staff pages share the site shell; this group is where auth would go later.
export default function StaffLayout({ children }: LayoutProps<"/">) {
  return <MainLayout>{children}</MainLayout>;
}
