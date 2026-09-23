import type {Metadata} from 'next';
import './globals.css';
import {getCatalog} from '@/lib/catalog';
import {StoreProvider} from '@/components/store/provider';
import {Header,Footer,CookieBanner,WhatsApp} from '@/components/store/shell';
export const metadata:Metadata={title:{default:'Casa Aura — Design autoral para ambientes com essência',template:'%s | Casa Aura'},description:'Gesso e têxtil artesanal. Descubra peças autorais, texturas naturais e uma estética minimalista e atemporal para o seu lar.',icons:{icon:'/favicon.svg'},robots:{index:process.env.LIVE_CHECKOUT_ENABLED==='true',follow:true}};
export default async function RootLayout({children}:{children:React.ReactNode}){const {products,demo}=await getCatalog();return <html lang="pt-BR"><body><StoreProvider products={products} demo={demo}><Header/>{children}<Footer/><CookieBanner/><WhatsApp number={process.env.WHATSAPP_NUMBER||''}/></StoreProvider></body></html>}
