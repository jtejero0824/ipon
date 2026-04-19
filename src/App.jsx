import React, { useState, useEffect, useCallback, useRef } from "react";

// ── Supabase config ──
const SUPABASE_URL = "https://zxmokyuniokkuctevnrc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4bW9reXVuaW9ra3VjdGV2bnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTM4NDIsImV4cCI6MjA5MjEyOTg0Mn0.GIOunx7JUCZmVQflAuZPu-3UEc7qSYEqYNQNhmQ_ec0";

// Minimal Supabase client (no npm needed)
function createClient() {
  const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  };

  const authHeaders = (token) => ({
    ...headers,
    "Authorization": `Bearer ${token || SUPABASE_ANON_KEY}`,
  });

  return {
    // ── Auth ──
    auth: {
      signInAnonymously: async () => {
        const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
          method: "POST", headers,
          body: JSON.stringify({}),
        });
        return r.json();
      },
      signUp: async (email, password, token) => {
        // Link anonymous account to email
        const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          method: "PUT", headers: authHeaders(token),
          body: JSON.stringify({ email, password }),
        });
        return r.json();
      },
      signIn: async (email, password) => {
        const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: "POST", headers,
          body: JSON.stringify({ email, password }),
        });
        return r.json();
      },
      signOut: async (token) => {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: "POST", headers: authHeaders(token),
        });
      },
      getUser: async (token) => {
        const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: authHeaders(token),
        });
        return r.json();
      },
    },
    // ── Database ──
    db: {
      getGoals: async (token) => {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/goals?select=*&order=created_at.asc`, {
          headers: authHeaders(token),
        });
        return r.json();
      },
      insertGoal: async (token, goal) => {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/goals`, {
          method: "POST", headers: { ...authHeaders(token), "Prefer": "return=representation" },
          body: JSON.stringify(goal),
        });
        const data = await r.json();
        return Array.isArray(data) ? data[0] : data;
      },
      updateGoal: async (token, id, updates) => {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/goals?id=eq.${id}`, {
          method: "PATCH", headers: { ...authHeaders(token), "Prefer": "return=representation" },
          body: JSON.stringify(updates),
        });
        const data = await r.json();
        return Array.isArray(data) ? data[0] : data;
      },
      deleteGoal: async (token, id) => {
        await fetch(`${SUPABASE_URL}/rest/v1/goals?id=eq.${id}`, {
          method: "DELETE", headers: authHeaders(token),
        });
      },
      getContributions: async (token) => {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/contributions?select=*&order=created_at.asc`, {
          headers: authHeaders(token),
        });
        return r.json();
      },
      insertContribution: async (token, contrib) => {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/contributions`, {
          method: "POST", headers: { ...authHeaders(token), "Prefer": "return=representation" },
          body: JSON.stringify(contrib),
        });
        const data = await r.json();
        return Array.isArray(data) ? data[0] : data;
      },
      deleteContribution: async (token, id) => {
        await fetch(`${SUPABASE_URL}/rest/v1/contributions?id=eq.${id}`, {
          method: "DELETE", headers: authHeaders(token),
        });
      },
    },
  };
}

const sb = createClient();

// ── Constants ──
const PASTEL_COLORS = [
  "#FF6B6B","#FF9F43","#FECA57","#48DBFB","#1DD1A1",
  "#54A0FF","#5F27CD","#C44569","#F8A5C2","#778CA3",
];
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
const SESSION_KEY = "ipon_session";

// ── Theme tokens ──
const DARK = {
  pageBg:"#000", rootBg:"transparent", navBg:"#0d0b1a",
  navBorder:"rgba(255,255,255,0.07)", drawerBg:"#100d1f",
  drawerBorder:"rgba(255,255,255,0.08)", modalBg:"#100d1f",
  cardBg:"#1e1830", cardBorder:"#2e2848", inputBg:"#231d3a",
  inputBorder:"#302850", statsDivider:"#2e2848", statRowBorder:"#251f3d",
  progressTrack:"#2a2244", miniTrack:"#2a2244",
  text:"#f0eeff", textSub:"#b8a8d8", textMuted:"#9988bb",
  textFaint:"#7a6a99", textVeryFaint:"#5a4a7a", logoColor:"#f0eeff",
  colorScheme:"dark", dateFilter:"invert(1) brightness(0.8)",
  glowOpacity1:"28", glowOpacity2:"38",
  nudgeBg:"#1a1535", nudgeBorder:"#3a2f60",
};
const LIGHT = {
  pageBg:"#f0f0f7", rootBg:"transparent", navBg:"#eeeef6",
  navBorder:"rgba(0,0,0,0.08)", drawerBg:"#ffffff",
  drawerBorder:"rgba(0,0,0,0.08)", modalBg:"#ffffff",
  cardBg:"#ffffff", cardBorder:"#ddd8f0", inputBg:"#f0eef8",
  inputBorder:"#d0c8e8", statsDivider:"#e8e4f4", statRowBorder:"#ece8f6",
  progressTrack:"#e0daf0", miniTrack:"#e0daf0",
  text:"#0f0a1e", textSub:"#3d2f6a", textMuted:"#5a4a8a",
  textFaint:"#7a6aaa", textVeryFaint:"#9a8acc", logoColor:"#0f0a1e",
  colorScheme:"light", dateFilter:"none",
  glowOpacity1:"18", glowOpacity2:"28",
  nudgeBg:"#f5f2ff", nudgeBorder:"#d0c8e8",
};

// ── Helpers ──
function fmt(n) { return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n); }
function timeUntil(d) {
  const now = new Date(), t = new Date(d+"T00:00:00");
  if (t<=now) return {months:0,days:0};
  const td = Math.ceil((t-now)/86400000);
  const mo = Math.floor(td/30.44);
  return {months:mo, days:Math.round(td-mo*30.44)};
}
function fmtDate(d) { return new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }
function totalSaved(g) { return (g.contributions||[]).reduce((s,c)=>s+c.amount,0); }
function monthlyNeeded(g) {
  const rem = Math.max(0, g.target_amount - totalSaved(g));
  const {months} = timeUntil(g.deadline);
  return months===0 ? rem : rem/months;
}
function inputStyle(T) {
  return {width:"100%",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:10,padding:"0.75rem 0.9rem",color:T.text,fontSize:"1rem",outline:"none",boxSizing:"border-box",display:"block",fontFamily:FONT};
}
function fieldLabelStyle(T) {
  return {display:"block",fontSize:"0.68rem",letterSpacing:"0.12em",color:T.textSub,marginBottom:"0.4rem",marginTop:"1rem",fontWeight:600};
}

// ── Main App ──
export default function App() {
  const [session, setSession] = useState(null); // { access_token, user }
  const [isAnon, setIsAnon] = useState(true);
  const [goals, setGoals] = useState([]);
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddContrib, setShowAddContrib] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [showDeleteGoalConfirm, setShowDeleteGoalConfirm] = useState(null);
  const [showDeleteContribConfirm, setShowDeleteContribConfirm] = useState(null);
  const [showSignUpNudge, setShowSignUpNudge] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("signup"); // signup | login
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({name:"",emoji:"🏖️",target_amount:"",deadline:"",color:"#54A0FF"});
  const [newContrib, setNewContrib] = useState({amount:"",note:"",date:new Date().toISOString().split("T")[0]});

  const T = isDark ? DARK : LIGHT;
  const token = session?.access_token;

  // ── All hooks before early returns ──
  useEffect(() => {
    document.body.style.background = T.pageBg;
    document.body.style.margin = "0";
  }, [T.pageBg]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        // Restore saved session
        const saved = localStorage.getItem(SESSION_KEY);
        let sess = saved ? JSON.parse(saved) : null;
        const savedDark = localStorage.getItem("ipon_dark");
        if (savedDark !== null) setIsDark(savedDark === "true");

        if (!sess) {
          // Create anonymous session
          const data = await sb.auth.signInAnonymously();
          if (data.access_token) {
            sess = data;
            localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
          }
        }

        if (sess?.access_token) {
          setSession(sess);
          // Check if anon
          const user = await sb.auth.getUser(sess.access_token);
          setIsAnon(user?.is_anonymous ?? true);
          await loadData(sess.access_token);
        }
      } catch(e) { console.error(e); }
      setLoaded(true);
      setLoading(false);
    }
    init();
  }, []);

  const loadData = async (tok) => {
    const [goalsData, contribsData] = await Promise.all([
      sb.db.getGoals(tok),
      sb.db.getContributions(tok),
    ]);
    if (Array.isArray(goalsData)) {
      const withContribs = goalsData.map(g => ({
        ...g,
        contributions: Array.isArray(contribsData)
          ? contribsData.filter(c => c.goal_id === g.id)
          : [],
      }));
      setGoals(withContribs);
      if (withContribs.length > 0) setActiveGoalId(withContribs[0].id);
    }
  };

  const activeGoal = goals.find(g => g.id === activeGoalId) || goals[0];

  // ── Handlers ──
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("ipon_dark", String(next));
  };

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.target_amount || !newGoal.deadline) return;
    const g = await sb.db.insertGoal(token, {
      name: newGoal.name,
      emoji: newGoal.emoji || "🏖️",
      color: newGoal.color,
      target_amount: parseFloat(newGoal.target_amount),
      deadline: newGoal.deadline,
      user_id: session.user?.id,
    });
    if (g?.id) {
      const withContribs = { ...g, contributions: [] };
      setGoals(prev => [...prev, withContribs]);
      setActiveGoalId(g.id);
    }
    setShowAddGoal(false);
    setNewGoal({name:"",emoji:"🏖️",target_amount:"",deadline:"",color:"#54A0FF"});
  };

  const handleSaveEditGoal = async () => {
    if (!editGoal?.name || !editGoal?.target_amount || !editGoal?.deadline) return;
    const updated = await sb.db.updateGoal(token, editGoal.id, {
      name: editGoal.name,
      emoji: editGoal.emoji,
      color: editGoal.color,
      target_amount: parseFloat(editGoal.target_amount),
      deadline: editGoal.deadline,
    });
    if (updated?.id) {
      setGoals(prev => prev.map(g => g.id === editGoal.id ? { ...g, ...updated } : g));
    }
    setShowEditGoal(false); setEditGoal(null);
  };

  const handleAddContribution = async () => {
    if (!newContrib.amount || parseFloat(newContrib.amount) <= 0) return;
    const targetId = activeGoal?.id;
    const c = await sb.db.insertContribution(token, {
      goal_id: targetId,
      user_id: session.user?.id,
      amount: parseFloat(newContrib.amount),
      note: newContrib.note,
      date: newContrib.date,
    });
    if (c?.id) {
      setGoals(prev => prev.map(g => g.id === targetId
        ? { ...g, contributions: [...(g.contributions||[]), c] }
        : g
      ));
      // Show nudge after first contribution if anonymous
      if (isAnon) {
        const totalContribs = goals.reduce((sum, g) => sum + (g.contributions||[]).length, 0);
        if (totalContribs === 0) setShowSignUpNudge(true);
      }
    }
    setShowAddContrib(false);
    setNewContrib({amount:"",note:"",date:new Date().toISOString().split("T")[0]});
  };

  const handleDeleteContrib = async (cid) => {
    await sb.db.deleteContribution(token, cid);
    setGoals(prev => prev.map(g => ({
      ...g,
      contributions: (g.contributions||[]).filter(c => c.id !== cid)
    })));
    setShowDeleteContribConfirm(null);
  };

  const handleDeleteGoal = async (gid) => {
    await sb.db.deleteGoal(token, gid);
    const updated = goals.filter(g => g.id !== gid);
    setGoals(updated);
    setActiveGoalId(updated[0]?.id || null);
    setShowDeleteGoalConfirm(null);
  };

  const handleAuth = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        // Convert anonymous account to real account
        const data = await sb.auth.signUp(authEmail, authPassword, token);
        if (data.error) { setAuthError(data.error.message || data.msg || "Sign up failed"); }
        else {
          setIsAnon(false);
          setShowAuthModal(false);
          setShowSignUpNudge(false);
          const updated = { ...session, user: data };
          setSession(updated);
          localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        }
      } else {
        // Sign in with existing account
        const data = await sb.auth.signIn(authEmail, authPassword);
        if (data.error) { setAuthError(data.error.message || "Sign in failed"); }
        else {
          localStorage.setItem(SESSION_KEY, JSON.stringify(data));
          setSession(data);
          setIsAnon(false);
          setShowAuthModal(false);
          setShowSignUpNudge(false);
          await loadData(data.access_token);
        }
      }
    } catch(e) { setAuthError("Something went wrong. Please try again."); }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await sb.auth.signOut(token);
    localStorage.removeItem(SESSION_KEY);
    setSession(null); setGoals([]); setActiveGoalId(null);
    setMenuOpen(false);
    // Re-init with new anon session
    const data = await sb.auth.signInAnonymously();
    if (data.access_token) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      setSession(data); setIsAnon(true);
    }
  };

  const dateInputStyle = `
    input[type="date"]::-webkit-calendar-picker-indicator { filter:${T.dateFilter}; cursor:pointer; }
    input[type="date"] { color-scheme:${T.colorScheme}; }
    * { box-sizing:border-box; }
  `;
  const dateInputProps = { style:{...inputStyle(T),colorScheme:T.colorScheme}, type:"date" };
  const card = (extra={}) => ({background:T.cardBg, border:`1px solid ${T.cardBorder}`, ...extra});

  if (!loaded) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.pageBg,color:T.text,fontFamily:FONT,flexDirection:"column",gap:"1rem"}}>
      <IponLogo size={40} color="#9988bb" />
      <span style={{color:T.textMuted,fontSize:"0.9rem"}}>Loading ipon…</span>
    </div>
  );

  const saved     = activeGoal ? totalSaved(activeGoal) : 0;
  const pct       = activeGoal ? Math.min(100,(saved/activeGoal.target_amount)*100) : 0;
  const needed    = activeGoal ? monthlyNeeded(activeGoal) : 0;
  const remaining = activeGoal ? Math.max(0,activeGoal.target_amount-saved) : 0;
  const color     = activeGoal?.color || "#54A0FF";
  const countdown = activeGoal ? timeUntil(activeGoal.deadline) : {months:0,days:0};
  const countdownStr = countdown.months > 0
    ? `${countdown.months}mo ${countdown.days}d left`
    : `${countdown.days}d left`;

  return (
    <div style={{minHeight:"100vh",maxWidth:430,margin:"0 auto",background:T.rootBg,color:T.text,fontFamily:FONT,position:"relative",overflowX:"hidden"}}>
      <style>{dateInputStyle}</style>

      {/* Glows */}
      <div style={{position:"fixed",inset:0,background:`radial-gradient(ellipse at 50% 0%, ${color}${T.glowOpacity1} 0%, transparent 60%)`,pointerEvents:"none",zIndex:0,transition:"background 0.6s ease"}} />
      <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:280,background:`radial-gradient(ellipse at 50% 0%, ${color}${T.glowOpacity2} 0%, transparent 70%)`,pointerEvents:"none",zIndex:1,transition:"background 0.6s ease"}} />

      {/* ── NAV ── */}
      <header style={{position:"sticky",top:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1rem",height:56,background:T.navBg,backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",borderBottom:`1px solid ${T.navBorder}`}}>
        <button style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",gap:5,padding:8,borderRadius:8}} onClick={()=>setMenuOpen(true)}>
          {[0,1,2].map(i=><span key={i} style={{display:"block",width:22,height:2,background:T.text,borderRadius:2}}/>)}
        </button>
        <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:"0.5rem",pointerEvents:"none"}}>
          <IponLogo size={26} color={T.logoColor}/>
          <span style={{fontWeight:700,fontSize:"1.05rem",color:T.logoColor,letterSpacing:"0.06em"}}>ipon</span>
        </div>
        <button onClick={toggleTheme} style={{background:"none",border:`1px solid ${T.cardBorder}`,borderRadius:20,padding:"0.3rem 0.7rem",cursor:"pointer",fontSize:"0.85rem",color:T.textSub,display:"flex",alignItems:"center",gap:"0.3rem"}}>
          {isDark?"☀️":"🌙"}
        </button>
      </header>

      {/* ── SIGN-UP NUDGE BANNER ── */}
      {showSignUpNudge && isAnon && (
        <div style={{background:T.nudgeBg,border:`1px solid ${T.nudgeBorder}`,borderRadius:14,margin:"0.75rem 1rem 0",padding:"0.9rem 1rem",position:"relative",zIndex:10}}>
          <button onClick={()=>setShowSignUpNudge(false)} style={{position:"absolute",top:"0.6rem",right:"0.75rem",background:"none",border:"none",color:T.textFaint,cursor:"pointer",fontSize:"0.85rem"}}>✕</button>
          <div style={{fontWeight:700,fontSize:"0.88rem",color:T.text,marginBottom:"0.4rem"}}>Save your progress 🔒</div>
          <div style={{fontSize:"0.78rem",color:T.textMuted,lineHeight:1.5,marginBottom:"0.75rem"}}>
            Create a free account to:
            <div style={{marginTop:"0.35rem",display:"flex",flexDirection:"column",gap:"0.2rem"}}>
              <span>📱 Access your goals from any device</span>
              <span>👫 Save toward goals together with others</span>
              <span>🛡️ Never lose your data if you clear your browser</span>
            </div>
          </div>
          <button onClick={()=>{setAuthMode("signup");setShowAuthModal(true);}} style={{background:color,color:"#fff",border:"none",borderRadius:8,padding:"0.55rem 1.1rem",fontSize:"0.85rem",fontWeight:600,cursor:"pointer",fontFamily:FONT}}>
            Create Free Account
          </button>
        </div>
      )}

      {/* ── DRAWER ── */}
      {menuOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:200,display:"flex"}} onClick={()=>setMenuOpen(false)}>
          <div style={{width:"82%",maxWidth:300,height:"100%",background:T.drawerBg,borderRight:`1px solid ${T.drawerBorder}`,display:"flex",flexDirection:"column",padding:"1.5rem 1.25rem 2rem",overflowY:"auto",gap:"0.5rem",boxShadow:"8px 0 40px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>

            {/* Header */}
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"1.75rem"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                  <IponLogo size={30} color={T.logoColor}/>
                  <span style={{fontWeight:700,fontSize:"1.2rem",color:T.logoColor,letterSpacing:"0.06em"}}>ipon</span>
                </div>
                <div style={{fontSize:"0.6rem",letterSpacing:"0.18em",color:T.textFaint,marginTop:3}}>MAG-IPON NG PERA</div>
              </div>
              <button style={{background:T.cardBg,border:"none",color:T.textSub,width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:"0.85rem",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setMenuOpen(false)}>✕</button>
            </div>

            {/* Anon nudge in drawer */}
            {isAnon && (
              <div style={{background:T.nudgeBg,border:`1px solid ${T.nudgeBorder}`,borderRadius:10,padding:"0.75rem",marginBottom:"0.5rem"}}>
                <div style={{fontSize:"0.78rem",color:T.textSub,marginBottom:"0.5rem",lineHeight:1.4}}>Sign up to sync your goals across devices and save with others.</div>
                <button onClick={()=>{setMenuOpen(false);setAuthMode("signup");setShowAuthModal(true);}} style={{width:"100%",background:color,color:"#fff",border:"none",borderRadius:8,padding:"0.55rem",fontSize:"0.82rem",fontWeight:600,cursor:"pointer",fontFamily:FONT}}>
                  Create Free Account
                </button>
              </div>
            )}

            <div style={{fontSize:"0.63rem",letterSpacing:"0.18em",color:T.textFaint,marginBottom:"0.6rem"}}>YOUR GOALS</div>

            {/* Goal list */}
            <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",flex:1}}>
              {goals.map(g=>{
                const s=totalSaved(g);
                const p=Math.min(100,(s/g.target_amount)*100);
                const isActive=g.id===activeGoalId;
                return (
                  <div key={g.id} onClick={()=>{setActiveGoalId(g.id);setMenuOpen(false);}}
                    style={{padding:"0.85rem 1rem",borderRadius:12,border:`1px solid ${isActive?g.color:T.cardBorder}`,cursor:"pointer",background:isActive?(isDark?"#2a2040":"#f5f2ff"):T.cardBg}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.5rem"}}>
                      <span style={{fontSize:"1.25rem"}}>{g.emoji}</span>
                      <span style={{flex:1,fontSize:"0.9rem",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:isActive?g.color:T.text}}>{g.name}</span>
                      <button onClick={e=>{e.stopPropagation();setShowDeleteGoalConfirm(g.id);}} style={{background:"none",border:"none",color:T.textFaint,cursor:"pointer",fontSize:"0.8rem",padding:"2px 4px"}}>✕</button>
                    </div>
                    <div style={{height:3,background:T.miniTrack,borderRadius:99,overflow:"hidden",marginBottom:"0.35rem"}}>
                      <div style={{height:"100%",borderRadius:99,width:`${p}%`,background:g.color,transition:"width 0.4s ease"}}/>
                    </div>
                    <div style={{fontSize:"0.7rem",color:T.textMuted}}>{p.toFixed(0)}% · {fmt(s)} saved</div>
                  </div>
                );
              })}
              <button style={{background:T.cardBg,border:`1px dashed ${T.cardBorder}`,color:T.textMuted,borderRadius:10,padding:"0.8rem",cursor:"pointer",fontSize:"0.85rem",letterSpacing:"0.04em"}}
                onClick={()=>{setMenuOpen(false);setShowAddGoal(true);}}>
                + New Goal
              </button>
            </div>

            {/* Bottom actions */}
            <div style={{marginTop:"auto",paddingTop:"1rem",borderTop:`1px solid ${T.drawerBorder}`,display:"flex",flexDirection:"column",gap:"0.5rem"}}>
              <button onClick={toggleTheme} style={{width:"100%",background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:10,padding:"0.7rem 1rem",cursor:"pointer",fontSize:"0.85rem",color:T.textSub,display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",fontFamily:FONT}}>
                {isDark?"☀️  Switch to Light Mode":"🌙  Switch to Dark Mode"}
              </button>
              {!isAnon ? (
                <button onClick={handleSignOut} style={{width:"100%",background:"none",border:`1px solid rgba(255,100,100,0.25)`,borderRadius:10,padding:"0.7rem 1rem",cursor:"pointer",fontSize:"0.78rem",color:"#e06060",fontFamily:FONT}}>
                  Sign Out
                </button>
              ) : (
                <button onClick={()=>{setMenuOpen(false);setAuthMode("login");setShowAuthModal(true);}} style={{width:"100%",background:"none",border:`1px solid ${T.cardBorder}`,borderRadius:10,padding:"0.7rem 1rem",cursor:"pointer",fontSize:"0.78rem",color:T.textMuted,fontFamily:FONT}}>
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main style={{position:"relative",zIndex:1,padding:"1.25rem 1rem 5rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
        {!activeGoal ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:"4rem",textAlign:"center",padding:"4rem 1.5rem 0"}}>
            <IponLogo size={56} color={T.textMuted}/>
            <h2 style={{fontWeight:700,fontSize:"1.5rem",color:T.text,margin:"1.25rem 0 0.5rem"}}>Welcome to ipon</h2>
            <p style={{color:T.textMuted,fontSize:"0.95rem",lineHeight:1.6,margin:"0 0 2rem",maxWidth:280}}>Track your savings goals and see exactly how much you need to set aside each month.</p>
            <button onClick={()=>setShowAddGoal(true)} style={{background:color,color:"#fff",border:"none",borderRadius:12,padding:"0.9rem 2rem",fontSize:"1rem",fontWeight:700,cursor:"pointer",fontFamily:FONT}}>
              Create Your First Goal
            </button>
          </div>
        ) : (
          <>
            {/* Goal header */}
            <div style={{display:"flex",alignItems:"center",gap:"0.85rem",paddingTop:"0.25rem"}}>
              <span style={{fontSize:"2.8rem",lineHeight:1}}>{activeGoal.emoji}</span>
              <div style={{flex:1,minWidth:0}}>
                <h1 style={{fontWeight:700,fontSize:"1.4rem",margin:0,lineHeight:1.15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color}}>{activeGoal.name}</h1>
                <div style={{color:T.textSub,fontSize:"0.78rem",marginTop:3}}>{fmtDate(activeGoal.deadline)} · {countdownStr}</div>
              </div>
              <button onClick={()=>{setEditGoal({id:activeGoal.id,name:activeGoal.name,emoji:activeGoal.emoji,target_amount:String(activeGoal.target_amount),deadline:activeGoal.deadline,color:activeGoal.color});setShowEditGoal(true);}}
                style={{background:T.cardBg,border:`1px solid ${color}55`,borderRadius:8,padding:"0.4rem 0.75rem",fontSize:"0.75rem",fontWeight:600,cursor:"pointer",color,whiteSpace:"nowrap",flexShrink:0}}>✎ Edit</button>
            </div>

            {/* Progress */}
            <div style={{...card(),borderRadius:14,padding:"1rem 1.1rem",display:"flex",flexDirection:"column",gap:"0.55rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"0.62rem",letterSpacing:"0.16em",color:T.textMuted,fontWeight:600}}>PROGRESS</span>
                <span style={{fontWeight:700,fontSize:"1.2rem",color}}>{pct.toFixed(1)}%</span>
              </div>
              <div style={{height:10,background:T.progressTrack,borderRadius:99,overflow:"visible",position:"relative"}}>
                <div style={{height:"100%",borderRadius:99,width:`${pct}%`,minWidth:4,background:color,transition:"width 0.6s cubic-bezier(.4,0,.2,1)"}}/>
                {pct>5&&pct<100&&<div style={{position:"absolute",top:-4,left:`${pct}%`,width:18,height:18,borderRadius:"50%",background:T.pageBg,border:`2.5px solid ${color}`,transform:"translateX(-50%)",transition:"left 0.6s cubic-bezier(.4,0,.2,1)"}}/>}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",color:T.textMuted,fontSize:"0.68rem"}}>
                <span>$0</span><span>{fmt(activeGoal.target_amount)}</span>
              </div>
            </div>

            {/* Stats container */}
            <div style={{...card(),borderRadius:16,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.8rem 1.2rem",borderBottom:`1px solid ${color}33`,background:color+(isDark?"14":"12")}}>
                <span style={{fontSize:"0.72rem",letterSpacing:"0.12em",color:T.textMuted,fontWeight:600}}>MONTHLY TARGET</span>
                <span style={{fontSize:"1rem",fontWeight:700,color}}>{remaining===0?"🎉 Goal reached!":fmt(needed)}</span>
              </div>
              {[
                {label:"SAVED",     value:fmt(saved),                   c:color},
                {label:"REMAINING", value:fmt(remaining),                c:remaining===0?"#22c990":"#f59e0b"},
                {label:"GOAL",      value:fmt(activeGoal.target_amount), c:T.text},
              ].map((s,i,arr)=>(
                <div key={s.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.8rem 1.2rem",borderBottom:i<arr.length-1?`1px solid ${T.statRowBorder}`:"none"}}>
                  <span style={{fontSize:"0.72rem",letterSpacing:"0.12em",color:T.textSub,fontWeight:600}}>{s.label}</span>
                  <span style={{fontSize:"1rem",fontWeight:700,color:s.c}}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Add Contribution */}
            <button onClick={()=>setShowAddContrib(true)} style={{width:"100%",padding:"0.95rem",border:"none",borderRadius:14,color:"#fff",fontSize:"1rem",fontWeight:700,cursor:"pointer",background:color,fontFamily:FONT}}>
              + Add Contribution
            </button>

            {/* Contributions */}
            <div>
              <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"}}>
                <span style={{fontSize:"0.62rem",letterSpacing:"0.16em",color:T.textMuted,fontWeight:600}}>CONTRIBUTIONS</span>
                <span style={{fontSize:"0.7rem",color:T.textVeryFaint}}>{(activeGoal.contributions||[]).length} entries</span>
              </div>
              {(activeGoal.contributions||[]).length===0 ? (
                <div style={{display:"flex",alignItems:"center",padding:"1.25rem",background:T.cardBg,borderRadius:12,border:`1px dashed ${T.cardBorder}`}}>
                  <span style={{fontSize:"1.8rem"}}>💰</span>
                  <span style={{color:T.textMuted,fontSize:"0.88rem",marginLeft:"0.75rem"}}>No contributions yet</span>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                  {[...(activeGoal.contributions||[])].reverse().map(c=>(
                    <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.85rem 1rem",background:T.cardBg,borderRadius:10,border:`1px solid ${T.cardBorder}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:color,flexShrink:0}}/>
                        <div>
                          <div style={{color:T.text,fontWeight:600,fontSize:"0.95rem"}}>{fmt(c.amount)}</div>
                          {c.note&&<div style={{color:T.textMuted,fontSize:"0.78rem",marginTop:2}}>{c.note}</div>}
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                        <span style={{color:T.textFaint,fontSize:"0.75rem"}}>{fmtDate(c.date)}</span>
                        <button onClick={()=>setShowDeleteContribConfirm(c.id)} style={{background:"none",border:"none",color:T.textFaint,cursor:"pointer",fontSize:"0.85rem",padding:"2px 6px"}}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── MODAL: Add Goal ── */}
      {showAddGoal&&(
        <Modal T={T} onClose={()=>setShowAddGoal(false)} title="New Goal">
          <NewGoalForm T={T} data={newGoal} onChange={setNewGoal} dateInputProps={dateInputProps}/>
          <ModalActions T={T} onCancel={()=>setShowAddGoal(false)} onConfirm={handleAddGoal} confirmLabel="Create" confirmBg={newGoal.color||"#54A0FF"}/>
        </Modal>
      )}

      {/* ── MODAL: Add Contribution ── */}
      {showAddContrib&&activeGoal&&(
        <Modal T={T} onClose={()=>setShowAddContrib(false)} title="Add Contribution">
          <div style={{color:T.textMuted,fontSize:"0.85rem",marginBottom:"1.25rem"}}>{activeGoal.emoji} {activeGoal.name}</div>
          <label style={fieldLabelStyle(T)}>Amount ($)</label>
          <input style={inputStyle(T)} type="number" placeholder="100.00" value={newContrib.amount} onChange={e=>setNewContrib({...newContrib,amount:e.target.value})} autoFocus/>
          <label style={fieldLabelStyle(T)}>Date</label>
          <input {...dateInputProps} value={newContrib.date} onChange={e=>setNewContrib({...newContrib,date:e.target.value})}/>
          <label style={fieldLabelStyle(T)}>Note (optional)</label>
          <input style={inputStyle(T)} placeholder="e.g. Birthday money" value={newContrib.note} onChange={e=>setNewContrib({...newContrib,note:e.target.value})}/>
          <ModalActions T={T} onCancel={()=>setShowAddContrib(false)} onConfirm={handleAddContribution} confirmLabel="Save" confirmBg={color}/>
        </Modal>
      )}

      {/* ── MODAL: Edit Goal ── */}
      {showEditGoal&&editGoal&&(
        <Modal T={T} onClose={()=>setShowEditGoal(false)} title="Edit Goal">
          <EditGoalForm T={T} data={editGoal} onChange={setEditGoal} dateInputProps={dateInputProps}/>
          <ModalActions T={T} onCancel={()=>setShowEditGoal(false)} onConfirm={handleSaveEditGoal} confirmLabel="Save Changes" confirmBg={editGoal.color||"#54A0FF"}/>
        </Modal>
      )}

      {/* ── MODAL: Auth (Sign Up / Sign In) ── */}
      {showAuthModal&&(
        <Modal T={T} onClose={()=>{setShowAuthModal(false);setAuthError("");}} title={authMode==="signup"?"Create Account":"Sign In"}>
          {authMode==="signup"&&(
            <div style={{background:T.nudgeBg,border:`1px solid ${T.nudgeBorder}`,borderRadius:10,padding:"0.85rem",marginBottom:"0.5rem"}}>
              <div style={{fontSize:"0.82rem",color:T.textSub,lineHeight:1.6}}>
                Creating an account gives you:<br/>
                <strong style={{color:T.text}}>📱 Multi-device access</strong> — your goals follow you everywhere<br/>
                <strong style={{color:T.text}}>👫 Shared goals</strong> — save toward something together<br/>
                <strong style={{color:T.text}}>🛡️ Secure backup</strong> — never lose your data
              </div>
            </div>
          )}
          <label style={fieldLabelStyle(T)}>Email</label>
          <input style={inputStyle(T)} type="email" placeholder="you@example.com" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} autoFocus/>
          <label style={fieldLabelStyle(T)}>Password</label>
          <input style={inputStyle(T)} type="password" placeholder="Min. 6 characters" value={authPassword} onChange={e=>setAuthPassword(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleAuth()}/>
          {authError&&<div style={{color:"#FF6B6B",fontSize:"0.82rem",marginTop:"0.75rem"}}>{authError}</div>}
          <ModalActions T={T} onCancel={()=>{setShowAuthModal(false);setAuthError("");}} onConfirm={handleAuth}
            confirmLabel={authLoading?"...":(authMode==="signup"?"Create Account":"Sign In")} confirmBg={color}/>
          <div style={{textAlign:"center",marginTop:"1rem",fontSize:"0.82rem",color:T.textMuted}}>
            {authMode==="signup"
              ? <span>Already have an account? <button onClick={()=>setAuthMode("login")} style={{background:"none",border:"none",color,cursor:"pointer",fontWeight:600,fontFamily:FONT}}>Sign in</button></span>
              : <span>New to ipon? <button onClick={()=>setAuthMode("signup")} style={{background:"none",border:"none",color,cursor:"pointer",fontWeight:600,fontFamily:FONT}}>Create account</button></span>
            }
          </div>
        </Modal>
      )}

      {/* ── MODAL: Delete Goal ── */}
      {showDeleteGoalConfirm&&(
        <Modal T={T} onClose={()=>setShowDeleteGoalConfirm(null)}>
          <h2 style={{fontWeight:700,fontSize:"1.2rem",color:"#FF6B6B",margin:"0 0 0.75rem"}}>Delete Goal?</h2>
          <p style={{color:T.textSub,lineHeight:1.6,fontSize:"0.92rem",margin:"0 0 1.5rem"}}>This will permanently delete this goal and all its contributions.</p>
          <ModalActions T={T} onCancel={()=>setShowDeleteGoalConfirm(null)} onConfirm={()=>handleDeleteGoal(showDeleteGoalConfirm)} confirmLabel="Delete" confirmBg="#FF6B6B"/>
        </Modal>
      )}

      {/* ── MODAL: Delete Contribution ── */}
      {showDeleteContribConfirm&&(
        <Modal T={T} onClose={()=>setShowDeleteContribConfirm(null)}>
          <h2 style={{fontWeight:700,fontSize:"1.2rem",color:"#FF6B6B",margin:"0 0 0.75rem"}}>Remove Contribution?</h2>
          <p style={{color:T.textSub,lineHeight:1.6,fontSize:"0.92rem",margin:"0 0 1.5rem"}}>This contribution will be permanently removed and your monthly target will recalculate.</p>
          <ModalActions T={T} onCancel={()=>setShowDeleteContribConfirm(null)} onConfirm={()=>handleDeleteContrib(showDeleteContribConfirm)} confirmLabel="Remove" confirmBg="#FF6B6B"/>
        </Modal>
      )}
    </div>
  );
}

