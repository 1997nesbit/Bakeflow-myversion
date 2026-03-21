import Link from 'next/link'
import { ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <ChefHat className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-5xl font-bold text-primary">404</p>
          <h1 className="text-xl font-bold text-foreground">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            This page doesn&apos;t exist or you may not have access to it.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
