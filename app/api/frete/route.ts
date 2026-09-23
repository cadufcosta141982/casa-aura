import {shippingSchema} from '@/lib/validation';
import {quoteShipping} from '@/lib/shipping';
import {sameOrigin,jsonBody,fail,rateLimit} from '@/lib/server';
export async function POST(request:Request){try{sameOrigin(request);const data=shippingSchema.parse(await jsonBody(request));if(process.env.SUPABASE_SERVICE_ROLE_KEY)await rateLimit(request,'shipping',20);return Response.json({options:await quoteShipping(data.cep,data.items)})}catch(e){return fail(e)}}
