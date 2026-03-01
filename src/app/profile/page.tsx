"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  Calendar,
  Award,
  TrendingUp,
  MessageSquare,
  Trees,
  Loader2,
  MapPin,
  ShoppingBag,
  ArrowUpRightIcon,
  Zap,
  ThumbsUp,
  MessageSquareIcon,
  X,
  Pencil,
  Leaf,
  Layers,
  User,
  SprayCan,
  ArrowRight,
} from "lucide-react";
import UserBadges from "@/components/gamification/UserBadges";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/components/auth/AuthModal";
import {
  getProfileData,
  ProfileData,
  ActivityItem,
} from "@/app/actions/profile";
import EditProfileModal from "@/components/profile/EditProfileModal";
import FollowRequestsWidget from "@/components/profile/FollowRequestsWidget";
import FollowedBrandsWidget from "@/components/profile/FollowedBrandsWidget";
import { updateProfile } from "@/app/actions/profile";

type TabId = "overview" | "reviews" | "achievements";

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const { open } = useAuthModal();
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeEditField, setActiveEditField] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<
    "all" | "review" | "wardrobe"
  >("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [visibleActivityCount, setVisibleActivityCount] = useState(5);

  const badgeConfig = [
    {
      key: "Early Adopter",
      label: "Early Adopter",
      currentText: profile?.user?.joinDate
        ? new Date(profile.user.joinDate).toDateString()
        : "—",
    },
    {
      key: "Active Reviewer",
      label: "Active Reviewer",
      current: profile?.stats?.reviews || 0,
      target: 50,
      suffix: "reviews",
      prefix: "Wrote",
    },
    {
      key: "Photo Contributor",
      label: "Photo Contributor",
      current: profile?.stats?.photoReviews || 0,
      target: 25,
      suffix: "reviews",
    },
    {
      key: "Community Helper",
      label: "Community Helper",
      current: profile?.stats?.helpful || 0,
      target: 100,
      suffix: "votes",
    },
  ];
  // --- AUTH & FETCH ---
  useEffect(() => {
    if (status === "unauthenticated") {
      open({ mode: "signin", reason: "Sign in to view your profile" });
    }
  }, [status, open]);
  useEffect(() => {
    setVisibleActivityCount(5);
  }, [activityFilter]);
  const fetchProfile = async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    const data = await getProfileData();
    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [status]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleRemove = async (sectionTitle: string, item: any) => {
    // Map section titles to user fields
    const sectionMap: Record<string, keyof typeof user> = {
      "Favorite Notes": "favNotes",
      "Favorite Accords": "favAccords",
      "Favorite Perfumers": "favPerfumers",
      "Signature Scent": "signatureScents",
    };
    const field = sectionMap[sectionTitle];
    if (!field) return;

    // Determine value to remove (string or object)
    const valueToRemove = typeof item === "object" ? item.name : item;

    // Remove item from the correct field in user
    setProfile((prev) => ({
      ...prev!,
      user: {
        ...prev!.user,
        [field]: Array.isArray(prev!.user[field])
          ? prev!.user[field].filter((x: any) =>
              typeof x === "object"
                ? x.name !== valueToRemove
                : x !== valueToRemove,
            )
          : [],
      },
    }));

    // Prepare payload for updateProfile
    let payload: any = {
      displayName: user.name,
      location: user.location,
      bio: user.bio,
      image: user.image,
      favNotes:
        field === "favNotes"
          ? user.favNotes.filter((x: any) => x !== valueToRemove).join(",")
          : user.favNotes.join(","),
      favAccords:
        field === "favAccords"
          ? user.favAccords.filter((x: any) => x !== valueToRemove).join(",")
          : user.favAccords.join(","),
      favPerfumers:
        field === "favPerfumers"
          ? user.favPerfumers.filter((x: any) => x !== valueToRemove).join(",")
          : user.favPerfumers.join(","),
      favPerfumeIds:
        field === "signatureScents"
          ? user.signatureScents
              .filter((x: any) =>
                typeof x === "object"
                  ? x.name !== valueToRemove
                  : x !== valueToRemove,
              )
              .map((p: any) => p.id)
          : user.favPerfumeIds,
    };

    try {
      await updateProfile(payload);
      fetchProfile();
    } catch (e) {
      console.error(e);
      fetchProfile(); // rollback if failed
    }
  };
  const handleAddMore = (sectionTitle: string) => {
    setShowEditModal(true);
    setActiveEditField(sectionTitle);
  };
  // --- RENDER HELPERS ---
  const renderActivityItem = (activity: ActivityItem) => {
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
              </div>
            )}
          </div>
        </div>
        {activity.xp && (
          <div className="flex items-center gap-1 border border-gray-200 rounded-md px-3 py-1 text-sm text-gray-600 max-sm:hidden">
            <Zap className="w-3 h-3" />+{activity.xp} XP Earned
          </div>
        )}
      </div>
    );
  };
  // --- LOADING ---
  if (status === "loading" || loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FAFFF5]">
        <Loader2 className="animate-spin text-gray-600 w-10 h-10" />
      </div>
    );
  if (!session || !profile)
    return <div className="min-h-screen bg-[#FAFFF5]" />;

  const { user, stats, gamification, nudge, recentActivity, signatureScents } =
    profile;

  const filteredActivity = recentActivity.filter((activity) => {
    if (activityFilter === "all") return true;
    return activity.type === activityFilter;
  });

  const quickSections = [
    { title: "Favorite Notes", key: "favNotes" },
    { title: "Favorite Accords", key: "favAccords" },
    { title: "Favorite Perfumers", key: "favPerfumers" },
    { title: "Signature Scent", key: "signatureScents" },
  ];
  const isProfileComplete = quickSections.every(
    (section) => user?.[section.key]?.length > 0,
  );

  const sectionConfig = {
    "Favorite Notes": {
      icon: Leaf,
      emptyText: "You haven’t added any notes yet",
      actionText: "Add Notes",
    },
    "Favorite Accords": {
      icon: Layers,
      emptyText: "You haven’t added any accords yet",
      actionText: "Add Accords",
    },
    "Favorite Perfumers": {
      icon: User,
      emptyText: "You haven’t added any perfumers yet",
      actionText: "Explore Perfumers",
    },
    "Signature Scent": {
      icon: SprayCan,
      emptyText: "You haven’t added any signature scent",
      actionText: "Add Perfumes",
    },
  };
  return (
    <div className=" relative overflow-hidden ">
      <div className=" bg-fv-parchment">
        <div className="mx-auto w-full max-w-[1440px] px-2 sm:px-8 md:px-12 lg:px-[72px] py-6 relative z-10">
          {/* Follow Requests Widget */}
          <FollowRequestsWidget />

          {/* 1.  HERO CARD */}
          <div className="  mb-4 relative overflow-hidden ">
            <div className="absolute top-0 right-0 opacity-5">
              <Trees size={200} />
            </div>
            <div className="grid max-lg:flex max-lg:flex-col max-lg:items-center max-lg:justify-center grid-cols-3 gap-8 relative z-10 ">
              {/* User Info */}
              <div className="lg:col-span-2">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-20 rounded-md flex items-center justify-center  overflow-hidden bg-[#feebce] max-sm:w-12 max-sm:h-12">
                    {user.image && !imgError ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <span className="text-4xl text-black max-sm:text-lg">
                        {user?.name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center space-x-3 mb-1">
                      <h1 className="text-3xl font-bold text-black max-sm:text-xl">
                        {user.name}
                      </h1>
                      <button
                        onClick={() => {
                          setActiveEditField(null);
                          setShowEditModal(true);
                        }}
                        className="p-1.5  bg-black text-white rounded-full shadow-sm"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-500" />{" "}
                        Joined {formatDate(user.joinDate)}
                      </div>
                      {user.location && (
                        <div className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-orange-500" />{" "}
                          {user.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {user.bio || (
                  <div className="flex items-center gap-2 cols-span-2 mb-4 w-full">
                    <span className=" text-gray-600">No bio added. </span>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="text-black underline flex items-center"
                    >
                      Add Bio <ArrowUpRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="w-full max-w-md rounded-xl bg-gradient-to-r from-[#211F1C] to-[#573808] p-4 text-white shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg">Level {gamification.level}</h3>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-[#fbc061] rounded-full"
                      style={{ width: `${gamification.progress}%` }}
                    />
                  </div>

                  {/* XP Row */}
                  <div className="flex justify-between text-xs text-gray-200 mb-2">
                    <span>{gamification.xp} XP</span>
                    <span>Next Level: {gamification.nextLevelXP} XP</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-100 leading-relaxed">
                    Earn points by adding reviews, adding perfumes to wardrobe,
                    completing profile and more!
                  </p>
                </div>
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
          </div>
        </div>

        <div className="bg-white">
          <div className="mx-auto w-full max-w-[1440px] px-2 sm:px-8 md:px-12 lg:px-[72px] py-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
              {/* ================= LEFT SIDEBAR ================= */}
              <aside className="border rounded-lg p-4 bg-white h-fit">
                <h3 className="text-2xl font-serif text-gray-900 mb-4 border-b border-gray-300 pb-2">
                  Quick Actions
                </h3>
                {!isProfileComplete && (
                  <div className="mb-5 border-b border-gray-200 pb-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-gray-800">
                        Complete Profile
                      </p>

                      <span className="flex items-center gap-1 text-[11px] px-2 py-1 border rounded-md text-gray-500 bg-gray-50">
                        <Zap className="w-3 h-3" />
                        +10 XP
                      </span>
                    </div>

                    {/* Center Content */}
                    <div className="flex flex-col items-center text-center">
                      {/* Icon */}
                      <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 mb-3">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>

                      {/* Text */}
                      <p className="text-sm text-gray-700 leading-5 mb-2">
                        Complete your profile to earn more points
                      </p>

                      {/* Button */}
                      <button
                        onClick={() => {
                          setActiveEditField(null);
                          setShowEditModal(true);
                        }}
                        className="text-sm font-medium text-black flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        View Profile <span>→</span>
                      </button>
                    </div>
                  </div>
                )}
                {[
                  { title: "Favorite Notes", data: user.favNotes },
                  { title: "Favorite Accords", data: user.favAccords },
                  { title: "Favorite Perfumers", data: user.favPerfumers },
                  {
                    title: "Signature Scent",
                    data: user.signatureScents,
                  },
                ].map((section) => (
                  <div
                    key={section.title}
                    className="mb-5 border-b border-gray-200 pb-4"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {section.data?.length > 0 ? (
                        <>
                          <p className="text-sm font-semibold text-gray-800 mb-2 w-full">
                            {section.title}
                          </p>
                          {section.data.map((item: any, index: number) => {
                            const id =
                              typeof item === "object"
                                ? item.id
                                : `${item}-${index}`;

                            const label =
                              typeof item === "object" ? item.name : item;

                            return (
                              <span
                                key={id}
                                className="flex items-center gap-1 px-2 py-1 bg-[#ECE0CF] text-[#695129] rounded-full text-xs"
                              >
                                {label}

                                {/* REMOVE BUTTON */}
                                <button
                                  onClick={() =>
                                    handleRemove(section.title, item)
                                  }
                                  className="ml-1 text-[#8A6A35] hover:text-black transition"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })}

                          {/* ADD MORE */}
                          <button
                            onClick={() => handleAddMore(section.title)}
                            className="text-xs font-medium text-black px-2"
                          >
                            Add More
                          </button>
                        </>
                      ) : (
                        (() => {
                          const config = sectionConfig[section.title];
                          const Icon = config.icon;

                          return (
                            <div className="w-full flex flex-col items-center text-center py-3">
                              <div className="flex items-center justify-between mb-4 w-full">
                                <p className="text-sm font-semibold text-gray-800">
                                  {section.title}
                                </p>

                                <span className="flex items-center gap-1 text-[11px] px-2 py-1 border rounded-md text-gray-500 bg-gray-50">
                                  <Zap className="w-3 h-3" />
                                  +10 XP
                                </span>
                              </div>
                              <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 mb-3">
                                <Icon className="w-4 h-4 text-gray-500" />
                              </div>

                              <p className="text-sm text-gray-700 mb-2">
                                {config.emptyText}
                              </p>

                              <button
                                onClick={() => handleAddMore(section.title)}
                                className="text-sm font-medium text-black flex items-center gap-1 hover:gap-2 transition-all"
                              >
                                {config.actionText}
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                ))}
              </aside>

              {/* ================= RIGHT CONTENT ================= */}
              <div className="space-y-8">
                {/* ---------- Achievements ---------- */}
                <section>
                  <h2 className="text-4xl font-serif text-gray-900 mb-4">
                    Achievements
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {badgeConfig.map((badge) => {
                      // Early Adopter has no target → always earned
                      const earned =
                        "target" in badge
                          ? badge.current >= badge.target
                          : true;

                      return (
                        <div
                          key={badge.key}
                          className={`border rounded-lg p-4 text-center flex flex-col items-center justify-center transition ${
                            earned
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-white"
                          }`}
                        >
                          <div className="border p-2 rounded-full w-fit">
                            <Star
                              className={`w-5 h-5 mx-auto ${
                                earned
                                  ? "text-yellow-500 fill-yellow-400"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>

                          <p className="mt-2 text-black">{badge.label}</p>

                          <p className="text-xs text-gray-500">
                            {"currentText" in badge
                              ? badge.currentText
                              : badge.current >= badge.target
                                ? `${badge.prefix ? badge.prefix + " " : ""}${badge.target}+ ${badge.suffix}`
                                : `${badge.prefix ? badge.prefix + " " : ""}${badge.current}/${badge.target} ${badge.suffix}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* ---------- Recent Contributions ---------- */}
                <section>
                  <div className="flex justify-between items-center mb-4 max-sm:flex-col">
                    <h2 className="text-4xl font-serif text-gray-900 max-lg:text-2xl max-sm:mb-2">
                      Recent Contributions
                    </h2>

                    <div className="inline-flex rounded-full border border-gray-300 bg-white ">
                      {(
                        [
                          { label: "All", value: "all" },
                          { label: "Reviews", value: "review" },
                          { label: "Wardrobe", value: "wardrobe" },
                        ] as const
                      ).map((filter) => (
                        <button
                          key={filter.value}
                          onClick={() => setActivityFilter(filter.value)}
                          className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                            activityFilter === filter.value
                              ? "bg-black text-white shadow-sm"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
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
                          onClick={() =>
                            setVisibleActivityCount((prev) => prev + 5)
                          }
                          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-900 transition"
                        >
                          Load More →
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <EditProfileModal
          user={{ ...user, favPerfumesDisplay: signatureScents }}
          onClose={() => {
            setShowEditModal(false);
            setActiveEditField(null);
          }}
          activeEditField={activeEditField}
          onSuccess={() => {
            setShowEditModal(false);
            fetchProfile();
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
