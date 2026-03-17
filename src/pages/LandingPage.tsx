import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, List, FileText, Shield, BarChart2, Zap,
  UserPlus, Heart, CheckCircle, Menu, X,
  Twitter, Facebook, Instagram, Star,
  Calendar, ChevronDown, Play, ShieldCheck, MapPin,
  Users, Landmark, Church as ChurchIcon, TrendingUp,
} from 'lucide-react';

/* ─── scroll-reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}
const Reveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 400ms ease-out ${delay}ms, transform 400ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/* ─── count-up hook ─── */
function useCountUp(end: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setCount(Math.floor(progress * end));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);
  return { ref, count };
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════ */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = ['Home', 'Features', 'How It Works', 'About Us', 'Contact'];
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0e1a]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-lg'
          : 'bg-transparent'
      }`}
      style={{ height: 70 }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-accent text-xl">✝</span>
          <span className="font-serif text-2xl font-bold text-white">BlessPay</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <button
              key={link}
              onClick={() => scrollTo(link.toLowerCase().replace(/ /g, '-'))}
              className="bg-transparent border-none cursor-pointer font-sans text-[14px] font-medium text-white/70 hover:text-accent transition-colors duration-150"
            >
              {link}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/auth"
            className="h-9 px-5 rounded-full bg-accent text-primary font-sans text-sm font-semibold flex items-center justify-center hover:bg-accent/90 transition-all duration-150"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden bg-transparent border-none cursor-pointer text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 top-[70px] bg-primary z-50 flex flex-col items-center justify-center gap-8">
            {links.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link.toLowerCase().replace(/ /g, '-'))}
                className="bg-transparent border-none cursor-pointer font-sans text-xl font-medium text-white"
              >
                {link}
              </button>
            ))}
            <Link
              to="/auth"
              onClick={() => setMenuOpen(false)}
              className="h-12 px-8 rounded-full bg-accent text-primary font-sans font-semibold flex items-center justify-center"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

/* ═══════════════════════════════════════════════════════════
   HERO — full-bleed dark image, centred content
   ═══════════════════════════════════════════════════════════ */
const Hero = () => (
  <section
    id="home"
    className="relative min-h-screen flex items-center justify-center overflow-hidden"
  >
    {/* Background image */}
    <img
      src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1600&q=80"
      alt="Church interior"
      className="absolute inset-0 w-full h-full object-cover"
      loading="eager"
    />
    {/* Dark overlay */}
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(to bottom, rgba(10,14,26,0.75), rgba(15,23,42,0.88))' }}
    />

    {/* Content */}
    <div className="relative z-10 text-center px-6 max-w-[640px] flex flex-col items-center gap-6 pt-[70px]">
      {/* Overline chip */}
      <Reveal>
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] font-sans font-bold uppercase tracking-[2px] text-[#2DD4BF]">
          <Calendar size={13} />
          Faithful Giving for Kenyan Churches
        </span>
      </Reveal>

      {/* Headline */}
      <Reveal delay={60}>
        <h1 className="font-serif text-[clamp(36px,6vw,56px)] leading-[1.1] font-bold text-white">
          Give Faithfully.<br />
          <span className="bg-gradient-to-r from-accent to-[hsl(44,70%,65%)] bg-clip-text text-transparent">
            Tracked Beautifully.
          </span>
        </h1>
      </Reveal>

      {/* Sub-paragraph */}
      <Reveal delay={120}>
        <p className="font-sans text-[17px] text-white/60 max-w-[480px] leading-relaxed">
          BlessPay makes it simple for church members to give their tithe and
          offering from anywhere, anytime — securely powered by Mpesa.
        </p>
      </Reveal>

      {/* CTA buttons */}
      <Reveal delay={180}>
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          <Link
            to="/auth"
            className="h-12 px-8 rounded-full bg-accent text-primary font-sans font-semibold text-[15px] flex items-center justify-center hover:bg-accent/90 transition-all duration-150"
          >
            Start Giving
          </Link>
          <button
            onClick={() => document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' })}
            className="h-12 px-8 rounded-full bg-transparent border border-white/20 text-white/80 font-sans font-semibold text-[15px] cursor-pointer hover:border-accent hover:text-accent transition-all duration-150"
          >
            Learn More
          </button>
        </div>
      </Reveal>
    </div>

    {/* Bounce arrow */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
      <ChevronDown size={28} className="text-white/40" />
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════
   ABOUT / WELCOME
   ═══════════════════════════════════════════════════════════ */
const AboutWelcome = () => (
  <section id="about-us" className="bg-[#111827] py-24">
    <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[42%_58%] gap-12 items-center">
      {/* LEFT — circular image */}
      <Reveal className="flex justify-center">
        <div className="relative w-[280px] h-[280px] md:w-[300px] md:h-[300px]">
          {/* Spinning dashed ring */}
          <div
            className="absolute -inset-4 rounded-full border-2 border-dashed border-accent/40"
            style={{ animation: 'spin 20s linear infinite' }}
          />
          {/* Image circle */}
          <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-accent shadow-[0_0_40px_rgba(201,168,76,0.15)]">
            <img
              src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80"
              alt="Church community"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform duration-150">
              <Play size={22} className="text-primary ml-0.5" fill="currentColor" />
            </div>
          </div>
        </div>
      </Reveal>

      {/* RIGHT — text */}
      <div className="flex flex-col gap-5 lg:pl-12">
        <Reveal>
          <p className="font-sans text-sm font-bold italic text-accent">
            Empowering faithful giving across Kenya
          </p>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="font-serif text-[clamp(28px,4vw,36px)] text-white font-bold leading-tight">
            More Than Just a Payment Platform
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="font-sans text-base text-white/60 leading-relaxed">
            BlessPay was born from a simple belief — that giving to God should be effortless,
            transparent and accessible to every church member regardless of where they are.
            We bridge the gap between faith and modern technology.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <p className="font-sans text-sm text-white/40 leading-relaxed">
            Every line of code was written with the church community in mind. From secure
            Mpesa integration to real-time receipts, BlessPay is built for the African church.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-fit mt-2 h-11 px-6 rounded-full border border-accent text-accent font-sans font-semibold text-sm cursor-pointer hover:bg-accent hover:text-primary transition-all duration-150 bg-transparent"
          >
            See How It Works
          </button>
        </Reveal>
      </div>
    </div>

    {/* spinning keyframe */}
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </section>
);

/* ═══════════════════════════════════════════════════════════
   STATS COUNTER ROW
   ═══════════════════════════════════════════════════════════ */
const StatItem = ({ end, suffix, label, icon: Icon, delay }: { end: number; suffix: string; label: string; icon: any; delay: number }) => {
  const { ref, count } = useCountUp(end);
  return (
    <Reveal delay={delay}>
      <div
        ref={ref}
        className="flex flex-col items-center text-center py-6 px-4 rounded-xl bg-white/[0.03] border border-accent/[0.12]"
      >
        <Icon size={28} className="text-accent mb-3" />
        <p className="font-serif text-[clamp(28px,4vw,36px)] font-bold text-white">
          {count.toLocaleString()}{suffix}
        </p>
        <p className="font-sans text-[11px] uppercase tracking-[1.5px] text-white/40 mt-1">{label}</p>
      </div>
    </Reveal>
  );
};

const StatsCounter = () => (
  <section className="bg-[#1E293B] py-14">
    <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-5">
      <StatItem end={10000} suffix="+" label="Members" icon={Users} delay={0} />
      <StatItem end={50}    suffix="M+" label="Collected" icon={Landmark} delay={60} />
      <StatItem end={500}   suffix="+" label="Churches" icon={ChurchIcon} delay={120} />
      <StatItem end={98}    suffix="%" label="Satisfaction" icon={TrendingUp} delay={180} />
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════
   FEATURES — 3-column, upgraded hover
   ═══════════════════════════════════════════════════════════ */
const Features = () => {
  const features = [
    { icon: Phone, title: 'Instant Mpesa Payments', body: 'Receive an STK push directly to your phone. Just enter your PIN and your offering is complete in seconds.' },
    { icon: List, title: 'Full Giving History', body: 'Every tithe and offering is recorded and accessible. Track your giving journey with complete transparency.' },
    { icon: FileText, title: 'Instant PDF Receipts', body: 'Download a professional receipt for every successful transaction. Perfect for personal records and accountability.' },
    { icon: Shield, title: 'Secure Role Separation', body: 'Members and admins have completely separate access. Your data is protected with JWT authentication and bcrypt encryption.' },
    { icon: BarChart2, title: 'Powerful Admin Tools', body: 'Church admins can view all members, manage accounts, track all transactions and generate detailed giving reports.' },
    { icon: Zap, title: 'Real-Time Confirmations', body: 'Payment status updates instantly. Members know immediately whether their transaction was successful.' },
  ];

  return (
    <section id="features" className="bg-[#0F172A] py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal className="text-center mb-16">
          <span className="font-sans text-[11px] font-bold tracking-[2px] text-accent uppercase">Why BlessPay</span>
          <h2 className="font-serif text-[clamp(28px,4vw,42px)] text-white font-bold mt-3">Everything Your Church Needs</h2>
          <p className="font-sans text-white/50 mt-3 text-base">Built specifically for the church community in mind</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="group bg-white/[0.03] border border-white/[0.06] rounded-xl p-8 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_0_24px_rgba(201,168,76,0.08)] transition-all duration-150">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-5">
                  <Icon size={22} className="text-accent" />
                </div>
                <h3 className="font-sans font-bold text-white text-lg">{title}</h3>
                <p className="font-sans text-white/50 text-sm mt-2 leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════ */
const HowItWorks = () => {
  const steps = [
    { number: '01', icon: UserPlus, title: 'Register Your Account', body: 'Sign up with your username, email and phone number in under a minute.' },
    { number: '02', icon: Heart, title: 'Select Tithe or Offering', body: 'Choose what you are giving, enter your amount and your Mpesa phone number.' },
    { number: '03', icon: CheckCircle, title: 'Enter Mpesa PIN', body: 'An STK push arrives on your phone. Enter your PIN and your giving is complete. A receipt is generated instantly.' },
  ];

  return (
    <section id="how-it-works" className="bg-[#111827] py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal className="text-center mb-16">
          <span className="font-sans text-[11px] font-bold tracking-[2px] text-accent uppercase">The Process</span>
          <h2 className="font-serif text-[clamp(28px,4vw,42px)] text-white font-bold mt-3">Give in Three Simple Steps</h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[40px] left-[16%] right-[16%] h-px border-t-2 border-dashed border-accent/30" />

          {steps.map(({ number, icon: Icon, title, body }, i) => (
            <Reveal key={number} delay={i * 60} className="flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-6">
                <span className="font-serif text-2xl font-bold text-primary">{number}</span>
              </div>
              <Icon size={24} className="text-accent/70 mb-3" />
              <h3 className="font-sans font-bold text-white text-lg">{title}</h3>
              <p className="font-sans text-white/50 text-sm mt-2 max-w-[280px] leading-relaxed">{body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mt-16">
          <Link
            to="/auth"
            className="inline-flex h-12 px-8 rounded-full bg-accent text-primary font-sans font-semibold text-[15px] items-center justify-center hover:bg-accent/90 transition-all duration-150"
          >
            Start Giving Today
          </Link>
        </Reveal>
      </div>
    </section>
  );
};


/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════════ */
const Testimonials = () => {
  const testimonials = [
    { quote: 'BlessPay has completely changed how I give. I no longer worry about carrying cash to church. I give from wherever I am and get a receipt instantly.', name: 'Mary Wanjiku', role: 'Church Member', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80' },
    { quote: 'As a church admin, tracking all our tithes and offerings used to take hours every Sunday. Now everything is in one dashboard. It has been a blessing.', name: 'Pastor James Omondi', role: 'Church Admin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    { quote: 'Simple, fast and secure. I love that I can see my full giving history anytime. It keeps me accountable in my giving.', name: 'David Kamau', role: 'Church Member', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
    { quote: 'The receipt feature is amazing. I can download proof of every offering I have made. BlessPay has made giving so much more meaningful for me.', name: 'Grace Njeri', role: 'Church Member', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
    { quote: 'Our church collections have increased significantly since we adopted BlessPay. Members give more consistently when it is this easy.', name: 'Bishop Paul Mutua', role: 'Church Admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
    { quote: 'I travel a lot for work and used to miss giving on Sundays. Now I give from wherever I am. BlessPay has kept me faithful in my tithing.', name: 'Kevin Otieno', role: 'Church Member', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
  ];

  return (
    <section id="testimonials" className="py-24" style={{ background: '#111827' }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal className="text-center mb-20">
          <span className="font-sans text-[11px] font-bold tracking-[2px] uppercase text-accent">Testimonials</span>
          <h2 className="font-serif text-[clamp(28px,4vw,42px)] font-bold mt-3 text-white">What Our Members Say</h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(({ quote, name, role, avatar }, i) => (
            <Reveal key={name} delay={i * 60}>
              <div className="relative flex flex-col rounded-2xl overflow-visible" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', minHeight: 320 }}>

                {/* protruding circular avatar */}
                <div className="flex justify-center" style={{ marginTop: '-48px' }}>
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ width: 100, height: 100, border: '4px solid rgba(201,168,76,0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', flexShrink: 0 }}
                  >
                    <img src={avatar} alt={name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </div>

                {/* card body */}
                <div className="flex flex-col flex-1 px-7 pt-5 pb-7">
                  <h3 className="font-sans font-black text-center uppercase tracking-wide text-white" style={{ fontSize: 17 }}>{name}</h3>
                  <p className="font-sans text-center text-xs font-bold uppercase tracking-widest mt-1 text-accent">{role}</p>
                  <div className="my-4 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <p className="font-sans text-sm leading-relaxed text-center text-white/60">{quote}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`#testimonials .grid { padding-top: 60px; }`}</style>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════ */
