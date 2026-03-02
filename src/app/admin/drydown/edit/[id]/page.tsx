import { requireAdminOrEditor } from '@/lib/admin/permissions';
import { getArticleById } from '@/lib/admin/articles';
import ArticleEditor from '@/components/admin/ArticleEditor';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Edit Article - The Drydown | Admin',
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminOrEditor();
  
  // Check if user is ADMIN or EDITOR
  if (session.role !== 'ADMIN' && session.role !== 'EDITOR') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 mb-2">Access Denied</p>
          <p className="text-gray-600">You need EDITOR or ADMIN role to edit articles.</p>
        </div>
      </div>
    );
  }

  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  // Check if user is the author or admin
  if (article.authorId !== session.id && session. role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 mb-2">Access Denied</p>
          <p className="text-gray-600">You can only edit your own articles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/drydown"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
          <p className="text-gray-600">{article.title}</p>
        </div>
      </div>

      <ArticleEditor mode="edit" article={article} />
    </div>
  );
}