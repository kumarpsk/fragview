import { requireAdminOrEditor } from '@/lib/admin/permissions';
import { getArticles } from '@/lib/admin/articles';
import ArticlesList from '@/components/admin/ArticlesList';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'The Drydown - Articles | Admin',
};

export default async function DrydownPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string; category?: string }>;
}) {
  const session = await requireAdminOrEditor();
  
  // Check if user is ADMIN or EDITOR
  if (session. role !== 'ADMIN' && session.role !== 'EDITOR') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 mb-2">Access Denied</p>
          <p className="text-gray-600">You need EDITOR or ADMIN role to access this page. </p>
        </div>
      </div>
    );
  }

  const resolvedParams = await searchParams;
  const published = resolvedParams.published === 'true' ? true : resolvedParams.published === 'false' ? false : undefined;
  const category = resolvedParams.category;

  const articles = await getArticles({ published, category });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">The Drydown</h1>
            <p className="text-gray-600">Manage editorial articles</p>
          </div>
        </div>

        <Link
          href="/admin/drydown/new"
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Article
        </Link>
      </div>

      <ArticlesList articles={articles} currentUserId={session.id} currentUserRole={session.role} />
    </div>
  );
}