import { AdminSidebar } from './AdminSidebar';

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-60 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
};
