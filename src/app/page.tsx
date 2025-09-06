import { LandingPage } from "@/components/landing/landing-page";
import SignupPage from "@/components/auth/signup-page";
import LoginPage from "@/components/auth/login-page";

/**
 * Default page component that renders the public landing page.
 *
 * Renders the `LandingPage` component and accepts no props.
 *
 * @returns The JSX element for the site's landing page.
 */
export default function Home() {
  return <LandingPage />;
}
