"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Award,
  Star,
  ShoppingBag,
  MessageSquare,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  Clock,
  Lock,
  Leaf,
  Flower2,
  Package,
  Bell,
  Droplets,
  ArrowRight,
  MessageSquareIcon,
  ThumbsUp,
  Zap,
} from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModal";
import Image from "next/image";

interface ProfileData {
  user: {
    id: string;
    username: string;
    image: string | null;
    bio: string | null;
    location: string | null;
    joinDate: Date;
    badges: string[];
  };
  stats: {
    reviews: number;
    wardrobe: number;
    helpful: number;
    followers: number;
    following: number;
  };
  gamification: {
    xp: number;
    level: string;
    nextLevelXP: number;
    progress: number;
  };
  privacy: {
    isWardrobePublic: boolean;
    isActivityPublic: boolean;
    isOwnProfile: boolean;
  };
  followStatus: "none" | "pending" | "approved";
  recentActivity: any[];
  signatureScents: any[];
  fullWardrobe: any[];
  wardrobeStats: {
    currentlyUsing: number;
    wishlist: number;
    inCollection: number;
    total: number;
  };
}

interface Props {
  profileData: ProfileData;
  isSignedIn: boolean;
}

export default function PublicProfileClient({
  profileData,
  isSignedIn,
}: Props) {
  const [followStatus, setFollowStatus] = useState<
    "none" | "pending" | "approved"
  >(profileData.followStatus);
  const [followerCount, setFollowerCount] = useState(
    profileData.stats.followers,
  );
  const [loading, setLoading] = useState(false);
  const { open } = useAuthModal();
  const [visibleCount, setVisibleCount] = useState(3);
  const {
    user,
    stats,
    gamification,
    privacy,
    recentActivity,
    signatureScents,
    fullWardrobe,
    wardrobeStats,
  } = profileData;
  const [activityFilter, setActivityFilter] = useState<
    "all" | "review" | "wardrobe"
  >("all");
  const [visibleActivityCount, setVisibleActivityCount] = useState(5);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});


