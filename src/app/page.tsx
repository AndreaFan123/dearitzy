"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dear ITZY 地圖留言板</h1>
        <Map />
      </main>
    </div>
  );
}
