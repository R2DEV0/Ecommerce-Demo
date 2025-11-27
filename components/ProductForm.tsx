'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
}

export default function ProductForm({ product, versions: initialVersions = [] }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save product');
        setLoading(false);
        return;
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 max-w-4xl">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
            Featured Product (show on homepage)
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Product Variations */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Product Variations
            </label>
            <button
              type="button"
              onClick={addVersion}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + Add Variation
            </button>
          </div>

          <div className="space-y-4">
            {versions.map((version, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">Variation {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeVersion(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Name (e.g., "2-Pack", "Red", "Large")
                    </label>
                    <input
                      type="text"
                      value={version.name}
                      onChange={(e) => updateVersion(index, 'name', e.target.value)}
                      placeholder="2-Pack"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Variation Type
                    </label>
                    <select
                      value={version.variation_type}
                      onChange={(e) => updateVersion(index, 'variation_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                      <option value="quantity">Quantity</option>
                      <option value="color">Color</option>
                      <option value="size">Size</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Price Modifier ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={version.price_modifier}
                      onChange={(e) => updateVersion(index, 'price_modifier', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={version.stock || ''}
                      onChange={(e) => updateVersion(index, 'stock', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Leave empty for unlimited"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {version.variation_type === 'color' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Color Value (hex code or color name)
                    </label>
                    <input
                      type="text"
                      value={version.attribute_value}
                      onChange={(e) => updateVersion(index, 'attribute_value', e.target.value)}
                      placeholder="#ff0000 or red"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    SKU (optional)
                  </label>
                  <input
                    type="text"
                    value={version.sku}
                    onChange={(e) => updateVersion(index, 'sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-action-500 text-white py-3 rounded-lg hover:bg-action-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-lg"
          >
            {loading ? 'Saving...' : product?.id ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

