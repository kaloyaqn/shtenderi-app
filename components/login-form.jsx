'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import LogoStendo from "@/public/svg/LogoStendo"

export function LoginForm({
  className,
  ...props
})
{
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // First, ensure Account exists for legacy users
      // const legacyRes = await fetch('/api/auth/legacy-sign-in', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // })

      // if (!legacyRes.ok) {
      //   const errorData = await legacyRes.json()
      //   setError(errorData.error?.message || 'Невалиден email или парола.')
      //   return
      // }

      // Account is now created, use Better Auth's normal sign-in
      const res = await authClient.signIn.email({
        email,
        password,
      })

      if (res.error) {
        setError('Невалиден email или парола.')
      } else {
        router.push('/dashboard')
        router.refresh() // Refresh to get new session
      }
    } catch (err) {
      console.error('[LOGIN_ERROR]', err)
      setError('Възникна грешка при влизане.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <LogoStendo className="size-10"/>
          <CardTitle>Вход в Stendo</CardTitle>
          <CardDescription>
           Въведи имейла и паролата си, за да влезнеш.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  type="password"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Влизане...' : 'Влез'}
                </Button>
              </div>
            </div>
          </form>
          {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
