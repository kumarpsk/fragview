'use server';

import { auth } from '@/lib/auth';
import {
  createArticle as createArticleLib,
  updateArticle as updateArticleLib,
  deleteArticle as deleteArticleLib,
  getArticleById,
} from '@/lib/admin/articles';
import { revalidatePath } from 'next/cache';

/**
 * Create new article
 */
export async function createArticle(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  readTime: string;
  mentionedPerfumes: string[];
  published: boolean;
}) {
  try {
    const session = await auth();
    
    if (!session?. user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is ADMIN or EDITOR
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return { success: false, error: 'You do not have permission to create articles' };
    }

    const result = await createArticleLib(data, session.user.id);
    
    if (result.success) {
      revalidatePath('/admin/drydown');
      revalidatePath('/drydown');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update article
 */
export async function updateArticle(
  articleId: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    category?: string;
    readTime?: string;
    mentionedPerfumes?: string[];
    published?: boolean;
  }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is ADMIN or EDITOR
    if (session.user. role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return { success: false, error: 'You do not have permission to edit articles' };
    }

    const result = await updateArticleLib(articleId, data, session. user.id);
    
    if (result.success) {
      revalidatePath('/admin/drydown');
      revalidatePath('/drydown');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete article
 */
export async function deleteArticle(articleId: string) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is ADMIN or EDITOR
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return { success: false, error: 'You do not have permission to delete articles' };
    }

    const article = await getArticleById(articleId);
    if (!article) {
      return { success: false, error: 'Article not found' };
    }

    // ADMIN can delete any; EDITOR can only delete their own
    if (session.user.role === 'EDITOR' && article.authorId !== session.user.id) {
      return { success: false, error: 'You can only delete your own articles' };
    }

    const result = await deleteArticleLib(articleId, session.user.id);
    
    if (result.success) {
      revalidatePath('/admin/drydown');
      revalidatePath('/drydown');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error. message };
  }
}