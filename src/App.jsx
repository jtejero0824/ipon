// ipon v3.0.0
import { useState, useEffect, useRef } from "react";

// ── Supabase ──
const SUPABASE_URL = "https://zxmokyuniokkuctevnrc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4bW9reXVuaW9ra3VjdGV2bnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTM4NDIsImV4cCI6MjA5MjEyOTg0Mn0.GIOunx7JUCZmVQflAuZPu-3UEc7qSYEqYNQNhmQ_ec0";
const SESSION_KEY = "ipon_session";

function createClient() {
  const h = { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" };
  const a = t => ({ ...h, "Authorization": `Bearer ${t || SUPABASE_ANON_KEY}` });
  return {
    auth: {
      signInAnonymously: async () => { const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, { method:"POST", headers:h, body:JSON.stringify({}) }); return r.json(); },
      signUp: async (email, password, token) => { const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { method:"PUT", headers:a(token), body:JSON.stringify({ email, password }) }); return r.json(); },
      signIn: async (email, password) => { const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method:"POST", headers:h, body:JSON.stringify({ email, password }) }); return r.json(); },
      signOut: async token => { await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method:"POST", headers:a(token) }); },
      getUser: async token => { const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers:a(token) }); return r.json(); },
    },
    db: {
      getGoals: async t => { const r = await fetch(`${SUPABASE_URL}/rest/v1/goals?select=*&order=created_at.asc`, { headers:a(t) }); return r.json(); },
      insertGoal: async (t,g) => { const r = await fetch(`${SUPABASE_URL}/rest/v1/goals`, { method:"POST", headers:{...a(t),"Prefer":"return=representation"}, body:JSON.stringify(g) }); const d = await r.json(); return Array.isArray(d)?d[0]:d; },
      updateGoal: async (t,id,u) => { const r = await fetch(`${SUPABASE_URL}/rest/v1/goals?id=eq.${id}`, { method:"PATCH", headers:{...a(t),"Prefer":"return=representation"}, body:JSON.stringify(u) }); const d = await r.json(); return Array.isArray(d)?d[0]:d; },
      deleteGoal: async (t,id) => { await fetch(`${SUPABASE_URL}/rest/v1/goals?id=eq.${id}`, { method:"DELETE", headers:a(t) }); },
      getContributions: async t => { const r = await fetch(`${SUPABASE_URL}/rest/v1/contributions?select=*&order=created_at.asc`, { headers:a(t) }); return r.json(); },
      insertContribution: async (t,c) => { const r = await fetch(`${SUPABASE_URL}/rest/v1/contributions`, { method:"POST", headers:{...a(t),"Prefer":"return=representation"}, body:JSON.stringify(c) }); const d = await r.json(); return Array.isArray(d)?d[0]:d; },
      deleteContribution: async (t,id) => { await fetch(`${SUPABASE_URL}/rest/v1/contributions?id=eq.${id}`, { method:"DELETE", headers:a(t) }); },
    },
  };
}
const sb = createClient();

// ── Design tokens ──
const ACCENTS = [
  {name:"Forest",  hex:"#2C5F3F", soft:"#E7F0EA", ink:"#1B3D28"},
  {name:"Indigo",  hex:"#3D4CC2", soft:"#E8EAF7", ink:"#272F85"},
  {name:"Clay",    hex:"#B8651E", soft:"#F6E9DC", ink:"#7A4112"},
  {name:"Berry",   hex:"#A3356C", soft:"#F4E4EC", ink:"#6B2047"},
  {name:"Ocean",   hex:"#1C6B88", soft:"#DFECF2", ink:"#0F425A"},
  {name:"Graphite",hex:"#2A2A2A", soft:"#EDECE7", ink:"#141414"},
];
const findAccent = hex => ACCENTS.find(a=>a.hex===hex) || ACCENTS[0];
const LIGHT = {bg:"#F6F4EF",surface:"#FFFFFF",surface2:"#FBF9F4",border:"#ECE7DA",borderStrong:"#D9D2C1",text:"#14110D",textSub:"#5B554A",textMute:"#8E8676",textFaint:"#B5AD9C"};
const DARK  = {bg:"#0E0D0B",surface:"#1C1A16",surface2:"#242220",border:"#26231E",borderStrong:"#36322B",text:"#F4F1EA",textSub:"#BDB6A6",textMute:"#8B8472",textFaint:"#5C564B"};
const FONT = "'Inter',-apple-system,system-ui,sans-serif";
const FD   = "'Inter Tight','Inter',-apple-system,system-ui,sans-serif";

// ── Helpers ──
const fmt    = n => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
const fmtF   = n => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n);
const fmtDate  = d => new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const fmtShort = d => new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
const monGlyph = d => new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short"});
function timeUntil(d){const now=new Date(),t=new Date(d+"T00:00:00");if(t<=now)return{months:0,days:0,weeks:0,totalDays:0};const td=Math.ceil((t-now)/86400000),mo=Math.floor(td/30.44);return{months:mo,days:Math.round(td-mo*30.44),weeks:Math.floor(td/7),totalDays:td};}
const totalSaved = g => (g.contributions||[]).reduce((s,c)=>s+c.amount,0);
const monthly = g => { const r=Math.max(0,g.target_amount-totalSaved(g)),{months}=timeUntil(g.deadline); return months===0?r:r/months; };
const weekly  = g => { const r=Math.max(0,g.target_amount-totalSaved(g)),{weeks}=timeUntil(g.deadline);  return weeks===0?r:r/Math.max(weeks,1); };
const tod = () => new Date().toISOString().split("T")[0];

