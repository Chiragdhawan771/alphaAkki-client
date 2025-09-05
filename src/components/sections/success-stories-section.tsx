import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FeaturedStory {
  title: string
  description: string
  buttonText: string
  image: string
  stats: {
    courses: string
    students: string
    rating: string
  }
}

interface PersonalStory {
  name: string
  description: string
  role: string
  company: string
  image: string
}

const featuredStory: FeaturedStory = {
  title: "Transform Your Career with AlphaAkki's Expert-Led Courses",
  description: "Join thousands of professionals who have advanced their careers through our comprehensive learning platform. From web development to data science, we provide the skills you need to succeed in today's digital economy.",
  buttonText: "Start Your Journey",
  image: "gradient-from-blue-400-to-purple-500",
  stats: {
    courses: "200+",
    students: "50K+",
    rating: "4.9"
  }
}

const personalStories: PersonalStory[] = [
  {
    name: "Sarah Chen",
    description: "AlphaAkki's web development track helped me transition from marketing to full-stack development. The hands-on projects and mentorship were game-changers for my career.",
    role: "Full-Stack Developer",
    company: "Google",
    image: "gradient-from-blue-400-to-indigo-500"
  },
  {
    name: "Marcus Johnson",
    description: "The UI/UX design course at AlphaAkki gave me the skills and confidence to land my dream job. The real-world projects made all the difference in my portfolio.",
    role: "Senior UX Designer",
    company: "Microsoft",
    image: "gradient-from-pink-400-to-rose-500"
  },
  {
    name: "Priya Patel",
    description: "Thanks to AlphaAkki's data science track, I successfully pivoted from finance to machine learning. The instructors are world-class and truly care about student success.",
    role: "ML Engineer",
    company: "Netflix",
    image: "gradient-from-purple-400-to-violet-500"
  }
]

export function SuccessStoriesSection() {
  return (
    <section id="success-stories" className="bg-white py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Real Stories, Real Results
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how AlphaAkki has transformed careers and opened new opportunities for thousands of learners worldwide.
          </p>
        </div>
        
        {/* Stories Grid */}
        <div className="grid gap-8 lg:grid-cols-2 xl:gap-12">
          {/* Main featured story */}
          <Card className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 sm:p-10 h-full flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-full px-4 py-1">
                    ⭐ Featured Success
                  </Badge>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900">
                  {featuredStory.title}
                </h3>
                
                <p className="text-gray-700 leading-relaxed text-lg">
                  {featuredStory.description}
                </p>
                
                <div className="grid grid-cols-3 gap-6 py-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {featuredStory.stats.courses}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Expert Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                      {featuredStory.stats.students}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Active Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {featuredStory.stats.rating}★
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Average Rating</div>
                  </div>
                </div>
              </div>
              
              <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                {featuredStory.buttonText}
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </CardContent>
          </Card>
          
          {/* Individual success stories */}
          <div className="space-y-6">
            {personalStories.map((story: PersonalStory, index: number) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg rounded-2xl bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-white">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start space-x-4">
                    <div className={`h-14 w-14 rounded-2xl bg-${story.image} flex-shrink-0 flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-lg">{story.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {story.name}
                        </h4>
                        <p className="text-sm font-medium text-gray-500">
                          {story.role} at <span className="text-gray-700 font-semibold">{story.company}</span>
                        </p>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        &ldquo;{story.description}&rdquo;
                      </p>
                      <div className="flex items-center space-x-1 pt-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-sm">★</span>
                        ))}
                        <span className="text-sm text-gray-500 ml-2">Verified Graduate</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* View more button */}
            <div className="text-center pt-4">
              <Button variant="outline" className="h-12 px-6 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full font-semibold">
                View More Stories
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
