import { AuthPage } from "@/components/auth-page";
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <AuthPage error={Boolean((await searchParams).error)} />;
}
