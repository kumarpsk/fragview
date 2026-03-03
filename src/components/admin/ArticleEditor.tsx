'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createArticle, updateArticle } from '@/app/actions/admin/articles';
import { generateSlug, calculateReadTime } from '@/lib/utils/article-utils';
import { Save, Eye, Loader2, X, Search, Plus } from 'lucide-react';
import ImageUploadComponent from './ImageUploadComponent';
import dynamic from 'next/dynamic';

// Import TipTap editor dynamically (client-side only)
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />,
});

interface Props {
  mode: 'create' | 'edit';
  article?: any;
}

const categories = ['Review', 'Guide', 'News', 'Interview', 'Deep Dive', 'Industry'];

export default function ArticleEditor({ mode, article }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    coverImage: article?.coverImage || '',
    category: article?.category || 'Guide',
    mentionedPerfumes: article?.mentionedPerfumes || [],
    published: article?.published || false,
  });

  const [perfumeSearch, setPerfumeSearch] = useState('');
  const [perfumeResults, setPerfumeResults] = useState<any[]>([]);
  const [searchingPerfumes, setSearchingPerfumes] = useState(false);

  // Auto-generate slug when title changes (only in create mode)
  useEffect(() => {
    if (mode === 'create' && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title),
      }));
    }
  }, [formData.title, mode]);

  // Search perfumes for sidebar
  const handlePerfumeSearch = async () => {
    if (!perfumeSearch.trim()) return;

    setSearchingPerfumes(true);
    try {
      const response = await fetch(`/api/search? q=${encodeURIComponent(perfumeSearch)}&limit=10`);
      const data = await response.json();
      setPerfumeResults(data. results || []);
    } catch (error) {
      console. error('Perfume search failed:', error);
    } finally {
      setSearchingPerfumes(false);
    }
  };

  const addPerfume = (perfumeSlug: string) => {
    if (!formData.mentionedPerfumes.includes(perfumeSlug)) {
      setFormData({
        ...formData,
        mentionedPerfumes: [... formData.mentionedPerfumes, perfumeSlug],
      });
    }
    setPerfumeSearch('');
    setPerfumeResults([]);
  };

  const removePerfume = (perfumeSlug: string) => {
    setFormData({
      ... formData,
      mentionedPerfumes: formData.mentionedPerfumes.filter((s) => s !== perfumeSlug),
    });
  };

  const handleSave = async (publish: boolean) => {
    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content || !formData.coverImage) {
      alert('Please fill in all required fields (Title, Slug, Excerpt, Content, and Cover Image)');
      return;
    }

    setLoading(true);

    const readTime = calculateReadTime(formData. content);

    const articleData = {
      ...formData,
      readTime,
      published: publish,
    };

    let result;
    if (mode === 'create') {
      result = await createArticle(articleData);
    } else {
      result = await updateArticle(article. id, articleData);
    }

    setLoading(false);

    if (result. success) {
      alert(`✅ Article ${publish ? 'published' : 'saved as draft'} successfully! `);
      router.push('/admin/drydown');
    } else {
      alert('❌ Error: ' + result.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Eye className="w-4 h-4" />
          {previewMode ? 'Edit Mode' : 'Preview'}
        </button>
      </div>

      {previewMode ?  (
        /* Preview Mode */
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="max-w-4xl mx-auto">
            {formData.coverImage && (
              <img
                src={formData.coverImage}
                alt={formData.title}
                className="w-full h-[400px] object-cover rounded-xl mb-6"
              />
            )}
            <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase tracking-widest rounded-md mb-4">
              {formData.category}
            </span>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              {formData.title || 'Article Title'}
            </h1>
            <p className="text-xl text-gray-600 italic mb-8 border-l-4 border-orange-400 pl-4">
              {formData.excerpt || 'Article excerpt will appear here...'}
            </p>
            <div
              className="prose prose-lg prose-green max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData. title}
                  onChange={(e) => setFormData({ ...formData, title: e. target.value })}
                  className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Enter article title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug * <span className="text-xs text-gray-500">(URL-friendly)</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent font-mono text-sm"
                  placeholder="article-slug"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be: /drydown/{formData.slug || 'article-slug'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt * <span className="text-xs text-gray-500">(1-2 sentences)</span>
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Short description of the article..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e. target.value })}
                  className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content *
              </label>
              <RichTextEditor
                content={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Cover Image *</h3>
              <ImageUploadComponent
                currentImage={formData.coverImage}
                onImageUpload={(url) => setFormData({ ...formData, coverImage: url })}
                label="Upload Cover Image"
              />
            </div>

            {/* Mentioned Perfumes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Mentioned Perfumes</h3>
              <p className="text-xs text-gray-500 mb-4">
                These will appear in the sidebar when viewing the article
              </p>

              {/* Search */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={perfumeSearch}
                  onChange={(e) => setPerfumeSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePerfumeSearch()}
                  placeholder="Search perfumes..."
                  className="flex-1 px-3 py-2 bg-white text-black border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
                <button
                  onClick={handlePerfumeSearch}
                  disabled={searchingPerfumes}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {searchingPerfumes ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Search Results */}
              {perfumeResults.length > 0 && (
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {perfumeResults. map((perfume) => (
                    <div
                      key={perfume.slug}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => addPerfume(perfume.slug)}
                    >
                      {perfume.image && (
                        <img
                          src={perfume.image}
                          alt={perfume.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {perfume.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{perfume.brand}</p>
                      </div>
                      <Plus className="w-4 h-4 text-gray-600" />
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Perfumes */}
              <div className="space-y-2">
                {formData.mentionedPerfumes.map((slug) => (
                  <div
                    key={slug}
                    className="flex items-center justify-between p-2 bg-purple-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-900 truncate">{slug}</span>
                    <button
                      onClick={() => removePerfume(slug)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.mentionedPerfumes.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No perfumes added yet
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>

              <button
                onClick={() => handleSave(true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ?  (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Publish Article
                  </>
                )}
              </button>

              <button
                onClick={() => handleSave(false)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                Save as Draft
              </button>

              {mode === 'edit' && (
                <button
                  onClick={() => router.push(`/drydown/${article.slug}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  View Live Article
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}