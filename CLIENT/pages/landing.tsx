import { NavigationHeader } from "../components/NavigationHeader";
import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { Footer } from "../components/ui/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <NavigationHeader />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}