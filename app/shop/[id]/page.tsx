'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

interface ProductVersion {
  id: number;
  name: string;
  variation_type: string;
  attribute_value: string | null;
  price_modifier: number;
  stock: number | null;
  sku: string | null;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string | null;
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addItem, toggleCart, isOpen } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [versions, setVersions] = useState<ProductVersion[]>([]);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setProduct(data.product);
          setVersions(data.versions || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load product');
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">{error || 'Product not found'}</p>
          </div>
        </div>
      </>
    );
  }

  // Group versions by type
  const versionsByType: Record<string, ProductVersion[]> = {};
  versions.forEach(version => {
    const type = version.variation_type || 'general';
    if (!versionsByType[type]) {
      versionsByType[type] = [];
    }
    versionsByType[type].push(version);
  });

  // Calculate current price
  const basePrice = parseFloat(product.price.toString());
  let currentPrice = basePrice;
  Object.values(selectedVariations).forEach(versionId => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      currentPrice += parseFloat(version.price_modifier.toString());
    }
  });

  const handleVariationSelect = (type: string, versionId: number) => {
    setSelectedVariations(prev => ({
      ...prev,
      [type]: versionId
    }));
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Build variations array from selected variations
    const variations = Object.entries(selectedVariations).map(([type, versionId]) => {
      const version = versions.find(v => v.id === versionId);
      return {
        versionId: versionId,
        versionName: version?.name || 'Default',
        variationType: type,
      };
    });

    // Add item to cart
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.image_url,
      price: currentPrice,
      quantity: 1,
      variations,
    });

    // Open cart automatically
    if (!isOpen) {
      toggleCart();
    }
  };

  const getVariationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'quantity': 'Variation',
      'color': 'Color',
      'size': 'Size',
      'general': 'Options'
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              {product.image_url && (
                <div className="md:w-1/2">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className={`p-8 ${product.image_url ? 'md:w-1/2' : 'w-full'}`}>
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                <p className="text-gray-600 mb-6">{product.description}</p>
                
                {/* Variations */}
                {Object.keys(versionsByType).length > 0 && (
                  <div className="mb-6 space-y-4">
                    {Object.entries(versionsByType).map(([type, typeVersions]) => (
                      <div key={type}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {getVariationTypeLabel(type)}:
                        </label>
                        {type === 'color' ? (
                          // Color swatches
                          <div className="flex flex-wrap gap-2">
                            {typeVersions.map((version) => {
                              const isSelected = selectedVariations[type] === version.id;
                              const colorValue = version.attribute_value || version.name.toLowerCase();
                              return (
                                <button
                                  key={version.id}
                                  onClick={() => handleVariationSelect(type, version.id)}
                                  className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                                    isSelected 
                                      ? 'border-primary-600 ring-2 ring-primary-200' 
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                  style={{
                                    backgroundColor: colorValue.includes('#') 
                                      ? colorValue 
                                      : colorValue === 'red' ? '#ef4444' :
                                        colorValue === 'blue' ? '#3b82f6' :
                                        colorValue === 'green' ? '#10b981' :
                                        colorValue === 'yellow' ? '#eab308' :
                                        colorValue === 'black' ? '#000000' :
                                        colorValue === 'white' ? '#ffffff' :
                                        '#9ca3af'
                                  }}
                                  title={version.name}
                                >
                                  {isSelected && (
                                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                                      ✓
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                            <div className="flex items-center ml-2 text-sm text-gray-600">
                              {selectedVariations[type] && (
                                <span>
                                  {typeVersions.find(v => v.id === selectedVariations[type])?.name}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          // Other variations as buttons
                          <div className="flex flex-wrap gap-2">
                            {typeVersions.map((version) => {
                              const isSelected = selectedVariations[type] === version.id;
                              const versionPrice = parseFloat(version.price_modifier.toString());
                              return (
                                <button
                                  key={version.id}
                                  onClick={() => handleVariationSelect(type, version.id)}
                                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                    isSelected
                                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                  }`}
                                >
                                  <div className="font-medium">{version.name}</div>
                                  {versionPrice !== 0 && (
                                    <div className="text-xs">
                                      {versionPrice > 0 ? '+' : ''}${versionPrice.toFixed(2)}
                                    </div>
                                  )}
                                  {version.stock !== null && (
                                    <div className="text-xs text-gray-500">
                                      {version.stock > 0 ? `${version.stock} in stock` : 'Out of stock'}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="mb-6">
                  <p className="text-3xl font-bold text-primary-600 mb-2">
                    ${currentPrice.toFixed(2)}
                  </p>
                  {currentPrice !== basePrice && (
                    <p className="text-sm text-gray-500 line-through">
                      ${basePrice.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-action-500 text-white py-3 rounded-lg hover:bg-action-600 transition-colors font-semibold shadow-lg"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
