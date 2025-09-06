import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AboutStats {
  subscribers: string
  courses: string
  students: string
  experience: string
}

interface LearningPath {
  title: string
  description: string
  icon: string
  features: string[]
}

const aboutStats: AboutStats = {
  subscribers: "300K+",
  courses: "50+",
  students: "25K+",
  experience: "5+",
}

const learningPaths: LearningPath[] = [
  {
    title: "Content Creation Mastery",
    description:
      "Learn the fundamentals of creating engaging content that resonates with your audience and builds a loyal following.",
    icon: "🎬",
    features: ["Video Production", "Storytelling", "Audience Engagement", "Content Strategy"],
  },
  {
    title: "YouTube Growth Strategies",
    description:
      "Discover proven techniques to grow your YouTube channel, optimize for the algorithm, and monetize your content effectively.",
    icon: "📈",
    features: ["Channel Optimization", "SEO Techniques", "Monetization", "Analytics"],
  },
  {
    title: "Personal Branding",
    description:
      "Build a strong personal brand that stands out in the crowded digital space and attracts opportunities.",
    icon: "✨",
    features: ["Brand Identity", "Social Media", "Networking", "Thought Leadership"],
  },
]

export function AboutSection() {
  return (
    <section id="about" className="bg-gradient-to-br from-gray-50 via-white to-orange-50 py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            About AlphaAkki
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Your Guide to Content Creation Success
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
           { `From zero to 300K+ subscribers, I've learned what it takes to succeed as a content creator. Now I'm here to
            share that knowledge and help you level up your content creation journey.`}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 xl:gap-12 mb-16">
          {/* Main About Card */}
          <Card className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 sm:p-10 h-full flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="h-16 w-16 rounded-2xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl drop-shadow-sm">A</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">AlphaAkki</h3>
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-full px-3 py-1 mt-1">
                      🎥 Content Creator & Educator
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg">
                 {`Hi! I'm AlphaAkki, a passionate content creator who has built a thriving YouTube community of over
                  300,000 subscribers. My journey from beginner to successful creator has taught me invaluable lessons
                  about what works in the digital space.`}
                </p>

                <p className="text-gray-700 leading-relaxed">
                  {`Through my courses and mentorship, I help aspiring content creators avoid common pitfalls, accelerate
                  their growth, and build sustainable careers in the creator economy. Whether you're just starting out
                  or looking to take your content to the next level, I'm here to guide you every step of the way.`}
                </p>

                <div className="grid grid-cols-2 gap-4 py-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                      {aboutStats.subscribers}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">YouTube Subscribers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                      {aboutStats.experience}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {aboutStats.courses}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Expert Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                      {aboutStats.students}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Students Taught</div>
                  </div>
                </div>
              </div>

              <Button className="w-full h-12 bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <span className="drop-shadow-sm">Start Learning Today</span>
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </CardContent>
          </Card>

          {/* Learning Paths */}
          <div className="space-y-6">
            {learningPaths.map((path: LearningPath, index: number) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg rounded-2xl bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50"
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start space-x-4">
                    <div className="h-14 w-14 rounded-2xl bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 flex-shrink-0 flex items-center justify-center shadow-lg">
                      <span className="text-2xl">{path.icon}</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <h4 className="font-bold text-lg text-gray-900 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {path.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">{path.description}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {path.features.map((feature, featureIndex) => (
                          <Badge
                            key={featureIndex}
                            variant="secondary"
                            className="bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700 rounded-full px-3 py-1 text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-orange-600 bg-gradient-to-r from-orange-600 to-red-700 border-0 shadow-2xl rounded-3xl overflow-hidden max-w-4xl mx-auto">
            <CardContent className="p-8 sm:p-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 drop-shadow-sm">
                Ready to Transform Your Content Creation Journey?
              </h3>
              <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto drop-shadow-sm">
                Join thousands of creators who have already started their journey to success. Get access to proven
                strategies, personalized guidance, and a supportive community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-white text-orange-600 hover:bg-gray-100 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  View All Courses
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 border-2 border-white text-white hover:bg-white hover:text-orange-600 rounded-full font-semibold transition-all duration-300 bg-transparent"
                >
                  <span className="drop-shadow-sm">Watch Free Content</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-4a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
