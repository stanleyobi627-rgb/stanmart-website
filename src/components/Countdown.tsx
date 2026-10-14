import { useEffect, useState } from "react";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function targetDate() {
  const now = Date.now();
  const week = Math.ceil(now / WEEK_MS) * WEEK_MS;
  return week === now ? week + WEEK_MS : week;
}

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function partsFrom(ms: number): Parts {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export default function Countdown() {
  const [target] = useState(targetDate);
  const [parts, setParts] = useState(() => partsFrom(target - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => setParts(partsFrom(target - Date.now())), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const blocks: [string, number][] = [
    ["Days", parts.days],
    ["Hours", parts.hours],
    ["Mins", parts.minutes],
    ["Secs", parts.seconds],
  ];

  return (
    <div className="countdown">
      {blocks.map(([label, value]) => (
        <div key={label} className="countdown-block">
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
