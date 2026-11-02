export const dynamic='force-dynamic';
export async function GET(request:Request){return Response.redirect(new URL('/?auth_error=configuration',request.url),303);}
