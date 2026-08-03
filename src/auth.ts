import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { env } from "@/lib/env";

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: env.authSecret || undefined,
  pages: {
    signIn: "/login",
  },
};