const filteredActivity = recentActivity.filter((activity) => {
  if (activityFilter === "all") return true;
  return activity.type === activityFilter;
});
  useEffect(() => {
    setVisibleActivityCount(5);
  }, [activityFilter]);
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const formatActivityDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const joinDateFormatted = useMemo(
    () => formatDate(user.joinDate),
    [user.joinDate],
  );

  const handleFollowToggle = async () => {
    if (!isSignedIn) {
      open({
        mode: "signin",
        reason: `Sign in to follow @${user.username}'s scent journey`,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: user.id }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.status === "PENDING") {
          setFollowStatus("pending");
          alert("Follow request sent! Waiting for approval.");
        } else if (result.status === null) {
          // Unfollowed or cancelled
          setFollowStatus("none");
          if (followStatus === "approved") {
            setFollowerCount((prev) => prev - 1);
          }
        }
      }
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderFollowButton = () => {
    const baseClass =
      "flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-gray-900 font-semibold text-sm transition-all active:scale-95";

    const iconBox =
      "w-6 h-6 rounded-md bg-white border border-gray-800 flex items-center justify-center";

    if (followStatus === "pending") {
      return (
        <button
          onClick={handleFollowToggle}
          disabled={loading}
          className={`${baseClass} bg-yellow-300 text-black hover:brightness-95 disabled:opacity-50`}
        >
          <span>Request Pending</span>
          <div className={iconBox}>
            <Clock className="w-3.5 h-3.5 text-black" />
          </div>
        </button>
      );
    }

    if (followStatus === "approved") {
      return (
        <button
          onClick={handleFollowToggle}
          disabled={loading}
          className={`${baseClass} bg-black text-white hover:bg-gray-900 disabled:opacity-50`}
        >
          <span>Following Scent Journey</span>
          <div className={iconBox}>
            <UserCheck className="w-3.5 h-3.5 text-black" />
          </div>
        </button>
      );
    }

    return (
      <button
        onClick={handleFollowToggle}
        disabled={loading}
        className={`${baseClass} bg-black text-white hover:bg-gray-900 disabled:opacity-50`}
      >
        <span>Follow Scent Journey</span>
        <div className={iconBox}>
          <Bell className="w-3.5 h-3.5 text-black" />
        </div>
      </button>
    );
  };
  const renderActivityItem = (activity: any) => {
    const isReview = activity.type === "review";
    return (
      <div
        key={activity.id}
        className="flex items-start justify-between border border-[#E8E8E8] rounded-xl p-4 bg-white max-sm:p-2"
      >
        {/* LEFT SIDE */}
        <div className="flex items-start gap-3">
          {/* Icon Box */}
          <div className="w-10 h-10 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 bg-white">
            {isReview ? (
              <MessageSquareIcon className="w-4 h-4" />
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
          </div>

          {/* TEXT CONTENT */}
          <div className="flex flex-col gap-1 max-w-[600px]">
            <p className="text-[18px] font-medium text-black leading-[24px] max-sm:text-md">
              {isReview ? "Reviewed " : "Added "}
              <span className="italic font-semibold">
                {activity.fragranceName}
              </span>
              {!isReview && " to Wardrobe"}
            </p>

            {activity.preview && (
              <div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {expanded[activity.id]
                    ? activity.preview
                    : `${activity.preview.slice(0, 200)}...`}
                </p>

                {activity.preview.length > 40 && (
                  <button
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [activity.id]: !prev[activity.id],
                      }))
                    }
                    className="underline text-black font-medium text-sm"
                  >
                    {expanded[activity.id] ? "Read Less" : "Read More"}
                  </button>
                )}
              </div>
            )}

            {/* Rating only if review */}
            {isReview && (
              <div className="flex items-center gap-1 text-black text-sm">
                {"★".repeat(Math.round(activity.rating || 0))}
              </div>
            )}

            <span className="text-xs text-gray-400">
              {formatDate(activity.date)}
            </span>
            {activity.xp && (
            <div className=" items-center gap-1 border border-gray-200 rounded-md px-3 py-1 text-sm text-gray-600 max-sm:flex hidden">
              <Zap className="w-3 h-3" />+{activity.xp} XP Earned
            </div> )}
          </div>
        </div>
            {activity.xp && (
        <div className="flex items-center gap-1 border border-gray-200 rounded-md px-3 py-1 text-sm text-gray-600 max-sm:hidden">
          <Zap className="w-3 h-3" />+{activity.xp} XP Earned
        </div> )}
      </div>
    );
  };

  return (
    <div className=" ">
      <div className="bg-fv-parchment">
      <div className="mx-auto w-full max-w-[1440px] px-2 sm:px-8 md:px-12 lg:px-[72px] py-6 relative z-10  overflow-hidden ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 max-lg:flex max-lg:flex-col max-lg:items-center max-lg:justify-center">
          {/* User Info */}
          <div className="lg:col-span-2">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-20 rounded-md flex items-center justify-center  overflow-hidden ">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-black ">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-3xl font-bold text-black">
                    {user.username}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-500" />{" "}
                    Joined {formatDate(user.joinDate)}
                  </div>
                </div>
              </div>
            </div>
            {!privacy.isOwnProfile && renderFollowButton()}
          </div>

          {/* Stats */}
          <div className=" border border-gray-300 rounded-xl p-5 w-full max-w-md">
            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-800 mb-3 pb-2 border-gray-300 border-b">
              Activity Statistics
            </h2>

            {/* Top Row */}
            <div className="grid grid-cols-2 gap-y-2  py-2">
              <div>
                <p className="text-sm text-gray-600">Reviews Given</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.reviews}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Wardrobe</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.wardrobe}
                </p>
              </div>
              <div className="border-b border-gray-300 col-span-2" />
              <div className="pt-3">
                <p className="text-sm text-gray-600">Total Followers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.followers}
                </p>
              </div>

              <div className="pt-3">
                <p className="text-sm text-gray-600">Total Following</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.following}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div></div>
      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1440px] px-2 sm:px-8 md:px-12 lg:px-[72px] py-6">
          <h2 className="text-3xl font-serif text-gray-900 mb-6">Wardrobe</h2>
          {!privacy.isWardrobePublic && !privacy.isOwnProfile ? (
            <div className="w-full flex flex-col items-center justify-center py-16 text-center">
              {/* Lock Icon */}
              <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-gray-500" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-serif  text-black mb-2">
                The Users Wardrobe is private
              </h2>

              {/* Subtitle */}
              <p className="text-lg text-[#6F6D69] max-w-[500px] leading-relaxed">
                You can&apos;t view perfumes in there wardrobe unless your
                follow request is approved.
              </p>
            </div>
          ) : fullWardrobe && fullWardrobe.length > 0 ? (
            <div className="">
              {/* Header */}

              {/* Cards */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-16 gap-5">
                {fullWardrobe.slice(0, 6).map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/perfumes/${item.slug}`}
                    className="flex flex-col bg-[#FFF4E3] rounded-[16px] overflow-hidden isolate group shadow-md hover:shadow-lg"
                  >
                    {/* Image Area */}
                    {/* Image Area */}
                    <div className="relative h-[280px]  bg-white border-t border-l border-r border-[#EFEFEF] rounded-t-[16px] group-hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain p-4"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Droplets
                            className="h-12 w-12 text-[#8A6A35]"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                      {item.gender && (
                        <span className="absolute top-4 left-4 flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-[14px] leading-[20px] text-[#695129] z-10">
                          {item.gender}
                        </span>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-col justify-between flex-1 p-6 gap-6">
                      <div className="flex flex-col gap-3">
                        {/* Rating Row */}
                        <div className="flex items-center gap-[3px]">
                          <Star
                            className="h-6 w-6 text-[#FBC061] fill-[#FBC061]"
                            aria-hidden="true"
                          />
                          <span className="font-inter font-medium text-[18px] leading-[26px] text-[#211F1C]">
                            {(item.rating ?? 0).toFixed(1)}
                          </span>
                          <span className="font-inter font-normal text-[16px] leading-[24px] text-[#4A4946]">
                            ({item.reviewCount ?? 0} reviews)
                          </span>
                        </div>

                        {/* Title & Brand */}
                        <div className="flex flex-col gap-[6px]">
                          <h3 className="font-averia font-normal text-[24px] leading-[32px] text-[#211F1C] line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="font-inter font-normal text-[16px] leading-[24px] text-[#737270]">
                            {item.brand}
                          </p>
                        </div>

                        {/* Accord Tags */}
                        {item.accords?.length > 0 && (
                          <div className="flex flex-row flex-wrap items-center gap-2">
                            {item.accords.slice(0, 3).map((accord) => (
                              <span
                                key={accord.name}
                                className="flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-[14px] leading-[20px] text-[#695129]"
                              >
                                {accord.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* View Details Button */}
                      <div className="flex items-center justify-center gap-2 w-full h-[40px] border border-[#C4C4C3] rounded-lg font-inter font-medium text-[16px] leading-[26px] text-[#211F1C] hover:bg-[#211F1C] hover:text-white transition-colors">
                        View Details
                        <ArrowRight className="h-6 w-6" aria-hidden="true" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {visibleCount < fullWardrobe.length && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 3)}
                    className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-900 transition"
                  >
                    Load More →
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {/* {signatureScents.length > 0 && (
        <div className="glass-card rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-orange-500" />
            Signature Scents
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {signatureScents.map((scent, idx) => (
              <Link
                key={idx}
                href={`/perfumes/${scent.slug}`}
                className="group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 flex items-center justify-center p-2">
                  {scent.image ? (
                    <img
                      src={scent.image}
                      alt={scent.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <Leaf className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <p className="text-[10px] font-semibold text-gray-900 line-clamp-1">
                  {scent.name}
                </p>
                <p className="text-[9px] text-gray-500 line-clamp-1">
                  {scent.brand}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )} */}

      {/* {!privacy.isWardrobePublic && !privacy.isOwnProfile ? (
        <div className="glass-card rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            Wardrobe
          </h2>
          <div className="text-center py-12">
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              This user&apos;s wardrobe is private
            </p>
          </div>
        </div>
      ) : fullWardrobe && fullWardrobe.length > 0 ? (
        <div className="glass-card rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            Wardrobe ({wardrobeStats.total} bottles)
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
              <Package className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-green-600">
                {wardrobeStats.currentlyUsing}
              </p>
              <p className="text-[10px] text-gray-600 mt-1">Currently Using</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
              <Star className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-blue-600">
                {wardrobeStats.wishlist}
              </p>
              <p className="text-[10px] text-gray-600 mt-1">Wishlist</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
              <ShoppingBag className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-purple-600">
                {wardrobeStats.inCollection}
              </p>
              <p className="text-[10px] text-gray-600 mt-1">In Collection</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
              <Leaf className="w-4 h-4 text-gray-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-600">
                {wardrobeStats.total}
              </p>
              <p className="text-[10px] text-gray-600 mt-1">Total Bottles</p>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {fullWardrobe.slice(0, 24).map((item: any) => (
              <Link
                key={item.id}
                href={`/perfumes/${item.slug}`}
                className="group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 flex items-center justify-center p-1.5">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <Leaf className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <p className="text-[10px] font-semibold text-gray-900 line-clamp-1">
                  {item.name}
                </p>
                <p className="text-[9px] text-gray-500 line-clamp-1">
                  {item.brand}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                      item.status === "CURRENTLY_USING"
                        ? "bg-green-100 text-green-700"
                        : item.status === "WISH_LIST"
                          ? "bg-blue-100 text-blue-700"
                          : item.status === "IN_COLLECTION"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {fullWardrobe.length > 24 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Showing 24 of {fullWardrobe.length} bottles
              </p>
            </div>
          )}
        </div>
      ) : null} */}
      <div className="bg-white">
        <div className="mx-auto w-full max-w-[1440px] px-2 sm:px-8 md:px-12 lg:px-[72px] py-6 relative z-10">
          <div className="flex justify-between items-center mb-3 max-sm:flex-col">
            <h2 className="text-4xl font-serif text-gray-900 max-lg:text-2xl max-sm:mb-2">
              Recent Contributions
            </h2>
            <div className=" inline-flex rounded-full border border-gray-300 bg-white ">
              {(
                [
                  { label: "All", value: "all" },
                  { label: "Reviews", value: "review" },
                  { label: "Wardrobe", value: "wardrobe" },
                ] as const
              ).map((filter) => (
                <button
                  key={filter.value}
                  className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    activityFilter === filter.value
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActivityFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {!privacy.isActivityPublic && followStatus !== "approved" && (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {followStatus === "pending"
                  ? "Waiting for approval to view activity"
                  : "Follow this user to see their scent journey"}
              </p>
            </div>
          )}

          {(privacy.isActivityPublic || followStatus === "approved") &&
            recentActivity.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                No recent activity
              </p>
            )}

          <div className="space-y-3">
            {filteredActivity.length > 0 ? (
              filteredActivity
                .slice(0, visibleActivityCount)
                .map(renderActivityItem)
            ) : (
              <div className="p-4 text-sm text-gray-500 text-center border rounded-lg">
                No activity yet.
              </div>
            )}

            {visibleActivityCount < filteredActivity.length && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setVisibleActivityCount((prev) => prev + 5)}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-900 transition"
                >
                  Load More →
                </button>
              </div>
            )}
          </div>

          {/* {(privacy.isActivityPublic || followStatus === "approved") &&
          recentActivity.length > 0 && (
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const isReview = activity.type === "review";

                const hasStarRating =
                  isReview &&
                  typeof activity.rating === "number" &&
                  activity.rating > 0;
                const hasSillage =
                  isReview &&
                  typeof activity.sillage === "number" &&
                  activity.sillage > 0;
                const hasLongevity =
                  isReview &&
                  typeof activity.longevity === "number" &&
                  activity.longevity > 0;
                const hasText = isReview && activity.preview;

                let actionBadges = [];

                if (hasStarRating) {
                  actionBadges.push({
                    icon: "⭐",
                    text: `${activity.rating} Stars`,
                    color: "bg-orange-100 text-orange-700 border-orange-200",
                  });
                }

                if (hasSillage) {
                  const sillageLabel =
                    activity.sillage <= 1.5
                      ? "Intimate"
                      : activity.sillage <= 3.5
                        ? "Moderate"
                        : "Strong";
                  actionBadges.push({
                    icon: "🌬️",
                    text: `${sillageLabel} Sillage`,
                    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
                  });
                }

                if (hasLongevity) {
                  const hours = Math.round(activity.longevity * 2.4);
                  actionBadges.push({
                    icon: "⏱️",
                    text: `${hours}h Longevity`,
                    color: "bg-teal-100 text-teal-700 border-teal-200",
                  });
                }

                if (hasText) {
                  actionBadges.push({
                    icon: "💬",
                    text: "Wrote Review",
                    color: "bg-blue-100 text-blue-700 border-blue-200",
                  });
                }

                if (!isReview && activity.status) {
                  const statusMap: {
                    [key: string]: {
                      icon: string;
                      text: string;
                      color: string;
                    };
                  } = {
                    CURRENTLY_USING: {
                      icon: "✨",
                      text: "Currently Using",
                      color: "bg-green-100 text-green-700 border-green-200",
                    },
                    WISH_LIST: {
                      icon: "💫",
                      text: "Added to Wishlist",
                      color: "bg-blue-100 text-blue-700 border-blue-200",
                    },
                    IN_COLLECTION: {
                      icon: "📦",
                      text: "Added to Collection",
                      color: "bg-purple-100 text-purple-700 border-purple-200",
                    },
                    USED_UP: {
                      icon: "🏁",
                      text: "Used Up",
                      color: "bg-gray-100 text-gray-700 border-gray-200",
                    },
                    GIFTED: {
                      icon: "🎁",
                      text: "Gifted",
                      color: "bg-pink-100 text-pink-700 border-pink-200",
                    },
                    DECANT: {
                      icon: "🧪",
                      text: "Got Decant",
                      color: "bg-amber-100 text-amber-700 border-amber-200",
                    },
                  };

                  const statusInfo =
                    statusMap[activity.status] || statusMap["IN_COLLECTION"];
                  actionBadges.push(statusInfo);
                }

                return (
                  <Link
                    key={activity.id}
                    href={`/perfumes/${activity.slug}`}
                    className="flex gap-4 p-4 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center p-1">
                      {activity.image ? (
                        <img
                          src={activity.image}
                          className="max-w-full max-h-full object-contain"
                          alt={activity.fragranceName}
                        />
                      ) : (
                        <Leaf className="w-6 h-6 text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isReview ? (
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-orange-500" />
                        )}
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          {isReview ? "Reviewed" : "Wardrobe"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatActivityDate(activity.date)}
                        </span>
                      </div>

                      <p className="font-semibold text-gray-900 line-clamp-1">
                        {activity.fragranceName}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                        {activity.brand}
                      </p>

                      {actionBadges.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          {actionBadges.map((badge, idx) => (
                            <span
                              key={idx}
                              className={`text-[10px] font-medium px-2 py-1 rounded-full border ${badge.color}`}
                            >
                              {badge.icon} {badge.text}
                            </span>
                          ))}
                        </div>
                      )}

                      {hasText && (
                        <p className="text-sm text-gray-600 line-clamp-2 italic">
                          &quot;{activity.preview}&quot;
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div> */}
        </div>
      </div>
    </div>
  );
}
