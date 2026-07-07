import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import BottomNav from "@/components/BottomNav";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-white dark:bg-dark-slate flex transition-colors">
      {/* Left Sidebar - Fixed, desktop only */}
      <Sidebar />
      
      {/* Main Content - Centered */}
      <main className="flex-1 md:ml-64 flex justify-center pb-16 md:pb-0">
        <div className="w-full max-w-[600px] min-h-screen">
          {children}
        </div>
      </main>

      {/* Right Sidebar - Sticky, large screens only */}
      <RightSidebar />

      {/* Bottom Nav - Mobile only */}
      <BottomNav />
    </div>
  );
}
