"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Star,
  Grid,
  List,
  Leaf,
  Trees,
  Sparkles,
  Download,
  FileText,
  Loader2,
  X,
  Subscript,
  SubscriptIcon,
  Tag,
  ArrowRight,
  XIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/components/auth/AuthModal";
import WardrobeSearch from "@/components/wardrobe/WardrobeSearch";
import {
  getWardrobe,
  removeFromWardrobe,
  addToWardrobe,
  renameSubcategory,
  WardrobeEntryHydrated,
} from "@/app/actions/wardrobe";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { scrollTabsBy, scrollToTabIndex } from "@/utils/colors";
import Image from "next/image";

// --- DEFAULTS ---
const DEFAULT_SUBCATS: Record<string, string[]> = {
  "My Bottles": [
    "Daily Wear",
    "Special Occasions",
    "Office",
    "Date Night",
    "Summer",
    "Winter",
    "Gym",
  ],
  Wishlist: ["High Priority", "Low Priority", "Gift Idea", "To Sample"],
  "Past Bottles": ["Used Up", "Decluttered", "Gifted Away", "Sold"],
};

// --- COLOR LOGIC ---
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
  };
  const lowerName = accordName.toLowerCase();
  if (colors[lowerName]) return colors[lowerName];
  for (const [key, color] of Object.entries(colors)) {
    if (lowerName.includes(key) || key.includes(lowerName)) return color;
  }
  const hash = accordName.charCodeAt(0) % 10;
  return [
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
  ][hash];
};

