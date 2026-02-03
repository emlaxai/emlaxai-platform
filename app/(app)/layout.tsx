import Sidebar from '@/components/Sidebar/Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen">
        <Sidebar />
        {children}
      </div>
    </SidebarProvider>
  );
}
