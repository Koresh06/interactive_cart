import { useState, useRef, useEffect } from "react";
import "./Map.css";

const stands = [
  {
    id: "texha",
    x: 80,
    y: 30,
    width: 500,
    height: 80,
    color: "orange",
    title: "ТЕХНА",
    company: "ООО ТЕХНА",
  },
  {
    id: "free1",
    x: 30,
    y: 140,
    width: 75,
    height: 120,
    color: "lightgray",
    title: "Свободно",
    company: "",
  },
  {
    id: "free2",
    x: 30,
    y: 300,
    width: 75,
    height: 120,
    color: "lightgray",
    title: "Свободно",
    company: "",
  },
  {
    id: "rsxi",
    x: 700,
    y: 60,
    width: 80,
    height: 400,
    color: "lightblue",
    title: "РСХИ",
    company: "OOO РСХИ",
  },
];

const companies = {
  ТЕХНА: {
    name: "ООО ТЕХНА",
    logo: "",
    description: "Компания основана бла блаб лабла",
    site: "#",
    phone: "+777777777777",
  },
  РСХИ: {
    name: "СТЕНД РСХИ",
    logo: "",
    description: "Компания основана бла блаб лабла",
    site: "#",
    phone: "+7777777777",
  },
  Свободно: {
    name: "Свободно",
    logo: "",
    description: "Доступно для бронирования",
    site: "",
    phone: "",
  },
};

function InfoBlock({
  company,
  onClose,
}: {
  company: keyof typeof companies;
  onClose: () => void;
}) {
  const info = companies[company];
  return (
    <div className="infoblock-overlay" onClick={onClose}>
      <div className="infoblock" onClick={(e) => e.stopPropagation()}>
        <div className="infoblock-header">
          <span className="infoblock-title">{info.name}</span>
          {info.logo && (
            <img
              src={info.logo}
              alt={company + " logo"}
              className="infoblock-logo"
            />
          )}
        </div>
        <div className="infoblock-desc">{info.description}</div>
        {info.site && (
          <div className="infoblock-link">
            <a href={info.site} target="_blank" rel="noopener noreferrer">
              ссылка на сайт
            </a>
          </div>
        )}
        {info.phone && <div className="infoblock-phone">{info.phone}</div>}
        <button className="infoblock-close" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}

const Map = () => {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{
    active: boolean;
    startX: number;
    startY: number;
  }>({ active: false, startX: 0, startY: 0 });
  const [infoCompany, setInfoCompany] = useState<
    null | "ТЕХНА" | "РСХИ" | "Свободно"
  >(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // wheel zoom (desktop)
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0012;
    setScale((prev) => Math.min(Math.max(0.95, prev + delta), 1.3));
  };
  // mouse drag (desktop)
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setDrag({
      active: true,
      startX: e.clientX - pos.x,
      startY: e.clientY - pos.y,
    });
  };

  // touch drag & pinch (mobile)
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const lastDist = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      lastTouch.current = {
        x: e.touches[0].clientX - pos.x,
        y: e.touches[0].clientY - pos.y,
      };
      setDrag({
        active: true,
        startX: e.touches[0].clientX - pos.x,
        startY: e.touches[0].clientY - pos.y,
      });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1 && drag.active) {
      setPos({
        x: e.touches[0].clientX - drag.startX,
        y: e.touches[0].clientY - drag.startY,
      });
    } else if (e.touches.length === 2 && lastDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delta = (dist - lastDist.current) * 0.003;
      setScale((prev) => Math.min(Math.max(0.95, prev + delta), 1.3));
      lastDist.current = dist;
    }
  };

  const handleTouchEnd = () => {
    setDrag((d) => ({ ...d, active: false }));
    lastTouch.current = null;
    lastDist.current = null;
  };
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (drag.active) {
        setPos({ x: e.clientX - drag.startX, y: e.clientY - drag.startY });
      }
    };
    const handleMouseUp = () => setDrag((d) => ({ ...d, active: false }));
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [drag]);
  const handleStandClick = (company: string | null) => {
    if (company === "ТЕХНА" || company === "РСХИ" || company === "Свободно")
      setInfoCompany(company);
  };
  const closeInfoBlock = () => setInfoCompany(null);

  return (
    <div className="map-container">
      <svg
        ref={svgRef}
        width="800"
        height="600"
        viewBox="0 0 800 600"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="map-svg"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
        }}
      >
        <rect
          width="800"
          height="600"
          fill="#f0f0f0"
          stroke="#ccc"
          strokeWidth="1"
        />
        {stands.map((s) => (
          <g
            key={s.id}
            id={s.id}
            onClick={() => handleStandClick(s.title)}
            className={
              s.title === "ТЕХНА" || s.title === "РСХИ"
                ? "stand-interactive"
                : "stand"
            }
          >
            <rect
              x={s.x}
              y={s.y}
              width={s.width}
              height={s.height}
              fill={s.color}
              stroke="black"
            />
            <text x={s.x + 10} y={s.y + 30} fontSize="14" fill="black">
              {s.title}
            </text>
            <text
              x={s.x + 10}
              y={s.y + s.height - 15}
              fontSize="12"
              fill="black"
            >
              {s.company}
            </text>
          </g>
        ))}
        <rect
          x="300"
          y="540"
          width="200"
          height="40"
          fill="lightgreen"
          stroke="black"
        />
        <text x="370" y="565" fontSize="16" fill="black">
          Вход
        </text>
        <rect
          x="700"
          y="520"
          width="70"
          height="50"
          fill="#e0e0e0"
          stroke="black"
        />
        <text x="715" y="550" fontSize="16" fill="black">
          Туалет
        </text>
      </svg>
      {infoCompany && (
        <InfoBlock company={infoCompany} onClose={closeInfoBlock} />
      )}
    </div>
  );
};

export default Map;
