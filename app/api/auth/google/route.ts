import {cookies} from 'next/headers';
import {randomBytes,createHash} from 'node:crypto';
import {config} from '@/lib/supabase';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const {url}=config();const verifier=randomBytes(48).toString('base64url');const challenge=createHash('sha256').update(verifier).digest('base64url');(await cookies()).set('sl-google-verifier',verifier,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:600});const auth=new URL('/auth/v1/authorize',url);auth.searchParams.set('provider','google');auth.searchParams.set('redirect_to',new URL('/auth/callback',request.url).toString());auth.searchParams.set('code_challenge',challenge);auth.searchParams.set('code_challenge_method','s256');auth.searchParams.set('prompt','select_account');return Response.redirect(auth,303);}catch{return Response.redirect(new URL('/?auth_error=configuration',request.url),303)}}
