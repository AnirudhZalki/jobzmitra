import Sidebar from "@/components/Sidebar";

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-white dark:bg-dark-slate flex transition-colors">
      {/* Left Sidebar - Fixed */}
      <Sidebar />
      
      {/* Main Content - Centered */}
      <main className="flex-1 md:ml-64 flex justify-center">
        <div className="w-full max-w-[800px] min-h-screen px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
