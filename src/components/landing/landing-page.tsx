import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/sections/hero-section"
import { TrustedBySection } from "@/components/sections/trusted-by-section"
import { TracksSection } from "@/components/sections/tracks-section"
import { SuccessStoriesSection } from "@/components/sections/success-stories-section"
import { NewsletterSection } from "@/components/sections/newsletter-section"
export function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrustedBySection />
        <TracksSection />
        <SuccessStoriesSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  )
}