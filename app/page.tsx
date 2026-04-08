import Image from "next/image";
import BlueJaysCountdown from "@/components/JaysCountdownClock";

export default function Home() {
  return (
  <main className="relative min-h-screen flex items-center justify-center">
      
      <div className="absolute inset-0 bg-[url('/aerial-view.jpg')] bg-cover bg-center" />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 text-white text-5xl font-bold">
        <BlueJaysCountdown />
      </div>

    </main>
  );
}
