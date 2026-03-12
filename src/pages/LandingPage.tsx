import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Phone, List, FileText, Shield, BarChart2, Zap, UserPlus, Heart, CheckCircle, Menu, X, Twitter, Facebook, Instagram, Check, Star, Church } from 'lucide-react'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const links = ['Home', 'Features', 'How It Works', 'About Us', 'Contact']
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }
  return (
    <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,background:'#fff',borderBottom:'1px solid #E5E7EB',boxShadow:scrolled?'0 2px 12px rgba(0,0,0,0.06)':'none',transition:'box-shadow 150ms',height:70,display:'flex',alignItems:'center',padding:'0 40px',justifyContent:'space-between' }}>
      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
        <span style={{ color:'#C9A84C',fontSize:20 }}>✝</span>
        <span style={{ fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:700,color:'#1E3A5F' }}>BlessPay</span>
      </div>
      <div className="desktop-nav" style={{ display:'flex',gap:32,alignItems:'center' }}>
        {links.map(link => (
          <button key={link} onClick={() => scrollTo(link.toLowerCase().replace(/ /g,'-'))} style={{ background:'none',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',fontSize:15,fontWeight:500,color:'#1A1A2E',transition:'color 150ms' }} onMouseEnter={e=>(e.target as HTMLElement).style.color='#C9A84C'} onMouseLeave={e=>(e.target as HTMLElement).style.color='#1A1A2E'}>{link}</button>
        ))}
      </div>
      <div className="desktop-nav" style={{ display:'flex',gap:12,alignItems:'center' }}>
        <Link to="/login"><button style={{ border:'1.5px solid #1E3A5F',background:'none',color:'#1E3A5F',padding:'0 20px',height:36,borderRadius:6,fontFamily:'Inter',fontWeight:500,cursor:'pointer',fontSize:14,transition:'all 150ms' }} onMouseEnter={e=>{e.currentTarget.style.background='#1E3A5F';e.currentTarget.style.color='#fff'}} onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#1E3A5F'}}>Login</button></Link>
        <Link to="/login"><button style={{ background:'#1E3A5F',color:'#fff',padding:'0 20px',height:36,borderRadius:6,border:'none',fontFamily:'Inter',fontWeight:500,cursor:'pointer',fontSize:14,transition:'all 150ms' }} onMouseEnter={e=>e.currentTarget.style.background='#C9A84C'} onMouseLeave={e=>e.currentTarget.style.background='#1E3A5F'}>Get Started</button></Link>
      </div>
      <button className="mobile-menu-btn" onClick={()=>setMenuOpen(!menuOpen)} style={{ background:'none',border:'none',cursor:'pointer',color:'#1E3A5F' }}>{menuOpen?<X size={24}/>:<Menu size={24}/>}</button>
      {menuOpen && (
        <div style={{ position:'fixed',top:70,left:0,right:0,bottom:0,background:'#1E3A5F',zIndex:99,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:32 }}>
          {links.map(link=><button key={link} onClick={()=>scrollTo(link.toLowerCase().replace(/ /g,'-'))} style={{ background:'none',border:'none',cursor:'pointer',fontFamily:'Inter',fontSize:20,fontWeight:500,color:'#fff' }}>{link}</button>)}
          <Link to="/login" onClick={()=>setMenuOpen(false)}><button style={{ background:'#C9A84C',color:'#1E3A5F',padding:'12px 40px',borderRadius:6,border:'none',fontFamily:'Inter',fontWeight:600,cursor:'pointer',fontSize:16 }}>Get Started</button></Link>
        </div>
      )}
    </nav>
  )
}

