'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Star, Grid, List, Leaf, Trees, Sparkles, Download, FileText, Loader2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useAuthModal } from '@/components/auth/AuthModal';
import WardrobeSearch from '@/components/wardrobe/WardrobeSearch';
import { getWardrobe, removeFromWardrobe, addToWardrobe, renameSubcategory, WardrobeEntryHydrated } from '@/app/actions/wardrobe';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

// --- DEFAULTS ---
const DEFAULT_SUBCATS: Record<string, string[]> = {
  'My Bottles': ['Daily Wear', 'Special Occasions', 'Office', 'Date Night', 'Summer', 'Winter', 'Gym'],
  'Wishlist': ['High Priority', 'Low Priority', 'Gift Idea', 'To Sample'],
  'Past Bottles': ['Used Up', 'Decluttered', 'Gifted Away', 'Sold']
};

// --- COLOR LOGIC ---
const getAccordColor = (accordName: string): string => {
  const colors: { [key: string]: string } = {
    rose: '#ec4899', jasmine: '#f472b6', violet: '#a855f7', iris: '#c084fc', ylang: '#e879f9', tuberose: '#f0abfc', neroli: '#fbbf24', lavender: '#a78bfa',
    citrus: '#fbbf24', lemon: '#fde047', bergamot: '#fcd34d', orange: '#fb923c', grapefruit: '#fdba74', mandarin: '#fbbf24',
    woody: '#92400e', sandalwood: '#b45309', cedar: '#78350f', oud: '#451a03', patchouli: '#7c2d12', vetiver: '#65a30d',
    spicy: '#dc2626', cinnamon: '#b91c1c', pepper: '#991b1b', ginger: '#ea580c', cardamom: '#c2410c',
    fresh: '#10b981', aquatic: '#06b6d4', marine: '#0891b2', mint: '#34d399', green: '#22c55e',
    vanilla: '#fef3c7', caramel: '#fcd34d', chocolate: '#78350f', coffee: '#451a03', honey: '#fbbf24', almond: '#fed7aa',
    musk: '#9ca3af', amber: '#f59e0b', leather: '#92400e', animalic: '#6b7280',
    aromatic: '#8b5cf6', herbal: '#84cc16', medicinal: '#22d3ee',
    fruity: '#f472b6', apple: '#86efac', peach: '#fdba74', berry: '#f87171', tropical: '#fbbf24',
    powdery: '#d4d4d8', talc: '#e4e4e7',
    earthy: '#78350f', mossy: '#65a30d',
    sweet: '#fda4af', smoky: '#52525b', incense: '#71717a',
  };
  const lowerName = accordName.toLowerCase();
  if (colors[lowerName]) return colors[lowerName];
  for (const [key, color] of Object.entries(colors)) {
    if (lowerName.includes(key) || key.includes(lowerName)) return color;
  }
  const hash = accordName.charCodeAt(0) % 10;
  return ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#22c55e', '#a855f7', '#fb923c', '#14b8a6'][hash];
};

