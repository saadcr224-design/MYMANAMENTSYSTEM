import {session} from '@/lib/supabase';
export async function GET(){const s=await session();if(!s)return Response.json({error:'Please sign in.'},{status:401});return Response.json({emails:['',''],configured:false,googleSignInEnabled:false},{headers:{'Cache-Control':'no-store'}});}
export async function POST(){return Response.json({error:'Google super-admin setup is not enabled. Provision admin accounts through Supabase Authentication and sl_members.'},{status:403});}
