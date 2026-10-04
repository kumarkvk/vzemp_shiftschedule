import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@/lib/monitoring';

interface SeoProps {
  title: string;
  description: string;
}

export const Seo = ({ title, description }: SeoProps): JSX.Element => {
  const location = useLocation();
  useEffect(() => {
    trackEvent('page_view', { title, path: location.pathname });
  }, [location.pathname, title]);

  return (
    <Helmet>
      <title>{`${title} · Ecommerce Storefront`}</title>
      <meta content={description} name="description" />
    </Helmet>
  );
};
