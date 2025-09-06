import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-700 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center">
            <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              Legal Information
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-sm">
              Privacy Policy
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto drop-shadow-sm">
              Your privacy is very important to us. Learn how we collect, use, and protect your personal information.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12 sm:py-16">
        <div className="space-y-8">
          {/* Effective Date */}
          <Card className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">📅</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Effective Date</h2>
                  <p className="text-gray-600">Last updated: [Insert Date]</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                At AlphaAkki, your privacy is very important to us. This Privacy Policy explains how we collect, use,
                and protect your personal information when you use our website and services.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">📊</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information:</h3>
                  <p className="text-gray-700">Name, email, payment details, and account information.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Usage Data:</h3>
                  <p className="text-gray-700">
                    Pages visited, courses accessed, time spent, and interactions on the website.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cookies & Tracking:</h3>
                  <p className="text-gray-700">To improve your browsing experience and personalize content.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                </div>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>To provide and improve our courses and services.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>To process payments and manage your account.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>To send updates, promotional offers, and support-related emails.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>To analyze user behavior and improve learning experiences.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🔒</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Protection</h2>
                </div>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>We use secure servers and encryption to protect your data.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>We never sell your information to third parties.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Limited access is given only to authorized team members.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Third-Party Services & Your Rights */}
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">🔗</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">4. Third-Party Services</h2>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We may use trusted third-party tools (such as payment gateways, analytics, or email services) that
                  collect information in accordance with their own policies.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">⚖️</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Request access, correction, or deletion of your personal data.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Opt-out of marketing emails anytime.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <Card className="bg-gradient-to-r from-orange-600 to-red-700 border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">📧</span>
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 drop-shadow-sm">6. Contact Us</h3>
              <p className="text-orange-100 text-lg mb-6 drop-shadow-sm">
                For any privacy-related queries, please reach out to us:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-white text-orange-600 hover:bg-gray-100 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <a href="mailto:collabalphaakki@gmail.com">collabalphaakki@gmail.com</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 border-2 border-white text-white hover:bg-white hover:text-orange-600 rounded-full font-semibold transition-all duration-300 bg-transparent"
                  asChild
                >
                  <Link href="/termsconditions/">
                    <span className="drop-shadow-sm">View Terms & Conditions</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
