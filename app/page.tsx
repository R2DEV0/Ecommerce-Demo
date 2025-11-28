import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatsCounter from "@/components/StatsCounter";
import db from "@/lib/db";

export default function Home() {
  const featuredProducts = db.prepare(`
    SELECT p.*, 
           COUNT(pv.id) as version_count
    FROM products p
    LEFT JOIN product_versions pv ON p.id = pv.product_id
    WHERE p.status = 'active' AND p.featured = 1
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 4
  `).all() as any[];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-purple-700 text-white">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight px-2">
                The Center for Depth and Complexity
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-blue-100 max-w-2xl mx-auto px-4">
                Empowering learners to be independent thinkers and creative problem-solvers
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <Link
                  href="/courses"
                  className="bg-white text-primary-600 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Explore Courses
                </Link>
                <Link
                  href="/shop"
                  className="bg-action-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-action-600 transition-colors shadow-lg border-2 border-white"
                >
                  Shop Products
                </Link>
              </div>
            </div>
          </div>
          {/* Decorative wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
            </svg>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Depth and Complexity is Growing!
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Join thousands of educators worldwide who are transforming their classrooms
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
              <StatsCounter 
                end={9} 
                label="Countries" 
                bgColor="bg-gradient-to-br from-blue-50 to-blue-100" 
              />
              <StatsCounter 
                end={45} 
                label="States" 
                bgColor="bg-gradient-to-br from-purple-50 to-purple-100" 
              />
              <StatsCounter 
                end={102002} 
                label="Classrooms" 
                bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100" 
              />
              <StatsCounter 
                end={2406124} 
                label="Students" 
                bgColor="bg-gradient-to-br from-pink-50 to-pink-100" 
              />
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="py-12 md:py-16 bg-primary-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                  Don't Miss Our Best-Selling Products
                </h2>
                <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                  Essential tools and resources for implementing Depth and Complexity in your classroom
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.id}`}
                    className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden group"
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
                    <div className="p-4 md:p-6">
                      <h3 className="font-semibold text-base md:text-lg mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg md:text-xl font-bold text-primary-600">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                        {product.version_count > 0 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {product.version_count} options
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-6 md:mt-8">
                <Link
                  href="/shop"
                  className="inline-block bg-action-500 text-white px-6 py-2 md:px-8 md:py-3 rounded-lg font-semibold hover:bg-action-600 transition-colors shadow-lg text-sm md:text-base"
                >
                  View All Products
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              <div className="text-center p-4 md:p-6">
                <div className="text-4xl md:text-5xl mb-3 md:mb-4">📚</div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Professional Development</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Comprehensive workshops and training programs to help you master the Depth and Complexity framework
                </p>
              </div>
              <div className="text-center p-4 md:p-6">
                <div className="text-4xl md:text-5xl mb-3 md:mb-4">🛠️</div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Teaching Resources</h3>
                <p className="text-sm md:text-base text-gray-600">
                  High-quality products and materials designed to support implementation in your classroom
                </p>
              </div>
              <div className="text-center p-4 md:p-6">
                <div className="text-4xl md:text-5xl mb-3 md:mb-4">🌐</div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Global Community</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Join thousands of educators worldwide who are transforming student learning experiences
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-primary-600 via-purple-600 to-purple-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 px-4">
              Ready to Transform Your Classroom?
            </h2>
            <p className="text-base md:text-xl mb-6 md:mb-8 text-blue-100 max-w-2xl mx-auto px-4">
              Start your journey with Depth and Complexity today
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/register"
                className="bg-white text-primary-600 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/courses"
                className="bg-action-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-action-600 transition-colors shadow-lg border-2 border-white"
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
