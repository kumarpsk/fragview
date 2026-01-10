import BrandPageClient from './BrandPageClient';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

// Mock data
const brand = {
  name: 'Dior',
  country: 'France',
  founded: 1946,
  founder: 'Christian Dior',
  description:
    "Christian Dior SE, commonly known as Dior, is a French luxury fashion house controlled and chaired by French businessman Bernard Arnault, who also heads LVMH, the world's largest luxury group. Dior holds 42.36% shares and 59.01% of voting rights within LVMH.",
  fullDescription:
    'Founded in 1946, Christian Dior revolutionized women\'s fashion with his "New Look" collection. The House of Dior has since become synonymous with luxury, elegance, and French savoir-faire. In the world of fragrance, Dior has created some of the most iconic and beloved scents, combining traditional perfumery techniques with modern innovation.',
  logo: '/api/placeholder/200/200',
  headquarters: 'Paris, France',
  website: 'dior.com',
};

const fragrances = [
  {
    id: 1,
    name: 'Sauvage',
    year: 2015,
    gender: 'Male',
    rating: 4.3,
    reviews: 1247,
    image: '/api/placeholder/200/250',
    accords: [{ name: 'fresh' }, { name: 'woody' }, { name: 'spicy' }],
  },
  {
    id: 2,
    name: 'Miss Dior',
    year: 1947,
    gender: 'Female',
    rating: 4.1,
    reviews: 856,
    image: '/api/placeholder/200/250',
    accords: [{ name: 'floral' }, { name: 'fresh' }, { name: 'citrus' }],
  },
  {
    id: 3,
    name: "J'adore",
    year: 1999,
    gender: 'Female',
    rating: 4.4,
    reviews: 1532,
    image: '/api/placeholder/200/250',
    accords: [{ name: 'floral' }, { name: 'sweet' }, { name: 'powdery' }],
  },
  {
    id: 4,
    name: 'Dior Homme',
    year: 2005,
    gender: 'Male',
    rating: 4.0,
    reviews: 743,
    image: '/api/placeholder/200/250',
    accords: [{ name: 'woody' }, { name: 'powdery' }, { name: 'floral' }],
  },
  {
    id: 5,
    name: 'Poison',
    year: 1985,
    gender: 'Female',
    rating: 3.9,
    reviews: 672,
    image: '/api/placeholder/200/250',
    accords: [{ name: 'oriental' }, { name: 'spicy' }, { name: 'sweet' }],
  },
  {
    id: 6,
    name: 'Fahrenheit',
    year: 1988,
    gender: 'Male',
    rating: 4.2,
    reviews: 934,
    image: '/api/placeholder/200/250',
    accords: [{ name: 'woody' }, { name: 'leathery' }, { name: 'spicy' }],
  },
];

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  
  // In the future, use slug to fetch actual brand data
  void slug;

  return <BrandPageClient brand={brand} fragrances={fragrances} />;
}