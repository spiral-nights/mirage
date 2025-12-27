import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const RootLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background text-white overflow-hidden relative">
      {/* Background Blobs */}
      <div className="blob w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-vivid-magenta -top-20 md:-top-40 -left-20 md:-left-40 opacity-10" />
      <div className="blob w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-vivid-cyan -bottom-20 md:-bottom-40 -right-20 md:-right-40 opacity-10" />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card/60 border-b border-white/5 backdrop-blur-xl z-30">
        <span className="text-xl font-black vivid-text tracking-tighter">Mirage</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar - Persistent on desktop, Slide-over on mobile */}
      <div className={cn(
        "fixed inset-0 z-40 md:relative md:block transform transition-transform duration-300 ease-in-out",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        <div className="relative h-full w-64 md:w-64" onClick={(e) => mobileMenuOpen && e.stopPropagation()}>
          <Sidebar onNavItemClick={() => setMobileMenuOpen(false)} />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto relative z-10 p-6 md:p-12">
        <Outlet />
      </main>
    </div>
  );
};
