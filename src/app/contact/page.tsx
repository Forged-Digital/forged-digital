"use client";
import { ArrowLeft, ArrowRight, Mail, Phone, Globe2, Building2, UserRound } from "lucide-react";
import Link from "next/link";
import "./contact.css";

export default function ContactPage(){
  return <main className="fd-contact-page">
    <header className="fd-contact-nav">
      <Link href="/" className="fd-contact-logo"><img src="/assets/forged-logo-wide.webp" alt="Forged Digital"/></Link>
      <Link href="/" className="fd-contact-back"><ArrowLeft size={15}/> BACK TO HOME</Link>
    </header>

    <section className="fd-contact-shell">
      <div className="fd-contact-intro">
        <p>START A PROJECT</p>
        <h1>LET’S TALK ABOUT<br/>WHAT YOU’RE BUILDING.</h1>
        <span>Give us the basics. We’ll take it from there.</span>
        <div className="fd-contact-direct">
          <a href="mailto:Aaron.forgeddigital@gmail.com"><Mail size={16}/> Aaron.forgeddigital@gmail.com</a>
          <a href="tel:+18503901669"><Phone size={16}/> 850-390-1669</a>
        </div>
      </div>

      <form className="fd-contact-form" onSubmit={(e)=>e.preventDefault()}>
        <label><span><UserRound size={16}/> NAME</span><input name="name" autoComplete="name" placeholder="Your name"/></label>
        <label><span><Building2 size={16}/> COMPANY NAME</span><input name="company" autoComplete="organization" placeholder="Business or organization"/></label>
        <label><span><Globe2 size={16}/> DOMAIN / CURRENT WEBSITE</span><input name="website" inputMode="url" placeholder="example.com — if available"/></label>
        <div className="fd-contact-split">
          <label><span><Phone size={16}/> PHONE NUMBER</span><input name="phone" autoComplete="tel" inputMode="tel" placeholder="(555) 555-5555"/></label>
          <label><span><Mail size={16}/> EMAIL</span><input name="email" type="email" autoComplete="email" placeholder="you@company.com"/></label>
        </div>
        <button type="submit">SEND PROJECT INFO <ArrowRight size={16}/></button>
        <small>Preview form — submission handling will be connected after layout approval.</small>
      </form>
    </section>
  </main>
}
