"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const MapContent = dynamic(() => import("./MapContent"), {
  ssr: false,
  loading: () => (
    <div className="h-[80vh] w-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">載入地圖中...</p>
    </div>
  ),
});

export default function Map() {
  return (
    <div className="w-full h-[80vh]">
      <Suspense>
        <MapContent />
      </Suspense>
    </div>
  );
}
