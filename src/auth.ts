import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import GitHub from "next-auth/providers/github"

export const config = {
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
    secret: process.env.NEXTAUTH_SECRET,
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
