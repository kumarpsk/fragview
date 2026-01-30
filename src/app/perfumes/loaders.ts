import 'server-only';
import { listPerfumes } from '@/lib/data/perfumes';
import { pageMeta } from '@/lib/pagination';
import { sanitizePerfumeDocs } from '@/lib/sanitize';
import { safeTypesenseSearch } from '@/lib/typesense';

export type PerfumeSort = 'new' | 'rating' | 'az' | 'za';
const PAGE_SIZE = 25;

function mapSort(sort: PerfumeSort) {
  switch (sort) {
    case 'rating': return 'rating:desc,created_at:desc';
    case 'new': return 'created_at:desc';
    case 'za': return 'variant_name:desc';
    case 'az':
    default: return 'variant_name:asc';
  }
}

export async function loadPerfumes(searchParams: Record<string, string | string[] | undefined>) {
  

  const rawPage = searchParams.page;
  const page = (() => {
    const v = Array.isArray(rawPage) ? parseInt(rawPage[0] || '1', 10) : parseInt((rawPage as string) || '1', 10);
    return Number.isFinite(v) && v > 0 ? v : 1;
  })();

  const q = typeof searchParams.q === 'string' ? searchParams.q.trim() : '';
  const gender = typeof searchParams.gender === 'string' ? searchParams.gender.trim() : '';
  const brand = typeof searchParams.brand === 'string' ? searchParams.brand.trim() : '';

  const sortRaw = typeof searchParams.sort === 'string' ? searchParams.sort : 'az';
  const allowed: PerfumeSort[] = ['new', 'rating', 'az', 'za'];
  const sort = allowed.includes(sortRaw as any) ? (sortRaw as PerfumeSort) : 'az';

  const minRating = Number(searchParams.minRating || 1);
const minLongevity = Number(searchParams.minLongevity || 1);
const minSillage = Number(searchParams.minSillage || 1);

const perfumer = typeof searchParams.perfumer === 'string'
  ? searchParams.perfumer.trim()
  : '';

const notes = typeof searchParams.notes === 'string'
  ? searchParams.notes.trim()
  : '';

const accords = typeof searchParams.accords === 'string'
  ? searchParams.accords.trim()
  : '';

  if (q) {
    const filterParts: string[] = [];
    if (gender) filterParts.push(`gender:=${escapeFacet(gender)}`);
    if (brand) filterParts.push(`brand_name:=${escapeFacet(brand)}`);
    const filter_by = filterParts.join(' && ');
    const searchParamsTs = {
      q,
      query_by: 'variant_name,brand_name,description,accords',
      per_page: PAGE_SIZE,
      page,
      sort_by: mapSort(sort),
      filter_by: filter_by || undefined,
      prefix: 'true',
      typo_tokens_threshold: 1,
      // optional ranking tweak: prioritise brand name weight (variant_name,brand_name)
    };

    const resp = await safeTypesenseSearch('perfumes', searchParamsTs);
    if (resp) {
      const items = resp.hits.map(d => ({ ...d, _id: d.id }));
      const sanitized = sanitizePerfumeDocs(items);
      const meta = pageMeta(resp.found, page, PAGE_SIZE);
      return {
        items: sanitized,
        total: resp.found,
        meta,
        query: { q, gender, brand, sort },
        pageSize: PAGE_SIZE,
        source: 'typesense',
      };
    }
    // fallback below if resp null
  }

  const { items, total } = await listPerfumes({
    page,
    pageSize: PAGE_SIZE,
    search: q || undefined,
    brand: brand || undefined,
    gender: gender || undefined,
    sort,
      minRating,
  minLongevity,
  minSillage,
    perfumer: perfumer || undefined,
  notes: notes || undefined,
  accords: accords || undefined,
  });
  const sanitized = sanitizePerfumeDocs(items);
  const meta = pageMeta(total, page, PAGE_SIZE);

  return {
    items: sanitized,
    total,
    meta,
    query: { q, gender, brand, sort },
    pageSize: PAGE_SIZE,
    source: 'mongo',
  };
}

function escapeFacet(v: string) {
  return v.replace(/([\\":])/g, '\\$1');
}