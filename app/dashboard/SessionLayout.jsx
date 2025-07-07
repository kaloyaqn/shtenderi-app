"use client";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

function UserExistenceChecker() {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (!session?.user?.id) return;
    let ignore = false;
    async function checkUser() {
      try {
        const res = await fetch(`/api/users/${session.user.id}`);
        if (!res.ok) {
          // User not found or forbidden
          if (!ignore) signOut();
        }
      } catch {
        if (!ignore) signOut();
      }
    }
    checkUser();
    return () => { ignore = true; };
  }, [session?.user?.id]);
  return null;
}

export default function SessionLayout({ session, children }) {
  return (
    <SessionProvider session={session}>
      <UserExistenceChecker />
      {children}
    </SessionProvider>
  );
} 