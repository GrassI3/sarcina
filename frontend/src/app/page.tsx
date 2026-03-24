import ProductivityModule from "@/components/ProductivityModule";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-12 font-sans selection:bg-fuchsia-500/30 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-500/20 via-violet-500/5 to-transparent pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-full h-[500px] bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none mix-blend-screen" />
      
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <ProductivityModule />
      </div>
    </div>
  );
}
