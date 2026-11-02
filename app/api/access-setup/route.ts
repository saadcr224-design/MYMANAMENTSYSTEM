import {session} from '@/lib/supabase';
import {SUPER_ADMIN_EMAIL} from '@/lib/google';
export async function GET(){const s=await session();if(!s)return Response.json({error:'Please sign in.'},{status:401});return Response.json({emails:[SUPER_ADMIN_EMAIL],configured:true,googleSignInEnabled:true},{headers:{'Cache-Control':'no-store'}});}
export async function POST(){return Response.json({error:'The approved super-admin identity is managed by the application owner.'},{status:403});}
