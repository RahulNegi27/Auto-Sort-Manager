# 🚀 Quick Start: Running AutoSort in Electron

## Simplest Way to Run (One Command)

```bash
cd e:\VS SORT\autosort-app
npm run dev
```

This **ONE command** will:
1. ✅ Start the Vite dev server (React hot reload)
2. ✅ Wait for the server to be ready
3. ✅ Launch Electron automatically
4. ✅ Open the AutoSort app in an Electron window

---

## What You'll See

When the app launches, you should see:

```
✨ VITE ready in XXX ms
➜ Local: http://127.0.0.1:3000/

AutoSort app loaded
```

**Then:** An Electron window opens with the AutoSort Dashboard! 🎉

---

## Running in Separate Terminals (Advanced)

If `npm run dev` doesn't work, try this two-step approach:

**Terminal 1: Start the dev server**
```bash
cd e:\VS SORT\autosort-app
npm run dev:renderer
```

**Terminal 2: Start Electron (in a new terminal)**
```bash
cd e:\VS SORT\autosort-app
npm run dev:electron
```

---

## Common Issues & Fixes

### ❌ "Cannot find module electron"
**Fix:** Install dependencies first
```bash
npm install
```

### ❌ Electron window won't open
**Fix:** Make sure the dev server is running
```bash
# Check if port 3000 is accessible
curl http://localhost:3000
```

### ❌ "Port 3000 already in use"
**Fix:** Kill the existing process
```bash
Get-Process node | Stop-Process -Force
```

### ❌ White/blank screen in Electron
**Fix:** The dev server might not be fully loaded. Wait 5-10 seconds and refresh (Ctrl+R)

---

## Development Workflow

**While the app is running:**

1. **Edit React code** (in `renderer/src/`) → **Auto hot-reloads** ✨
2. **Edit Electron main code** (in `electron-main/`) → Requires manual restart
3. **Edit styles** → **Auto hot-reloads** instantly ✨
4. Open DevTools with **F12** or **Ctrl+Shift+I**

---

## Stopping the App

Press **Ctrl+C** in the terminal to stop the dev servers.

---

## Building for Production

When you're ready to distribute:

```bash
# Build everything
npm run build

# Create Windows installer
npm run dist

# Create installers for all platforms
npm run dist:all
```

---

## Project Files Location

```
e:\VS SORT\autosort-app\
├── dist/electron-main/main.js       ← Electron main process (compiled)
├── renderer/dist/                   ← Built React app
├── electron-main/                   ← Source files
│   ├── main.ts                      ← Electron entry point
│   ├── preload.ts                   ← IPC bridge
│   ├── filesystem.ts                ← File operations
│   └── autosort-core.ts             ← Core logic
└── renderer/src/                    ← React source
    ├── pages/                       ← Page components
    ├── components/                  ← Reusable UI components
    └── main.tsx                     ← React entry point
```

---

## Useful Keyboard Shortcuts in Electron

| Shortcut | Action |
|----------|--------|
| **F12** | Open Developer Tools |
| **Ctrl+R** | Reload the app |
| **Ctrl+Shift+R** | Hard refresh (clear cache) |
| **Ctrl+Q** | Quit the app |

---

## Testing Different Pages

Once the app is open:
- 📂 **File Manager**: Browse and manage files (CRUD operations)
- ⚡ **AutoSort**: Auto-organize files by category
- 👥 **Duplicates**: Find and remove duplicate files
- 📦 **Compression**: Compress files to save space
- 🔍 **Smart Search**: Search files with AI
- 📊 **Analytics**: View file statistics
- 🎮 **OS Visualizers**: Interactive system simulations

---

## Need Help?

Check these files for more info:
- `ELECTRON_SETUP.md` - Detailed setup guide
- `README.md` - Project overview
- `QUICKSTART.md` - Getting started guide

---

**That's it! You're ready to develop and use AutoSort!** 🎉

