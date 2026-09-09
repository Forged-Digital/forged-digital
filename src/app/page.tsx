"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Blocks, Code2, Gauge, Layers3, ShoppingCart, Workflow } from "lucide-react";
import { useRef } from "react";

const capabilities = [
  { icon: Layers3, title: "Web Design", text: "Purpose-built websites with a strong visual system and clear conversion paths." },
  { icon: Code2, title: "Development", text: "Custom front ends, application logic, integrations, and performance-focused builds." },
  { icon: ShoppingCart, title: "E-Commerce", text: "Modern storefronts, custom commerce experiences, and scalable product architecture." },
  { icon: Workflow, title: "Automation", text: "Connected workflows that reduce repetitive work and move data where it needs to go." },
  { icon: Blocks, title: "Business Systems", text: "Dashboards, member areas, operational tools, and custom internal systems." },
  { icon: Gauge, title: "Support", text: "Ongoing technical support, optimization, maintenance, and measured improvements." },
];

const projects = [
  {
    name: "Keep Huntsville Strange",
    type: "E-Commerce / Community / Custom Development",
    description: "A custom commerce and community platform built around a distinct local brand and growing digital ecosystem.",
  },
  {
    name: "Sacz Sweet Heat",
    type: "E-Commerce / Brand Experience",
    description: "A product-first storefront focused on fast shopping, clean merchandising, and a stronger branded customer experience.",
  },
];

const process = ["Discovery", "Direction", "Build", "Launch", "Support"];

function HeroMark() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 22 });
  const sy = useSpring(my, { stiffness: 90, damping: 22 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-7, 7]);

  return (
    <div
      ref={ref}
      className="hero-mark-wrap"
      onMouseMove={(event) => {
        const box = ref.current?.getBoundingClientRect();
        if (!box) return;
        mx.set((event.clientX - box.left) / box.width - 0.5);
        my.set((event.clientY - box.top) / box.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div className="hero-mark" style={{ rotateX, rotateY }}>
        <div className="hero-mark-outer" />
        <div className="hero-mark-core">FD</div>
        <div className="hero-glow" />
      </motion.div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header shell">
        <a className="brand" href="#top" aria-label="Forged Digital home">
          <span className="brand-mark">FD</span>
          <span className="brand-text">FORGED DIGITAL</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="nav-cta" href="#contact">Start a Project <ArrowRight size={16} /></a>
      </header>

      <section id="top" className="hero shell">
        <div className="hero-grid" />
        <div className="hero-noise" />
        <div className="hero-copy">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="eyebrow">
            FORGED DIGITAL
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08 }}>
            Custom digital work.<br /><span>No template mentality.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.18 }} className="hero-lead">
            Web design, development, e-commerce, integrations, and business systems built around the job they need to do.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.26 }} className="hero-actions">
            <a className="button button-primary" href="#contact">Start a Project <ArrowRight size={18} /></a>
            <a className="button button-secondary" href="#work">View Work</a>
          </motion.div>
        </div>
        <HeroMark />
      </section>

      <section className="discipline-bar" aria-label="Core disciplines">
        <div className="shell discipline-grid">
          {['Design', 'Development', 'Commerce', 'Automation'].map((item, index) => (
            <div key={item} className="discipline"><span>0{index + 1}</span>{item}</div>
          ))}
        </div>
      </section>

      <section id="services" className="section shell services-section">
        <div className="section-intro">
          <p className="eyebrow">Capabilities</p>
          <h2>Built for the business behind the screen.</h2>
          <p>Good visual work matters. So does everything underneath it. We approach both as one system.</p>
        </div>
        <div className="capability-grid">
          {capabilities.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              key={title}
              className="capability-card"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <Icon size={24} strokeWidth={1.6} />
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="work" className="section work-section">
        <div className="shell">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Selected Work</p>
              <h2>Real projects. Different problems.</h2>
            </div>
            <span className="section-number">02 / 04</span>
          </div>
          <div className="project-list">
            {projects.map((project, index) => (
              <motion.article
                className="project-card"
                key={project.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <div className="project-visual">
                  <div className="browser-frame">
                    <div className="browser-top"><span /><span /><span /></div>
                    <div className="project-screen">
                      <span>{project.name}</span>
                    </div>
                  </div>
                </div>
                <div className="project-copy">
                  <p className="project-type">{project.type}</p>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <a href="#contact">Project Details <ArrowRight size={16} /></a>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="section shell process-section">
        <div className="section-intro compact">
          <p className="eyebrow">Process</p>
          <h2>Clear steps. No mystery phase.</h2>
        </div>
        <div className="process-line">
          {process.map((item, index) => (
            <div className="process-step" key={item}>
              <div className="process-node"><span>{String(index + 1).padStart(2, '0')}</span></div>
              <h3>{item}</h3>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="shell contact-grid">
          <div>
            <p className="eyebrow">Start a Project</p>
            <h2>Tell us what you need built.</h2>
          </div>
          <div className="contact-links">
            <a href="mailto:Aaron.forgeddigital@gmail.com">Aaron.forgeddigital@gmail.com <ArrowRight size={18} /></a>
            <a href="tel:+18503901669">850-390-1669 <ArrowRight size={18} /></a>
          </div>
        </div>
      </section>

      <footer className="footer shell">
        <div className="brand footer-brand"><span className="brand-mark">FD</span><span className="brand-text">FORGED DIGITAL</span></div>
        <p>Forged-Digital.com</p>
      </footer>
    </main>
  );
}
