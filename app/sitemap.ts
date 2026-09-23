import type {MetadataRoute} from 'next';
import {getCatalog} from '@/lib/catalog';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=process.env.NEXT_PUBLIC_SITE_URL;if(!base)return [];const{products}=await getCatalog();return ['','/loja','/privacidade',...products.map(p=>`/produto/${p.slug}`)].map(path=>({url:`${base}${path}`}))}
