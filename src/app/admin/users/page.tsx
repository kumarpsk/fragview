import { requireAdmin } from '@/lib/admin/permissions';
import { getUsers } from '@/lib/admin/users';
import UsersListClient from '@/components/admin/UsersListClient';
import { Users } from 'lucide-react';

export const metadata = {
  title: 'User Management | Admin',
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>;
}) {
  await requireAdmin();
  
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams. page || '1');
  const search = resolvedParams.search || '';
  const roleFilter = resolvedParams.role || 'all';

  const { users, total } = await getUsers({ search, role: roleFilter, page, limit: 50 });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-lime-100 rounded-2xl flex items-center justify-center border border-lime-200/50">
            <Users className="w-7 h-7 text-lime-700" />
          </div>
          <div>
            <h1 className="font-hedvig text-[28px] sm:text-[32px] lg:text-[36px] leading-tight text-[#211F1C]">
              User Management
            </h1>
            <p className="font-[var(--font-inter)] text-sm sm:text-base text-[#4A4946] mt-1">
              Manage users, roles, and permissions
            </p>
          </div>
        </div>
      </div>

      <UsersListClient users={users} total={total} currentPage={page} />
    </div>
  );
}