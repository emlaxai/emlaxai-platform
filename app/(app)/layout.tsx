import Sidebar from '@/components/Sidebar/Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ExaChatProvider } from '@/contexts/ExaChatContext';

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ExaChatProvider>
        <div className="relative min-h-screen">
          <Sidebar />
          {children}
        </div>
      </ExaChatProvider>
    </SidebarProvider>
  );
}
