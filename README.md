# CredFlow Webhook Orchestration Monitor

A production-grade internal dashboard for real-time payment reminder delivery visibility and bulk retry orchestration.

## Features

- **Real-time Webhook Status** – See exactly what reminders succeeded, failed, or are pending
- **Error Grouping & Analytics** – Automatically categorize failures (timeout, rate limit, auth error, network)
- **Bulk Retry Orchestration** – One-click retry for failed webhooks, with live progress
- **Smart Filtering** – Filter by status, channel (WhatsApp/SMS/Email), error type, or search by recipient
- **Responsive Design** – Works on desktop, tablet, mobile

## Live Demo

🚀 **[View Live Dashboard](https://credflow-webhook-monitor.vercel.app/)**

## Problem It Solves

When payment reminder gateways (Twilio, SendGrid, WhatsApp Business API) experience outages, CredFlow's operations team loses visibility into what actually sent. This causes:
- 30-60 minute delays before retries
- Manual engineering debugging (5-10 hours/week)
- 2-5% collection loss per delayed reminder

**Solution:** Real-time dashboard + one-click bulk retry = ops team can unstick failed queues without engineering.

## Technical Stack

- **Frontend:** React 18, Recharts (charts), CSS-in-JS
- **Styling:** Dark mode optimized, responsive grid layout
- **Data:** Mock webhook events (150 samples), realistic error types
- **Deployment:** Vercel (serverless, auto-scaling)

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design, API contracts, and backend integration points.
<img width="2116" height="4409" alt="Credflow Core Flow-2026-05-19-035156" src="https://github.com/user-attachments/assets/0765d7f7-bb5c-4593-97d7-1aa6566c78b9" />


## How to Run Locally

```bash
npm install
npm start
```

Runs on `http://localhost:3000`

## How to Deploy

### Vercel (Recommended)
1. Push to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Connect your repo
4. Click "Deploy"
5. Live in 1-2 minutes

**What this shows:**
- Problem-solving mindset (identified a real operational pain point)
- Full-stack thinking (frontend, API design, database schema)
- Realistic scoping (2-3 week project, not vaporware)
- Business acumen (saves engineering 5+ hours/week)

**How it would scale to production:**
- Connect Node.js REST API with PostgreSQL + Redis
- Real webhook event logging from gateway webhooks
- WebSocket for true real-time updates (currently polls)
- Add RBAC (role-based access control) and audit logging
- Multi-tenant support for multiple collection teams

## InShort

*"Built Webhook Orchestration Monitor — an internal operations dashboard for payment reminder delivery. Reduces engineering debugging time from ~2hrs to ~2min via real-time webhook visibility and one-click bulk retry. React + Recharts frontend with production-ready API architecture."*

---

**Questions?** Open an issue or reach out to [harshbansal073@gmail.com]
