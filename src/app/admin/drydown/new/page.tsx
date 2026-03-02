import {  requireAdminOrEditor } from '@/lib/admin/permissions';
import ArticleEditor from '@/components/admin/ArticleEditor';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'New Article - The Drydown | Admin',
};

export default async function NewArticlePage() {
  const session = await requireAdminOrEditor();
  
  // Check if user is ADMIN or EDITOR
  if (session.role !== 'ADMIN' && session.role !== 'EDITOR') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 mb-2">Access Denied</p>
          <p className="text-gray-600">You need EDITOR or ADMIN role to create articles. </p>
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
          <p className="text-gray-600">Write and publish editorial content for The Drydown</p>
        </div>
      </div>

      <ArticleEditor mode="create" />
    </div>
  );
}