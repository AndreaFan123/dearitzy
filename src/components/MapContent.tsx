"use client";

import { useEffect, useState, useCallback } from "react";
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
import Link from "next/link";

interface IconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}

interface Message {
  id: string;
  lat: number;
  lng: number;
  message: string;
  display_name?: string;
  created_at: string;
}

delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;

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
  const [totalSupport, setTotalSupport] = useState(0);
  const supabase = createClient();

  const handleGeolocationError = useCallback(
    (error: GeolocationPositionError) => {
      console.error("無法取得位置:", error);
      let errorMsg = "無法取得您的位置，請檢查是否允許定位權限或稍後重試。";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = "您拒絕了定位權限，請在瀏覽器設定中啟用定位功能。";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg =
            "定位服務不可用，請確認您的設備是否支援定位或檢查網路連線。";
          break;
        case error.TIMEOUT:
          errorMsg = "取得位置超時，請稍後重試。";
          break;
      }

      setErrorMessage(errorMsg);
      setIsLoading(false);
    },
    []
  );

  const handleGeolocationSuccess = useCallback(
    (position: GeolocationPosition) => {
      setCenter([position.coords.latitude, position.coords.longitude]);
      setIsLoading(false);
    },
    []
  );

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("讀取留言失敗:", error);
      return;
    }

    if (data) {
      setMessages(data);
      setTotalSupport(data.length);
    }
  }, [supabase]);

  const handleMapClick = useCallback(
    (e: { latlng: { lat: number; lng: number } }) => {
      setClickedCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    []
  );

  const handleSubmit = useCallback(
    async (newMessage: {
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
    },
    [supabase, fetchMessages]
  );

  // Initialize geolocation and fetch data
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        handleGeolocationSuccess,
        handleGeolocationError,
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setErrorMessage("您的瀏覽器不支援地理位置功能，請使用支援的瀏覽器。");
      setIsLoading(false);
    }

    fetchMessages();
  }, [handleGeolocationSuccess, handleGeolocationError, fetchMessages]);

  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  return (
    <div className="relative w-full h-[80vh] rounded-lg overflow-hidden">
      <div className="absolute bottom-20 left-4 bg-white px-4 py-2 rounded-full shadow-lg z-[1000] flex items-center gap-2">
        <span className=" text-gray-600 font-semibold">❤️ From</span>
        <span className="font-semibold text-red-600">{totalSupport}</span>
        <span className=" text-gray-600 font-semibold">Mdizies</span>
      </div>
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-full shadow-lg z-[1000] flex items-center gap-2">
        <span className=" text-gray-600">Created by</span>
        <Link
          target="_blank"
          href="https://github.com/AndreaFan123/dearitzy"
          className=" text-pink-600 font-semibold underline"
        >
          A.F(Give me a star on GitHub!)
        </Link>
      </div>

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
