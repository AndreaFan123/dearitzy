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
    <div className="absolute top-4 left-4 z-[999] bg-white p-4 shadow-lg rounded w-[300px]">
      <h2 className="text-lg font-semibold mb-2">為 ITZY 留言</h2>
      <input
        type="text"
        placeholder="顯示名稱（可留空）"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="border p-2 mb-2 w-full text-sm"
      />
      <textarea
        placeholder="想說什麼？"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="border p-2 mb-2 w-full text-sm"
      />
      <div className="flex justify-end space-x-2">
        <button onClick={onCancel} className="text-sm px-3 py-1 border rounded">
          取消
        </button>
        <button
          onClick={handleSubmit}
          className="text-sm px-3 py-1 bg-black text-white rounded"
        >
          傳送
        </button>
      </div>
    </div>
  );
}
