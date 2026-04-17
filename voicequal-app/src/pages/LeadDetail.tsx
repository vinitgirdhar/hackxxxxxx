import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowLeft, PhoneCall, RefreshCw, CheckCircle2, XCircle, Clock, Globe, RotateCcw, Database, Zap } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

// ─── Full lead data store ────────────────────────────────────────────────
const leadStore: Record<string, {
  id: string; name: string; phone: string; email: string;
  company: string; score: number | null; bucket: string | null;
  status: string; date: string; source: string;
  bant: { budget: number; authority: number; need: number; timeline: number };
  calls: { status: string; duration: string; time: string; note?: string }[];
  meta: { language: string; retryCount: number; crmSync: string; syncTime: string };
}> = {
  '1': {
    id: '1', name: 'Priya Menon', phone: '+91 98765 43210', email: 'priya@infosys.com',
    company: 'Infosys', score: 9.1, bucket: 'HOT', status: 'COMPLETED',
    date: '2026-04-17', source: 'Inbound',
    bant: { budget: 2.8, authority: 2.9, need: 3.0, timeline: 2.7 },
    calls: [
      { status: 'COMPLETED', duration: '4m 32s', time: '10:14 AM', note: 'Confirmed Q3 budget. Decision-maker engaged.' },
      { status: 'COMPLETED', duration: '1m 08s', time: '09:45 AM', note: 'Initial qualification call.' },
    ],
    meta: { language: 'en-IN', retryCount: 0, crmSync: 'PUSHED', syncTime: '4/17/2026, 10:16 AM' },
  },
  '2': {
    id: '2', name: 'Arjun Sharma', phone: '+91 87654 32109', email: 'arjun@wipro.com',
    company: 'Wipro', score: 8.5, bucket: 'HOT', status: 'COMPLETED',
    date: '2026-04-17', source: 'Outbound',
    bant: { budget: 2.6, authority: 2.8, need: 2.7, timeline: 2.5 },
    calls: [
      { status: 'COMPLETED', duration: '3m 51s', time: '11:30 AM', note: 'Strong buying intent. Requested pricing sheet.' },
      { status: 'FAILED', duration: '—', time: '10:55 AM', note: 'No answer.' },
    ],
    meta: { language: 'en-IN', retryCount: 1, crmSync: 'PUSHED', syncTime: '4/17/2026, 11:33 AM' },
  },
  '3': {
    id: '3', name: 'Neha Kapoor', phone: '+91 76543 21098', email: 'neha@tcs.com',
    company: 'TCS', score: 6.2, bucket: 'WARM', status: 'COMPLETED',
    date: '2026-04-16', source: 'Referral',
    bant: { budget: 1.9, authority: 2.0, need: 2.2, timeline: 1.8 },
    calls: [
      { status: 'COMPLETED', duration: '2m 20s', time: '03:15 PM', note: 'Interested but needs internal approval.' },
    ],
    meta: { language: 'en-IN', retryCount: 0, crmSync: 'PUSHED', syncTime: '4/16/2026, 3:18 PM' },
  },
  '4': {
    id: '4', name: 'Rohit Verma', phone: '+91 65432 10987', email: 'rohit@hcl.com',
    company: 'HCL Tech', score: 4.8, bucket: 'WARM', status: 'CALLING',
    date: '2026-04-16', source: 'Outbound',
    bant: { budget: 1.5, authority: 1.6, need: 1.8, timeline: 1.4 },
    calls: [
      { status: 'CALLING', duration: '—', time: '04:00 PM', note: 'Active call in progress...' },
      { status: 'FAILED', duration: '—', time: '02:30 PM', note: 'Voicemail left.' },
    ],
    meta: { language: 'hi-IN', retryCount: 2, crmSync: 'PENDING', syncTime: '—' },
  },
  '5': {
    id: '5', name: 'Anjali Singh', phone: '+91 54321 09876', email: 'anjali@cognizant.com',
    company: 'Cognizant', score: 2.1, bucket: 'COLD', status: 'COMPLETED',
    date: '2026-04-15', source: 'Referral',
    bant: { budget: 0.7, authority: 0.5, need: 0.9, timeline: 0.6 },
    calls: [
      { status: 'COMPLETED', duration: '1m 12s', time: '11:00 AM', note: 'No current need. Follow up in Q4.' },
      { status: 'FAILED', duration: '—', time: '09:30 AM', note: 'No answer.' },
    ],
    meta: { language: 'en-IN', retryCount: 1, crmSync: 'PUSHED', syncTime: '4/15/2026, 11:04 AM' },
  },
  '6': {
    id: '6', name: 'Vikram Nair', phone: '+91 43210 98765', email: 'vikram@techmahindra.com',
    company: 'Tech Mahindra', score: null, bucket: null, status: 'PENDING',
    date: '2026-04-15', source: 'Outbound',
    bant: { budget: 0, authority: 0, need: 0, timeline: 0 },
    calls: [],
    meta: { language: 'en-IN', retryCount: 0, crmSync: 'NOT SYNCED', syncTime: '—' },
  },
  '7': {
    id: '7', name: 'Kavya Reddy', phone: '+91 32109 87654', email: 'kavya@mphasis.com',
    company: 'Mphasis', score: 7.3, bucket: 'HOT', status: 'COMPLETED',
    date: '2026-04-15', source: 'Inbound',
    bant: { budget: 2.2, authority: 2.4, need: 2.5, timeline: 2.1 },
    calls: [
      { status: 'COMPLETED', duration: '3m 07s', time: '02:45 PM', note: 'Ready to proceed. Sent to sales team.' },
    ],
    meta: { language: 'en-IN', retryCount: 0, crmSync: 'PUSHED', syncTime: '4/15/2026, 2:48 PM' },
  },
  '8': {
    id: '8', name: 'Siddharth Rao', phone: '+91 21098 76543', email: 'sid@zensar.com',
    company: 'Zensar', score: 5.5, bucket: 'WARM', status: 'COMPLETED',
    date: '2026-04-14', source: 'Outbound',
    bant: { budget: 1.7, authority: 1.8, need: 2.0, timeline: 1.5 },
    calls: [
      { status: 'COMPLETED', duration: '2m 55s', time: '05:10 PM', note: 'Interested. Budget approval pending.' },
    ],
    meta: { language: 'en-IN', retryCount: 0, crmSync: 'PUSHED', syncTime: '4/14/2026, 5:13 PM' },
  },
  '9': {
    id: '9', name: 'Meera Iyer', phone: '+91 10987 65432', email: 'meera@lnt.com',
    company: 'L&T Infotech', score: 8.9, bucket: 'HOT', status: 'COMPLETED',
    date: '2026-04-14', source: 'Inbound',
    bant: { budget: 2.7, authority: 2.9, need: 2.8, timeline: 2.6 },
    calls: [
      { status: 'COMPLETED', duration: '5m 14s', time: '01:00 PM', note: 'High intent. Budget confirmed. Closing next week.' },
    ],
    meta: { language: 'en-IN', retryCount: 0, crmSync: 'PUSHED', syncTime: '4/14/2026, 1:05 PM' },
  },
  '10': {
    id: '10', name: 'Ravi Kumar', phone: '+91 99876 54321', email: 'ravi@persistent.com',
    company: 'Persistent', score: 1.8, bucket: 'COLD', status: 'FAILED',
    date: '2026-04-13', source: 'Outbound',
    bant: { budget: 0.5, authority: 0.7, need: 0.6, timeline: 0.4 },
    calls: [
      { status: 'FAILED', duration: '—', time: '03:00 PM', note: 'Wrong number.' },
      { status: 'FAILED', duration: '—', time: '11:00 AM', note: 'No answer.' },
    ],
    meta: { language: 'en-IN', retryCount: 2, crmSync: 'NOT SYNCED', syncTime: '—' },
  },
};

