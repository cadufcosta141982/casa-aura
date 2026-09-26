import {z} from 'zod';
import {requireAdmin,adminDb,sameOrigin,jsonBody,fail} from '@/lib/server';

const schema=z.object({
  whatsapp_number:z.string().max(30),
  instagram_url:z.string().url().or(z.literal('')),
  shipping_origin_cep:z.string().max(9),
  handling_days:z.number().int().min(0).max(30),
  pix_discount_percent:z.number().min(0).max(100),
  max_installments:z.number().int().min(1).max(24),
  legal_business_name:z.string().max(200),
  business_tax_id:z.string().max(30),
  contact_email:z.string().email().or(z.literal('')),
  privacy_email:z.string().email().or(z.literal('')),
  home_eyebrow:z.string().max(160),
  home_title:z.string().max(240),
  home_subtitle:z.string().max(500),
  footer_text:z.string().max(240),
  virtual_seller_enabled:z.boolean()
});

export async function POST(request:Request){
  try{
    sameOrigin(request);
    const session=await requireAdmin();
    const data=schema.parse(await jsonBody(request));
    await adminDb('site_settings?id=eq.main',session.token,{
      method:'PATCH',
      body:JSON.stringify({...data,updated_at:new Date().toISOString()})
    });
    return Response.json({ok:true});
  }catch(e){return fail(e)}
}
