import { SkipLink } from "../../components/layout/SkipLink";
import { OnboardingView } from "../../features/onboarding/OnboardingView";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background text-text">
      <SkipLink />
      <main id="main-content" className="flex min-h-screen items-center justify-center p-4">
        <OnboardingView />
      </main>
    </div>
  );
}
