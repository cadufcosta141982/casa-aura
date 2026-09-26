'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Upload,Save,Plus,LogOut} from 'lucide-react';
import {toast} from 'sonner';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {Table,TableHeader,TableBody,TableHead,TableRow,TableCell} from '@/components/ui/table';
import {money,type Product} from '@/lib/catalog';
import type {SiteSettings} from '@/lib/settings';
export type AdminOrder={id:string;customer_name:string;email:string;status:string;total_cents:number;tracking_code:string|null;created_at:string;address:Record<string,string>;items:{name:string;quantity:number}[]};
export type IntegrationStatus={mercadoPago:boolean;melhorEnvio:boolean;resend:boolean;liveCheckout:boolean};
export function AdminLogin({configured}:{configured:boolean}){const[busy,setBusy]=useState(false),[error,setError]=useState('');const router=useRouter();async function login(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const form=new FormData(e.currentTarget);try{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.get('email'),password:form.get('password')})});const d=await r.json();if(!r.ok)throw new Error(d.error);router.refresh()}catch(e){setError(e instanceof Error?e.message:'Não foi possível entrar.')}finally{setBusy(false)}}return <div className="login-box"><h2>Bem-vinda à Casa Aura.</h2><p className="small muted" style={{marginBottom:25}}>Acesse para cuidar das suas peças e dos seus pedidos.</p>{!configured&&<p className="notice">O acesso estará disponível quando a conta da marca estiver conectada.</p>}<form onSubmit={login}><label className="form-label"><span>E-mail</span><input className="field" name="email" type="email" autoComplete="username" required disabled={!configured}/></label><label className="form-label"><span>Senha</span><input className="field" name="password" type="password" autoComplete="current-password" required disabled={!configured}/></label><button className="button" disabled={!configured||busy}>{busy?'Entrando…':'Entrar na área da marca'}</button>{error&&<p className="error-message" role="alert" style={{marginTop:20}}>{error}</p>}</form></div>}
export function AdminEditor({initialProducts,orders,initialSettings,integrations,demo=false}:{initialProducts:Product[];orders:AdminOrder[];initialSettings:SiteSettings;integrations:IntegrationStatus;demo?:boolean}){const[products,setProducts]=useState(initialProducts),[product,setProduct]=useState<Product>(initialProducts[0]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[activeTab,setActiveTab]=useState('products');const router=useRouter();function update<K extends keyof Product>(key:K,value:Product[K]){setProduct(p=>({...p,[key]:value}))}
 async function upload(file:File){setBusy(true);setError('');try{if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12000000)throw new Error('Escolha uma foto JPG, PNG ou WebP de até 12 MB.');const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');const ratio=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.84));if(!blob)throw new Error('Não foi possível converter a foto.');if(demo){update('images',[URL.createObjectURL(blob)]);toast.info('Prévia local. A foto não foi salva.');return}const form=new FormData();form.set('image',blob,'product.webp');const r=await fetch('/api/admin/upload',{method:'POST',body:form});const d=await r.json();if(!r.ok)throw new Error(d.error);update('images',[...product.images.filter(i=>i.startsWith('https://')),d.url].slice(-8));toast.success('Foto enviada. Salve a peça para publicar.')}catch(e){setError(e instanceof Error?e.message:'Erro ao enviar foto.')}finally{setBusy(false)}}
 async function save(e:React.FormEvent){e.preventDefault();if(demo){toast.info('Demonstração: alterações não são publicadas.');return}setBusy(true);setError('');try{const r=await fetch('/api/admin/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(product)});const d=await r.json();if(!r.ok)throw new Error(d.error);setProducts(old=>old.some(p=>p.id===product.id)?old.map(p=>p.id===product.id?product:p):[...old,product]);toast.success('Peça salva no catálogo.');router.refresh()}catch(e){setError(e instanceof Error?e.message:'Erro ao salvar.')}finally{setBusy(false)}}
 function newProduct(){setProduct({id:`peca-${crypto.randomUUID().slice(0,8)}`,slug:`peca-${Date.now()}`,name:'Nova peça',category:'gesso',color:'Off-white',price_cents:0,images:[],description:'',dimensions:'',care:'',stock:1,active:false,weight:.5,width:20,height:10,length:20})}
 return <div className="admin-layout">{demo&&<p className="notice">Prévia do painel. Experimente editar os campos e visualizar uma foto. As alterações desta demonstração não são salvas nem publicadas.</p>}<Tabs value={activeTab} onValueChange={setActiveTab}><div className="admin-toolbar"><TabsList><TabsTrigger value="products">Peças</TabsTrigger><TabsTrigger value="orders">Pedidos</TabsTrigger><TabsTrigger value="settings">Configurações</TabsTrigger></TabsList><div style={{display:'flex',gap:15}}>{activeTab==='products'&&<button className="button button-outline" onClick={newProduct}><Plus size={16}/> Nova peça</button>}{!demo&&<button className="admin-icon-button" aria-label="Sair da área da marca" onClick={async()=>{await fetch('/api/admin/logout',{method:'POST'});router.refresh()}}><LogOut size={20}/></button>}</div></div><TabsContent value="products"><div className="admin-grid"><div className="admin-products">{products.map(p=><button key={p.id} className={p.id===product?.id?'active':''} onClick={()=>{setProduct(p);setError('')}}><img src={p.images[0]} alt="" width={45} height={55} loading="lazy"/><span>{p.name}<br/><span className="muted">{money(p.price_cents)}</span></span></button>)}</div>{product&&<form className="admin-editor" onSubmit={save}><div className="upload-area">{product.images[0]&&<img src={product.images.at(-1)} alt="Prévia da foto da peça" width={250} height={230}/>}<Upload size={22} style={{margin:'0 auto 12px'}}/><label className="form-label"><span>Enviar foto da peça</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{if(e.target.files?.[0])void upload(e.target.files[0]);e.target.value=''}}/></label><p className="small muted" style={{marginTop:10}}>JPG, PNG ou WebP. Otimização automática para WebP.</p></div><div className="form-grid"><label><span>Nome da peça</span><input className="field" value={product.name} required maxLength={120} onChange={e=>update('name',e.target.value)}/></label><label><span>Endereço da peça (slug)</span><input className="field" value={product.slug} required pattern="[a-z0-9-]+" onChange={e=>update('slug',e.target.value)}/></label><label><span>Preço (R$)</span><input className="field" type="number" step="0.01" min="1" required value={(product.price_cents/100)||''} onChange={e=>update('price_cents',Math.round(Number(e.target.value)*100))}/></label><label><span>Cor</span><input className="field" value={product.color} required onChange={e=>update('color',e.target.value)}/></label><div><span className="form-label" style={{marginBottom:6}}>Categoria</span><Select value={product.category} onValueChange={v=>update('category',v as 'gesso'|'textil')}><SelectTrigger aria-label="Categoria da peça" style={{width:'100%',height:48}}><SelectValue/></SelectTrigger><SelectContent><SelectItem value="gesso">Gesso artesanal</SelectItem><SelectItem value="textil">Têxtil artesanal</SelectItem></SelectContent></Select></div><label><span>Limite por compra (0 = indisponível)</span><input className="field" type="number" min="0" max="9999" value={product.stock} onChange={e=>update('stock',Number(e.target.value))}/></label><label className="full"><span>Descrição</span><textarea className="field" rows={5} required minLength={10} maxLength={4000} value={product.description} onChange={e=>update('description',e.target.value)}/></label><label className="full"><span>Dimensões para exibição</span><input className="field" value={product.dimensions} onChange={e=>update('dimensions',e.target.value)}/></label><label className="full"><span>Cuidados</span><textarea className="field" rows={3} value={product.care} onChange={e=>update('care',e.target.value)}/></label>{(['weight','width','height','length'] as const).map((key,i)=><label key={key}><span>{['Peso embalado (kg)','Largura embalada (cm)','Altura embalada (cm)','Comprimento embalado (cm)'][i]}</span><input className="field" type="number" min="0.01" step="0.01" value={product[key]} onChange={e=>update(key,Number(e.target.value))} required/></label>)}</div><div className="form-actions"><Switch id="active" checked={product.active} onCheckedChange={v=>update('active',v)}/><label htmlFor="active" className="small">Visível na loja</label></div>{error&&<p className="error-message" style={{marginTop:20}} role="alert">{error}</p>}<div className="form-actions"><button className="button" disabled={busy}>{busy?'Aguarde…':demo?'Testar edição':'Salvar peça'}<Save size={16}/></button></div></form>}</div></TabsContent><TabsContent value="orders"><OrderTable orders={orders} demo={demo}/></TabsContent><TabsContent value="settings"><SettingsForm initial={initialSettings} integrations={integrations} demo={demo}/></TabsContent></Tabs></div>
}
function SettingsForm({initial,integrations,demo}:{initial:SiteSettings;integrations:IntegrationStatus;demo:boolean}){
 const[data,setData]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState('');
 function set<K extends keyof SiteSettings>(key:K,value:SiteSettings[K]){setData(d=>({...d,[key]:value}))}
 async function save(e:React.FormEvent){
  e.preventDefault();
  if(demo){toast.info('Demonstração: configurações não são publicadas.');return}
  setBusy(true);setError('');
  try{
   const payload={
    whatsapp_number:data.whatsapp_number,
    instagram_url:data.instagram_url,
    shipping_origin_cep:data.shipping_origin_cep,
    handling_days:Number(data.handling_days),
    pix_discount_percent:Number(data.pix_discount_percent),
    max_installments:Number(data.max_installments),
    legal_business_name:data.legal_business_name,
    business_tax_id:data.business_tax_id,
    contact_email:data.contact_email,
    privacy_email:data.privacy_email,
    home_eyebrow:data.home_eyebrow,
    home_title:data.home_title,
    home_subtitle:data.home_subtitle,
    footer_text:data.footer_text,
    virtual_seller_enabled:data.virtual_seller_enabled
   };
   const r=await fetch('/api/admin/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const d=await r.json();if(!r.ok)throw new Error(d.error);
   toast.success('Configurações salvas.');router.refresh();
  }catch(e){setError(e instanceof Error?e.message:'Erro ao salvar configurações.')}finally{setBusy(false)}
 }
 const router=useRouter();
 return <form className="admin-editor admin-settings" onSubmit={save}>
  <div className="admin-settings-head">
    <div><p className="eyebrow">Central da loja</p><h2>Configurações</h2><p className="small muted">Edite o que aparece no site e os dados operacionais da Casa Aura. Segredos continuam protegidos na Netlify.</p></div>
    <div className={integrations.liveCheckout?'status-chip success':'status-chip warning'}>{integrations.liveCheckout?'Vendas reais ativas':'Vendas reais desativadas'}</div>
  </div>
  <section className="admin-settings-section">
   <div className="admin-settings-title"><h3>Atendimento e redes</h3><p>Contatos exibidos para o cliente.</p></div>
   <div className="form-grid">
   <label><span>WhatsApp (55 + DDD + número)</span><input className="field" value={data.whatsapp_number} onChange={e=>set('whatsapp_number',e.target.value.replace(/\D/g,''))} placeholder="5532999999999"/></label>
   <label><span>Instagram</span><input className="field" type="url" value={data.instagram_url} onChange={e=>set('instagram_url',e.target.value)} placeholder="https://instagram.com/..."/></label>
   </div>
  </section>
  <section className="admin-settings-section">
   <div className="admin-settings-title"><h3>Frete e pagamentos</h3><p>Regras comerciais e preparação do pedido.</p></div>
   <div className="form-grid">
   <label><span>CEP de origem</span><input className="field" value={data.shipping_origin_cep} onChange={e=>set('shipping_origin_cep',e.target.value)} placeholder="00000-000"/></label>
   <label><span>Prazo de preparação (dias)</span><input className="field" type="number" min="0" max="30" value={data.handling_days} onChange={e=>set('handling_days',Number(e.target.value))}/></label>
   <label><span>Desconto no PIX (%)</span><input className="field" type="number" min="0" max="100" step="0.01" value={data.pix_discount_percent} onChange={e=>set('pix_discount_percent',Number(e.target.value))}/></label>
   <label><span>Parcelamento máximo</span><input className="field" type="number" min="1" max="24" value={data.max_installments} onChange={e=>set('max_installments',Number(e.target.value))}/></label>
   </div>
  </section>
  <section className="admin-settings-section">
   <div className="admin-settings-title"><h3>Dados da empresa</h3><p>Informações institucionais e de contato.</p></div>
   <div className="form-grid">
   <label className="full"><span>Razão social / nome empresarial</span><input className="field" value={data.legal_business_name} onChange={e=>set('legal_business_name',e.target.value)}/></label>
   <label><span>CPF/CNPJ</span><input className="field" value={data.business_tax_id} onChange={e=>set('business_tax_id',e.target.value)}/></label>
   <label><span>E-mail comercial</span><input className="field" type="email" value={data.contact_email} onChange={e=>set('contact_email',e.target.value)}/></label>
   <label><span>E-mail de privacidade</span><input className="field" type="email" value={data.privacy_email} onChange={e=>set('privacy_email',e.target.value)}/></label>
   </div>
  </section>
  <section className="admin-settings-section">
   <div className="admin-settings-title"><h3>Textos do site</h3><p>Conteúdo principal da Home e rodapé.</p></div>
   <div className="form-grid">
   <label className="full"><span>Chamada pequena da Home</span><input className="field" value={data.home_eyebrow} onChange={e=>set('home_eyebrow',e.target.value)}/></label>
   <label className="full"><span>Título principal da Home</span><input className="field" value={data.home_title} onChange={e=>set('home_title',e.target.value)}/></label>
   <label className="full"><span>Subtítulo da Home</span><textarea className="field" rows={3} value={data.home_subtitle} onChange={e=>set('home_subtitle',e.target.value)}/></label>
   <label className="full"><span>Texto do rodapé</span><input className="field" value={data.footer_text} onChange={e=>set('footer_text',e.target.value)}/></label>
   </div>
  </section>
  <section className="admin-settings-section">
   <div className="admin-settings-title"><h3>Vendedor virtual</h3><p>Controle da automação de atendimento.</p></div>
   <div className="form-actions" style={{marginTop:0}}><Switch id="virtual-seller" checked={data.virtual_seller_enabled} onCheckedChange={v=>set('virtual_seller_enabled',v)}/><label htmlFor="virtual-seller" className="small">Ativar vendedor virtual quando a integração estiver pronta</label></div>
  </section>
  <section className="admin-settings-section">
   <div className="admin-settings-title"><h3>Integrações</h3><p>Status das conexões externas.</p></div>
   <div className="integration-grid">
    <div className={integrations.mercadoPago?'integration-card ok':'integration-card'}><strong>Mercado Pago</strong><span>{integrations.mercadoPago?'Configurado':'Pendente'}</span></div>
    <div className={integrations.melhorEnvio?'integration-card ok':'integration-card'}><strong>Melhor Envio</strong><span>{integrations.melhorEnvio?'Configurado':'Pendente'}</span></div>
    <div className={integrations.resend?'integration-card ok':'integration-card'}><strong>Resend</strong><span>{integrations.resend?'Configurado':'Pendente'}</span></div>
    <div className={integrations.liveCheckout?'integration-card ok':'integration-card'}><strong>Vendas reais</strong><span>{integrations.liveCheckout?'Ativadas':'Desativadas'}</span></div>
   </div>
   <p className="small muted" style={{marginTop:14}}>Chaves e tokens secretos ficam protegidos na Netlify e não são exibidos aqui.</p>
  </section>
  {error&&<p className="error-message" style={{marginTop:20}} role="alert">{error}</p>}
  <div className="admin-settings-save"><button className="button" disabled={busy}>{busy?'Salvando…':'Salvar configurações'}<Save size={16}/></button></div>
 </form>
}

function OrderTable({orders,demo}:{orders:AdminOrder[];demo:boolean}){const[busy,setBusy]=useState(''),[error,setError]=useState('');const router=useRouter();async function update(e:React.FormEvent<HTMLFormElement>,id:string){e.preventDefault();if(demo)return;setBusy(id);setError('');const form=new FormData(e.currentTarget);try{const r=await fetch('/api/admin/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status:form.get('status'),tracking_code:form.get('tracking')})});const d=await r.json();if(!r.ok)throw new Error(d.error);toast.success('Pedido atualizado.');router.refresh()}catch(e){setError(e instanceof Error?e.message:'Erro ao atualizar')}finally{setBusy('')}}if(!orders.length)return <div className="empty-state"><h2>Novos encontros estão por vir.</h2><p>{demo?'Os pedidos reais aparecerão aqui após a abertura da loja.':'Você ainda não recebeu pedidos.'}</p></div>;return <>{error&&<p className="error-message" role="alert">{error}</p>}<Table><TableHeader><TableRow><TableHead>Pedido</TableHead><TableHead>Cliente e entrega</TableHead><TableHead>Total</TableHead><TableHead>Envio</TableHead></TableRow></TableHeader><TableBody>{orders.map(o=><TableRow key={o.id}><TableCell>{o.id.slice(0,8)}<br/><span className="small muted">{new Date(o.created_at).toLocaleDateString('pt-BR')}</span><p>{o.items.map(i=>`${i.quantity} × ${i.name}`).join(', ')}</p></TableCell><TableCell>{o.customer_name}<br/>{o.email}<br/>{Object.values(o.address).filter(Boolean).join(', ')}</TableCell><TableCell>{money(o.total_cents)}<br/>{o.status}</TableCell><TableCell>{['paid','shipped'].includes(o.status)&&<form onSubmit={e=>update(e,o.id)}><input className="field" name="tracking" aria-label="Código de rastreio" placeholder="Código de rastreio" defaultValue={o.tracking_code||''} maxLength={80} required={o.status==='paid'}/><input type="hidden" name="status" value={o.status==='paid'?'shipped':'delivered'}/><button className="button button-outline" disabled={busy===o.id} style={{marginTop:10}}>{o.status==='paid'?'Marcar como enviado':'Confirmar entrega'}</button></form>}</TableCell></TableRow>)}</TableBody></Table></>}
