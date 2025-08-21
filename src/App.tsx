import React, { useEffect, useMemo, useState } from "react";

// ===== Meta helpers & smoke tests =====
function useMeta(title: string, description: string) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
  }, [title, description]);
}

function useSmoke() {
  useEffect(() => {
    const must = [
      '#intro', '#glance', '#why', '#defs', '#comparison', '#capacity-cost', '#reliability', '#data-recovery', '#durability', '#quiz', '#laptop', '#pros-cons', '#use-cases', '#use-gaming', '#use-creators', '#use-families', '#use-nas', '#use-hybrid', '#brand', '#capacity-infographic', '#conclusion', '#faqs', '#references', '#learn-more'
    ];
    must.forEach((sel) => console.assert(!!document.querySelector(sel), `Section ${sel} should exist`));
    const ctas = document.querySelectorAll('#use-cases a');
    console.assert(ctas.length >= 4, 'CTAs present for each use case');
    console.log('%cSmoke: sections & CTAs mounted', 'color:#16a34a');
  }, []);
}

// ===== UI atoms =====
const Check = () => (
  <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19l12-12-1.4-1.4z"/></svg>
);
const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex gap-2"><Check/>{children}</li>
);
const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">{children}</span>
);
const ImageFrame = ({ src, alt, caption }: { src?: string; alt: string; caption?: string }) => (
  <figure className="rounded-3xl overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm">
    <div className="aspect-[16/9] w-full bg-slate-100 flex items-center justify-center">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover"/>
      ) : (
        <svg viewBox="0 0 400 225" className="w-full h-full text-slate-300" role="img" aria-label={alt}>
          <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0%" stopColor="#e2e8f0"/><stop offset="100%" stopColor="#f8fafc"/></linearGradient></defs>
          <rect width="400" height="225" fill="url(#g)"/>
          <g fill="currentColor" opacity=".5"><circle cx="110" cy="110" r="56"/><rect x="180" y="70" width="170" height="90" rx="12"/></g>
        </svg>
      )}
    </div>
    {caption && <figcaption className="p-3 text-sm text-slate-600">{caption}</figcaption>}
  </figure>
);

