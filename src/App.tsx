import { useEffect, useMemo, useState } from 'react'
import rishabPhoto from './assets/rishab.jpg'
import rishabFormalPhoto from './assets/rishab-formal.png'

type IconName = 'arrow'|'audit'|'bank'|'briefcase'|'calculator'|'chart'|'check'|'document'|'external'|'linkedin'|'mail'|'menu'|'moon'|'phone'|'shield'|'sun'|'valuation'|'x'

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    audit: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    bank: <><path d="m3 10 9-7 9 7"/><path d="M5 10v9M9 10v9M15 10v9M19 10v9M3 21h18"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>,
    calculator: <><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    external: <><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
    linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><path d="M2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92z"/>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></>,
    valuation: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/><path d="m3 6 5-3 5 3 6-4"/></>,
    x: <path d="M18 6 6 18M6 6l12 12"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const NAV_LINKS = [['about','About'],['expertise','Expertise'],['experience','Experience'],['qualifications','Qualifications'],['contact','Contact']]
const EXPERTISE = [
  { icon:'audit' as IconName,title:'Audit & Assurance',summary:'Structured assurance work grounded in evidence, risk assessment and clear reporting.',points:['Statutory and internal audit','Risk-based audit planning','Controls and compliance reviews'] },
  { icon:'document' as IconName,title:'Financial Reporting',summary:'Preparation and review of financial information under applicable Nepalese standards.',points:['NFRS / NAS application','Financial statement review','Management reporting'] },
  { icon:'valuation' as IconName,title:'M&A and Valuation',summary:'Financial analysis that supports acquisitions, combinations and investment decisions.',points:['Merger and acquisition support','Business and equity valuation','Financial due diligence'] },
  { icon:'bank' as IconName,title:'Banking & Financial Services',summary:'Practical exposure to regulated institutions, operating controls and financial-sector reporting.',points:['Banking operations review','Regulatory compliance','Credit and treasury processes'] },
  { icon:'calculator' as IconName,title:'Tax & Compliance',summary:'Careful interpretation of tax and corporate requirements for sound compliance decisions.',points:['Income tax and VAT review','Corporate compliance','Tax risk assessment'] },
  { icon:'chart' as IconName,title:'Financial Advisory',summary:'Clear financial models and analysis for management, lenders and investors.',points:['Feasibility and projections','Cost and equity certification','Decision-support analysis'] },
]
const EXPERIENCE = [
  { category:'Banking & Finance',tag:'finance',title:'Banking and financial institutions',text:'Internal audit and assurance exposure across commercial banking, finance, deposit protection and capital-market environments.',highlights:['Internal audit','Treasury & operations','Regulatory compliance'] },
  { category:'Capital Markets',tag:'capital',title:'Capital markets and investments',text:'Audit and financial reporting assignments involving securities regulation, listed entities and investment activities.',highlights:['Statutory audit','Investment review','Financial reporting'] },
  { category:'Insurance',tag:'insurance',title:'Insurance sector',text:'Statutory audit exposure in the life-insurance sector with attention to regulated reporting and documentation.',highlights:['Audit execution','Regulated reporting','Evidence review'] },
  { category:'Public Sector',tag:'public',title:'Public and government-owned entities',text:'Audit experience with government-owned institutions and public-interest reporting environments.',highlights:['Public-sector audit','Procurement review','Compliance testing'] },
  { category:'Microfinance',tag:'microfinance',title:'Microfinance institutions',text:'Broad statutory audit and due-diligence exposure across Nepalese microfinance institutions.',highlights:['Statutory audit','Loan portfolio review','Due diligence'] },
  { category:'Infrastructure',tag:'infrastructure',title:'Hydropower and project finance',text:'Equity verification, cost certification and project-finance support for infrastructure assignments.',highlights:['Cost certification','Equity verification','Project finance'] },
]
const QUALIFICATIONS = [
  { year:'2026',title:'CAP III',body:'The Institute of Chartered Accountants of Nepal',note:'Passed in June 2026' },
  { year:'2023',title:'CAP II',body:'The Institute of Chartered Accountants of Nepal',note:'Passed in June 2023' },
  { year:'2022',title:'CAP I',body:'The Institute of Chartered Accountants of Nepal',note:'Passed in June 2022' },
  { year:'2026',title:'Bachelor of Business Studies',body:'Tribhuvan University',note:'Expected completion in 2026' },
]
const FILTERS = [['all','All'],['finance','Banking'],['capital','Capital Markets'],['insurance','Insurance'],['public','Public Sector'],['microfinance','Microfinance'],['infrastructure','Infrastructure']]

