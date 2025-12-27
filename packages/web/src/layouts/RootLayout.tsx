import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const RootLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background text-white overflow-hidden relative">
      {/* Background Blobs */}
      <div className="blob w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-vivid-magenta -top-20 md:-top-40 -left-20 md:-left-40 opacity-10" />
      <div className="blob w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-vivid-cyan -bottom-20 md:-bottom-40 -right-20 md:-right-40 opacity-10" />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 flex items-center justify-between p-4 bg-card/60 border-b border-white/5 backdrop-blur-xl z-[200]">
        <span className="text-xl font-black vivid-text tracking-tighter">Mirage</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar - Persistent on desktop, Slide-over on mobile */}
      <div
        className={`fixed top-16 md:top-0 left-0 right-0 bottom-0 md:inset-0 md:relative md:block transform transition-transform duration-300 ease-in-out z-[150] ${mobileMenuOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none md:translate-x-0 md:pointer-events-auto'
          }`}
      >
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        <div className="relative h-full w-64 md:w-64">
          <Sidebar onNavItemClick={() => setMobileMenuOpen(false)} />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto relative z-10 p-6 md:p-12 pt-20 md:pt-12">
        <Outlet />
      </main>
    </div>
  );
};
