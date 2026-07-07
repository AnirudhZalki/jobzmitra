import Sidebar from "@/components/Sidebar";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-white dark:bg-dark-slate flex transition-colors">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex justify-center">
        <div className="w-full max-w-[800px] min-h-screen p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
