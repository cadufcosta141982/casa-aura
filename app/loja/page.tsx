import type {Metadata} from 'next';
import {Catalog,Breadcrumb} from '@/components/store/products';
export const metadata:Metadata={title:'Todas as peças',description:'Explore nossa curadoria de gesso e têxtil artesanal. Formas, texturas e detalhes para a sua casa.'};
export default async function Shop({searchParams}:{searchParams:Promise<{categoria?:string}>}){const{categoria}=await searchParams;return <main id="conteudo" className="container"><Breadcrumb current="Todas as peças"/><div className="page-intro"><p className="eyebrow">Feito para o seu espaço</p><h1>Peças com presença.<br/>Beleza com propósito.</h1><p>Gesso e têxtil em uma curadoria de formas suaves, texturas naturais e pequenos encantos.</p></div><Catalog key={categoria||"todas"} initial={categoria}/></main>}
