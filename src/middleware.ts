import { auth } from "@/auth"

export default auth((req) => {
    if (!req.auth && req.nextUrl.pathname !== "/login") {
        const newUrl = new URL(
            `/login?callbackUrl=${req.nextUrl.pathname}`,
            req.nextUrl.origin,
        )
        return Response.redirect(newUrl)
    }
})

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - auth
         * - favicon.ico (favicon file)
         * - robots.txt
         * - images
         * - login
         * - homepage (represented with $ after beginning /)
         */
        "/((?!api|_next/static|_next/image|auth|favicon.ico|robots.txt|images|login|$).*)",
    ],
}
