import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-black bg-home-img bg-cover bg-center">
      <main className="flex flex-col items-center justify-center text-center max-w-5xl mx-auto h-dvh">
        <div className="flex flex-col gap-6 p-12 rounded-xl bg-black/90 w-4/5 sm:max-w-96 mx-auto text-white sm:text-2xl">
          <h1>
            Service Agreement
            <br />
            Management
          </h1>
          <h2>
            Your Service Provider
            <br />
            At your disposal
          </h2>
          <p>Daily Availability<br />9am to 5pm</p>
          <Link href="/agreements" className="hover:underline">
            Start
          </Link>
        </div>
      </main>
    </div>
  );
}
