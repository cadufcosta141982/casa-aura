import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{const live=process.env.LIVE_CHECKOUT_ENABLED==='true';return {rules:{userAgent:'*',allow:live?'/':undefined,disallow:live?['/admin','/api','/checkout','/carrinho']:'/'},sitemap:process.env.NEXT_PUBLIC_SITE_URL?`${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`:undefined}}
