import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, useInView, useSpring, useTransform, useScroll } from "framer-motion";
import { PhoneCall, Zap, Target, Users, Lightbulb, Check } from "lucide-react";

// ── Framer Motion Variants ──
const fadeUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } } };
const fadeScale = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] as const } } };
const stagger = { hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const slideLeft = { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } } };
const slideRight = { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } } };

// ── Scroll Progress Bar ──
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: '0%',
        background: 'linear-gradient(90deg, #1F8A70, #D4AF37, #28B893)',
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 2, zIndex: 9999, pointerEvents: 'none',
      }}
    />
  );
}

// ── 3D Scroll Card ──
function ScrollReveal3D({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: 15, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const }}
      style={{ transformPerspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

// ── Animated Counter Component ──
function AnimatedValue({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const springVal = useSpring(0, { duration: 2000, bounce: 0 });

  useEffect(() => {
    if (isInView) springVal.set(value);
  }, [isInView, value, springVal]);

  useEffect(() => {
    const unsubscribe = springVal.on("change", (v: number) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
    return unsubscribe;
  }, [springVal, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

// ── Waveform Component ──
const WAVE_HEIGHTS = [45, 80, 60, 95, 50, 70, 40, 85, 55];
function Waveform({ bars = 5, color = 'var(--emerald-teal)' }: { bars?: number; color?: string }) {
  return (
    <div className="flex items-end gap-[2px] h-5">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="waveform-bar"
          style={{
            background: color,
            height: `${WAVE_HEIGHTS[i % WAVE_HEIGHTS.length]}%`,
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Floating Particles Layer ──
function FloatingParticles() {
  const particles = Array.from({ length: 18 }).map((_, i) => {
    const type = i % 3 === 0 ? 'gold' : i % 3 === 1 ? 'emerald' : 'diamond';
    const size = 3 + Math.random() * 5;
    const anim = i % 3 === 0 ? 'float-particle' : i % 3 === 1 ? 'float-particle-reverse' : 'float-particle-drift';
    return {
      type,
      size,
      left: `${5 + Math.random() * 90}%`,
      top: `${10 + Math.random() * 80}%`,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 6,
      anim,
    };
  });

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className={`particle particle--${p.type}`}
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            animation: `${p.anim} ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Ambient Orbs Layer ──
function AmbientOrbs() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="ambient-orb ambient-orb--gold" style={{ width: 400, height: 400, top: '10%', left: '-5%', animationDelay: '0s' }} />
      <div className="ambient-orb ambient-orb--emerald" style={{ width: 500, height: 500, top: '50%', right: '-10%', animationDelay: '3s' }} />
      <div className="ambient-orb ambient-orb--moss" style={{ width: 350, height: 350, bottom: '10%', left: '30%', animationDelay: '6s' }} />
    </div>
  );
}

export default function LandingPage() {
  const [, navigate] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);

  // ── Scroll-driven hero parallax ──
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.92]);



  useEffect(() => {
    // Spotlight on machined panels
    document.querySelectorAll<HTMLElement>('.machined-panel, .premium-card').forEach(card => {
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    });

    // Removed custom cursor logic
    const parallaxLayers = document.querySelectorAll<HTMLElement>('.parallax-layer');
    const handleScroll = () => {
      const scrolled = window.scrollY;
      parallaxLayers.forEach(layer => {
        const speed = layer.getAttribute('data-speed');
        if (speed) {
          const yPos = scrolled * parseFloat(speed);
          layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
      });
    };
    window.addEventListener('scroll', handleScroll);

    const heroStage = document.getElementById('hero-3d-stage');
    const handleHeroMove = (e: MouseEvent) => {
      if (heroStage) {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * -20;
        heroStage.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
      }
    };
    window.addEventListener('mousemove', handleHeroMove);

    document.querySelectorAll<HTMLElement>('.magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const inner = btn.querySelector('.magnetic-btn-inner') as HTMLElement;
        if (inner) {
          inner.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        }
      });
      btn.addEventListener('mouseleave', () => {
        const inner = btn.querySelector('.magnetic-btn-inner') as HTMLElement;
        if (inner) {
          inner.style.transform = 'translate(0px, 0px)';
        }
      });
    });

    // Reveal on scroll
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
    }, { threshold: 0.02 });
    document.querySelectorAll('.reveal-3d, .reveal-slide-left, .reveal-slide-right, .reveal-scale').forEach(el => observer.observe(el));
    document.querySelectorAll('.reveal-text').forEach(el => el.classList.add('active'));
    setTimeout(() => {
      document.querySelectorAll<HTMLElement>('section:first-of-type .reveal-3d').forEach(el => el.classList.add('active'));
    }, 150);

    // Safety fallback: ensure everything is visible after 3s
    const safetyTimer = setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.reveal-3d, .reveal-slide-left, .reveal-slide-right, .reveal-scale, .reveal-text').forEach(el => {
        el.classList.add('active');
      });
      document.querySelectorAll<HTMLElement>('.feature-card-wrap').forEach(el => {
        el.classList.add('card-visible');
      });
      document.querySelectorAll<HTMLElement>('.mockup-child').forEach(el => {
        el.style.opacity = '1';
      });
    }, 3000);

    // Feature card stagger reveal
    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('card-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.feature-card-wrap').forEach(el => cardObserver.observe(el));

    // 3D Tilt Cards
    document.querySelectorAll<HTMLElement>('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (y - 0.5) * 12;
        const tiltY = (x - 0.5) * -12;
        const inner = card.querySelector('.tilt-card-inner') as HTMLElement;
        if (inner) {
          inner.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        }
        card.style.setProperty('--shine-x', `${x * 100}%`);
        card.style.setProperty('--shine-y', `${y * 100}%`);
      });
      card.addEventListener('mouseleave', () => {
        const inner = card.querySelector('.tilt-card-inner') as HTMLElement;
        if (inner) {
          inner.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        }
      });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleHeroMove);
      observer.disconnect();
      cardObserver.disconnect();
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <div className="text-zinc-800">
      <ScrollProgressBar />

      {/* Ambient Background Orbs */}
      <AmbientOrbs />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* WebGL Background + Noise */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <canvas id="webgl-canvas" className="absolute inset-0 opacity-[0.35]"></canvas>
        <div className="noise-overlay absolute inset-0"></div>
      </div>

      {/* Nav */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="glass-header machined-panel px-6 py-3 flex items-center justify-between w-full max-w-6xl pointer-events-auto shadow-2xl"
        >
          <div className="text-xl font-black text-zinc-950 tracking-tighter flex items-center gap-2 uppercase">
            <span className="text-amber-400 text-2xl">◎</span>
            Voice<span className="text-emerald-500">Qual</span>
          </div>
          <div className="hidden md:flex gap-10 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <a href="#features-section" className="hover-underline hover:text-zinc-950 transition-colors">Platform</a>
            <a href="#features-section" className="hover-underline hover:text-zinc-950 transition-colors">Features</a>
            <a href="#pricing-section" className="hover-underline hover:text-zinc-950 transition-colors">Pricing</a>
            <a href="#cta-section" className="hover-underline hover:text-zinc-950 transition-colors">Get Started</a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="magnetic-btn press-effect bg-zinc-950 text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-md">
              <span className="magnetic-btn-inner">Get Started</span>
            </button>
          </div>
        </motion.div>
      </nav>

      <main className="relative w-full overflow-x-hidden">
        {/* Hero */}
        <section className="relative min-h-screen flex items-center pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden z-10 perspective-container">
          {/* Decorative blobs */}
          <div className="blob blob--gold absolute -top-20 -left-32 w-96 h-96 opacity-30 z-0" />
          <div className="blob blob--emerald absolute -bottom-20 -right-32 w-80 h-80 opacity-20 z-0" style={{ animationDelay: '5s' }} />

          <div className="grid lg:grid-cols-2 gap-12 items-center w-full relative z-10">
            {/* Hero text — scrolls up faster (parallax) */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              style={{ y: heroY, opacity: heroOpacity }}
              className="max-w-2xl"
            >
              <motion.h1 variants={fadeUp} className="text-6xl md:text-[80px] font-black text-zinc-950 tracking-tighter leading-[0.95] mb-8 uppercase overflow-hidden">
                <span>Qualify</span><br />
                <span>every</span><br />
                <span className="gradient-text-gold">lead.</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-zinc-500 mb-10 font-medium leading-relaxed max-w-md">
                VoiceQual automates BANT-based qualification through AI voice calls. Hot leads go to your CRM the moment a call ends.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="magnetic-btn press-effect bg-zinc-950 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-amber-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                  <span className="magnetic-btn-inner flex items-center gap-2">Open Dashboard</span>
                </button>
                <button
                  onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="magnetic-btn press-effect machined-panel text-zinc-950 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white transition-colors">
                  <span className="magnetic-btn-inner flex items-center gap-2">
                    <Waveform bars={4} color="var(--emerald-teal)" />
                    See How It Works
                  </span>
                </button>
              </motion.div>
              <motion.div variants={fadeUp} className="flex items-center gap-8 mt-10 pt-8 border-t border-zinc-200/50">
                <div>
                  <div className="text-2xl font-black text-zinc-900">&lt; 5 min</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">To First Call</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-zinc-900">
                    <AnimatedValue value={14} suffix=" pt" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Avg BANT Lift</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600">3×</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Pipeline ROI</div>
                </div>
              </motion.div>
            </motion.div>

            {/* 3D Hero Stage — scales down + fades on scroll */}
            <motion.div
              ref={heroRef}
              style={{ scale: heroScale, opacity: heroOpacity }}
              className="reveal-3d relative h-[500px] flex items-center justify-center"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Center orb */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute z-40 w-32 h-32 rounded-full bg-amber-400 flex items-center justify-center shadow-2xl border-4 border-amber-300/40"
                  style={{ boxShadow: '0 0 40px rgba(212,175,55,0.3), 0 20px 60px rgba(0,0,0,0.2)' }}
                >
                  <span className="text-5xl">📞</span>
                  <div className="absolute inset-0 rounded-full border border-amber-500/40 animate-ping" style={{ animationDuration: '2.5s' }} />
                  {/* Gold glow ring */}
                  <div className="absolute -inset-2 rounded-full border border-amber-400/20" style={{ animation: 'ring-pulse 3s ease-in-out infinite' }} />
                </motion.div>

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

                {/* Voice Coil Windings */}
                <div className="coil-ring w-[240px] h-[240px] animate-[rotate-cw_22s_linear_infinite]" style={{ transform: 'translateZ(80px)' }}>
                  <div className="coil-wire inset-0 border-[3px]"></div>
                  <div className="coil-wire inset-1 border-[2px] opacity-70"></div>
                  <div className="coil-wire inset-2 border-[1px] opacity-40"></div>
                  <div className="absolute top-0 left-1/2 w-4 h-4 bg-zinc-900 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] -translate-x-1/2 -translate-y-1/2 border border-emerald-500"></div>
                </div>

                <div className="coil-ring w-[380px] h-[380px] border-zinc-300/60 animate-[rotate-ccw_35s_linear_infinite]" style={{ transform: 'translateZ(30px)' }}>
                  <div className="absolute bottom-1/4 right-0 w-4 h-4 bg-amber-400 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.8)]" style={{ animation: 'glow-pulse 3s ease-in-out infinite' }}></div>
                  <div className="absolute top-1/4 left-0 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(31,138,112,0.8)]"></div>
                </div>

                <div className="coil-ring w-[540px] h-[540px] border-[2px] border-zinc-300/40 animate-[rotate-cw_50s_linear_infinite]" style={{ transform: 'translateZ(-40px)' }}>
                  <div className="absolute top-0 left-1/2 w-4 h-8 bg-zinc-400 -translate-x-1/2 -translate-y-1/2 rounded-sm shadow-md"></div>
                  <div className="absolute bottom-0 left-1/2 w-4 h-8 bg-zinc-400 -translate-x-1/2 translate-y-1/2 rounded-sm shadow-md"></div>
                  <div className="absolute left-0 top-1/2 w-8 h-4 bg-zinc-400 -translate-x-1/2 -translate-y-1/2 rounded-sm shadow-md"></div>
                  <div className="absolute right-0 top-1/2 w-8 h-4 bg-zinc-400 translate-x-1/2 -translate-y-1/2 rounded-sm shadow-md"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Marquee */}
        <section className="py-12 border-y border-zinc-300/40 relative z-10 overflow-hidden bg-white/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto px-6 mb-8 text-center"
          >
            <div className="text-base font-black tracking-widest uppercase text-zinc-900">Trusted by sales teams worldwide</div>
            <div className="text-xs font-bold tracking-widest text-emerald-600 uppercase mt-2">Over 2,000,000 leads qualified</div>
          </motion.div>
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
          {/* Decorative rotating ring */}
          <div className="absolute top-10 right-10 w-32 h-32 rotating-ring opacity-30 pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-24 h-24 rotating-ring-reverse opacity-20 pointer-events-none" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tighter mb-4 uppercase">Measure the impact.</h2>
            <p className="text-lg text-zinc-500 font-medium">Stop guessing. See exactly how automated qualification accelerates your pipeline.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: 92, suffix: '%', title: 'Lead qualification accuracy', sub: 'AI-scored lead matches', by: 'Apex SaaS', color: 'text-emerald-600' },
              { value: 10, suffix: '×', title: 'More calls per day', sub: 'vs. manual SDR teams', by: 'TechFlow', color: 'text-amber-400' },
              { value: 78, suffix: '%', title: 'Lower cost per qualified lead', sub: 'Automated conversations', by: 'GrowthEdge', color: 'text-emerald-600' },
            ].map((s, i) => (
              <ScrollReveal3D key={i} delay={i * 0.15}>
                <div className="tilt-card">
                  <div className="tilt-card-inner machined-panel hover-lift p-8 flex flex-col justify-between h-56 relative overflow-hidden">
                    <div className="tilt-shine" />
                    <div className="tilt-gold-shine" />
                    <div>
                      <div className={`text-7xl font-black tracking-tighter leading-none mb-4 ${s.color}`}>
                        <AnimatedValue value={s.value} suffix={s.suffix} />
                      </div>
                      <h3 className="text-lg text-zinc-900 font-bold leading-tight">{s.title}</h3>
                      <p className="text-sm text-zinc-500 font-medium mt-1">{s.sub}</p>
                    </div>
                    <div className="mt-5 text-sm font-bold text-zinc-400">{s.by}</div>
                  </div>
                </div>
              </ScrollReveal3D>
            ))}
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-32 px-6 max-w-7xl mx-auto text-center relative z-10" id="features-section">
          {/* Ambient blob */}
          <div className="blob blob--emerald absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-10 z-0" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="mb-6 flex flex-col items-center relative z-10"
          >
            <div className="crown-badge mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Platform Capabilities
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-[-0.03em] text-zinc-950 mb-5 uppercase leading-[1.0]">
              Complete Voice AI<br />
              <span className="gradient-text-emerald">
                Platform.
              </span>
            </h2>
            <p className="text-lg text-zinc-500 font-medium max-w-lg mx-auto leading-relaxed">
              From first call to CRM entry — automated, scored, and synced in under 60 seconds.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-14"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
            Hover cards to flip
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10" id="feature-cards-grid">
            {[
              {
                svgIcon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
                iconBg: 'linear-gradient(135deg, #1F8A70 0%, #0a5c4a 100%)',
                glowColor: 'rgba(31,138,112,0.3)',
                accentColor: '#1F8A70',
                accentLight: 'rgba(31,138,112,0.08)',
                title: 'AI Voice Engine',
                tag: '24/7 Calling',
                stat: '<30s', statLabel: 'To first call',
                desc: 'Natural, human-like qualification calls to every lead on autopilot.',
                backTitle: 'Voice Intelligence',
                backDesc: 'AI agents that call leads, ask BANT questions, and adapt to responses in real time.',
                bullets: ['Human-like voice & tone', 'Adaptive conversation branching', 'Multi-language support', 'Retry & scheduling logic'],
                flow: 'Lead → Call → Score',
              },
              {
                svgIcon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
                iconBg: 'linear-gradient(135deg, #c49a28 0%, #8a6920 100%)',
                glowColor: 'rgba(212,175,55,0.3)',
                accentColor: '#c49a28',
                accentLight: 'rgba(212,175,55,0.08)',
                title: 'Smart Lead Scoring',
                tag: 'Auto-classification',
                stat: '92%', statLabel: 'Scoring accuracy',
                desc: 'Score every lead HOT, WARM, or COLD using real-time conversation signals.',
                backTitle: 'Scoring Engine',
                backDesc: 'AI analyzes conversation signals to assign accurate BANT scores instantly after each call.',
                bullets: ['HOT / WARM / COLD labels', 'Interest & urgency signals', 'Budget & authority detection', 'Confidence percentages'],
                flow: 'Call → Analyze → Score',
              },
              {
                svgIcon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
                iconBg: 'linear-gradient(135deg, #1F8A70 0%, #0F3D3E 100%)',
                glowColor: 'rgba(15,61,62,0.25)',
                accentColor: '#1F8A70',
                accentLight: 'rgba(31,138,112,0.08)',
                title: 'Call Intelligence',
                tag: 'Full Transcripts',
                stat: '100%', statLabel: 'Calls transcribed',
                desc: 'Transcripts, sentiment, and AI summaries generated for every single call.',
                backTitle: 'Call Analytics',
                backDesc: 'Every call is recorded, transcribed, and distilled into key insights and follow-up actions.',
                bullets: ['Real-time transcription', 'Sentiment & tone detection', 'Objection identification', 'AI-generated summaries'],
                flow: 'Call → Transcribe → Insights',
              },
              {
                svgIcon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>,
                iconBg: 'linear-gradient(135deg, #a67c2e 0%, #c49a28 100%)',
                glowColor: 'rgba(212,175,55,0.25)',
                accentColor: '#c49a28',
                accentLight: 'rgba(212,175,55,0.08)',
                title: 'CRM Pipeline',
                tag: 'CRM Auto-Sync',
                stat: '<1s', statLabel: 'Sync latency',
                desc: 'Push scored leads directly into your CRM the instant a call ends.',
                backTitle: 'CRM Integration',
                backDesc: 'Hot leads pipeline into Salesforce, HubSpot, or Pipedrive automatically with full context.',
                bullets: ['Auto-create CRM records', 'Attach scores & transcripts', 'Trigger follow-up workflows', 'Webhook & API support'],
                flow: 'Score → CRM → Follow-up',
              },

            ].map((f, i) => (
              <div key={i} className="feature-card-wrap flip-card-scene">
                <div className="flip-card-inner">

                  {/* FRONT */}
                  <div className="flip-card-front">
                    <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${f.glowColor}, transparent 65%)`, opacity: 0.7 }} />

                    <div className="feature-icon-box" style={{ background: f.iconBg, boxShadow: `0 8px 24px ${f.glowColor}` }}>
                      {f.svgIcon}
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest mb-4" style={{ borderColor: f.accentColor + '50', background: f.accentLight, color: f.accentColor }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: f.accentColor }} />
                      {f.tag}
                    </div>

                    <h3 className="text-base font-black tracking-tight text-zinc-950 mb-2 uppercase">{f.title}</h3>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">{f.desc}</p>

                    <div className="mt-5 w-full border-t border-zinc-100 pt-4 flex items-center justify-between">
                      <span className="text-[22px] font-black tabular-nums" style={{ color: f.accentColor }}>{f.stat}</span>
                      <span className="text-[11px] text-zinc-400 font-semibold text-right leading-tight">{f.statLabel}</span>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="flip-card-back">
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[24px]" style={{ background: `linear-gradient(90deg, transparent, ${f.accentColor}, transparent)` }} />
                    <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-32 h-20 rounded-full opacity-25 blur-2xl pointer-events-none" style={{ background: f.accentColor }} />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: f.iconBg }}>
                          <div style={{ transform: 'scale(0.55)', lineHeight: 0 }}>{f.svgIcon}</div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: f.accentColor }}>{f.backTitle}</span>
                      </div>

                      <p className="text-[12px] text-zinc-400 font-medium leading-relaxed mb-4">{f.backDesc}</p>

                      <ul className="space-y-2 flex-1">
                        {f.bullets.map((b: string, bi: number) => (
                          <li key={bi} className="feature-bullet">
                            <span className="feature-bullet-dot" style={{ background: f.accentColor }} />
                            {b}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{f.flow}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={f.accentColor} strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Spotlight (UI Mockup) */}
        <section className="py-24 px-6 max-w-7xl mx-auto relative z-10 perspective-container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Text Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={stagger}
              className="order-2 lg:order-1 parallax-layer pt-4"
              data-speed="0.02"
            >
              <motion.div variants={slideLeft} className="text-xs uppercase tracking-[0.25em] text-emerald-600 font-black mb-4">Voice AI Technology</motion.div>
              <motion.h2 variants={slideLeft} className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-950 mb-12 uppercase leading-[1.1]">
                Call every lead,<br />
                <span className="text-zinc-400">qualify them automatically.</span>
              </motion.h2>
              <motion.ul variants={stagger} className="space-y-6">
                <motion.li variants={slideLeft} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                    <PhoneCall className="w-5 h-5 text-emerald-600" strokeWidth={1.75} />
                  </div>
                  <span className="text-lg text-zinc-600 font-medium pt-1">AI calls leads with natural, human-like conversations</span>
                </motion.li>
                <motion.li variants={slideLeft} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Zap className="w-5 h-5 text-emerald-600" strokeWidth={1.75} />
                  </div>
                  <span className="text-lg text-zinc-600 font-medium pt-1">Qualify and score leads in real-time during each call</span>
                </motion.li>
                <motion.li variants={slideLeft} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Target className="w-5 h-5 text-emerald-600" strokeWidth={1.75} />
                  </div>
                  <span className="text-lg text-zinc-600 font-medium pt-1">Deliver scored leads with transcripts to your CRM</span>
                </motion.li>
              </motion.ul>
            </motion.div>

            {/* Right Mockup Console */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={slideRight}
              className="order-1 lg:order-2 parallax-layer"
              data-speed="0.02"
            >
              <div className="reveal-3d active glass-dark rounded-[32px] p-4 shadow-[0_20px_60px_rgba(15,61,62,0.3)] border border-zinc-800 flex flex-col relative overflow-hidden transform-style-3d mockup-float min-h-[500px] h-auto">
                {/* Header */}
                <div className="h-12 bg-zinc-900 rounded-t-2xl border-b border-zinc-800 flex items-center px-6 gap-3 shrink-0 relative z-30">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400/60"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60"></div>
                  </div>
                  <div className="mx-auto flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-900/50 px-4 py-1.5 rounded-md uppercase tracking-widest">
                    <Waveform bars={3} color="#34d399" />
                    VoiceQual Console
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 bg-zinc-950 rounded-b-2xl p-6 flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay" style={{ background: 'repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 4px)' }}></div>
                  <div className="absolute inset-0 bg-emerald-500/5 mix-blend-screen pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>

                  {/* Active call header */}
                  <div className="flex items-center justify-between mb-5 relative z-20 mockup-child mockup-child-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      <PhoneCall className="w-3 h-3 text-emerald-400" /> Live Call Session
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      Recording
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden flex flex-col gap-4 relative z-20">

                    {/* Lead profile card */}
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 scan-card mockup-child mockup-child-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 mb-3 uppercase tracking-widest">
                        <Users className="w-3 h-3" /> Lead Profile
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm text-white font-bold type-1">Priya Menon</p>
                          <p className="text-[11px] text-zinc-500 font-medium fade-in-delay-1">VP Sales · Infosys Ltd · Mumbai</p>
                        </div>
                        {/* BANT score */}
                        <div className="flex flex-col items-end">
                          <span className="text-xl font-black text-emerald-400 leading-none">9.1</span>
                          <span className="text-[9px] text-zinc-600 uppercase tracking-widest">BANT Score</span>
                        </div>
                      </div>
                      {/* BANT bars */}
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {[
                          { label: 'Budget', val: 92, color: '#34d399' },
                          { label: 'Authority', val: 88, color: '#34d399' },
                          { label: 'Need', val: 95, color: '#34d399' },
                          { label: 'Timeline', val: 78, color: '#fbbf24' },
                        ].map(b => (
                          <div key={b.label}>
                            <div className="text-[8px] text-zinc-600 uppercase tracking-wider mb-1">{b.label}</div>
                            <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${b.val}%`, backgroundColor: b.color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sentiment & AI insight */}
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 scan-card mockup-child mockup-child-3">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-amber-400 mb-2 uppercase tracking-widest">
                        <Lightbulb className="w-3 h-3" /> AI Sentiment Analysis
                      </div>
                      <p className="text-sm text-white font-bold mb-1 type-2">"Interested in Q3 rollout — budget confirmed"</p>
                      <p className="text-[11px] text-zinc-500 font-medium leading-relaxed fade-in-delay-2">
                        Positive intent detected. Decision-maker engaged. Recommend immediate CRM push.
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>HOT Lead</span>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>Positive Tone</span>
                        <span className="text-[9px] text-zinc-600 ml-auto">2m 47s</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA button */}
                  <div className="relative z-20 mt-4 mockup-child mockup-child-4">
                    <button className="magnetic-btn press-effect w-full bg-emerald-950/40 border border-emerald-900 hover:bg-emerald-900/60 transition-colors py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-emerald-400 shadow-inner uppercase tracking-widest">
                      <span className="magnetic-btn-inner flex items-center gap-2"><Target className="w-4 h-4" /> Qualify &amp; Push to CRM</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Before/After */}
        <section className="py-20 px-6 max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeScale}
            className="machined-panel p-12 text-white overflow-hidden relative"
            style={{ background: '#09090b' }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)] pointer-events-none" />
            {/* Gold shimmer effect */}
            <div className="absolute top-0 left-0 right-0 h-[1px] gold-shimmer" />
            <h3 className="text-2xl font-black text-white uppercase tracking-widest text-center mb-10 relative z-10">Built for teams that move fast</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-800">
              {[
                { label: 'Lead response time', value: 94, suffix: '%', prefix: '−', from: '4.2 hrs', to: '4 min', color: 'text-emerald-500' },
                { label: 'Qualified leads/rep/week', value: 3, suffix: '×', prefix: '+', from: '18', to: '54', color: 'text-amber-400' },
                { label: 'CRM data completeness', value: 61, suffix: ' pts', prefix: '+', from: '38%', to: '99%', color: 'text-emerald-500' },
              ].map((item, i) => (
                <div key={i} className="pt-6 md:pt-0">
                  <div className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">{item.label}</div>
                  <div className={`text-5xl font-black mb-4 ${item.color}`}>
                    {item.prefix}<AnimatedValue value={item.value} suffix={item.suffix} />
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm font-bold">
                    <span className="line-through text-zinc-600">{item.from}</span>
                    <span className="text-emerald-400">→</span>
                    <span>{item.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Capabilities (Bento 2) */}
        <section className="py-32 px-6 max-w-7xl mx-auto relative z-10" id="stack-section">
          <div className="absolute top-20 right-0 w-40 h-40 rotating-ring opacity-20 pointer-events-none" />
          <div className="blob blob--gold absolute -top-20 right-0 w-64 h-64 opacity-15 z-0" style={{ animationDelay: '3s' }} />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10"
          >
            <div className="max-w-2xl">
              <div className="ornament-line text-xs font-black text-amber-500 uppercase tracking-widest mb-4">The Stack</div>
              <h2 className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tighter mb-4 uppercase">The Qualification Stack.</h2>
              <p className="text-lg text-zinc-500 font-medium">From first contact to CRM entry—scheduling, calling, scoring, and syncing are handled without a human in the loop.</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {[
              { accent: 'text-amber-500', accentBg: 'rgba(212,175,55,0.04)', title: 'Automated Outbound Calling', sub: '< 5 min avg first call', desc: 'Reach every lead within minutes. Handles scheduling, retries, and call windows—zero manual dialing.' },
              { accent: 'text-emerald-600', accentBg: 'rgba(31,138,112,0.05)', title: 'BANT Qualification Scoring', sub: '4 signals per call', desc: 'Each call is scored across Budget, Authority, Need, and Timeline with full audit trails.' },
              { accent: 'text-amber-500', accentBg: 'rgba(212,175,55,0.04)', title: 'CRM Sync & Webhooks', sub: '< 1 sec sync latency', desc: 'Push qualified lead data directly to Salesforce, HubSpot, or Pipedrive the moment a call completes.' },
              { accent: 'text-emerald-600', accentBg: 'rgba(31,138,112,0.05)', title: 'Pipeline Analytics', sub: 'Real-time dashboards', desc: 'Track conversion rates, call volumes, and qualification trends. Understand exactly where leads drop off.' },
              { accent: 'text-amber-500', accentBg: 'rgba(212,175,55,0.04)', title: 'Configurable Rules', sub: 'No-code configuration', desc: 'Set calling windows, retry delays, score thresholds, and SLA targets through a simple admin interface.' },
              { accent: 'text-emerald-600', accentBg: 'rgba(31,138,112,0.05)', title: 'Compliance Built In', sub: 'SOC 2 Type II certified', desc: 'DND checks, consent management, call time restrictions, and auto-deletion of recordings after 90 days.' },
            ].map((item, i) => (
              <ScrollReveal3D key={i} delay={i * 0.1}>
                <div className="tilt-card h-full">
                  <div className="tilt-card-inner machined-panel hover-lift p-8 group flex flex-col relative overflow-hidden" style={{ background: `linear-gradient(145deg, #ffffff, ${item.accentBg})` }}>
                    <div className="tilt-shine" />
                    <div className={`text-xs font-black ${item.accent} uppercase tracking-widest mb-4`}>{item.sub}</div>
                    <h3 className="text-2xl font-black text-zinc-950 tracking-tighter mb-2 uppercase">{item.title}</h3>
                    <p className="text-zinc-600 font-medium text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal3D>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="py-32 px-6 max-w-7xl mx-auto relative z-10" id="pricing-section">
          {/* Decorative */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rotating-ring-reverse opacity-15 pointer-events-none" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tighter mb-4 uppercase">Transparent Pricing.</h2>
            <p className="text-lg text-zinc-500 font-medium max-w-2xl mx-auto">Pay for the intelligence you use. No hidden fees.</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            <motion.div variants={slideLeft} className="tilt-card">
              <div className="tilt-card-inner machined-panel hover-lift p-10 flex flex-col h-full bg-white/80 relative overflow-hidden">
                <div className="tilt-shine" />
                <div className="mb-8">
                  <span className="px-3 py-1 rounded bg-zinc-100 border border-zinc-200 text-zinc-600 text-[10px] font-black tracking-widest uppercase mb-4 inline-block">Growth</span>
                  <h3 className="text-5xl font-black text-zinc-950 tracking-tighter mb-2">₹29,990<span className="text-xl text-zinc-500 font-bold">/mo</span></h3>
                  <p className="text-sm text-zinc-500 font-medium">Includes 2,000 qualified calls per month.</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {['Standard AI Voice Models', 'Real-time BANT Scoring', 'Native CRM Integrations', 'Basic Pipeline Analytics'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm font-bold text-zinc-700">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(31,138,112,0.12)', border: '1px solid rgba(31,138,112,0.25)' }}>
                        <Check className="w-3 h-3" style={{ color: '#1F8A70' }} strokeWidth={2.5} />
                      </div> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="magnetic-btn press-effect w-full bg-white text-zinc-950 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest border border-zinc-300 hover:bg-zinc-50 hover:border-amber-400/50 transition-colors">
                  <span className="magnetic-btn-inner">Start 14-Day Trial</span>
                </button>
              </div>
            </motion.div>

            <motion.div variants={slideRight} className="tilt-card">
              <div className="tilt-card-inner machined-panel hover-lift p-10 flex flex-col h-full border-zinc-800 text-white relative overflow-hidden" style={{ background: '#09090b' }}>
                <div className="tilt-gold-shine" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.15)_0%,_transparent_60%)] pointer-events-none" />
                {/* Gold shimmer top border */}
                <div className="absolute top-0 left-0 right-0 h-[2px] gold-shimmer" />
                <div className="relative z-10 mb-8">
                  <span className="crown-badge mb-4 inline-flex">Enterprise</span>
                  <h3 className="text-5xl font-black text-white tracking-tighter mb-2 mt-3">Custom</h3>
                  <p className="text-sm text-zinc-400 font-medium">Volume-based pricing for massive scale.</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1 relative z-10">
                  {['Custom Voice Cloning', 'Advanced Routing Logic', 'SOC 2 Type II Compliance', 'Dedicated Success Manager'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)' }}>
                        <Check className="w-3 h-3" style={{ color: '#D4AF37' }} strokeWidth={2.5} />
                      </div> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:sales@voicequal.ai"
                  className="magnetic-btn press-effect w-full bg-emerald-500 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-colors relative z-10 text-center hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center">
                  <span className="magnetic-btn-inner">Contact Sales</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 relative z-10 mb-10" id="cta-section">
          {/* Decorative blobs */}
          <div className="blob blob--gold absolute top-10 left-10 w-60 h-60 opacity-15 z-0" />
          <div className="blob blob--emerald absolute bottom-10 right-10 w-48 h-48 opacity-10 z-0" style={{ animationDelay: '4s' }} />

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeScale}
              className="machined-panel p-12 md:p-24 text-center bg-white/80 shadow-2xl relative overflow-hidden"
            >
              {/* Animated gradient border glow */}
              <div className="absolute top-0 left-0 right-0 h-[2px] gold-shimmer" />
              <div className="absolute bottom-0 left-0 right-0 h-[2px] gold-shimmer" style={{ animationDelay: '1.5s' }} />

              <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                <Waveform bars={3} color="var(--emerald-teal)" />
                Live in under 60 minutes
              </div>
              <h2 className="text-5xl md:text-[60px] font-black text-zinc-950 tracking-tighter leading-[1.0] mb-8 uppercase">
                Start qualifying<br />
                <span className="gradient-text-gold">leads today.</span>
              </h2>
              <p className="text-zinc-500 mb-12 font-medium max-w-md mx-auto text-sm leading-relaxed">
                Connect your CRM, configure rules, and go live. No engineering required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="magnetic-btn press-effect bg-zinc-950 text-white px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-amber-400 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]">
                  <span className="magnetic-btn-inner">Open Dashboard</span>
                </button>
                <a
                  href="mailto:sales@voicequal.ai"
                  className="magnetic-btn press-effect bg-transparent border-2 border-zinc-300 text-zinc-900 px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-100 hover:border-amber-400/50 transition-all duration-300 flex items-center justify-center">
                  <span className="magnetic-btn-inner">Book a Demo</span>
                </a>
              </div>
            </motion.div>
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
                <div className="flex items-center gap-3 mt-4">
                  <Waveform bars={5} color="var(--emerald-teal)" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">AI Active</span>
                </div>
              </div>
              {[
                { heading: 'Product', links: ['Features', 'Integrations', 'Pricing', 'Changelog'] },
                { heading: 'Resources', links: ['Documentation', 'API Reference', 'Status', 'Support'] },
                { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              ].map(col => (
                <div key={col.heading}>
                  <div className="text-xs font-black uppercase tracking-widest text-zinc-950 mb-6">{col.heading}</div>
                  <ul className="space-y-4 text-sm font-medium text-zinc-500">
                    {col.links.map(l => <li key={l}><a href="#" className="hover-underline hover:text-amber-500 transition-colors">{l}</a></li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-200/60 text-xs font-bold text-zinc-400 uppercase tracking-widest gap-4">
              <div>© 2026 VoiceQual AI. All rights reserved.</div>
              <div className="flex gap-6">
                <a href="#" className="hover-underline hover:text-zinc-800 transition-colors">Privacy Policy</a>
                <a href="#" className="hover-underline hover:text-zinc-800 transition-colors">Terms of Service</a>
                <a href="#" className="hover-underline hover:text-zinc-800 transition-colors">Security</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
