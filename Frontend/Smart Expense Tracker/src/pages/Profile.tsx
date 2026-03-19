import React, { useEffect, useRef, useState } from 'react';
import api from '../lib/axiosInstance';
import authService from '../lib/authService';
import { Toast } from 'primereact/toast';
import { Password } from 'primereact/password';
import { useNavigate } from 'react-router';

export default function Profile() {
  const toast = useRef<Toast | null>(null);
  const navigate = useNavigate();
  const user = authService.getUser();

  const [name, setName] = useState<string>(user?.name ?? '');
  const [email, setEmail] = useState<string>(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, []);

  const validateEmail = (e: string) => /^\S+@\S+\.\S+$/.test(e);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const updates: any = {};

    if (!name.trim()) {
      toast.current?.show({ severity: 'error', summary: 'Invalid', detail: 'Name is required' });
      return;
    }

    if (!email || !validateEmail(email)) {
      toast.current?.show({ severity: 'error', summary: 'Invalid', detail: 'Valid email is required' });
      return;
    }

    if (name !== user?.name) updates.name = name;
    if (email !== user?.email) updates.email = email;

    if (newPassword) {
      if (!currentPassword) {
        toast.current?.show({ severity: 'error', summary: 'Invalid', detail: 'Current password is required to change password' });
        return;
      }
      if (newPassword.length < 6) {
        toast.current?.show({ severity: 'error', summary: 'Invalid', detail: 'New password must be atleast 6 characters' });
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.current?.show({ severity: 'error', summary: 'Invalid', detail: 'Passwords do not match' });
        return;
      }
      updates.password = newPassword;
      updates.currentPassword = currentPassword;
    }

    if (Object.keys(updates).length === 0) {
      toast.current?.show({ severity: 'info', summary: 'No changes', detail: 'Nothing to update' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/api/user/profile', updates, { headers: { Accept: 'application/json' } });
      if (response.status === 200) {
        const payload = response.data.data ?? {};
        if (payload.emailChanged) {
          toast.current?.show({ severity: 'warn', summary: 'Email Changed', detail: 'Verification email sent. You will be logged out until verified.' });
          // logout locally and redirect to login
          await authService.logout();
          setTimeout(() => window.location.href = '/login', 1500);
          return;
        }

        const updatedUser = payload.user ?? {};
        // update local storage
        authService.setUser({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, isVerified: user?.isVerified ?? false }, authService.getAccessToken() ?? '');
        localStorage.setItem('name', updatedUser.name);
        localStorage.setItem('email', updatedUser.email);

        toast.current?.show({ severity: 'success', summary: 'Profile Updated', detail: 'Your profile has been updated' });
      }
    } catch (err: any) {
      console.error('Profile update failed', err);
      const msg = err?.response?.data?.message || err.message || 'Update failed';
      const status = err?.response?.status;
      if (status === 401) {
        toast.current?.show({ severity: 'error', summary: 'Unauthorized', detail: 'Current password incorrect or session expired' });
        await authService.logout();
        setTimeout(() => window.location.href = '/login', 1200);
        return;
      }
      if (status === 409) {
        toast.current?.show({ severity: 'error', summary: 'Email Exists', detail: 'This email is already registered' });
      } else {
        toast.current?.show({ severity: 'error', summary: 'Update Failed', detail: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen dark:bg-black bg-[#f4f6fb] p-7">
      <Toast ref={toast} />
      <form className="min-w-[40vh] lg:min-w-[60vh] p-6 rounded-lg dark:bg-black dark:border dark:border-white bg-white shadow-lg" onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold dark:text-white text-slate-900 mb-3">Update Profile</h2>

        <label className="block text-sm dark:text-white text-slate-700 mt-3">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 mt-1 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

        <label className="block text-sm dark:text-white text-slate-700 mt-3">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 mt-1 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

        <hr className="my-4" />

        <label className="block text-sm dark:text-white text-slate-700 mt-1">Current Password (required to change password)</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2.5 mt-1 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

        <label className="block text-sm dark:text-white text-slate-700 mt-3">New Password</label>
        <Password toggleMask value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} inputClassName="w-full" placeholder="Leave blank to keep current password" />

        <label className="block text-sm dark:text-white text-slate-700 mt-3">Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2.5 mt-1 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

        <div className="flex gap-2 mt-4">
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white">{loading ? 'Updating...' : 'Update Profile'}</button>
          <button type="button" onClick={async () => { await authService.logout(); window.location.href = '/login'; }} className="px-4 py-2 rounded border">Logout</button>
        </div>
      </form>
    </div>
  );
}
