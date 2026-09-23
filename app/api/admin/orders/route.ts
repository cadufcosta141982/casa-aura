import {z} from 'zod';
import {requireAdmin,sameOrigin,jsonBody,db,fail} from '@/lib/server';
import {sendDueEmails} from '@/lib/emails';
export async function POST(request:Request){try{sameOrigin(request);await requireAdmin();const d=z.object({id:z.string().uuid(),status:z.enum(['shipped','delivered']),tracking_code:z.string().max(80)}).parse(await jsonBody(request));await db('rpc/update_fulfillment',{method:'POST',body:JSON.stringify({p_id:d.id,p_status:d.status,p_tracking:d.tracking_code})});await sendDueEmails();return Response.json({ok:true})}catch(e){return fail(e)}}
