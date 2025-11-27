import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/ProductForm';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(parseInt(params.id)) as any;
  
  if (!product) {
    notFound();
  }

  const versions = db.prepare(`
    SELECT * FROM product_versions 
    WHERE product_id = ? 
    ORDER BY variation_type, name
  `).all(product.id) as any[];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Product</h1>
          <ProductForm product={product} versions={versions} />
        </div>
      </div>
    </>
  );
}

