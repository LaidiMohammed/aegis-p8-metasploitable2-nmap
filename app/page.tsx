import TopologyConsole from "@/components/TopologyConsole";
import Reveal from "@/components/Reveal";

const FUNCS = [
  ["nmap_scan_target", "nmap -sV -p- -oX sur la cible locale"],
  ["parse_nmap_xml", "Parse XML → services (port, produit, version)"],
  ["nvd_cves_by_keyword", "API NVD v2 keywordSearch par produit/version"],
  ["run_audit", "Scan + CVE + top scores + sévérités"],
];

export default function Page() {
  return (
    <main className="topo min-h-screen bg-deep">
      <nav className="sticky top-0 z-40 border-b border-edge bg-deep/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#top" className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded bg-iris font-mono text-xs font-bold text-deep">P8</span><span className="coord text-slate-300">TOPOLOGY · NMAP / METASPLOITABLE2</span></a>
          <div className="hidden gap-7 md:flex">{[["#map","Carte"],["#fonctions","Fonctions"],["#demo","Démo"],["#ethique","Éthique"]].map(([h,l])=><a key={h} href={h} className="coord text-slate-400 hover:text-iris">{l}</a>)}</div>
          <a href="https://github.com/LaidiMohammed/aegis-p8-metasploitable2-nmap" target="_blank" rel="noreferrer" className="rounded border border-edge px-3 py-1.5 font-mono text-[11px] text-slate-300 hover:border-iris hover:text-iris">GitHub ↗</a>
        </div>
      </nav>

      <section id="top" className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:py-20">
        <div>
          <Reveal><div className="mb-5 flex items-center gap-3"><span className="h-px w-12 bg-iris"/><span className="coord text-iris">Fiche technique · P8</span></div></Reveal>
          <Reveal delay={70}><h1 className="font-display text-5xl font-extrabold leading-[1.02] sm:text-6xl">Cartographie<br/><span className="text-iris">des services</span><br/>Nmap</h1></Reveal>
          <Reveal delay={140}><p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400">Scan de la VM <b className="text-slate-200">Metasploitable2</b> : ports ouverts, produits/versions, puis correspondance avec les CVE de la base <b className="text-slate-200">NVD</b>.</p></Reveal>
          <Reveal delay={210}><div className="mt-8 flex flex-wrap gap-3"><a href="#map" className="rounded bg-iris px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-deep hover:bg-white">Voir la carte ↓</a><a href="#fonctions" className="rounded border border-edge px-6 py-3 font-mono text-xs uppercase tracking-widest text-slate-300 hover:border-iris">Les fonctions</a></div></Reveal>
          <Reveal delay={280}><div className="mt-10 grid grid-cols-4 gap-4 border-t border-edge pt-6">{[["05","services"],["05","CVEs"],["09","tests mocks"],["00","prod"]].map(([n,l])=><div key={l}><div className="font-display text-2xl font-extrabold text-white">{n}</div><div className="coord text-slate-500">{l}</div></div>)}</div></Reveal>
        </div>
        <Reveal delay={120}><TopologyConsole /></Reveal>
      </section>

      <section id="fonctions" className="mx-auto max-w-7xl px-5 py-14">
        <Reveal><span className="coord text-iris">01 / Fonctions</span><h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Du scan au CVE</h2></Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {FUNCS.map(([n,d],i)=><Reveal key={n} delay={i*70}><div className="rounded-xl border border-edge bg-card p-5"><div className="flex items-center gap-3"><span className="coord text-lime">0{i+1}</span><span className="font-mono text-sm text-iris">{n}</span></div><p className="mt-2 text-xs text-slate-400">{d}</p></div></Reveal>)}
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-7xl px-5 py-14">
        <Reveal><span className="coord text-iris">02 / Démonstration</span><h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Commandes</h2></Reveal>
        <div className="mt-8 space-y-2 rounded-xl border border-edge bg-card p-5 text-xs">
          {["python -m src.metasploitable2_nmap_main --target 127.0.0.1 --host-nmap 192.168.56.101 --save-json outputs/results.json --pdf outputs/rapport-p8.pdf","python -m src.metasploitable2_nmap_main --mock-audit --save-json outputs/results.json --pdf outputs/rapport-p8-mock.pdf"].map(c=><div key={c} className="rounded border border-edge bg-deep px-4 py-3 font-mono text-slate-300"><span className="text-iris">$</span> {c}</div>)}
        </div>
      </section>

      <section id="ethique" className="mx-auto max-w-7xl px-5 py-14">
        <Reveal><span className="coord text-iris">03 / Éthique</span><h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Cible autorisée</h2></Reveal>
        <div className="mt-6 rounded-xl border-l-2 border-iris bg-card p-6"><p className="text-sm leading-relaxed text-slate-400">Scan <b className="text-slate-200">uniquement</b> sur la VM locale Metasploitable2 (192.168.56.x) en réseau isolé. Aucun scan d'un système tiers — labo, 0 GPU, 0 cloud.</p></div>
      </section>

      <footer className="border-t border-edge bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-10">
          <div><div className="font-display text-2xl font-extrabold">P8 <span className="text-iris">/ TOPOLOGY</span></div><div className="coord mt-1 text-slate-500">Master 1 PFE · Laidi Mohammed · 2026</div></div>
          <div className="flex gap-5 font-mono text-xs text-slate-400"><a href="https://github.com/LaidiMohammed/aegis-p8-metasploitable2-nmap" target="_blank" rel="noreferrer" className="hover:text-iris">GitHub ↗</a><a href="https://aegis-p8-metasploitable2-nmap.vercel.app" className="hover:text-iris">Vercel ↗</a></div>
        </div>
      </footer>
    </main>
  );
}

