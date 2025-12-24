'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { X, Filter, Search, SlidersHorizontal, ShoppingBag } from 'lucide-react';

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
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      if (selectedCategory) params.append('category', selectedCategory);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/shop?${params.toString()}`);
      const data = await res.json();
      
      if (data.products) setProducts(data.products);
      if (data.filters) setFilterData(data.filters);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
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
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Shop</h1>
                <p className="text-slate-600 mt-1">Discover our collection of educational resources</p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="relative flex-1 md:w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                  aria-label="Toggle filters"
                >
                  <SlidersHorizontal className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h2>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                      Clear All
                    </button>
                  )}
                </div>

                {filterData?.tags && filterData.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {filterData.tags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.name)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedTags.includes(tag.name)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filterData?.categories && filterData.categories.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Category</h3>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

                {filterData?.priceRange && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Price Range</h3>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {hasActiveFilters && (
                  <div className="pt-4 border-t border-slate-200">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Active Filters</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs">
                          {tag}
                          <button onClick={() => toggleTag(tag)} className="hover:text-indigo-900">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {selectedCategory && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs">
                          {selectedCategory}
                          <button onClick={() => setSelectedCategory('')} className="hover:text-indigo-900">
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
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                  <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg mb-4">No products found</p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-indigo-600 hover:text-indigo-700 font-medium">
                      Clear filters to see all products
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-slate-500">
                    Showing {products.length} product{products.length !== 1 ? 's' : ''}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${product.id}`}
                        className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
                      >
                        {product.image_url && (
                          <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="font-semibold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-slate-900">
                              ${parseFloat(product.price.toString()).toFixed(2)}
                            </span>
                            {product.version_count > 0 && (
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
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
      <Footer />
    </>
  );
}
