import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatsCounter from "@/components/StatsCounter";
import db, { initDatabase } from "@/lib/db";
import { ArrowRight, Sparkles, BookOpen, Users, Globe } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Home() {
  await initDatabase();
  
  const result = await db.execute(`
    SELECT p.*, 
           COUNT(pv.id) as version_count
    FROM products p
    LEFT JOIN product_versions pv ON p.id = pv.product_id
    WHERE p.status = 'active' AND p.featured = 1
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 4
  `);
  const featuredProducts = result.rows as any[];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-sm mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span>Transforming Education Worldwide</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                The Center for{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Depth and Complexity
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Empowering learners to be independent thinkers and creative problem-solvers through research-based frameworks
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/courses"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-900 bg-white rounded-xl hover:bg-slate-50 transition-all shadow-lg shadow-white/25 hover:shadow-xl"
                >
                  Explore Courses
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
                >
                  Shop Resources
                </Link>
              </div>
            </div>
          </div>
          
        </section>

        {/* Stats Section */}
        <section className="py-20 md:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                Depth and Complexity is Growing!
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Join thousands of educators worldwide who are transforming their classrooms
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatsCounter 
                end={9} 
                label="Countries" 
                bgColor="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow" 
              />
              <StatsCounter 
                end={45} 
                label="States" 
                bgColor="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow" 
              />
              <StatsCounter 
                end={102002} 
                label="Classrooms" 
                bgColor="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow" 
              />
              <StatsCounter 
                end={2406124} 
                label="Students" 
                bgColor="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow" 
              />
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="py-20 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                    Best-Selling Resources
                  </h2>
                  <p className="text-lg text-slate-600 max-w-xl">
                    Essential tools for implementing Depth and Complexity in your classroom
                  </p>
                </div>
                <Link 
                  href="/shop"
                  className="mt-4 md:mt-0 inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                >
                  View all products
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.id}`}
                    className="group bg-slate-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-indigo-200"
                  >
                    {product.image_url && (
                      <div className="aspect-[4/3] bg-slate-200 overflow-hidden">
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
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-slate-900">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                        {product.version_count > 0 && (
                          <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-lg">
                            {product.version_count} options
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="py-20 md:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Professional Development</h3>
                <p className="text-slate-600 leading-relaxed">
                  Comprehensive workshops and training programs to help you master the Depth and Complexity framework
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Teaching Resources</h3>
                <p className="text-slate-600 leading-relaxed">
                  High-quality products and materials designed to support implementation in your classroom
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Global Community</h3>
                <p className="text-slate-600 leading-relaxed">
                  Join thousands of educators worldwide who are transforming student learning experiences
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Classroom?
            </h2>
            <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
              Start your journey with Depth and Complexity today and unlock your students&apos; potential
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-indigo-600 bg-white rounded-xl hover:bg-slate-50 transition-all shadow-lg"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
