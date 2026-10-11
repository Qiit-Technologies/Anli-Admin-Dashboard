import LoginForm from "../login/login-form";

/**
 * Super-admin sign-in (served as /superadmin/signin under the basePath).
 * Reuses the same form as /login — both post to /auth/super-admin/login
 * and land on /dashboard. The middleware sends unauthenticated HQ visitors
 * here, and /logout returns here.
 */
export default function SigninPage() {
  return <LoginForm />;
}
