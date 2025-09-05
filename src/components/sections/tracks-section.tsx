import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const tracks = [
  {
    id: "web-development",
    title: "Web Development",
    description: "Master modern web technologies including React, Next.js, and full-stack development with hands-on projects.",
    image: "/assets/home-page-cover.png",
    courses: 12,
    lessons: 85,
    duration: "40+ hours",
    rating: 4.9,
    icon: "🌐",
    color: "from-blue-100 to-indigo-200",
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    id: "ui-ux-design",
    title: "UI/UX Design",
    description: "Create stunning user experiences with design thinking, Figma, prototyping, and user research methodologies.",
    image: "/assets/home-page-cover.png",
    courses: 8,
    lessons: 52,
    duration: "30+ hours",
    rating: 4.8,
    icon: "🎨",
    color: "from-pink-100 to-rose-200",
    gradient: "from-pink-500 to-rose-600"
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    description: "Drive business growth with SEO, social media marketing, content strategy, and data-driven campaigns.",
    image: "/assets/home-page-cover.png",
    courses: 10,
    lessons: 67,
    duration: "35+ hours",
    rating: 4.7,
    icon: "📈",
    color: "from-green-100 to-emerald-200",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    id: "data-science",
    title: "Data Science",
    description: "Analyze data and build machine learning models using Python, SQL, and advanced analytics tools.",
    image: "/assets/home-page-cover.png",
    courses: 15,
    lessons: 98,
    duration: "50+ hours",
    rating: 4.9,
    icon: "📊",
    color: "from-purple-100 to-violet-200",
    gradient: "from-purple-500 to-violet-600"
  },
  {
    id: "mobile-development",
    title: "Mobile Development",
    description: "Build native and cross-platform mobile apps for iOS and Android using React Native and Flutter.",
    image: "/assets/home-page-cover.png",
    courses: 9,
    lessons: 63,
    duration: "38+ hours",
    rating: 4.8,
    icon: "📱",
    color: "from-orange-100 to-red-200",
    gradient: "from-orange-500 to-red-600"
  },
  {
    id: "cloud-computing",
    title: "Cloud Computing",
    description: "Deploy and scale applications using AWS, Azure, Docker, Kubernetes, and modern DevOps practices.",
    image: "/assets/home-page-cover.png",
    courses: 11,
    lessons: 74,
    duration: "42+ hours",
    rating: 4.8,
    icon: "☁️",
    color: "from-cyan-100 to-teal-200",
    gradient: "from-cyan-500 to-teal-600"
  }
]

export function TracksSection() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            Learning Tracks
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Learning Path
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Accelerate your career with our comprehensive learning tracks designed by industry experts. 
            Each path includes hands-on projects and real-world applications.
          </p>
        </div>
        
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {tracks.slice(0, 6).map((track) => (
            <Card key={track.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl bg-white">
              <div className="relative h-48 sm:h-52">
                <div className={`absolute inset-0 bg-gradient-to-br ${track.color}`}></div>
                <div className="absolute inset-0 bg-black/10"></div>
                
                {/* Icon and rating */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="text-4xl sm:text-5xl">{track.icon}</div>
                  <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                    <span className="text-yellow-500 text-sm">★</span>
                    <span className="text-sm font-semibold text-gray-800">{track.rating}</span>
                  </div>
                </div>
                
                {/* Floating stats */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{track.courses}</div>
                        <div className="text-xs text-gray-600">Courses</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">{track.lessons}</div>
                        <div className="text-xs text-gray-600">Lessons</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">{track.duration}</div>
                        <div className="text-xs text-gray-600">Duration</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {track.title}
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {track.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 pb-6">
                <Button className={`w-full h-12 bg-gradient-to-r ${track.gradient} hover:shadow-lg text-white rounded-full font-semibold transition-all duration-300 transform group-hover:scale-105`}>
                  Start Learning
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* View all tracks button */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="h-12 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full font-semibold">
            View All Learning Tracks
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  )
}