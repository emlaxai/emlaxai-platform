import Sidebar from '@/components/Sidebar/Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ExaChatProvider } from '@/contexts/ExaChatContext';
import { QueryClientProvider } from '@/lib/query-client';

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider>
      <SidebarProvider>
        <ExaChatProvider>
          <div className="relative min-h-screen">
            <Sidebar />
            {children}
          </div>
        </ExaChatProvider>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
