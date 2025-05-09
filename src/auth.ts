import NextAuth, { type DefaultSession, NextAuthConfig } from "next-auth"
import "next-auth/jwt"
import GitHub from "next-auth/providers/github"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { getUserByEmail } from "./lib/queries/user"

declare module "next-auth" {
    interface User {
        userid?: string
        role?: string
    }

    interface Session {
        user: {
            userid?: string
            role?: string
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userid?: string
        role?: string
    }
}

export const config: NextAuthConfig = {
    providers: [
        MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            authorization: {
                params: {
                    scope: "openid profile email User.Read",
                },
            },
        }),
        GitHub,
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role
                session.user.userid = token.userid
            }

            return session
        },
        async jwt({ token }) {
            if (!token.sub) return token
            if (token.userid && token.role) return token

            if (!token.email) return token

            // Read database with e-mail to get the userId and role
            const user = await getUserByEmail(token.email)

            if (!user) return token
            token.role = user?.role
            token.userid = user?.userId

            return token
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
