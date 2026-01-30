import clientPromise from '../mongodb';
import { perfumeSlug } from '../slug';

const DB_NAME = process.env.MONGO_DB_NAME || 'fragview';
const PERFUMES_COLLECTION = 'perfumes';

export type PerfumeDoc = {
  _id: any;
  brand_name: string;
  variant_name: string;
  slug?: string;
  gender?: string;
  rating?: number;
  perfume_image?: string; // legacy CDN field
  image?: string;         // new blob-based URL
  accords?: { name: string; width: number }[];
  pyramids?: { top?: string[]; middle?: string[]; base?: string[] };
  scraped_at?: string;
  date_added?: string;
  description?: string;
  
  // ✅ Added missing fields to fix TypeScript errors
  votes?: number;
  longevity?: number;
  sillage?: number;
  perfumers?: string[];
  reminds_me?: string[];
  created_at?: string | number;
};

export async function getPerfumeBySlug(slug: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const col = db.collection<PerfumeDoc>(PERFUMES_COLLECTION);

  const bySlug = await col.findOne({ slug });
  if (bySlug) return bySlug;

  // Try case-insensitive variant_name + brand_name match if slug not found
  const [brandPart, ...variantParts] = slug.split('-');
  const variantGuess = variantParts.join(' ');
  const alt = await col.findOne({
    $or: [
      { variant_name: new RegExp(`^${escapeRegex(slug)}$`, 'i') },
      { variant_name: new RegExp(`^${escapeRegex(variantGuess)}$`, 'i') },
    ],
  });

  return alt;
}

export async function listPerfumes(opts: {
  page?: number;
  pageSize?: number;
  search?: string;
  brand?: string;
  gender?: string;
  sort?: 'new' | 'rating' | 'az' | 'za';
    minRating?: number;
  minLongevity?: number;
  minSillage?: number;
    perfumer?: string;
  notes?: string;
  accords?: string;
} = {}) {
  const {
    page = 1,
    pageSize = 25,
    search,
    brand,
    gender,
        sort = 'az',
     minRating = 1,
  minLongevity = 1,
  minSillage = 1,
    perfumer,
  notes,
  accords,
  } = opts;

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const col = db.collection<PerfumeDoc>(PERFUMES_COLLECTION);

  const filter: any = {};
  if (search) {
    filter.$or = [
      { variant_name: { $regex: search, $options: 'i' } },
      { brand_name: { $regex: search, $options: 'i' } },
    ];
  }
  if (brand) {
  filter.brand_name = { $regex: `^${escapeRegex(brand)}$`, $options: 'i' };
  }
  if (gender) filter.gender = gender;
  if (minRating > 1) {
  filter.rating = { $gte: minRating };
}
if (minLongevity > 1) {
  filter.longevity = { $gte: minLongevity };
}
if (minSillage > 1) {
  filter.sillage = { $gte: minSillage };
}
if (perfumer) {
  filter.perfumers = {
    $elemMatch: { $regex: perfumer, $options: 'i' },
  };
}


if (notes) {
  filter.perfume_overview = {
    $regex: escapeRegex(notes),
    $options: 'i',
  };
}


if (accords) {
  filter.accords = {
    $elemMatch: {
      name: { $regex: accords, $options: 'i' },
    },
  };
}


  const sortSpec: any = {};
  switch (sort) {
    case 'rating':
      sortSpec.rating = -1;
      sortSpec.variant_name = 1;
      break;
    case 'new':
      sortSpec._id = -1;
      break;
    case 'za':
      sortSpec.variant_name = -1;
      break;
    case 'az':
    default:
      sortSpec.variant_name = 1;
  }

  const skip = Math.max(0, (page - 1) * pageSize);

  const cursor = col.find(filter).sort(sortSpec).skip(skip).limit(pageSize);
  const items = await cursor.toArray();
  const total = await col.countDocuments(filter);

  return { items, total };
}

export async function countPerfumes() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection(PERFUMES_COLLECTION).countDocuments({});
}

export async function generatePerfumeSlug(doc: PerfumeDoc): Promise<string> {
  return doc.slug || perfumeSlug(doc.brand_name, doc.variant_name);
}

// NEW FUNCTION: Fetch multiple perfumes by their slugs
export async function getPerfumesBySlugs(slugs: string[]) {
  if (!slugs || slugs.length === 0) return [];
  
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const col = db.collection<PerfumeDoc>(PERFUMES_COLLECTION);

  const perfumes = await col.find({
    slug: { $in: slugs }
  }).project({
    variant_name: 1,
    brand_name: 1,
    slug: 1,
    image: 1,
    rating: 1,
    gender: 1
  }).toArray();

  return perfumes;
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}