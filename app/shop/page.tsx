import db from '@/lib/db';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ShopPage() {
  const products = db.prepare(`
    SELECT p.*, 
           COUNT(pv.id) as version_count
    FROM products p
    LEFT JOIN product_versions pv ON p.id = pv.product_id
    WHERE p.status = 'active'
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all() as any[];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">Shop</h1>
          {products.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-gray-600 text-base md:text-lg">No products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {product.image_url && (
                    <div className="aspect-video bg-gray-200">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-base md:text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg md:text-xl font-bold text-indigo-600">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      {product.version_count > 0 && (
                        <span className="text-xs text-gray-500">
                          {product.version_count} version{product.version_count > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

