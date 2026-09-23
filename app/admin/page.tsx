import {requireAdmin,db} from '@/lib/server';
import {demoProducts,type Product} from '@/lib/catalog';
import {AdminLogin,AdminEditor,type AdminOrder} from '@/components/store/admin';
export const dynamic='force-dynamic';
export const metadata={title:'Área da marca',robots:{index:false,follow:false}};
export default async function AdminPage(){let authenticated=false;try{await requireAdmin();authenticated=true}catch{}const configured=Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY);const products=authenticated?await db<Product[]>('products?order=created_at.asc'):demoProducts;const orders=authenticated?await db<AdminOrder[]>('orders?select=id,customer_name,email,status,total_cents,tracking_code,created_at,address,items&order=created_at.desc&limit=100'):[];return <main id="conteudo" className="container"><div className="page-intro" style={{paddingTop:45}}><p className="eyebrow">Feito por você</p><h1>Área da marca.</h1></div>{authenticated?<AdminEditor initialProducts={products} orders={orders}/>:<><AdminLogin configured={configured}/>{!configured&&<AdminEditor initialProducts={demoProducts} orders={[]} demo/>}</>}</main>}
