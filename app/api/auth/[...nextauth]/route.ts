import NextAuth from "next-auth";
import { spinAuthOptions } from "@/lib/spinAuth";

const handler = NextAuth(spinAuthOptions);
export { handler as GET, handler as POST };
