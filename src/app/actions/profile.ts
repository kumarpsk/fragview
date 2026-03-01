"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// TYPES
export type ActivityItem = {
  id: string;
  type: "review" | "wardrobe";
  fragranceName: string;
  brand: string;
  image: string;
  date: Date;
  rating?: number;
  preview?: string;
  subcat?: string;
  status?: string;
  xp?: any;
};

export type ProfileData = {
  user: {
    id: string;
    name: string;
    username: string;
    image?: string;
    bio?: string;
    location?: string;
    joinDate: Date;
    favNotes: string[];
    favAccords: string[];
    favPerfumers: string[];
    favPerfumeIds: string[];
    badges: string[];
    signatureScents: any[];
  };
  stats: {
    reviews: number;
    wardrobe: number;
    helpful: number;
    followers: number;
    following: number;
    photoReviews?: number;
  };
  gamification: {
    xp: number;
    level: string;
    nextLevelXP: number;
    progress: number;
    breakdown: {
      activity: number;
      profile: number;
      bonus: number;
    };
  };
  nudge: {
    isComplete: boolean;
    missingFields: string[];
    completionPercentage: number;
  };
  recentActivity: ActivityItem[];
  signatureScents: any[];
};

// --- GAMIFICATION LOGIC ---

const XP_RULES = {
  PROFILE: {
    PHOTO: 20,
    LOCATION: 10,
    BIO: 10,
    FAV_PERFUMES: 20,
    FAV_NOTES: 20,
    FAV_ACCORDS: 20,
    FAV_PERFUMERS: 20,
  },
  ACTIVITY: {
    REVIEW_BASE: 10,
    REVIEW_PHOTO: 5,
    HELPFUL_VOTE: 2,
    LIKE: 1,
    WARDROBE_ADD: 1,
  },
};

const getLevel = (xp: number) => {
  if (xp >= 1001) return { title: "Master", min: 1001, next: 5000 };
  if (xp >= 501) return { title: "Expert", min: 501, next: 1001 };
  if (xp >= 201) return { title: "Connoisseur", min: 201, next: 501 };
  if (xp >= 51) return { title: "Enthusiast", min: 51, next: 201 };
  return { title: "Novice", min: 0, next: 51 };
};

const calculateProfileXP = (user: any) => {
  let score = 0;
  if (user.image) score += XP_RULES.PROFILE.PHOTO;
  if (user.location) score += XP_RULES.PROFILE.LOCATION;
  if (user.bio) score += XP_RULES.PROFILE.BIO;
  if (user.favPerfumeIds && user.favPerfumeIds.length > 0)
    score += XP_RULES.PROFILE.FAV_PERFUMES;
  if (user.favNotes && user.favNotes.length > 0)
    score += XP_RULES.PROFILE.FAV_NOTES;
  if (user.favAccords && user.favAccords.length > 0)
    score += XP_RULES.PROFILE.FAV_ACCORDS;
  if (user.favPerfumers && user.favPerfumers.length > 0)
    score += XP_RULES.PROFILE.FAV_PERFUMERS;
  return score;
};

const calculateBadges = (
  user: any,
  stats: {
    reviewCount: number;
    photoReviewCount: number;
    helpfulCount: number;
  },
) => {
  const badges = new Set<string>(user.badges || []);

  // 1. Early Adopter
  const BETA_CUTOFF = new Date("2025-12-31");
  if (new Date(user.createdAt) < BETA_CUTOFF) {
    badges.add("Early Adopter");
  }

  // 2. Active Reviewer
  if (stats.reviewCount >= 50) badges.add("Active Reviewer");

  // 3. Photo Contributor
  if (stats.photoReviewCount >= 25) badges.add("Photo Contributor");

  // 4. Community Helper
  if (stats.helpfulCount >= 100) badges.add("Community Helper");

  return Array.from(badges);
};

