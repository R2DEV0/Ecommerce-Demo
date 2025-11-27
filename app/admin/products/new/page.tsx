import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import ProductForm from '@/components/ProductForm';

export default async function NewProductPage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-normal mb-6 text-[#1d2327]">Add New Product</h1>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-6">
        <ProductForm />
      </div>
    </div>
  );
}

