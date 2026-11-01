import {env} from 'cloudflare:workers';
// This setup endpoint remains behind the confirmed owner-private Sites access gate.
// Saving email addresses is configuration only; it never grants access or changes authentication.
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){
 try{if(!env.DB)throw Error('Database unavailable');const row=await env.DB.prepare("SELECT data FROM records WHERE id='access_setup'").first<{data:string}>();return json(row?JSON.parse(row.data):{emails:['',''],configured:false,googleSignInEnabled:false});}
 catch{return json({error:'Could not load account setup. Please try again.'},500)}
}
export async function POST(request:Request){
 try{
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'Invalid request origin.'},403);
 const body=await request.json() as {emails?:unknown};
 if(!Array.isArray(body.emails)||body.emails.length!==2) return json({error:'Enter exactly two Google account email addresses.'},400);
 const emails=body.emails.map(value=>typeof value==='string'?value.trim().toLowerCase():'');
 if(emails.some(email=>email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))return json({error:'Enter a valid email address in both account fields.'},400);
 if(emails[0]===emails[1])return json({error:'Use two different Google accounts.'},400);
 if(!env.DB)throw Error('Database unavailable');
 const config={emails,configured:true,googleSignInEnabled:false,updatedAt:new Date().toISOString()};
 await env.DB.prepare("INSERT INTO records(id,kind,data) VALUES('access_setup','access_setup',?) ON CONFLICT(id) DO UPDATE SET data=excluded.data").bind(JSON.stringify(config)).run();
 return json(config);
 }catch{return json({error:'Could not save account setup. Please try again.'},500)}
}
