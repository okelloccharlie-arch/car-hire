import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 4500);
    const doneTimer = setTimeout(() => onFinish(), 5000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  const dots = Array.from({ length: 8 });

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white px-6 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <img src="/splash.png" alt="SmartRental" className="h-auto w-64 max-w-full sm:w-80 md:w-96" />

      <div className="relative mt-8 h-10 w-10">
        {dots.map((_, i) => {
          const angle = (360 / dots.length) * i;
          return (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-orange-500"
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(18px)`,
                animation: "splash-dot-fade 1.2s linear infinite",
                animationDelay: `${(i * 1.2) / dots.length}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}