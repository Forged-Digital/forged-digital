"use client";

import { supabase } from "@/lib/supabase";

export type PortalEmailPayload={
  client_id:string;
  audience:"client"|"admin";
  kind:string;
  title:string;
  body:string;
  href:string;
  cta?:string;
};

export async function sendPortalEmail(payload:PortalEmailPayload){
  try{
    const {data:{session}}=await supabase.auth.getSession();
    if(!session?.access_token)return {ok:false,error:"No active session"};
    const res=await fetch("/api/portal-email",{
      method:"POST",
      headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},
      body:JSON.stringify(payload),
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok)return {ok:false,error:data?.error||"Email notification failed"};
    return {ok:true};
  }catch(error:any){return {ok:false,error:error?.message||"Email notification failed"};}
}
