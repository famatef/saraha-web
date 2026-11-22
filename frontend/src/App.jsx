import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Check, Copy, Heart, Inbox, LockKeyhole, LogOut, RefreshCw,
  MessageCircle, Send, Share2, ShieldCheck, Sparkles, UserRound,
} from "lucide-react";
import api from "./api";
import "./features.css";

function Brand() {
  return <Link className="brand" to="/"><span className="brand-icon"><MessageCircle size={20} /></span><span>صراحة<span className="brand-dot">.</span></span></Link>;
}

function Shell({ children, className = "" }) {
  return <div className={`app-shell ${className}`}><header className="topbar"><Brand /><span className="top-note"><i /> مساحة آمنة لكلام صادق</span></header>{children}<footer>صُممت لتكون الكلمات الصادقة أقرب <Heart size={13} fill="currentColor" /></footer></div>;
}

function Field({ label, type = "text", placeholder, value, onChange, autoComplete }) {
  return <label className="field"><span>{label}</span><input required type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete} /></label>;
}

function ErrorMessage({ children }) {
  return children ? <p className="error" role="alert">{children}</p> : null;
}

function AuthLayout({ title, subtitle, children, mode = "login" }) {
  return <Shell className="auth-shell"><main className="auth-layout">
    <section className="auth-card"><div className="mobile-brand"><Brand /></div>
      <div className="eyebrow"><Sparkles size={15} /> {mode === "login" ? "أهلاً بعودتك" : "خطوتك الأولى"}</div>
      <h1>{title}</h1><p className="muted">{subtitle}</p>{children}
    </section>
    <aside className="auth-aside"><div className="aside-orbit orbit-one" /><div className="aside-orbit orbit-two" />
      <div className="aside-content"><div className="aside-badge"><ShieldCheck size={16} /> خصوصيتك أولويتنا</div>
        <div className="big-quote">“</div><h2>بعض الكلمات الصادقة<br />تغيّر يومًا كاملًا.</h2>
        <p>شارك أفكارك واستقبل رسائل مجهولة في مساحتك الخاصة.</p>
        <div className="aside-foot"><span className="avatar-stack"><i>م</i><i>ن</i><i>س</i></span><span>مساحة لك، وكلام صادق من الآخرين</span></div>
      </div>
    </aside>
  </main></Shell>;
}

function Login({ onAuthenticated }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const { data } = await api.post("/users/signin", form);
      if (!data?.access_token || !data?.user) throw new Error("بيانات الجلسة غير مكتملة من الخادم.");
      localStorage.setItem("saraha_access_token", data.access_token);
      localStorage.setItem("saraha_refresh_token", data.refresh_token || "");
      localStorage.setItem("saraha_user", JSON.stringify(data.user));
      onAuthenticated(data.access_token); navigate("/dashboard", { replace: true });
    } catch (e) { setError(e.message || "تعذر تسجيل الدخول. حاول مرة أخرى."); }
    finally { setBusy(false); }
  };
  return <AuthLayout title="مساحتك بانتظارك." subtitle="سجّل دخولك واكتشف ما يشاركه أصدقاؤك معك.">
    <form onSubmit={submit} className="auth-form">
      <Field label="البريد الإلكتروني" type="email" placeholder="name@example.com" value={form.email} onChange={email => setForm({ ...form, email })} autoComplete="email" />
      <Field label="كلمة المرور" type="password" placeholder="أدخل كلمة المرور" value={form.password} onChange={password => setForm({ ...form, password })} autoComplete="current-password" />
      <ErrorMessage>{error}</ErrorMessage>
      <button className="primary" disabled={busy}>{busy ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}<ArrowLeft size={18} /></button>
    </form>
    <Link className="forgot-link" to="/forgot-password">نسيت كلمة المرور؟</Link>
    <div className="auth-switch">جديد هنا؟ <Link to="/signup">أنشئ حسابًا الآن</Link></div>
    <div className="secure-note"><LockKeyhole size={14} /> رسائلك ومعلوماتك بأمان</div>
  </AuthLayout>;
}

