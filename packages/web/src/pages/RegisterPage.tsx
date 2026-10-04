import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Seo } from '@/components/Seo';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/utils';

interface RegisterValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
}

const RegisterPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const { addToast } = useToast();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterValues>({ defaultValues: { rememberMe: true } });
  const passwordValue = watch('password');

  const submit = handleSubmit(async (values) => {
    try {
      await registerUser(values);
      addToast({ title: 'Account created', message: 'Welcome to the storefront.', tone: 'success' });
      navigate('/');
    } catch (error) {
      addToast({ title: 'Unable to register', message: getErrorMessage(error), tone: 'error' });
    }
  });

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
      <Seo description="Create a customer account to track orders and speed up checkout." title="Register" />
      <h1 className="text-3xl font-semibold text-slate-900">Create account</h1>
      <p className="mt-2 text-slate-600">Register to save your profile, manage orders, and checkout faster.</p>
      <form className="mt-8 space-y-4" onSubmit={submit}><div className="grid gap-4 md:grid-cols-2"><FormInput error={errors.firstName?.message} label="First name" {...register('firstName', { required: 'First name is required.' })} /><FormInput error={errors.lastName?.message} label="Last name" {...register('lastName', { required: 'Last name is required.' })} /></div><FormInput error={errors.email?.message} label="Email" type="email" {...register('email', { required: 'Email is required.' })} /><div className="grid gap-4 md:grid-cols-2"><FormInput error={errors.password?.message} label="Password" type="password" {...register('password', { required: 'Password is required.', minLength: { value: 8, message: 'Password must be at least 8 characters.' } })} /><FormInput error={errors.confirmPassword?.message} label="Confirm password" type="password" {...register('confirmPassword', { required: 'Confirm your password.', validate: (value) => value === passwordValue || 'Passwords do not match.' })} /></div><label className="flex items-center gap-3 text-sm text-slate-700"><input className="h-4 w-4" type="checkbox" {...register('rememberMe')} />Keep me signed in after registration</label><Button fullWidth isLoading={isLoading} type="submit">Create account</Button></form>
      <p className="mt-6 text-sm text-slate-600">Already registered? <Link className="font-semibold text-brand hover:text-brand-dark" to="/login">Sign in</Link></p>
    </div>
  );
};

export default RegisterPage;
