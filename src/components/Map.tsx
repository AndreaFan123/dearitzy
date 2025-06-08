"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { createClient } from "@/utils/supabase/client"; // 確保這個路徑正確指向你的 Supabase 客戶端初始化文件
import MessageForm from "./MessageForm";

interface Message {
  id: string;
  lat: number;
  lng: number;
  message: string;
  display_name?: string;
  created_at: string;
}

// 解決 Marker 圖示錯誤問題（Leaflet 預設圖示載入會出錯）
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Map() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [clickedCoords, setClickedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const supabase = createClient(); // 初始化 Supabase 客戶端

  // 從 Supabase 載入所有留言
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setMessages(data);
    else console.error("讀取留言失敗:", error);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // 地圖點擊處理
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setClickedCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  // 送出留言到 Supabase
  const handleSubmit = async (newMessage: {
    lat: number;
    lng: number;
    message: string;
    display_name?: string;
  }) => {
    const { error } = await supabase.from("messages").insert(newMessage);
    if (error) {
      console.error("送出留言失敗:", error);
      return;
    }
    setClickedCoords(null);
    fetchMessages();
  };

  return (
    <div className="relative w-full h-[80vh] rounded-lg overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />

        {/* 顯示所有留言 */}
        {messages.map((msg) => (
          <Marker key={msg.id} position={[msg.lat, msg.lng]}>
            <Popup>
              <div>
                <p className="font-semibold text-sm">
                  {msg.display_name || "匿名粉絲"}
                </p>
                <p className="text-xs">{msg.message}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* 點擊地圖後顯示留言輸入表單 */}
      {clickedCoords && (
        <MessageForm
          lat={clickedCoords.lat}
          lng={clickedCoords.lng}
          onSubmit={handleSubmit}
          onCancel={() => setClickedCoords(null)}
        />
      )}
    </div>
  );
}
