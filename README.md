# LucidRank

> **Work in progress.** This repository is an unfinished concept site. It is not a finished product. Copy, demos, and links can change.

LucidRank is a privacy-first daily habit and check-in helper for VALORANT and CS2 players. Before you queue, you tap sleep, how alert you feel, and whether anything feels off. After a match you log the result in about 30 seconds. A few weeks of that is meant to show which days you play better.

This repo is the web concept site. The desktop app is a separate project: <https://github.com/EthanLai-9du/lucidrank-app>. The public site is <https://lucidrank.pages.dev>.

## What this repo is

- `index.html` — the landing page (Simplified Chinese, Traditional Chinese, English).
- `app/` — a browser journal: check-in, match log, insights, a weekly goal, lineups, a personal library, and training notes.
- Guest records stay in the browser (IndexedDB, with a localStorage fallback). You can export or delete them.
- `download/` and `releases/windows.json` — Windows installer files and the version the site advertises (v0.1.7).

## Already up

- The landing page at [lucidrank.pages.dev](https://lucidrank.pages.dev).
- The browser journal at [/app/](https://lucidrank.pages.dev/app/). Without an account, data stays on that device.
- A Windows download link (v0.1.7). There is no Mac or Linux build in this repo.

## Still missing, or only a demo

- Charts, the weekly-plan cards, the lineup window, and the academy list on the landing page use **sample data**. The page says so. They are not your stats, and the lessons are not a real course.
- The landing-page check-in does not save. It sends you to the journal if you want to keep a record.
- The waitlist form does not send or store the email.
- Sign-in, cloud sync, password reset, and the developer studio call `/api/…`. That API is not in this repo. On the live site those paths currently return the HTML page, so treat accounts and sync as **WIP**.
- The web build does not detect whether VALORANT or CS2 is running. A separate lineup window is a desktop-app idea.

LucidRank is an independent project. It is not made by, or endorsed by, Riot Games or Valve.

## Desktop app

<https://github.com/EthanLai-9du/lucidrank-app>
