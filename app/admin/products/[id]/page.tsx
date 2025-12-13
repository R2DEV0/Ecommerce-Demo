import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db, { initDatabase } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    redirect('/login');
  }

  await initDatabase();
  const { id } = await params;

  const productResult = await db.execute({
    sql: 'SELECT * FROM products WHERE id = ?',
    args: [parseInt(id)]
  });
  const product = productResult.rows[0] as any;
  
  if (!product) {
    notFound();
  }

  const versionsResult = await db.execute({
    sql: `SELECT * FROM product_versions 
          WHERE product_id = ? 
          ORDER BY variation_type, name`,
    args: [product.id]
  });
  const versions = versionsResult.rows as any[];

  const tagsResult = await db.execute({
    sql: `SELECT t.id, t.name
          FROM tags t
          INNER JOIN product_tags pt ON t.id = pt.tag_id
          WHERE pt.product_id = ?
          ORDER BY t.name ASC`,
    args: [product.id]
  });
  const tags = tagsResult.rows as Array<{ id: number; name: string }>;

  return (
    <div className="w-full max-w-full">
      <h1 className="text-xl md:text-2xl font-normal mb-3 md:mb-6 text-[#1d2327]">Edit Product</h1>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-3 sm:p-4 md:p-6 w-full max-w-full">
        <ProductForm product={product} versions={versions} tags={tags} />
      </div>
    </div>
  );
}
