import { getBranding } from "@/lib/branding";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const branding = await getBranding();
  return <LoginForm branding={branding} />;
}
