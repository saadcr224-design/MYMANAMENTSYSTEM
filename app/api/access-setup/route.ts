import {session} from '@/lib/supabase';
export async function GET(){if(!await session())return Response.json({error:'Please sign in.'},{status:401});return Response.json({emails:[],configured:false,googleSignInEnabled:false},{headers:{'Cache-Control':'no-store'}});}
export async function POST(){return Response.json({error:'Google sign-in is disabled.'},{status:403});}
