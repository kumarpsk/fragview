"use client";
import React, { useState, useTransition, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { LogIn, Sparkles, X, Clock } from "lucide-react";
import SimilarFragrances from "@/components/ui/SimilarFragrances";
import ImageUpload from "@/components/upload/ImageUpload";
import ReviewActionButtons from "@/components/reviews/ReviewActionButtons";
import MentionTextarea from "@/components/ui/MentionTextarea";
import { useAuthModal } from "@/components/auth/AuthModal";
import { submitReview } from "./actions";
import EditReviewModal from "@/components/reviews/EditReviewModal";
import { parseReviewMentions } from "@/lib/parseMentions";
import AddToWardrobeModal from "@/components/perfumes/AddToWardrobeModal";

// INLINE DEBOUNCE HELPER
function debounceFunc<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface PerfumeDoc {
  _id: string;
  brand_name: string;
  variant_name: string;
  slug?: string;
  gender?: string;
  rating?: number;
  image?: string;
  accords?: { name: string; width?: number; strength?: number }[];
  pyramids?: { top?: string[]; middle?: string[]; base?: string[] };
  perfumers?: string[];
  perfume_overview?: string;
  longevity?: number;
  sillage?: number;
  reminds_me?: string[];
  created_at?: number | string;
  ai_summary?: {
    generated_at: Date;
    review_count: number;
    summary: {
      overall_sentiment: "positive" | "mixed" | "negative";
      summary_text: string;
      common_likes: string[];
      common_dislikes: string[];
    };
    last_updated: Date;
    needs_refresh: boolean;
  } | null;
}

interface ReviewLite {
  id: string;
  rating: number;
  text?: string | null;
  photos?: string[];
  helpfulCount?: number;
  userVote?: "UP" | "DOWN" | null;
  createdAt: string;
  isEdited?: boolean;
  editedAt?: string | null;
  isDeleted?: boolean;
  user: {
    id: string;
    username: string;
    image?: string | null;
    xp: number;
    level: string;
    badges: string[];
  };
}

interface Props {
  perfume: PerfumeDoc;
  rating: number;
  isSignedIn: boolean;
  canRate: boolean;
  reviews: ReviewLite[];
  reviewCount: number;
  slug: string;
  initialIsFollowing: boolean;
}

// Accord color mapping function
const getAccordColor = (accordName: string): string => {
  const colors: { [key: string]: string } = {
    rose: "#ec4899",
    jasmine: "#f472b6",
    violet: "#a855f7",
    iris: "#c084fc",
    ylang: "#e879f9",
    tuberose: "#f0abfc",
    neroli: "#fbbf24",
    lavender: "#a78bfa",
    citrus: "#fbbf24",
    lemon: "#fde047",
    bergamot: "#fcd34d",
    orange: "#fb923c",
    grapefruit: "#fdba74",
    mandarin: "#fbbf24",
    woody: "#92400e",
    sandalwood: "#b45309",
    cedar: "#78350f",
    oud: "#451a03",
    patchouli: "#7c2d12",
    vetiver: "#65a30d",
    spicy: "#dc2626",
    cinnamon: "#b91c1c",
    pepper: "#991b1b",
    ginger: "#ea580c",
    cardamom: "#c2410c",
    fresh: "#10b981",
    "fresh spicy": "#10b981",
    aquatic: "#06b6d4",
    marine: "#0891b2",
    mint: "#34d399",
    green: "#22c55e",
    vanilla: "#fef3c7",
    caramel: "#fcd34d",
    chocolate: "#78350f",
    coffee: "#451a03",
    honey: "#fbbf24",
    almond: "#fed7aa",
    musk: "#9ca3af",
    musky: "#9ca3af",
    amber: "#f59e0b",
    leather: "#92400e",
    animalic: "#6b7280",
    aromatic: "#8b5cf6",
    herbal: "#84cc16",
    medicinal: "#22d3ee",
    fruity: "#f472b6",
    apple: "#86efac",
    peach: "#fdba74",
    berry: "#f87171",
    tropical: "#fbbf24",
    powdery: "#d4d4d8",
    talc: "#e4e4e7",
    earthy: "#78350f",
    mossy: "#65a30d",
    sweet: "#fda4af",
    smoky: "#52525b",
    incense: "#71717a",
    "warm spicy": "#dc2626",
    warm: "#f59e0b",
    floral: "#ec4899",
  };

  const lowerName = accordName.toLowerCase().trim();
  if (colors[lowerName]) return colors[lowerName];

  for (const [key, color] of Object.entries(colors)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return color;
    }
  }

  const hash = accordName.charCodeAt(0) % 10;
  const defaultColors = [
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#22c55e",
    "#a855f7",
    "#fb923c",
    "#14b8a6",
  ];

  return defaultColors[hash];
};

function getSillageLabel(value: number): string {
  if (value <= 1.5) return "Intimate";
  if (value <= 3.5) return "Moderate";
  return "Strong";
}

function getLongevityHrsLabel(value: number): string {
  const safeValue = Math.max(0, Math.min(5, value));
  if (safeValue >= 4.9) return "12+ hrs";
  const hours = safeValue * 2.4;
  return `${parseFloat(hours.toFixed(1))} hrs`;
}

function getPosition(value: number): number {
  return (value / 5) * 100;
}

