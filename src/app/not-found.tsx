import Image from "next/image"
import Link from "next/link"

export const metadata = {
    title: "Page Not Found",
}

export default function NotFound() {
    return (
        <div className="w-full px-2">
            <div className="mx-auto flex flex-col items-center justify-center gap-4 py-4">
                <h2 className="text-2xl">Page Not Found</h2>
                <Image
                    className="m-9 rounded-xl"
                    src="/images/not-found-1024x1024.png"
                    width={300}
                    height={300}
                    sizes="300px"
                    alt="Page Not Found"
                    priority={true}
                    title="Page Not Found"
                />
            </div>
            <Link href="/agreements" className="text-center hover:underline">
                <h3>Go Home</h3>
            </Link>
        </div>
    )
}