const Hero = () => (
  <section id="home" style={{ minHeight:'92vh',background:'#fff',display:'flex',alignItems:'center',padding:'110px 40px 60px' }}>
    <div style={{ maxWidth:1200,margin:'0 auto',width:'100%',display:'flex',alignItems:'center',gap:60,flexWrap:'wrap' }}>
      <div style={{ flex:'1 1 480px' }}>
        <div style={{ display:'inline-flex',alignItems:'center',gap:6,border:'1px solid #C9A84C',borderRadius:999,padding:'6px 16px',marginBottom:28 }}>
          <span style={{ color:'#C9A84C',fontSize:13,fontFamily:'Inter',fontWeight:500 }}>✦ Trusted Church Giving Platform</span>
        </div>
        <h1 style={{ fontFamily:'Playfair Display,serif',fontSize:'clamp(36px,5vw,58px)',lineHeight:1.2,color:'#1E3A5F',fontWeight:700,marginBottom:20 }}>Give Faithfully.<br/>Give Effortlessly.</h1>
        <p style={{ fontFamily:'Inter',fontSize:18,color:'#6B7280',maxWidth:480,lineHeight:1.7,marginBottom:36 }}>BlessPay makes it simple for church members to give their tithe and offering from anywhere, anytime — securely powered by Mpesa.</p>
        <div style={{ display:'flex',gap:16,flexWrap:'wrap',marginBottom:32 }}>
          <Link to="/login"><button style={{ background:'#1E3A5F',color:'#fff',height:48,padding:'0 28px',borderRadius:6,border:'none',fontFamily:'Inter',fontWeight:600,fontSize:15,cursor:'pointer',transition:'all 150ms' }} onMouseEnter={e=>e.currentTarget.style.background='#C9A84C'} onMouseLeave={e=>e.currentTarget.style.background='#1E3A5F'}>Start Giving Today</button></Link>
          <button onClick={()=>document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})} style={{ background:'#fff',color:'#1E3A5F',height:48,padding:'0 28px',borderRadius:6,border:'1.5px solid #1E3A5F',fontFamily:'Inter',fontWeight:600,fontSize:15,cursor:'pointer',transition:'all 150ms' }} onMouseEnter={e=>{e.currentTarget.style.background='#1E3A5F';e.currentTarget.style.color='#fff'}} onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#1E3A5F'}}>See How It Works</button>
        </div>
        <div style={{ display:'flex',gap:24,flexWrap:'wrap' }}>
          {['Secured by Mpesa','Instant Receipts','Real-time History'].map(item=>(
            <div key={item} style={{ display:'flex',alignItems:'center',gap:6 }}><Check size={14} color="#16A34A" strokeWidth={3}/><span style={{ fontFamily:'Inter',fontSize:13,color:'#6B7280' }}>{item}</span></div>
          ))}
        </div>
      </div>
      <div style={{ flex:'1 1 380px',position:'relative' }}>
        <img src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80" alt="Church" style={{ width:'100%',borderRadius:16,objectFit:'cover',maxHeight:480 }}/>
        <div style={{ position:'absolute',bottom:24,left:-20,background:'#fff',borderRadius:10,padding:'12px 16px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',minWidth:200 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:4 }}><CheckCircle size={16} color="#C9A84C" fill="#C9A84C"/><span style={{ fontFamily:'Inter',fontSize:13,fontWeight:600,color:'#1A1A2E' }}>Payment Successful</span></div>
          <span style={{ fontFamily:'Inter',fontSize:12,color:'#6B7280',display:'block',marginBottom:6 }}>KES 5,000 Tithe — John 3:16</span>
          <span style={{ display:'inline-block',background:'#DCFCE7',color:'#16A34A',fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:999 }}>Confirmed</span>
        </div>
        <div style={{ position:'absolute',top:16,right:-16,background:'#fff',borderRadius:10,padding:'12px 16px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}><Church size={16} color="#1E3A5F"/><span style={{ fontFamily:'Inter',fontSize:13,fontWeight:600,color:'#1A1A2E' }}>1,200+ Members Giving</span></div>
          <div style={{ display:'flex',gap:2 }}>{[...Array(5)].map((_,i)=><Star key={i} size={12} color="#C9A84C" fill="#C9A84C"/>)}</div>
        </div>
      </div>
    </div>
  </section>
)

const Stats = () => {
  const stats = [{ value:'KES 2M+',label:'Total Collected' },{ value:'1,200+',label:'Active Members' },{ value:'5,000+',label:'Transactions Processed' },{ value:'99.9%',label:'Payment Success Rate' }]
  return (
    <section style={{ background:'#1E3A5F',padding:'60px 40px' }}>
      <div style={{ maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'space-around',flexWrap:'wrap',gap:32 }}>
        {stats.map((stat,i)=>(
          <div key={stat.label} style={{ display:'flex',alignItems:'center' }}>
            <div style={{ textAlign:'center',padding:'0 40px' }}>
              <div style={{ fontFamily:'Playfair Display,serif',fontSize:42,fontWeight:700,color:'#C9A84C',lineHeight:1 }}>{stat.value}</div>
              <div style={{ fontFamily:'Inter',fontSize:14,color:'#fff',marginTop:8,opacity:0.85 }}>{stat.label}</div>
            </div>
            {i<stats.length-1&&<div style={{ width:1,height:50,background:'#C9A84C',opacity:0.4 }}/>}
          </div>
        ))}
      </div>
    </section>
  )
}

const Features = () => {
  const features = [
    { icon:Phone,title:'Instant Mpesa Payments',body:'Receive an STK push directly to your phone. Just enter your PIN and your offering is complete in seconds.' },
    { icon:List,title:'Full Giving History',body:'Every tithe and offering is recorded and accessible. Track your giving journey with complete transparency.' },
    { icon:FileText,title:'Instant PDF Receipts',body:'Download a professional receipt for every successful transaction. Perfect for personal records and accountability.' },
    { icon:Shield,title:'Secure Role Separation',body:'Members and admins have completely separate access. Your data is protected with JWT authentication and bcrypt encryption.' },
    { icon:BarChart2,title:'Powerful Admin Tools',body:'Church admins can view all members, manage accounts, track all transactions and generate detailed giving reports.' },
    { icon:Zap,title:'Real-Time Confirmations',body:'Payment status updates instantly. Members know immediately whether their transaction was successful.' },
  ]
  return (
    <section id="features" style={{ background:'#fff',padding:'100px 40px' }}>
      <div style={{ maxWidth:1200,margin:'0 auto' }}>
        <div style={{ textAlign:'center',marginBottom:60 }}>
          <span style={{ fontFamily:'Inter',fontSize:12,fontWeight:600,color:'#C9A84C',letterSpacing:2,textTransform:'uppercase' }}>WHY BLESSPAY</span>
          <h2 style={{ fontFamily:'Playfair Display,serif',fontSize:42,color:'#1E3A5F',marginTop:12,marginBottom:12 }}>Everything Your Church Needs</h2>
          <p style={{ fontFamily:'Inter',fontSize:16,color:'#6B7280' }}>Built specifically for the church community in mind</p>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:24 }}>
          {features.map(({ icon:Icon,title,body })=>(
            <div key={title} style={{ background:'#fff',border:'1px solid #E5E7EB',borderRadius:8,padding:32,cursor:'default',transition:'all 150ms' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';(e.currentTarget.querySelector('.fi') as HTMLElement).style.color='#C9A84C'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';(e.currentTarget.querySelector('.fi') as HTMLElement).style.color='#1E3A5F'}}>
              <Icon className="fi" size={28} style={{ color:'#1E3A5F',marginBottom:16,transition:'color 150ms' }}/>
              <h3 style={{ fontFamily:'Playfair Display,serif',fontSize:18,color:'#1A1A2E',marginBottom:10 }}>{title}</h3>
              <p style={{ fontFamily:'Inter',fontSize:14,color:'#6B7280',lineHeight:1.7 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const HowItWorks = () => {
  const steps = [
    { number:'01',icon:UserPlus,title:'Register Your Account',body:'Sign up with your username, email and phone number in under a minute.' },
    { number:'02',icon:Heart,title:'Select Tithe or Offering',body:'Choose what you are giving, enter your amount and your Mpesa phone number.' },
    { number:'03',icon:CheckCircle,title:'Enter Mpesa PIN',body:'An STK push arrives on your phone. Enter your PIN and your giving is complete. A receipt is generated instantly.' },
  ]
  return (
    <section id="how-it-works" style={{ background:'#F8F9FA',padding:'100px 40px' }}>
      <div style={{ maxWidth:1200,margin:'0 auto' }}>
        <div style={{ textAlign:'center',marginBottom:60 }}>
          <span style={{ fontFamily:'Inter',fontSize:12,fontWeight:600,color:'#C9A84C',letterSpacing:2,textTransform:'uppercase' }}>THE PROCESS</span>
          <h2 style={{ fontFamily:'Playfair Display,serif',fontSize:42,color:'#1E3A5F',marginTop:12 }}>Give in Three Simple Steps</h2>
        </div>
        <div style={{ display:'flex',justifyContent:'center',alignItems:'flex-start',flexWrap:'wrap' }}>
          {steps.map(({ number,icon:Icon,title,body },i)=>(
            <div key={number} style={{ display:'flex',alignItems:'flex-start' }}>
              <div style={{ textAlign:'center',maxWidth:280,padding:'0 20px' }}>
                <div style={{ width:64,height:64,borderRadius:'50%',background:'#C9A84C',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px' }}>
                  <span style={{ fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:700,color:'#fff' }}>{number}</span>
                </div>
                <Icon size={28} color="#1E3A5F" style={{ marginBottom:12 }}/>
                <h3 style={{ fontFamily:'Playfair Display,serif',fontSize:18,color:'#1E3A5F',marginBottom:10 }}>{title}</h3>
                <p style={{ fontFamily:'Inter',fontSize:14,color:'#6B7280',lineHeight:1.7 }}>{body}</p>
              </div>
              {i<steps.length-1&&<div style={{ flex:1,height:1,borderTop:'2px dashed #C9A84C',marginTop:32,minWidth:40,opacity:0.5 }}/>}
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center',marginTop:56 }}>
          <Link to="/login"><button style={{ background:'#1E3A5F',color:'#fff',height:52,padding:'0 36px',borderRadius:6,border:'none',fontFamily:'Inter',fontWeight:600,fontSize:16,cursor:'pointer',transition:'all 150ms' }} onMouseEnter={e=>e.currentTarget.style.background='#C9A84C'} onMouseLeave={e=>e.currentTarget.style.background='#1E3A5F'}>Start Giving Today</button></Link>
        </div>
      </div>
    </section>
  )
}

const Testimonials = () => {
  const testimonials = [
    { quote:'BlessPay has completely changed how I give. I no longer worry about carrying cash to church. I give from wherever I am and get a receipt instantly.',name:'Mary Wanjiku',role:'Church Member',avatar:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=80' },
    { quote:'As a church admin, tracking all our tithes and offerings used to take hours every Sunday. Now everything is in one dashboard. It has been a blessing.',name:'Pastor James Omondi',role:'Church Admin',avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80' },
    { quote:'Simple, fast and secure. I love that I can see my full giving history anytime. It keeps me accountable in my giving.',name:'David Kamau',role:'Church Member',avatar:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80' },
  ]
  return (
    <section style={{ background:'#fff',padding:'100px 40px' }}>
      <div style={{ maxWidth:1200,margin:'0 auto' }}>
        <div style={{ textAlign:'center',marginBottom:60 }}>
          <span style={{ fontFamily:'Inter',fontSize:12,fontWeight:600,color:'#C9A84C',letterSpacing:2,textTransform:'uppercase' }}>TESTIMONIALS</span>
          <h2 style={{ fontFamily:'Playfair Display,serif',fontSize:42,color:'#1E3A5F',marginTop:12 }}>What Our Members Say</h2>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24 }}>
          {testimonials.map(({ quote,name,role,avatar })=>(
            <div key={name} style={{ background:'#F8F9FA',border:'1px solid #E5E7EB',borderRadius:8,padding:32 }}>
              <div style={{ fontFamily:'Playfair Display,serif',fontSize:48,color:'#C9A84C',lineHeight:0.8,marginBottom:16 }}>"</div>
              <p style={{ fontFamily:'Inter',fontSize:14,color:'#6B7280',lineHeight:1.8,fontStyle:'italic',marginBottom:24 }}>{quote}</p>
              <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:12 }}>
                <img src={avatar} alt={name} style={{ width:40,height:40,borderRadius:'50%',objectFit:'cover' }}/>
                <div>
                  <div style={{ fontFamily:'Inter',fontSize:14,fontWeight:600,color:'#1E3A5F' }}>{name}</div>
                  <div style={{ fontFamily:'Inter',fontSize:12,color:'#6B7280' }}>{role}</div>
                </div>
              </div>
              <div style={{ display:'flex',gap:2 }}>{[...Array(5)].map((_,i)=><Star key={i} size={14} color="#C9A84C" fill="#C9A84C"/>)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const About = () => (
  <section id="about-us" style={{ background:'#1E3A5F',padding:'100px 40px' }}>
    <div style={{ maxWidth:1200,margin:'0 auto',display:'flex',gap:60,alignItems:'center',flexWrap:'wrap' }}>
      <div style={{ flex:'1 1 380px',position:'relative' }}>
        <img src="https://images.unsplash.com/photo-1438232992991-995b671e4d28?w=600&q=80" alt="Church community" style={{ width:'100%',borderRadius:16,objectFit:'cover',maxHeight:460 }}/>
        <div style={{ position:'absolute',bottom:16,right:16,background:'#fff',borderRadius:8,padding:'10px 16px' }}>
          <span style={{ fontFamily:'Inter',fontSize:13,fontWeight:600,color:'#1E3A5F' }}>Est. 2026 | Built for the Church</span>
        </div>
      </div>
      <div style={{ flex:'1 1 440px' }}>
        <span style={{ fontFamily:'Inter',fontSize:12,fontWeight:600,color:'#C9A84C',letterSpacing:2,textTransform:'uppercase' }}>ABOUT BLESSPAY</span>
        <h2 style={{ fontFamily:'Playfair Display,serif',fontSize:42,color:'#fff',marginTop:12,marginBottom:20,lineHeight:1.2 }}>Built With Faith,<br/>Designed With Purpose</h2>
        <p style={{ fontFamily:'Inter',fontSize:16,color:'#D1D5DB',lineHeight:1.8,marginBottom:16 }}>BlessPay was born from a simple belief — that giving to God should be effortless, transparent and accessible to every church member regardless of where they are.</p>
        <p style={{ fontFamily:'Inter',fontSize:16,color:'#D1D5DB',lineHeight:1.8,marginBottom:28 }}>We built BlessPay to bridge the gap between faith and modern technology, giving churches a reliable, secure and dignified platform to manage their tithes and offerings. Every line of code was written with the church community in mind.</p>
        <div style={{ display:'flex',gap:12,marginBottom:32,flexWrap:'wrap' }}>
          {['🙏 Built for African Churches','🔒 Bank-level Security'].map(chip=>(
            <span key={chip} style={{ background:'rgba(255,255,255,0.1)',color:'#fff',padding:'8px 16px',borderRadius:999,fontFamily:'Inter',fontSize:13,fontWeight:500 }}>{chip}</span>
          ))}
        </div>
        <button style={{ background:'none',border:'1.5px solid #C9A84C',color:'#C9A84C',height:44,padding:'0 24px',borderRadius:6,fontFamily:'Inter',fontWeight:600,fontSize:14,cursor:'pointer',transition:'all 150ms' }} onMouseEnter={e=>{e.currentTarget.style.background='#C9A84C';e.currentTarget.style.color='#1E3A5F'}} onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#C9A84C'}}>Learn More</button>
      </div>
    </div>
  </section>
)

const CTABanner = () => (
  <section style={{ background:'#C9A84C',padding:'80px 40px',textAlign:'center' }}>
    <h2 style={{ fontFamily:'Playfair Display,serif',fontSize:48,color:'#1E3A5F',marginBottom:12 }}>Ready to Give Faithfully?</h2>
    <p style={{ fontFamily:'Inter',fontSize:18,color:'#1E3A5F',marginBottom:36,opacity:0.85 }}>Join hundreds of church members already giving through BlessPay</p>
    <div style={{ display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap' }}>
      <Link to="/login"><button style={{ background:'#1E3A5F',color:'#fff',height:48,padding:'0 28px',borderRadius:6,border:'none',fontFamily:'Inter',fontWeight:600,fontSize:15,cursor:'pointer' }}>Get Started Free</button></Link>
      <button onClick={()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})} style={{ background:'none',color:'#1E3A5F',height:48,padding:'0 28px',borderRadius:6,border:'1.5px solid #1E3A5F',fontFamily:'Inter',fontWeight:600,fontSize:15,cursor:'pointer',transition:'all 150ms' }} onMouseEnter={e=>{e.currentTarget.style.background='#1E3A5F';e.currentTarget.style.color='#fff'}} onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#1E3A5F'}}>Contact Us</button>
    </div>
  </section>
)

const Footer = () => (
  <footer id="contact" style={{ background:'#1E3A5F',padding:'60px 40px 0' }}>
    <div style={{ maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:40,paddingBottom:40 }}>
      <div>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
          <span style={{ color:'#C9A84C',fontSize:18 }}>✝</span>
          <span style={{ fontFamily:'Playfair Display,serif',fontSize:20,fontWeight:700,color:'#C9A84C' }}>BlessPay</span>
        </div>
        <p style={{ fontFamily:'Inter',fontSize:13,color:'#9CA3AF',marginBottom:20,lineHeight:1.6 }}>Faithful Giving, Made Simple</p>
        <div style={{ display:'flex',gap:12 }}>
          {[Twitter,Facebook,Instagram].map((Icon,i)=><Icon key={i} size={18} color="#9CA3AF" style={{ cursor:'pointer' }}/>)}
        </div>
      </div>
      <div>
        <h4 style={{ fontFamily:'Inter',fontSize:14,fontWeight:600,color:'#fff',marginBottom:16 }}>Platform</h4>
        {['Features','How It Works','Security','Pricing'].map(link=><div key={link} style={{ marginBottom:10 }}><span style={{ fontFamily:'Inter',fontSize:13,color:'#9CA3AF',cursor:'pointer' }}>{link}</span></div>)}
      </div>
      <div>
        <h4 style={{ fontFamily:'Inter',fontSize:14,fontWeight:600,color:'#fff',marginBottom:16 }}>Support</h4>
        {['Help Center','Contact Us','Privacy Policy','Terms of Service'].map(link=><div key={link} style={{ marginBottom:10 }}><span style={{ fontFamily:'Inter',fontSize:13,color:'#9CA3AF',cursor:'pointer' }}>{link}</span></div>)}
      </div>
      <div>
        <h4 style={{ fontFamily:'Inter',fontSize:14,fontWeight:600,color:'#fff',marginBottom:16 }}>Contact</h4>
        {['📧 support@blesspay.com','📞 +254 700 000 000','📍 Nairobi, Kenya'].map(item=><div key={item} style={{ marginBottom:10 }}><span style={{ fontFamily:'Inter',fontSize:13,color:'#9CA3AF' }}>{item}</span></div>)}
      </div>
    </div>
    <div style={{ borderTop:'1px solid rgba(201,168,76,0.3)',padding:'20px 0',maxWidth:1200,margin:'0 auto' }}>
      <div style={{ display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8 }}>
        <span style={{ fontFamily:'Inter',fontSize:12,color:'#6B7280' }}>© 2026 BlessPay. All rights reserved.</span>
        <span style={{ fontFamily:'Inter',fontSize:12,color:'#6B7280' }}>Made with 🙏 for the Church</span>
      </div>
    </div>
  </footer>
)

const LandingPage = () => (
  <>
    <style>{`.desktop-nav{display:flex!important}.mobile-menu-btn{display:none!important}@media(max-width:768px){.desktop-nav{display:none!important}.mobile-menu-btn{display:block!important}}`}</style>
    <Navbar/><Hero/><Stats/><Features/><HowItWorks/><Testimonials/><About/><CTABanner/><Footer/>
  </>
)

export default LandingPage