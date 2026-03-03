'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthModal } from '@/components/auth/AuthModal';
import { postArticleComment, deleteArticleComment } from '@/app/actions/drydown-comments';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Loader2, ThumbsUp, ThumbsDown, ChevronDown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    image: string | null;
    badges: string[];
  };
}

interface Props {
  articleId: string;
  initialComments: Comment[];
}

export default function ArticleComments({ articleId, initialComments }: Props) {
  const { data: session } = useSession();
  const { open } = useAuthModal();
  const router = useRouter();

  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      open({ mode: 'signin', reason: 'Sign in to comment on articles' });
      return;
    }

    if (!content.trim()) return;

    setPosting(true);

    const result = await postArticleComment(articleId, content);

    if (result.success && result.comment) {
      setComments([...comments, result.comment]);
      setContent('');
      router.refresh();
    } else {
      alert('❌ ' + result.error);
    }

    setPosting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    setDeletingId(commentId);

    const result = await deleteArticleComment(commentId);

    if (result.success) {
      setComments(comments.filter((c) => c.id !== commentId));
      router.refresh();
    } else {
      alert('❌ ' + result.error);
    }

    setDeletingId(null);
  };

  const visibleComments = comments.slice(0, visibleCount);
  const hasMore = comments.length > visibleCount;

  return (
    <div className="flex flex-col gap-5">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <span 
            className="text-[18px] leading-[26px] lg:text-[24px] lg:leading-[32px]"
            style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#8A6A35' }}
          >
            Join in the conversation
          </span>
          <h2 
            className="text-[32px] leading-[40px] lg:text-[40px] lg:leading-[50px]"
            style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#211F1C' }}
          >
            Discussion
          </h2>
        </div>

        {/* Comment Form */}
        <div className="flex flex-col gap-5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onClick={() => {
              if (!session) {
                open({ mode: 'signin', reason: 'Sign in to comment on articles' });
              }
            }}
            placeholder="Share your thoughts"
            rows={4}
            maxLength={1000}
            className="w-full p-4 rounded-xl bg-white text-black resize-none focus:outline-none focus:ring-2 focus:ring-[#8A6A35]"
            style={{ 
              border: '1px solid #C4C4C3',
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              lineHeight: '28px',
          
            }}
          />
          <div className="flex justify-end gap-4 lg:gap-6">
            {content && (
              <button
                type="button"
                onClick={() => setContent('')}
                className="h-[50px] px-4 flex items-center justify-center gap-3 rounded-xl transition-colors hover:bg-gray-50"
                style={{ border: '1px solid #C4C4C3' }}
              >
                <span 
                  className="text-[18px] leading-[26px]"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#211F1C' }}
                >
                  Cancel
                </span>
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={posting || !content.trim()}
              className="h-[50px] px-4 flex items-center justify-center gap-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: content.trim() ? '#211F1C' : '#EFEFEF' }}
            >
              <span 
                className="text-[18px] leading-[26px]"
                style={{ 
                  fontFamily: "'Inter', sans-serif", 
                  fontWeight: 500, 
                  color: content.trim() ? '#FFFFFF' : '#9D9C9B' 
                }}
              >
                {posting ? 'Posting...' : 'Post comment'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px" style={{ backgroundColor: '#E2E1E1' }} />

      {/* Comments List Section */}
      <div className="flex flex-col gap-5">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 
            className="text-[28px] leading-[36px] lg:text-[40px] lg:leading-[48px]"
            style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#211F1C' }}
          >
            What people are talking about
          </h3>
          <button 
            className="h-[50px] px-4 flex items-center gap-3 rounded-xl"
            style={{ border: '1px solid #C4C4C3' }}
          >
            <span 
              className="text-[18px] leading-[26px]"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#211F1C' }}
            >
              Sort by
            </span>
            <ChevronDown className="w-6 h-6" style={{ color: '#211F1C' }} />
          </button>
        </div>

        {/* Comments */}
        <div className="flex flex-col gap-8 lg:gap-10">
          {comments.length === 0 ? (
            <div 
              className="p-4 rounded-xl text-center"
              style={{ border: '1px solid #C4C4C3' }}
            >
              <p 
                className="text-[18px] leading-[26px] lg:text-[20px] lg:leading-[30px]"
                style={{ fontFamily: "'Inter', sans-serif", color: '#737270' }}
              >
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            visibleComments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 lg:p-6 rounded-xl"
                style={{ border: '1px solid #C4C4C3' }}
              >
                <div className="flex flex-col gap-4 lg:gap-5">
                  {/* Header - Name and Time */}
                  <div className="flex justify-between items-start gap-4">
                    <span 
                      className="text-[24px] leading-[32px] lg:text-[32px] lg:leading-[40px]"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#211F1C' }}
                    >
                      {comment.user.username}
                    </span>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-[16px] leading-[24px] lg:text-[20px] lg:leading-[28px] whitespace-nowrap"
                        style={{ fontFamily: "'Inter', sans-serif", color: '#737270' }}
                      >
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: false })} ago
                      </span>
                      {/* Delete Button */}
                      {session &&
                        (session.user.id === comment.user.id || session.user.role === 'ADMIN') && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            disabled={deletingId === comment.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete comment"
                          >
                            {deletingId === comment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p 
                    className="text-[18px] leading-[32px] lg:text-[24px] lg:leading-[40px]"
                    style={{ fontFamily: "'Inter', sans-serif", color: '#4A4946' }}
                  >
                    {comment.content}
                  </p>

                  {/* Footer - Helpful */}
                  <div className="flex items-center gap-4">
                    <span 
                      className="text-[16px] leading-[24px] lg:text-[18px] lg:leading-[26px]"
                      style={{ fontFamily: "'Inter', sans-serif", color: '#737270' }}
                    >
                      Helpful?
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                        <ThumbsUp className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#737270' }} />
                        <span 
                          className="text-[16px] leading-[24px] lg:text-[18px] lg:leading-[26px]"
                          style={{ fontFamily: "'Inter', sans-serif", color: '#737270' }}
                        >
                          12
                        </span>
                      </button>
                      <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                        <ThumbsDown className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#737270' }} />
                        <span 
                          className="text-[16px] leading-[24px] lg:text-[18px] lg:leading-[26px]"
                          style={{ fontFamily: "'Inter', sans-serif", color: '#737270' }}
                        >
                          0
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 3)}
              className="h-[50px] px-4 pr-1 flex items-center gap-3 rounded-xl transition-all hover:opacity-90"
              style={{ backgroundColor: '#211F1C' }}
            >
              <span 
                className="text-[18px] leading-[26px]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#FFFFFF' }}
              >
                Load More
              </span>
              <div 
                className="w-10 h-10 flex items-center justify-center rounded-lg"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <ArrowRight className="w-6 h-6" style={{ color: '#211F1C' }} />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}