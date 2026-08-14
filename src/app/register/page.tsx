import { Suspense } from "react";
import { AuthPanel } from "@/features/auth/components/auth-panel";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthPanel mode="register" />
    </Suspense>
  );
}
