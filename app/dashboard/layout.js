import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import SessionLayout from "./SessionLayout";
import MobileNavWrapper from "./MobileNavWrapper";

export default async function DashboardLayout({children}) {
    const session = await getServerSession(authOptions)
    console.log('Current user session:', session)

    if (!session) {
        redirect('/login')
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
            <SidebarInset className='p-4'>
              <Toaster />
              {children}
            </SidebarInset>
            <MobileNavWrapper />
          </SidebarProvider>
        </SessionLayout>
    )
}