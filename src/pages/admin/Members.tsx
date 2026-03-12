import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { formatDate } from '../../utils/formatDate';
import { Search, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';

interface Member {
  _id: string;
  username: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // tracks which member id is being actioned
  const [confirmAction, setConfirmAction] = useState<{ type: 'suspend' | 'delete'; member: Member } | null>(null);
  const { toast } = useToast();

  // fetch all members on mount
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/members');
      setMembers(data.members ?? []);
    } catch (err: any) {
      toast({
        title: 'Failed to load members',
        description: err?.response?.data?.message ?? 'Could not fetch members from server.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = members.filter(m =>
    m.username.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuspend = async (member: Member) => {
    try {
      setActionLoading(member._id);
      await api.patch(`/admin/members/${member._id}/suspend`);
      setMembers(prev => prev.map(m => m._id === member._id ? { ...m, status: 'suspended' } : m));
      toast({ title: `${member.username} has been suspended` });
    } catch (err: any) {
      toast({
        title: 'Action failed',
        description: err?.response?.data?.message ?? 'Could not suspend member.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const handleActivate = async (member: Member) => {
    try {
      setActionLoading(member._id);
      await api.patch(`/admin/members/${member._id}/activate`);
      setMembers(prev => prev.map(m => m._id === member._id ? { ...m, status: 'active' } : m));
      toast({ title: `${member.username} has been activated` });
    } catch (err: any) {
      toast({
        title: 'Action failed',
        description: err?.response?.data?.message ?? 'Could not activate member.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (member: Member) => {
    try {
      setActionLoading(member._id);
      await api.delete(`/admin/members/${member._id}`);
      setMembers(prev => prev.filter(m => m._id !== member._id));
      toast({ title: `${member.username} has been deleted` });
    } catch (err: any) {
      toast({
        title: 'Action failed',
        description: err?.response?.data?.message ?? 'Could not delete member.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
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
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">
            {search ? 'No members match your search' : 'No members found'}
          </p>
        ) : (
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
                <tr key={m._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-primary">{m.username}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                      m.status === 'active'
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(m.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      {actionLoading === m._id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          {m.status === 'active' ? (
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
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
                ? `Are you sure you want to suspend ${confirmAction.member.username}? They will not be able to log in.`
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
                onClick={() => confirmAction.type === 'suspend'
                  ? handleSuspend(confirmAction.member)
                  : handleDelete(confirmAction.member)
                }
                className="px-4 h-9 text-sm font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 flex items-center gap-2"
              >
                {actionLoading === confirmAction.member._id && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
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