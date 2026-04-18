# VoiceQual — AI-Powered Lead Qualification Platform

> Automatically call leads, qualify them with BANT scoring powered by Groq LLaMA 3, and route hot prospects to your sales team in real time.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Pages & Modules](#pages--modules)
- [API Integrations](#api-integrations)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment & Configuration](#environment--configuration)
- [Key Workflows](#key-workflows)
- [Design System](#design-system)

---

## Overview

VoiceQual is a full-stack AI sales intelligence platform built for insurance and B2B sales teams. It automates the most time-consuming part of sales — the initial qualification call — by using ElevenLabs conversational AI to call leads and Groq LLaMA 3 to score every conversation using the BANT framework (Budget, Authority, Need, Timeline).

**The problem it solves:** Sales reps waste 60–70% of their time calling leads that will never convert. VoiceQual lets an AI agent make those calls, score each lead 0–10, and only surfaces the HOT prospects to human reps — so your team only talks to people who are ready to buy.

---

## Live Demo

```
npm run dev → http://localhost:5173
```

Landing page at `/` → Dashboard at `/dashboard`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 3 |
| Animations | Framer Motion 12 |
| Routing | Wouter 3 |
| Database | Supabase (PostgreSQL) |
| Icons | Lucide React |
| AI Calling | ElevenLabs Conversational AI |
| AI Scoring | Groq Cloud — LLaMA 3.1 8B Instant |
| Automation | n8n (self-hosted workflow engine) |
| Notifications | Telegram Bot API |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     VoiceQual Frontend                   │
│              React + Vite + Tailwind + Wouter            │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼──────────────┐
         │             │              │
         ▼             ▼              ▼
   ┌──────────┐  ┌──────────┐  ┌──────────────┐
   │ElevenLabs│  │  Groq    │  │   Supabase   │
   │  Convai  │  │ LLaMA 3  │  │  PostgreSQL  │
   │  API     │  │  BANT    │  │  call_results│
   └────┬─────┘  └────┬─────┘  └──────┬───────┘
        │              │               │
        └──────────────▼───────────────┘
                       │
               ┌───────▼────────┐
               │   n8n Webhook  │
               │  Orchestration │
               └────────────────┘
                       │
               ┌───────▼────────┐
               │ Telegram Bot   │
               │  HOT Alerts    │
               └────────────────┘
```

**Data Flow:**
1. Lead imported via CSV or CRM sync
2. Dashboard triggers n8n webhook → ElevenLabs AI calls the lead
3. ElevenLabs conducts BANT qualification conversation
4. Call transcript fetched → Groq LLaMA 3 scores it (0–10 per dimension)
5. Result stored in Supabase → Dashboard updates in real time
6. HOT leads (score ≥ 7) trigger Telegram notification to sales rep

---

## Features

### Core

- **AI Voice Calling** — ElevenLabs Conversational AI makes outbound calls to leads autonomously
- **BANT Scoring** — Groq LLaMA 3.1 analyzes every transcript and scores Budget / Authority / Need / Timeline (each 0–10, averaged to a total score)
- **Real-time Call Monitoring** — Live polling every 8 seconds detects in-progress calls; status auto-updates from CALLING → COMPLETED with score on completion
- **Lead Pipeline (Kanban)** — 5-stage drag-free pipeline: Imported → Called → Qualified → Hot → Closed with financial velocity tracking
- **CSV Import** — Drag-and-drop or click-to-browse CSV importer with auto column mapping and preview before import
- **CRM Panel** — Built-in mock CRM with lead records, sync button, and contact management
- **Telegram Alerts** — One-click send of call summary + BANT score to Telegram for HOT/WARM leads
- **Call Recordings** — Playback ElevenLabs audio recordings directly in the expanded call panel
- **Full Transcripts** — View complete conversation transcripts with AI/Lead message bubbles

### Dashboard

- Live KPI cards: Total Calls, Calls Done, Hot Leads, Conversion Rate
- Real-time sparkline charts per KPI
- Recent activity feed pulled from ElevenLabs API + Supabase
- Start Campaign button — triggers n8n webhook to begin a new AI call
- CRM panel with lead records, status badges, search and sync

### Analytics

- Conversion funnel visualization
- BANT score distribution breakdown
- Call outcome trends (HOT / WARM / COLD)
- Performance metrics over time

### Pipeline

- Kanban board with all 5 qualification stages
- Per-column financial velocity (premium value in ₹L)
- Promote / demote leads between stages with animated card transitions
- Stage badge, avatar gradient, and card color all update instantly on stage change
- Filter by stage with live lead/value counts

### Leads

- Full lead table with name, company, phone, BANT score bar, bucket badge, status
- Filter by outcome (HOT/WARM/COLD) and status (COMPLETED/CALLING/FAILED)
- Search by name or company
- CSV import modal with drag-and-drop, column preview, and one-click confirm
- Click any lead to view detail page

### Calls

- Live calls banner — auto-appears when ElevenLabs detects an in-progress conversation
- Expandable call rows: summary, audio player, full transcript, BANT score panel
- Groq scoring runs in parallel after page load (200ms stagger to respect rate limits)
- Score cache — re-expanding a scored call doesn't re-score
- Telegram send button on HOT/WARM scored calls

### Settings

- AI Agent configuration (ElevenLabs agent ID, voice, language)
- CRM integration settings
- Notification preferences
- Account management

### Help & Docs

- Full onboarding guide covering all 5 workflow steps
- FAQ section
- API reference links

---

## Pages & Modules

```
src/pages/
├── LandingPage.tsx     Landing page with product intro and 5-step workflow
├── Dashboard.tsx       Main dashboard — KPIs, recent activity, CRM, call trigger
├── Leads.tsx           Lead management table with CSV import
├── LeadDetail.tsx      Individual lead detail view
├── Calls.tsx           Conversation list with live monitoring + BANT scoring
├── Analytics.tsx       Charts, funnel, and performance metrics
├── Pipeline.tsx        Kanban board — 5-stage qualification funnel
├── SettingsPage.tsx    Platform configuration
└── HelpDocs.tsx        Documentation and onboarding guide

src/components/
└── DashboardLayout.tsx Shared sidebar + topbar layout for all dashboard pages

src/lib/
├── supabase.ts         Supabase client + CallResult interface
└── mockCalls.ts        25 mock call records with full BANT scores for demo

src/api/
└── triggerCall.ts      n8n webhook trigger for initiating AI calls

src/
├── App.tsx             Route definitions + page transition animations
└── main.tsx            React entry point
```

---

## API Integrations

### ElevenLabs Conversational AI
- **Endpoint:** `https://api.elevenlabs.io/v1/convai/conversations`
- **Used for:** Fetching call list, individual conversation details, transcripts, audio recordings
- **Polling:** Every 8 seconds for in-progress call detection
- **Key:** `sk_865181f73d2db5ebfebdf24343837a6194959b066258b977`

```ts
// Fetch conversation list
GET /v1/convai/conversations?limit=25
Headers: { "xi-api-key": ELEVENLABS_API_KEY }

// Fetch single conversation (transcript + summary)
GET /v1/convai/conversations/:id

// Fetch audio recording
GET /v1/convai/conversations/:id/audio
```

### Groq Cloud — LLaMA 3.1 8B Instant
- **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
- **Model:** `llama-3.1-8b-instant`
- **Used for:** BANT scoring every completed call transcript
- **Rate limit handling:** 220ms stagger between parallel scoring calls
- **Key:** `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`

```ts
// BANT score output shape
{
  budget: number,     // 3–10
  authority: number,  // 3–10
  need: number,       // 3–10
  timeline: number,   // 3–10
  summary: string     // 12 words max
}
// total = average of 4 dimensions
// label = HOT (≥7) | WARM (≥4.5) | COLD (<4.5)
```

### Supabase
- **URL:** `https://cmttaieyuweyjxjjtrel.supabase.co`
- **Table:** `call_results`
- **Used for:** Storing completed call results synced from n8n

```ts
interface CallResult {
  call_id: string
  status: string        // "done"
  transcript?: string
  score?: number
  called_at: string
  summary?: string
  recording_url?: string
  lead_name?: string
  phone?: string
  company?: string
  outcome?: string      // HOT | WARM | COLD
}
```

### n8n Webhook
- **Workflow URL:** [https://vinit123.app.n8n.cloud/workflow/sP1xm3DYdbF4yI73](https://vinit123.app.n8n.cloud/workflow/sP1xm3DYdbF4yI73)
- **Webhook Endpoint:** `https://vinit123.app.n8n.cloud/webhook/3817e448-1501-43b2-a880-f4eb0848e404`
- **Used for:** Orchestrating AI outbound calls — receives the trigger from the VoiceQual dashboard, calls ElevenLabs to initiate the conversation, and writes the result back to Supabase
- **Params:** `?phone=+91XXXXXXXXXX&name=LeadName`

```ts
// Trigger a call
GET /webhook/3817e448-1501-43b2-a880-f4eb0848e404?phone={phone}&name={name}
```

**Workflow steps (n8n):**
1. **Webhook Trigger** — receives `phone` and `name` query params from VoiceQual
2. **ElevenLabs Node** — initiates a Conversational AI call to the lead's phone number
3. **Wait / Poll** — waits for the call to complete
4. **Supabase Node** — writes call result (status, transcript, score, outcome) to `call_results` table
5. **Telegram Node** — sends HOT lead alert to the sales rep's Telegram chat

### Telegram Bot API
- **Used for:** Sending HOT/WARM lead alerts to sales reps
- **Trigger:** Manual "Send Call Summary" button in expanded call panel
- **Payload:** Call ID, lead name, BANT score, label, summary

---

## Project Structure

```
hackx/
└── voicequal-app/
    ├── src/
    │   ├── api/
    │   │   └── triggerCall.ts
    │   ├── components/
    │   │   └── DashboardLayout.tsx
    │   ├── lib/
    │   │   ├── mockCalls.ts
    │   │   └── supabase.ts
    │   ├── pages/
    │   │   ├── Analytics.tsx
    │   │   ├── Calls.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── HelpDocs.tsx
    │   │   ├── LandingPage.tsx
    │   │   ├── LeadDetail.tsx
    │   │   ├── Leads.tsx
    │   │   ├── Pipeline.tsx
    │   │   └── SettingsPage.tsx
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    ├── public/
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/vinitgirdhar/hackx.git
cd hackx/voicequal-app

# Install dependencies
npm install

# Start development server
npm run dev
```

App runs at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## Environment & Configuration

All API keys are currently hardcoded in source files for demo purposes. For production, move them to environment variables:

```env
# .env
VITE_ELEVENLABS_API_KEY=sk_...
VITE_GROQ_API_KEY=gsk_...
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_N8N_WEBHOOK_URL=https://...n8n.cloud/webhook/...
VITE_TELEGRAM_BOT_TOKEN=...
VITE_TELEGRAM_CHAT_ID=...
```

Then reference in code as `import.meta.env.VITE_ELEVENLABS_API_KEY`.

---

## Key Workflows

### Workflow 1 — Import & Call

```
1. Go to Leads page
2. Click "Import CSV" → upload CSV with name, phone, company columns
3. Preview detected leads → click "Import X Leads"
4. Go to Dashboard → click "Start Campaign"
5. n8n webhook fires → ElevenLabs AI calls each lead
```

### Workflow 2 — Monitor Live Calls

```
1. Go to Calls page
2. Live banner appears automatically when a call is in progress (polls every 8s)
3. Call row shows animated wave + CALLING status
4. On completion: status auto-updates → Groq scores transcript → BANT displayed
```

### Workflow 3 — Qualify & Route

```
1. Go to Pipeline page
2. Leads auto-sorted by AI score within each column
3. Click → on a card to promote a lead to the next stage
4. HOT column shows "Human Follow-Up Needed" alert
5. Go to Calls → expand the call → click "Send Call Summary" → Telegram alert sent
```

### Workflow 4 — Analyse Performance

```
1. Go to Analytics page
2. View conversion funnel, BANT distribution, outcome trends
3. Identify which stages have the highest drop-off
4. Adjust AI agent prompts in Settings accordingly
```

---

## Design System

VoiceQual uses a custom premium design language:

| Token | Value | Usage |
|-------|-------|-------|
| Primary Green | `#1F8A70` | CTA buttons, active states, HOT badge |
| Deep Forest | `#0F3D3E` | Sidebar background, dark gradients |
| Gold | `#D4AF37` | Accent elements, WARM badge, highlights |
| Muted Gold | `#A67C2E` | Secondary gold text |
| Slate | `#94A3B8` | Disabled, COLD badge, placeholder text |
| Background | `#F6FAF9` | Page background |

**Typography:** Outfit (headings) + system sans-serif (body)

**Animation:** Framer Motion with `[0.16, 1, 0.3, 1]` ease curve (spring-like feel without spring jitter). Page transitions use a subtle `x: 10 → 0` slide-in with `mode="sync"` for zero blank-screen delay between routes.

**Component classes:**
- `.premium-card` — white card with gold border shimmer on hover
- `.crown-badge` — small green pill badge for section labels
- `.gold-border` — gold gradient border for avatar elements
- `.gold-shimmer` — animated shimmer line used under topbar

---

## Hackathon Context

Built for **HackX** — a 24-hour hackathon focused on AI-powered sales automation.

**Problem Statement:** Insurance and B2B sales teams waste 60–70% of calling time on unqualified leads.

**Solution:** End-to-end AI pipeline that calls, qualifies, scores, and routes leads — reducing human effort to only the final close.

**Impact Metrics (demo data):**
- 990 calls triggered per day
- 8.5+ average BANT score on HOT leads
- 6.3% conversion rate (vs. 1–2% industry average for cold calling)
- < 30 seconds from call end to BANT score via Groq
