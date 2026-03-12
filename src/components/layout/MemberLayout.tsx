import { MemberSidebar } from './MemberSidebar';

export const MemberLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <MemberSidebar />
      <main className="ml-60 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
};