export default function App() {
  const [menuOpen,setMenuOpen] = useState(false)
  const [activeSection,setActiveSection] = useState('home')
  const [activeExpertise,setActiveExpertise] = useState<number|null>(null)
  const [filter,setFilter] = useState('all')
  const [theme,setTheme] = useState<'light'|'dark'>(() => (localStorage.getItem('rishab-theme') as 'light'|'dark') || 'light')
  const [scrollProgress,setScrollProgress] = useState(0)
  const filteredExperience = useMemo(() => filter === 'all' ? EXPERIENCE : EXPERIENCE.filter(item => item.tag === filter),[filter])

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('rishab-theme',theme) },[theme])
  useEffect(() => {
    const onScroll = () => { const total=document.documentElement.scrollHeight-window.innerHeight; setScrollProgress(total>0?(window.scrollY/total)*100:0) }
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.isIntersecting&&setActiveSection(entry.target.id)),{rootMargin:'-35% 0px -55% 0px'})
    document.querySelectorAll('main section[id]').forEach(section=>observer.observe(section))
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll()
    return()=>{observer.disconnect();window.removeEventListener('scroll',onScroll)}
  },[])
  useEffect(()=>{document.body.style.overflow=menuOpen?'hidden':'';return()=>{document.body.style.overflow=''}},[menuOpen])
  const goTo=(id:string)=>{document.getElementById(id)?.scrollIntoView({behavior:'smooth'});setMenuOpen(false)}

  return <div className="site-shell">
    <div className="scroll-progress" style={{width:`${scrollProgress}%`}}/>
    <header className="site-header">
      <a className="brand" href="#home" onClick={e=>{e.preventDefault();goTo('home')}} aria-label="CA. Rishab Dahal — home"><span className="brand-mark">RD</span><span className="brand-copy"><strong>CA. Rishab Dahal</strong><small>Audit · Advisory · Finance</small></span></a>
      <nav className="desktop-nav" aria-label="Primary navigation">{NAV_LINKS.map(([id,label])=><button key={id} className={activeSection===id?'active':''} onClick={()=>goTo(id)}>{label}</button>)}</nav>
      <div className="header-actions"><button className="icon-button" onClick={()=>setTheme(theme==='light'?'dark':'light')} aria-label={`Switch to ${theme==='light'?'dark':'light'} theme`}><Icon name={theme==='light'?'moon':'sun'}/></button><button className="icon-button menu-button" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}><Icon name={menuOpen?'x':'menu'}/></button></div>
    </header>
    <div className={`mobile-menu ${menuOpen?'open':''}`} aria-hidden={!menuOpen}><div className="mobile-menu-inner">{NAV_LINKS.map(([id,label],index)=><button key={id} onClick={()=>goTo(id)}><span>0{index+1}</span>{label}</button>)}<a href="mailto:mail@carishabdahal.com.np">mail@carishabdahal.com.np <Icon name="arrow"/></a></div></div>

    <main>
      <section id="home" className="hero">
        <div className="hero-grid" aria-hidden="true"/>
        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow"><span/> Chartered Accountant · Nepal</p>
            <h1>Financial clarity<br/>for <em>decisive</em> action.</h1>
            <p className="hero-intro">I’m Rishab Dahal, a Chartered Accountant working across audit, financial reporting, due diligence, valuation and advisory.</p>
            <div className="hero-actions"><button className="button primary" onClick={()=>goTo('experience')}>Explore my experience <Icon name="arrow"/></button><a className="button secondary" href="mailto:mail@carishabdahal.com.np">Start a conversation</a></div>
            <div className="hero-proof"><div><strong>CA</strong><span>Qualified<br/>June 2026</span></div><div><strong>6</strong><span>Core areas<br/>of expertise</span></div></div>
          </div>
          <div className="portrait-stage"><div className="portrait-frame"><img src={rishabPhoto} alt="CA. Rishab Dahal"/></div><div className="portrait-card role-card"><span>Current role</span><strong>Assistant Manager</strong><small>K.J. & Associates</small></div><div className="portrait-card location-card"><Icon name="briefcase"/><span>Kathmandu<br/><strong>Nepal</strong></span></div><div className="gold-rule"/></div>
        </div>
        <button className="scroll-cue" onClick={()=>goTo('about')} aria-label="Scroll to about"><span>Scroll to discover</span><i/></button>
      </section>

      <section id="about" className="section about-section">
        <div className="section-index">01</div>
        <div className="section-heading about-heading"><p className="eyebrow"><span/> About</p><h2>Rigour in the detail.<br/><em>Perspective beyond it.</em></h2></div>
        <div className="about-banner"><img src={rishabFormalPhoto} alt="CA. Rishab Dahal in traditional Nepali formal dress"/></div>
        <div className="about-layout"><div className="about-lead"><p>I bring structured analysis and practical judgment to complex financial questions.</p></div><div className="about-body">
          <p>I’m CA. Rishab Dahal, a Chartered Accountant and Assistant Manager at K.J. &amp; Associates. I have practical experience in statutory and internal audits, financial reporting, regulatory compliance, mergers and acquisitions, business valuation, and assurance engagements across banking, insurance, microfinance, hydropower, government institutions, and other corporate sectors.</p>
          <p>I am committed to professional integrity, continuous learning, and delivering practical solutions that strengthen financial discipline and support informed business decisions.</p>
          <div className="principles"><div><Icon name="shield"/><span><strong>Integrity</strong>Objective, evidence-led work</span></div><div><Icon name="check"/><span><strong>Precision</strong>Careful analysis and reporting</span></div><div><Icon name="chart"/><span><strong>Commercial insight</strong>Advice grounded in context</span></div></div>
        </div></div>
      </section>

      <section id="expertise" className="section expertise-section">
        <div className="section-index">02</div>
        <div className="section-heading split-heading"><div><p className="eyebrow"><span/> Expertise</p><h2>Where analysis<br/><em>meets action.</em></h2></div><p>Select an area to see the work behind it.</p></div>
        <div className="expertise-grid">{EXPERTISE.map((item,index)=>{const open=activeExpertise===index;return <article className={`expertise-card ${open?'open':''}`} key={item.title}><button onClick={()=>setActiveExpertise(open?null:index)} aria-expanded={open}><span className="service-number">0{index+1}</span><span className="service-icon"><Icon name={item.icon}/></span><span className="service-copy"><strong>{item.title}</strong><small>{item.summary}</small></span><span className="service-toggle"><Icon name={open?'x':'arrow'}/></span></button><div className="expertise-details" aria-hidden={!open}><ul>{item.points.map(point=><li key={point}><Icon name="check" size={16}/>{point}</li>)}</ul></div></article>})}</div>
      </section>

      <section id="experience" className="section experience-section">
        <div className="section-index">03</div>
        <div className="section-heading split-heading"><div><p className="eyebrow"><span/> Selected experience</p><h2>Experience across<br/><em>regulated sectors.</em></h2></div><p>Professional exposure developed through audit, assurance and advisory assignments.</p></div>
        <div className="filter-bar" role="tablist" aria-label="Filter experience by sector">{FILTERS.map(([id,label])=><button key={id} role="tab" aria-selected={filter===id} className={filter===id?'active':''} onClick={()=>setFilter(id)}>{label}</button>)}</div>
        <div className="experience-grid" aria-live="polite">{filteredExperience.map((item,index)=><article className="experience-card" key={item.tag} style={{'--delay':`${index*55}ms`} as React.CSSProperties}><span className="experience-category">{item.category}</span><h3>{item.title}</h3><p>{item.text}</p><div className="tag-list">{item.highlights.map(tag=><span key={tag}>{tag}</span>)}</div></article>)}</div>
        <p className="confidentiality-note"><Icon name="shield" size={16}/> Engagement details are presented at sector level to respect professional confidentiality.</p>
      </section>

      <section id="qualifications" className="section qualifications-section">
        <div className="section-index">04</div>
        <div className="qualifications-layout"><div className="section-heading sticky-heading"><p className="eyebrow"><span/> Qualifications</p><h2>A foundation built<br/>through <em>discipline.</em></h2><p>Academic preparation supported by three years of practical training and continuing professional development.</p></div><div className="timeline">
          {QUALIFICATIONS.map((item,index)=><article key={item.title} className="timeline-item"><div className="timeline-year">{item.year}</div><div className="timeline-dot"/><div className="timeline-copy"><span>0{index+1}</span><h3>{item.title}</h3><p>{item.body}</p><small>{item.note}</small></div></article>)}
          <article className="timeline-item training-item"><div className="timeline-year">Training</div><div className="timeline-dot"/><div className="timeline-copy"><span>05</span><h3>ICAN Information Technology Training</h3><p>100 hours completed across two programmes</p><small>60 hours in 2023 · 40 hours in 2025</small></div></article>
        </div></div>
        <div className="career-strip"><div><span>2023 — 2026</span><strong>Articleship</strong><small>K.J. & Associates</small></div><Icon name="arrow"/><div><span>2026 — Present</span><strong>Assistant Manager</strong><small>K.J. & Associates</small></div></div>
      </section>

      <section id="contact" className="section contact-section">
        <div className="contact-background" aria-hidden="true">RD</div>
        <div className="contact-layout"><div className="contact-copy"><p className="eyebrow"><span/> Contact</p><h2>Let’s discuss the<br/><em>numbers that matter.</em></h2><p>For professional enquiries, collaborations or a conversation about an audit, reporting or advisory requirement, get in touch.</p><div className="contact-links"><a href="mailto:mail@carishabdahal.com.np"><span><Icon name="mail"/><small>Personal email</small><strong>mail@carishabdahal.com.np</strong></span><Icon name="arrow"/></a><a href="mailto:rishab@kjassociates.com.np"><span><Icon name="mail"/><small>Work email</small><strong>rishab@kjassociates.com.np</strong></span><Icon name="arrow"/></a><a href="tel:+9779802351674"><span><Icon name="phone"/><small>Phone 1</small><strong>+977 980 235 1674</strong></span><Icon name="arrow"/></a><a href="tel:+9779841846169"><span><Icon name="phone"/><small>Phone 2</small><strong>+977 984 184 6169</strong></span><Icon name="arrow"/></a><a href="https://www.linkedin.com/in/riishabb" target="_blank" rel="noreferrer"><span><Icon name="linkedin"/><small>LinkedIn</small><strong>linkedin.com/in/riishabb</strong></span><Icon name="external"/></a></div></div><ContactForm/></div>
      </section>
    </main>
    <footer><div className="footer-brand"><span className="brand-mark">RD</span><div><strong>CA. Rishab Dahal</strong><small>Kathmandu, Nepal</small></div></div><p>© {new Date().getFullYear()} Rishab Dahal. All rights reserved.</p><button onClick={()=>goTo('home')}>Back to top <span>↑</span></button></footer>
  </div>
}

