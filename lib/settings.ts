import {cache} from 'react';

export type SiteSettings={
  id:string;
  whatsapp_number:string;
  instagram_url:string;
  shipping_origin_cep:string;
  handling_days:number;
  pix_discount_percent:number;
  max_installments:number;
  legal_business_name:string;
  business_tax_id:string;
  contact_email:string;
  privacy_email:string;
  home_eyebrow:string;
  home_title:string;
  home_subtitle:string;
  footer_text:string;
  virtual_seller_enabled:boolean;
  updated_at:string;
};

export const defaultSiteSettings:SiteSettings={
  id:'main',
  whatsapp_number:'',
  instagram_url:'https://www.instagram.com/casa.aura.decor/',
  shipping_origin_cep:'',
  handling_days:3,
  pix_discount_percent:5,
  max_installments:12,
  legal_business_name:'',
  business_tax_id:'',
  contact_email:'',
  privacy_email:'',
  home_eyebrow:'A beleza de habitar com calma',
  home_title:'Design autoral para ambientes com essência.',
  home_subtitle:'Formas orgânicas, texturas que acolhem. Peças artesanais para sentir a casa.',
  footer_text:'Sua casa, a expressão da sua essência.',
  virtual_seller_enabled:false,
  updated_at:new Date(0).toISOString()
};

export const getSiteSettings=cache(async():Promise<SiteSettings>=>{
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_ANON_KEY;
  if(!url||!key)return defaultSiteSettings;
  try{
    const r=await fetch(`${url}/rest/v1/site_settings?id=eq.main&select=*`,{
      headers:{apikey:key},cache:'no-store',signal:AbortSignal.timeout(10000)
    });
    if(!r.ok)return defaultSiteSettings;
    const rows=await r.json() as SiteSettings[];
    return rows[0]||defaultSiteSettings;
  }catch{return defaultSiteSettings}
});
