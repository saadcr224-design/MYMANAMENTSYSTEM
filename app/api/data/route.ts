import {session,readState,saveState,sameOrigin} from '@/lib/supabase';
import {generate,mutate} from '@/lib/ledger';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){try{const s=await session();if(!s)return json({error:'Please sign in.'},401);const state=await readState(s.token);const month=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Karachi'}).slice(0,7);if(generate(state.data,month))await saveState(s.token,state.version,state.data);return json(state.data);}catch(e:any){return json({error:e.message},503)}}
export async function POST(request:Request){if(!sameOrigin(request))return json({error:'Invalid origin'},403);try{const s=await session();if(!s)return json({error:'Please sign in.'},401);const text=await request.text();if(text.length>2000000)return json({error:'Request too large'},413);const b=JSON.parse(text);const state=await readState(s.token);mutate(state.data,b);await saveState(s.token,state.version,state.data);return json({ok:true});}catch(e:any){return json({error:e.message},400)}}