const WardrobePage = () => {
  const { data: session, status } = useSession();
  const { open } = useAuthModal();

  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<WardrobeEntryHydrated[]>([]);
  const [activeTab, setActiveTab] = useState("My Bottles");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubcatModal, setShowSubcatModal] = useState(false);

  const [newPerfume, setNewPerfume] = useState<{
    id: string;
    name: string;
    brand: string;
    image?: string;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("My Bottles");
  const [selectedSubcat, setSelectedSubcat] = useState("");
  const [isCustomSubcat, setIsCustomSubcat] = useState(false);
  const [newNotes, setNewNotes] = useState("");

  const [renameMap, setRenameMap] = useState<{ old: string; new: string }>({
    old: "",
    new: "",
  });

  const fetchData = async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    const data = await getWardrobe();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      open({ mode: "signin", reason: "Access your wardrobe" });
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, open]);

  const getDbStatusForTab = (tab: string) => {
    const map: Record<string, string[]> = {
      "My Bottles": ["CURRENTLY_USING", "IN_COLLECTION", "DECANT", "GIFTED"],
      Wishlist: ["WISH_LIST"],
      "Past Bottles": ["USED_UP", "DECLUTTERED"],
    };
    return map[tab] || [];
  };

  const processedData = useMemo(() => {
    const currentStatuses = getDbStatusForTab(activeTab);
    const filtered = entries.filter((e) => currentStatuses.includes(e.status));
    const subcats = Array.from(new Set(filtered.map((e) => e.subcategory)))
      .filter(Boolean)
      .sort();
    return { items: filtered, subcats };
  }, [entries, activeTab]);

  const getSubcatsForDropdown = (categoryName: string) => {
    const relevantStatuses = getDbStatusForTab(categoryName);
    const userSubcats = entries
      .filter((e) => relevantStatuses.includes(e.status))
      .map((e) => e.subcategory);
    const defaults = DEFAULT_SUBCATS[categoryName] || [];
    return Array.from(new Set([...defaults, ...userSubcats]))
      .filter(Boolean)
      .sort();
  };

  const handleAdd = async () => {
    if (!newPerfume) return;
    let dbStatus = "CURRENTLY_USING";
    if (selectedCategory === "Wishlist") dbStatus = "WISH_LIST";
    if (selectedCategory === "Past Bottles") dbStatus = "USED_UP";
    const finalSubcat = selectedSubcat.trim() || "General";
    await addToWardrobe(newPerfume.id, dbStatus as any, finalSubcat, newNotes);
    setShowAddModal(false);
    setNewPerfume(null);
    setNewNotes("");
    setIsCustomSubcat(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove from wardrobe?")) {
      await removeFromWardrobe(id);
      fetchData();
    }
  };

  const handleRenameSubcat = async () => {
    if (!renameMap.old || !renameMap.new) return;
    await renameSubcategory(renameMap.old, renameMap.new);
    setShowSubcatModal(false);
    fetchData();
  };

  const handleExportCSV = () => {
    const data = processedData.items.map((item) => ({
      Name: item.name,
      Brand: item.brand,
      Category: item.subcategory,
      Status: item.status,
      Rating: item.rating || 0,
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "wardrobe.csv";
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`My Wardrobe: ${activeTab}`, 14, 15);
    autoTable(doc, {
      head: [["Name", "Brand", "Category", "Rating"]],
      body: processedData.items.map((i) => [
        i.name,
        i.brand,
        i.subcategory,
        i.rating || "-",
      ]),
      startY: 20,
    });
    doc.save("wardrobe.pdf");
  };
  const tabsRef = useRef<HTMLDivElement>(null);
  const [selectedBrandIndex, setSelectedBrandIndex] = useState(0);

  const scrollRight = () => scrollTabsBy(tabsRef, 160);
  const scrollToTab = (index: number) => scrollToTabIndex(tabsRef, index);
  const visibleBrands = ["Bourjois", "Chanel"];
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FAFFF5]">
        <Loader2 className="animate-spin text-gray-600 w-10 h-10" />
      </div>
    );

  return (
    <div className=" ">
      {/* Hero Section */}
      <section
        className="relative w-full  flex items-center py-9 "
        // style={{
        //   background: `linear-gradient(90deg, rgba(33, 31, 28, 0.6) 20.81%, rgba(33, 31, 28, 0.4) 88.57%), url('/war/bg.png')`,
        //   backgroundSize: "cover",
        //   backgroundPosition: "center",
        // }}
      >
                <Image src="/war/bg.png" alt="perfumes-hero" width={1440} height={853} className="absolute w-full h-full object-cover " />
             <div className="absolute inset-0 bg-[#211F1C] opacity-50" />

        <div className="mx-auto max-w-[1440px] w-full px-4 sm:px-6 lg:px-[72px] z-20">
          <div className="max-w-[775px] flex flex-col gap-3 lg:gap-4 p-4 lg:p-0">
            <h1 className="font-hedvig font-normal text-[32px] leading-[40px] sm:text-[44px] sm:leading-[52px] lg:text-[56px] lg:leading-[64px] text-white">
              Your wardrobe, a personal record of scents that you like.
            </h1>
            <p className="font-inter font-normal text-[16px] leading-[24px] sm:text-[20px] sm:leading-[28px] lg:text-[24px] lg:leading-[32px] text-white">
              Manage your collection, export data, and track your journey.
            </p>
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-[1440px]">
          {/* Featured brands (Trending Brands) */}
          <div className="px-2 sm:px-6 lg:px-[72px] py-5 flex flex-col sm:gap-12 gap-6">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-10">
              <div className="flex flex-col gap-1 flex-1">
                <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
                  Scents you love{" "}
                </span>
                <h2 className="font-hedvig font-normal text-[28px] leading-[36px] lg:text-[40px] lg:leading-[56px] text-[#211F1C]">
                  Your collections{" "}
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory(activeTab);
                  setShowAddModal(true);
                }}
                className="inline-flex items-center justify-between w-full lg:w-auto p-3 gap-3 bg-[#211F1C] rounded-xl font-inter font-medium text-[16px] leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors"
              >
                Add fragrance
              </button>
            </div>
            <div className="flex justify-between items-center gap-1 max-sm:flex-col">
              {/* Tabs */}
              <div className="w-[50%] max-xl:w-[60%]  relative max-sm:w-full ">
                <div
                  ref={tabsRef}
                  className="
          flex items-center lg:gap-0
          border border-[#EFEFEF] rounded-[32px]
              h-9 lg:h-12
          overflow-x-auto lg:overflow-hidden
         scrollbar-hide  scroll-smooth
        "
                >
                  {["My Bottles", "Wishlist", "Past Bottles"].map(
                    (tab, index) => {
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setActiveTab(tab);
                            scrollToTab(index);
                          }}
                          className={`
           flex-1
                h-9 lg:h-12
                flex items-center justify-center
                px-6 lg:px-8
                font-inter font-medium
                text-sm lg:text-xl
                rounded-full whitespace-nowrap
                transition-all duration-300
                ${
                  activeTab === tab
                    ? "bg-[#211F1C] text-white "
                    : "bg-transparent text-[#211F1C] hover:bg-[#E2E1E1]/50"
                }
              `}
                        >
                          {tab}
                        </button>
                      );
                    },
                  )}
                  <div className="sm:hidden flex-shrink-0 w-12" />
                </div>

                {/* Right Scroll Button (Mobile only) */}
                <div
                  className="
    sm:hidden absolute right-0 top-1/2 -translate-y-1/2
    h-8 flex items-center
    bg-gradient-to-l from-[#FFF9EF] via-[#FFF9EF] to-transparent
    pl-6 pr-1 rounded-full
  "
                >
                  <button
                    type="button"
                    onClick={scrollRight}
                    className="w-8 h-8 flex items-center justify-center
               bg-[#211F1C] rounded-full"
                    aria-label="Scroll tabs"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 6L15 12L9 18"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* icons  */}

              <div className="ml-auto flex space-x-3 max-sm:mt-2">
                <button
                  onClick={handleExportCSV}
                  className="p-2 border rounded-md hover:bg-gray-50 text-gray-500"
                  title="Export CSV"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={handleExportPDF}
                  className="p-2 border rounded-md hover:bg-gray-50 text-gray-500"
                  title="Export PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                {processedData.subcats.length > 0 && (
                  <button
                    onClick={() => setShowSubcatModal(true)}
                    className="p-2 border rounded-md hover:bg-gray-50 text-gray-500"
                    title="Export PDF"
                  >
                    <Tag className="w-5 h-5" />
                  </button>
                )}
                <div className="border rounded-md">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2    ${viewMode === "grid" ? " bg-[#fde2b6] text-[#695129]" : " text-gray-500 hover:bg-gray-50"}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2  ${viewMode === "list" ? "bg-[#fde2b6] text-[#695129]" : " text-gray-500 hover:bg-gray-50"}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            {processedData.items.length === 0 && (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-700 text-lg">No items found</p>
              </div>
            )}

            <div
              className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-14 gap-5" : "flex flex-col gap-6"}`}
            >
              {processedData.items.map((item) => (
                <div
                  key={item.id}
                  className={`${viewMode === "grid" ? "flex flex-col" : "flex items-center gap-5 p-4 max-sm:p-1 max-sm:gap-2"} bg-[#FFF4E3] rounded-[16px] overflow-hidden isolate group shadow-md hover:shadow-lg `}
                >
                  {/* IMAGE SECTION */}
                  <div
                    className={`${viewMode === "grid" ? "h-[230px]" : "w-[13rem] h-[13rem] max-sm:w-[7rem] max-sm:h-[9rem]"} relative   bg-white border-t border-l border-r border-[#EFEFEF] rounded-t-[16px] group-hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden`}
                  >
                    {item.image ? (
                      viewMode === "grid" ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain p-4"
                        />
                      ) : (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-contain w-full h-full p-4"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <Sparkles className="w-4 h-4 text-gray-400" />
                      </div>
                    )}

                    {/* Gender Badge */}
                    {item.gender && viewMode === "grid" && (
                      <span className="absolute top-4 left-4 flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-[14px] leading-[20px] text-[#695129] z-10">
                        {item.gender}
                      </span>
                    )}
                  </div>

                  {/* Content Area */}
                  <div
                    className={`flex flex-col justify-between flex-1  
                  ${viewMode === "grid" ? "p-5 gap-4" : "max-sm:p-0 gap-5 max-sm:gap-3"} `}
                  >
                    <div className="flex flex-col gap-3 ">
                      {/* Rating Row */}

                      <div className="flex justify-between items-center max-sm:flex-col max-sm:items-start">
                        <div className="flex items-center gap-[3px]">
                          <Star
                            className="h-6 w-6 text-[#FBC061] fill-[#FBC061] max-sm:h-5 max-sm:w-5"
                            aria-hidden="true"
                          />
                          <span className="font-inter font-medium text-[18px] leading-[26px] text-[#211F1C] max-sm:text-sm max-sm:leading-none">
                            {item.rating.toFixed(1)}
                          </span>
                          <span className="font-inter font-normal text-[16px] leading-[24px] text-[#4A4946] max-sm:text-sm max-sm:leading-none">
                            ({item.reviewCount ?? 0} reviews)
                          </span>
                        </div>
                        {item.gender && viewMode === "list" && (
                          <span className=" flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-[14px] leading-[20px] text-[#695129] z-10 max-sm:mt-2">
                            {item.gender}
                          </span>
                        )}
                      </div>

                      {/* Title & Brand */}
                      <div className="flex flex-col gap-[6px]">
                        <h3 className="font-averia font-normal text-[24px] leading-[32px] text-[#211F1C] line-clamp-2 max-sm:text-lg max-sm:leading-tight">
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
                    <div className="flex items-center justify-center gap-3">
                      {/* View Details Button */}
                      <Link
                        href={`/perfumes/${item.slug}`}
                        className="flex items-center justify-center gap-2 w-full h-[40px] border border-[#C4C4C3] rounded-lg font-inter font-medium text-[16px] leading-[26px] text-[#211F1C] hover:bg-[#211F1C] hover:text-white transition-colors"
                      >
                        View Details
                        <ArrowRight className="h-6 w-6" aria-hidden="true" />
                      </Link>

                      <button
                        onClick={() => handleDelete(item.perfumeId)}
                        className="p-2  text-black hover:bg-black hover:text-white border rounded-md border-gray-400"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div>
            {/* Modals (Add & Rename) - Unchanged logic, just keeping file complete */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl mt-20">
                  <div className="p-6  flex justify-between items-center border-b">
                    <h3 className=" text-black text-lg">
                      Add to Wardrobe
                    </h3>
                    <button onClick={() => setShowAddModal(false)}>
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                 
                      {newPerfume ? (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-300">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {newPerfume.image && (
                              <img
                                src={newPerfume.image}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            )}
                            <span className="font-medium text-gray-900 truncate">
                              {newPerfume.name}
                            </span>
                          </div>
                          <button
                            onClick={() => setNewPerfume(null)}
                            className="text-xs text-red-500 hover:underline flex-shrink-0 ml-2"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <WardrobeSearch
                          onSelect={(item) => setNewPerfume(item)}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-lg  text-black mb-1">
                        Category
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg text-md focus:ring-2 focus:ring-gray-500 outline-none bg-white text-black"
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedSubcat("");
                          setIsCustomSubcat(false);
                        }}
                      >
                        <option value="My Bottles">My Bottles</option>
                        <option value="Wishlist">Wishlist</option>
                        <option value="Past Bottles">Past Bottles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-lg  text-black mb-1">
                        Subcategory
                      </label>
                      {!isCustomSubcat ? (
                        <div className="flex gap-2">
                          <select
                        className="w-full p-3 border border-gray-300 rounded-lg text-md focus:ring-2 focus:ring-gray-500 outline-none bg-white text-black"
                            value={selectedSubcat}
                            onChange={(e) => {
                              if (e.target.value === "CUSTOM")
                                setIsCustomSubcat(true);
                              else setSelectedSubcat(e.target.value);
                            }}
                          >
                            <option value="">Select...</option>
                            {getSubcatsForDropdown(selectedCategory).map(
                              (s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ),
                            )}
                            <option
                              value="CUSTOM"
                              className="font-bold text-gray-600"
                            >
                              + Create New...
                            </option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            autoFocus
                            className="w-full p-3 border border-gray-300 rounded-lg text-md text-black focus:ring-2 focus:ring-gray-500 outline-none"
                            placeholder="Type new name..."
                            value={selectedSubcat}
                            onChange={(e) => setSelectedSubcat(e.target.value)}
                          />
                          <button
                            onClick={() => setIsCustomSubcat(false)}
                            className="text-xs text-gray-500 hover:text-red-500"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-lg  text-black mb-1">
                                                Private Notes
                      </label>
                      <textarea
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm h-20 focus:ring-2 focus:ring-gray-500 outline-none  text-md text-black"
                        placeholder="Notes..."
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={handleAdd}
                      disabled={!newPerfume}
                      className="w-full py-3 bg-black text-white rounded-xl font-medium disabled:opacity-50 hover:bg-black/80transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showSubcatModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                  <div className="border-b pb-2 flex justify-between mb-2">
                  <h3 className="text-lg  text-black ">
                    Rename Categories
                  </h3>
                  <XIcon className="w-4 h-4 text-black cursor-pointer"  onClick={() => setShowSubcatModal(false)}/>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-black">
                         Category
                      </label>
                      <select
                        className="w-full p-2 border rounded-lg mt-1 bg-white text-gray-700"
                        onChange={(e) =>
                          setRenameMap({ ...renameMap, old: e.target.value })
                        }
                      >
                        <option value="" className="">Select...</option>
                        {processedData.subcats.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-black">New Name</label>
                      <input
                        className="w-full p-2 border rounded-lg mt-1 bg-white text-gray-700"
                        placeholder="New Name"
                        onChange={(e) =>
                          setRenameMap({ ...renameMap, new: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setShowSubcatModal(false)}
                        className="flex-1 py-2 border rounded-lg bg-white text-black"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRenameSubcat}
                        className="flex-1 py-2 bg-black text-white rounded-lg"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WardrobePage;
