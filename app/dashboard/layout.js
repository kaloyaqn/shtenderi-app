import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import SessionLayout from "./SessionLayout";
import MobileNavWrapper from "./MobileNavWrapper";
import { ErrorBoundary } from "@/components/error-boundary";
import AnnouncementModal from "@/components/announcements/NewDesign";
import VersionBanner from "@/components/version-banner";
import PageHelpTour from "@/components/help/PageHelpTour";


export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  console.log("Current user session:", session);

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionLayout session={session}>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        }}
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="md:p-4 p-1 pb-4">
          
          <Toaster position="top-center" />
          {/* <AnnouncementModal /> */}
          <ErrorBoundary>
            <div className="md:pb-0 pb-[84px]">

            {children}
            </div>
          </ErrorBoundary>
        </SidebarInset>
        <MobileNavWrapper />

        
        <VersionBanner /> 

      </SidebarProvider>
    </SessionLayout>
  );
}
