import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function TermsAndConditions() {
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
              Terms & Conditions
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto drop-shadow-sm">
              Welcome to AlphaAkki! Please read these terms carefully before using our platform and services.
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
                  <span className="text-white text-xl">📜</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Effective Date</h2>
                  <p className="text-gray-600">Last updated: [Insert Date]</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Welcome to AlphaAkki! By using our website and services, you agree to the following terms. Please read
                carefully.
              </p>
            </CardContent>
          </Card>

          {/* Use of Services */}
          <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">👤</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Use of Services</h2>
                </div>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>You must be at least 16 years old to use our platform.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>You agree to provide accurate and complete registration details.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>You are responsible for keeping your account secure.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Course Access & Payments */}
          <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">💳</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Course Access & Payments</h2>
                </div>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Access to courses is granted upon successful payment.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>All sales are final. Refunds are only provided where required by law.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Sharing your login details or reselling course content is strictly prohibited.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">©️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Intellectual Property</h2>
                </div>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>All course content, videos, and materials are owned by AlphaAkki.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>You may not copy, distribute, or reproduce content without prior permission.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability & Termination */}
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">⚠️</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">4. Limitation of Liability</h2>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      AlphaAkki is not responsible for losses or damages resulting from the use of our website or
                      courses.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Results from our training may vary depending on individual effort and application.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">🚫</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">5. Termination of Account</h2>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate these terms.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Updates to Terms */}
          <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🔄</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Updates to Terms</h2>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms & Conditions periodically. Continued use of our platform means you accept the
                updated terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="bg-gradient-to-r from-orange-600 to-red-700 border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">📧</span>
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 drop-shadow-sm">7. Contact Us</h3>
              <p className="text-orange-100 text-lg mb-6 drop-shadow-sm">
                For support or legal inquiries, please reach out to us:
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
                  <Link href="/privacy-policy/">
                    <span className="drop-shadow-sm">View Privacy Policy</span>
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
