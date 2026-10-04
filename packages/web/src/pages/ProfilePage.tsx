import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { userService } from '@/api/services/userService';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Seo } from '@/components/Seo';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/utils';

interface ProfileValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  currentPassword: string;
  newPassword: string;
  emailUpdates: boolean;
  orderAlerts: boolean;
  marketing: boolean;
}

const ProfilePage = (): JSX.Element => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, reset, handleSubmit, formState: { errors } } = useForm<ProfileValues>();

  useEffect(() => {
    reset({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '', phone: user?.phone ?? '', street: user?.addresses?.[0]?.street ?? '', city: user?.addresses?.[0]?.city ?? '', state: user?.addresses?.[0]?.state ?? '', zip: user?.addresses?.[0]?.zip ?? '', country: user?.addresses?.[0]?.country ?? 'US', currentPassword: '', newPassword: '', emailUpdates: user?.notificationPreferences?.emailUpdates ?? true, orderAlerts: user?.notificationPreferences?.orderAlerts ?? true, marketing: user?.notificationPreferences?.marketing ?? false });
  }, [reset, user]);

  const submit = handleSubmit(async (values) => {
    setIsSaving(true);
    setError(null);
    try {
      await updateProfile({ firstName: values.firstName, lastName: values.lastName, email: values.email, phone: values.phone, addresses: [{ street: values.street, city: values.city, state: values.state, zip: values.zip, country: values.country }], notificationPreferences: { emailUpdates: values.emailUpdates, orderAlerts: values.orderAlerts, marketing: values.marketing } });
      if (values.currentPassword && values.newPassword) {
        await userService.changePassword(values.currentPassword, values.newPassword);
      }
      addToast({ title: 'Profile updated', message: 'Your changes were saved successfully.', tone: 'success' });
    } catch (err) {
      setError(getErrorMessage(err, 'Profile update failed.'));
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <div className="space-y-6">
      <Seo description="Manage account details, addresses, password settings, and notifications." title="Profile" />
      <div><h1 className="text-3xl font-semibold text-slate-900">Your profile</h1><p className="mt-2 text-slate-600">Update account details, password, address book, and notification preferences.</p></div>
      <form className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft" onSubmit={submit}><section className="space-y-4"><h2 className="text-xl font-semibold text-slate-900">Profile information</h2><div className="grid gap-4 md:grid-cols-2"><FormInput error={errors.firstName?.message} label="First name" {...register('firstName', { required: 'First name is required.' })} /><FormInput error={errors.lastName?.message} label="Last name" {...register('lastName', { required: 'Last name is required.' })} /><FormInput error={errors.email?.message} label="Email" type="email" {...register('email', { required: 'Email is required.' })} /><FormInput error={errors.phone?.message} label="Phone" {...register('phone')} /></div></section><section className="space-y-4"><h2 className="text-xl font-semibold text-slate-900">Address book</h2><div className="grid gap-4 md:grid-cols-2"><FormInput error={errors.street?.message} label="Street" {...register('street', { required: 'Street is required.' })} /><FormInput error={errors.city?.message} label="City" {...register('city', { required: 'City is required.' })} /><FormInput error={errors.state?.message} label="State" {...register('state', { required: 'State is required.' })} /><FormInput error={errors.zip?.message} label="ZIP code" {...register('zip', { required: 'ZIP code is required.' })} /><FormInput error={errors.country?.message} label="Country" {...register('country', { required: 'Country is required.' })} /></div></section><section className="space-y-4"><h2 className="text-xl font-semibold text-slate-900">Change password</h2><div className="grid gap-4 md:grid-cols-2"><FormInput label="Current password" type="password" {...register('currentPassword')} /><FormInput error={errors.newPassword?.message} label="New password" type="password" {...register('newPassword', { minLength: { value: 8, message: 'Password must be at least 8 characters.' } })} /></div></section><section className="space-y-4"><h2 className="text-xl font-semibold text-slate-900">Notification preferences</h2><div className="grid gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700"><label className="flex items-center gap-3"><input className="h-4 w-4" type="checkbox" {...register('emailUpdates')} />Product and company email updates</label><label className="flex items-center gap-3"><input className="h-4 w-4" type="checkbox" {...register('orderAlerts')} />Order alerts and shipment notifications</label><label className="flex items-center gap-3"><input className="h-4 w-4" type="checkbox" {...register('marketing')} />Promotions and recommendations</label></div></section>{error ? <p className="text-sm text-rose-600">{error}</p> : null}<div className="flex justify-end"><Button isLoading={isSaving} type="submit">Save profile</Button></div></form>
    </div>
  );
};

export default ProfilePage;