// ─── Colours ──────────────────────────────────────────────────────────────
const bucketStyle: Record<string, { bg: string; text: string; border: string }> = {
  HOT:  { bg: 'rgba(31,138,112,0.1)',   text: '#1F8A70', border: 'rgba(31,138,112,0.3)'  },
  WARM: { bg: 'rgba(212,175,55,0.1)',   text: '#A67C2E', border: 'rgba(212,175,55,0.3)'  },
  COLD: { bg: 'rgba(100,116,139,0.08)', text: '#64748B', border: 'rgba(100,116,139,0.2)' },
};

const callStatusStyle: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: 'rgba(31,138,112,0.1)',   text: '#1F8A70' },
  CALLING:   { bg: 'rgba(212,175,55,0.1)',   text: '#A67C2E' },
  FAILED:    { bg: 'rgba(239,68,68,0.1)',    text: '#DC2626' },
  PENDING:   { bg: 'rgba(100,116,139,0.08)', text: '#64748B' },
};

const crmSyncStyle: Record<string, { bg: string; text: string }> = {
  PUSHED:      { bg: 'rgba(31,138,112,0.1)',   text: '#1F8A70' },
  PENDING:     { bg: 'rgba(212,175,55,0.1)',   text: '#A67C2E' },
  'NOT SYNCED':{ bg: 'rgba(100,116,139,0.08)', text: '#64748B' },
};

