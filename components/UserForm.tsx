'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
  parent_user_id?: number | null;
  can_add_users: number;
}

interface UserFormProps {
  user?: User;
}

export default function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<User>({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'subscriber',
    parent_user_id: user?.parent_user_id || null,
    can_add_users: user?.can_add_users || 0,
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password for new users
    if (!user?.id && (!password || password.length < 6)) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate password for existing users if password is being changed
    if (user?.id && password && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check password match
    if ((!user?.id || password) && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const url = user?.id 
        ? `/api/admin/users/${user.id}`
        : '/api/admin/users';
      
      const method = user?.id ? 'PUT' : 'POST';

      const requestBody: any = { ...formData };
      
      // Only include password if it's provided (for new users or password reset)
      if (password && password.trim() !== '') {
        requestBody.password = password;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save user');
        setLoading(false);
        return;
      }

      router.push('/admin/users');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#1d2327] mb-2">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1d2327] mb-2">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1]"
          />
        </div>

        {!user?.id ? (
          <>
            <div>
              <label className="block text-sm font-medium text-[#1d2327] mb-2">
                Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!user?.id}
                className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d2327] mb-2">
                Confirm Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!user?.id}
                className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1]"
              />
            </div>
          </>
        ) : (
          <div className="border-t border-[#c3c4c7] pt-6">
            <h3 className="text-base font-semibold text-[#1d2327] mb-2">Reset Password</h3>
            <p className="text-sm text-[#646970] mb-4">Leave blank to keep current password, or enter a new password to reset it.</p>
            <div>
              <label className="block text-sm font-medium text-[#1d2327] mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1]"
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            {password && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-[#1d2327] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1]"
                  placeholder="Confirm new password"
                />
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#1d2327] mb-2">
            Role <span className="text-red-600">*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
            className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1]"
          >
            <option value="subscriber">Subscriber</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="can_add_users"
            checked={formData.can_add_users === 1}
            onChange={(e) => setFormData({ ...formData, can_add_users: e.target.checked ? 1 : 0 })}
            className="h-4 w-4 text-[#2271b1] focus:ring-[#2271b1] border-[#8c8f94] rounded"
          />
          <label htmlFor="can_add_users" className="ml-2 block text-sm text-[#1d2327]">
            Can Add Users (allows this user to add users under them)
          </label>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#2271b1] text-white px-4 py-2 rounded-sm hover:bg-[#135e96] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-normal text-sm"
          >
            {loading ? 'Saving...' : user?.id ? 'Update User' : 'Create User'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/users')}
            className="px-4 py-2 border border-[#c3c4c7] rounded-sm hover:bg-[#f6f7f7] transition-colors text-sm text-[#1d2327]"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

