import NextAuth, {
    CredentialsSignin,
    type DefaultSession,
    NextAuthConfig,
} from "next-auth"
import "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
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

class InvalidLoginError extends CredentialsSignin {
    code = "Invalid identifier or password"
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

const testUsers = [
    {
        email: "admin@admin.com",
        name: "Admin User",
    },
    {
        email: "validator@validator.com",
        name: "Validator User",
    },
    {
        email: "viewer@viewer.com",
        name: "Viewer User",
    },
]

if (process.env.NODE_ENV === "development") {
    config.providers.push(
        Credentials({
            id: "password",
            name: "Password",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const user = testUsers.find(
                    (u) => u.email === credentials.email,
                )
                if (!user) throw new InvalidLoginError()

                if (credentials.password === "password") {
                    return {
                        email: user.email,
                        name: user.name,
                    }
                }
                throw new InvalidLoginError()
            },
        }),
    )
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
