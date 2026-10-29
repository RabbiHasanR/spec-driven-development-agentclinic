import { MainLayout } from "@/components/layout";

// Staff pages share the site shell. Each page and action calls requireStaff();
// proxy.ts redirects signed-out visitors early.
export default function StaffLayout({ children }: LayoutProps<"/">) {
  return <MainLayout>{children}</MainLayout>;
}
