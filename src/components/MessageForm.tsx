"use client";

import { useState } from "react";

interface MessageFormProps {
  lat: number;
  lng: number;
  onSubmit: (data: {
    lat: number;
    lng: number;
    message: string;
    display_name?: string;
  }) => void;
  onCancel: () => void;
}

export default function MessageForm({
  lat,
  lng,
  onSubmit,
  onCancel,
}: MessageFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSubmit({ lat, lng, message, display_name: displayName || "匿名粉絲" });
    setMessage("");
    setDisplayName("");
  };

  return (
    <div className="absolute top-4 right-4 z-[999] bg-white/90 p-4 shadow-xl rounded w-[400px] border-2">
      <h2 className="text-lg font-semibold mb-2">
        為 ITZY 留言 | Cheer for ITZY
      </h2>
      <input
        type="text"
        placeholder="顯示名稱 Display Name (optional)"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="border-2 p-2 mb-2 w-full text-sm rounded-sm"
      />
      <textarea
        placeholder="想說什麼？ Say something to ITZY!"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="border-2 p-2 mb-2 w-full text-sm rounded-sm"
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="text-sm px-3 py-1 border-2 rounded-sm"
        >
          取消 (Cancel)
        </button>
        <button
          onClick={handleSubmit}
          className="text-sm px-3 py-1 bg-black text-white rounded"
        >
          傳送 (Send)
        </button>
      </div>
    </div>
  );
}
