import React, { useEffect, useState } from 'react';
import { User } from '../types';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch users', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Admin Dashboard</h1>
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold">
          Total Users: {users.length}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-bottom border-slate-100">
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Level</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">XP</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    {user.picture ? (
                      <img src={user.picture} alt="" className="w-10 h-10 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-bold text-slate-900">{user.name}</span>
                  </div>
                </td>
                <td className="p-6 text-slate-600 font-medium">{user.email}</td>
                <td className="p-6">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                    {user.educationLevel}
                  </span>
                </td>
                <td className="p-6 font-black text-indigo-600">{user.points} XP</td>
                <td className="p-6 text-slate-400 text-sm">
                  {new Date(user.joinedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