// ── Hooks ──
function useCountUp(target,dur=800){
  const[v,setV]=useState(target);
  const fr=useRef(target),st=useRef(null),ra=useRef(null);
  useEffect(()=>{
    const from=fr.current,to=target; fr.current=to; st.current=null; cancelAnimationFrame(ra.current);
    if(Math.abs(from-to)<0.01) return;
    const tick=t=>{if(!st.current)st.current=t;const p=Math.min(1,(t-st.current)/dur);setV(from+(to-from)*(1-Math.pow(1-p,3)));if(p<1)ra.current=requestAnimationFrame(tick);};
    ra.current=requestAnimationFrame(tick); return()=>cancelAnimationFrame(ra.current);
  },[target]);
  return v;
}

// ── Icons ──
const Icon = {
  Menu:  ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Plus:  ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Sun:   ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Moon:  ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  Close: ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Edit:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 20h4l10-10-4-4L4 16v4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
};

const IponLogo = ({size=24,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" stroke={color} strokeWidth="2"/>
    <line x1="16" y1="21" x2="16" y2="9" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="10.5" y1="17.5" x2="21.5" y2="17.5" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M16 9 C16 9 12.5 12 11 13.5" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M16 9 C16 9 19.5 12 21 13.5" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);

// ── Bar Hero ──
function BarHero({goal,accent,T,onEdit}){
  const sv=totalSaved(goal),pct=Math.min(100,(sv/goal.target_amount)*100);
  const{months,days,totalDays}=timeUntil(goal.deadline);
  const leftStr=totalDays<=0?"past due":months>0?`${months}mo ${days}d left`:`${days} days left`;
  const aSv=useCountUp(sv,900),aPct=useCountUp(pct,900);
  const rem=Math.max(0,goal.target_amount-sv);
  return(
    <div style={{padding:"20px 22px 4px"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:4}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,color:T.textMute,marginBottom:6}}>saving toward</div>
          <div style={{fontSize:36,lineHeight:1,marginBottom:6}}>{goal.emoji}</div>
          <div style={{fontFamily:FD,fontWeight:700,fontSize:30,letterSpacing:"-0.025em",color:T.text,lineHeight:1.1}}>{goal.name}</div>
        </div>
        <button onClick={onEdit} style={{flexShrink:0,display:"inline-flex",alignItems:"center",gap:5,background:T.surface,border:`1px solid ${accent.hex}55`,color:accent.ink,padding:"5px 11px",borderRadius:999,fontSize:11,fontWeight:600,letterSpacing:"0.04em",textTransform:"uppercase",cursor:"pointer",fontFamily:FONT,marginTop:2}}>
          <Icon.Edit/> Edit
        </button>
      </div>
      <div style={{fontSize:13,color:T.textMute,marginBottom:20,display:"flex",alignItems:"center",gap:8}}>
        <span>by {fmtDate(goal.deadline)}</span>
        <span style={{width:3,height:3,borderRadius:"50%",background:"currentColor",opacity:.4,display:"inline-block"}}/>
        <span>{leftStr}</span>
      </div>
      <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:14}}>
        <div style={{fontFamily:FD,fontWeight:700,fontSize:46,letterSpacing:"-0.03em",color:T.text,fontVariantNumeric:"tabular-nums",lineHeight:1}}>{fmtF(aSv)}</div>
        <div style={{color:T.textMute,fontSize:15,fontVariantNumeric:"tabular-nums"}}>of {fmt(goal.target_amount)}</div>
      </div>
      <div style={{height:8,background:T.border,borderRadius:99,overflow:"hidden",marginBottom:10}}>
        <div style={{height:"100%",width:`${aPct}%`,background:accent.hex,borderRadius:99,transition:"width .6s cubic-bezier(.2,.9,.3,1)"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12.5,color:T.textMute,fontVariantNumeric:"tabular-nums"}}>
        <span>{aPct.toFixed(1)}%</span>
        <span>{fmt(rem)} to go</span>
      </div>
    </div>
  );
}

