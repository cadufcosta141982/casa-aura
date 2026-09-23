import {equal,fail,HttpError} from '@/lib/server';
import {sendDueEmails} from '@/lib/emails';
export async function GET(request:Request){try{const secret=process.env.CRON_SECRET;if(!secret||!equal(request.headers.get('authorization')||'',`Bearer ${secret}`))throw new HttpError(401,'Não autorizado.');return Response.json(await sendDueEmails())}catch(e){return fail(e)}}
