



export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="bg-blue-700 text-white p-4 shadow-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex items-center justify-center font-bold text-lg tracking-wide">
            Kuesioner Kepuasan Layanan GA
          </div>
        </header>
        <main className="max-w-5xl mx-auto w-full flex-grow p-4 sm:p-6 lg:p-8 bg-white shadow-sm min-h-[calc(100vh-60px)]">
          {children}
        </main>
      </div>
  );
}
