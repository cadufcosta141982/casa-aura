'use client';
import {createContext,useContext,useEffect,useState,useRef,ReactNode} from 'react';
import {flushSync} from 'react-dom';
import {toast,Toaster} from 'sonner';
import type {Product} from '@/lib/catalog';
import type {CartLine} from '@/lib/types';
type CartContextType={items:CartLine[];products:Product[];demo:boolean;ready:boolean;add:(id:string,quantity?:number)=>void;change:(id:string,quantity:number)=>void;clear:()=>void;count:number};
const CartContext=createContext<CartContextType|null>(null);
export function StoreProvider({children,products,demo}:{children:ReactNode;products:Product[];demo:boolean}){
 const [items,setItems]=useState<CartLine[]>([]),[ready,setReady]=useState(false);
 const itemsRef=useRef(items);itemsRef.current=items;
 useEffect(()=>{try{const raw=JSON.parse(localStorage.getItem('aura-cart-v1')||'[]');if(Array.isArray(raw))setItems(raw.filter(i=>i&&typeof i.id==='string'&&Number.isInteger(i.quantity)&&i.quantity>0&&products.some(p=>p.id===i.id&&p.stock>0)).map(i=>({id:i.id,quantity:Math.min(i.quantity,20,products.find(p=>p.id===i.id)!.stock)})));}catch{}setReady(true)},[products]);
 useEffect(()=>{if(ready)try{localStorage.setItem('aura-cart-v1',JSON.stringify(items))}catch{}},[items,ready]);
 function add(id:string,quantity=1){const p=products.find(p=>p.id===id);if(!p||p.stock<1)return;setItems(old=>{const existing=old.find(i=>i.id===id);const q=Math.min((existing?.quantity||0)+quantity,p.stock,20);return existing?old.map(i=>i.id===id?{...i,quantity:q}:i):[...old,{id,quantity:q}]});toast.success(`${p.name} adicionada à sacola`,{action:{label:'Ver sacola',onClick:()=>location.assign('/carrinho')}})}
 function change(id:string,quantity:number){const p=products.find(p=>p.id===id);setItems(old=>quantity<1?old.filter(i=>i.id!==id):old.map(i=>i.id===id?{...i,quantity:Math.min(quantity,p?.stock||0,20)}:i))}
 useEffect(()=>{
 const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options?:{signal:AbortSignal})=>unknown}}).modelContext;
 if(!context?.registerTool)return;
 const lifecycle=new AbortController();
 const register=(tool:unknown)=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{})}catch{}};
 register({name:'list_catalog_products',description:'List the visible Casa Aura product catalog and indicate whether it is demonstrative.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:()=>({demo,products:products.map(p=>({id:p.id,name:p.name,category:p.category,price_cents:p.price_cents,available:p.stock>0}))})});
 register({name:'add_items_to_cart',description:'Stage products in the visible shopping bag. Does not place an order or charge a payment.',inputSchema:{type:'object',properties:{items:{type:'array',minItems:1,maxItems:20,items:{type:'object',properties:{id:{type:'string'},quantity:{type:'integer',minimum:1,maximum:20}},required:['id','quantity'],additionalProperties:false}}},required:['items'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input:unknown)=>{const data=input as {items?:CartLine[]};if(!Array.isArray(data?.items)||!data.items.length||data.items.length>20||data.items.some(i=>!i||!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>20||!products.some(p=>p.id===i.id&&p.stock>=i.quantity)))throw new Error('Invalid cart items');flushSync(()=>data.items!.forEach(i=>add(i.id,i.quantity)));return {staged:true,items:itemsRef.current};}});
 return()=>lifecycle.abort();
 },[products,demo]);
 return <CartContext.Provider value={{items,products,demo,ready,add,change,clear:()=>setItems([]),count:items.reduce((a,i)=>a+i.quantity,0)}}>{children}<Toaster position="top-right" toastOptions={{style:{background:'#fffdf9',color:'#35352f',borderColor:'#dcd7cc'}}}/></CartContext.Provider>;
}
export function useCart(){const ctx=useContext(CartContext);if(!ctx)throw new Error('StoreProvider ausente');return ctx;}
