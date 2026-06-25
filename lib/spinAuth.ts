import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase";

export const spinAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const supabase = createServerClient();
        const { data: user, error } = await supabase
          .from("spin_users")
          .select("id, email, password_hash, display_name")
          .eq("email", credentials.email.toLowerCase().trim())
          .single();

        if (error || !user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;

        return {
          id:    user.id,
          email: user.email,
          name:  user.display_name ?? user.email.split("@")[0],
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/preview/spin/login",
    error:  "/preview/spin/login",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.spinUserId = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.spinUserId && session.user) {
        (session.user as { id?: string }).id = token.spinUserId as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
