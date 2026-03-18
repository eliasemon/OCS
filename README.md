# WinSetup

> Install all your Windows apps with one PowerShell command.

## Quick Start
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Master Install Command
```powershell
powershell -c "irm https://winsetup.app/api/cli.ps1 | iex"
```

## Tech Stack
- Next.js 15, React 19, TypeScript 5
- Tailwind CSS v4, shadcn/ui
- Zustand v5

## Deploy to Vercel
```bash
npx vercel --prod
```
