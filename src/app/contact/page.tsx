"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail, Phone, Globe2, Building2, UserRound } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import "./contact.css";

export default function ContactPage(){
  const [status,setStatus]=useState<"idle"|"sending"|"success"|"error">("idle");
  const [message,setMessage]=useState("");

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const form=e.currentTarget;
    const data=new FormData(form);
    setStatus("sending"); setMessage("");
    const name=String(data.get("name")||"").trim();
    const email=String(data.get("email")||"").trim();
    if(!name||!email){setStatus("error");setMessage("Name and email are required.");return;}
    const {error}=await supabase.from("contact_submissions").insert({
      name,
      company_name:String(data.get("company")||"").trim()||null,
      domain_or_website:String(data.get("website")||"").trim()||null,
      phone:String(data.get("phone")||"").trim()||null,
      email
    });
    if(error){setStatus("error");setMessage("Something went wrong. Please try again or contact us directly.");return;}
    form.reset(); setStatus("success"); setMessage("Got it. Your project information has been received.");
  }

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

      <form className="fd-contact-form" onSubmit={submit}>
        <label><span><UserRound size={16}/> NAME</span><input name="name" required autoComplete="name" placeholder="Your name"/></label>
        <label><span><Building2 size={16}/> COMPANY NAME</span><input name="company" autoComplete="organization" placeholder="Business or organization"/></label>
        <label><span><Globe2 size={16}/> DOMAIN / CURRENT WEBSITE</span><input name="website" inputMode="url" placeholder="example.com — if available"/></label>
        <div className="fd-contact-split">
          <label><span><Phone size={16}/> PHONE NUMBER</span><input name="phone" autoComplete="tel" inputMode="tel" placeholder="(555) 555-5555"/></label>
          <label><span><Mail size={16}/> EMAIL</span><input name="email" required type="email" autoComplete="email" placeholder="you@company.com"/></label>
        </div>
        <button type="submit" disabled={status==="sending"}>{status==="sending"?"SENDING...":"SEND PROJECT INFO"} <ArrowRight size={16}/></button>
        {message&&<small className={status==="success"?"form-success":"form-error"}>{message}</small>}
      </form>
    </section>
  </main>
}
