'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Toast from './Toast';

interface MediaSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  accept?: string;
  type?: 'image' | 'all';
}

export default function MediaSelector({ value, onChange, label, accept = 'image/*', type = 'image' }: MediaSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [media, setMedia] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (showModal) {
      fetchMedia();
    }
  }, [showModal]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (type === 'image') params.append('type', 'image');
      
      const res = await fetch(`/api/media?${params.toString()}`);
      const data = await res.json();
      
      if (res.ok) {
        setMedia(data.media || []);
      } else {
        setError(data.error || 'Failed to load media');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        fetchMedia();
        onChange(data.file_path);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.error || 'Failed to upload file');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {success && (
        <Toast
          message="File uploaded successfully!"
          type="success"
          onClose={() => setSuccess(false)}
        />
      )}
      
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError('')}
        />
      )}

      <div>
        <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
          {label}
        </label>
        
        {value ? (
          <div className="relative inline-block">
            <div className="relative w-32 h-32 border border-[#c3c4c7] rounded-sm overflow-hidden">
              {type === 'image' ? (
                <Image
                  src={value}
                  alt={label}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#c3c4c7] rounded-sm p-4 text-center">
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-2">No {label.toLowerCase()} selected</p>
          </div>
        )}

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="bg-[#2271b1] text-white px-3 py-2 rounded-sm hover:bg-[#135e96] transition-colors text-xs md:text-sm"
          >
            {value ? 'Change' : 'Select'} {label}
          </button>
          {!value && (
            <label className="bg-gray-100 text-gray-700 px-3 py-2 rounded-sm hover:bg-gray-200 transition-colors text-xs md:text-sm cursor-pointer">
              <Upload className="w-4 h-4 inline mr-1" />
              Upload
              <input
                type="file"
                accept={accept}
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* Media Library Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Select {label}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="bg-[#2271b1] text-white px-4 py-2 rounded-sm hover:bg-[#135e96] transition-colors text-sm cursor-pointer inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload New
                <input
                  type="file"
                  accept={accept}
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading media...</div>
            ) : media.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No media files found.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {media.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onChange(item.file_path);
                      setShowModal(false);
                    }}
                    className={`border-2 rounded-sm overflow-hidden cursor-pointer transition-all ${
                      value === item.file_path
                        ? 'border-[#2271b1] ring-2 ring-[#2271b1]'
                        : 'border-[#c3c4c7] hover:border-[#2271b1]'
                    }`}
                  >
                    <div className="aspect-square bg-gray-100 relative">
                      {item.file_type === 'image' ? (
                        <Image
                          src={item.file_path}
                          alt={item.alt_text || item.original_filename}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

