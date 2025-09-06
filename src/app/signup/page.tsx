import SignupPage from "@/components/auth/signup-page";

/**
 * Renders the signup page.
 *
 * This component is the default export for the /signup route and simply returns the
 * application's SignupPage component.
 *
 * @returns A JSX element that mounts the SignupPage component.
 */
export default function signup() {
  return <SignupPage />;
}
