import Link from "next/link"

export default function Home() {
    return (
        <div className="bg-black bg-home-img bg-cover bg-center">
            <main className="mx-auto flex h-dvh max-w-5xl flex-col items-center justify-center text-center">
                <div className="mx-auto flex w-4/5 flex-col gap-6 rounded-xl bg-black/90 p-12 text-white sm:max-w-96 sm:text-2xl">
                    <h1>
                        Service Agreement
                        <br />
                        Validation
                    </h1>
                    <h2>
                        Your Service Provider
                        <br />
                        At your disposal
                    </h2>
                    <p>
                        Daily Availability
                        <br />
                        8am to 5pm
                    </p>
                    <Link href="/agreements" className="hover:underline">
                        Start
                    </Link>
                </div>
            </main>
        </div>
    )
}
