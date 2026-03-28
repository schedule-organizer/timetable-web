import { Link } from 'react-router-dom'
import { RegisterForm } from '../components/RegisterForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function RegisterPage() {
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
            <CardTitle>Create your institution</CardTitle>
            <CardDescription>Start your 30-day free trial — no credit card required</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            <p
              className="mt-4 text-center text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="font-medium"
                style={{ color: 'var(--brand-accent)' }}
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