export async function getProfileData(): Promise<ProfileData | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = session.user.id;

  // 1. Fetch Basic Data
  const userRecord = await prisma.user.findUnique({ where: { id: userId } });
  if (!userRecord) return null;

  const [wardrobeCount, followingCount, followerCount] = await Promise.all([
    prisma.wardrobeEntry.count({ where: { userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
    prisma.follow.count({ where: { followingId: userId } }),
  ]);

  // 2. Aggregate Review Stats
  const reviewStats = await prisma.review.aggregate({
    where: { userId },
    _sum: {
      helpfulCount: true,
      likeCount: true,
    },
    _count: {
      _all: true,
    },
  });

  const reviewsWithPhotos = await prisma.review.count({
    where: {
      userId,
      NOT: {
        photos: { equals: [] },
      },
    },
  });

  const reviewCount = reviewStats._count._all;
  const totalHelpful = reviewStats._sum.helpfulCount || 0;
  const totalLikes = reviewStats._sum.likeCount || 0;

  // 3. Calculate Total XP
  const xpFromReviews = reviewCount * XP_RULES.ACTIVITY.REVIEW_BASE;
  const xpFromPhotos = reviewsWithPhotos * XP_RULES.ACTIVITY.REVIEW_PHOTO;
  const xpFromHelpful = totalHelpful * XP_RULES.ACTIVITY.HELPFUL_VOTE;
  const xpFromLikes = totalLikes * XP_RULES.ACTIVITY.LIKE;
  const xpFromWardrobe = wardrobeCount * XP_RULES.ACTIVITY.WARDROBE_ADD;

  const activityXP =
    xpFromReviews + xpFromPhotos + xpFromHelpful + xpFromLikes + xpFromWardrobe;
  const profileXP = calculateProfileXP(userRecord);
  const manualXP = userRecord.experiencePoints || 0;

  const totalXP = activityXP + profileXP + manualXP;
  const levelInfo = getLevel(totalXP);

  // 4. Badges
  const badges = calculateBadges(userRecord, {
    reviewCount,
    photoReviewCount: reviewsWithPhotos,
    helpfulCount: totalHelpful,
  });

  // 5. Fetch Recent Activity Feed
  const recentReviews = await prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    // take: 5,
  });

  const recentWardrobe = await prisma.wardrobeEntry.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    // take: 5,
  });

  // 6. Resolve Perfume Details (Robust Slug/ID Handling)
  const activityIds = [
    ...recentReviews.map((r) => r.perfumeId),
    ...recentWardrobe.map((w) => w.perfumeId),
  ];
  const signatureIds = userRecord.favPerfumeIds || [];

  const allIds = Array.from(new Set([...activityIds, ...signatureIds]));

  // Separate valid 24-char Hex IDs (legacy) from Slugs (new)
  const validObjectIds = allIds
    .filter((id) => /^[0-9a-fA-F]{24}$/.test(id))
    .map((id) => new ObjectId(id));

  // We also query by 'slug' for everything else
  const slugs = allIds;

  const client = await clientPromise;
  const db = client.db("fragview");

  // Query Mongo for either _id Match OR Slug Match
  const perfumes = await db
    .collection("perfumes")
    .find({
      $or: [{ _id: { $in: validObjectIds } }, { slug: { $in: slugs } }],
    })
    .project({
      name: 1,
      variant_name: 1,
      brand: 1,
      brand_name: 1,
      image: 1,
      images: 1,
      slug: 1,
    })
    .toArray();

  const getPerfumeInfo = (id: string) => {
    // Find matching perfume by checking ID OR Slug
    const p: any = perfumes.find(
      (perf) => perf._id.toString() === id || perf.slug === id,
    );

    let brandName = "Unknown Brand";
    if (p?.brand_name) brandName = p.brand_name;
    else if (typeof p?.brand === "object" && p?.brand?.name)
      brandName = p.brand.name;
    else if (typeof p?.brand === "string") brandName = p.brand;

    return {
      id: id,
      name: p?.variant_name || p?.name || "Unknown Perfume",
      brand: brandName,
      image: p?.image || p?.images?.[0] || "",
    };
  };

  const activities: ActivityItem[] = [
    ...recentReviews.map((r) => {
      const info = getPerfumeInfo(r.perfumeId);
      return {
        id: r.id,
        type: "review" as const,
        fragranceName: info.name,
        brand: info.brand,
        image: info.image,
        xp: XP_RULES.ACTIVITY.REVIEW_BASE,
        date: r.createdAt,
        rating: r.rating,
        preview: r.text || undefined,
      };
    }),
    ...recentWardrobe.map((w) => {
      const info = getPerfumeInfo(w.perfumeId);
      return {
        id: w.id,
        type: "wardrobe" as const,
        fragranceName: info.name,
        brand: info.brand,
        image: info.image,
        date: w.updatedAt,
        subcat: w.subcategory,
        status: w.status,
      };
    }),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const signatureScents = signatureIds.map((id) => getPerfumeInfo(id));

  // 7. Profile Nudge Logic
  const fields = [
    { key: "image", label: "Photo", isFilled: !!userRecord.image },
    { key: "bio", label: "Bio", isFilled: !!userRecord.bio },
    { key: "location", label: "Location", isFilled: !!userRecord.location },
    {
      key: "favNotes",
      label: "Fav Notes",
      isFilled: userRecord.favNotes.length > 0,
    },
    {
      key: "favPerfumes",
      label: "Top 5 Perfumes",
      isFilled: userRecord.favPerfumeIds.length > 0,
    },
    {
      key: "favAccords",
      label: "Fav Accords",
      isFilled: userRecord.favAccords.length > 0,
    },
    {
      key: "favPerfumers",
      label: "Fav Perfumers",
      isFilled: userRecord.favPerfumers.length > 0,
    },
  ];

  const missingFields = fields.filter((f) => !f.isFilled).map((f) => f.label);
  const completionPercentage = Math.round(
    (fields.filter((f) => f.isFilled).length / fields.length) * 100,
  );

  return {
    user: {
      id: userRecord.id,
      name: userRecord.username || "User",
      username: userRecord.username || "user",
      image: userRecord.image || "",
      bio: userRecord.bio || "",
      location: userRecord.location || "",
      joinDate: userRecord.createdAt,
      favNotes: userRecord.favNotes,
      favAccords: userRecord.favAccords,
      favPerfumers: userRecord.favPerfumers,
      favPerfumeIds: userRecord.favPerfumeIds,
      badges: badges,
      signatureScents: signatureScents,
    },
    stats: {
      reviews: reviewCount,
      wardrobe: wardrobeCount,
      helpful: totalHelpful,
      followers: followerCount,
      following: followingCount,
      photoReviews: reviewsWithPhotos,
    },
    gamification: {
      xp: totalXP,
      level: levelInfo.title,
      nextLevelXP: levelInfo.next,
      progress: Math.min(
        100,
        Math.round(
          ((totalXP - levelInfo.min) / (levelInfo.next - levelInfo.min)) * 100,
        ),
      ),
      breakdown: {
        activity: activityXP,
        profile: profileXP,
        bonus: manualXP,
      },
    },
    nudge: {
      isComplete: missingFields.length === 0,
      missingFields,
      completionPercentage,
    },
    recentActivity: activities,
    signatureScents: signatureScents,
  };
}

// UPDATE ACTION
export async function updateProfile(data: {
  displayName: string;
  location: string;
  bio: string;
  favNotes: string;
  favAccords: string;
  favPerfumers: string;
  favPerfumeIds: string[];
  image: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not logged in" };

  const toArray = (str: string) =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: data.displayName,
        location: data.location,
        bio: data.bio,
        image: data.image,
        favNotes: toArray(data.favNotes),
        favAccords: toArray(data.favAccords),
        favPerfumers: toArray(data.favPerfumers),
        favPerfumeIds: data.favPerfumeIds,
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "Failed to update" };
  }
}