// ── Stat Grid ──
function StatGrid({goal,accent,T}){
  const sv=totalSaved(goal),rem=Math.max(0,goal.target_amount-sv);
  const mn=monthly(goal),wk=weekly(goal);
  const{months,totalDays}=timeUntil(goal.deadline);
  const onTrack=sv>=(goal.target_amount-mn*months);
  const card=(s={})=>({background:T.surface,border:`1px solid ${T.border}`,borderRadius:20,padding:"14px 16px 16px",...s});
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"16px 18px 0"}}>
      <div style={card({gridColumn:"1/-1",background:accent.soft,border:`1px solid ${accent.hex}33`,padding:"16px 18px 18px"})}>
        <div style={{fontSize:11,letterSpacing:".1em",textTransform:"uppercase",color:accent.ink,opacity:.7,fontWeight:500,marginBottom:8}}>Monthly target</div>
        <div style={{fontFamily:FD,fontWeight:600,fontSize:28,letterSpacing:"-0.02em",color:accent.ink,fontVariantNumeric:"tabular-nums"}}>{rem===0?"🎉 Reached!":fmt(mn)}</div>
        <div style={{marginTop:4,fontSize:12,color:accent.ink,opacity:.65}}>{rem===0?"You hit the goal!":`≈ ${fmt(wk)} per week${onTrack?" · on track":" · behind pace"}`}</div>
      </div>
      <div style={card()}>
        <div style={{fontSize:11,letterSpacing:".1em",textTransform:"uppercase",color:T.textMute,fontWeight:500,marginBottom:8}}>Remaining</div>
        <div style={{fontFamily:FD,fontWeight:600,fontSize:22,letterSpacing:"-0.02em",color:T.text,fontVariantNumeric:"tabular-nums"}}>{fmt(rem)}</div>
        <div style={{marginTop:4,fontSize:12,color:T.textMute}}>{rem===0?"nothing left":`${((rem/goal.target_amount)*100).toFixed(0)}% to go`}</div>
      </div>
      <div style={card()}>
        <div style={{fontSize:11,letterSpacing:".1em",textTransform:"uppercase",color:T.textMute,fontWeight:500,marginBottom:8}}>Time left</div>
        <div style={{fontFamily:FD,fontWeight:600,fontSize:22,letterSpacing:"-0.02em",color:T.text,fontVariantNumeric:"tabular-nums"}}>{totalDays<=0?"0d":months>0?`${months}mo`:`${totalDays}d`}</div>
        <div style={{marginTop:4,fontSize:12,color:T.textMute}}>{totalDays>0?`${totalDays} days total`:"deadline passed"}</div>
      </div>
    </div>
  );
}

// ── Contribution Row ──
function ContribRow({c,accent,T,onDelete}){
  const[hov,setHov]=useState(false);
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"grid",gridTemplateColumns:"40px 1fr auto",alignItems:"center",gap:14,padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
      <div style={{width:38,height:38,borderRadius:12,background:accent.soft,color:accent.ink,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,letterSpacing:".04em",textTransform:"uppercase",flexShrink:0}}>{monGlyph(c.date)}</div>
      <div style={{minWidth:0}}>
        <div style={{fontSize:14,color:T.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.note||"Contribution"}</div>
        <div style={{fontSize:12,color:T.textMute,marginTop:2}}>{fmtShort(c.date)}</div>
      </div>
      <div style={{fontFamily:FD,fontWeight:600,fontSize:15,color:T.text,letterSpacing:"-0.01em",fontVariantNumeric:"tabular-nums",display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap"}}>
        +{fmtF(c.amount)}
        <button onClick={()=>onDelete(c.id)} style={{opacity:hov?1:0,width:26,height:26,borderRadius:"50%",border:"none",background:"transparent",color:T.textFaint,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"opacity .15s"}}>
          <Icon.Close/>
        </button>
      </div>
    </div>
  );
}

// ── Sheet ──
function Sheet({open,onClose,T,children}){
  useEffect(()=>{if(!open)return;const e=ev=>ev.key==="Escape"&&onClose();window.addEventListener("keydown",e);return()=>window.removeEventListener("keydown",e);},[open,onClose]);
  if(!open) return null;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(20,17,13,.5)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.bg,borderRadius:"28px 28px 0 0",padding:"0 22px 36px",width:"100%",maxWidth:430,maxHeight:"90vh",overflowY:"auto",border:`1px solid ${T.border}`,borderBottom:"none"}}>
        <div style={{width:40,height:4,borderRadius:99,background:T.borderStrong,margin:"14px auto 20px"}}/>
        {children}
      </div>
    </div>
  );
}

// ── Goal Form ──
function GoalForm({data,setData,title,sub,T,suggestEmoji=false}){
  const debRef=useRef(null);
  const dataRef=useRef(data);
  const setDataRef=useRef(setData);
  useEffect(()=>{dataRef.current=data;setDataRef.current=setData;},[data,setData]);

  const suggest=async name=>{
    if(!name||name.trim().length<3) return;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:10,
          messages:[{role:"user",content:`Reply with a single emoji that best represents this savings goal: "${name}". Only output the emoji, nothing else.`}]})
      });
      const json=await res.json();
      const emoji=json?.content?.[0]?.text?.trim();
      if(emoji) setDataRef.current({...dataRef.current,emoji});
    }catch{}
  };

  const handleName=e=>{
    const name=e.target.value;
    setData({...data,name});
    if(suggestEmoji){ clearTimeout(debRef.current); debRef.current=setTimeout(()=>suggest(name),700); }
  };

  const inp=(p={})=><input {...p} style={{width:"100%",minWidth:0,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 14px",color:T.text,fontSize:15.5,fontFamily:FONT,display:"block",boxSizing:"border-box",colorScheme:"light dark",WebkitAppearance:"none",appearance:"none",...(p.style||{})}}/>;
  const lbl=l=><label style={{display:"block",fontSize:11,textTransform:"uppercase",letterSpacing:".1em",fontWeight:600,color:T.textMute,marginBottom:6}}>{l}</label>;
  return(<>
    <div style={{fontFamily:FD,fontWeight:700,fontSize:24,letterSpacing:"-0.02em",color:T.text,marginBottom:2}}>{title}</div>
    <div style={{color:T.textMute,fontSize:14,marginBottom:22}}>{sub}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,marginBottom:14,alignItems:"end"}}>
      <div>{lbl("Goal name")}{inp({placeholder:"e.g. A week in Lisbon",value:data.name,onChange:handleName,autoFocus:true})}</div>
      <div>{lbl("Icon")}<input value={data.emoji} onChange={e=>{const first=[...e.target.value.replace(/\s/g,"")];setData({...data,emoji:first[0]||""});}} style={{width:58,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 0",color:T.text,fontSize:16,textAlign:"center",display:"block",boxSizing:"border-box",fontFamily:FONT}}/></div>
    </div>
    <div style={{marginBottom:14}}>{lbl("Target amount")}{inp({type:"number",placeholder:"5000",value:data.target_amount,onChange:e=>setData({...data,target_amount:e.target.value})})}</div>
    <div style={{marginBottom:14}}>{lbl("Target date")}<div style={{overflow:"hidden",borderRadius:12}}>{inp({type:"date",value:data.deadline,onChange:e=>setData({...data,deadline:e.target.value})})}</div></div>
    <div style={{marginBottom:6}}>{lbl("Color")}</div>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:4}}>
      {ACCENTS.map(a=><button key={a.hex} onClick={()=>setData({...data,color:a.hex})} style={{width:34,height:34,borderRadius:"50%",background:a.hex,border:data.color===a.hex?`3px solid ${T.text}`:"3px solid transparent",cursor:"pointer",transition:"transform .12s",transform:data.color===a.hex?"scale(1.1)":"scale(1)"}}/>)}
    </div>
  </>);
}

