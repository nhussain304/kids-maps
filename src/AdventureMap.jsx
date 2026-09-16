import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Heart,
  Users,
  Flag,
  Leaf,
  Ear,
  Check,
  Compass,
  Mountain,
  TreePine,
} from "lucide-react";
import { missions } from "./data";
export const icons = {
  heart: Heart,
  users: Users,
  flag: Flag,
  leaf: Leaf,
  ear: Ear,
};
export function WorldMap({ pick, t }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView(
      [30.5, 70],
      5,
    );
    const tiles = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    ).addTo(map);
    tiles.on("tileerror", () => setFailed(true));
    missions.forEach((m, i) => {
      const marker = L.marker(m.city, {
        icon: L.divIcon({
          className: "city-marker",
          html: `<span>${i + 1}</span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
        title: t(m.place),
        keyboard: true,
      }).addTo(map);
      marker.bindTooltip(t(m.place));
      marker.on("click", () => pick(m));
    });
    return () => map.remove();
  }, [pick, t]);
  return (
    <>
      <div
        className="world-map"
        ref={ref}
        aria-label={t(["Pakistan discovery map", "پاکستان کا معلوماتی نقشہ"])}
      />
      {failed && (
        <p className="map-note">
          {t([
            "Map tiles could not load. You can still choose every mission from the cards below.",
            "نقشے کی تصاویر لوڈ نہیں ہو سکیں۔ نیچے کارڈز سے تمام مشنز کھول سکتے ہیں۔",
          ])}
        </p>
      )}
      <p className="map-note">
        {t([
          "City markers are learning destinations, not meeting points. No travel is needed.",
          "شہر صرف معلوماتی مقامات ہیں، ملاقات کی جگہیں نہیں۔ کہیں جانا ضروری نہیں۔",
        ])}
      </p>
    </>
  );
}
export default function AdventureMap({ done, pick, t }) {
  return (
    <div
      className="adventure-map"
      aria-label={t([
        "Interactive leadership adventure map",
        "لیڈرشپ کا انٹرایکٹو نقشہ",
      ])}
    >
      <svg
        viewBox="0 0 1000 535"
        className="map-art"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="dots"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="#8bbaae" opacity=".2" />
          </pattern>
          <filter id="shadow">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="5"
              floodColor="#739a72"
              floodOpacity=".12"
            />
          </filter>
        </defs>
        <rect width="1000" height="535" fill="#e5efdf" />
        <rect width="1000" height="535" fill="url(#dots)" />
        <path
          d="M-30 20C200 150 180-40 400 15S810 40 1030-30V-50H-30Z"
          fill="#cfdfc3"
        />
        <path
          d="M-70 340C120 220 70 450 330 440S410 630 800 490 960 460 1060 480V600H-70Z"
          fill="#cddfc1"
        />
        <path
          d="M-50 440C160 330 350 570 485 394S580 283 658 355 808 300 940 374 1080 310 1100 300"
          stroke="#bbdbe0"
          strokeWidth="65"
          fill="none"
        />
        <path
          d="M-50 440C160 330 350 570 485 394S580 283 658 355 808 300 940 374 1080 310 1100 300"
          stroke="#d4e9e9"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M240 278Q260 165 450 176T720 134Q835 210 700 342T430 407Q260 380 240 278"
          stroke="#fffaf0"
          strokeWidth="19"
          fill="none"
        />
        <path
          d="M240 278Q260 165 450 176T720 134Q835 210 700 342T430 407Q260 380 240 278"
          stroke="#c8b991"
          strokeWidth="2"
          strokeDasharray="5 9"
          fill="none"
        />
        <g fill="#b3cca0" opacity=".7">
          <ellipse cx="150" cy="120" rx="72" ry="48" />
          <ellipse cx="860" cy="230" rx="66" ry="44" />
          <ellipse cx="310" cy="470" rx="58" ry="26" />
        </g>
        <g filter="url(#shadow)">
          <path d="m590 90 48-73 50 73z" fill="#9daa98" />
          <path d="m644 104 67-94 72 94z" fill="#bac3af" />
          <path d="m689 42 22-32 23 32-18-8-9 12-8-12z" fill="#fffaf0" />
          <path d="m621 42 17-25 17 25-10-3-9 8-7-10z" fill="#fffaf0" />
        </g>
        <g stroke="#597e5d" strokeWidth="5" strokeLinecap="round">
          <path d="M145 236v30m-32-105v25m725 197v28m43-292v23m-695 296v21m370-307v20" />
        </g>
        <g fill="#83a981">
          <path d="m145 192-22 49h44z" />
          <path d="m113 129-18 36h36z" />
          <path d="m838 341-22 46h44z" />
          <path d="m881 86-18 38h36z" />
          <path d="m186 387-19 38h38z" />
          <path d="m556 79-18 38h36z" />
        </g>
        <g fill="#fffaf0" opacity=".9">
          <ellipse cx="325" cy="68" rx="32" ry="12" />
          <ellipse cx="349" cy="65" rx="24" ry="16" />
          <ellipse cx="846" cy="66" rx="32" ry="12" />
        </g>
        <g fill="#dea995">
          <circle cx="297" cy="313" r="4" />
          <circle cx="307" cy="324" r="4" />
          <circle cx="285" cy="328" r="4" />
          <circle cx="758" cy="420" r="4" />
          <circle cx="769" cy="412" r="4" />
        </g>
        <g transform="translate(531 338) rotate(30)">
          <rect x="-27" y="-18" width="54" height="36" rx="4" fill="#b79971" />
          <path
            d="M-18-18v36M-6-18v36M6-18v36M18-18v36"
            stroke="#e9d5ae"
            strokeWidth="3"
          />
        </g>
      </svg>
      <div className="map-caption">
        <span className="status-dot" />
        {t(["YOUR LEADERSHIP WORLD", "آپ کی لیڈرشپ کی دنیا"])}
      </div>
      <div className="compass">
        <Compass size={35} />
        <small>N</small>
      </div>
      {missions.map((m, i) => {
        const Icon = icons[m.icon];
        return (
          <button
            key={m.id}
            className={`map-pin pin-${m.id} ${done.includes(m.id) ? "complete" : ""}`}
            style={{
              left: `${m.pos[0]}%`,
              top: `${m.pos[1]}%`,
              "--pin": m.color,
            }}
            onClick={() => pick(m)}
            aria-label={`${t(m.name)}${done.includes(m.id) ? t([" completed", " مکمل"]) : ""}`}
          >
            <span className="pin-ring">
              <Icon size={25} />
              {done.includes(m.id) && (
                <span className="pin-check">
                  <Check size={12} />
                </span>
              )}
            </span>
            <span className="pin-label">{t(m.name)}</span>
            <span className="pin-number">0{i + 1}</span>
          </button>
        );
      })}
      <div className="map-bottom">
        <span>
          <Mountain size={14} />
          {t([
            "Small adventures. Big possibilities.",
            "چھوٹی مہم، بڑے امکانات۔",
          ])}
        </span>
        <span>
          <TreePine size={15} />
          {t(["Explore at your pace", "اپنی رفتار سے سیکھیں"])}
        </span>
      </div>
    </div>
  );
}
