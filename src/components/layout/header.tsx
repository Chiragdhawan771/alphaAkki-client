"use client"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 sm:h-18 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a className="flex items-center space-x-2 sm:space-x-3" href="/">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-base">A</span>
              </div>
              <span className="font-bold text-lg sm:text-xl text-gray-900">AlphaAkki</span>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#home" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200">
              Home
            </a>
            <a href="#tracks" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200">
              Learning Tracks
            </a>
            <a href="#success-stories" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200">
              Success Stories
            </a>
            <a href="#about" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200">
              About
            </a>
            <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200">
              Contact
            </a>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <a href="#" className="hidden sm:block text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200">
              Sign Up
            </a>
            <Button size="sm" className="h-9 sm:h-10 px-4 sm:px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              Sign In
            </Button>
            
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
              <a href="#home" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors">
                Home
              </a>
              <a href="#tracks" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors">
                Learning Tracks
              </a>
              <a href="#success-stories" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors">
                Success Stories
              </a>
              <a href="#about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors">
                About
              </a>
              <a href="#contact" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors">
                Contact
              </a>
              <div className="pt-2 border-t border-gray-200">
                <a href="#" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors">
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}