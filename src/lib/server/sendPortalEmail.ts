"use server";

import { createClient } from "@supabase/supabase-js";

const SITE_URL="https://forged-digital-chi.vercel.app";
const FROM="Forged Digital <notifications@forged-digital.com>";
const ADMIN_EMAIL="Aaron.forgeddigital@gmail.com";

type Payload={accessToken:string;client_id:string;audience:"client"|"admin";kind:string;title:string;body:string;href:string;cta?:string};
const esc=(v:string)=>(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]||c));

function html(title:string,body:string,href:string,cta:string){const url=href.startsWith("http")?href:`${SITE_URL}${href.startsWith("/")?href:`/${href}`}`;return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#070808;font-family:Arial,Helvetica,sans-serif;color:#f3f3f3"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#070808"><tr><td align="center" style="padding-top:30px;padding-right:12px;padding-bottom:30px;padding-left:12px"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:#0d0f0f;border:1px solid #272929"><tr><td style="padding-top:26px;padding-right:30px;padding-bottom:26px;padding-left:30px;border-bottom:1px solid #272929"><img src="${SITE_URL}/assets/forged-logo-wide.webp" width="190" height="50" border="0" alt="Forged Digital" style="display:block;width:190px;height:auto"></td></tr><tr><td style="padding-top:34px;padding-right:30px;padding-bottom:34px;padding-left:30px"><p style="margin-top:0;margin-right:0;margin-bottom:10px;margin-left:0;color:#df2b2b;font-size:11px;line-height:16px;font-weight:800;letter-spacing:2px">CLIENT PORTAL</p><h1 style="margin-top:0;margin-right:0;margin-bottom:16px;margin-left:0;color:#fff;font-size:28px;line-height:34px">${esc(title)}</h1><p style="margin-top:0;margin-right:0;margin-bottom:26px;margin-left:0;color:#b6b6b6;font-size:15px;line-height:24px">${esc(body)}</p><table cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#a91616" style="background-color:#a91616;border:1px solid #cf2a2a"><a href="${url}" style="display:inline-block;padding-top:13px;padding-right:18px;padding-bottom:13px;padding-left:18px;color:#fff;text-decoration:none;font-size:12px;line-height:16px;font-weight:800;letter-spacing:1px">${esc(cta||"OPEN PORTAL")}</a></td></tr></table></td></tr><tr><td style="padding-top:18px;padding-right:30px;padding-bottom:18px;padding-left:30px;border-top:1px solid #272929;color:#727272;font-size:11px;line-height:17px">Forged Digital · Secure client workspace notification</td></tr></table></td></tr></table></body></html>`;}

export async function sendPortalEmailServer(p:Payload){
  try{
    const resendKey=process.env.RESEND_API_KEY;
    const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(!resendKey)return {ok:false,error:"Email service is not configured"};
    if(!supabaseUrl||!publishableKey||!p.accessToken)return {ok:false,error:"Authentication is not configured"};
    const db=createClient(supabaseUrl,publishableKey,{global:{headers:{Authorization:`Bearer ${p.accessToken}`}}});
    const {data:{user}}=await db.auth.getUser();
    if(!user)return {ok:false,error:"Unauthorized"};
    const [{data:profile},{data:client}]=await Promise.all([db.from("profiles").select("role").eq("id",user.id).single(),db.from("client_accounts").select("id,user_id,email").eq("id",p.client_id).single()]);
    if(!profile||!client)return {ok:false,error:"Access denied"};
    const isAdmin=profile.role==="admin";
    if(!isAdmin&&client.user_id!==user.id)return {ok:false,error:"Access denied"};
    if(isAdmin&&p.audience!=="client")return {ok:false,error:"Access denied"};
    if(!isAdmin&&p.audience!=="admin")return {ok:false,error:"Access denied"};
    const to=isAdmin?String(client.email||"").trim():ADMIN_EMAIL;
    if(!to)return {ok:false,error:"No recipient email found"};
    const target=p.href.startsWith("http")?p.href:`${SITE_URL}${p.href.startsWith("/")?p.href:`/${p.href}`}`;
    const title=String(p.title||"Forged Digital Update").slice(0,160),body=String(p.body||"").slice(0,2000),cta=String(p.cta||"OPEN PORTAL").slice(0,80),kind=String(p.kind||"portal_update").replace(/[^A-Za-z0-9_-]/g,"-").slice(0,64);
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${resendKey}`,"Content-Type":"application/json"},body:JSON.stringify({from:FROM,to:[to],subject:`Forged Digital — ${title}`,text:`${title}\n\n${body}\n\n${target}`,html:html(title,body,p.href,cta),tags:[{name:"source",value:"forged-portal"},{name:"kind",value:kind}]})});
    if(!response.ok)return {ok:false,error:"Email send failed"};
    const data=await response.json();
    return {ok:true,id:data.id};
  }catch(error:any){return {ok:false,error:error?.message||"Email send failed"};}
}
