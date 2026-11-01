import {env} from 'cloudflare:workers';
const response=(x:any,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
const currentMonth=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Karachi'}).slice(0,7);
async function generate(db:D1Database,month:string){
 const rows=await db.prepare("SELECT data FROM records s WHERE kind='student' AND NOT EXISTS(SELECT 1 FROM records i WHERE i.id='i:'||json_extract(s.data,'$.id')||'@'||?)").bind(month).all();
 const invoices=rows.results.map((x:any)=>JSON.parse(x.data)).filter((s:any)=>s.status!=='Left'&&(!s.admitted||s.admitted.slice(0,7)<=month)).map((s:any)=>{const admission=s.admitted?.slice(0,7)===month?s.admission||0:0;return {id:s.id+'@'+month,student:s.id,month,fee:s.fee,discount:s.discount||0,extra:admission,admission,total:Math.round((s.fee-(s.discount||0)+admission)*100)/100}});
 for(let i=0;i<invoices.length;i+=100)await db.batch(invoices.slice(i,i+100).map((v:any)=>db.prepare('INSERT OR IGNORE INTO records(id,kind,data) VALUES(?,?,?)').bind('i:'+v.id,'invoice',JSON.stringify(v))));
}
export async function GET(){try{const db=env.DB;if(!db)throw Error('Database unavailable');await generate(db,currentMonth());const [r,p]=await Promise.all([db.prepare('SELECT * FROM records').all(),db.prepare('SELECT * FROM payments ORDER BY date DESC').all()]);return response({records:r.results.map((r:any)=>({kind:r.kind,...JSON.parse(r.data)})),payments:p.results});}catch(e){return response({error:'Unable to load school records.'},500)}}
export async function POST(request:Request){try{
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return response({error:'Invalid request origin.'},403);
 const b=await request.json() as any;const db=env.DB;if(!db)throw Error('Database is unavailable.');
 if(b.action==='students'){
 if(!Array.isArray(b.rows)||!b.rows.length||b.rows.length>100)throw Error('Import between 1 and 100 records per batch.');
 const seen=new Set();for(const s of b.rows){if(typeof s.id!=='string'||!s.id.trim()||s.id.length>100||!s.name?.trim()||!s.class?.toString().trim())throw Error('Student ID, name and class are required.');if(seen.has(s.id))throw Error('Duplicate Student ID in this batch.');seen.add(s.id);for(const k of ['fee','admission','discount'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>100000000)throw Error('Fee amounts must be valid non-negative numbers.');if(s.discount>s.fee)throw Error('Discount cannot exceed monthly fee.');if(!['Active','Left'].includes(s.status))throw Error('Status must be Active or Left.');if(!/^\d{4}-\d{2}-\d{2}$/.test(s.admitted)||Number.isNaN(Date.parse(s.admitted)))throw Error('Admission date must be YYYY-MM-DD.');}
 await db.batch(b.rows.map((s:any)=>db.prepare('INSERT INTO records(id,kind,data) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').bind('s:'+s.id,'student',JSON.stringify(s))));
 }else if(b.action==='generate'){
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month))throw Error('Invalid month.');await generate(db,b.month);
 }else if(b.action==='payment'){
 const p=b.payment;if(!p.id||!p.invoice||!Number.isFinite(p.amount)||p.amount<.01||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||Number.isNaN(Date.parse(p.date))||!['Cash','Bank transfer','Easypaisa','JazzCash','Cheque'].includes(p.method))throw Error('Enter valid payment details.');
 const amount=Math.round(p.amount*100);
 const r=await db.prepare(`INSERT OR IGNORE INTO payments(id,invoice,amount,date,method) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM records WHERE id=? AND kind='invoice' AND round(json_extract(data,'$.total')*100) >= ? + COALESCE((SELECT SUM(amount) FROM payments WHERE invoice=?),0))`).bind(p.id,p.invoice,amount,p.date,p.method,'i:'+p.invoice,amount,p.invoice).run();
 if(!r.meta.changes)throw Error('Payment exceeds the remaining balance or was already recorded. Refresh and try again.');
 }else if(b.action==='charge'){
 if(!Number.isFinite(b.amount)||b.amount<=0||b.amount>100000000||!['Annual Charges','Registration Fee','Examination Fee','Miscellaneous Charges','Transport Fee'].includes(b.category))throw Error('Enter a valid charge.');
 const r=await db.prepare(`UPDATE records SET data=json_set(data,'$.extra',round(COALESCE(json_extract(data,'$.extra'),0)+?,2),'$.total',round(json_extract(data,'$.total')+?,2),'$.charges',json_insert(COALESCE(json_extract(data,'$.charges'),json('[]')),'$[#]',json(?))) WHERE id=? AND kind='invoice'`).bind(b.amount,b.amount,JSON.stringify({category:b.category,amount:b.amount,date:new Date().toISOString().slice(0,10)}),'i:'+b.invoice).run();if(!r.meta.changes)throw Error('Invoice not found.');
 }else if(b.action==='delete'){
 const r=await db.prepare("SELECT id FROM records WHERE kind='invoice' AND json_extract(data,'$.student')=? LIMIT 1").bind(b.id).first();if(r)throw Error('This student has fee history. Set their status to Left to preserve records.');await db.prepare('DELETE FROM records WHERE id=?').bind('s:'+b.id).run();
 }else if(b.action==='settings'||b.action==='structure'){
 if(!b.data||typeof b.data!=='object')throw Error('Invalid settings.');
 await db.prepare('INSERT INTO records(id,kind,data) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').bind(b.action,b.action,JSON.stringify(b.data)).run();
 }else throw Error('Unknown action.');return response({ok:true});
 }catch(e:any){return response({error:e.message||'Unable to save.'},400)}}