export default function PerfumeDetailClient({
  perfume,
  rating,
  isSignedIn,
  canRate,
  reviews,
  reviewCount,
  slug,
  initialIsFollowing,
}: Props) {
  const { open } = useAuthModal();
  const { data: session } = useSession();
  const [expanded, setExpanded] = useState(false);

  const [userRating, setUserRating] = useState<number>(0);
  const [userLongevity, setUserLongevity] = useState<number>(0);
  const [userSillage, setUserSillage] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const snapshotRef = useRef<HTMLDivElement>(null);

  const [showWardrobeModal, setShowWardrobeModal] = useState(false);
  const [wardrobeSuccess, setWardrobeSuccess] = useState(false);

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingReviewText, setEditingReviewText] = useState("");

  // --- COOLING PERIOD LOGIC ---
  const isCoolingPeriodActive = React.useMemo(() => {
    if (!perfume.created_at) return false;
    const createdTime =
      typeof perfume.created_at === "number"
        ? perfume.created_at * 1000
        : new Date(perfume.created_at).getTime();
    const now = Date.now();
    const diffTime = Math.abs(now - createdTime);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 30;
  }, [perfume.created_at]);

  const remainingDays = React.useMemo(() => {
    if (!perfume.created_at) return 0;
    const createdTime =
      typeof perfume.created_at === "number"
        ? perfume.created_at * 1000
        : new Date(perfume.created_at).getTime();
    const releaseDate = new Date(createdTime);
    const unlockDate = new Date(releaseDate);
    unlockDate.setDate(releaseDate.getDate() + 30);
    const diffTime = unlockDate.getTime() - Date.now();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [perfume.created_at]);

  const transformedAccords =
    perfume.accords?.map((a) => ({
      name: a.name,
      strength:
        typeof a.strength === "number"
          ? a.strength
          : a.width
            ? Math.round(Math.min(5, Math.max(1, (a.width / 100) * 5)))
            : 3,
      width: a.width,
    })) || [];

  const topNotes = perfume.pyramids?.top?.map((n) => ({ name: n })) || [];
  const middleNotes = perfume.pyramids?.middle?.map((n) => ({ name: n })) || [];
  const baseNotes = perfume.pyramids?.base?.map((n) => ({ name: n })) || [];

  // --- DEBOUNCED SUBMIT HANDLER ---
  const debouncedSubmit = useCallback(
    debounceFunc((field: string, value: number) => {
      if (isCoolingPeriodActive) return;
      const formData = new FormData();
      formData.append(field, String(value));
      submitReview(slug, formData).then((res) => {
        if (!res.ok) console.error("Auto-save failed:", res.error);
      });
    }, 500),
    [slug, isCoolingPeriodActive],
  );

  const handleSliderChange = (
    field: "longevity" | "sillage",
    value: number,
  ) => {
    if (!isSignedIn) {
      open({
        mode: "signin",
        reason: `Sign in to rate`,
        callbackUrl: `/perfumes/${slug}`,
      });
      return;
    }
    if (isCoolingPeriodActive) return;

    if (field === "longevity") setUserLongevity(value);
    if (field === "sillage") setUserSillage(value);

    debouncedSubmit(field, value);
  };

  const handleRatingChange = (value: number) => {
    if (!isSignedIn) {
      open({
        mode: "signin",
        reason: `Sign in to rate`,
        callbackUrl: `/perfumes/${slug}`,
      });
      return;
    }
    if (isCoolingPeriodActive) return;

    setUserRating(value);
    const formData = new FormData();
    formData.append("rating", String(value));
    startTransition(() => {
      submitReview(slug, formData);
    });
  };

  const toggleFollowThread = async () => {
    if (!isSignedIn) {
      open({ mode: "signin", reason: "Sign in to follow" });
      return;
    }

    const prevState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      const { toggleFollowThread: toggle } =
        await import("@/app/actions/thread");
      const result = await toggle(slug);

      if (result.error) {
        setIsFollowing(prevState);
        console.error("Follow error:", result.error);
      } else {
        setIsFollowing(result.isFollowing);
      }
    } catch (error) {
      setIsFollowing(prevState);
      console.error("Follow error:", error);
    }
  };

  const handleSnapshot = async () => {
    if (!snapshotRef.current) return;
    try {
      const [{ default: html2canvas }, { default: QRCode }] = await Promise.all(
        [import("html2canvas"), import("qrcode")],
      );
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://fragview.com/perfumes/${slug}`,
        {
          width: 100,
          margin: 1,
          color: { dark: "#10b981", light: "#ffffff" },
        },
      );
      let imageDataUrl = "";
      if (perfume.image) {
        try {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.src = perfume.image;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            setTimeout(reject, 5000);
          });
          imageDataUrl = perfume.image;
        } catch (err) {
          imageDataUrl = "";
        }
      }
      const postcard = document.createElement("div");
      postcard.style.cssText = `position: absolute; left: -9999px; width: 1080px; height: 1920px; padding: 50px; background: linear-gradient(135deg, #FAFFF5 0%, #F0FDF4 100%); font-family: system-ui, -apple-system, sans-serif;`;
      postcard.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
            <img src="/logo.svg" alt="FragView Logo" style="height: 180px; width: auto;" />
            <img src="${qrCodeDataUrl}" style="width: 100px; height: 100px;" alt="QR Code" />
          </div>
          <div style="background: linear-gradient(135deg, #d1fae5 0%, #fed7aa 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 30px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; min-height: 550px;">
            ${imageDataUrl ? `<img src="${imageDataUrl}" style="max-width: 100%; max-height: 550px; object-fit: contain; border-radius: 16px;" crossorigin="anonymous" />` : `<div style="width: 100%; height: 550px; display: flex; align-items: center; justify-content: center; color: #10b981; font-size: 72px;">✨</div>`}
          </div>
          <div style="background: linear-gradient(to right, #10b981, #f97316); border-radius: 12px; padding: 28px 40px; margin-bottom: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); text-align: center;">
            <h1 style="font-size: 58px; font-weight: 900; color: #1f2937; margin: 0 0 8px 0; line-height: 1.1; letter-spacing: 1px;">${perfume.variant_name}</h1>
            <p style="font-size: 38px; color: #374151; font-weight: 700; margin: 0; letter-spacing: 0.5px;">${perfume.brand_name}</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 28px;">
            <div style="background: white; border-radius: 18px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              <p style="font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1. 5px; margin: 0 0 14px 0; font-weight: 700; text-align: center;">RATING</p>
              <div style="display: flex; gap: 5px; margin-bottom: 12px; justify-content: center;">${[1, 2, 3, 4, 5].map((star) => `<span style="color: ${star <= Math.round(userRating || rating) ? "#fb923c" : "#d1d5db"}; font-size: 24px;">★</span>`).join("")}</div>
              <p style="font-size: 36px; font-weight: 900; color: #1f2937; margin: 0; text-align: center;">${(userRating || rating).toFixed(1)}</p>
            </div>
            <div style="background: white; border-radius: 18px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              <p style="font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 14px 0; font-weight: 700; text-align: center;">SILLAGE</p>
              <div style="height: 14px; background: #e5e7eb; border-radius: 7px; overflow: hidden; margin-bottom: 12px;"><div style="height: 100%; width: ${getPosition(userSillage || perfume.sillage || 0)}%; background: linear-gradient(to right, #10b981, #f97316);"></div></div>
              <p style="font-size: 28px; font-weight: 900; color: #1f2937; margin: 0; text-align: center;">${getSillageLabel(userSillage || perfume.sillage || 0)}</p>
            </div>
            <div style="background: white; border-radius: 18px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              <p style="font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 14px 0; font-weight: 700; text-align: center;">LONGEVITY</p>
              <div style="height: 14px; background: #e5e7eb; border-radius: 7px; overflow: hidden; margin-bottom: 12px;"><div style="height: 100%; width: ${getPosition(userLongevity || perfume.longevity || 0)}%; background: linear-gradient(to right, #10b981, #f97316);"></div></div>
              <p style="font-size: 28px; font-weight: 900; color: #1f2937; margin: 0; text-align: center;">${getLongevityHrsLabel(userLongevity || perfume.longevity || 0)}</p>
            </div>
          </div>
          ${
            transformedAccords.length > 0
              ? `<div style="background: white; border-radius: 18px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0. 08);"><p style="font-size: 17px; font-weight: 800; color: #1f2937; margin: 0 0 18px 0; text-transform: uppercase; letter-spacing: 1.2px;">Main Accords</p><div style="display: flex; flex-wrap: wrap; gap: 10px;">${transformedAccords
                  .slice(0, 6)
                  .map(
                    (a) =>
                      `<span style="background: ${getAccordColor(a.name)}; color: white; padding: 10px 18px; border-radius: 20px; font-size: 15px; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">${a.name}</span>`,
                  )
                  .join("")}</div></div>`
              : ""
          }
          <div style="margin-top: auto; padding-top: 24px; border-top: 4px solid #10b981; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 17px; color: #4b5563; font-weight: 600; line-height: 1.6;">
              <div style="margin-bottom: 8px;"><span style="font-weight: 800; color: #1f2937;">Gender:</span> ${perfume.gender || "—"}</div>
              <div><span style="font-weight: 800; color: #1f2937;">Perfumer:</span> ${perfume.perfumers?.join(", ") || "—"}</div>
            </div>
            <div style="text-align: right; font-size: 15px; color: #9ca3af; font-weight: 600;">fragview.com/perfumes/${slug}</div>
          </div>
        </div>`;
      document.body.appendChild(postcard);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const canvas = await html2canvas(postcard, {
        backgroundColor: "#FAFFF5",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 1080,
        height: 1920,
      });
      document.body.removeChild(postcard);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            alert("Failed to generate image");
            return;
          }
          const url = URL.createObjectURL(blob);
          const overlay = document.createElement("div");
          overlay.style.cssText =
            "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;";
          const dialog = document.createElement("div");
          dialog.style.cssText =
            "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:24px;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.2);z-index:9999;max-width:90vw;";
          dialog.innerHTML = `<h3 style="margin:0 0 16px 0;font-size:18px;font-weight:600;color:#1f2937;">Share Perfume Card</h3><div style="display:flex;gap:12px;flex-direction:column;"><button id="share-whatsapp"      class="inline-flex items-center justify-center h-[40px] px-4 gap-3
             bg-[#211F1C] rounded-xl font-inter font-medium
             text-[16px] leading-[26px] text-white
             hover:bg-[#211F1C]/90 transition-colors"
        ">Share via WhatsApp</button><button id="share-download"    class="inline-flex items-center justify-between h-[40px] pl-4 pr-1 gap-3
             border border-[#211F1C] bg-transparent rounded-xl
             font-inter font-medium text-[16px] leading-[26px]
             text-[#211F1C] hover:bg-[#211F1C] hover:text-white
             transition-colors group">Download Image  <span class="flex items-center justify-center w-8 h-8 bg-[#211F1C] rounded-lg group-hover:bg-white">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          class="group-hover:hidden"
        >
          <path
            d="M7 17L17 7M17 7H7M17 7V17"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          class="hidden group-hover:block"
        >
          <path
            d="M7 17L17 7M17 7H7M17 7V17"
            stroke="#211F1C"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button></button><button id="share-close" style="padding:12px 24px;background:white;color:#6b7280;border:1px solid #d1d5db;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;">Close</button></div>`;
          document.body.appendChild(overlay);
          document.body.appendChild(dialog);
          const cleanup = () => {
            document.body.removeChild(overlay);
            document.body.removeChild(dialog);
            URL.revokeObjectURL(url);
          };
          document.getElementById("share-whatsapp")!.onclick = () => {
            const link = document.createElement("a");
            link.href = url;
            link.download = `${perfume.variant_name}-fragview.jpg`;
            link.click();
            setTimeout(
              () =>
                window.open(
                  `https://wa.me/?text=Check out ${perfume.variant_name} on Fragview!  https://fragview.com/perfumes/${slug}`,
                ),
              500,
            );
            cleanup();
          };
          document.getElementById("share-download")!.onclick = () => {
            const link = document.createElement("a");
            link.href = url;
            link.download = `${perfume.variant_name}-fragview.jpg`;
            link.click();
            cleanup();
          };
          document.getElementById("share-close")!.onclick = cleanup;
          overlay.onclick = cleanup;
        },
        "image/jpeg",
        0.95,
      );
    } catch (error) {
      console.error("Snapshot error:", error);
      alert(
        `Failed to generate snapshot: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  async function handleSubmitReview(formData: FormData) {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isSignedIn) {
      open({
        mode: "signin",
        reason: "Sign in to review",
        callbackUrl: `/perfumes/${slug}`,
      });
      return;
    }

    startTransition(async () => {
      if (!formData.get("text")) formData.set("text", reviewText);
      if (userRating > 0) formData.set("rating", String(userRating));
      if (userLongevity > 0) formData.set("longevity", String(userLongevity));
      if (userSillage > 0) formData.set("sillage", String(userSillage));

      if (uploadedPhotos.length > 0) {
        formData.set("photos", JSON.stringify(uploadedPhotos));
      }

      const result = await submitReview(slug, formData);
      if (!result.ok)
        setErrorMessage(result.error || "Failed to submit review.");
      else {
        setSuccessMessage("Review submitted successfully!");
        setReviewText("");
        setUploadedPhotos([]);
      }
    });
  }

  const addPhoto = (url: string) => {
    setUploadedPhotos((prev) => [...prev, url]);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const similarPerfumes = React.useMemo(() => {
    if (!perfume.reminds_me || perfume.reminds_me.length === 0) return [];
    return perfume.reminds_me.map((name, idx) => {
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      return {
        id: idx + 1000,
        name: name,
        brand: "",
        rating: 0,
        isVerified: false,
        slug: slug,
      };
    });
  }, [perfume.reminds_me]);

  const shortDescription = perfume.perfume_overview?.slice(0, 400)  || '';
  const shouldShowViewMore = (perfume.perfume_overview?.length || 0) > 400;
  return (
    <div className="text-gray-900">
      {/* Hero Section */}
      <section ref={snapshotRef} className="bg-[#FFF9EF]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-5">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-6">
            {/* Left - Image */}
            {/* Left - Image */}
            <div className="w-full lg:w-[520px] flex-shrink-0 flex items-center justify-center rounded-xl p-3 sm:p-4 lg:p-4">
              <div className="relative w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[390px] aspect-[3/4] rounded-xl overflow-hidden bg-[#FFF4E3]">
                {perfume.image ? (
                  <Image
                    src={perfume.image}
                    alt={perfume.variant_name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 260px, (max-width: 1024px) 320px, 420px"
                    priority
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 sm:w-14 sm:h-14 lg:w-20 lg:h-20 text-[#8A6A35]" />
                  </div>
                )}
              </div>
            </div>

            {/* Right - Details */}
            <div className="flex flex-col gap-5 lg:gap-5 w-full lg:flex-1 lg:p-4">
              {/* Top Info Block */}
              <div className="flex flex-col gap-3">
                {/* Gender Badge */}
                {perfume.gender && (
                  <span className="inline-flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-full w-fit">
                    <span className="font-inter font-medium text-[14px] leading-[20px] text-[#695129]">
                      {perfume.gender}
                    </span>
                  </span>
                )}

                {/* Brand Name */}
                <p className="font-inter font-medium text-[16px] lg:text-[18px] leading-[24px] lg:leading-[26px] text-[#211F1C]">
                  {perfume.brand_name}
                </p>

                {/* Perfume Name */}
                <h1 className="font-hedvig font-normal text-[32px] leading-[40px] lg:text-[52px] lg:leading-[64px] text-[#211F1C]">
                  {perfume.variant_name}
                </h1>

                {/* Perfumer */}
                {perfume.perfumers && perfume.perfumers.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-inter font-normal text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px] text-[#4A4946]">
                      Perfumer:
                    </span>
                    <span className="font-inter font-medium text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px] text-[#211F1C]">
                      {perfume.perfumers.join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Main Accords */}
              {transformedAccords.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="font-inter font-medium text-[16px] lg:text-[18px] leading-[24px] lg:leading-[26px] text-[#211F1C]">
                    Main Accords
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {transformedAccords.map((accord, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-full"
                      >
                        <span className="font-inter font-medium text-[14px] leading-[20px] text-[#695129]">
                          {accord.name}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {(topNotes.length > 0 ||
                middleNotes.length > 0 ||
                baseNotes.length > 0) && (
                <div className="flex flex-col gap-4">
                  {/* Head Notes */}
                  {topNotes.length > 0 && (
                    <div className="flex items-center gap-1">
                      {/* Top Note Icon */}
                      <svg
                        width="23"
                        height="26"
                        viewBox="0 0 23 26"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="flex-shrink-0"
                      >
                        <path d="M11.5 3L21 23H2L11.5 3Z" fill="#FDE2B6" />
                        <path d="M11.5 3L8 10H15L11.5 3Z" fill="#211F1C" />
                      </svg>
                      <span className="font-inter font-medium text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px] text-[#211F1C]">
                        Head Notes:
                      </span>
                      <span className="font-inter font-normal text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px] text-[#211F1C]">
                        {topNotes.map((n) => n.name).join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Heart Notes */}
                  {middleNotes.length > 0 && (
                    <div className="flex items-center gap-1">
                      {/* Heart Note Icon */}
                      <svg
                        width="23"
                        height="26"
                        viewBox="0 0 23 26"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="flex-shrink-0"
                      >
                        <path d="M11.5 3L21 23H2L11.5 3Z" fill="#FDE2B6" />
                        <rect
                          x="3"
                          y="12"
                          width="17"
                          height="5.6"
                          fill="#211F1C"
                        />
                      </svg>
                      <span className="font-inter font-medium text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px] text-[#211F1C]">
                        Heart Notes:
                      </span>
                      <span className="font-inter font-normal text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px] text-[#211F1C]">
                        {middleNotes.map((n) => n.name).join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Base Notes */}
                  {baseNotes.length > 0 && (
                    <div className="flex items-center gap-1">
                      {/* Base Note Icon */}
                      <svg
                        width="23"
                        height="26"
                        viewBox="0 0 23 26"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="flex-shrink-0"
                      >
                        <path d="M11.5 3L21 23H2L11.5 3Z" fill="#FDE2B6" />
                        <rect
                          x="2"
                          y="17"
                          width="19"
                          height="6"
                          fill="#211F1C"
                        />
                      </svg>
                      <span className="font-inter font-medium text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px] text-[#211F1C]">
                        Lasting Impressions:
                      </span>
                      <span className="font-inter font-normal text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px] text-[#211F1C]">
                        {baseNotes.map((n) => n.name).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-6 mt-2">
                <button
                  onClick={() => {
                    if (!isSignedIn) {
                      open({
                        mode: "signin",
                        reason: "Sign in to add to wardrobe",
                        callbackUrl: `/perfumes/${slug}`,
                      });
                    } else {
                      setShowWardrobeModal(true);
                    }
                  }}
                  className="inline-flex items-center justify-center h-[40px] px-4 gap-3 bg-[#211F1C] rounded-xl font-inter font-medium text-[16px] leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors"
                >
                  Add to Wardrobe
                </button>
                <button
                  onClick={handleSnapshot}
                  className="inline-flex items-center justify-between h-[40px] pl-4 pr-1 gap-3 border border-[#211F1C] bg-transparent rounded-xl font-inter font-medium text-[16px] leading-[26px] text-[#211F1C] hover:bg-[#211F1C] hover:text-white transition-colors group"
                >
                  Snapshot
                  <span className="flex items-center justify-center w-8 h-8 bg-[#211F1C] rounded-lg group-hover:bg-white">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="group-hover:hidden"
                    >
                      <path
                        d="M7 17L17 7M17 7H7M17 7V17"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="hidden group-hover:block"
                    >
                      <path
                        d="M7 17L17 7M17 7H7M17 7V17"
                        stroke="#211F1C"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </div>

              {/* Wardrobe Success Message */}
              {wardrobeSuccess && (
                <div className="p-3 bg-green-100 border border-green-300 rounded-lg text-sm text-green-800 font-medium text-center">
                  ✓ Added to wardrobe!
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-5 space-y-6 bg-white">
        {/* Wear Experience Section */}
        <div
          className={`flex flex-col gap-6 ${isCoolingPeriodActive ? "opacity-50 pointer-events-none filter grayscale" : ""}`}
        >
          {/* Section Header */}
          <div className="flex flex-col gap-1">
            <span className="font-hedvig text-[20px] leading-[28px] lg:text-[20px] lg:leading-[32px] text-[#8A6A35]">
              Wear experience
            </span>
            <h2 className="font-hedvig font-normal text-[32px] leading-[40px] lg:text-[39px] lg:leading-[56px] text-[#211F1C]">
              What living with this scent feels like
            </h2>
          </div>

          {/* Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-10 gap-4">
            {/* Overall Rating Card */}
            <div className="flex flex-col justify-between items-center p-4 gap-5 bg-white border border-[#E2E1E1] rounded-xl ">
              {/* Icon + Label */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-[#FEEBCE] rounded-lg">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      fill="#E4AF58"
                    />
                  </svg>
                </div>
                <span className="font-inter font-medium text-[20px] leading-[28px] text-[#211F1C]">
                  Overall Rating
                </span>
              </div>

              {/* Rating Value + Stars + Votes */}
              <div className="flex flex-col items-center gap-2 w-full">
                <span className="font-hedvig font-normal text-[48px] leading-[56px] text-[#211F1C]">
                  {(userRating || rating).toFixed(1)}
                  <span className="text-[24px]">/5</span>
                </span>

                <div className="flex items-center gap-1 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const currentRating = userRating || rating;
                    const isFilled = star <= Math.floor(currentRating);
                    const isHalf =
                      !isFilled &&
                      star === Math.ceil(currentRating) &&
                      currentRating % 1 >= 0.25;
                    const isEmpty = star > Math.ceil(currentRating);

                    return (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(star)}
                        type="button"
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        {isFilled ? (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                              fill="#FBC061"
                            />
                          </svg>
                        ) : isHalf ? (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <linearGradient id="halfStar">
                                <stop offset="50%" stopColor="#FBC061" />
                                <stop offset="50%" stopColor="transparent" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                              fill="url(#halfStar)"
                              stroke="#FBC061"
                              strokeWidth="1.5"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                              stroke="#FBC061"
                              strokeWidth="1.5"
                              fill="none"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>

                <span className="font-inter font-normal text-[14px] leading-[20px] text-[#737270]">
                  Based on {reviewCount} votes
                </span>
              </div>
            </div>

            {/* Sillage Card */}
            <div className="flex flex-col justify-between items-center p-4 gap-5 bg-white border border-[#E2E1E1] rounded-xl ">
              {/* Icon + Label */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-[#FEEBCE] rounded-lg">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 8H16M16 8C16 8 18 8 18 6C18 4 16 4 16 4"
                      stroke="#E4AF58"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M3 12H18M18 12C18 12 21 12 21 14C21 16 18 16 18 16"
                      stroke="#E4AF58"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4 16H12M12 16C12 16 14 16 14 18C14 20 12 20 12 20"
                      stroke="#E4AF58"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="font-inter font-medium text-[20px] leading-[28px] text-[#211F1C]">
                  Sillage
                </span>
              </div>

              {/* Value + Slider + Labels */}
              <div className="flex flex-col items-center gap-4 w-full">
                <span className="font-hedvig font-normal text-[48px] leading-[56px] text-[#211F1C]">
                  {getSillageLabel(userSillage || perfume.sillage || 0)}
                </span>

                {/* Progress Bar with Input */}
                <div className="relative w-full h-[10px]">
                  <div className="absolute w-full h-full bg-[#FFF4E3] rounded-xl overflow-hidden">
                    <div
                      className="h-full bg-[#B28845] rounded-xl transition-all"
                      style={{
                        width: `${getPosition(userSillage || perfume.sillage || 0)}%`,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={userSillage || perfume.sillage || 0}
                    onChange={(e) =>
                      handleSliderChange("sillage", parseFloat(e.target.value))
                    }
                    className="range-slider absolute top-0 w-full h-2.5  bg-transparent cursor-pointer"
                  />
                </div>

                <div className="flex justify-between w-full">
                  <span className="font-inter font-normal text-[14px] leading-[20px] text-[#737270]">
                    Intimate
                  </span>
                  <span className="font-inter font-normal text-[14px] leading-[20px] text-[#737270]">
                    Moderate
                  </span>
                  <span className="font-inter font-normal text-[14px] leading-[20px] text-[#737270]">
                    Strong
                  </span>
                </div>
              </div>
            </div>

            {/* Longevity Card */}
            <div className="flex flex-col justify-between items-center p-4 gap-5 bg-white border border-[#E2E1E1] rounded-xl ">
              {/* Icon + Label */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-[#FEEBCE] rounded-lg">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="#E4AF58"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 7V12L15 15"
                      stroke="#E4AF58"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="font-inter font-medium text-[20px] leading-[28px] text-[#211F1C]">
                  Longevity
                </span>
              </div>

              {/* Value + Slider + Labels */}
              <div className="flex flex-col items-center gap-4 w-full">
                <span className="font-hedvig font-normal text-[48px] leading-[56px] text-[#211F1C]">
                  {getLongevityHrsLabel(
                    userLongevity || perfume.longevity || 0,
                  ).replace(" hrs", "")}
                  <span className="text-[24px]"> hours</span>
                </span>

                {/* Progress Bar with Input */}
                <div className="relative w-full h-[10px]">
                  <div className="absolute w-full h-full bg-[#FFF4E3] rounded-xl overflow-hidden">
                    <div
                      className="h-full bg-[#B28845] rounded-xl transition-all"
                      style={{
                        width: `${getPosition(userLongevity || perfume.longevity || 0)}%`,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={userLongevity || perfume.longevity || 0}
                    onChange={(e) =>
                      handleSliderChange(
                        "longevity",
                        parseFloat(e.target.value),
                      )
                    }
                    className="range-slider absolute top-0 w-full h-2.5  bg-transparent cursor-pointer"
                  />
                </div>

                <div className="flex justify-between w-full">
                  <span className="font-inter font-normal text-[14px] leading-[20px] text-[#737270]">
                    0 hr
                  </span>
                  <span className="font-inter font-normal text-[14px] leading-[20px] text-[#737270]">
                    6 hr
                  </span>
                  <span className="font-inter font-normal text-[14px] leading-[20px] text-[#737270]">
                    12 hr+
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About This Fragrance Section */}
        {perfume.perfume_overview && (
          <section className="bg-[#FFF9EF] -mx-4 sm:-mx-6 lg:-mx-[72px] px-4 sm:px-6 lg:px-[72px] py-5">
            <div className="flex flex-col gap-5">
              {/* Header */}
              <div className="flex flex-col gap-1">
                <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
                  Behind the making
                </span>
                <h2 className="font-hedvig font-normal text-[32px] leading-[40px] lg:text-[40px] lg:leading-[56px] text-[#211F1C]">
                  About this fragrance
                </h2>
              </div>

              {/* Description */}
              <p
              
                className='font-inter font-normal text-[16px] lg:text-[18px] leading-[24px] lg:leading-[26px] text-[#211F1C]'
              >
                <span className="font-semibold">{perfume.variant_name}</span> by{" "}
                <span className="font-semibold">{perfume.brand_name}</span>{" "}
                {expanded ? perfume.perfume_overview : shortDescription}.
                  {!expanded && shouldShowViewMore && '...'}

              </p>
           
               {shouldShowViewMore && ( <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="self-start font-inter font-medium text-[16px] text-[#8A6A35] hover:underline flex items-center gap-1"
              >
                {expanded ? "Read less" : "Read more"}{" "}
                      <svg className="w-4 h-4 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        <path d="M6 9L12 15L18 9" stroke="#8A6A35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
              </button> )}

              {/* Divider */}
              <div className="w-full h-px bg-[#E2E1E1]" />

              {/* Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-10">
                {/* Launch Year */}
                <div className="flex flex-col items-center gap-1">
                  <span className="font-inter font-normal text-[14px] leading-[20px] text-[#737270]">
                    Launch Year
                  </span>
                  <span className="font-inter font-medium text-[18px] lg:text-[20px] leading-[26px] lg:leading-[28px] text-[#211F1C]">
                    {(perfume as any).launch_year ||
                      (perfume as any).year ||
                      "—"}
                  </span>
                </div>

                {/* Concentration */}
                <div className="flex flex-col items-center gap-1">
                  <span className="font-inter font-normal text-[14px] leading-[20px] text-[#737270]">
                    Concentration
                  </span>
                  <span className="font-inter font-medium text-[18px] lg:text-[20px] leading-[26px] lg:leading-[28px] text-[#211F1C]">
                    {(perfume as any).concentration || "Eau de Parfum"}
                  </span>
                </div>

                {/* Perfumer */}
                <div className="flex flex-col items-center gap-1">
                  <span className="font-inter font-normal text-[14px] leading-[20px] text-[#737270]">
                    Perfumer
                  </span>
                  <span className="font-inter font-medium text-[18px] lg:text-[20px] leading-[26px] lg:leading-[28px] text-[#211F1C]">
                    {perfume.perfumers?.join(", ") || "—"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        <div
          style={{
            contentVisibility: "auto",
            containIntrinsicSize: "1px 1000px",
          }}
          className="-mx-4 sm:-mx-6 lg:-mx-[72px] px-4 sm:px-6 lg:px-[72px] py-5"
        >
          <SimilarFragrances currentPerfumeId={perfume._id.toString()} />

          {/* AI-Powered Summary Section */}
          {perfume.ai_summary?.summary && (
            <section className="bg-[#FFF9EF] -mx-4 sm:-mx-6 lg:-mx-[72px] px-4 sm:px-6 lg:px-[72px] py-5 mt-2">
              <div className="flex flex-col gap-5">
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-10">
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
                      Based on community talks
                    </span>
                    <h2 className="font-hedvig font-normal text-[32px] leading-[40px] lg:text-[40px] lg:leading-[56px] text-[#211F1C]">
                      AI-Powered summary
                    </h2>
                  </div>

                  {/* Sentiment Badge */}
                  <div className="flex items-center justify-center px-4 py-2 bg-[#FDE2B6] rounded-full w-fit">
                    <span className="font-inter font-medium text-[16px]  leading-[24px] lg:leading-[26px] text-[#695129] capitalize">
                      {perfume.ai_summary.summary.overall_sentiment || "Mixed"}{" "}
                      Reviews
                    </span>
                  </div>
                </div>

                {/* Summary Text */}
                <p className="font-inter font-semibold text-[18px] lg:text-[20px] leading-[26px] lg:leading-[32px] text-[#211F1C]">
                  {perfume.ai_summary.summary.summary_text}
                </p>

                {/* Divider */}
                <div className="w-full h-px bg-[#E2E1E1]" />

                {/* Likes & Dislikes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-5">
                  {/* What people love */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1">
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.33333 14.6667V26.6667M4 17.3333V24C4 25.4728 5.19391 26.6667 6.66667 26.6667H22.7387C24.7792 26.6667 26.4888 25.1587 26.7413 23.1333L27.808 14.4667C28.1147 12.0107 26.2029 9.86667 23.7287 9.86667H19.3333V6.13333C19.3333 4.95493 18.3784 4 17.2 4C16.6107 4 16.0867 4.36267 15.8827 4.91467L12.4693 13.3333H6.66667C5.19391 13.3333 4 14.5272 4 16V17.3333Z"
                          stroke="#047857"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="font-inter font-semibold text-[20px]  leading-[28px] lg:leading-[32px] text-[#047857]">
                        What people love
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {perfume.ai_summary.summary.common_likes?.map(
                        (like, idx) => (
                          <span
                            key={idx}
                            className="font-inter font-normal text-[16px] lg:text-[20px] leading-[24px] lg:leading-[28px] text-[#211F1C]"
                          >
                            {like}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Common Concerns */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1">
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.33333 17.3333V5.33333M4 14.6667V8C4 6.52724 5.19391 5.33333 6.66667 5.33333H22.7387C24.7792 5.33333 26.4888 6.84133 26.7413 8.86667L27.808 17.5333C28.1147 19.9893 26.2029 22.1333 23.7287 22.1333H19.3333V25.8667C19.3333 27.0451 18.3784 28 17.2 28C16.6107 28 16.0867 27.6373 15.8827 27.0853L12.4693 18.6667H6.66667C5.19391 18.6667 4 17.4728 4 16V14.6667Z"
                          stroke="#BE133D"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="font-inter font-semibold text-[20px] leading-[28px] lg:leading-[32px] text-[#BE133D]">
                        Common Concerns
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {perfume.ai_summary.summary.common_dislikes?.map(
                        (dislike, idx) => (
                          <span
                            key={idx}
                            className="font-inter font-normal text-[16px] lg:text-[20px] leading-[24px] lg:leading-[28px] text-[#211F1C]"
                          >
                            {dislike}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3">
                  <div className="w-full h-px bg-[#E2E1E1]" />
                  <p className="font-inter font-normal text-[14px] lg:text-[18px] leading-[20px] lg:leading-[26px] text-[#4A4946] text-center">
                    AI-generated summary based on{" "}
                    {perfume.ai_summary.review_count || reviewCount} user
                    reviews · May not reflect all opinions
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Community Reviews Section */}
          <section className="bg-white py-5">
            <div className="flex flex-col gap-8">
              {/* Header Row */}
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                {/* Title Block */}
                <div className="flex flex-col gap-1">
                  <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
                    Customer insights
                  </span>
                  <h2 className="font-hedvig font-normal text-[32px] leading-[40px] lg:text-[40px] lg:leading-[56px] text-[#211F1C]">
                    Community Reviews
                  </h2>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                  {/* Sort Dropdown */}
                  <button className="inline-flex items-center justify-between h-[40px] px-4 gap-3 border border-[#C4C4C3] rounded-xl font-inter font-medium text-[16px] leading-[26px] text-[#211F1C] bg-white hover:bg-[#F5F0E8] transition-colors min-w-[170px]">
                    <span>Most Recent</span>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="#211F1C"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Follow Button */}
                  <button
                    onClick={toggleFollowThread}
                    className={`inline-flex items-center justify-center h-[40px] px-6 gap-2 border rounded-lg font-inter font-medium text-[16px] leading-[26px] transition-colors ${
                      isFollowing
                        ? "bg-[#ECE0CF] border-[#8A6A35] text-[#695129]"
                        : "bg-white border-[#C4C4C3] text-[#211F1C] hover:bg-[#F5F0E8]"
                    }`}
                  >
                    <span>Follow</span>
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Write a Review Button */}
                  <button
                    onClick={() => {
                      if (!isSignedIn) {
                        open({
                          mode: "signin",
                          reason: "Sign in to write a review",
                          callbackUrl: `/perfumes/${slug}#review-section`,
                        });
                      } else {
                        document
                          .getElementById("review-form")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="inline-flex items-center justify-between h-[40px] pl-4 pr-1 gap-3 bg-[#211F1C] rounded-xl font-inter font-medium text-[16px] leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors"
                  >
                    Write a review
                    <span className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                      <svg
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 17L17 7M17 7H7M17 7V17"
                          stroke="#211F1C"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

              {/* Cooling Period Overlay */}
              {isCoolingPeriodActive && (
                <div className="bg-[#FFF9EF] border border-[#E2E1E1] rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-[#FEEBCE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-[#8A6A35]" />
                  </div>
                  <h3 className="font-hedvig font-normal text-[24px] leading-[32px] text-[#211F1C] mb-2">
                    Reviews are Cooling Down
                  </h3>
                  <p className="font-inter font-normal text-[16px] leading-[24px] text-[#4A4946] max-w-md mx-auto mb-4">
                    To ensure authentic experiences, reviews for this new
                    fragrance will open in {remainingDays} days.
                  </p>
                  <span className="inline-flex items-center justify-center px-4 py-2 bg-[#ECE0CF] rounded-full font-inter font-medium text-[14px] leading-[20px] text-[#695129]">
                    Coming Soon
                  </span>
                </div>
              )}

              {/* Reviews List */}
              <div
                className={`flex flex-col gap-10 ${isCoolingPeriodActive ? "opacity-50 pointer-events-none filter grayscale" : ""}`}
              >
                {reviews.length === 0 ? (
                  <div className="bg-white border border-[#C4C4C3] rounded-xl p-12 text-center">
                    <p className="font-inter font-normal text-[18px] leading-[26px] text-[#737270]">
                      No reviews yet. Be the first to review!
                    </p>
                  </div>
                ) : (
                  <>
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="bg-white border border-[#C4C4C3] rounded-xl p-6 flex flex-col gap-8"
                      >
                        {/* Review Content */}
                        <div className="flex flex-col gap-4">
                          {/* Stars & Date Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  width="30"
                                  height="30"
                                  viewBox="0 0 30 30"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M15 2.5L18.8625 10.3375L27.5 11.5875L21.25 17.6625L22.725 26.25L15 22.2125L7.275 26.25L8.75 17.6625L2.5 11.5875L11.1375 10.3375L15 2.5Z"
                                    fill={
                                      star <= Math.round(r.rating)
                                        ? "#FBC061"
                                        : "none"
                                    }
                                    stroke={
                                      star <= Math.round(r.rating)
                                        ? "none"
                                        : "#FBC061"
                                    }
                                    strokeWidth="1.5"
                                  />
                                </svg>
                              ))}
                            </div>
                            <span className="font-inter font-normal text-[18px] leading-[26px] text-[#737270]">
                              {new Date(r.createdAt)
                                .toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })
                                .replace(/\//g, "-")}
                            </span>
                          </div>

                          {/* Title - Use first sentence or first 50 chars as title */}
                          {r.text && (
                            <h4 className="font-inter font-medium text-[24px] lg:text-[28px] leading-[32px] lg:leading-[36px] text-[#211F1C]">
                              {r.text.split(".")[0].length > 60
                                ? r.text.substring(0, 60) + "..."
                                : r.text.split(".")[0]}
                            </h4>
                          )}

                          {/* Review Body */}
                          {r.isDeleted ? (
                            <p className="font-inter font-normal text-[20px] lg:text-[24px] leading-[36px] lg:leading-[42px] text-[#737270] italic">
                              [This review has been deleted]
                            </p>
                          ) : (
                            <div
                              className="font-inter font-normal text-[18px] lg:text-[24px] leading-[32px] lg:leading-[42px] text-[#4A4946]"
                              dangerouslySetInnerHTML={{
                                __html: parseReviewMentions(r.text || ""),
                              }}
                            />
                          )}

                          {/* Review Photos */}
                          {r.photos && r.photos.length > 0 && !r.isDeleted && (
                            <div className="flex gap-3 mt-2">
                              {r.photos.map((p, idx) => (
                                <div
                                  key={idx}
                                  className="relative w-[100px] h-[100px] lg:w-[150px] lg:h-[150px] shrink-0"
                                >
                                  <Image
                                    src={p}
                                    alt={`Photo ${idx + 1}`}
                                    fill
                                    className="object-cover rounded-xl border border-[#E2E1E1] cursor-pointer hover:scale-105 transition-transform"
                                    sizes="150px"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-[#E2E1E1]" />

                        {/* Footer Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          {/* Author */}
                          <a
                            href={`/u/${r.user.username}`}
                            className="font-inter font-normal text-[20px] lg:text-[24px] leading-[28px] lg:leading-[32px] text-[#211F1C] hover:text-[#8A6A35] transition-colors"
                          >
                            {r.user.username}
                          </a>

                          {/* Actions */}
                          <div className="flex items-center gap-4">
                            {/* Helpful Actions */}
                            <div className="flex items-center gap-4">
                              <span className="font-inter font-normal text-[18px] leading-[26px] text-[#737270]">
                                Helpful?
                              </span>
                              <ReviewActionButtons
                                reviewId={r.id}
                                initialHelpfulCount={r.helpfulCount || 0}
                                userVote={r.userVote}
                                isLoggedIn={isSignedIn}
                              />
                            </div>

                            {/* Divider */}
                            <div className="w-px h-6 bg-[#E2E1E1]" />

                            {/* Report */}
                            <button className="flex items-center gap-2 font-inter font-normal text-[18px] leading-[26px] text-[#737270] hover:text-[#211F1C] transition-colors">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M4 15V21M4 15L12 9L14.5 11L21 5M4 15V6C4 5.44772 4.44772 5 5 5H7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Report
                            </button>

                            {/* Edit/Delete for own reviews */}
                            {isSignedIn &&
                              session?.user?.id === r.user.id &&
                              !r.isDeleted && (
                                <>
                                  <div className="w-px h-6 bg-[#E2E1E1]" />
                                  <button
                                    onClick={() => {
                                      setEditingReviewId(r.id);
                                      setEditingReviewText(r.text || "");
                                    }}
                                    className="flex items-center gap-2 font-inter font-normal text-[18px] leading-[26px] text-[#737270] hover:text-[#211F1C] transition-colors"
                                  >
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    Edit
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (
                                        !confirm(
                                          "Are you sure you want to delete this review? This action cannot be undone.",
                                        )
                                      )
                                        return;
                                      try {
                                        const res = await fetch(
                                          `/api/reviews/actions?reviewId=${r.id}`,
                                          { method: "DELETE" },
                                        );
                                        if (res.ok) window.location.reload();
                                        else alert("Failed to delete review");
                                      } catch {
                                        alert("Network error");
                                      }
                                    }}
                                    className="flex items-center gap-2 font-inter font-normal text-[18px] leading-[26px] text-[#737270] hover:text-red-600 transition-colors"
                                  >
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M3 6H5H21"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    Delete
                                  </button>
                                </>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Load More Button */}
                    {reviews.length >= 4 && (
                      <div className="flex justify-center">
                        <button className="inline-flex items-center justify-between h-[50px] pl-4 pr-1 gap-3 bg-[#211F1C] rounded-xl font-inter font-medium text-[18px] leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors">
                          Load More
                          <span className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 12H19M19 12L12 5M19 12L12 19"
                                stroke="#211F1C"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Write Review Form */}
              <div
                id="review-form"
                className={`bg-white border border-[#C4C4C3] rounded-xl p-6 ${isCoolingPeriodActive ? "opacity-50 pointer-events-none filter grayscale" : ""}`}
              >
                <h3 className="font-inter font-medium text-[24px] leading-[32px] text-[#211F1C] mb-6">
                  Leave Your Review
                </h3>

                {!isSignedIn ? (
                  <div className="bg-[#FFF9EF] border border-[#E2E1E1] rounded-xl p-8 text-center">
                    <p className="font-inter font-normal text-[18px] leading-[26px] text-[#4A4946] mb-4">
                      Please sign in to leave a review
                    </p>
                    <button
                      onClick={() =>
                        open({
                          mode: "signin",
                          reason: "Sign in to leave a review",
                          callbackUrl: `/perfumes/${slug}#review-form`,
                        })
                      }
                      className="inline-flex items-center justify-between h-[40px] pl-4 pr-1 gap-3 bg-[#211F1C] rounded-xl font-inter font-medium text-[16px] leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors"
                    >
                      Sign in to continue
                      <span className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                        <LogIn className="w-5 h-5 text-[#211F1C]" />
                      </span>
                    </button>
                  </div>
                ) : !canRate ? (
                  <div className="bg-[#FFF9EF] border border-[#E2E1E1] rounded-xl p-6">
                    <p className="font-inter font-normal text-[16px] leading-[24px] text-[#695129]">
                      Your account cannot leave reviews yet.
                    </p>
                  </div>
                ) : (
                  <form
                    action={(fd) => handleSubmitReview(fd)}
                    className="flex flex-col gap-6"
                  >
                    <p className="font-inter font-normal text-[16px] leading-[24px] text-[#4A4946]">
                      Use the sliders above to rate. Write your review below:
                    </p>

                    <MentionTextarea
                      value={reviewText}
                      onChange={setReviewText}
                      placeholder="Share your experience... Type @ to mention users and # to reference perfumes."
                      className="w-full min-h-[176px] rounded-xl border border-[#C4C4C3] px-4 py-4 focus:ring-2 focus:ring-[#8A6A35] focus:border-transparent outline-none bg-white font-inter text-[16px] leading-[24px] text-[#211F1C] placeholder:text-[#737270]"
                    />

                    <div className="flex flex-col gap-3">
                      <label className="font-inter font-medium text-[16px] leading-[24px] text-[#211F1C]">
                        Add Photos
                      </label>
                      <div className="flex flex-wrap gap-3 items-start">
                        {uploadedPhotos.map((url, i) => (
                          <div
                            key={i}
                            className="relative w-[100px] h-[100px] lg:w-[150px] lg:h-[150px] rounded-xl overflow-hidden border border-[#E2E1E1] shrink-0"
                          >
                            <Image
                              src={url}
                              alt="Review"
                              fill
                              className="object-cover"
                              sizes="150px"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setUploadedPhotos((p) =>
                                  p.filter((_, idx) => idx !== i),
                                )
                              }
                              className="absolute top-2 right-2 bg-[#211F1C]/80 text-white rounded-full p-1 hover:bg-[#211F1C] transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {uploadedPhotos.length < 3 && (
                          <div className="w-full sm:w-auto min-w-[160px] max-w-xs">
                            <ImageUpload
                              onUploadComplete={addPhoto}
                              folder="reviews"
                              label="Upload"
                              maxSizeMB={5}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="font-inter font-normal text-[14px] leading-[20px] text-red-600">
                          {errorMessage}
                        </p>
                      </div>
                    )}
                    {successMessage && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="font-inter font-normal text-[14px] leading-[20px] text-green-600">
                          {successMessage}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={pending || !reviewText.trim()}
                        className="inline-flex items-center justify-between h-[50px] pl-4 pr-1 gap-3 bg-[#211F1C] rounded-xl font-inter font-medium text-[18px] leading-[26px] text-white disabled:opacity-50 hover:bg-[#211F1C]/90 transition-colors"
                      >
                        {pending ? "Submitting..." : "Submit Review"}
                        <span className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7 17L17 7M17 7H7M17 7V17"
                              stroke="#211F1C"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Edit Modal */}
        {editingReviewId && (
          <EditReviewModal
            reviewId={editingReviewId}
            currentText={editingReviewText}
            onClose={() => {
              setEditingReviewId(null);
              setEditingReviewText("");
            }}
            onSuccess={() => {
              setEditingReviewId(null);
              setEditingReviewText("");
              window.location.reload();
            }}
          />
        )}

        {/* ✅ ADD TO WARDROBE MODAL - ADD THIS ENTIRE BLOCK */}
        {showWardrobeModal && (
          <AddToWardrobeModal
            perfumeId={perfume._id.toString()}
            perfumeName={perfume.variant_name}
            perfumeBrand={perfume.brand_name}
            perfumeImage={perfume.image}
            onClose={() => setShowWardrobeModal(false)}
            onSuccess={() => {
              setWardrobeSuccess(true);
              setTimeout(() => setWardrobeSuccess(false), 3000);
            }}
          />
        )}
      </div>
    </div>
  );
}