const Footer = () => (
  <footer id="contact" className="bg-[#0a0e1a] py-16">
    <div className="max-w-[1200px] mx-auto px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-accent text-lg">✝</span>
            <span className="font-serif text-xl font-bold text-accent">BlessPay</span>
          </div>
          <p className="font-sans text-white/40 text-sm mt-3">Faithful Giving, Made Simple</p>
          <div className="flex gap-3 mt-4">
            {[Twitter, Facebook, Instagram].map((Icon, i) => (
              <Icon key={i} size={18} className="text-white/30 hover:text-accent cursor-pointer transition-colors duration-150" />
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <h4 className="font-sans font-semibold text-white text-sm mb-4">Platform</h4>
          {['Features', 'How It Works', 'Security', 'Pricing'].map((link) => (
            <p key={link} className="font-sans text-white/40 text-sm mb-2 cursor-pointer hover:text-accent transition-colors duration-150">
              {link}
            </p>
          ))}
        </div>

        {/* Support */}
        <div>
          <h4 className="font-sans font-semibold text-white text-sm mb-4">Support</h4>
          {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((link) => (
            <p key={link} className="font-sans text-white/40 text-sm mb-2 cursor-pointer hover:text-accent transition-colors duration-150">
              {link}
            </p>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-sans font-semibold text-white text-sm mb-4">Contact</h4>
          {['📧 support@blesspay.com', '📞 +254 700 000 000', '📍 Nairobi, Kenya'].map((item) => (
            <p key={item} className="font-sans text-white/40 text-sm mb-2">{item}</p>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-accent/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="font-sans text-white/30 text-xs">© 2026 BlessPay. All rights reserved.</p>
        <p className="font-sans text-white/30 text-xs">Made with 🙏 for the Church</p>
      </div>
    </div>
  </footer>
);

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
const LandingPage = () => (
  <div className="min-h-screen bg-[#0a0e1a]">
    <Navbar />
    <Hero />
    <AboutWelcome />
    <StatsCounter />
    <Features />
    <HowItWorks />
    <Testimonials />
    <Footer />
  </div>
);

export default LandingPage;
