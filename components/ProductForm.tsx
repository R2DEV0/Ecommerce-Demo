'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Toast from './Toast';
import { X } from 'lucide-react';

interface ProductVersion {
  id?: number;
  name: string;
  variation_type: string;
  attribute_value: string;
  price_modifier: number;
  stock: number | null;
  sku: string;
}

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  status: string;
  featured: number;
}

interface ProductFormProps {
  product?: Product;
  versions?: ProductVersion[];
  tags?: Array<{ id: number; name: string }>;
}

export default function ProductForm({ product, versions: initialVersions = [], tags: initialTags = [] }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Product>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    image_url: product?.image_url || '',
    category: product?.category || '',
    status: product?.status || 'active',
    featured: product?.featured || 0,
  });
  const [versions, setVersions] = useState<ProductVersion[]>(
    initialVersions.length > 0 
      ? initialVersions.map(v => ({
          ...v,
          attribute_value: v.attribute_value || '',
          sku: v.sku || '',
        }))
      : []
  );
  const [tags, setTags] = useState<Array<{ id: number; name: string }>>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState<Array<{ id: number; name: string }>>([]);

  // Fetch available tags on mount
  useEffect(() => {
    fetch('/api/tags')
      .then(res => res.json())
      .then(data => {
        if (data.tags) {
          setAvailableTags(data.tags);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch product tags if editing
  useEffect(() => {
    if (product?.id) {
      fetch(`/api/products/${product.id}/tags`)
        .then(res => res.json())
        .then(data => {
          if (data.tags) {
            setTags(data.tags);
          }
        })
        .catch(() => {});
    }
  }, [product?.id]);

  const addVersion = () => {
    setVersions([...versions, {
      name: '',
      variation_type: 'general',
      attribute_value: '',
      price_modifier: 0,
      stock: null,
      sku: '',
    }]);
  };

  const removeVersion = (index: number) => {
    setVersions(versions.filter((_, i) => i !== index));
  };

  const updateVersion = (index: number, field: keyof ProductVersion, value: any) => {
    const updated = [...versions];
    updated[index] = { ...updated[index], [field]: value };
    setVersions(updated);
  };

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim().toLowerCase();
    if (!trimmed) return;
    
    // Check if tag already exists in selected tags
    if (tags.some(t => t.name.toLowerCase() === trimmed)) {
      setTagInput('');
      return;
    }

    // Check if tag exists in available tags
    const existingTag = availableTags.find(t => t.name.toLowerCase() === trimmed);
    if (existingTag) {
      setTags([...tags, existingTag]);
    } else {
      // Create new tag (will be created on server)
      setTags([...tags, { id: 0, name: trimmed }]);
    }
    setTagInput('');
  };

  const removeTag = (tagId: number) => {
    setTags(tags.filter(t => t.id !== tagId));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = product?.id 
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products';
      
      const method = product?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: formData,
          versions: versions.filter(v => v.name.trim() !== ''),
          tags: tags.map(t => t.name),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save product');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {success && (
        <Toast
          message={product?.id ? 'Product updated successfully!' : 'Product created successfully!'}
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
      
      <form onSubmit={handleSubmit} className="w-full">

      <div className="space-y-3 md:space-y-4 lg:space-y-6">
        <div>
          <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
            Product Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
              Price <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
              className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured === 1}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked ? 1 : 0 })}
            className="h-4 w-4 text-[#2271b1] focus:ring-[#2271b1] border-[#8c8f94] rounded"
          />
          <label htmlFor="featured" className="ml-2 block text-xs md:text-sm text-[#1d2327]">
            Featured Product (show on homepage)
          </label>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
            Category
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
          />
        </div>

        {/* Tags Section */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
            Tags (for filtering and related products)
          </label>
          <div className="flex flex-wrap gap-2 mb-2 p-2 md:p-3 min-h-[60px] border border-[#8c8f94] rounded-sm bg-white">
            {tags.length === 0 ? (
              <span className="text-xs text-gray-400">No tags added yet</span>
            ) : (
              tags.map((tag) => (
                <span
                  key={tag.id || tag.name}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-[#2271b1] text-white text-xs rounded-sm"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => removeTag(tag.id)}
                    className="hover:bg-[#135e96] rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${tag.name} tag`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Type tag name and press Enter"
              className="flex-1 px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
            />
            <button
              type="button"
              onClick={() => addTag(tagInput)}
              className="px-3 py-1.5 md:py-2 bg-[#2271b1] text-white rounded-sm hover:bg-[#135e96] transition-colors text-xs md:text-sm whitespace-nowrap"
            >
              Add Tag
            </button>
          </div>
          {availableTags.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Suggested tags:</p>
              <div className="flex flex-wrap gap-1">
                {availableTags
                  .filter(t => !tags.some(selected => selected.id === t.id))
                  .slice(0, 10)
                  .map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => addTag(tag.name)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Variations */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-medium text-[#1d2327]">
              Product Variations
            </label>
            <button
              type="button"
              onClick={addVersion}
              className="text-[#2271b1] hover:text-[#135e96] text-xs md:text-sm font-medium whitespace-nowrap"
            >
              + Add Variation
            </button>
          </div>

          <div className="space-y-3 md:space-y-4">
            {versions.map((version, index) => (
              <div key={index} className="border border-[#c3c4c7] rounded-sm p-3 md:p-4">
                <div className="flex justify-between items-start mb-3 md:mb-4">
                  <h4 className="text-sm md:text-base font-medium text-[#1d2327]">Variation {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeVersion(index)}
                    className="text-red-600 hover:text-red-700 text-xs md:text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1d2327] mb-1">
                      Name (e.g., &quot;2-Pack&quot;, &quot;Red&quot;, &quot;Large&quot;)
                    </label>
                    <input
                      type="text"
                      value={version.name}
                      onChange={(e) => updateVersion(index, 'name', e.target.value)}
                      placeholder="2-Pack"
                      className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1d2327] mb-1">
                      Variation Type
                    </label>
                    <select
                      value={version.variation_type}
                      onChange={(e) => updateVersion(index, 'variation_type', e.target.value)}
                      className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
                    >
                      <option value="quantity">Quantity</option>
                      <option value="color">Color</option>
                      <option value="size">Size</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1d2327] mb-1">
                      Price Modifier ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={version.price_modifier}
                      onChange={(e) => updateVersion(index, 'price_modifier', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1d2327] mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={version.stock || ''}
                      onChange={(e) => updateVersion(index, 'stock', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Leave empty for unlimited"
                      className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
                    />
                  </div>
                </div>

                {version.variation_type === 'color' && (
                  <div>
                    <label className="block text-xs font-medium text-[#1d2327] mb-1">
                      Color Value (hex code or color name)
                    </label>
                    <input
                      type="text"
                      value={version.attribute_value}
                      onChange={(e) => updateVersion(index, 'attribute_value', e.target.value)}
                      placeholder="#ff0000 or red"
                      className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#1d2327] mb-1">
                    SKU (optional)
                  </label>
                  <input
                    type="text"
                    value={version.sku}
                    onChange={(e) => updateVersion(index, 'sku', e.target.value)}
                    className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 pt-3 md:pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#2271b1] text-white px-3 py-2 md:px-4 md:py-2 rounded-sm hover:bg-[#135e96] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-normal text-xs md:text-sm"
          >
            {loading ? 'Saving...' : product?.id ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-3 py-2 md:px-4 md:py-2 border border-[#c3c4c7] rounded-sm hover:bg-[#f6f7f7] transition-colors text-xs md:text-sm text-[#1d2327]"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
    </>
  );
}

