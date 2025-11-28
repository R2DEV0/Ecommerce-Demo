'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, X, Image as ImageIcon, File, Video, FileText, Search, Filter } from 'lucide-react';
import Image from 'next/image';
import Toast from './Toast';

interface MediaItem {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  description: string | null;
  uploaded_at: string;
}

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, [selectedType, searchTerm]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType) params.append('type', selectedType);
      if (searchTerm) params.append('search', searchTerm);
      
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
        setShowUploadModal(false);
        fetchMedia();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(data.error || 'Failed to upload file');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this media file?')) return;

    try {
      const res = await fetch(`/api/media?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        fetchMedia();
      } else {
        setError(data.error || 'Failed to delete media');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string, mimeType: string) => {
    if (fileType === 'image') return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (fileType === 'video') return <Video className="w-8 h-8 text-red-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-8 h-8 text-red-600" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const filteredMedia = media.filter(item => {
    if (selectedType && item.file_type !== selectedType) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        item.original_filename.toLowerCase().includes(search) ||
        (item.alt_text && item.alt_text.toLowerCase().includes(search))
      );
    }
    return true;
  });

  return (
    <>
      {success && (
        <Toast
          message="Operation completed successfully!"
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

      {/* Toolbar */}
      <div className="mb-4 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
            >
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="application">Documents</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-[#2271b1] text-white px-3 py-2 rounded-sm hover:bg-[#135e96] transition-colors text-sm flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Add New</span>
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upload Media</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUpload}
              disabled={uploading}
              className="w-full mb-4"
            />
            
            {uploading && (
              <p className="text-sm text-gray-600">Uploading...</p>
            )}
          </div>
        </div>
      )}

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading media...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <File className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No media files found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="border border-[#c3c4c7] rounded-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setSelectedMedia(item)}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                {item.file_type === 'image' ? (
                  <Image
                    src={item.file_path}
                    alt={item.alt_text || item.original_filename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4">
                    {getFileIcon(item.file_type, item.mime_type)}
                    <span className="text-xs text-gray-600 mt-2 text-center line-clamp-2">
                      {item.original_filename}
                    </span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="p-2 bg-white">
                <p className="text-xs text-gray-600 truncate" title={item.original_filename}>
                  {item.original_filename}
                </p>
                <p className="text-xs text-gray-400">{formatFileSize(item.file_size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Media Details</h2>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedMedia.file_type === 'image' ? (
                <div className="relative w-full h-64 bg-gray-100 rounded">
                  <Image
                    src={selectedMedia.file_path}
                    alt={selectedMedia.alt_text || selectedMedia.original_filename}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
                  {getFileIcon(selectedMedia.file_type, selectedMedia.mime_type)}
                </div>
              )}
              
              <div className="space-y-2 text-sm">
                <div>
                  <strong>File Name:</strong> {selectedMedia.original_filename}
                </div>
                <div>
                  <strong>File Size:</strong> {formatFileSize(selectedMedia.file_size)}
                </div>
                <div>
                  <strong>File Type:</strong> {selectedMedia.mime_type}
                </div>
                {selectedMedia.width && selectedMedia.height && (
                  <div>
                    <strong>Dimensions:</strong> {selectedMedia.width} × {selectedMedia.height}
                  </div>
                )}
                <div>
                  <strong>URL:</strong>{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                    {selectedMedia.file_path}
                  </code>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMedia.file_path);
                      setSuccess(true);
                      setTimeout(() => setSuccess(false), 2000);
                    }}
                    className="bg-[#2271b1] text-white px-4 py-2 rounded-sm hover:bg-[#135e96] text-sm"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMedia(null);
                      handleDelete(selectedMedia.id);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-sm hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

