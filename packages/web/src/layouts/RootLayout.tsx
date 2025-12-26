import { Sidebar } from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

export const RootLayout = () => {
  return (
    <div className="flex h-screen w-full bg-[#0F0F13] text-white overflow-hidden relative">
      {/* Background Blobs */}
      <div className="blob w-[600px] h-[600px] bg-accent-primary -top-40 -left-40" />
      <div className="blob w-[500px] h-[500px] bg-accent-secondary -bottom-40 -right-40" />
      
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto relative z-10 p-12">
        <Outlet />
      </main>
    </div>
  );
};
