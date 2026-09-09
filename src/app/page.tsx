"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Blocks, Code2, Gauge, Layers3, ShoppingCart, Workflow } from "lucide-react";
import { useRef } from "react";

const capabilities = [
  { icon: Layers3, title: "Web Design", text: "Visual systems, responsive interfaces, and conversion-focused page design." },
  { icon: Code2, title: "Development", text: "Custom front ends, application logic, integrations, and performance-focused builds." },
  { icon: ShoppingCart, title: "E-Commerce", text: "Storefronts and commerce experiences built around how customers actually shop." },
  { icon: Workflow, title: "Automation", text: "Connected workflows that cut repetitive work and keep business data moving." },
  { icon: Blocks, title: "Business Systems", text: "Dashboards, member areas, operational tools, and custom internal systems." },
  { icon: Gauge, title: "Support", text: "Maintenance, optimization, technical support, and ongoing improvements after launch." },
];

const projects = [
  { name: "Keep Huntsville Strange", url: "https://keephuntsvillestrange.com", type: "E-Commerce / Community / Custom Development", description: "Commerce, community, identity, and custom application work built into one connected digital platform.", code: "KHS" },
  { name: "Sacz Sweet Heat", url: "https://saczsweetheat.com", type: "E-Commerce / Brand Experience", description: "A focused product storefront with custom merchandising and a cleaner branded customer experience.", code: "SACZ" },
];

const process = ["Discovery", "Direction", "Build", "Launch", "Support"];

function BrandMark({ small = false }: { small?: boolean }) {
  return <span className={small ? "fd-mark fd-mark-small" : "fd-mark"} aria-hidden="true"><i>F</i><b>D</b></span>;
}

function HeroMark() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 18 });
  const sy = useSpring(my, { stiffness: 70, damping: 18 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-9, 9]);
  const glowX = useTransform(sx, [-0.5, 0.5], ["34%", "66%"]);
  const glowY = useTransform(sy, [-0.5, 0.5], ["34%", "66%"]);
  return <div ref={ref} className="hero-mark-wrap" onMouseMove={(e) => { const box=ref.current?.getBoundingClientRect(); if(!box)return; mx.set((e.clientX-box.left)/box.width-.5); my.set((e.clientY-box.top)/box.height-.5); }} onMouseLeave={()=>{mx.set(0);my.set(0)}}>
    <motion.div className="cursor-glow" style={{ left: glowX, top: glowY }} />
    <motion.div className="hero-mark" style={{ rotateX, rotateY }}><div className="hero-mark-shadow"/><div className="hero-mark-shell"><BrandMark /></div><div className="heat-line heat-one"/><div className="heat-line heat-two"/></motion.div>
  </div>;
}

export default function Home() {
  return <main>
    <header className="site-header shell">
      <a className="brand" href="#top" aria-label="Forged Digital home"><BrandMark small/><span className="brand-lockup"><strong>FORGED</strong><em>DIGITAL</em></span></a>
      <nav aria-label="Primary navigation"><a href="#work">Work</a><a href="#services">Capabilities</a><a href="#process">Process</a><a href="#contact">Contact</a></nav>
      <a className="nav-cta" href="#contact">Start a Project <ArrowUpRight size={15}/></a>
    </header>

    <section id="top" className="hero shell">
      <div className="hero-grid"/><div className="hero-vignette"/><div className="hero-copy">
        <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="eyebrow"><span/>Independent design & development</motion.p>
        <motion.h1 initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={{duration:.65,delay:.08}}>Digital work<br/><span>built with intent.</span></motion.h1>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.2}} className="hero-lead">Web design, development, e-commerce, integrations, and business systems — designed and built around the actual job.</motion.p>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.28}} className="hero-actions"><a className="button button-primary" href="#work">Selected Work <ArrowUpRight size={17}/></a><a className="button button-secondary" href="#contact">Start a Project</a></motion.div>
        <div className="hero-meta"><span>Atmore, Alabama</span><span>Available for select projects</span></div>
      </div><HeroMark/>
    </section>

    <section className="discipline-bar"><div className="shell discipline-grid">{["Design","Development","Commerce","Automation"].map((x,i)=><div className="discipline" key={x}><span>0{i+1}</span><strong>{x}</strong></div>)}</div></section>

    <section id="services" className="section shell services-section"><div className="section-intro sticky-intro"><p className="eyebrow"><span/>Capabilities</p><h2>Design is only half the job.</h2><p>The interface has to look right. The system underneath it has to work right. We handle both.</p></div><div className="capability-grid">{capabilities.map(({icon:Icon,title,text},i)=><motion.article key={title} className="capability-card" initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.2}} transition={{duration:.4,delay:i*.04}}><div className="card-top"><span>0{i+1}</span><Icon size={22} strokeWidth={1.5}/></div><h3>{title}</h3><p>{text}</p><div className="card-rule"/></motion.article>)}</div></section>

    <section id="work" className="section work-section"><div className="shell"><div className="section-heading-row"><div><p className="eyebrow"><span/>Selected Work</p><h2>Built, shipped, used.</h2></div><span className="section-number">02 PROJECTS</span></div><div className="project-list">{projects.map((p,i)=><motion.article className="project-card" key={p.name} initial={{opacity:0,y:25}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.2}}><div className="project-visual"><div className="project-index">0{i+1}</div><div className="browser-frame"><div className="browser-top"><span/><span/><span/><small>{p.url.replace("https://","")}</small></div><div className="project-screen"><div className="project-monogram">{p.code}</div><div className="screen-grid"/></div></div></div><div className="project-copy"><p className="project-type">{p.type}</p><h3>{p.name}</h3><p>{p.description}</p><a href={p.url} target="_blank" rel="noreferrer">Visit Project <ArrowUpRight size={16}/></a></div></motion.article>)}</div></div></section>

    <section id="process" className="section shell process-section"><div className="section-intro compact"><p className="eyebrow"><span/>Process</p><h2>A straightforward build process.</h2></div><div className="process-line">{process.map((x,i)=><div className="process-step" key={x}><div className="process-node"><span>{String(i+1).padStart(2,"0")}</span></div><h3>{x}</h3><p>{["Understand the business, audience, and actual problem.","Lock the visual and technical direction before the heavy build.","Design, develop, test, and refine the working product.","Production deployment, final checks, and handoff.","Keep it maintained, measured, and improving."][i]}</p></div>)}</div></section>

    <section id="contact" className="contact-section"><div className="shell contact-grid"><div><p className="eyebrow"><span/>Start a Project</p><h2>Have something worth building?</h2></div><div className="contact-links"><a href="mailto:Aaron.forgeddigital@gmail.com"><span>Email</span><strong>Aaron.forgeddigital@gmail.com</strong><ArrowUpRight size={18}/></a><a href="tel:+18503901669"><span>Phone</span><strong>850-390-1669</strong><ArrowUpRight size={18}/></a></div></div></section>
    <footer className="footer shell"><div className="brand footer-brand"><BrandMark small/><span className="brand-lockup"><strong>FORGED</strong><em>DIGITAL</em></span></div><p>Forged-Digital.com · © 2026</p></footer>
  </main>;
}