function ContactForm() {
  const [form,setForm]=useState({name:'',email:'',subject:'',message:''})
  const [status,setStatus]=useState('')
  const update=(field:keyof typeof form,value:string)=>setForm(current=>({...current,[field]:value}))
  const submit=(event:React.FormEvent)=>{event.preventDefault();const subject=encodeURIComponent(form.subject||`Website enquiry from ${form.name}`);const body=encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);window.location.href=`mailto:mail@carishabdahal.com.np,rishab@kjassociates.com.np?subject=${subject}&body=${body}`;setStatus('Your email app has been opened with the message ready to send.')}
  return <form className="contact-form" onSubmit={submit}><div className="form-heading"><span>Send an enquiry</span><small>All fields are required</small></div><div className="field-row"><label><span>Name</span><input required autoComplete="name" value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Your full name"/></label><label><span>Email</span><input required type="email" autoComplete="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@company.com"/></label></div><label><span>Subject</span><input required value={form.subject} onChange={e=>update('subject',e.target.value)} placeholder="What would you like to discuss?"/></label><label><span>Message</span><textarea required rows={5} value={form.message} onChange={e=>update('message',e.target.value)} placeholder="Share a little context about your enquiry…"/></label><button className="button primary form-submit" type="submit">Prepare email <Icon name="arrow"/></button>{status&&<p className="form-status" role="status"><Icon name="check" size={16}/> {status}</p>}</form>
}
