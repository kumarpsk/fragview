'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import clientPromise from '@/lib/mongodb';
import { WardrobeStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';

// TYPES
export type WardrobeEntryHydrated = {
  id: string;
  perfumeId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  rating: number;
  // Total number of reviews this perfume has received
  reviewCount: number;
  accords: any[]; 
  // Gender / marketing classification for the perfume, if available
  gender?: string | null;
  status: WardrobeStatus;
  subcategory: string;
  notes?: string | null;
  updatedAt: Date;
};

// 1. FETCH WARDROBE (Hybrid: Postgres + MongoDB)
export async function getWardrobe(): Promise<WardrobeEntryHydrated[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  try {
    // A. Fetch User's Wardrobe from Postgres
    const pgEntries = await prisma.wardrobeEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' }
    });

    if (pgEntries.length === 0) return [];

    // B. Extract and CONVERT IDs for MongoDB
    const perfumeObjectIds = pgEntries
      .map(e => {
        try { return new ObjectId(e.perfumeId); } catch { return null; }
      })
      .filter(id => id !== null) as ObjectId[];

    // C. Fetch Details from MongoDB
    const client = await clientPromise;
    const db = client.db('fragview');
    
    const perfumes = await db.collection('perfumes')
      .find({ _id: { $in: perfumeObjectIds } }) 
      .project({ 
        name: 1, 
        variant_name: 1, 
        brand: 1,
        brand_name: 1, // ✅ catch string brand names
        image: 1, 
        images: 1, 
        rating: 1, 
        rating_count: 1,
        gender: 1,
        accords: 1, 
        main_accords: 1, 
        slug: 1
      })
      .toArray();

    // D. Merge Data
    const hydrated: WardrobeEntryHydrated[] = pgEntries.map(entry => {
      const p: any = perfumes.find(perf => perf._id.toString() === entry.perfumeId);
      
      const name = p?.variant_name || p?.name || 'Unknown Perfume';
      
      // ✅ ROBUST BRAND CHECK: Checks brand_name (string) -> brand.name (obj) -> brand (string)
      let brandName = 'Unknown Brand';
      if (p?.brand_name) brandName = p.brand_name;
      else if (typeof p?.brand === 'object' && p?.brand?.name) brandName = p.brand.name;
      else if (typeof p?.brand === 'string') brandName = p.brand;

      const image = p?.image || p?.images?.[0] || '';
      // Handle varied accord structures (some are strings, some objects)
      const rawAccords = p?.accords || p?.main_accords || [];
      const accords = rawAccords.map((a: any) => typeof a === 'string' ? { name: a } : a);

      const slug = p?.slug || entry.perfumeId;

      // Some older Mongo documents might have a typo (`geneder`) – handle both safely
      const gender: string | null = p?.gender || null;
      const reviewCount: number = typeof p?.rating_count === 'number' ? p.rating_count : 0;

      return {
        id: entry.id,
        perfumeId: entry.perfumeId,
        slug,
        name,
        brand: brandName,
        image,
        rating: p?.rating || 0,
        reviewCount,
        accords: accords.slice(0, 3), 
        gender,
        status: entry.status,
        subcategory: entry.subcategory || 'General',
        notes: entry.notes,
        updatedAt: entry.updatedAt
      };
    });

    return hydrated.filter(h => h.name !== 'Unknown Perfume');

  } catch (error) {
    console.error("Wardrobe fetch error:", error);
    return [];
  }
}

// 2. ADD/UPDATE ITEM
export async function addToWardrobe(
  perfumeId: string, 
  status: WardrobeStatus, 
  subcategory: string, 
  notes?: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not logged in" };

  try {
    await prisma.wardrobeEntry.upsert({
      where: {
        userId_perfumeId: {
          userId: session.user.id,
          perfumeId: perfumeId
        }
      },
      update: { status, subcategory, notes },
      create: {
        userId: session.user.id,
        perfumeId,
        status,
        subcategory,
        notes
      }
    });
    revalidatePath('/wardrobe');
    return { success: true };
  } catch (e) {
    return { error: "Failed to save" };
  }
}

// 3. RENAME SUBCATEGORY
export async function renameSubcategory(oldName: string, newName: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not logged in" };

  try {
    await prisma.wardrobeEntry.updateMany({
      where: { 
        userId: session.user.id,
        subcategory: oldName 
      },
      data: { subcategory: newName }
    });
    revalidatePath('/wardrobe');
    return { success: true };
  } catch (e) {
    return { error: "Failed to rename" };
  }
}

// 4. DELETE ITEM
export async function removeFromWardrobe(perfumeId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not logged in" };

  try {
    await prisma.wardrobeEntry.delete({
      where: {
        userId_perfumeId: { userId: session.user.id, perfumeId }
      }
    });
    revalidatePath('/wardrobe');
    return { success: true };
  } catch (e) {
    return { error: "Failed to delete" };
  }
}