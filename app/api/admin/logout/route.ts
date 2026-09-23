import {NextResponse} from 'next/server';
import {sameOrigin,fail} from '@/lib/server';
export async function POST(request:Request){try{sameOrigin(request);const r=NextResponse.json({ok:true});r.cookies.set('aura-admin','',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:0});return r}catch(e){return fail(e)}}
