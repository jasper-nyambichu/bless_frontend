import { useState } from 'react';
import { MemberLayout } from '../../components/layout/MemberLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Pencil, Eye, EyeOff, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, changePassword, isLoading } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSaveProfile = async () => {
    await updateProfile({ username, email, phone });
    setEditing(false);
    toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (newPass.length < 6) {
      toast({ title: 'Password too short', description: 'Minimum 6 characters', variant: 'destructive' });
      return;
    }
    await changePassword(currentPass, newPass);
    toast({ title: 'Password updated', description: 'Your password has been changed.' });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const PasswordInput = ({ value, onChange, show, onToggle, placeholder }: any) => (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none"
        placeholder={placeholder}
      />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <MemberLayout>
      <h1 className="font-serif text-2xl font-bold text-primary mb-8">My Profile</h1>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Profile Info Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg font-semibold text-primary">Personal Information</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Username</label>
              {editing ? (
                <input value={username} onChange={e => setUsername(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none" />
              ) : (
                <p className="text-sm font-medium text-foreground">{user?.username}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              {editing ? (
                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none" />
              ) : (
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
              {editing ? (
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none" />
              ) : (
                <p className="text-sm font-medium text-foreground">{user?.phone}</p>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(false)} className="px-4 h-9 text-sm font-medium border border-border rounded-md hover:bg-muted">Cancel</button>
              <button onClick={handleSaveProfile} disabled={isLoading} className="px-4 h-9 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 flex items-center gap-2">
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-serif text-lg font-semibold text-primary mb-6">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Current Password</label>
              <PasswordInput value={currentPass} onChange={setCurrentPass} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} placeholder="Enter current password" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">New Password</label>
              <PasswordInput value={newPass} onChange={setNewPass} show={showNew} onToggle={() => setShowNew(!showNew)} placeholder="Enter new password" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Confirm New Password</label>
              <PasswordInput value={confirmPass} onChange={setConfirmPass} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} placeholder="Confirm new password" />
            </div>
            <button type="submit" disabled={isLoading} className="h-9 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 flex items-center gap-2">
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Update Password
            </button>
          </form>
        </div>
      </div>
    </MemberLayout>
  );
};

export default Profile;
