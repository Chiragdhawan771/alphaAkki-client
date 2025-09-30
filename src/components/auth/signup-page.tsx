"use client"
import { useState } from "react"
import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { signup, isLoading } = useAuth()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!")
      return
    }
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })
      router.push("/")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed")
    }
  }

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">

      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Join AlphaAkki</h2>
            <p className="mt-2 text-sm text-gray-600">Create your account and start your learning journey</p>
          </div>

          {/* Signup Form */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">Create Account</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Fill in your details to get started
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange} 
                    required
                    className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{" "}
                    <Link href="/termsconditions/" className="font-medium text-orange-600 hover:text-orange-500">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy-policy/" className="font-medium text-orange-600 hover:text-orange-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
                    Sign in here
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Social Signup Options */}
          {/* <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-11 border-gray-200 hover:bg-gray-50 bg-transparent">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </Button>

              <Button variant="outline" className="h-11 border-gray-200 hover:bg-gray-50 bg-transparent">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="ml-2">Facebook</span>
              </Button>
            </div>
          </div> */}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}
