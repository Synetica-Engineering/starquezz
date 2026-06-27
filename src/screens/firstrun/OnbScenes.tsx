function OnboardingImage({ src, alt }: { src: string; alt: string }) {
  return <img className="onb-art-img" src={src} alt={alt} />
}

/** Problem 1 — kid autonomy: the kid checks their own board. */
export function SceneAutonomy() {
  return (
    <OnboardingImage
      src="/illustrations/onboarding-autonomy-storybook.jpg"
      alt="Two kids celebrating a glowing routine star"
    />
  )
}

/** Problem 2 — habit design: Starquezz keeps the habit set small and balanced. */
export function SceneDesign() {
  return (
    <OnboardingImage
      src="/illustrations/onboarding-design-garden.jpg"
      alt="A family growing a small garden of habit stars"
    />
  )
}

/** Problem 3 — adventures together: stars redeem shared time, never stuff. */
export function SceneTogether() {
  return (
    <OnboardingImage
      src="/illustrations/onboarding-adventures.jpg"
      alt="A family choosing an adventure with glowing stars"
    />
  )
}
