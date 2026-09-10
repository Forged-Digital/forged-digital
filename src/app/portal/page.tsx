"use client";
import { useState } from "react";
import { UserRound, Building2, Globe2, Gauge, Palette, MessageSquare, LogOut, Upload, Check, Clock3, Circle, Send, ChevronRight } from "lucide-react";
import Link from "next/link";
import "./portal.css";

type Tab="customer"|"business"|"website"|"progress"|"branding"|"chat";
const menu:[Tab,string,any][]=[
  ["customer","Customer Info",UserRound],
  ["business","Business Info",Building2],
  ["website","Website Info",Globe2],
  ["progress","Build Progress",Gauge],
  ["branding","Branding",Palette],
  ["chat","Private Chat",MessageSquare],
];

function Field({label,value}:{label:string,value:string}){return <div className="portal-field"><span>{label}</span><b>{value}</b></div>}
function SectionTitle({eyebrow,title,copy}:{eyebrow:string,title:string,copy:string}){return <div className="portal-section-title"><p>{eyebrow}</p><h1>{title}</h1><span>{copy}</span></div>}

export default function PortalPage(){
  const [tab,setTab]=useState<Tab>("progress");
  return <main className="portal-page">
    <aside className="portal-sidebar">
      <Link href="/" className="portal-brand"><img src="/assets/forged-logo-stacked.webp" alt="Forged Digital"/></Link>
      <div className="portal-client-mini"><span>CLIENT PORTAL</span><b>Acme Manufacturing</b><small>Project #FD-2026-014</small></div>
      <nav>{menu.map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><Icon size={17}/><span>{label}</span><ChevronRight size={14}/></button>)}</nav>
      <button className="portal-signout"><LogOut size={16}/> SIGN OUT</button>
    </aside>

    <section className="portal-main">
      <header className="portal-topbar">
        <div><span>PROJECT STATUS</span><b>Website Build In Progress</b></div>
        <div className="portal-status"><i/> ACTIVE PROJECT</div>
      </header>

      <div className="portal-content">
        {tab==="customer"&&<><SectionTitle eyebrow="ACCOUNT" title="CUSTOMER INFO" copy="Primary contact information for this project."/><div className="portal-grid two"><Field label="NAME" value="Jordan Mitchell"/><Field label="EMAIL" value="jordan@acmemfg.com"/><Field label="PHONE" value="(256) 555-0148"/><Field label="ROLE" value="Owner / Project Contact"/></div></>}

        {tab==="business"&&<><SectionTitle eyebrow="BUSINESS" title="BUSINESS INFO" copy="Core business details used throughout the project."/><div className="portal-grid two"><Field label="COMPANY" value="Acme Manufacturing"/><Field label="INDUSTRY" value="Industrial Manufacturing"/><Field label="PRIMARY MARKET" value="Southeastern United States"/><Field label="BUSINESS ADDRESS" value="Huntsville, Alabama"/></div><div className="portal-note"><span>BUSINESS SUMMARY</span><p>Custom fabrication and industrial production company serving commercial and government-sector clients.</p></div></>}

        {tab==="website"&&<><SectionTitle eyebrow="WEBSITE" title="WEBSITE INFO" copy="Domain, platform, goals, and project-specific website details."/><div className="portal-grid two"><Field label="DOMAIN" value="acmemfg.com"/><Field label="CURRENT PLATFORM" value="WordPress"/><Field label="NEW PLATFORM" value="Next.js / Custom"/><Field label="TARGET LAUNCH" value="November 2026"/></div><div className="portal-note"><span>PROJECT GOALS</span><p>Modernize the public site, improve lead generation, simplify product discovery, and establish a scalable foundation for future integrations.</p></div></>}

        {tab==="progress"&&<><SectionTitle eyebrow="PROJECT" title="WEBSITE BUILD PROGRESS" copy="A clear view of what is complete, what is active, and what comes next."/><div className="progress-summary"><div><span>OVERALL PROGRESS</span><strong>62%</strong></div><div className="progress-track"><i style={{width:"62%"}}/></div></div><div className="milestone-list">
          <article className="done"><Check/><div><b>Discovery & Planning</b><span>Goals, sitemap, functionality, audience and requirements</span></div><small>COMPLETE</small></article>
          <article className="done"><Check/><div><b>Visual Direction</b><span>Brand direction, page structure and interface system</span></div><small>COMPLETE</small></article>
          <article className="active"><Clock3/><div><b>Development</b><span>Frontend build, responsive behavior and core functionality</span></div><small>IN PROGRESS</small></article>
          <article><Circle/><div><b>Content & Integrations</b><span>Final content, forms, automations and third-party connections</span></div><small>UP NEXT</small></article>
          <article><Circle/><div><b>QA & Launch</b><span>Testing, final review, DNS and production launch</span></div><small>PENDING</small></article>
        </div></>}

        {tab==="branding"&&<><SectionTitle eyebrow="ASSETS" title="BRANDING" copy="A shared workspace for logos, colors, fonts, photos, and brand references."/><div className="brand-upload-grid"><div className="upload-card"><Upload size={24}/><b>LOGOS</b><span>Upload primary, alternate, icon, SVG, PNG or WebP files.</span><button>ADD LOGO FILES</button></div><div className="upload-card"><Upload size={24}/><b>BRAND ASSETS</b><span>Colors, fonts, style guides, photos, textures and references.</span><button>ADD BRAND FILES</button></div></div><div className="asset-list"><div><span className="asset-icon">FD</span><p><b>Primary Logo</b><small>forged-logo-primary.svg · Added by Forged Digital</small></p><strong>APPROVED</strong></div><div><span className="asset-icon">Aa</span><p><b>Typography Reference</b><small>brand-fonts.pdf · Added by Client</small></p><strong>RECEIVED</strong></div></div></>}

        {tab==="chat"&&<><SectionTitle eyebrow="DIRECT" title="PRIVATE CHAT" copy="Project-specific conversation between you and Forged Digital."/><div className="chat-shell"><div className="chat-history"><div className="chat-message them"><small>FORGED DIGITAL · 9:18 AM</small><p>I uploaded the revised homepage layout. Take a look when you get a chance and let me know what you want changed.</p></div><div className="chat-message me"><small>YOU · 9:42 AM</small><p>Homepage looks good. Can we tighten the spacing on mobile and make the project gallery more prominent?</p></div><div className="chat-message them"><small>FORGED DIGITAL · 9:51 AM</small><p>Yep. I’ll roll those into the current build and update the progress tab when that pass is complete.</p></div></div><div className="chat-compose"><textarea placeholder="Write a message to Forged Digital..."/><button><Send size={17}/> SEND</button></div></div></>}
      </div>
    </section>
  </main>
}
