import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getSessionWithLog() {
  const session = await getServerSession(authOptions)
  console.log('🧠 SESSION:', session)
  return session
}
