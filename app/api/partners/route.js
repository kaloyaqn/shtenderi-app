import { partnerService } from '@/lib/services/partner-service.js';
import { withAuth } from '@/lib/utils/auth-middleware.js';
import { ApiResponse, ApiError } from '@/lib/utils/api-response.js';

// GET: Връща всички партньори с магазини
export const GET = withAuth(async (req, session) => {
  try {
    const partners = await partnerService.getAllPartners(session.user);
    return ApiResponse.success(partners);
  } catch (error) {
    console.error('[PARTNERS_GET_ERROR]', error);
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.status);
    }
    return ApiResponse.error('Failed to fetch partners');
  }
});

// POST: Създава нов партньор
export const POST = withAuth(async (req, session) => {
  try {
    const body = await req.json();
    const partner = await partnerService.createPartner(body);
    return ApiResponse.success(partner, 201);
  } catch (error) {
    console.error('[PARTNERS_POST_ERROR]', error);
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.status);
    }
    return ApiResponse.error('Failed to create partner');
  }
}, { roles: ['ADMIN'] });
  
