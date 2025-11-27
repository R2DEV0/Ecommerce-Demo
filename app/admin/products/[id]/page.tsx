import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
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
    <div>
      <h1 className="text-2xl font-normal mb-6 text-[#1d2327]">Edit Product</h1>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-6">
        <ProductForm product={product} versions={versions} />
      </div>
    </div>
  );
}

