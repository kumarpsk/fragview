'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { deleteArticle } from '@/app/actions/admin/articles';
import { useRouter } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTime: string;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    image: string | null;
  };
}

interface Props {
  articles: Article[];
  currentUserId?: string;
  currentUserRole?: string;
}

export default function ArticlesList({ articles, currentUserId, currentUserRole }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredArticles = articles.filter((article) => {
    if (filter === 'published' && !article.published) return false;
    if (filter === 'draft' && article.published) return false;
    if (categoryFilter !== 'all' && article.category !== categoryFilter) return false;
    return true;
  });

  const handleDelete = async (articleId: string, title: string) => {
    if (! confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    const result = await deleteArticle(articleId);
    
    if (result.success) {
      alert('✅ Article deleted successfully');
      router.refresh();
    } else {
      alert('❌ Error: ' + result.error);
    }
  };

  const categories = ['Review', 'Guide', 'News', 'Interview', 'Deep Dive', 'Industry'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1. 5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({articles.length})
              </button>
              <button
                onClick={() => setFilter('published')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'published'
                    ?  'bg-gray-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Published ({articles.filter(a => a.published).length})
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'draft'
                    ?  'bg-gray-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Drafts ({articles.filter(a => !a.published).length})
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 bg-gray-700 text-white focus:ring-gray-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No articles found</p>
            <p className="text-sm mt-1">Create your first article to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredArticles. map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {article.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">/{article.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {article.author.image ?  (
                          <img
                            src={article.author.image}
                            alt={article. author.username}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
                            {article.author.username. charAt(0). toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm text-gray-900">{article.author.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.published && article.publishedAt
                        ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
                        : formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {article.published ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/drydown/${article.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-700"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/drydown/edit/${article.id}`}
                          className="text-purple-600 hover:text-purple-700"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {(currentUserRole === 'ADMIN' || article.author.id === currentUserId) && (
                          <button
                            onClick={() => handleDelete(article.id, article.title)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}