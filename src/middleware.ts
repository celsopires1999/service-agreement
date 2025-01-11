import { auth } from "@/auth"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    const url = new URL(request.nextUrl)
    const localPlanId = url.searchParams.get("localPlanId")

    if (localPlanId) {
        const nextResponse = NextResponse.next()
        nextResponse.cookies.set("localPlanId", localPlanId)
        return nextResponse
    }
}

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
