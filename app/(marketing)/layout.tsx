import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function MarketingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black">
        {children}
      </main>
      <Footer />
    </>
  );
}
