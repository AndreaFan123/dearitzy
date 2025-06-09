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
import { createClient } from "@/utils/supabase/client";
import MessageForm from "./MessageForm";

interface Message {
  id: string;
  lat: number;
  lng: number;
  message: string;
  display_name?: string;
  created_at: string;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;

const emojiIcon = L.divIcon({
  html: "👑",
  className: "emoji-icon",
  iconSize: [30, 30],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

export default function MapContent() {
  const [center, setCenter] = useState<[number, number]>([20, 0]);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [clickedCoords, setClickedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
          setIsLoading(false);
        },
        (error) => {
          console.error("無法取得位置:", error);
          let errorMsg =
            "無法取得您的位置，請檢查是否允許定位權限或稍後重試。 Can't get your location, please check if you have allowed location permissions or try again later.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg =
                "您拒絕了定位權限，請在瀏覽器設定中啟用定位功能。 You denied the location permission, please enable location services in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg =
                "定位服務不可用，請確認您的設備是否支援定位或檢查網路連線。 Location services are unavailable, please check if your device supports location or check your network connection.";
              break;
            case error.TIMEOUT:
              errorMsg =
                "取得位置超時，請稍後重試。 Location request timed out, please try again later.";
              break;
          }
          setErrorMessage(errorMsg);
          setIsLoading(false);
        },
        { timeout: 10000, enableHighAccuracy: true } // Added options for timeout and accuracy
      );
    } else {
      console.log("瀏覽器不支援地理位置");
      setErrorMessage("您的瀏覽器不支援地理位置功能，請使用支援的瀏覽器。");
      setIsLoading(false);
    }
  }, []);

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

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setClickedCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  const handleSubmit = async (newMessage: {
    lat: number;
    lng: number;
    message: string;
    display_name?: string;
  }) => {
    const { error } = await supabase.from("messages").insert(newMessage);
    if (error) {
      console.error("送出留言失敗(Fail to send message, try later):", error);
      return;
    }
    setClickedCoords(null);
    fetchMessages();
  };

  return (
    <div className="relative w-full h-[80vh] rounded-lg overflow-hidden">
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center">
          <p>讀取位置中(Check location...)</p>
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="absolute top-4 left-4 bg-red-500 text-white p-4 rounded-lg z-10">
              {errorMessage}
            </div>
          )}
          <MapContainer
            center={center}
            zoom={2}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler />
            {messages.map((msg) => (
              <Marker
                key={msg.id}
                position={[msg.lat, msg.lng]}
                icon={emojiIcon}
              >
                <Popup>
                  <div>
                    <p className="font-semibold text-sm">
                      {msg.display_name || "匿名粉絲(Hidden Fan)"}
                    </p>
                    <p className="text-xs">{msg.message}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </>
      )}
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