const WardrobePage = () => {
  const { data: session, status } = useSession();
  const { open } = useAuthModal();

  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<WardrobeEntryHydrated[]>([]);
  const [activeTab, setActiveTab] = useState('My Bottles');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubcatModal, setShowSubcatModal] = useState(false);
  
  const [newPerfume, setNewPerfume] = useState<{id: string, name: string, brand: string, image?: string} | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('My Bottles');
  const [selectedSubcat, setSelectedSubcat] = useState(''); 
  const [isCustomSubcat, setIsCustomSubcat] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  const [renameMap, setRenameMap] = useState<{old: string, new: string}>({old: '', new: ''});

  const fetchData = async () => {
    if (status !== 'authenticated') return;
    setLoading(true);
    const data = await getWardrobe();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      open({ mode: 'signin', reason: 'Access your wardrobe' });
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, open]);

  const getDbStatusForTab = (tab: string) => {
    const map: Record<string, string[]> = {
      'My Bottles': ['CURRENTLY_USING', 'IN_COLLECTION', 'DECANT', 'GIFTED'],
      'Wishlist': ['WISH_LIST'],
      'Past Bottles': ['USED_UP', 'DECLUTTERED'] 
    };
    return map[tab] || [];
  };

  const processedData = useMemo(() => {
    const currentStatuses = getDbStatusForTab(activeTab);
    const filtered = entries.filter(e => currentStatuses.includes(e.status));
    const subcats = Array.from(new Set(filtered.map(e => e.subcategory))).filter(Boolean).sort();
    return { items: filtered, subcats };
  }, [entries, activeTab]);

  const getSubcatsForDropdown = (categoryName: string) => {
     const relevantStatuses = getDbStatusForTab(categoryName);
     const userSubcats = entries
        .filter(e => relevantStatuses.includes(e.status))
        .map(e => e.subcategory);
     const defaults = DEFAULT_SUBCATS[categoryName] || [];
     return Array.from(new Set([...defaults, ...userSubcats])).filter(Boolean).sort();
  };

  const handleAdd = async () => {
    if (!newPerfume) return;
    let dbStatus = 'CURRENTLY_USING';
    if (selectedCategory === 'Wishlist') dbStatus = 'WISH_LIST';
    if (selectedCategory === 'Past Bottles') dbStatus = 'USED_UP';
    const finalSubcat = selectedSubcat.trim() || 'General';
    await addToWardrobe(newPerfume.id, dbStatus as any, finalSubcat, newNotes);
    setShowAddModal(false);
    setNewPerfume(null);
    setNewNotes('');
    setIsCustomSubcat(false);
    fetchData(); 
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove from wardrobe?')) {
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
    const data = processedData.items.map(item => ({
      Name: item.name,
      Brand: item.brand,
      Category: item.subcategory,
      Status: item.status,
      Rating: item.rating || 0
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wardrobe.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`My Wardrobe: ${activeTab}`, 14, 15);
    autoTable(doc, {
      head: [['Name', 'Brand', 'Category', 'Rating']],
      body: processedData.items.map(i => [i.name, i.brand, i.subcategory, i.rating || '-']),
      startY: 20
    });
    doc.save('wardrobe.pdf');
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-[#FAFFF5]"><Loader2 className="animate-spin text-green-600" /></div>;

  return (
    <div className=" relative overflow-hidden py-4 mb-6" style={{ backgroundColor: '#FAFFF5' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl animate-pulse animate-delay-2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        <div className="glass-card rounded-2xl shadow-sm p-6 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5"><Trees size={150} /></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent mb-4">My Wardrobe</h1>
              <p className="text-gray-600">Manage your collection, export data, and track your journey.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">{entries.length}</div>
              <div className="text-gray-600 text-sm">Total Bottles</div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl shadow-sm mb-4">
          <div className="border-b border-green-100">
            <div className="flex flex-col md:flex-row md:items-center px-6 py-4 gap-4">
              <div className="flex space-x-8">
                {['My Bottles', 'Wishlist', 'Past Bottles'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab ? 'border-green-500 text-green-600' : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex space-x-2">
                <button onClick={handleExportCSV} className="p-2 rounded-lg hover:bg-green-50 text-gray-600" title="Export CSV"><FileText className="w-4 h-4" /></button>
                <button onClick={handleExportPDF} className="p-2 rounded-lg hover:bg-green-50 text-gray-600" title="Export PDF"><Download className="w-4 h-4" /></button>
                <div className="w-px bg-green-200 h-6 mx-2 self-center"></div>
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'hover:bg-green-50'}`}><Grid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'hover:bg-green-50'}`}><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 bg-white/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {processedData.subcats.length > 0 ? processedData.subcats.map(sub => (
                  <span key={sub} className="px-3 py-1 rounded-full bg-green-50 border border-green-100 text-xs text-green-800">
                    {sub}
                  </span>
                )) : <span className="text-xs text-gray-400 italic">No items yet.</span>}
              </div>
              {processedData.subcats.length > 0 && (
                <button 
                  onClick={() => setShowSubcatModal(true)}
                  className="text-xs font-medium text-orange-600 hover:text-orange-700 underline"
                >
                  Manage Subcategories
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {processedData.items.length === 0 ? (
               <div className="text-center py-10 glass-card rounded-xl">
                 <Leaf className="w-12 h-12 text-green-200 mx-auto mb-3" />
                 <p className="text-gray-500">Your {activeTab} is empty.</p>
                 <button onClick={() => { setSelectedCategory(activeTab); setShowAddModal(true); }} className="mt-4 text-green-600 font-medium hover:underline">Add your first perfume</button>
               </div>
            ) : (
              // ✨ SUPER COMPACT GRID: 4 cols mobile, 6 cols sm, 8 cols md, 10 cols lg
              <div className={viewMode === 'grid' ? "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2" : "space-y-4"}>
                {processedData.items.map(item => (
                  <div key={item.id} className={`glass-card rounded-lg overflow-hidden hover:shadow-md transition-all group flex flex-col ${viewMode === 'list' ? 'md:flex-row md:items-center md:p-4 md:gap-4' : ''}`}>
                    
                    {/* IMAGE SECTION */}
                    <div className={`${viewMode === 'grid' ? 'aspect-square w-full' : 'w-full h-48 md:w-24 md:h-24 md:rounded-lg'} bg-white relative flex items-center justify-center overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-green-50`}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-50">
                           <Sparkles className="w-4 h-4 text-green-200" />
                        </div>
                      )}
                      {viewMode === 'grid' && (
                        <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleDelete(item.perfumeId)} className="p-1 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 shadow-sm">
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={`flex-1 flex flex-col justify-between p-1.5 ${viewMode === 'list' ? 'p-4 md:p-0 md:flex-row md:items-center' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <Link href={`/perfumes/${item.slug}`} className="font-semibold text-gray-900 hover:text-green-600 block truncate text-[10px] sm:text-xs leading-tight">
                          {item.name}
                        </Link>
                        <p className="text-[8px] text-gray-500 truncate">{item.brand}</p>
                        
                        <div className="flex items-center gap-1 mt-1">
                           {item.rating > 0 && (
                             <div className="flex items-center bg-orange-50 px-1 py-0.5 rounded">
                               <Star className="w-2 h-2 fill-orange-400 text-orange-400 mr-0.5" />
                               <span className="text-[9px] font-medium text-orange-700">{item.rating.toFixed(1)}</span>
                             </div>
                           )}
                           {/* Hide subcategory pill in grid to save space */}
                           {viewMode === 'list' && (
                             <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-green-50 text-green-700 rounded-md font-medium">
                               {item.subcategory}
                             </span>
                           )}
                        </div>

                        {/* ACCORDS: Limit to 2, very small */}
                        {item.accords && item.accords.length > 0 && viewMode === 'grid' && (
                          <div className="flex flex-wrap gap-0.5 mt-1">
                            {item.accords.slice(0, 2).map((accord: any, idx: number) => {
                              const accordName = typeof accord === 'string' ? accord : accord.name;
                              const color = getAccordColor(accordName);
                              
                              return (
                                <span 
                                  key={idx} 
                                  className="text-[7px] px-1 py-0 rounded-full font-medium shadow-sm text-white text-shadow-sm truncate max-w-[40px]"
                                  style={{ backgroundColor: color }}
                                >
                                  {accordName}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Full Accords for List View */}
                        {item.accords && item.accords.length > 0 && viewMode === 'list' && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.accords.map((accord: any, idx: number) => {
                              const accordName = typeof accord === 'string' ? accord : accord.name;
                              const color = getAccordColor(accordName);
                              return (
                                <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm text-white text-shadow-sm" style={{ backgroundColor: color }}>
                                  {accordName}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {viewMode === 'list' && (
                        <button onClick={() => handleDelete(item.perfumeId)} className="hidden md:block p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shrink-0 ml-4">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-2xl p-6 shadow-sm sticky top-24">
              <button 
                onClick={() => {
                  setSelectedCategory(activeTab); 
                  setShowAddModal(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Fragrance
              </button>
            </div>
          </div>
        </div>

        {/* Modals (Add & Rename) - Unchanged logic, just keeping file complete */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl mt-20">
              <div className="p-6 bg-gradient-to-r from-green-50 to-orange-50 border-b border-green-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Add to Wardrobe</h3>
                <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Search Perfume</label>
                  {newPerfume ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                       <div className="flex items-center gap-2 overflow-hidden">
                          {newPerfume.image && <img src={newPerfume.image} className="w-6 h-6 rounded-full object-cover" />}
                          <span className="font-medium text-green-900 truncate">{newPerfume.name}</span>
                       </div>
                       <button onClick={() => setNewPerfume(null)} className="text-xs text-red-500 hover:underline flex-shrink-0 ml-2">Change</button>
                    </div>
                  ) : (
                    <WardrobeSearch onSelect={(item) => setNewPerfume(item)} />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubcat(''); 
                      setIsCustomSubcat(false);
                    }}
                  >
                    <option value="My Bottles">My Bottles</option>
                    <option value="Wishlist">Wishlist</option>
                    <option value="Past Bottles">Past Bottles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subcategory</label>
                  {!isCustomSubcat ? (
                    <div className="flex gap-2">
                       <select 
                          className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                          value={selectedSubcat}
                          onChange={(e) => {
                            if (e.target.value === 'CUSTOM') setIsCustomSubcat(true);
                            else setSelectedSubcat(e.target.value);
                          }}
                        >
                          <option value="">Select...</option>
                          {getSubcatsForDropdown(selectedCategory).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                          <option value="CUSTOM" className="font-bold text-green-600">+ Create New...</option>
                        </select>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        autoFocus
                        className="w-full p-2 border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Type new name..."
                        value={selectedSubcat}
                        onChange={(e) => setSelectedSubcat(e.target.value)}
                      />
                      <button onClick={() => setIsCustomSubcat(false)} className="text-xs text-gray-500 hover:text-red-500">Cancel</button>
                    </div>
                  )}
                </div>
                
                <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">Private Notes</label>
                   <textarea 
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm h-20 focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="Notes..."
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                   />
                </div>

                <button 
                  onClick={handleAdd}
                  disabled={!newPerfume}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-green-700 transition-colors"
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
                <h3 className="text-lg font-semibold mb-2">Rename Categories</h3>
                <div className="space-y-3">
                   <div>
                     <label className="text-xs text-gray-700">Select Category</label>
                     <select 
                        className="w-full p-2 border rounded-lg mt-1"
                        onChange={(e) => setRenameMap({...renameMap, old: e.target.value})}
                     >
                        <option value="">Select...</option>
                        {processedData.subcats.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="text-xs text-gray-700">New Name</label>
                     <input 
                        className="w-full p-2 border rounded-lg mt-1"
                        placeholder="New Name"
                        onChange={(e) => setRenameMap({...renameMap, new: e.target.value})}
                     />
                   </div>
                   <div className="flex gap-2 mt-4">
                     <button onClick={() => setShowSubcatModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                     <button onClick={handleRenameSubcat} className="flex-1 py-2 bg-green-600 text-white rounded-lg">Update</button>
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WardrobePage;