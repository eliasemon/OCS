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

## 🔍 How the "One Command" Works (Complete Transparency)

We believe in complete transparency. OCS does not use proprietary installers, hidden binaries, or intermediate servers to install your software. Everything happens entirely on your local machine using native OS package managers. 

When you click "Generate Command", OCS dynamically builds a raw, readable shell script containing your selected packages. Here is exactly what happens under the hood:

### 🪟 Windows (Winget)
- **Technology**: PowerShell & [Windows Package Manager (Winget)](https://learn.microsoft.com/en-us/windows/package-manager/winget/).
- **Execution**: The generated command uses standard PowerShell syntax. It loops through your selected package IDs (e.g., `Microsoft.VisualStudioCode`) and constructs a bulk `winget install --id <PackageID> -e --accept-package-agreements --accept-source-agreements` command.
- **Why it's safe**: Winget is built directly into modern Windows by Microsoft. All packages are verified and pulled directly from official publisher sources.

### 🍏 macOS (Homebrew)
- **Technology**: Bash & [Homebrew](https://brew.sh/).
- **Execution**: The generated Bash script formats your selections into clean `brew install` or `brew install --cask` commands depending on whether the app is a CLI utility or a GUI application.
- **Why it's safe**: Homebrew is the open-source standard for macOS package management. The script even automatically installs Homebrew for you if it detects it is missing.

### 🐧 Linux (APT)
- **Technology**: Bash & APT (Advanced Package Tool).
- **Execution**: The generated script first updates your local package cache (`sudo apt-get update`) and then uses `sudo apt-get install -y <packages>` to install your selections in bulk.
- **Why it's safe**: Everything is downloaded directly from your Linux distribution's official, cryptographically signed repositories.

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
