import { partnerService } from '@/lib/services/partner-service.js';
import { getServerSession } from '@/lib/get-session-better-auth';


// GET: Връща всички партньори с магазини
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) return new Response('Unauthorized', { status: 401 });
    const partners = await partnerService.getAllPartners(session.user);
    return Response.json(partners);
  } catch (error) {
    console.error('[PARTNERS_GET_ERROR]', error);
    return new Response('Failed to fetch partners', { status: 500 });
  }
}

// POST: Създава нов партньор
export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) return new Response('Unauthorized', { status: 401 });
    if (session.user?.role !== 'ADMIN') return new Response('Forbidden', { status: 403 });

    const body = await req.json();
    const partner = await partnerService.createPartner(body);
    return Response.json(partner, { status: 201 });
  } catch (error) {
    console.error('[PARTNERS_POST_ERROR]', error);
    return new Response(error?.message || 'Failed to create partner', { status: 500 });
  }
}
  
