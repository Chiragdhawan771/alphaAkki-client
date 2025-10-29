import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/sections/hero-section"
import { SuccessStoriesSection } from "@/components/sections/success-stories-section"
import { NewsletterSection } from "@/components/sections/newsletter-section"
export function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        {/* <SuccessStoriesSection /> */}
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  )
}