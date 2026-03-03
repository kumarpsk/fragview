'use client';

import { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface Props {
  currentImage: string | null;
  onImageUpload: (imageUrl: string) => void;
  label?: string;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

export default function ImageUploadComponent({
  currentImage,
  onImageUpload,
  label = 'Upload Image',
  acceptedTypes = 'image/jpeg,image/png,image/webp',
  maxSizeMB = 5,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.split(',').includes(file.type)) {
      setError(`Please upload a valid image file (${acceptedTypes})`);
      return;
    }

    // Validate file size (API has 3MB limit)
    const maxSizeBytes = Math.min(maxSizeMB * 1024 * 1024, 3 * 1024 * 1024);
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${Math.min(maxSizeMB, 3)}MB`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (!data.success || !data.url) {
        throw new Error('Invalid response from server');
      }

      setPreview(data.url);
      onImageUpload(data.url);
    } catch (err) {
      console.error('❌ Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUpload('');
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Current Image Preview */}
      {preview ?  (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
          <ImageIcon className="w-16 h-16 text-gray-300" />
        </div>
      )}

      {/* Upload Button */}
      <div>
        <input
          type="file"
          id="image-upload"
          accept={acceptedTypes}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <label
          htmlFor="image-upload"
          className={`flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer transition-colors ${
            uploading
              ? 'bg-gray-100 cursor-not-allowed'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              <span className="text-gray-700">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Choose Image</span>
            </>
          )}
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Accepted formats: JPG, PNG, WebP • Max size: {maxSizeMB}MB
      </p>
    </div>
  );
}