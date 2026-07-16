export default function Pricing() {
  return (
    <div className="min-h-screen bg-white font-['Inter'] px-10 py-24 max-w-[640px] mx-auto text-center">
      <p className="text-[13px] text-[#86868B] tracking-[0.3px] mb-5">Pricing</p>
      <h1 className="text-[40px] font-semibold tracking-[-1.5px] text-[#1D1D1F] mb-6">
        Free while we build.
      </h1>
      <p className="text-[16px] text-[#86868B] leading-relaxed mb-10">
        FormulaLabs is free for every student right now — formula sheets, Formula Finder,
        everything. A premium tier is coming later for teachers and advanced features,
        but the core tool stays free for students.
      </p>
      
        <a href="/login"
        className="inline-block bg-[#1D1D1F] text-white px-10 py-4 rounded-full text-[15px] hover:bg-black transition-colors"
      >
        Get started free
      </a>
    </div>
  )
}
