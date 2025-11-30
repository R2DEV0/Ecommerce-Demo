'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { X, Filter, Search, SlidersHorizontal } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string | null;
  version_count: number;
}

interface FilterData {
  tags: Array<{ id: number; name: string; product_count: number }>;
  categories: Array<{ category: string; product_count: number }>;
  priceRange: { min_price: number; max_price: number };
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterData, setFilterData] = useState<FilterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [selectedTags, selectedCategory, priceRange, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      if (priceRange.min) {
        params.append('minPrice', priceRange.min);
      }
      if (priceRange.max) {
        params.append('maxPrice', priceRange.max);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const res = await fetch(`/api/shop?${params.toString()}`);
      const data = await res.json();
      
      if (data.products) {
        setProducts(data.products);
      }
      if (data.filters) {
        setFilterData(data.filters);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSearchQuery('');
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedCategory || priceRange.min || priceRange.max || searchQuery;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shop</h1>
            <div className="flex gap-2 items-center">
              {/* Search */}
              <div className="relative flex-1 md:flex-initial md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                />
              </div>
              {/* Mobile filter button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle filters"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Tags Filter */}
                {filterData?.tags && filterData.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {filterData.tags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.name);
                        return (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.name)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {tag.name} ({tag.product_count})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Category Filter */}
                {filterData?.categories && filterData.categories.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Category</h3>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                    >
                      <option value="">All Categories</option>
                      {filterData.categories.map((cat) => (
                        <option key={cat.category} value={cat.category}>
                          {cat.category} ({cat.product_count})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price Range Filter */}
                {filterData?.priceRange && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Price Range</h3>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        min={filterData.priceRange.min_price}
                        max={filterData.priceRange.max_price}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        min={filterData.priceRange.min_price}
                        max={filterData.priceRange.max_price}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ${filterData.priceRange.min_price?.toFixed(2) || '0'} - ${filterData.priceRange.max_price?.toFixed(2) || '0'}
                    </p>
                  </div>
                )}

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
                        >
                          {tag}
                          <button
                            onClick={() => toggleTag(tag)}
                            className="hover:text-primary-900"
                            aria-label={`Remove ${tag} filter`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {selectedCategory && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                          {selectedCategory}
                          <button
                            onClick={() => setSelectedCategory('')}
                            className="hover:text-primary-900"
                            aria-label="Remove category filter"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-600 text-base md:text-lg mb-4">No products found.</p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Clear filters to see all products
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    Showing {products.length} product{products.length !== 1 ? 's' : ''}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${product.id}`}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition-all transform hover:-translate-y-1 overflow-hidden group"
                      >
                        {product.image_url && (
                          <div className="aspect-video bg-gray-200 overflow-hidden">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-3 md:p-4">
                          <h3 className="font-semibold text-base md:text-lg mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-lg md:text-xl font-bold text-primary-600">
                              ${parseFloat(product.price.toString()).toFixed(2)}
                            </span>
                            {product.version_count > 0 && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {product.version_count} option{product.version_count > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
