"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Circle, Clock3, LogOut, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import "./admin.css";

type Row=any;

export default function AdminPage(){
  const [loading,setLoading]=useState(true);
  const [user,setUser]=useState<any>(null);
  const [profile,setProfile]=useState<Row>(null);
  const [clients,setClients]=useState<Row[]>([]);
  const [selected,setSelected]=useState<Row>(null);
  const [project,setProject]=useState<Row>(null);
  const [milestones,setMilestones]=useState<Row[]>([]);
  const [assets,setAssets]=useState<Row[]>([]);
  const [messages,setMessages]=useState<Row[]>([]);
  const [contacts,setContacts]=useState<Row[]>([]);
  const [chat,setChat]=useState("");
  const [notice,setNotice]=useState("");

  useEffect(()=>{supabase.auth.getSession().then(async({data})=>{const u=data.session?.user;if(!u){setLoading(false);return;}setUser(u);const {data:p}=await supabase.from("profiles").select("*").eq("id",u.id).single();setProfile(p);if(p?.role!=="admin"){setLoading(false);return;}const [{data:c},{data:ct}]=await Promise.all([supabase.from("client_accounts").select("*").order("created_at",{ascending:false}),supabase.from("contact_submissions").select("*").order("created_at",{ascending:false}).limit(100)]);setClients(c||[]);setContacts(ct||[]);const first=(c||[]).find((x:any)=>x.user_id!==u.id)||(c||[])[0];if(first)await chooseClient(first);setLoading(false);});},[]);

  async function chooseClient(c:Row){setSelected(c);setNotice("");const [{data:p},{data:a},{data:m}]=await Promise.all([supabase.from("projects").select("*").eq("client_id",c.id).order("created_at",{ascending:false}).limit(1).maybeSingle(),supabase.from("branding_assets").select("*").eq("client_id",c.id).order("created_at",{ascending:false}),supabase.from("messages").select("*").eq("client_id",c.id).order("created_at",{ascending:true})]);setProject(p||null);setAssets(a||[]);setMessages(m||[]);if(p){const {data:ms}=await supabase.from("project_milestones").select("*").eq("project_id",p.id).order("position");setMilestones(ms||[])}else setMilestones([])}

  async function saveProject(){if(!project)return;const {error}=await supabase.from("projects").update({status:project.status,progress:Number(project.progress)||0,target_launch:project.target_launch||null}).eq("id",project.id);setNotice(error?error.message:"Project progress saved.")}
  async function setMilestone(id:string,status:string){await supabase.from("project_milestones").update({status,completed_at:status==="done"?new Date().toISOString():null}).eq("id",id);setMilestones(cur=>cur.map(m=>m.id===id?{...m,status}:m));}
  async function send(){if(!chat.trim()||!selected||!user)return;const body=chat.trim();setChat("");const {data,error}=await supabase.from("messages").insert({client_id:selected.id,sender_id:user.id,body}).select().single();if(error){setNotice(error.message);setChat(body);return;}if(data)setMessages(cur=>[...cur,data])}
  async function markContact(id:string,status:string){await supabase.from("contact_submissions").update({status}).eq("id",id);setContacts(cur=>cur.map(c=>c.id===id?{...c,status}:c))}
  async function signOut(){await supabase.auth.signOut();window.location.href="/portal"}

  if(loading)return <main className="admin-gate"><p>LOADING...</p></main>;
  if(!user)return <main className="admin-gate"><img src="/assets/forged-logo-stacked.webp" alt="Forged Digital"/><h1>ADMIN SIGN IN REQUIRED</h1><Link href="/portal">GO TO CLIENT PORTAL</Link></main>;
  if(profile?.role!=="admin")return <main className="admin-gate"><img src="/assets/forged-logo-stacked.webp" alt="Forged Digital"/><h1>ADMIN ACCESS REQUIRED</h1><Link href="/portal">RETURN TO PORTAL</Link></main>;

  return <main className="admin-page"><aside className="admin-sidebar"><Link href="/"><img src="/assets/forged-logo-stacked.webp" alt="Forged Digital"/></Link><p>ADMIN</p><h2>CLIENTS</h2><div className="admin-client-list">{clients.map(c=><button key={c.id} className={selected?.id===c.id?"active":""} onClick={()=>chooseClient(c)}><b>{c.company_name||c.contact_name||c.email||"Unnamed Client"}</b><span>{c.email}</span></button>)}</div><button className="admin-signout" onClick={signOut}><LogOut size={16}/> SIGN OUT</button></aside><section className="admin-main"><header><div><span>FORGED DIGITAL</span><b>Client Operations</b></div><Link href="/portal">VIEW CLIENT PORTAL</Link></header><div className="admin-content"><section><p className="eyebrow">LEADS</p><h1>CONTACT INTAKE</h1><div className="admin-leads">{contacts.length===0?<p>No submissions yet.</p>:contacts.map(c=><article key={c.id}><div><b>{c.name}</b><span>{c.company_name||"No company"} · {c.email} · {c.phone||"No phone"}</span><small>{c.domain_or_website||"No website supplied"}</small></div><select value={c.status} onChange={e=>markContact(c.id,e.target.value)}><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option></select></article>)}</div></section>{selected&&<><section><p className="eyebrow">SELECTED CLIENT</p><h1>{selected.company_name||selected.contact_name||selected.email}</h1><div className="admin-project-grid"><label><span>STATUS</span><input value={project?.status||""} onChange={e=>setProject({...project,status:e.target.value})}/></label><label><span>PROGRESS %</span><input type="number" min="0" max="100" value={project?.progress??0} onChange={e=>setProject({...project,progress:e.target.value})}/></label><label><span>TARGET LAUNCH</span><input type="date" value={project?.target_launch||""} onChange={e=>setProject({...project,target_launch:e.target.value})}/></label><button onClick={saveProject}>SAVE PROJECT</button></div><div className="admin-milestones">{milestones.map(m=><article key={m.id}>{m.status==="done"?<Check/>:m.status==="active"?<Clock3/>:<Circle/>}<div><b>{m.title}</b><span>{m.description}</span></div><select value={m.status} onChange={e=>setMilestone(m.id,e.target.value)}><option value="pending">Pending</option><option value="active">In Progress</option><option value="done">Complete</option></select></article>)}</div></section><section className="admin-two"><div><p className="eyebrow">BRANDING</p><h2>CLIENT ASSETS</h2><div className="admin-assets">{assets.length===0?<p>No assets uploaded.</p>:assets.map(a=><article key={a.id}><b>{a.file_name}</b><span>{a.asset_type} · {a.mime_type||"file"}</span></article>)}</div></div><div><p className="eyebrow">PRIVATE CHAT</p><h2>MESSAGES</h2><div className="admin-chat">{messages.map(m=><div key={m.id} className={m.sender_id===user.id?"mine":"theirs"}><small>{m.sender_id===user.id?"YOU":"CLIENT"}</small><p>{m.body}</p></div>)}</div><div className="admin-compose"><textarea value={chat} onChange={e=>setChat(e.target.value)} placeholder="Message client..."/><button onClick={send}><Send size={16}/> SEND</button></div></div></section></>}{notice&&<div className="admin-notice">{notice}</div>}</div></section></main>
}
