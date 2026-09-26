'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Header,Footer,CookieBanner,WhatsApp,Wordmark} from './shell';

export function SiteChrome({
  children,
  instagramUrl,
  footerText,
  whatsappNumber
}:{
  children:React.ReactNode;
  instagramUrl:string;
  footerText:string;
  whatsappNumber:string;
}){
  const pathname=usePathname();
  const admin=pathname.startsWith('/admin');
  const reset=pathname.startsWith('/reset-password');
  if(admin||reset){
    return <>
      <div className="admin-topbar">
        <Link href="/" className="admin-brand" aria-label="Voltar para Casa Aura"><Wordmark/></Link>
        <div className="admin-topbar-actions">
          {admin&&<span className="admin-badge">ADMINISTRAÇÃO</span>}
          <Link href="/" className="admin-store-link">Ver loja</Link>
        </div>
      </div>
      {children}
    </>;
  }
  return <>
    <Header instagramUrl={instagramUrl}/>
    {children}
    <Footer instagramUrl={instagramUrl} footerText={footerText}/>
    <CookieBanner/>
    <WhatsApp number={whatsappNumber}/>
  </>;
}