// ── Logo ──
function IponLogo({size=28,color="currentColor"}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" stroke={color} strokeWidth="2"/>
      <line x1="16" y1="21" x2="16" y2="9" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="10.5" y1="17.5" x2="21.5" y2="17.5" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M16 9 C16 9 12.5 12 11 13.5" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M16 9 C16 9 19.5 12 21 13.5" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ── Modal wrapper ──
function Modal({T,onClose,title,children}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}} onClick={onClose}>
      <div style={{background:T.modalBg,border:`1px solid ${T.cardBorder}`,borderRadius:"20px 20px 0 0",padding:"1.5rem 1.25rem 2.5rem",width:"100%",maxWidth:430,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        {title&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem"}}>
            <h2 style={{fontWeight:700,fontSize:"1.2rem",color:T.text,margin:0}}>{title}</h2>
            <button style={{background:T.cardBg,border:"none",color:T.textSub,width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:"0.85rem",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ── New Goal Form ──
function NewGoalForm({T,data,onChange,dateInputProps}) {
  const debounceRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const dataRef = useRef(data);
  useEffect(()=>{onChangeRef.current=onChange;dataRef.current=data;});

  const suggestEmoji = async (name) => {
    if (!name||name.trim().length<3) return;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:10,
          messages:[{role:"user",content:`Reply with a single emoji that best represents this savings goal: "${name}". Only output the emoji, nothing else.`}]})
      });
      const json = await res.json();
      const emoji = json?.content?.[0]?.text?.trim();
      if (emoji) onChangeRef.current({...dataRef.current,emoji});
    } catch {}
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    onChange({...data,name});
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(()=>suggestEmoji(name),700);
  };

  return (
    <>
      <label style={fieldLabelStyle(T)}>Goal Name</label>
      <input style={inputStyle(T)} placeholder="e.g. Disney World Trip" value={data.name} onChange={handleNameChange} autoFocus/>
      <label style={fieldLabelStyle(T)}>Target Amount ($)</label>
      <input style={inputStyle(T)} type="number" placeholder="5000" value={data.target_amount} onChange={e=>onChange({...data,target_amount:e.target.value})}/>
      <label style={fieldLabelStyle(T)}>Target Date</label>
      <input {...dateInputProps} value={data.deadline} onChange={e=>onChange({...data,deadline:e.target.value})}/>
      <label style={fieldLabelStyle(T)}>Colour</label>
      <div style={{display:"flex",gap:"0.55rem",flexWrap:"wrap"}}>
        {PASTEL_COLORS.map(c=>(
          <div key={c} onClick={()=>onChange({...data,color:c})}
            style={{width:26,height:26,borderRadius:"50%",cursor:"pointer",background:c,border:data.color===c?"2px solid #fff":"2px solid transparent",transform:data.color===c?"scale(1.2)":"scale(1)",transition:"transform 0.15s"}}/>
        ))}
      </div>
    </>
  );
}

