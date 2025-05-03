import { NextResponse } from "next/server"
import { auth } from "@/auth"

export default auth((req) => {
    if (!req.auth && req.nextUrl.pathname !== "/login") {
        const newUrl = new URL(
            `/login?callbackUrl=${req.nextUrl.pathname}`,
            req.nextUrl.origin,
        )
        return Response.redirect(newUrl)
    }

    const url = new URL(req.nextUrl)
    const localPlanId = url.searchParams.get("localPlanId")

    if (localPlanId) {
        const nextResponse = NextResponse.next()
        nextResponse.cookies.set("localPlanId", localPlanId)
        return nextResponse
    }
})

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        // "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
        "/((?!api|_next/static|_next/image|auth|favicon.ico|robots.txt|images|login|$).*)",
    ],
}
