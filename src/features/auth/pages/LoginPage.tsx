import { Link } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>
            SchediFlow
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Smart school timetabling
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Welcome back to your institution</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <p
              className="mt-4 text-center text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Don&apos;t have an account?{' '}
              <Link
                to="/auth/register"
                className="font-medium"
                style={{ color: 'var(--brand-accent)' }}
              >
                Create institution
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