// ─── BANT Bar ────────────────────────────────────────────────────────────
function BANTBar({ label, value, max = 3 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = pct >= 80 ? '#1F8A70' : pct >= 50 ? '#D4AF37' : '#94A3B8';
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold" style={{ color: '#52525b' }}>{label}</span>
        <span className="text-sm font-black tabular-nums" style={{ color }}>{value.toFixed(1)}/3</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${color}18` }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Call Activity Row ───────────────────────────────────────────────────
function CallRow({ call, i }: { call: { status: string; duration: string; time: string; note?: string }; i: number }) {
  const s = callStatusStyle[call.status] ?? callStatusStyle.PENDING;
  const Icon = call.status === 'COMPLETED' ? CheckCircle2 : call.status === 'CALLING' ? PhoneCall : XCircle;
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 py-3"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: s.bg }}>
        <Icon className="w-3.5 h-3.5" style={{ color: s.text }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
            style={{ backgroundColor: s.bg, color: s.text }}>{call.status}</span>
          <div className="flex items-center gap-3 text-[10px] font-medium" style={{ color: '#94a3b8' }}>
            {call.duration !== '—' && <span>{call.duration}</span>}
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{call.time}</span>
          </div>
        </div>
        {call.note && <p className="text-[11px] font-medium mt-1" style={{ color: '#71717a' }}>{call.note}</p>}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function LeadDetail({ params }: { params: { id: string } }) {
  const [, navigate] = useLocation();
  const lead = leadStore[params.id];

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="text-5xl font-black" style={{ color: '#D4AF37' }}>404</div>
          <p className="text-zinc-500 font-medium">Lead not found.</p>
          <button onClick={() => navigate('/leads')} className="text-sm font-black text-emerald-600 hover:underline uppercase tracking-widest">← Back to Leads</button>
        </div>
      </DashboardLayout>
    );
  }

  const totalBANT = ((lead.bant.budget + lead.bant.authority + lead.bant.need + lead.bant.timeline) / 12 * 10);
  const bk = lead.bucket ? bucketStyle[lead.bucket] : bucketStyle.COLD;
  const sk = callStatusStyle[lead.status] ?? callStatusStyle.PENDING;
  const ck = crmSyncStyle[lead.meta.crmSync] ?? crmSyncStyle['NOT SYNCED'];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => navigate('/leads')}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:gap-3 transition-all"
          style={{ color: '#71717a' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to leads
        </motion.button>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="premium-card p-6"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shrink-0"
                style={{ background: 'linear-gradient(135deg,#1F8A70,#0F3D3E)', border: '2px solid rgba(212,175,55,0.3)', boxShadow: '0 4px 16px rgba(31,138,112,0.25)' }}>
                {lead.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: '#09090b', fontFamily: "'Outfit', sans-serif" }}>{lead.name}</h1>
                  {lead.bucket && (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest"
                      style={{ backgroundColor: bk.bg, color: bk.text, border: `1px solid ${bk.border}` }}>
                      {lead.bucket}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs font-medium flex-wrap" style={{ color: '#71717a' }}>
                  <span style={{ fontFamily: 'monospace' }}>{lead.phone}</span>
                  <span style={{ color: 'rgba(0,0,0,0.2)' }}>·</span>
                  <span>{lead.source}</span>
                  <span style={{ color: 'rgba(0,0,0,0.2)' }}>·</span>
                  <span>Created {lead.date}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest"
                style={{ backgroundColor: sk.bg, color: sk.text, border: `1px solid ${sk.text}20` }}>
                {lead.status}
              </span>
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                style={{ background: 'white', border: '1px solid rgba(0,0,0,0.1)', color: '#09090b', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Call
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#1F8A70,#0F3D3E)', boxShadow: '0 4px 14px rgba(31,138,112,0.3)' }}
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call Now
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: BANT */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 premium-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-black text-sm uppercase tracking-widest mb-0.5" style={{ color: '#09090b', fontFamily: "'Outfit', sans-serif" }}>
                  BANT Qualification
                </div>
                <div className="text-xs font-medium" style={{ color: '#71717a' }}>Budget · Authority · Need · Timeline</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black tabular-nums leading-none" style={{ color: '#1F8A70', fontFamily: "'Outfit', sans-serif" }}>
                  {lead.score != null ? lead.score.toFixed(1) : '—'}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: '#94a3b8' }}>/10</div>
              </div>
            </div>

            {lead.status === 'PENDING' || lead.score == null ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,175,55,0.08)' }}>
                  <Zap className="w-5 h-5" style={{ color: '#D4AF37' }} />
                </div>
                <p className="text-sm font-bold" style={{ color: '#94a3b8' }}>No call data yet — lead is pending qualification</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
                <BANTBar label="Budget" value={lead.bant.budget} />
                <BANTBar label="Authority" value={lead.bant.authority} />
                <BANTBar label="Need" value={lead.bant.need} />
                <BANTBar label="Timeline" value={lead.bant.timeline} />
              </div>
            )}

            {/* Overall BANT score bar */}
            {lead.score != null && (
              <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>Overall Score</span>
                  <span className="text-xs font-black" style={{ color: '#1F8A70' }}>{totalBANT.toFixed(1)} / 10</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(31,138,112,0.08)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${totalBANT * 10}%` }}
                    transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #1F8A70, #28B893)' }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Right column */}
          <div className="space-y-5">

            {/* System Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="premium-card p-5"
            >
              <div className="font-black text-sm uppercase tracking-widest mb-4" style={{ color: '#09090b', fontFamily: "'Outfit', sans-serif" }}>
                System Metadata
              </div>
              <div className="space-y-3.5">
                {[
                  { icon: Globe,      label: 'Language',    value: lead.meta.language,    badge: null },
                  { icon: RotateCcw,  label: 'Retry Count', value: String(lead.meta.retryCount), badge: null },
                  { icon: Database,   label: 'CRM Sync',    value: lead.meta.crmSync,     badge: ck },
                  { icon: Clock,      label: 'Sync Time',   value: lead.meta.syncTime,    badge: null },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <row.icon className="w-3.5 h-3.5 shrink-0" style={{ color: '#94a3b8' }} />
                      <span className="text-xs font-bold" style={{ color: '#71717a' }}>{row.label}</span>
                    </div>
                    {row.badge ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                        style={{ backgroundColor: row.badge.bg, color: row.badge.text }}>
                        {row.value}
                      </span>
                    ) : (
                      <span className="text-xs font-bold tabular-nums" style={{ color: '#09090b' }}>{row.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="premium-card p-5"
            >
              <div className="font-black text-sm uppercase tracking-widest mb-3" style={{ color: '#09090b', fontFamily: "'Outfit', sans-serif" }}>Contact</div>
              <div className="text-xs font-medium mb-1" style={{ color: '#71717a' }}>Email</div>
              <div className="text-sm font-bold truncate" style={{ color: '#09090b' }}>{lead.email}</div>
              <div className="text-xs font-medium mt-3 mb-1" style={{ color: '#71717a' }}>Company</div>
              <div className="text-sm font-bold" style={{ color: '#09090b' }}>{lead.company}</div>
            </motion.div>
          </div>
        </div>

        {/* Call Activity */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="premium-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
            <div className="font-black text-sm uppercase tracking-widest" style={{ color: '#09090b', fontFamily: "'Outfit', sans-serif" }}>
              Call Activity
            </div>
            <span className="text-xs font-black w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(31,138,112,0.08)', color: '#1F8A70' }}>
              {lead.calls.length}
            </span>
          </div>
          <div className="px-6 py-2">
            {lead.calls.length === 0 ? (
              <div className="py-12 text-center">
                <PhoneCall className="w-8 h-8 mx-auto mb-3" style={{ color: 'rgba(0,0,0,0.1)' }} />
                <p className="text-sm font-bold" style={{ color: '#94a3b8' }}>No calls made yet</p>
              </div>
            ) : (
              lead.calls.map((call, i) => <CallRow key={i} call={call} i={i} />)
            )}
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
