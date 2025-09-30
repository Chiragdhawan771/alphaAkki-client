"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 sm:h-18 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link className="flex items-center space-x-2 sm:space-x-3" href="/">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-base">A</span>
              </div>
              <span className="font-bold text-lg sm:text-xl text-gray-900">AlphaAkki</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/courses/"
              className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200"
            >
              All Courses
            </Link>
            <Link
              href="/about/"
              className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200"
            >
              About
            </Link>
            <a
              href="/contact/"
              className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200"
            >
              Contact
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                      <div className="hidden md:block text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user?.role}</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center cursor-pointer hover:bg-orange-200 transition-colors">
                        <span className="text-sm font-medium text-orange-700">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link
                        href={{
                          pathname: "/dashboard",
                          query: { tab: "dashboard" },
                        }}
                        className="flex items-center cursor-pointer"
                      >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                          />
                        </svg>
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={{
                          pathname: "/dashboard",
                          query: { tab: "courses" },
                        }}
                        className="flex items-center cursor-pointer"
                      >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        My Courses
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Guest User Menu */}
                <Link
                  href="/signup/"
                  className="hidden sm:block text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200"
                >
                  Sign Up
                </Link>
                <Link href="/login/">
                  <Button
                    size="sm"
                    className="h-9 sm:h-10 px-4 sm:px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Home
              </Link>
              {isAuthenticated && (
                <Link
                  href={{
                    pathname: "/dashboard",
                    query: { tab: "dashboard" },
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  href={{
                    pathname: "/dashboard",
                    query: { tab: "courses" },
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  My Courses
                </Link>
              )}
              <Link
                href="/courses/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                All Courses
              </Link>

              <Link
                href="/about/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                About
              </Link>

              <Link
                href="/contact/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Contact
              </Link>
              <div className="pt-2 border-t border-gray-200">
                {isAuthenticated ? (
                  <div 
                    onClick={logout}
                    className="px-3 py-2 text-red-600 focus:text-red-600 text-base font-medium cursor-pointer hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Logout
                  </div>
                ) : (
                  <Link
                    href="/signup/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
