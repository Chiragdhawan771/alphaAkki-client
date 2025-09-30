import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Main footer content */}
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand section - full width on mobile, 2 cols on large */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-base">A</span>
                </div>
                <span className="font-bold text-xl text-white">AlphaAkki</span>
              </div>
              <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-md">
                Transform your career with AlphaAkki – the ultimate platform for YouTubers and digital creators. Learn
                YouTube growth, video editing, content strategy, and monetization to turn passion into profit. Join
                50,000+ creators building loyal audiences and thriving careers with step-by-step guidance and expert
                support.
              </p>
              <div className="flex items-center space-x-4">
                <a
                  href="https://www.instagram.com/alphaakki_/"
                  target="blank"
                  className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@alphaakki"
                  target="blank"
                  className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.5 6.2s-.2-1.6-.8-2.3c-.7-.8-1.6-.8-2-0.9C17.7 2.7 12 2.7 12 2.7s-5.7 0-8.7.3c-.4 0-1.3.1-2 .9-.6.7-.8 2.3-.8 2.3S0 8.1 0 9.9v1.8c0 1.8.2 3.7.2 3.7s.2 1.6.8 2.3c.7.8 1.6.8 2 .9 3 .3 8.7.3 8.7.3s5.7 0 8.7-.3c.4 0 1.3-.1 2-.9.6-.7.8-2.3.8-2.3s.2-1.9.2-3.7V9.9c0-1.8-.2-3.7-.2-3.7zM9.7 15.6V8.4l6.3 3.6-6.3 3.6z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-8 md:gap-12">
              {/* Learning section */}
              <div>
                <h3 className="font-semibold text-lg text-white mb-6">Learning</h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="/courses/" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                      All Courses
                    </Link>
                  </li>
                  {/* <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">Free Resources</a></li> */}
                  {/* <li>
                    <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                      Certifications
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                      Career Paths
                    </a>
                  </li> */}
                </ul>
              </div>

              {/* Company section */}
              <div>
                <h3 className="font-semibold text-lg text-white mb-6">Company</h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="/about/" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                      About Us
                    </Link>
                  </li>
             
                  {/* <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">Press</a></li> */}
                  {/* <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">Blog</a></li> */}
                  <li>
                    <Link href="/contact/" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter signup */}
        {/* <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-lg text-white mb-2">Stay Updated</h3>
              <p className="text-gray-300 text-sm">Get the latest courses and career tips delivered to your inbox.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[250px]"
              />
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg px-6 py-2 font-semibold whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div> */}

        {/* Bottom section */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              2024 AlphaAkki. All rights reserved. Built with for learners worldwide.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/privacy-policy/"
                className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/termsconditions"
                className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
