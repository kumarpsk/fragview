import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?. user?. id) return false;

  const user = await prisma. user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role === 'ADMIN';
}

/**
 * Check if current user is editor or admin
 */
export async function isEditorOrAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?. role === 'ADMIN' || user?.role === 'EDITOR';
}

/**
 * Get current admin user
 */
export async function getAdminUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      image: true,
    },
  });

if (user?.role !== 'ADMIN') return null;
  return user;
}

// /**
//  * Require admin access (throws error if not admin)
//  */
export async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
  return admin;
}


export async function getAdminOrEditorUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      image: true,
    },
  });

  if (!["ADMIN", "EDITOR"].includes(user?.role)) return null;
  return user;
}

export async function requireAdminOrEditor() {
  const user = await getAdminOrEditorUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

