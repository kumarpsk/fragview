'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Search, Shield, User, Mail, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface UserItem {
  id: string;
  username: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: Date;
  experiencePoints: number;
  _count: {
    reviews: number;
    wardrobe: number;
  };
}

interface Props {
  users: UserItem[];
  total: number;
  currentPage: number;
}

export default function UsersListClient({ users, total, currentPage }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const totalPages = Math.ceil(total / 50);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (roleFilter !== 'all') params.set('role', roleFilter);
    params.set('page', '1');
    router.push(`/admin/users? ${params. toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page. toString());
    router.push(`/admin/users?${params. toString()}`);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'MODERATOR':
        return 'bg-amber-50 text-amber-800 border border-amber-200';
      case 'EDITOR':
        return 'bg-rose-50 text-rose-800 border border-rose-200';
      default:
        return 'bg-[#F9F7F5] text-[#4A4946] border border-[#E2E1E1]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] p-5 shadow-sm max-md:p-2">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px] ">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#737270]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by username or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-[#E2E1E1] rounded-xl font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border border-[#E2E1E1] rounded-xl font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
          >
            <option value="all">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="MODERATOR">Moderator</option>
            <option value="EDITOR">Editor</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-lime-700 text-white font-[var(--font-inter)] font-medium rounded-xl hover:bg-lime-800 transition-colors shadow-sm"
          >
            Search
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9F7F5] border-b border-[#E2E1E1]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-[var(--font-inter)] font-semibold text-[#4A4946] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-[var(--font-inter)] font-semibold text-[#4A4946] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-[var(--font-inter)] font-semibold text-[#4A4946] uppercase tracking-wider">
                  XP
                </th>
                <th className="px-6 py-4 text-left text-xs font-[var(--font-inter)] font-semibold text-[#4A4946] uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-4 text-left text-xs font-[var(--font-inter)] font-semibold text-[#4A4946] uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs font-[var(--font-inter)] font-semibold text-[#4A4946] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E1E1]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#F9F7F5]/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-400 to-amber-400 flex items-center justify-center text-white font-[var(--font-inter)] font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-[var(--font-inter)] font-semibold text-[#211F1C]">{user.username}</p>
                        <p className="text-sm font-[var(--font-inter)] text-[#4A4946] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-[var(--font-inter)] font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-[var(--font-inter)] font-medium text-[#211F1C]">
                      {user.experiencePoints} XP
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-[var(--font-inter)] text-[#4A4946]">
                      <p>{user._count.reviews} reviews</p>
                      <p>{user._count.wardrobe} wardrobe items</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-[var(--font-inter)] text-[#4A4946]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link
                      href={`/admin/users/${user.username}`}
                      className="text-lime-700 hover:text-lime-800 font-[var(--font-inter)] font-medium text-sm transition-colors"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] p-5 shadow-sm">
          <p className="text-sm font-[var(--font-inter)] text-[#4A4946]">
            Showing page {currentPage} of {totalPages} ({total} total users)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-[#E2E1E1] rounded-xl text-sm font-[var(--font-inter)] font-medium text-[#211F1C] hover:bg-[#F9F7F5] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-[#E2E1E1] rounded-xl text-sm font-[var(--font-inter)] font-medium text-[#211F1C] hover:bg-[#F9F7F5] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}