import { getServerSession } from './get-session-better-auth'

export async function getSessionWithLog() {
  const session = await getServerSession()
  console.log('🧠 SESSION:', session)
  return session
}