function Signup() {
  const [form, setForm] = useState({ fname: "", lname: "", email: "", age: "", gender: "male", phone: "", password: "", cpassword: "" });
  const [error, setError] = useState(""); const [otp, setOtp] = useState("");
  const [created, setCreated] = useState(false); const [busy, setBusy] = useState(false); const navigate = useNavigate();
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError("");
    try { await api.post("/users/signup", { ...form, age: Number(form.age) }); setCreated(true); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const verify = async e => {
    e.preventDefault(); setBusy(true); setError("");
    try { await api.patch("/users/confirm-email", { email: form.email, otp }); navigate("/", { replace: true }); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const change = key => value => setForm({ ...form, [key]: value });
  return <AuthLayout mode="signup" title={created ? "تحقق من بريدك." : "أهلًا بك بيننا."} subtitle={created ? "أدخل رمز التحقق المرسل إلى بريدك الإلكتروني لتفعيل حسابك." : "أنشئ مساحتك الخاصة واستقبل كلمات صادقة من حولك."}>
    {created ? <form onSubmit={verify} className="auth-form"><Field label="رمز التحقق" placeholder="أدخل الرمز المرسل إلى بريدك" value={otp} onChange={setOtp} /><ErrorMessage>{error}</ErrorMessage><button className="primary" disabled={busy}>{busy ? "جارٍ التحقق…" : "تأكيد البريد"}<ArrowLeft size={18} /></button></form> :
      <form onSubmit={submit} className="auth-form"><div className="form-row"><Field label="الاسم الأول" placeholder="الاسم الأول" value={form.fname} onChange={change("fname")} autoComplete="given-name" /><Field label="اسم العائلة" placeholder="اسم العائلة" value={form.lname} onChange={change("lname")} autoComplete="family-name" /></div>
        <Field label="البريد الإلكتروني" type="email" placeholder="name@example.com" value={form.email} onChange={change("email")} autoComplete="email" />
        <div className="form-row"><Field label="العمر" type="number" placeholder="18 أو أكثر" value={form.age} onChange={change("age")} /><label className="field"><span>النوع</span><select value={form.gender} onChange={e => change("gender")(e.target.value)}><option value="male">ذكر</option><option value="female">أنثى</option></select></label></div>
        <Field label="رقم الهاتف" placeholder="01xxxxxxxxx" value={form.phone} onChange={change("phone")} autoComplete="tel" />
        <Field label="كلمة المرور" type="password" placeholder="8 أحرف على الأقل" value={form.password} onChange={change("password")} autoComplete="new-password" />
        <Field label="تأكيد كلمة المرور" type="password" placeholder="أعد كتابة كلمة المرور" value={form.cpassword} onChange={change("cpassword")} autoComplete="new-password" />
        <ErrorMessage>{error}</ErrorMessage><button className="primary" disabled={busy}>{busy ? "جارٍ إنشاء الحساب…" : "إنشاء حساب"}<ArrowLeft size={18} /></button>
      </form>}
    <div className="auth-switch">لديك حساب بالفعل؟ <Link to="/">سجّل الدخول</Link></div>
  </AuthLayout>;
}

function ForgotPassword() {
  const [email, setEmail] = useState(""); const [otp, setOtp] = useState("");
  const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("request"); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const requestCode = async e => {
    e.preventDefault(); setBusy(true); setError(""); setSuccess("");
    const normalizedEmail = email.trim().toLowerCase();
    try { await api.patch("/users/forgot-password", { email: normalizedEmail }); setEmail(normalizedEmail); setStep("reset"); setSuccess("أرسلنا رمز التحقق إلى بريدك الإلكتروني."); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const reset = async e => {
    e.preventDefault(); setBusy(true); setError(""); setSuccess("");
    if (password !== confirmPassword) { setError("كلمتا المرور غير متطابقتين."); setBusy(false); return; }
    try { await api.patch("/users/reset-password", { email, otp, newPassword: password }); setStep("done"); setSuccess("تم تغيير كلمة المرور. تقدر تسجل دخولك الآن."); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <AuthLayout mode="signup" title={step === "done" ? "رجعناك لحسابك." : "نسيت كلمة المرور؟"} subtitle={step === "request" ? "اكتب بريدك الإلكتروني ونبعتلك رمز آمن لإعادة تعيينها." : "أدخل الرمز اللي وصلك واختار كلمة مرور جديدة."}>
    {step === "request" && <form onSubmit={requestCode} className="auth-form"><Field label="البريد الإلكتروني" type="email" placeholder="name@example.com" value={email} onChange={setEmail} autoComplete="email" /><ErrorMessage>{error}</ErrorMessage><button className="primary" disabled={busy}>{busy ? "جارٍ إرسال الرمز…" : "إرسال رمز التحقق"}<ArrowLeft size={18} /></button></form>}
    {step === "reset" && <form onSubmit={reset} className="auth-form"><div className="reset-email">رمز التحقق مُرسل إلى <b dir="ltr">{email}</b></div><Field label="رمز التحقق" placeholder="الرمز المكوّن من 6 أرقام" value={otp} onChange={setOtp} /><Field label="كلمة المرور الجديدة" type="password" placeholder="8 أحرف على الأقل" value={password} onChange={setPassword} autoComplete="new-password" /><Field label="تأكيد كلمة المرور" type="password" placeholder="أعد كتابة كلمة المرور" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" /><ErrorMessage>{error}</ErrorMessage><button className="primary" disabled={busy}>{busy ? "جارٍ تحديث كلمة المرور…" : "حفظ كلمة المرور الجديدة"}<ArrowLeft size={18} /></button></form>}
    {step === "done" && <button className="primary" onClick={() => navigate("/", { replace: true })}>العودة لتسجيل الدخول<ArrowLeft size={18} /></button>}
    {success && <p className="success" role="status">{success}</p>}
    {step !== "done" && <div className="auth-switch"><Link to="/">العودة لتسجيل الدخول</Link></div>}
  </AuthLayout>;
}

function Dashboard({ onLogout }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("saraha_user") || "{}"));
  const [messages, setMessages] = useState([]); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(""); const [copied, setCopied] = useState(false); const navigate = useNavigate();
  const loadMessages = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    setError("");
    try { const { data } = await api.get("/messages"); setMessages(Array.isArray(data) ? data : data.messages || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => {
    api.get("/users/profile").then(({ data }) => { setUser(data.user); localStorage.setItem("saraha_user", JSON.stringify(data.user)); }).catch(e => setError(e.message));
    loadMessages();
    const timer = setInterval(() => loadMessages(), 30000);
    return () => clearInterval(timer);
  }, [loadMessages]);
  const logout = async () => { try { await api.patch("/users/logout"); } catch {} onLogout(); navigate("/", { replace: true }); };
  const publicBaseUrl = (import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin).replace(/\/+$/, "");
  const shareLink = `${publicBaseUrl}/u/${user._id || ""}`;
  const localLink = ["localhost", "127.0.0.1", "0.0.0.0"].includes(new URL(publicBaseUrl).hostname);
  const copy = async () => { try { await navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setError("تعذر نسخ الرابط. انسخه يدويًا."); } };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "صراحة", text: "ابعتلي رسالة بسرية على صراحة", url: shareLink });
      else await copy();
    } catch (e) { if (e.name !== "AbortError") setError("تعذرت المشاركة. انسخ الرابط وابعته يدويًا."); }
  };
  return <Shell><main className="dashboard">
    <section className="dash-welcome"><div><div className="eyebrow"><Sparkles size={15} /> مساحتك الخاصة</div><h1>أهلًا، {user.fname || "بك"} <span>👋</span></h1><p>هنا تصلك الكلمات التي يود الآخرون مشاركتها معك.</p></div><button className="logout" onClick={logout}><LogOut size={16} /> تسجيل الخروج</button></section>
    <section className="share-card"><div className="share-art"><Send size={25} /></div><div className="share-copy"><span className="share-kicker">رابطك الشخصي</span><h2>افتح باب الكلام الصادق</h2><p>شارك رابطك مع أصحابك واستقبل رسائلهم بسرية.</p><div className="share-link"><a href={shareLink} target="_blank" rel="noreferrer" dir="ltr">{shareLink}</a><div className="share-actions"><button onClick={share}><Share2 size={15} />مشاركة</button><button onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "تم النسخ" : "نسخ"}</button></div></div>{localLink && <p className="local-warning">الرابط الحالي تجريبي على جهازك فقط. عشان أصحابك يفتحوه، ارفع الموقع واضبط <code>VITE_PUBLIC_APP_URL</code> على رابط الموقع المنشور.</p>}</div><div className="share-decoration">✳</div></section>
    <section className="inbox-section"><div className="section-heading"><div><div className="eyebrow"><Inbox size={15} /> صندوق رسائلك</div><h2>كل رسالة لها معنى</h2></div><div className="inbox-actions"><span className="message-count">{messages.length} رسالة</span><button className="refresh-button" onClick={() => loadMessages(true)} disabled={refreshing} aria-label="تحديث الرسائل" title="تحديث الرسائل"><RefreshCw size={15} className={refreshing ? "spinning" : ""} /><span>{refreshing ? "جارٍ التحديث" : "تحديث"}</span></button></div></div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {loading ? <div className="empty-state"><div className="loader" /><p>بنجهز صندوقك…</p></div> : messages.length === 0 ? <div className="empty-state"><div className="empty-art"><MessageCircle size={26} /></div><h3>صندوقك هادئ الآن</h3><p>شارك رابطك الشخصي، وأول رسالة هتوصلك هنا.</p><button className="text-action" onClick={copy}>{copied ? "تم نسخ الرابط" : "انسخ رابطك وشاركه"}<ArrowLeft size={15} /></button></div> :
        <div className="message-grid">{messages.map(message => <article className="message-card" key={message._id}><div className="message-top"><span><span className="anon-avatar"><UserRound size={15} /></span> رسالة مجهولة</span><time>{message.createdAt ? new Date(message.createdAt).toLocaleString("ar-EG") : "الآن"}</time></div><p>{message.content || "تم استلام مرفق"}</p></article>)}</div>}
    </section>
  </main></Shell>;
}

function PublicProfile() {
  const { id } = useParams(); const [profile, setProfile] = useState(null); const [content, setContent] = useState("");
  const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { api.get(`/users/share-profile/${id}`).then(({ data }) => setProfile(data.user)).catch(e => setStatus(e.message)); }, [id]);
  const send = async e => { e.preventDefault(); setBusy(true); setStatus(""); try { await api.post(`/users/${id}/messages`, { content }, { headers: { Authorization: "" } }); setContent(""); setStatus("وصلت رسالتك، شكرًا لصراحتك."); } catch (e) { setStatus(`تعذر إرسال الرسالة: ${e.message}`); } finally { setBusy(false); } };
  return <Shell><main className="public-wrap"><section className="public-card"><div className="public-icon">{profile?.fname?.[0]?.toUpperCase() || <MessageCircle size={26} />}</div><div className="eyebrow centered">رسالة مجهولة</div><h1>قول اللي في قلبك{profile?.fname ? ` يا ${profile.fname}` : ""}</h1><p className="muted center">رسالتك هتوصل بسرية تامة. خليك صريح ولطيف.</p><form onSubmit={send}><textarea maxLength="1000" value={content} onChange={e => setContent(e.target.value)} placeholder="اكتب رسالتك هنا…" required /><div className="form-foot"><span>{content.length}/1000</span><button className="primary" disabled={busy || !content.trim()}>{busy ? "جارٍ الإرسال…" : "إرسال بسرية"}<Send size={16} /></button></div></form>{status && <p className={status.startsWith("وصلت") ? "success" : "error"} role="status">{status}</p>}</section></main></Shell>;
}

function DashboardRoute({ token, onLogout }) { return token ? <Dashboard onLogout={onLogout} /> : <Navigate to="/" replace />; }
function HomeRoute({ token, onAuthenticated }) { return token ? <Navigate to="/dashboard" replace /> : <Login onAuthenticated={onAuthenticated} />; }

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("saraha_access_token"));
  const logout = () => { ["saraha_access_token", "saraha_refresh_token", "saraha_user"].forEach(key => localStorage.removeItem(key)); setToken(null); };
  return <Routes><Route path="/" element={<HomeRoute token={token} onAuthenticated={setToken} />} /><Route path="/signup" element={<Signup />} /><Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/dashboard" element={<DashboardRoute token={token} onLogout={logout} />} /><Route path="/u/:id" element={<PublicProfile />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
