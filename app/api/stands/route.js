import { createStand, getAllStands } from "@/lib/stands/stand"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }
    const stands = await getAllStands(session.user)
    return Response.json(stands)
  } catch (err) {
    console.error('[STANDS_GET_ERROR]', err)
    return new Response('Failed to fetch stands', { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { name, storeId } = await req.json()
    const stand = await createStand({ name, storeId })
    return Response.json(stand)
  } catch (err) {
    console.error('[STAND_POST_ERROR]', err)

    const status = err.status || 500
    const message = err.message || 'Failed to create stand'

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