// ── Edit Goal Form ──
function EditGoalForm({T,data,onChange,dateInputProps}) {
  return (
    <>
      <label style={fieldLabelStyle(T)}>Goal Name</label>
      <input style={inputStyle(T)} placeholder="e.g. Disney World Trip" value={data.name} onChange={e=>onChange({...data,name:e.target.value})}/>
      <label style={fieldLabelStyle(T)}>Icon</label>
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
        <div style={{fontSize:"2rem",lineHeight:1,minWidth:"2.2rem",textAlign:"center"}}>{data.emoji||"🏷️"}</div>
        <input style={{...inputStyle(T),flex:1}} placeholder="Paste or type an emoji" value={data.emoji}
          onChange={e=>{const val=[...e.target.value].slice(0,2).join("");onChange({...data,emoji:val});}}/>
      </div>
      <div style={{fontSize:"0.7rem",color:T.textMuted,marginTop:"0.35rem"}}>
        Open emoji keyboard: <strong style={{color:T.textSub}}>Windows</strong> Win+. · <strong style={{color:T.textSub}}>Mac</strong> Ctrl+Cmd+Space
      </div>
      <label style={fieldLabelStyle(T)}>Target Amount ($)</label>
      <input style={inputStyle(T)} type="number" value={data.target_amount} onChange={e=>onChange({...data,target_amount:e.target.value})}/>
      <label style={fieldLabelStyle(T)}>Target Date</label>
      <input {...dateInputProps} value={data.deadline} onChange={e=>onChange({...data,deadline:e.target.value})}/>
      <label style={fieldLabelStyle(T)}>Colour</label>
      <div style={{display:"flex",gap:"0.55rem",flexWrap:"wrap"}}>
        {PASTEL_COLORS.map(c=>(
          <div key={c} onClick={()=>onChange({...data,color:c})}
            style={{width:26,height:26,borderRadius:"50%",cursor:"pointer",background:c,border:data.color===c?"2px solid #fff":"2px solid transparent",transform:data.color===c?"scale(1.2)":"scale(1)",transition:"transform 0.15s"}}/>
        ))}
      </div>
    </>
  );
}

// ── Modal Actions ──
function ModalActions({T,onCancel,onConfirm,confirmLabel,confirmBg}) {
  return (
    <div style={{display:"flex",gap:"0.75rem",justifyContent:"flex-end",marginTop:"1.5rem"}}>
      <button onClick={onCancel} style={{background:T.cardBg,border:`1px solid ${T.inputBorder}`,color:T.textSub,borderRadius:10,padding:"0.75rem 1.25rem",fontSize:"0.95rem",cursor:"pointer",fontFamily:FONT}}>Cancel</button>
      <button onClick={onConfirm} style={{background:confirmBg,color:"#fff",border:"none",borderRadius:10,padding:"0.75rem 1.5rem",fontSize:"0.95rem",fontWeight:600,cursor:"pointer",fontFamily:FONT}}>{confirmLabel}</button>
    </div>
  );
}
