import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { adminService } from '@/api/services/adminService';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Modal } from '@/components/Modal';
import { Seo } from '@/components/Seo';
import { useFetch } from '@/hooks/useFetch';
import { useToast } from '@/hooks/useToast';
import { currency, getErrorMessage } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  inventory: number;
  imageUrl: string;
}

const emptyValues: ProductFormValues = { name: '', description: '', price: 0, categoryId: '', categoryName: '', inventory: 0, imageUrl: '' };

const AdminProductsPage = (): JSX.Element => {
  const { addToast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data, error, isLoading, refetch } = useFetch(() => adminService.listProducts(), [], { area: 'admin-products' });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({ defaultValues: emptyValues });

  useEffect(() => {
    if (editingProduct) {
      reset({ name: editingProduct.name, description: editingProduct.description, price: editingProduct.price, categoryId: editingProduct.category?.id ?? '', categoryName: editingProduct.category?.name ?? '', inventory: editingProduct.inventory, imageUrl: editingProduct.imageUrl });
    } else {
      reset(emptyValues);
    }
  }, [editingProduct, reset]);

  const products = useMemo(() => data?.data ?? [], [data?.data]);
  const closeModal = (): void => { setEditingProduct(null); setIsModalOpen(false); };
  const openCreate = (): void => { setEditingProduct(null); setIsModalOpen(true); };
  const openEdit = (product: Product): void => { setEditingProduct(product); setIsModalOpen(true); };

  const submit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const payload = { name: values.name, description: values.description, price: Number(values.price), inventory: Number(values.inventory), imageUrl: values.imageUrl, categoryId: values.categoryId || undefined, category: values.categoryName ? { id: values.categoryId || values.categoryName.toLowerCase(), name: values.categoryName } : undefined };
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, payload);
        addToast({ title: 'Product updated', message: `${values.name} has been updated.`, tone: 'success' });
      } else {
        await adminService.createProduct(payload);
        addToast({ title: 'Product created', message: `${values.name} is now live.`, tone: 'success' });
      }
      closeModal();
      await refetch();
    } catch (err) {
      addToast({ title: 'Unable to save product', message: getErrorMessage(err), tone: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleDelete = async (product: Product): Promise<void> => {
    try {
      await adminService.deleteProduct(product.id);
      addToast({ title: 'Product deleted', message: `${product.name} was removed.`, tone: 'success' });
      await refetch();
    } catch (err) {
      addToast({ title: 'Unable to delete product', message: getErrorMessage(err), tone: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <Seo description="Create, edit, delete, and monitor product inventory levels." title="Admin Products" />
      <div className="flex items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold text-slate-900">Admin products</h1><p className="mt-2 text-slate-600">Manage inventory, pricing, and merchandising from one place.</p></div><Button data-testid="add-product-button" onClick={openCreate}>Add product</Button></div>
      {isLoading ? <LoadingSpinner /> : null}
      {error ? <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div> : null}
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-6 py-4 font-medium">Product</th><th className="px-6 py-4 font-medium">Category</th><th className="px-6 py-4 font-medium">Price</th><th className="px-6 py-4 font-medium">Inventory</th><th className="px-6 py-4 font-medium">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{products.map((product) => <tr key={product.id}><td className="px-6 py-4"><div className="font-medium text-slate-900">{product.name}</div><div className="text-xs text-slate-500">{product.description}</div></td><td className="px-6 py-4 text-slate-600">{product.category?.name ?? 'General'}</td><td className="px-6 py-4 font-semibold text-slate-900">{currency(product.price)}</td><td className="px-6 py-4 text-slate-600">{product.inventory}</td><td className="px-6 py-4"><div className="flex gap-3"><Button onClick={() => openEdit(product)} variant="secondary">Edit</Button><Button onClick={() => void handleDelete(product)} variant="ghost">Delete</Button></div></td></tr>)}</tbody></table></div></div>
      <Modal footer={<div className="flex justify-end gap-3"><Button onClick={closeModal} variant="ghost">Cancel</Button><Button form="product-form" isLoading={isSubmitting} type="submit">{editingProduct ? 'Save changes' : 'Create product'}</Button></div>} isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Edit product' : 'Add a new product'}>
        <form className="space-y-4" id="product-form" onSubmit={submit}><FormInput error={errors.name?.message} label="Name" {...register('name', { required: 'Name is required.' })} /><FormInput error={errors.description?.message} label="Description" textarea {...register('description', { required: 'Description is required.' })} /><div className="grid gap-4 md:grid-cols-2"><FormInput error={errors.price?.message} label="Price" step="0.01" type="number" {...register('price', { required: 'Price is required.', min: { value: 0.01, message: 'Price must be greater than zero.' }, valueAsNumber: true })} /><FormInput error={errors.inventory?.message} label="Inventory" type="number" {...register('inventory', { required: 'Inventory is required.', min: { value: 0, message: 'Inventory cannot be negative.' }, valueAsNumber: true })} /></div><div className="grid gap-4 md:grid-cols-2"><FormInput label="Category id" {...register('categoryId')} /><FormInput error={errors.categoryName?.message} label="Category name" {...register('categoryName', { required: 'Category name is required.' })} /></div><FormInput error={errors.imageUrl?.message} label="Image URL" {...register('imageUrl', { required: 'Image URL is required.' })} /></form>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;
