import type {Metadata} from 'next';
import './globals.css';
import {getCatalog} from '@/lib/catalog';
import {StoreProvider} from '@/components/store/provider';
import {Header,Footer,CookieBanner,WhatsApp} from '@/components/store/shell';
import {RecoveryRedirect} from '@/components/auth/recovery-redirect';
import {getSiteSettings} from '@/lib/settings';
export const metadata:Metadata={title:{default:'Casa Aura — Design autoral para ambientes com essência',template:'%s | Casa Aura'},description:'Gesso e têxtil artesanal. Descubra peças autorais, texturas naturais e uma estética minimalista e atemporal para o seu lar.',icons:{icon:'/favicon.svg'},robots:{index:process.env.LIVE_CHECKOUT_ENABLED==='true',follow:true}};
export default async function RootLayout({children}:{children:React.ReactNode}){const [{products,demo},settings]=await Promise.all([getCatalog(),getSiteSettings()]);return <html lang="pt-BR"><body><StoreProvider products={products} demo={demo}><RecoveryRedirect/><Header instagramUrl={settings.instagram_url}/>{children}<Footer instagramUrl={settings.instagram_url} footerText={settings.footer_text}/><CookieBanner/><WhatsApp number={settings.whatsapp_number||process.env.WHATSAPP_NUMBER||''}/></StoreProvider></body></html>}
