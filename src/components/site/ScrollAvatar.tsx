import { useEffect, useRef, useState } from "react";
import fallbackAvatar from "@/assets/avatar.png";
import { useSection } from "@/lib/cms";

export function ScrollAvatar() {
  const { data: hero } = useSection("hero");
  const { data: msgs } = useSection("avatar_messages");
  const messages = msgs?.items ?? [];
  const avatarUrl = hero?.avatar_url || fallbackAvatar;

  const [msg, setMsg] = useState<string | null>(null);
  const [anim, setAnim] = useState<"" | "animate-avatar-jump" | "animate-avatar-wave">("");
  const [blink, setBlink] = useState(false);
  const lastY = useRef(0);
  const idle = useRef<number | null>(null);
  const msgIdx = useRef(0);
  const hideMsg = useRef<number | null>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const showMsg = () => {
      setMsg(messages[msgIdx.current % messages.length]);
      msgIdx.current += 1;
      if (hideMsg.current) window.clearTimeout(hideMsg.current);
      hideMsg.current = window.setTimeout(() => setMsg(null), 3500);
    };

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      lastY.current = y;
      if (Math.abs(dy) > 60) {
        setAnim("animate-avatar-jump");
        window.setTimeout(() => setAnim(""), 600);
        if (Math.random() > 0.55) showMsg();
      }
      if (idle.current) window.clearTimeout(idle.current);
      idle.current = window.setTimeout(() => {
        setAnim("animate-avatar-wave");
        window.setTimeout(() => setAnim(""), 900);
      }, 2200);
    };

    const blinkTimer = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 180);
    }, 4200);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(blinkTimer);
    };
  }, [messages]);

  const onClick = () => {
    if (messages.length === 0) return;
    setAnim("animate-avatar-wave");
    setMsg(messages[msgIdx.current % messages.length]);
    msgIdx.current += 1;
    window.setTimeout(() => setAnim(""), 900);
    if (hideMsg.current) window.clearTimeout(hideMsg.current);
    hideMsg.current = window.setTimeout(() => setMsg(null), 3500);
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 md:bottom-6 md:right-6">
      {msg && (
        <div className="pointer-events-auto max-w-[220px] animate-float-up rounded-2xl rounded-br-sm border border-border bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-medium">
          {msg}
        </div>
      )}
      <button
        aria-label="Say hi"
        onClick={onClick}
        className={`pointer-events-auto relative grid h-16 w-16 place-items-center rounded-full bg-white shadow-large ring-1 ring-border transition-transform hover:scale-105 md:h-20 md:w-20 ${anim || "animate-avatar-bounce"}`}
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent" />
        <img
          src={avatarUrl}
          alt="Avatar"
          width={80}
          height={80}
          className="h-14 w-14 rounded-full object-cover md:h-16 md:w-16"
          style={{ filter: blink ? "brightness(0.92)" : undefined }}
        />
        <span className="absolute -bottom-0.5 right-1 grid h-4 w-4 place-items-center rounded-full bg-success ring-2 ring-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </span>
      </button>
    </div>
  );
}
