import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Seo } from '@/components/Seo';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/utils';

interface LoginValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({ defaultValues: { rememberMe: true } });

  const submit = handleSubmit(async (values) => {
    try {
      await login(values);
      addToast({ title: 'Welcome back', message: 'You are now signed in.', tone: 'success' });
      navigate((location.state as { from?: string } | null)?.from ?? '/');
    } catch (error) {
      addToast({ title: 'Login failed', message: getErrorMessage(error), tone: 'error' });
    }
  });

  return (
    <div className="mx-auto max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
      <Seo description="Sign in to manage your cart, orders, and saved profile." title="Login" />
      <h1 className="text-3xl font-semibold text-slate-900">Login</h1>
      <p className="mt-2 text-slate-600">Sign in to continue shopping, checkout securely, and manage your orders.</p>
      <form className="mt-8 space-y-4" onSubmit={submit}><FormInput error={errors.email?.message} label="Email" type="email" {...register('email', { required: 'Email is required.' })} /><FormInput error={errors.password?.message} label="Password" type="password" {...register('password', { required: 'Password is required.' })} /><label className="flex items-center gap-3 text-sm text-slate-700"><input className="h-4 w-4" type="checkbox" {...register('rememberMe')} />Remember me on this device</label><Button data-testid="login-submit" fullWidth isLoading={isLoading} type="submit">Login</Button></form>
      <p className="mt-6 text-sm text-slate-600">Don&apos;t have an account? <Link className="font-semibold text-brand hover:text-brand-dark" to="/register">Register here</Link></p>
    </div>
  );
};

export default LoginPage;
