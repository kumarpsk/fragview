 import clientPromise from '@/lib/mongodb';
import type { Sort, SortDirection } from 'mongodb';

export interface ListBrandsParams {
  page: number;
  pageSize: number;
  search?: string;
  sort?: 'az' | 'za' | 'perfumes' | 'new';
  letter?: string; // 'All', single A-Z, or range like 'A-C'
}

// export async function listBrands(params: ListBrandsParams) {
//   const { page, pageSize, search, sort = 'az', letter } = params;

//   const client = await clientPromise;
//   const db = client.db(process.env.MONGO_DB_NAME || 'fragview');
//   const col = db.collection('brands');

//   const filter: any = {};

//   if (search) {
//     filter.$or = [
//       { name: { $regex: search, $options: 'i' } },
//       { country: { $regex: search, $options: 'i' } },
//     ];
//   }

//   if (letter && letter !== 'All') {
//     const letters = lettersFromFilter(letter);
//     if (letters.length === 1) {
//       filter.name = { $regex: `^${escapeRegex(letters[0])}`, $options: 'i' };
//     } else if (letters.length > 1) {
//       // Starts with any of the letters (case-insensitive)
//       filter.name = { $regex: `^[${letters.map(escapeRegex).join('')}]`, $options: 'i' };
//     }
//   }

//   const sortSpec: any = {};
//   switch (sort) {
//     case 'az':
//       sortSpec.name = 1;
//       break;
//     case 'za':
//       sortSpec.name = -1;
//       break;
//     case 'perfumes':
//       // If perfumes_count present sort descending; fallback then name asc
//       sortSpec.perfumes_count = -1;
//       sortSpec.name = 1;
//       break;
//     case 'new':
//       // created_at or _id (ObjectId roughly chronological)
//       sortSpec._id = -1;
//       break;
//     default:
//       sortSpec.name = 1;
//   }

//   const skip = Math.max(0, (page - 1) * pageSize);

//   const cursor = col
//     .find(filter)
//     .sort(sortSpec)
//     .skip(skip)
//     .limit(pageSize);

//   const items = await cursor.toArray();
//   const total = await col.countDocuments(filter);


//   return { items, total };
// }

// export async function getBrandBySlug(slug: string) {
//   const client = await clientPromise;
//   const db = client.db(process.env.MONGO_DB_NAME || 'fragview');
//   return db.collection('brands').findOne({ slug });
// }

// export async function countBrands() {
//   const client = await clientPromise;
//   const db = client.db(process.env.MONGO_DB_NAME || 'fragview');
//   return db.collection('brands').countDocuments({});
// }

// function escapeRegex(s: string) {
//   return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }

// function lettersFromFilter(letter: string): string[] {
//   const trimmed = (letter || '').trim().toUpperCase();
//   if (!trimmed || trimmed === 'ALL') return [];
//   if (/^[A-Z]$/.test(trimmed)) return [trimmed];

//   const m = trimmed.match(/^([A-Z])\s*-\s*([A-Z])$/);
//   if (!m) return [];
//   const start = m[1].charCodeAt(0);
//   const end = m[2].charCodeAt(0);
//   if (start > end) return [];

//   const letters: string[] = [];
//   for (let c = start; c <= end; c += 1) letters.push(String.fromCharCode(c));
//   return letters;
// }





const PER_LETTER = 6;

export async function listBrands(params: ListBrandsParams) {
  const { search, sort = 'az', letter } = params;

  const sortSpec: any = {};
  switch (sort) {
    case 'az':
      sortSpec.name = 1;
      break;
    case 'za':
      sortSpec.name = -1;
      break;
    case 'perfumes':
      sortSpec.perfumes_count = -1;
      sortSpec.name = 1;
      break;
    case 'new':
      sortSpec._id = -1;
      break;
    default:
      sortSpec.name = 1;
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || 'fragview');
  const col = db.collection('brands');

  const letters = lettersFromFilter(letter);

  // If no letter filter → fallback to normal behavior
  if (letters.length === 0) {
    const filter: any = {};

    if (search) {
      const escapedSearch = escapeRegex(search);
      filter.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { country: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const items = await col
      .find(filter)
      .sort(sortSpec)
      .limit(100)
      .toArray();

    const total = await col.countDocuments(filter);

    return { items, total, letterTotals: {} };
  }

  // Fetch first page (6 items) for each letter in the range
  // Include total count per letter for "Load More" functionality
  let items: any[] = [];
  let total = 0;
  const letterTotals: Record<string, number> = {};

  for (const l of letters) {
    // Skip invalid letters
    if (!l || !/^[A-Z]$/.test(l)) continue;

    const letterRegex = `^${l}`;
    const filter: any = {
      name: { $regex: letterRegex, $options: 'i' },
    };

    if (search) {
      const escapedSearch = escapeRegex(search);
      filter.$and = [
        { name: { $regex: letterRegex, $options: 'i' } },
        {
          $or: [
            { name: { $regex: escapedSearch, $options: 'i' } },
            { country: { $regex: escapedSearch, $options: 'i' } },
          ],
        },
      ];
    }

    const [rows, count] = await Promise.all([
      col
        .find(filter)
        .sort(sortSpec)
        .limit(PER_LETTER) // Only fetch first 6 items
        .toArray(),

      col.countDocuments(filter),
    ]);

    items.push(...rows);
    total += count;
    letterTotals[l] = count; // Store total for this letter
  }

  return { items, total, letterTotals };
}


export async function getBrandBySlug(slug: string) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || 'fragview');
  return db.collection('brands').findOne({ slug });
}

export async function countBrands() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || 'fragview');
  return db.collection('brands').countDocuments({});
}

function escapeRegex(s: string): string {
  if (!s) return '';
  // Escape special regex characters
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function lettersFromFilter(letter?: string): string[] {
  const trimmed = (letter || '').trim().toUpperCase();
  if (!trimmed || trimmed === 'ALL') return [];
  if (/^[A-Z]$/.test(trimmed)) return [trimmed];

  const m = trimmed.match(/^([A-Z])\s*-\s*([A-Z])$/);
  if (!m) return [];

  const start = m[1].charCodeAt(0);
  const end = m[2].charCodeAt(0);

  const letters: string[] = [];
  for (let c = start; c <= end; c++) {
    letters.push(String.fromCharCode(c));
  }
  return letters;
}
