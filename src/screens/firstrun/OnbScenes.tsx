function OnboardingImage({
  src,
  alt,
  magic,
}: {
  src: string
  alt: string
  magic: 'constellation' | 'garden' | 'adventure'
}) {
  return (
    <div className={`onb-art-frame magic-${magic}`}>
      <img className="onb-art-img" src={src} alt={alt} />
      <span className="onb-sparkles" aria-hidden="true" />
      <span className="onb-glimmer" aria-hidden="true" />
    </div>
  )
}

/** Problem 1 — kid autonomy: the kid checks their own board. */
export function SceneAutonomy() {
  return (
    <OnboardingImage
      src="/illustrations/onboarding-autonomy-storybook.jpg"
      alt="Two kids celebrating a glowing routine star"
      magic="constellation"
    />
  )
}

/** Problem 2 — habit design: Starquezz keeps the habit set small and balanced. */
export function SceneDesign() {
  return (
    <OnboardingImage
      src="/illustrations/onboarding-design-garden.jpg"
      alt="A family growing a small garden of habit stars"
      magic="garden"
    />
  )
}

/** Problem 3 — adventures together: stars redeem shared time, never stuff. */
export function SceneTogether() {
  return (
    <OnboardingImage
      src="/illustrations/onboarding-adventures.jpg"
      alt="A family choosing an adventure with glowing stars"
      magic="adventure"
    />
  )
}
