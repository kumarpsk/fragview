// Enhanced color utilities with note images
export const getNoteColor = (noteName: string): string => {
  const noteColors: Record<string, string> = {
    // Citrus notes
    'bergamot': '#FFD700',
    'lemon': '#FFF700',
    'orange': '#FFA500',
    'grapefruit': '#FF6347',
    'lime': '#32CD32',
    
    // Floral notes
    'rose': '#FF69B4',
    'jasmine': '#F8F8FF',
    'lavender': '#E6E6FA',
    'geranium': '#FF1493',
    'lily': '#FFB6C1',
    
    // Woody notes
    'cedar': '#8B4513',
    'sandalwood': '#DEB887',
    'oak': '#D2691E',
    'pine': '#228B22',
    'birch': '#A0522D',
    
    // Spicy notes
    'pepper': '#8B0000',
    'cinnamon': '#D2691E',
    'cardamom': '#9ACD32',
    'ginger': '#B8860B',
    'nutmeg': '#CD853F',
    
    // Gourmand notes
    'vanilla': '#F5DEB3',
    'chocolate': '#D2691E',
    'coffee': '#6F4E37',
    'honey': '#FFD700',
    'caramel': '#D2691E',
    
    // Fresh notes
    'mint': '#98FB98',
    'eucalyptus': '#228B22',
    'marine': '#4682B4',
    'ozone': '#87CEEB',
    
    // Oriental notes
    'oud': '#8B4513',
    'amber': '#FFBF00',
    'musk': '#696969',
    'frankincense': '#DDD8C7',
    'myrrh': '#8B4513',
    
    // Default
    'default': '#9CA3AF'
  };

  return noteColors[noteName.toLowerCase()] || noteColors.default;
};

export const getTextColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#374151' : '#F9FAFB';
};

export const getNoteImage = (noteName: string): string => {
  // In a real app, these would be actual image URLs
  // For now, we'll use placeholder service with note-specific colors
  const noteImageMap: Record<string, string> = {
    'bergamot': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=50&h=50&fit=crop&crop=center',
    'rose': 'https://images.unsplash.com/photo-1518895312237-a1875d6c3887?w=50&h=50&fit=crop&crop=center',
    'vanilla': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop&crop=center',
    'cedar': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=50&h=50&fit=crop&crop=center',
    'lavender': 'https://images.unsplash.com/photo-1574681203313-b2e188fce8be?w=50&h=50&fit=crop&crop=center',
    'sandalwood': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=50&h=50&fit=crop&crop=center',
    'jasmine': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=50&h=50&fit=crop&crop=center',
    'patchouli': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=50&h=50&fit=crop&crop=center',
    'pepper': 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=50&h=50&fit=crop&crop=center',
    'geranium': 'https://images.unsplash.com/photo-1518895312237-a1875d6c3887?w=50&h=50&fit=crop&crop=center',
    'elemi': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=50&h=50&fit=crop&crop=center',
    'default': 'https://images.unsplash.com/photo-1574681203313-b2e188fce8be?w=50&h=50&fit=crop&crop=center'
  };

  return noteImageMap[noteName.toLowerCase()] || noteImageMap.default;
};

export const getAccordColor = (accordName: string): string => {
  const accordColors: Record<string, string> = {
    'fresh': '#4ADE80',
    'woody': '#8B4513', 
    'floral': '#FF69B4',
    'oriental': '#FF8C00',
    'spicy': '#DC2626',
    'gourmand': '#D97706',
    'citrus': '#FDE047',
    'aquatic': '#06B6D4',
    'green': '#22C55E',
    'smoky': '#6B7280',
    'sweet': '#EC4899',
    'powdery': '#E879F9',
    'leathery': '#92400E',
    'marine': '#0EA5E9',
    'default': '#9CA3AF'
  };

  return accordColors[accordName.toLowerCase()] || accordColors.default;
};




export const scrollTabsBy = (
  containerRef: React.RefObject<HTMLElement>,
  left: number = 160
) => {
  if (!containerRef.current) return

  containerRef.current.scrollBy({
    left,
    behavior: 'smooth',
  })
}

export const scrollToTabIndex = (
  containerRef: React.RefObject<HTMLElement>,
  index: number
) => {
  if (!containerRef.current) return

  const tab = containerRef.current.children[index] as HTMLElement | undefined

  tab?.scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest',
  })
}
