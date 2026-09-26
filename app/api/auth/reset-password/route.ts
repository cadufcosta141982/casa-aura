import {z} from 'zod';
import {sameOrigin,jsonBody,fail,HttpError} from '@/lib/server';

export async function POST(request:Request){
  try{
    sameOrigin(request);
    const data=z.object({
      access_token:z.string().min(20),
      password:z.string().min(8).max(200)
    }).parse(await jsonBody(request));
    const url=process.env.SUPABASE_URL;
    const key=process.env.SUPABASE_ANON_KEY;
    if(!url||!key)throw new HttpError(503,'Recuperação de senha indisponível.');
    const r=await fetch(`${url}/auth/v1/user`,{
      method:'PUT',
      headers:{
        apikey:key,
        Authorization:`Bearer ${data.access_token}`,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({password:data.password}),
      cache:'no-store',
      signal:AbortSignal.timeout(12000)
    });
    if(!r.ok)throw new HttpError(400,'O link expirou ou não é mais válido. Solicite um novo e-mail.');
    return Response.json({ok:true});
  }catch(e){return fail(e)}
}
