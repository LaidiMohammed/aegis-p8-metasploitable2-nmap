"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
export default function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const n = ref.current; if (!n) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: .12 });
    o.observe(n); return () => o.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${v ? "in" : ""}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}
