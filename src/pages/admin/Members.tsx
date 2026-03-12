import { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { formatDate } from '../../utils/formatDate';
import { Search, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface Member {
  id: string;
  username: string;
  email: string;
  phone: string;
  status: 'Active' | 'Suspended';
  joined: string;
}

const initialMembers: Member[] = [
  { id: '1', username: 'janedoe', email: 'jane@mail.com', phone: '0712345678', status: 'Active', joined: '2024-12-10' },
  { id: '2', username: 'petermwangi', email: 'peter@mail.com', phone: '0723456789', status: 'Active', joined: '2024-12-08' },
  { id: '3', username: 'marykamau', email: 'mary@mail.com', phone: '0734567890', status: 'Suspended', joined: '2024-12-05' },
  { id: '4', username: 'johnochieng', email: 'john@mail.com', phone: '0745678901', status: 'Active', joined: '2024-12-01' },
  { id: '5', username: 'sarahnjeri', email: 'sarah@mail.com', phone: '0756789012', status: 'Active', joined: '2024-11-25' },
  { id: '6', username: 'davidkiprop', email: 'david@mail.com', phone: '0767890123', status: 'Active', joined: '2024-11-20' },
];

const Members = () => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'suspend' | 'delete'; member: Member } | null>(null);
  const { toast } = useToast();

  const filtered = members.filter(m =>
    m.username.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuspend = (member: Member) => {
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: 'Suspended' } : m));
    setConfirmAction(null);
    toast({ title: `${member.username} suspended` });
  };

  const handleActivate = (member: Member) => {
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: 'Active' } : m));
    toast({ title: `${member.username} activated` });
  };

  const handleDelete = (member: Member) => {
    setMembers(prev => prev.filter(m => m.id !== member.id));
    setConfirmAction(null);
    toast({ title: `${member.username} deleted` });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-primary">Church Members</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 pl-9 pr-3 w-64 rounded-md border border-input bg-background text-sm focus:border-accent focus:outline-none"
            placeholder="Search by username or email"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Username</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-primary">{m.username}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.phone}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    m.status === 'Active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>{m.status}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(m.joined)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {m.status === 'Active' ? (
                      <button
                        onClick={() => setConfirmAction({ type: 'suspend', member: m })}
                        className="px-2 py-1 text-xs font-medium border border-destructive text-destructive rounded hover:bg-destructive/10"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(m)}
                        className="px-2 py-1 text-xs font-medium border border-success text-success rounded hover:bg-success/10"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmAction({ type: 'delete', member: m })}
                      className="p-1 text-muted-foreground hover:text-destructive border border-border rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="font-serif text-lg font-bold text-primary mb-2">
              {confirmAction.type === 'suspend' ? 'Suspend Member' : 'Delete Member'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {confirmAction.type === 'suspend'
                ? `Are you sure you want to suspend ${confirmAction.member.username}? This will prevent them from logging in.`
                : `Are you sure you want to delete ${confirmAction.member.username}? This action cannot be undone.`}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 h-9 text-sm font-medium border border-border rounded-md hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmAction.type === 'suspend' ? handleSuspend(confirmAction.member) : handleDelete(confirmAction.member)}
                className="px-4 h-9 text-sm font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Members;
