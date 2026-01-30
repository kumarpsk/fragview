import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

const PER_PAGE = 6;

function escapeRegex(s: string): string {
  if (!s) return '';
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const letter = searchParams.get('letter')?.toUpperCase() || 'A';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'az';

    if (!/^[A-Z]$/.test(letter)) {
      return NextResponse.json({ error: 'Invalid letter' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME || 'fragview');
    const col = db.collection('brands');

    // Build filter for this letter (letter is already validated as A-Z)
    const letterRegex = `^${letter}`;
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

    // Build sort spec
    const sortSpec: any = {};
    switch (sort) {
      case 'az':
      case 'name':
        sortSpec.name = 1;
        break;
      case 'za':
        sortSpec.name = -1;
        break;
      case 'perfumes':
      case 'fragrances':
        sortSpec.perfumes_count = -1;
        sortSpec.name = 1;
        break;
      case 'new':
        sortSpec._id = -1;
        break;
      default:
        sortSpec.name = 1;
    }

    const skip = (page - 1) * PER_PAGE;

    const [items, total] = await Promise.all([
      col
        .find(filter)
        .sort(sortSpec)
        .skip(skip)
        .limit(PER_PAGE)
        .toArray(),
      col.countDocuments(filter),
    ]);

    // Sanitize items (remove internal fields)
    const sanitized = items.map((item) => ({
      _id: item._id.toString(),
      name: item.name,
      slug: item.slug,
      country: item.country,
      description: item.description,
      perfumes_count: item.perfumes_count,
    }));

    return NextResponse.json({
      items: sanitized,
      total,
      page,
      hasMore: skip + items.length < total,
      letter,
    });
  } catch (error) {
    console.error('Error in /api/brands/by-letter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
