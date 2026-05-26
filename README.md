# oneCommandSetup (OCS)

> The fastest way to set up your Windows, macOS, or Linux development environment with a single command.

## Overview
**oneCommandSetup** (formerly WinSetup) is an open-source web application that allows developers and power users to select their favorite applications and generate a single installation script. Skip the installer clicking and let the package managers do the heavy lifting.

## Supported Platforms
- **Windows**: Uses `winget` (Windows Package Manager)
- **macOS**: Uses `brew` (Homebrew)
- **Linux**: Uses `apt` (Advanced Package Tool)

## 🚀 Quick Start (Development)

Clone the repository and install dependencies:

```bash
git clone https://github.com/eliasemon/OCS.git
cd OCS
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠 Tech Stack & Architecture

### Core Technologies
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand v5
- **Icons**: Lucide React

### Architecture
The application is built on a reactive, client-first architecture:
1. **Data Layer**: Application packages are maintained in static JSON files (`data/packages.json`, `data/mac-packages.json`, `data/linux-packages.json`). This ensures the app is blazing fast and easily extensible.
2. **State Management**: A centralized Zustand store (`store/os.ts`, `store/selection.ts`) tracks the currently selected Operating System and the user's selected packages.
3. **Command Generation**: When a user selects their apps and hits generate, the `CommandModal` dynamically builds a shell script (`PowerShell` for Windows, `Bash` for macOS/Linux) using utility functions (`lib/utils.ts`) that format the package IDs for the respective native package manager.
4. **Sharable Presets**: Selections are encoded into URL parameters (`hooks/usePresetFromUrl.ts`), allowing users to share their perfect setup via a simple link.

## 📂 Project Structure

- `/app`: Next.js App Router pages (Landing page, App interface).
- `/components`: Reusable React components (UI elements, Layouts, Command Modals).
- `/data`: JSON catalogs of available packages mapped to their native package manager IDs.
- `/hooks`: Custom React hooks for URL state synchronization.
- `/lib`: Utility functions for script generation, formatting, and constants.
- `/public`: Static assets including SVGs and application logos.
- `/store`: Zustand state slices.

## 🌐 Deployment
This project is optimized for deployment on Vercel.

```bash
npx vercel --prod
```

## 📝 License
MIT License.
