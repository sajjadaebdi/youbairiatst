"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { HeroSection } from "@/components/landing/hero-section"
import { TrustStrip } from "@/components/landing/trust-strip"
import { FeatureGrid } from "@/components/landing/feature-grid"
import { ShowcaseSection } from "@/components/landing/showcase-section"
import { VisionSection } from "@/components/landing/vision-section"
import { FinalCtaSection } from "@/components/landing/final-cta"

export default function LandingPage() {
  const router = useRouter()
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          router.replace("/products")
          return
        }
      } catch (error) {
        console.error("Landing auth check failed:", error)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [router])

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 py-24">
        <div className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-[#6F263D]/30 border-t-[#6F263D]" />
      </div>
    )
  }

  return (
    <div className="bg-white text-slate-900">
      <HeroSection />
      <TrustStrip />
      <FeatureGrid />
      <ShowcaseSection />
      <VisionSection />
      <FinalCtaSection />
    </div>
  )
}
