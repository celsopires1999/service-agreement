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

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
}
