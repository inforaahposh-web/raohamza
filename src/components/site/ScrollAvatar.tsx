import { useEffect, useRef, useState } from "react";
import fallbackAvatar from "@/assets/avatar-cutout.png";
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
    <div className="scroll-avatar-root pointer-events-none fixed bottom-2 right-2 z-50 flex max-w-[min(42vw,9rem)] flex-col items-end gap-2 sm:max-w-none md:bottom-4 md:right-4">
      {msg && (
        <div className="pointer-events-auto max-w-[min(70vw,220px)] animate-float-up rounded-2xl rounded-br-sm border border-border bg-white px-3 py-2 text-sm font-medium text-ink shadow-medium sm:px-4 sm:py-2.5">
          {msg}
        </div>
      )}
      <button
        type="button"
        aria-label="Say hi"
        onClick={onClick}
        className={`avatar-cutout-btn pointer-events-auto relative ${anim || "animate-avatar-bounce"}`}
      >
        <img
          src={avatarUrl}
          alt="Rao Hamza mascot"
          width={120}
          height={195}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="avatar-cutout-img"
          style={{ filter: blink ? "brightness(0.94)" : undefined }}
        />
        <span className="avatar-cutout-online" aria-hidden>
          <span className="avatar-cutout-online-dot" />
        </span>
      </button>
    </div>
  );
}
