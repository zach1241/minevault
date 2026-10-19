import Link from 'next/link';
import {Camera,CheckCircle2,Download,FileJson,Images,ShieldCheck,ArrowLeft} from 'lucide-react';

export const metadata = {
  title: 'MineVault Beta | Save Your Minecraft Moments',
  description: 'Minecraft Java Edition 1.21.1 capture beta. Press J to save moments and K to skip, then import them into your private journal.',
};

const steps = [
  {icon: Download, title: 'Install the mod', copy: 'Minecraft Java Edition 1.21.1, Fabric Loader, and Fabric API are needed. Download the JAR from the successful GitHub Actions build.'},
  {icon: Camera, title: 'Capture your moment', copy: 'When an advancement appears, MineVault asks for confirmation. Press J to Save Moment or K to Skip. It never uploads anything on its own.'},
  {icon: FileJson, title: 'Open your captures folder', copy: 'Find the matching .json and .png in .minecraft/minevault/captures/. The event date, Minecraft day, XYZ, online players and perspective are saved locally.'},
  {icon: Images, title: 'Import into your journal', copy: 'Open a world, select Add Memory, import the JSON metadata, attach the matching PNG, then save. A Supabase-connected vault is required for permanent cloud storage.'},
];

export default function BetaPage() {
  return (
    <main className="min-h-dvh bg-[#101411] text-[#eeeee6]">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#b5d99b] hover:underline"><ArrowLeft size={16}/> Back to MineVault</Link>
        <div className="mt-14 max-w-3xl">
          <span className="rounded-full border border-[#4d6747] bg-[#223522] px-3 py-1 text-xs font-semibold uppercase tracking-[.22em] text-[#b5d99b]">Capture-first beta · v0.1</span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">Every world has a story. <span className="text-[#b5d99b]">Keep yours.</span></h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#abb5aa]">A no-payment beta for Minecraft Java Edition. Capture achievements only when you confirm them, and keep the moment with its exact in-game location, event time, and players online.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="https://github.com/zach1241/minevault/actions/runs/39243642299" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#b5d99b] px-5 py-3 font-semibold text-[#172017]"><Download size={18}/> Get beta mod build</a>
            <a href="https://github.com/zach1241/minevault/blob/beta/capture-first-v0-1/docs/BETA.md" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[#566550] px-5 py-3 font-semibold">Read installation guide</a>
          </div>
        </div>
        <section className="mt-16 grid gap-4 sm:grid-cols-2">
          {steps.map(({icon:Icon,title,copy},i)=><article key={title} className="rounded-xl border border-[#303b32] bg-[#1a211b] p-6">
            <div className="flex items-center justify-between text-[#b5d99b]"><Icon size={23}/><span className="text-sm opacity-60">0{i+1}</span></div>
            <h2 className="mt-5 text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#abb5aa]">{copy}</p>
          </article>)}
        </section>
        <aside className="mt-10 rounded-xl border border-[#4b5d48] bg-[#202c20] p-6">
          <div className="flex items-center gap-2 text-[#b5d99b]"><ShieldCheck size={20}/><h2 className="font-semibold">Your choice, your privacy</h2></div>
          <p className="mt-3 text-sm leading-7 text-[#cbd4c6]">Skip does not save a screenshot. The mod writes files to your computer only after Save Moment. Coordinates and player names can be sensitive, so do not share manifests publicly without reviewing them. The screenshot is taken when you confirm, not at the earlier advancement event.</p>
          <p className="mt-3 flex items-start gap-2 text-sm text-[#cbd4c6]"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#b5d99b]"/> There is no payment gateway or subscription requirement in this beta.</p>
        </aside>
      </div>
    </main>
  );
}
