import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Spotlight on machined panels
    document.querySelectorAll<HTMLElement>('.machined-panel').forEach(card => {
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    });

    // Reveal on scroll
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
    }, { threshold: 0.05 });
    document.querySelectorAll('.reveal-3d').forEach(el => observer.observe(el));
    document.querySelectorAll('.reveal-text').forEach(el => el.classList.add('active'));
    setTimeout(() => {
      document.querySelectorAll<HTMLElement>('section:first-of-type .reveal-3d').forEach(el => el.classList.add('active'));
    }, 150);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="text-zinc-800">
      {/* Nav */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
        <div className="machined-panel px-6 py-3 flex items-center justify-between w-full max-w-6xl pointer-events-auto shadow-2xl">
          <div className="text-xl font-black text-zinc-950 tracking-tighter flex items-center gap-2 uppercase">
            <span className="text-amber-400 text-2xl">◎</span>
            Voice<span className="text-emerald-500">Qual</span>
          </div>
          <div className="hidden md:flex gap-10 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <a href="#" className="hover:text-zinc-950 transition-colors">Platform</a>
            <a href="#" className="hover:text-zinc-950 transition-colors">Features</a>
            <a href="#" className="hover:text-zinc-950 transition-colors">Pricing</a>
            <a href="#" className="hover:text-zinc-950 transition-colors">Docs</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hidden md:block text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-950 transition-colors">Sign In</a>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-zinc-950 text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-md">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="relative w-full overflow-x-hidden">
        {/* Hero */}
        <section className="relative min-h-screen flex items-center pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            <div className="max-w-2xl">
              <h1 className="reveal-text text-6xl md:text-[80px] font-black text-zinc-950 tracking-tighter leading-[0.95] mb-8 uppercase overflow-hidden">
                <span style={{ transitionDelay: '0.1s' }}>Qualify</span><br/>
                <span style={{ transitionDelay: '0.2s' }}>every</span><br/>
                <span style={{ transitionDelay: '0.3s' }} className="text-amber-400">lead.</span>
              </h1>
              <p className="reveal-3d text-lg text-zinc-500 mb-10 font-medium leading-relaxed max-w-md">
                VoiceQual automates BANT-based qualification through AI voice calls. Hot leads go to your CRM the moment a call ends.
              </p>
              <div className="reveal-3d flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-zinc-950 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-amber-400 transition-colors">
                  Open Dashboard
                </button>
                <button className="machined-panel text-zinc-950 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white transition-colors">
                  ▶ Watch 2-Min Demo
                </button>
              </div>
              <div className="reveal-3d flex items-center gap-8 mt-10 pt-8 border-t border-zinc-200/50">
                <div>
                  <div className="text-2xl font-black text-zinc-900">&lt; 5 min</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">To First Call</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-zinc-900">14 pt</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Avg BANT Lift</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600">3×</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Pipeline ROI</div>
                </div>
              </div>
            </div>

            {/* 3D Hero Stage */}
            <div ref={heroRef} className="reveal-3d relative h-[500px] flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Center orb */}
                <div className="absolute z-40 w-32 h-32 rounded-full bg-zinc-900 flex items-center justify-center shadow-2xl border-4 border-emerald-500/20" style={{ animation: 'float-slow 4s infinite ease-in-out' }}>
                  <span className="text-5xl">📞</span>
                  <div className="absolute inset-0 rounded-full border border-amber-500/40 animate-ping" style={{ animationDuration: '2.5s' }} />
                </div>
                {/* Message pills */}
                <div className="message-pill top-[15%] left-[0%]" style={{ animation: 'orbit-pop 8s infinite ease-in-out', animationDelay: '0s' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block align-middle mr-1.5 animate-pulse" />
                  Priya Menon — Infosys: <span className="text-emerald-600">HOT (9.1)</span>
                </div>
                <div className="message-pill bottom-[20%] right-[0%]" style={{ animation: 'orbit-pop 9s infinite ease-in-out', animationDelay: '2.5s' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block align-middle mr-1.5 animate-pulse" />
                  Arjun Sharma — Wipro: <span className="text-emerald-600">HOT (8.5)</span>
                </div>
                <div className="message-pill top-[35%] right-[0%]" style={{ animation: 'orbit-pop 7s infinite ease-in-out', animationDelay: '5s' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block align-middle mr-1.5 animate-pulse" />
                  Calls Made Today: 990
                </div>
                <div className="message-pill bottom-[10%] left-[20%]" style={{ animation: 'orbit-pop 8.5s infinite ease-in-out', animationDelay: '1.5s' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block align-middle mr-1.5 animate-pulse" />
                  Conversion: 34.7%
                </div>
                {/* Rings */}
                <div className="coil-ring w-60 h-60" style={{ animation: 'rotate-cw 22s linear infinite' }} />
                <div className="coil-ring w-96 h-96 border-zinc-300/60" style={{ animation: 'rotate-ccw 35s linear infinite' }}>
                  <div className="absolute bottom-1/4 right-0 w-4 h-4 bg-amber-400 rounded-full shadow-lg" />
                  <div className="absolute top-1/4 left-0 w-3 h-3 bg-emerald-500 rounded-full shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <section className="py-12 border-y border-zinc-300/40 relative z-10 overflow-hidden bg-white/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
            <div className="text-base font-black tracking-widest uppercase text-zinc-900">Trusted by sales teams worldwide</div>
            <div className="text-xs font-bold tracking-widest text-emerald-600 uppercase mt-2">Over 2,000,000 leads qualified</div>
          </div>
          <div className="mask-edge relative w-full overflow-hidden">
            <div className="flex items-center gap-24 animate-marquee whitespace-nowrap opacity-60 grayscale font-black text-3xl tracking-tight text-zinc-800 w-max">
              {['AUTODESK', 'Dolby', 'SMARTLING', 'Reddit', 'ANTHROPIC', 'DocuSign', 'Vercel', 'Atlassian', 'HubSpot', 'Shopify',
                'AUTODESK', 'Dolby', 'SMARTLING', 'Reddit', 'ANTHROPIC', 'DocuSign', 'Vercel', 'Atlassian', 'HubSpot', 'Shopify'].map((name, i) => (
                <span key={i}>{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
          <div className="reveal-3d mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tighter mb-4 uppercase">Measure the impact.</h2>
            <p className="text-lg text-zinc-500 font-medium">Stop guessing. See exactly how automated qualification accelerates your pipeline.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: '92%', title: 'Lead qualification accuracy', sub: 'AI-scored lead matches', by: 'Apex SaaS', color: 'text-emerald-600' },
              { value: '10×', title: 'More calls per day', sub: 'vs. manual SDR teams', by: 'TechFlow', color: 'text-amber-400' },
              { value: '78%', title: 'Lower cost per qualified lead', sub: 'Automated conversations', by: 'GrowthEdge', color: 'text-emerald-600' },
            ].map((s, i) => (
              <div key={i} className="machined-panel p-8 flex flex-col justify-between h-56 reveal-3d">
                <div>
                  <div className={`text-7xl font-black tracking-tighter leading-none mb-4 ${s.color}`}>{s.value}</div>
                  <h3 className="text-lg text-zinc-900 font-bold leading-tight">{s.title}</h3>
                  <p className="text-sm text-zinc-500 font-medium mt-1">{s.sub}</p>
                </div>
                <div className="mt-5 text-sm font-bold text-zinc-400">{s.by}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-24 px-6 max-w-7xl mx-auto text-center relative z-10">
          <div className="reveal-3d mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-950 mb-4 uppercase">
              Complete voice AI platform,<br />
              <span className="text-emerald-600">lead to qualified pipeline.</span>
            </h2>
            <p className="text-lg text-zinc-500 font-medium max-w-xl mx-auto">
              Powered by conversational AI that sounds human and qualifies like your best SDR.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { icon: '📞', title: 'AI Voice Engine', desc: 'Make natural, human-like qualification calls automatically to every lead.', tag: '24/7 Calling', color: 'text-emerald-400' },
              { icon: '📊', title: 'Smart Lead Scoring', desc: 'Automatically score each lead as HOT, WARM, or COLD based on call analysis.', tag: 'Auto-classification', color: 'text-amber-400' },
              { icon: '🎙️', title: 'Call Intelligence', desc: 'Full transcripts, sentiment analysis, and AI-generated summaries for every call.', tag: 'Full transcripts', color: 'text-emerald-400' },
              { icon: '🔗', title: 'CRM Pipeline', desc: 'Push qualified leads directly to your CRM with scores, transcripts, and actions.', tag: 'CRM auto-sync', color: 'text-amber-400' },
            ].map((f, i) => (
              <div key={i} className="machined-panel p-8 flex flex-col items-center text-center reveal-3d">
                <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-md">{f.icon}</div>
                <h3 className="text-xl font-black tracking-tighter text-zinc-900 mb-3 uppercase">{f.title}</h3>
                <p className="text-sm text-zinc-500 font-medium">{f.desc}</p>
                <div className={`mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-bold ${f.color} tracking-wide uppercase`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />{f.tag}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Before/After */}
        <section className="py-20 px-6 max-w-7xl mx-auto relative z-10">
          <div className="machined-panel p-12 reveal-3d bg-zinc-950 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)] pointer-events-none" />
            <h3 className="text-2xl font-black text-white uppercase tracking-widest text-center mb-10 relative z-10">Built for teams that move fast</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-800">
              {[
                { label: 'Lead response time', stat: '−94%', from: '4.2 hrs', to: '4 min', color: 'text-emerald-500' },
                { label: 'Qualified leads/rep/week', stat: '+3×', from: '18', to: '54', color: 'text-amber-400' },
                { label: 'CRM data completeness', stat: '+61 pts', from: '38%', to: '99%', color: 'text-emerald-500' },
              ].map((item, i) => (
                <div key={i} className="pt-6 md:pt-0">
                  <div className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">{item.label}</div>
                  <div className={`text-5xl font-black mb-4 ${item.color}`}>{item.stat}</div>
                  <div className="flex items-center justify-center gap-4 text-sm font-bold">
                    <span className="line-through text-zinc-600">{item.from}</span>
                    <span>→</span>
                    <span>{item.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-32 px-6 max-w-7xl mx-auto relative z-10">
          <div className="reveal-3d mb-16 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tighter mb-4 uppercase">Transparent Pricing.</h2>
            <p className="text-lg text-zinc-500 font-medium max-w-2xl mx-auto">Pay for the intelligence you use. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto reveal-3d">
            <div className="machined-panel p-10 flex flex-col h-full bg-white/80">
              <div className="mb-8">
                <span className="px-3 py-1 rounded bg-zinc-100 border border-zinc-200 text-zinc-600 text-[10px] font-black tracking-widest uppercase mb-4 inline-block">Growth</span>
                <h3 className="text-5xl font-black text-zinc-950 tracking-tighter mb-2">₹29,990<span className="text-xl text-zinc-500 font-bold">/mo</span></h3>
                <p className="text-sm text-zinc-500 font-medium">Includes 2,000 qualified calls per month.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {['Standard AI Voice Models', 'Real-time BANT Scoring', 'Native CRM Integrations', 'Basic Pipeline Analytics'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-zinc-700">
                    <span className="text-emerald-500 text-xl">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-white text-zinc-950 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest border border-zinc-300 hover:bg-zinc-100 transition-colors">
                Start 14-Day Trial
              </button>
            </div>
            <div className="machined-panel p-10 flex flex-col h-full bg-zinc-950 border-zinc-800 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.15)_0%,_transparent_60%)] pointer-events-none" />
              <div className="relative z-10 mb-8">
                <span className="px-3 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black tracking-widest uppercase mb-4 inline-block">Enterprise</span>
                <h3 className="text-5xl font-black text-white tracking-tighter mb-2">Custom</h3>
                <p className="text-sm text-zinc-400 font-medium">Volume-based pricing for massive scale.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1 relative z-10">
                {['Custom Voice Cloning', 'Advanced Routing Logic', 'SOC 2 Type II Compliance', 'Dedicated Success Manager'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                    <span className="text-amber-400 text-xl">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-emerald-500 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-colors relative z-10">
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 relative z-10 mb-10">
          <div className="max-w-4xl mx-auto">
            <div className="machined-panel p-12 md:p-24 text-center reveal-3d bg-white/80 shadow-2xl">
              <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Live in under 60 minutes</div>
              <h2 className="text-5xl md:text-[60px] font-black text-zinc-950 tracking-tighter leading-[1.0] mb-8 uppercase">
                Start qualifying<br />leads today.
              </h2>
              <p className="text-zinc-500 mb-12 font-medium max-w-md mx-auto text-sm leading-relaxed">
                Connect your CRM, configure rules, and go live. No engineering required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-zinc-950 text-white px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-amber-400 transition-colors">
                  Open Dashboard
                </button>
                <button className="bg-transparent border-2 border-zinc-300 text-zinc-900 px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-100 transition-colors">
                  Book a demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-20 pb-10 border-t border-zinc-300/50 relative z-10 bg-white/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
              <div className="col-span-2">
                <div className="text-xl font-black text-zinc-950 tracking-tighter uppercase flex items-center gap-2 mb-4">
                  <span className="text-amber-400 text-2xl">◎</span>
                  Voice<span className="text-emerald-500">Qual</span>
                </div>
                <p className="text-sm font-medium text-zinc-500 max-w-xs">Automated BANT qualification for high-velocity sales teams.</p>
              </div>
              {[
                { heading: 'Product', links: ['Features', 'Integrations', 'Pricing', 'Changelog'] },
                { heading: 'Resources', links: ['Documentation', 'API Reference', 'Status', 'Support'] },
                { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              ].map(col => (
                <div key={col.heading}>
                  <div className="text-xs font-black uppercase tracking-widest text-zinc-950 mb-6">{col.heading}</div>
                  <ul className="space-y-4 text-sm font-medium text-zinc-500">
                    {col.links.map(l => <li key={l}><a href="#" className="hover:text-amber-500 transition-colors">{l}</a></li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-200/60 text-xs font-bold text-zinc-400 uppercase tracking-widest gap-4">
              <div>© 2026 VoiceQual AI. All rights reserved.</div>
              <div className="flex gap-6">
                <a href="#" className="hover:text-zinc-800 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-zinc-800 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-zinc-800 transition-colors">Security</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
