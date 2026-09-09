"use client";

import { ArrowRight, Link2, Settings, Shield, ShoppingCart, Users, Monitor } from "lucide-react";

const services = [
  { icon: Monitor, title: "Web Design", text: "Custom, high-converting websites." },
  { icon: ShoppingCart, title: "E-Commerce", text: "Online stores that scale with you." },
  { icon: Link2, title: "Integrations", text: "Connect your tools. Streamline your workflow." },
  { icon: Settings, title: "Automation", text: "Work less. Do more." },
  { icon: Users, title: "Memberships", text: "Communities, courses, client portals." },
  { icon: Shield, title: "Ongoing Support", text: "Keep your site fast, secure, and growing." },
];

const steps = ["Discovery", "Design", "Build", "Launch", "Support"];

export default function Home() {
  return (
    <main>
      <section className="concept-stage" aria-label="Forged Digital homepage">
        <img className="concept-stage-image" src="/concept/concept-full.webp" alt="" aria-hidden="true" />
        <a className="hotspot hs-logo" href="#top" aria-label="Forged Digital home" />
        <a className="hotspot hs-work" href="#work" aria-label="Work" />
        <a className="hotspot hs-services" href="#services" aria-label="Services" />
        <a className="hotspot hs-process" href="#process" aria-label="Process" />
        <a className="hotspot hs-about" href="#about" aria-label="About" />
        <a className="hotspot hs-start-top" href="mailto:Aaron.forgeddigital@gmail.com" aria-label="Start a project" />
        <a className="hotspot hs-start-hero" href="mailto:Aaron.forgeddigital@gmail.com" aria-label="Start a project" />
        <a className="hotspot hs-build" href="#services" aria-label="See what we build" />
        <a className="hotspot hs-services-btn" href="#services" aria-label="Explore all services" />
        <a className="hotspot hs-projects" href="#work" aria-label="View all projects" />
        <a className="hotspot hs-project" href="https://keephuntsvillestrange.com" target="_blank" rel="noreferrer" aria-label="View Keep Huntsville Strange project" />
        <a className="hotspot hs-process-btn" href="#process" aria-label="Our process" />
        <a className="hotspot hs-footer-contact" href="mailto:Aaron.forgeddigital@gmail.com" aria-label="Contact Forged Digital" />
      </section>

      <section className="mobile-build" id="top">
        <header className="mobile-header">
          <div className="mobile-brand"><span className="mobile-mark">FD</span><div><strong>FORGED</strong><small>DIGITAL</small></div></div>
          <a href="mailto:Aaron.forgeddigital@gmail.com">START A PROJECT</a>
        </header>
        <section className="mobile-hero">
          <p>FORGED DIGITAL</p>
          <h1>WEBSITES BUILT<br/>TO <em>HIT DIFFERENT.</em></h1>
          <span>Custom web design, e-commerce, integrations, and digital systems built around your business — not a template.</span>
          <div><a className="m-red" href="mailto:Aaron.forgeddigital@gmail.com">START A PROJECT <ArrowRight size={15}/></a><a className="m-dark" href="#services">SEE WHAT WE BUILD</a></div>
        </section>
        <section className="mobile-disciplines">{["DESIGN.","DEVELOPMENT.","COMMERCE.","AUTOMATION."].map(x=><b key={x}>{x}</b>)}</section>
        <section id="services" className="mobile-section"><p className="m-label">CAPABILITIES</p><h2>MORE THAN WEBSITES.<br/>WE BUILD <em>DIGITAL INFRASTRUCTURE.</em></h2><div className="mobile-services">{services.map(({icon:Icon,title,text})=><article key={title}><Icon/><h3>{title}</h3><p>{text}</p></article>)}</div></section>
        <section id="work" className="mobile-section mobile-work"><p className="m-label">FEATURED WORK</p><h2>REAL BUSINESSES.<br/>REAL RESULTS.</h2><div className="mobile-device-card"><strong>KHS</strong><span>E-COMMERCE / BRANDING / SEO</span><p>A high-performance e-commerce store built for a brand that lives outside the ordinary.</p><a href="https://keephuntsvillestrange.com" target="_blank" rel="noreferrer">VIEW PROJECT <ArrowRight size={14}/></a></div></section>
        <section id="process" className="mobile-section mobile-process"><p className="m-label">OUR PROCESS</p><h2>A CLEAR PATH<br/>FROM IDEA TO IMPACT.</h2><div>{steps.map((step,i)=><article key={step}><b>0{i+1}</b><span/><h3>{step}</h3></article>)}</div></section>
        <footer id="about" className="mobile-footer"><strong>FORGED DIGITAL</strong><a href="mailto:Aaron.forgeddigital@gmail.com">Aaron.forgeddigital@gmail.com</a><a href="tel:+18503901669">850-390-1669</a></footer>
      </section>

      <div className="sr-only">
        <h1>Forged Digital</h1><p>Custom web design, e-commerce, integrations, automation, memberships, and ongoing website support.</p>
      </div>
    </main>
  );
}
