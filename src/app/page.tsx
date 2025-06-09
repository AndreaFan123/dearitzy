"use client";
import dynamic from "next/dynamic";
import logo from "../../public/itzy.jpg";
import Image from "next/image";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-[100vh]">Loading...</div>,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5313f] relative">
      <main className="p-2">
        <div className="flex items-center gap-4 justify-center mb-4">
          <div>
            <Image src={logo} width={50} height={50} alt="ITZY logo" />
          </div>
          <h1 className="text-2xl font-bold">Dear ITZY</h1>
        </div>
        <Map />
      </main>
    </div>
  );
}