// ── Auth Form ──
function AuthForm({mode,email,setEmail,password,setPassword,onSubmit,onToggle,error,loading,T,accent}){
  const inp=(p={})=><input {...p} style={{width:"100%",minWidth:0,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 14px",color:T.text,fontSize:15.5,fontFamily:FONT,display:"block",boxSizing:"border-box",colorScheme:"light dark",...(p.style||{})}}/>;
  const lbl=l=><label style={{display:"block",fontSize:11,textTransform:"uppercase",letterSpacing:".1em",fontWeight:600,color:T.textMute,marginBottom:6}}>{l}</label>;
  return(<>
    <div style={{fontFamily:FD,fontWeight:700,fontSize:24,letterSpacing:"-0.02em",color:T.text,marginBottom:2}}>{mode==="signup"?"Create account":"Sign in"}</div>
    {mode==="signup"&&(
      <div style={{background:T.surface2,border:`1px solid ${T.border}`,borderRadius:12,padding:14,marginBottom:16,fontSize:13,color:T.textSub,lineHeight:1.7}}>
        Creating an account gives you:<br/>
        <strong>📱 Multi-device access</strong> — your goals follow you everywhere<br/>
        <strong>👫 Shared goals</strong> — save toward something together<br/>
        <strong>🛡️ Secure backup</strong> — never lose your data
      </div>
    )}
    <div style={{marginBottom:14,marginTop:mode==="signup"?0:20}}>{lbl("Email")}{inp({type:"email",placeholder:"you@example.com",value:email,onChange:e=>setEmail(e.target.value),autoFocus:true})}</div>
    <div style={{marginBottom:14}}>{lbl("Password")}{inp({type:"password",placeholder:"Min. 6 characters",value:password,onChange:e=>setPassword(e.target.value),onKeyDown:e=>e.key==="Enter"&&onSubmit()})}</div>
    {error&&<div style={{color:"#C24A3E",fontSize:13,marginBottom:10}}>{error}</div>}
    <div style={{display:"flex",gap:10,marginTop:18}}>
      <button onClick={onSubmit} style={{flex:1,border:"none",borderRadius:14,padding:"14px",fontWeight:600,fontSize:15,background:accent.hex,color:"#fff",cursor:"pointer",fontFamily:FONT}}>
        {loading?"…":mode==="signup"?"Create account":"Sign in"}
      </button>
    </div>
    <div style={{textAlign:"center",marginTop:16,fontSize:13,color:T.textMute}}>
      {mode==="signup"?<>Already have an account? <button onClick={onToggle} style={{background:"none",border:"none",color:accent.hex,cursor:"pointer",fontWeight:600,fontFamily:FONT,fontSize:13}}>Sign in</button></>
        :<>New to ipon? <button onClick={onToggle} style={{background:"none",border:"none",color:accent.hex,cursor:"pointer",fontWeight:600,fontFamily:FONT,fontSize:13}}>Create account</button></>}
    </div>
  </>);
}

// ── Main App ──
export default function App(){
  const [session,setSession]=useState(null);
  const [userId,setUserId]=useState(null);
  const [isAnon,setIsAnon]=useState(true);
  const [goals,setGoals]=useState([]);
  const [activeId,setActiveId]=useState(null);
  const [isDark,setIsDark]=useState(false);
  const [loaded,setLoaded]=useState(false);

  const [menuOpen,setMenuOpen]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [showEdit,setShowEdit]=useState(false);
  const [showContrib,setShowContrib]=useState(false);
  const [showNudge,setShowNudge]=useState(false);
  const [showDeleteGoal,setShowDeleteGoal]=useState(null);
  const [showDeleteContrib,setShowDeleteContrib]=useState(null);
  const [showAuth,setShowAuth]=useState(false);
  const [authMode,setAuthMode]=useState("signup");
  const [authEmail,setAuthEmail]=useState("");
  const [authPassword,setAuthPassword]=useState("");
  const [authError,setAuthError]=useState("");
  const [authLoading,setAuthLoading]=useState(false);

  const [editD,setEditD]=useState(null);
  const [newG,setNewG]=useState({name:"",emoji:"🎯",target_amount:"",deadline:tod(),color:ACCENTS[0].hex});
  const [newC,setNewC]=useState({amount:"",note:"",date:tod()});
  const [scrolled,setScrolled]=useState(false);

  const userIdRef=useRef(null);
  useEffect(()=>{userIdRef.current=userId;},[userId]);

  const token=session?.access_token;
  const ag=goals.find(g=>g.id===activeId)||goals[0];
  const acc=findAccent(ag?.color||ACCENTS[0].hex);
  const T=isDark?DARK:LIGHT;

  useEffect(()=>{
    document.body.style.cssText=`background:${T.bg};margin:0;font-family:${FONT};`;
  },[T.bg]);

  useEffect(()=>{
    const f=()=>setScrolled(window.scrollY>8);
    window.addEventListener("scroll",f);
    return()=>window.removeEventListener("scroll",f);
  },[]);

  // Init
  useEffect(()=>{
    async function init(){
      const savedDark=localStorage.getItem("ipon_dark");
      if(savedDark!==null) setIsDark(savedDark==="true");
      let sess=null;
      try{sess=JSON.parse(localStorage.getItem(SESSION_KEY)||"null");}catch{}
      if(!sess){
        const data=await sb.auth.signInAnonymously();
        if(data?.access_token){sess=data;localStorage.setItem(SESSION_KEY,JSON.stringify(sess));}
      }
      if(sess?.access_token){
        setSession(sess);
        const u=await sb.auth.getUser(sess.access_token);
        const uid=u?.id||u?.sub||u?.user?.id;
        setUserId(uid); userIdRef.current=uid;
        setIsAnon(u?.is_anonymous??u?.user?.is_anonymous??true);
        await loadData(sess.access_token);
      }
      setLoaded(true);
    }
    init();
  },[]);

  const loadData=async tok=>{
    const[gd,cd]=await Promise.all([sb.db.getGoals(tok),sb.db.getContributions(tok)]);
    if(Array.isArray(gd)){
      const merged=gd.map(g=>({...g,contributions:Array.isArray(cd)?cd.filter(c=>c.goal_id===g.id):[]}));
      setGoals(merged);
      if(merged.length>0) setActiveId(merged[0].id);
    }
  };

  const handleAddGoal=async()=>{
    if(!newG.name||!newG.target_amount||!newG.deadline) return;
    try{
      const g=await sb.db.insertGoal(token,{name:newG.name,emoji:newG.emoji||"🎯",color:newG.color,target_amount:parseFloat(newG.target_amount),deadline:newG.deadline,user_id:userIdRef.current});
      if(g?.id){
        setGoals(p=>[...p,{...g,contributions:[]}]);
        setActiveId(g.id);
        setShowAdd(false);
        setNewG({name:"",emoji:"🎯",target_amount:"",deadline:tod(),color:ACCENTS[0].hex});
      }
    }catch(e){console.error(e);}
  };

  const handleSaveEdit=async()=>{
    if(!editD?.name||!editD?.target_amount||!editD?.deadline) return;
    const u=await sb.db.updateGoal(token,editD.id,{name:editD.name,emoji:editD.emoji,color:editD.color,target_amount:parseFloat(editD.target_amount),deadline:editD.deadline});
    if(u?.id) setGoals(p=>p.map(g=>g.id===editD.id?{...g,...u}:g));
    setShowEdit(false); setEditD(null);
  };

  const handleAddContrib=async()=>{
    if(!newC.amount||parseFloat(newC.amount)<=0) return;
    const targetId=ag?.id;
    try{
      const c=await sb.db.insertContribution(token,{goal_id:targetId,user_id:userIdRef.current,amount:parseFloat(newC.amount),note:newC.note,date:newC.date});
      if(c?.id){
        setGoals(p=>p.map(g=>g.id===targetId?{...g,contributions:[...(g.contributions||[]),c]}:g));
        if(isAnon&&goals.reduce((s,g)=>s+(g.contributions||[]).length,0)===0) setShowNudge(true);
        setShowContrib(false);
        setNewC({amount:"",note:"",date:tod()});
      }
    }catch(e){console.error(e);}
  };

  const handleDeleteContrib=async cid=>{
    await sb.db.deleteContribution(token,cid);
    setGoals(p=>p.map(g=>({...g,contributions:(g.contributions||[]).filter(c=>c.id!==cid)})));
    setShowDeleteContrib(null);
  };

  const handleDeleteGoal=async gid=>{
    await sb.db.deleteGoal(token,gid);
    const updated=goals.filter(g=>g.id!==gid);
    setGoals(updated);
    if(activeId===gid) setActiveId(updated[0]?.id||null);
    setShowDeleteGoal(null);
    setMenuOpen(false);
  };

  const handleAuth=async()=>{
    setAuthError(""); setAuthLoading(true);
    try{
      if(authMode==="signup"){
        const data=await sb.auth.signUp(authEmail,authPassword,token);
        if(data.error){setAuthError(data.error.message||data.msg||"Sign up failed");}
        else{setIsAnon(false);setShowAuth(false);setShowNudge(false);setUserId(data?.id||data?.user?.id||userIdRef.current);}
      }else{
        const data=await sb.auth.signIn(authEmail,authPassword);
        if(data.error){setAuthError(data.error.message||"Sign in failed");}
        else{
          localStorage.setItem(SESSION_KEY,JSON.stringify(data));
          setSession(data);setIsAnon(false);setShowAuth(false);setShowNudge(false);
          const u=await sb.auth.getUser(data.access_token);
          const uid=u?.id||u?.sub||u?.user?.id;
          setUserId(uid); userIdRef.current=uid;
          await loadData(data.access_token);
        }
      }
    }catch{setAuthError("Something went wrong. Please try again.");}
    setAuthLoading(false);
  };

  const handleSignOut=async()=>{
    await sb.auth.signOut(token);
    localStorage.removeItem(SESSION_KEY);
    setSession(null);setGoals([]);setActiveId(null);setUserId(null);setMenuOpen(false);
    const data=await sb.auth.signInAnonymously();
    if(data?.access_token){
      localStorage.setItem(SESSION_KEY,JSON.stringify(data));
      setSession(data);setIsAnon(true);
      const u=await sb.auth.getUser(data.access_token);
      const uid=u?.id||u?.sub||u?.user?.id;
      setUserId(uid); userIdRef.current=uid;
    }
  };

  const Btn=({label,onClick,bg,fg="#fff",border})=>(
    <button onClick={onClick} style={{flex:1,border:border||"none",borderRadius:14,padding:"14px 16px",fontWeight:600,fontSize:15,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:FONT,cursor:"pointer",background:bg,color:fg}}>{label}</button>
  );
  const Inp=(p={})=><input {...p} style={{width:"100%",minWidth:0,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 14px",color:T.text,fontSize:15.5,fontFamily:FONT,display:"block",boxSizing:"border-box",colorScheme:"light dark",WebkitAppearance:"none",appearance:"none",...(p.style||{})}}/>;
  const Lbl=({children})=><label style={{display:"block",fontSize:11,textTransform:"uppercase",letterSpacing:".1em",fontWeight:600,color:T.textMute,marginBottom:6}}>{children}</label>;

  if(!loaded) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",gap:16,background:T.bg,fontFamily:FONT}}>
      <IponLogo size={48} color={ACCENTS[0].hex}/>
      <span style={{color:T.textMute,fontSize:14}}>Loading…</span>
    </div>
  );

  return(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:T.bg,color:T.text,fontFamily:FONT}}>

      {/* Topbar */}
      <header style={{position:"sticky",top:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 18px 11px",background:isDark?"rgba(14,13,11,0.88)":"rgba(246,244,239,0.88)",backdropFilter:"blur(18px)",borderBottom:scrolled?`1px solid ${T.border}`:"1px solid transparent",transition:"border-color .2s"}}>
        <button onClick={()=>setMenuOpen(true)} style={{width:40,height:40,border:`1px solid ${T.border}`,background:T.surface,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,cursor:"pointer"}}>
          <Icon.Menu/>
        </button>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <IponLogo size={22} color={acc.hex}/>
          <span style={{fontFamily:FD,fontWeight:700,fontSize:20,letterSpacing:"-0.02em",color:T.text}}>ipon</span>
        </div>
        <button onClick={()=>{setIsDark(d=>{localStorage.setItem("ipon_dark",String(!d));return !d;});}} style={{width:40,height:40,border:`1px solid ${T.border}`,background:T.surface,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,cursor:"pointer"}}>
          {isDark?<Icon.Sun/>:<Icon.Moon/>}
        </button>
      </header>

      {/* Nudge */}
      {showNudge&&isAnon&&(
        <div style={{margin:"12px 18px 0",background:acc.soft,border:`1.5px solid ${acc.hex}55`,borderRadius:16,padding:"14px 16px",position:"relative"}}>
          <button onClick={()=>setShowNudge(false)} style={{position:"absolute",top:10,right:12,background:"none",border:"none",color:T.textMute,cursor:"pointer",fontSize:16,lineHeight:1}}>✕</button>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:6}}>Save your progress 🔒</div>
          <div style={{fontSize:13,color:T.textSub,lineHeight:1.6,marginBottom:12}}>Create a free account to:<br/>📱 Access from any device<br/>👫 Share goals with others<br/>🛡️ Never lose your data</div>
          <button onClick={()=>{setAuthMode("signup");setShowAuth(true);}} style={{width:"100%",border:"none",borderRadius:10,padding:"11px",fontWeight:600,fontSize:13.5,background:acc.hex,color:"#fff",cursor:"pointer",fontFamily:FONT}}>Create Free Account</button>
        </div>
      )}

      {/* Welcome screen */}
      {goals.length===0?(
        <div style={{padding:"60px 28px 0",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
          <div style={{width:64,height:64,background:acc.soft,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
            <IponLogo size={32} color={acc.hex}/>
          </div>
          <div style={{fontFamily:FD,fontWeight:700,fontSize:28,letterSpacing:"-0.03em",marginBottom:10}}>Welcome to ipon</div>
          <div style={{fontSize:15,color:T.textMute,lineHeight:1.6,maxWidth:280,marginBottom:32}}>Track your savings goals and know exactly how much to set aside each month.</div>
          <button onClick={()=>setShowAdd(true)} style={{display:"inline-flex",alignItems:"center",gap:8,border:"none",borderRadius:14,padding:"14px 24px",fontWeight:600,fontSize:15,background:acc.hex,color:"#fff",cursor:"pointer",fontFamily:FONT}}>
            <Icon.Plus/> Create your first goal
          </button>
        </div>
      ):(
        <>
          {ag&&<BarHero goal={ag} accent={acc} T={T} onEdit={()=>{setEditD({id:ag.id,name:ag.name,emoji:ag.emoji,target_amount:String(ag.target_amount),deadline:ag.deadline,color:ag.color});setShowEdit(true);}}/>}
          {ag&&<StatGrid goal={ag} accent={acc} T={T}/>}
          {ag&&(
            <div style={{padding:"18px 18px 4px",display:"flex",gap:10}}>
              <Btn label={<><Icon.Plus/> Add contribution</>} onClick={()=>setShowContrib(true)} bg={acc.hex}/>
            </div>
          )}
          {ag&&(
            <div style={{padding:"22px 18px 4px"}}>
              <div style={{fontFamily:FD,fontWeight:600,fontSize:15,letterSpacing:"-0.01em",color:T.text}}>
                Contributions <span style={{fontFamily:FONT,fontWeight:400,color:T.textMute,fontSize:14,marginLeft:4}}>{(ag.contributions||[]).length}</span>
              </div>
            </div>
          )}
          {ag&&(
            <div style={{padding:"4px 18px 120px"}}>
              {(ag.contributions||[]).length===0?(
                <div style={{padding:"28px 20px",textAlign:"center",border:`1px dashed ${T.borderStrong}`,borderRadius:20,color:T.textMute,background:T.surface2,marginTop:8}}>
                  <div style={{fontSize:17,color:T.textSub,marginBottom:4}}>Nothing yet.</div>
                  <div style={{fontSize:13}}>Drop your first contribution to get started.</div>
                </div>
              ):(
                [...(ag.contributions||[])].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(c=>(
                  <ContribRow key={c.id} c={c} accent={acc} T={T} onDelete={cid=>setShowDeleteContrib(cid)}/>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Drawer */}
      {menuOpen&&<>
        <div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,background:"rgba(20,17,13,.45)",zIndex:200}}/>
        <div style={{position:"fixed",top:0,bottom:0,left:0,width:"min(86%,320px)",background:T.bg,zIndex:201,padding:"22px 18px 24px",display:"flex",flexDirection:"column",overflowY:"auto",borderRight:`1px solid ${T.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <IponLogo size={24} color={acc.hex}/>
              <span style={{fontFamily:FD,fontWeight:700,fontSize:22,letterSpacing:"-0.02em",color:T.text}}>ipon</span>
            </div>
            <button onClick={()=>setMenuOpen(false)} style={{width:38,height:38,border:`1px solid ${T.border}`,background:T.surface,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,cursor:"pointer"}}><Icon.Close/></button>
          </div>
          {isAnon&&(
            <div style={{background:acc.soft,border:`1px solid ${acc.hex}44`,borderRadius:12,padding:"12px 14px",margin:"16px 0 4px"}}>
              <div style={{fontSize:13,color:T.textSub,lineHeight:1.5,marginBottom:8}}>Sign up to sync across devices and save with others.</div>
              <button onClick={()=>{setMenuOpen(false);setAuthMode("signup");setShowAuth(true);}} style={{width:"100%",border:"none",borderRadius:10,padding:"10px",fontWeight:600,fontSize:13.5,background:acc.hex,color:"#fff",cursor:"pointer",fontFamily:FONT}}>Create Free Account</button>
            </div>
          )}
          <div style={{fontSize:11,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:T.textMute,margin:"20px 0 10px"}}>Your goals</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {goals.map(g=>{
              const sv=totalSaved(g),p=Math.min(100,(sv/g.target_amount)*100),a=findAccent(g.color),isAct=g.id===activeId;
              return(
                <div key={g.id} style={{display:"flex",alignItems:"center",padding:"12px 14px",borderRadius:16,border:`1.5px solid ${isAct?T.text:T.border}`,background:isAct?T.surface2:T.surface,transition:"all .2s",gap:4}}>
                  <div onClick={()=>{setActiveId(g.id);setMenuOpen(false);}} style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0,cursor:"pointer"}}>
                    <span style={{fontSize:22,flexShrink:0}}>{g.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:FD,fontSize:15,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.name}</div>
                      <div style={{fontSize:12,color:T.textMute,marginTop:1}}>{fmt(sv)} · {p.toFixed(0)}%</div>
                      <div style={{height:3,background:T.border,borderRadius:99,marginTop:6,overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:99,width:`${p}%`,background:a.hex,transition:"width .4s"}}/>
                      </div>
                    </div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();setShowDeleteGoal(g.id);}} style={{flexShrink:0,background:"none",border:"none",color:T.textFaint,cursor:"pointer",padding:"6px",display:"flex",alignItems:"center",borderRadius:6,marginLeft:4}}>
                    <Icon.Close/>
                  </button>
                </div>
              );
            })}
            <button onClick={()=>{setMenuOpen(false);setShowAdd(true);}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"12px 14px",borderRadius:16,border:`1px dashed ${T.border}`,background:"transparent",color:T.textMute,cursor:"pointer",fontFamily:FONT,fontSize:14,width:"100%"}}>
              <Icon.Plus/> New goal
            </button>
          </div>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:T.textMute,margin:"24px 0 10px"}}>Settings</div>
          <button onClick={()=>setIsDark(d=>{localStorage.setItem("ipon_dark",String(!d));return !d;})} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:14,border:`1px solid ${T.border}`,background:T.surface,color:T.text,cursor:"pointer",fontFamily:FONT,fontSize:14,fontWeight:500,width:"100%",marginBottom:8}}>
            {isDark?<Icon.Sun/>:<Icon.Moon/>} {isDark?"Light mode":"Dark mode"}
          </button>
          {!isAnon?(
            <button onClick={handleSignOut} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:14,border:`1px solid ${T.border}`,background:T.surface,color:"#C24A3E",cursor:"pointer",fontFamily:FONT,fontSize:14,fontWeight:500,width:"100%"}}>
              Sign out
            </button>
          ):(
            <button onClick={()=>{setMenuOpen(false);setAuthMode("login");setShowAuth(true);}} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:14,border:`1px solid ${T.border}`,background:T.surface,color:T.textSub,cursor:"pointer",fontFamily:FONT,fontSize:14,fontWeight:500,width:"100%"}}>
              Already have an account? Sign in
            </button>
          )}
        </div>
      </>}

      {/* Add Contribution */}
      <Sheet open={showContrib} onClose={()=>setShowContrib(false)} T={T}>
        <div style={{fontFamily:FD,fontWeight:700,fontSize:22,letterSpacing:"-0.02em",color:T.text,marginBottom:2}}>Log a contribution</div>
        <div style={{color:T.textMute,fontSize:14,marginBottom:22}}>toward {ag?.emoji} {ag?.name}</div>
        <div style={{marginBottom:14}}><Lbl>Amount</Lbl><Inp type="number" placeholder="100.00" autoFocus value={newC.amount} onChange={e=>setNewC({...newC,amount:e.target.value})} style={{fontSize:26,fontWeight:700}}/></div>
        <div style={{marginBottom:14}}><Lbl>Date</Lbl><div style={{overflow:"hidden",borderRadius:12}}><Inp type="date" value={newC.date} onChange={e=>setNewC({...newC,date:e.target.value})}/></div></div>
        <div style={{marginBottom:14}}><Lbl>Note (optional)</Lbl><Inp placeholder="e.g. Freelance invoice" value={newC.note} onChange={e=>setNewC({...newC,note:e.target.value})}/></div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <Btn label="Cancel" onClick={()=>setShowContrib(false)} bg={T.surface} fg={T.text} border={`1px solid ${T.border}`}/>
          <Btn label="Save" onClick={handleAddContrib} bg={acc.hex}/>
        </div>
      </Sheet>

      {/* Add Goal */}
      <Sheet open={showAdd} onClose={()=>setShowAdd(false)} T={T}>
        <GoalForm data={newG} setData={setNewG} title="New goal" sub="something worth saving for" T={T} suggestEmoji={true}/>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <Btn label="Cancel" onClick={()=>setShowAdd(false)} bg={T.surface} fg={T.text} border={`1px solid ${T.border}`}/>
          <Btn label="Create goal" onClick={handleAddGoal} bg={newG.color}/>
        </div>
      </Sheet>

      {/* Edit Goal */}
      <Sheet open={showEdit&&!!editD} onClose={()=>setShowEdit(false)} T={T}>
        {editD&&<>
          <GoalForm data={editD} setData={setEditD} title="Edit goal" sub={`update ${editD.name}`} T={T}/>
          <div style={{display:"flex",gap:10,marginTop:20}}>
            <Btn label="Cancel" onClick={()=>setShowEdit(false)} bg={T.surface} fg={T.text} border={`1px solid ${T.border}`}/>
            <Btn label="Save changes" onClick={handleSaveEdit} bg={editD.color}/>
          </div>
        </>}
      </Sheet>

      {/* Auth */}
      <Sheet open={showAuth} onClose={()=>{setShowAuth(false);setAuthError("");}} T={T}>
        <AuthForm mode={authMode} email={authEmail} setEmail={setAuthEmail} password={authPassword} setPassword={setAuthPassword} onSubmit={handleAuth} onToggle={()=>setAuthMode(m=>m==="signup"?"login":"signup")} error={authError} loading={authLoading} T={T} accent={acc}/>
      </Sheet>

      {/* Delete Goal */}
      <Sheet open={!!showDeleteGoal} onClose={()=>setShowDeleteGoal(null)} T={T}>
        <div style={{fontFamily:FD,fontWeight:700,fontSize:22,letterSpacing:"-0.02em",color:"#C24A3E",marginBottom:8}}>Delete goal?</div>
        <div style={{fontSize:15,color:T.textSub,lineHeight:1.6,marginBottom:24}}>This will permanently delete this goal and all its contributions. This cannot be undone.</div>
        <div style={{display:"flex",gap:10}}>
          <Btn label="Cancel" onClick={()=>setShowDeleteGoal(null)} bg={T.surface} fg={T.text} border={`1px solid ${T.border}`}/>
          <Btn label="Delete" onClick={()=>handleDeleteGoal(showDeleteGoal)} bg="#C24A3E"/>
        </div>
      </Sheet>

      {/* Delete Contribution */}
      <Sheet open={!!showDeleteContrib} onClose={()=>setShowDeleteContrib(null)} T={T}>
        <div style={{fontFamily:FD,fontWeight:700,fontSize:22,letterSpacing:"-0.02em",color:"#C24A3E",marginBottom:8}}>Remove contribution?</div>
        <div style={{fontSize:15,color:T.textSub,lineHeight:1.6,marginBottom:24}}>This contribution will be permanently removed and your monthly target will recalculate.</div>
        <div style={{display:"flex",gap:10}}>
          <Btn label="Cancel" onClick={()=>setShowDeleteContrib(null)} bg={T.surface} fg={T.text} border={`1px solid ${T.border}`}/>
          <Btn label="Remove" onClick={()=>handleDeleteContrib(showDeleteContrib)} bg="#C24A3E"/>
        </div>
      </Sheet>

    </div>
  );
}
