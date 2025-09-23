import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/layout/header"
import Link from "next/link"


interface ContactInfo {
  icon: string
  title: string
  description: string
  value: string
}

interface SocialLink {
  platform: string
  icon: string
  url: string
  followers: string
}

const contactInfo: ContactInfo[] = [
  {
    icon: "📧",
    title: "Email",
    description: "Send us a message",
    value: "hello@alphaakki.com",
  },
  {
    icon: "📱",
    title: "Phone",
    description: "Call us directly",
    value: "+1 (555) 123-4567",
  },
  {
    icon: "📍",
    title: "Location",
    description: "Visit our office",
    value: "San Francisco, CA",
  },
  {
    icon: "⏰",
    title: "Response Time",
    description: "We typically respond within",
    value: "24 hours",
  },
]

const socialLinks: SocialLink[] = [
  {
    platform: "YouTube",
    icon: "🎥",
    url: "youtube.com/alphaakki",
    followers: "300K+",
  },
  {
    platform: "Instagram",
    icon: "📸",
    url: "instagram.com/alphaakki",
    followers: "150K+",
  },
  {
    platform: "Twitter",
    icon: "🐦",
    url: "twitter.com/alphaakki",
    followers: "75K+",
  },
  {
    platform: "LinkedIn",
    icon: "💼",
    url: "linkedin.com/in/alphaakki",
    followers: "50K+",
  },
]

export function ContactSection() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <section id="contact" className="bg-gradient-to-br from-gray-50 via-white to-orange-50 py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Get In Touch
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Let's Start a Conversation
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about our courses? Want to collaborate? Or just want to say hello? We'd love to hear from
              you and help you on your content creation journey.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 xl:gap-12 mb-16">
            {/* Contact Form */}
            <Card className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-8 sm:p-10">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl drop-shadow-sm">💬</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Send Message</h3>
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-full px-3 py-1 mt-1">
                        📝 Quick Response Guaranteed
                      </Badge>
                    </div>
                  </div>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <Input
                          placeholder="Your first name"
                          className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <Input
                          placeholder="Your last name"
                          className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <Input
                        placeholder="What's this about?"
                        className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <Textarea
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 resize-none"
                      />
                    </div>

                    <Button className="w-full h-12 bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      <span className="drop-shadow-sm">Send Message</span>
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              {contactInfo.map((info: ContactInfo, index: number) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg rounded-2xl bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50"
                >
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-start space-x-4">
                      <div className="h-14 w-14 rounded-2xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                        <span className="text-2xl">{info.icon}</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-bold text-lg text-gray-900 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {info.title}
                        </h4>
                        <p className="text-gray-600 text-sm">{info.description}</p>
                        <p className="text-gray-900 font-semibold">{info.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Social Media Links */}
          {/* <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Connect With Us</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {socialLinks.map((social: SocialLink, index: number) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg rounded-2xl bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 cursor-pointer"
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex items-center justify-center shadow-lg mx-auto mb-3">
                      <span className="text-xl">{social.icon}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {social.platform}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{social.followers}</p>
                    <p className="text-xs text-gray-500 mt-1">{social.url}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div> */}

          {/* Call to Action */}
          <div className="text-center">
            <Card className="bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 border-0 shadow-2xl rounded-3xl overflow-hidden max-w-4xl mx-auto">
              <CardContent className="p-8 sm:p-12">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 drop-shadow-sm">
                  Ready to Start Your Learning Journey?
                </h3>
                <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto drop-shadow-sm">
                  Don't wait! Join thousands of creators who are already transforming their content and building
                  successful careers. Your journey to content creation mastery starts here.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-white text-orange-600 hover:bg-gray-100 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Browse Courses
                  </Button>
  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
