'use client';

import { AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Props {
  type: 'perfume' | 'brand';
  duplicateCheck: {
    exists: boolean;
    perfume?: {
      _id: string;
      name: string;
      brand_name: string;
      image?: string;
    };
    brand?: {
      _id: string;
      name: string;
      logo?: string;
      country?: string;
    };
    similar?: Array<{
      _id: string;
      name: string;
      brand_name?: string;
      image?: string;
      logo?: string;
    }>;
  } | null;
  checking: boolean;
}

export default function DuplicateCheckAlert({ type, duplicateCheck, checking }: Props) {
  if (checking) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-gray-50 rounded-xl">
        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        <span>Checking for duplicates...</span>
      </div>
    );
  }

  // Exact duplicate found - RED WARNING
  if (duplicateCheck?.exists) {
    const item = type === 'perfume' ? duplicateCheck.perfume : duplicateCheck.brand;
    const linkHref = type === 'perfume' 
      ? `/perfumes/${item?._id}`
      : `/brands/${item?._id}`;

    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-900">
              ⚠️ This {type} already exists! 
            </p>
            <p className="text-sm text-red-700 mt-1">
              {type === 'perfume' ? (
                <>
                  <strong>{duplicateCheck.perfume?.name}</strong> by{' '}
                  <strong>{duplicateCheck.perfume?.brand_name}</strong>
                </>
              ) : (
                <strong>{duplicateCheck.brand?.name}</strong>
              )}{' '}
              is already in our database.
            </p>
            <Link
              href={linkHref}
              target="_blank"
              className="inline-flex items-center gap-1 mt-2 text-sm text-red-600 hover:text-red-700 font-bold underline"
            >
              View Existing Entry
              <ExternalLink className="w-3 h-3" />
            </Link>
            <p className="text-xs text-red-600 mt-2">
              ❌ Please do not submit duplicates. You cannot proceed. 
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Similar items found - YELLOW WARNING
  if (duplicateCheck?.similar && duplicateCheck.similar.length > 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-yellow-900">⚠️ Similar {type}s found:</p>
            <p className="text-sm text-yellow-700 mt-1 mb-2">
              Please check if any of these match what you&apos;re trying to submit:
            </p>
            <ul className="space-y-1">
              {duplicateCheck.similar.map((item) => {
                const linkHref = type === 'perfume' 
                  ? `/perfumes/${item._id}` 
                  : `/brands/${item._id}`;
                
                return (
                  <li key={item._id}>
                    <Link
                      href={linkHref}
                      target="_blank"
                      className="text-sm text-yellow-700 hover:text-yellow-800 underline inline-flex items-center gap-1"
                    >
                      {item.name}
                      {item.brand_name && ` by ${item.brand_name}`}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-yellow-600 mt-2">
              ⚠️ If none of these match exactly, you can proceed with your submission.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}