function BarChart({ rows }: { rows: Array<{ label: string; ssd: number; hdd: number }> }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-sky-600"/> SSD (relative cost)</div>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-emerald-600"/> HDD (relative cost)</div>
      </div>
      <div className="mt-4 space-y-4">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[5rem,1fr] items-center gap-3">
            <div className="text-sm text-slate-700">{r.label}</div>
            <div className="space-y-1">
              <div className="h-3 rounded-full bg-sky-100" aria-label={`SSD relative cost at ${r.label}`}>
                <div className="h-3 rounded-full bg-sky-600" style={{ width: `${r.ssd}%` }} />
              </div>
              <div className="h-3 rounded-full bg-emerald-100" aria-label={`HDD relative cost at ${r.label}`}>
                <div className="h-3 rounded-full bg-emerald-600" style={{ width: `${r.hdd}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-600 mt-3">Illustrative only; pricing varies by model, region, and capacity point.</div>
    </div>
  );
}

function WhichDriveQuiz() {
  const [answers, setAnswers] = useState<{ budget?: string; primaryUse?: string; capacity?: string; portability?: string }>({});
  const set = (k: keyof typeof answers, v: string) => setAnswers((s) => ({ ...s, [k]: v }));
  const result = useMemo(() => {
    const { budget, primaryUse, capacity, portability } = answers;
    if (!budget || !primaryUse || !capacity || !portability) return null;
    const preferSSD = (primaryUse === 'os' || primaryUse === 'editing') && budget !== 'tight' && portability !== 'stationary';
    const preferHDD = capacity === 'multiTB' || budget === 'tight' || primaryUse === 'archive' || portability === 'stationary';
    if (preferSSD && !preferHDD) return { title: 'Recommendation: SSD', desc: 'Use an SSD for OS/apps and time‑sensitive tasks. Pair with an HDD for libraries/backups.' };
    if (preferHDD && !preferSSD) return { title: 'Recommendation: HDD', desc: 'Choose a high‑capacity HDD for multi‑terabyte value—ideal for libraries, backups, NAS, and archives.' };
    return { title: 'Recommendation: Hybrid (SSD + HDD)', desc: 'SSD for OS/apps + HDD for mass storage gives the best balance of speed, capacity, and cost.' };
  }, [answers]);
  const pill = (active: boolean) => active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50";
  const Opt = ({name, options}:{name:keyof typeof answers; options:[string,string][]}) => (
    <div>
      <label className="text-sm font-medium text-slate-900 capitalize">{name}</label>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map(([v,l]) => (
          <button key={v} onClick={() => set(name, v)} className={`px-3 py-1.5 rounded-full border ${pill(answers[name]===v)}`}>{l}</button>
        ))}
      </div>
    </div>
  );
  return (
    <section className="rounded-3xl border border-slate-200 p-8 bg-white shadow-sm">
      <div className="flex items-center gap-2"><Pill>Interactive</Pill><h2 className="text-2xl font-semibold">Which Drive is Right for You? (Quiz)</h2></div>
      <p className="text-slate-800 mt-2">Answer a few quick questions and get a personalized recommendation.</p>
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Opt name="budget" options={[["tight","Tight"],["moderate","Moderate"],["flexible","Flexible"]]} />
        <Opt name="primaryUse" options={[["os","OS & apps"],["gaming","Gaming"],["editing","Photo/Video Editing"],["archive","Archiving/Backups"]]} />
        <Opt name="capacity" options={[["sub1TB","Up to 1TB"],["oneToFour","1–4TB"],["multiTB","8TB and up"]]} />
        <Opt name="portability" options={[["stationary","Desktop/NAS (stationary)"],["mobile","Laptop/on‑the‑go"]]} />
      </div>
      {result && (
        <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-base font-semibold text-slate-900">{result.title}</div>
          <div className="text-slate-800 mt-1">{result.desc}</div>
        </div>
      )}
    </section>
  );
}

// ===== Page =====
export default function HDDvsSSDPage() {
  useMeta(
    'HDD vs. SSD: How to Choose the Right Drive for Your Data',
    'Comparing HDDs and SSDs? Learn why hard drives offer unmatched capacity and value for your games, photos, and files. Discover the smart way to store your data.'
  );
  useSmoke();

  const imgs = {
    blue: 'https://www.westerndigital.com/content/dam/store/en-us/assets/solutions/ssd-vs-hdd/ssd-vs-hdd-ssd-hdd.png.wdthumb.1280.1280.webp',
    black: 'https://www.westerndigital.com/content/dam/store/en-us/assets/products/internal-storage/wd-black-desktop-sata-hdd/gallery/wd-black-desktop-4tb.png.thumb.1280.1280.png',
    red: 'https://www.westerndigital.com/content/dam/store/en-us/assets/products/internal-storage/wd-red-plus-sata-3-5-hdd/gallery/wd-red-plus-sata-3-5-hdd-2tb.png.thumb.1280.1280.png',
    gold: 'https://www.westerndigital.com/content/dam/store/en-us/assets/products/internal-storage/wd-gold-sata-hdd/gallery/WD-GOLD-1TB.png.thumb.1280.1280.png'
  };

  const MenuIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header / Nav */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 font-bold tracking-tight text-slate-900" aria-label="Western Digital">
            <svg viewBox="0 0 32 32" className="w-7 h-7 fill-slate-900" aria-hidden="true"><rect x="2" y="6" width="28" height="20" rx="4"/></svg>
            <span>WD Knowledge Hub</span>
          </a>
          <nav aria-label="Primary" className="hidden md:flex items-center gap-6 text-[15px]">
            <a className="hover:text-slate-900 text-slate-700" href="#glance">Compare</a>
            <a className="hover:text-slate-900 text-slate-700" href="#why">Why it matters</a>
            <a className="hover:text-slate-900 text-slate-700" href="#defs">HDD & SSD</a>
            <a className="hover:text-slate-900 text-slate-700" href="#comparison">Comparison</a>
            <a className="hover:text-slate-900 text-slate-700" href="#capacity-cost">Capacity & Cost</a>
            <a className="hover:text-slate-900 text-slate-700" href="#reliability">Reliability</a>
            <a className="hover:text-slate-900 text-slate-700" href="#data-recovery">Data Recovery</a>
            <a className="hover:text-slate-900 text-slate-700" href="#durability">Durability</a>
            <a className="hover:text-slate-900 text-slate-700" href="#quiz">Quiz</a>
            <a className="hover:text-slate-900 text-slate-700" href="#use-cases">Use Cases</a>
            <a className="hover:text-slate-900 text-slate-700" href="#faqs">FAQs</a>
            <a className="hover:text-slate-900 text-slate-700" href="#references">References</a>
          </nav>
          <button onClick={()=>setMenuOpen((v)=>!v)} className="md:hidden p-2 rounded border border-slate-300 text-slate-800"><MenuIcon/></button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-3 grid grid-cols-2 gap-3 text-sm">
              {['glance','why','defs','comparison','capacity-cost','reliability','data-recovery','durability','quiz','use-cases','faqs','references'].map(id=> (
                <a key={id} href={`#${id}`} className="py-2 text-slate-800">{id.replace('-', ' ')}</a>
              ))}
            </div>
          </div>
        )}
      </header>
      {/* Spacer for fixed header */}
      <div aria-hidden className="h-16" />

      {/* HERO */}
      <section id="intro" className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 via-white to-white"/>
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <div className="text-sm text-slate-700">Updated: August 2025</div>
              <h1 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">SSD vs HDD: Which Storage is Right for You?</h1>
              <p className="mt-5 text-lg text-slate-800 max-w-2xl">Choosing the right storage drive is one of the most important decisions you'll make for your computer. The <strong>SSD vs HDD</strong> debate affects everything from startup speed to reliability. Looking for lightning‑fast performance or maximum capacity on a budget? This guide makes the trade‑offs clear so you can pick with confidence.</p>
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-600"><Pill>HDD vs. SSD: How to Choose the Right Drive for Your Data</Pill></div>
            </div>
            <div className="flex-1 w-full">
              <ImageFrame src={imgs.blue} alt="WD Blue HDD product image" caption="Capacity & value vs. speed & latency"/>
            </div>
          </div>
        </div>
      </section>

      {/* TL;DR */}
      <section id="glance" className="relative isolate">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-semibold">SSD vs HDD at a glance</h2>
            <p className="mt-3 text-slate-700">A quick side‑by‑side to steer your decision.</p>
            <div className="mt-5 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-800"><tr><th className="p-4">Factor</th><th className="p-4">SSD</th><th className="p-4">HDD</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="p-4">Speed/Latency</td><td className="p-4 flex items-center gap-2"><Check/> <span>Winner</span></td><td className="p-4">—</td></tr>
                  <tr><td className="p-4">Capacity per Drive</td><td className="p-4">—</td><td className="p-4 flex items-center gap-2"><Check/> <span>Winner (10–20+ TB)</span></td></tr>
                  <tr><td className="p-4">Cost per GB</td><td className="p-4">—</td><td className="p-4 flex items-center gap-2"><Check/> <span>Winner</span></td></tr>
                  <tr><td className="p-4">Data Recovery Pathways</td><td className="p-4">More complex</td><td className="p-4">Mature ecosystem</td></tr>
                  <tr><td className="p-4">Best For</td><td className="p-4">OS/apps, active projects</td><td className="p-4">Libraries, <a className="underline" href="https://www.westerndigital.com/solutions/home-backup-solutions">backups</a>, <a className="underline" href="https://www.westerndigital.com/solutions/network-attached-storage">NAS</a>, <a className="underline" href="https://www.westerndigital.com/solutions/surveillance">surveillance</a>, <a className="underline" href="https://www.westerndigital.com/solutions/color-drives">scale</a></td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm"><div className="text-xs uppercase tracking-wide text-slate-600">Speed</div><div className="text-2xl font-semibold text-slate-900 mt-1">SSD boots in seconds</div></div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm"><div className="text-xs uppercase tracking-wide text-slate-600">Capacity</div><div className="text-2xl font-semibold text-slate-900 mt-1">HDD up to 22TB+</div></div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm"><div className="text-xs uppercase tracking-wide text-slate-600">Value</div><div className="text-2xl font-semibold text-slate-900 mt-1">Lowest $/GB = HDD</div></div>
          </aside>
        </div>
      </section>

      {/* Why Choosing the Right Storage Matters */}
      <section id="why" className="relative isolate bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold">Why Choosing the Right Storage Matters</h2>
            <ul className="grid gap-3 text-slate-800">
              <Bullet><span className="font-semibold">Speed for tasks.</span>&nbsp;Keep your OS and apps snappy.</Bullet>
              <Bullet><span className="font-semibold">Capacity for life.</span>&nbsp;Store years of photos, videos, and games.</Bullet>
              <Bullet><span className="font-semibold">Value for budget.</span>&nbsp;Maximize space without overspending.</Bullet>
            </ul>
          </div>
          <ImageFrame src={imgs.gold} alt="WD Gold HDD product image"/>
        </div>
      </section>

      {/* What is HDD / SSD */}
      <section id="defs" className="relative isolate">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">What is an HDD (Hard Disk Drive)?</h2>
            <p className="text-slate-800 leading-relaxed">A hard disk drive is the proven workhorse of storage—spinning platters store your data while a moving head reads and writes. Perfected over decades for reliability and capacity, HDDs are the backbone for data centers, creative studios, and home libraries.</p>
          </div>
          <ImageFrame src={imgs.gold} alt="WD Gold HDD product image" caption="The workhorse for massive, affordable capacity"/>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-16 grid lg:grid-cols-2 gap-12 items-start">
          <ImageFrame src={imgs.black} alt="WD_BLACK HDD product image" caption="Solid‑state speed for OS and apps"/>
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">What is an SSD (Solid State Drive)?</h2>
            <p className="text-slate-800 leading-relaxed">A solid state drive stores data in flash memory with no moving parts. Benefits include rapid access times, silent operation, and low latency—excellent for operating systems, apps, and active projects. HDDs still lead for large‑scale, cost‑efficient storage.</p>
          </div>
        </div>
      </section>

      {/* Comparison intro + table */}
      <section id="comparison" className="relative isolate bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold">SSD vs HDD Comparison</h2>
          <p className="mt-2 text-slate-700">Different tools for different jobs. Here’s how to think about the trade‑offs.</p>
          <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-800"><tr><th className="p-4">Factor</th><th className="p-4">SSD</th><th className="p-4">HDD</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="p-4">Speed & Performance</td><td className="p-4">Boot/app load speed</td><td className="p-4">Great for large libraries, streaming</td></tr>
                <tr><td className="p-4">Capacity per Drive</td><td className="p-4">—</td><td className="p-4">10–20+ TB options</td></tr>
                <tr><td className="p-4">Cost per GB</td><td className="p-4">Higher</td><td className="p-4">Lower</td></tr>
                <tr><td className="p-4">Recovery</td><td className="p-4">Complex when controller fails</td><td className="p-4">Mature services exist</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Capacity & Cost */}
      <section id="capacity-cost" className="relative isolate">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-semibold">Capacity & Cost‑Per‑Gigabyte</h2>
            <p className="mt-2 text-slate-800">For mass storage at 4TB, 8TB, 16TB and beyond, HDDs offer outstanding value per gigabyte. SSDs deliver speed, but cost scales faster at high capacities.</p>
            <ul className="mt-3 grid gap-2 text-slate-800">
              <Bullet><span className="font-semibold">Cost curve:</span>&nbsp;SSD $/GB rises sharply above 4TB; HDD remains economical up to 20TB+.</Bullet>
              <Bullet><span className="font-semibold">Workload fit:</span>&nbsp;SSD for frequent random I/O; HDD for sequential media & archives.</Bullet>
              <Bullet><span className="font-semibold">Practical pick:</span>&nbsp;Hybrid—OS on SSD, libraries/backups on HDD.</Bullet>
            </ul>
          </div>
          <div>
            <BarChart rows={[{ label: '4TB', ssd: 80, hdd: 35 }, { label: '8TB', ssd: 85, hdd: 30 }, { label: '16TB', ssd: 90, hdd: 25 }]} />
          </div>
        </div>
      </section>

      {/* Reliability */}
      <section id="reliability" className="relative isolate bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">Lifespan & Reliability</h2>
            <ul className="grid gap-2 text-slate-800">
              <Bullet><span className="font-semibold">HDD:</span>&nbsp;Mature tech with predictable failure modes (MTBF). Often shows early warnings (SMART, bad sectors).</Bullet>
              <Bullet><span className="font-semibold">SSD:</span>&nbsp;Finite write endurance (TBW). Controller/firmware faults may be abrupt and unrecoverable.</Bullet>
              <Bullet><span className="font-semibold">Best practice:</span>&nbsp;Monitor SMART, keep firmware current, and maintain backups regardless of drive type.</Bullet>
            </ul>
          </div>
          <ImageFrame src={imgs.gold} alt="Reliability considerations"/>
        </div>
      </section>

      {/* Data Recovery */}
      <section id="data-recovery" className="relative isolate">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <ImageFrame src={imgs.blue} alt="Data recovery pathways"/>
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">Data Recovery</h2>
            <ul className="grid gap-2 text-slate-800">
              <Bullet><span className="font-semibold">HDD:</span>&nbsp;Multiple professional recovery paths (head swap, platter transplant, firmware service).</Bullet>
              <Bullet><span className="font-semibold">SSD:</span>&nbsp;Controller failures and wear‑leveling can complicate or prevent recovery.</Bullet>
              <Bullet><span className="font-semibold">Plan:</span>&nbsp;Back up proactively—recovery should be last resort.</Bullet>
            </ul>
          </div>
        </div>
      </section>

      {/* Durability */}
      <section id="durability" className="relative isolate bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">Durability & Shock</h2>
            <ul className="grid gap-2 text-slate-800">
              <Bullet><span className="font-semibold">SSD:</span>&nbsp;No moving parts, strong shock resistance—ideal for laptops and mobile workflows.</Bullet>
              <Bullet><span className="font-semibold">HDD:</span>&nbsp;For stationary desktops/NAS, mechanical nature is a non‑issue; value & capacity dominate.</Bullet>
              <Bullet><span className="font-semibold">Tip:</span>&nbsp;Use proper mounting and avoid movement while powered.</Bullet>
            </ul>
          </div>
          <ImageFrame src={imgs.red} alt="Durability considerations"/>
        </div>
      </section>

      {/* Quiz */}
      <section id="quiz" className="relative isolate">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <WhichDriveQuiz />
        </div>
      </section>

      {/* Laptop */}
      <section id="laptop" className="relative isolate bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">Laptop HDD vs SSD</h2>
            <h3 className="text-xl font-semibold">Which is better for laptops?</h3>
            <p className="text-slate-800">Most laptops use internal SSDs for responsiveness—but often with limited capacity. Pair with a high‑capacity, portable external HDD to store large libraries and backups.</p>
            <a href="https://www.westerndigital.com/solutions/home-backup-solutions" className="inline-block mt-1"><span className="px-4 py-2 rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800 transition">Never Run Out of Space. Explore Portable HDDs.</span></a>
          </div>
          <ImageFrame src={imgs.blue} alt="External HDD with laptop"/>
        </div>
      </section>

      {/* Pros & Cons */}
      <section id="pros-cons" className="relative isolate">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold">SSD vs HDD Pros and Cons</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold">SSD</h3>
              <ul className="mt-4 space-y-2 text-slate-800">
                <Bullet>Speedy boots and loads</Bullet>
                <Bullet>Silent, low power, no moving parts</Bullet>
                <Bullet>Great for OS/apps and active projects</Bullet>
              </ul>
              <div className="mt-4 h-px bg-slate-200"/>
              <div className="mt-4 text-slate-700"><span className="font-medium">Trade‑offs:</span> higher cost/GB, finite write cycles (TBW), controller failures can be abrupt.</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold">HDD</h3>
              <ul className="mt-4 space-y-2 text-slate-800">
                <Bullet>Massive capacities (10–20+ TB)</Bullet>
                <Bullet>Best $/GB for libraries and backups</Bullet>
                <Bullet>Mature data recovery ecosystem</Bullet>
              </ul>
              <div className="mt-4 h-px bg-slate-200"/>
              <div className="mt-4 text-slate-700"><span className="font-medium">Trade‑offs:</span> slower seeks/latency, mechanical wear, audible noise, higher power draw.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases — each its own section (images + CTAs) */}
      <section id="use-cases" className="relative isolate bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <h2 className="text-3xl font-semibold">Which is Better? Matching the Drive to Your Needs</h2>

          {/* Gaming */}
          <section id="use-gaming" className="pt-2">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="text-2xl font-semibold">For Gamers</h3>
                <p className="mt-2 text-slate-800">Balance speed with space so you can play more and shuffle less.</p>
                <ul className="mt-3 grid gap-2 text-slate-800">
                  <Bullet><span className="font-semibold">SSD:</span>&nbsp;Install your OS and the 3–5 titles you play most for instant level loads.</Bullet>
                  <Bullet><span className="font-semibold">HDD:</span>&nbsp;Keep the rest of your Steam/Epic library ready without constant uninstalls.</Bullet>
                  <Bullet><span className="font-semibold">Hybrid tip:</span>&nbsp;Move games between drives using the launcher to avoid re‑downloads.</Bullet>
                </ul>
                <div className="mt-4 flex gap-3">
                  <a href="https://www.westerndigital.com/solutions/gaming" className="inline-flex px-4 py-2 rounded-xl border border-slate-300 text-slate-900 hover:bg-white">Gaming setup guidance</a>
                </div>
              </div>
              <ImageFrame src={imgs.black} alt="Gaming setup with SSD + HDD" caption="SSD for the games you launch daily; HDD for the whole library"/>
            </div>
          </section>

          {/* Creators */}
          <section id="use-creators">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <ImageFrame src={imgs.gold} alt="Creator workspace with scratch SSD and archive HDD" caption="Fast scratch on SSD, affordable archives on HDD"/>
              <div>
                <h3 className="text-2xl font-semibold">For Content Creators</h3>
                <p className="mt-2 text-slate-800">Keep active timelines fast while controlling storage costs on large media.</p>
                <ul className="mt-3 grid gap-2 text-slate-800">
                  <Bullet><span className="font-semibold">SSD:</span>&nbsp;Use as a scratch/work drive for current edits and exports.</Bullet>
                  <Bullet><span className="font-semibold">HDD:</span>&nbsp;Archive raw footage, proxies, and completed projects at scale.</Bullet>
                  <Bullet><span className="font-semibold">Workflow:</span>&nbsp;SSD (working set) → HDD (archive) → cloud/off‑site (backup).</Bullet>
                </ul>
                <div className="mt-4 flex gap-3">
                  <a href="https://www.westerndigital.com/solutions/creative-professionals" className="inline-flex px-4 py-2 rounded-xl border border-slate-300 text-slate-900 hover:bg-white">Creator workflow tips</a>
                </div>
              </div>
            </div>
          </section>

          {/* Families / Everyday */}
          <section id="use-families">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="text-2xl font-semibold">For Families & Everyday Use</h3>
                <p className="mt-2 text-slate-800">Make space for years of photos, school projects, and home videos—without slowing your PC.</p>
                <ul className="mt-3 grid gap-2 text-slate-800">
                  <Bullet><span className="font-semibold">SSD:</span>&nbsp;Speed up an older laptop for day‑to‑day responsiveness.</Bullet>
                  <Bullet><span className="font-semibold">HDD:</span>&nbsp;Store the growing photo/video library affordably.</Bullet>
                  <Bullet><span className="font-semibold">Backup rule:</span>&nbsp;Follow 3‑2‑1—3 copies, 2 media, 1 off‑site.</Bullet>
                </ul>
                <div className="mt-4 flex gap-3">
                  <a href="https://www.westerndigital.com/solutions/home-backup-solutions" className="inline-flex px-4 py-2 rounded-xl border border-slate-300 text-slate-900 hover:bg-white">Home backup how‑to</a>
                </div>
              </div>
              <ImageFrame src={imgs.blue} alt="Family backup workflow" caption="Simple, roomy backups the whole household can rely on"/>
            </div>
          </section>

          {/* NAS / Home Server */}
          <section id="use-nas">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <ImageFrame src={imgs.red} alt="NAS with multiple HDD bays" caption="HDDs for bulk storage; SSDs can accelerate cache or VMs"/>
              <div>
                <h3 className="text-2xl font-semibold">For NAS & Home Servers</h3>
                <p className="mt-2 text-slate-800">Build a personal cloud that balances capacity and responsiveness.</p>
                <ul className="mt-3 grid gap-2 text-slate-800">
                  <Bullet><span className="font-semibold">HDD:</span>&nbsp;Purpose‑built for multi‑drive, 24/7 environments; best for bulk media and backups.</Bullet>
                  <Bullet><span className="font-semibold">SSD:</span>&nbsp;Use for cache tiers, metadata, or light VM workloads.</Bullet>
                  <Bullet><span className="font-semibold">Practice:</span>&nbsp;Plan RAID + backups; test restore regularly.</Bullet>
                </ul>
                <div className="mt-4 flex gap-3">
                  <a href="https://www.westerndigital.com/solutions/network-attached-storage" className="inline-flex px-4 py-2 rounded-xl border border-slate-300 text-slate-900 hover:bg-white">NAS planning guide</a>
                </div>
              </div>
            </div>
          </section>

          {/* Hybrid */}
          <section id="use-hybrid">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="text-2xl font-semibold">The Hybrid Approach: Using Both SSD and HDD</h3>
                <p className="mt-2 text-slate-800">Get speed where it’s felt and space where it’s needed—this is the most common, cost‑effective setup.</p>
                <ul className="mt-3 grid gap-2 text-slate-800">
                  <Bullet>Your OS & apps on an SSD (250GB–1TB) for responsiveness.</Bullet>
                  <Bullet>Your life on an HDD—photos, videos, games, archives—so you never run out of space.</Bullet>
                </ul>
                <div className="mt-4 flex gap-3">
                  <a href="https://www.westerndigital.com/solutions/color-drives" className="inline-flex px-4 py-2 rounded-xl border border-slate-300 text-slate-900 hover:bg-white">Explore drive options</a>
                </div>
              </div>
              <ImageFrame src={imgs.black} alt="Hybrid desktop with SSD + HDD" caption="A practical balance for most builders"/>
            </div>
          </section>
        </div>
      </section>

      {/* Brand trust with monochrome icons */}
      <section id="brand" className="relative isolate">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold text-center">Why Trust Western Digital Hard Drives?</h2>
          <div className="mt-8 grid md:grid-cols-4 gap-8 text-center">
            {/* Reliability */}
            <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
              <svg className="w-10 h-10 mx-auto text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z"/></svg>
              <h3 className="mt-3 font-semibold">Reliability</h3>
              <p className="text-slate-600 text-sm mt-1">Decades of proven performance across consumer and enterprise.</p>
            </div>
            {/* Innovation */}
            <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
              <svg className="w-10 h-10 mx-auto text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2a7 7 0 017 7c0 2.9-1.9 4.7-3.2 6-.8.8-1.3 1.6-1.6 2.5H9.8c-.3-.9-.8-1.7-1.6-2.5C6.9 13.7 5 11.9 5 9a7 7 0 017-7z"/><path d="M9 22h6"/></svg>
              <h3 className="mt-3 font-semibold">Innovation</h3>
              <p className="text-slate-600 text-sm mt-1">Continuous R&D pushes capacity and endurance forward.</p>
            </div>
            {/* Global scale */}
            <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
              <svg className="w-10 h-10 mx-auto text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18"/></svg>
              <h3 className="mt-3 font-semibold">Global Scale</h3>
              <p className="text-slate-600 text-sm mt-1">Trusted worldwide for personal and business storage.</p>
            </div>
            {/* Support */}
            <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
              <svg className="w-10 h-10 mx-auto text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9 12h.01M15 12h.01M8 16h8"/></svg>
              <h3 className="mt-3 font-semibold">Support</h3>
              <p className="text-slate-600 text-sm mt-1">Documentation and service when you need it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capacity infographic */}
      <section id="capacity-infographic" className="relative isolate bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold">How Much Can You Store on HDDs</h2>
          <div className="mt-6 p-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <p className="text-slate-800">What does an 18TB drive hold?</p>
            <div className="mt-5 grid md:grid-cols-3 gap-6 text-slate-900">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center"><span className="text-3xl font-bold">4,500+</span><div className="mt-1 text-sm text-slate-700">hours of HD video</div></div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center"><span className="text-3xl font-bold">3.6M+</span><div className="mt-1 text-sm text-slate-700">photos (at 5MB each)</div></div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center"><span className="text-3xl font-bold">~12,000</span><div className="mt-1 text-sm text-slate-700">indie games (~1.5GB each)</div></div>
            </div>
            <div className="text-xs text-slate-600 mt-3">Illustrative only; sizes vary by title, codec, resolution, and format.</div>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section id="conclusion" className="relative isolate">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold">Conclusion: Build Your Storage Foundation Wisely</h2>
          <p className="mt-3 text-slate-800 max-w-3xl">There’s no single “best” drive for every task. Use the right tool for the job: SSDs for operating systems and active workloads, HDDs for affordable, scalable capacity. The most common—and smartest—setup is a hybrid that delivers speed where it’s felt and space where it’s needed.</p>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="relative isolate bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold">FAQs</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {[
              ['What lasts longer HDD or SSD?','HDDs have predictable, mechanical wear and published MTBF figures; SSDs have finite write endurance (TBW) and can fail without warning. With backups, both can serve for years—choose based on workload and capacity needs.'],
              ['Is HDD worth it over SSD?','For multi‑terabyte libraries and backups, HDDs offer unmatched value per gigabyte. SSDs are ideal where speed is the top priority.'],
              ['Should I buy an external SSD or HDD?','Portable SSDs are great for speed‑sensitive workflows; portable HDDs maximize capacity and value for media libraries and backups.'],
              ['Can you have both an SSD and HDD?','Absolutely. Many users boot from an SSD and store large files on a high‑capacity HDD for the best mix of performance and cost.'],
              ['Is it better to store photos on SSD or HDD?','For active editing, SSD scratch space helps. For archiving large photo libraries, HDDs provide exceptional capacity‑per‑dollar. Always back up.'],
              ['What’s the hybrid setup you recommend?','SSD (250GB–1TB) for OS/apps + large HDD for media, projects, and backups.']
            ].map(([q,a]) => (
              <details key={q as string} className="group rounded-2xl border border-slate-200 p-5 bg-white shadow-sm">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-900">{q as string}</span>
                  <svg className="w-4 h-4 text-slate-700 group-open:rotate-45 transition" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/></svg>
                </summary>
                <div className="mt-2 text-slate-800">{a as string}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* References & Methodology */}
      <section id="references" className="relative isolate">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold">References & Methodology</h2>
          <p className="mt-3 text-slate-800">Comparisons reflect common workloads (OS boot, app loads, large‑file storage), typical capacity points (1–20TB), and prevailing market cost bands at time of writing. Consult drive spec sheets and independent benchmarks for exact figures.</p>
          <ul className="mt-3 list-disc pl-6 text-slate-800 space-y-1">
            <li>Refer to spec sheets, whitepapers, and product pages for TBW/MTBF and performance profiles.</li>
            <li>Cross‑reference independent benchmarks where applicable.</li>
          </ul>
          <p className="mt-2 text-xs text-slate-600">Disclaimers: Results vary by configuration and workload. Performance and endurance depend on model, capacity, environment, and use.</p>
        </div>
      </section>

      {/* Learn more */}
      <section id="learn-more" className="relative isolate bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold">Learn more about Western Digital's HDDs</h2>
          <ul className="mt-6 grid md:grid-cols-2 gap-3 text-slate-900 underline">
            <li><a href="https://www.westerndigital.com/solutions/thunderbolt-vs-usb-c">Thunderbolt vs USB‑C</a></li>
            <li><a href="https://www.westerndigital.com/solutions/network-attached-storage">Network Attached Storage</a></li>
            <li><a href="https://www.westerndigital.com/solutions/data-security">Data Security</a></li>
            <li><a href="https://www.westerndigital.com/solutions/color-drives">Color Drives</a></li>
            <li><a href="https://www.westerndigital.com/solutions/home-backup-solutions">Home Backup Solutions</a></li>
            <li><a href="https://www.westerndigital.com/solutions/gaming">Gaming</a></li>
            <li><a href="https://www.westerndigital.com/solutions/creative-professionals">Creative Professionals</a></li>
            <li><a href="https://www.westerndigital.com/solutions/raid">RAID</a></li>
            <li><a href="https://www.westerndigital.com/solutions/surveillance">Surveillance</a></li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10 text-sm text-slate-800">
          <div>
            <div className="font-semibold text-slate-900 mb-3">Products</div>
            <ul className="space-y-2">
              <li><a className="hover:underline" href="https://www.westerndigital.com/solutions/color-drives">WD Blue</a></li>
              <li><a className="hover:underline" href="https://www.westerndigital.com/solutions/gaming">WD_BLACK</a></li>
              <li><a className="hover:underline" href="https://www.westerndigital.com/solutions/network-attached-storage">WD Red</a></li>
              <li><a className="hover:underline" href="https://www.westerndigital.com/solutions/surveillance">WD Purple</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-3">Solutions</div>
            <ul className="space-y-2">
              <li><a className="hover:underline" href="#use-cases">Use Cases</a></li>
              <li><a className="hover:underline" href="#references">Documentation</a></li>
              <li><a className="hover:underline" href="#faqs">FAQs</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-3">Company</div>
            <ul className="space-y-2">
              <li><a className="hover:underline" href="#">About</a></li>
              <li><a className="hover:underline" href="#">Careers</a></li>
              <li><a className="hover:underline" href="#">Newsroom</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-3">Get Started</div>
            <a href="https://www.westerndigital.com/solutions/color-drives" className="inline-flex px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800">Shop HDDs</a>
          </div>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-600">© {new Date().getFullYear()} Western Digital. All rights reserved.</div>
      </footer>
    </div>
  );
}
