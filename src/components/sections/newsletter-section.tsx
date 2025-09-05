import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/5 blur-2xl"></div>
        <div className="absolute top-1/4 right-1/4 h-3 w-3 rounded-full bg-white/30 animate-bounce"></div>
        <div className="absolute bottom-1/3 left-1/4 h-2 w-2 rounded-full bg-white/40"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
      
      <div className="container relative py-16 sm:py-20 lg:py-24 px-4 max-w-7xl mx-auto">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Stay Updated with AlphaAkki
          </div>
          
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-6xl leading-tight text-white">
            Never Miss a Learning Opportunity
          </h2>
          <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Join 50,000+ learners who get exclusive access to new courses, industry insights, 
            career tips, and special offers delivered straight to their inbox.
          </p>
          
          {/* Newsletter form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto border border-white/20">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 h-12 sm:h-14 bg-white/95 backdrop-blur-sm border-0 text-gray-900 placeholder:text-gray-500 rounded-full px-6 text-base focus:ring-2 focus:ring-white/50"
              />
              <Button 
                size="lg" 
                className="h-12 sm:h-14 px-6 sm:px-8 bg-white text-orange-600 hover:bg-gray-50 border-0 rounded-full font-semibold whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          </div>
          
          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8">
            <div className="flex items-center justify-center sm:justify-start gap-3 text-white/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-medium">Weekly Course Updates</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3 text-white/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="font-medium">Exclusive Discounts</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3 text-white/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-medium">Career Insights</span>
            </div>
          </div>
          
          <p className="text-white/70 text-sm">
            ✨ Join our community • 📧 No spam, ever • 🚀 Unsubscribe anytime
          </p>
        </div>
      </div>
    </section>
  )
}