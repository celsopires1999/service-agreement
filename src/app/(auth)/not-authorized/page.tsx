import Image from "next/image"

export const metadata = {
    title: "Not Authorized",
}

export default function NotAuthorized() {
    return (
        <div className="w-full px-2">
            <div className="mx-auto flex flex-col items-center justify-center gap-4 py-4">
                <h2 className="text-2xl">You Are Not Authorized</h2>
                <Image
                    className="m-9 rounded-xl"
                    src="/images/not-found-1024x1024.png"
                    width={300}
                    height={300}
                    sizes="300px"
                    alt="Page Not Authrorized"
                    priority={true}
                    title="You Are Not Authorized"
                />
            </div>
        </div>
    )
}
