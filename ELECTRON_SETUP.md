# How to Run AutoSort App in Electron

## Prerequisites
- Node.js (v16+) installed
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies
```bash
cd e:\VS SORT\autosort-app
npm install
```

### 2. Development Mode (Recommended for Development)

**Option A: Run with Full Dev Server + Electron**
```bash
npm run dev
```

This command:
- Starts the Vite dev server on `http://localhost:3000`
- Waits for the dev server to be ready
- Launches Electron with hot-reload capabilities
- Allows live editing of both renderer and main process code

**How it works:**
- The `dev:renderer` script starts Vite in watch mode
- The `dev:electron` script launches Electron once the dev server is ready
- Changes to React code hot-reload in the Electron window
- Changes to Electron main process require manual restart

**Option B: Build First, Then Run**
```bash
npm run build
npm run dev:electron
```

This will:
- Build both renderer (React) and Electron main process
- Launch Electron with the built files

---

## Building for Production

### 3. Create Distributable Builds

**For Windows Only:**
```bash
npm run dist
```

**For All Platforms (Mac, Windows, Linux):**
```bash
npm run dist:all
```

This creates:
- `dist/autosort-app-1.0.0.exe` (Windows installer)
- DMG for macOS
- AppImage for Linux

---

## Project Structure

```
autosort-app/
├── electron-main/           # Electron main process
│   ├── main.ts             # Entry point
│   ├── preload.ts          # IPC bridge
│   ├── filesystem.ts       # File operations
│   ├── autosort-core.ts    # Core logic
│   └── ml-classifier.ts    # ML features
├── renderer/               # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── main.tsx       # React entry
│   ├── vite.config.ts
│   └── package.json
├── shared/                # Shared types
│   └── types.ts
├── dist/                  # Build output
├── package.json
└── tsconfig.electron.json
```

---

## Common Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev mode with hot reload |
| `npm run dev:renderer` | Start only Vite dev server |
| `npm run dev:electron` | Start only Electron (requires built files) |
| `npm run build` | Build both renderer and Electron |
| `npm run build:renderer` | Build only React app |
| `npm run build:electron` | Compile TypeScript main process |
| `npm run dist` | Create Windows installer |
| `npm run dist:all` | Create installers for all platforms |

---

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution:** Rebuild the project
```bash
npm run build
```

### Issue: Electron window won't open
**Solution:** 
1. Make sure dev server is running on port 3000
2. Check that the main process compiled successfully
3. Try running: `npm run build && npm run dev:electron`

### Issue: Changes not reflecting
**Solution:** In dev mode, only React code hot-reloads. For Electron main process changes:
1. Stop the dev server (Ctrl+C)
2. Run `npm run build`
3. Restart with `npm run dev`

### Issue: Port 3000 already in use
**Solution:**
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port in vite.config.ts
```

---

## Development Workflow

1. **Start development:**
   ```bash
   npm run dev
   ```

2. **Edit React components** in `renderer/src/` → Auto hot-reloads

3. **Edit Electron main code** in `electron-main/` → Requires restart

4. **Build for distribution:**
   ```bash
   npm run dist
   ```

---

## Environment Variables

Create `.env` file in root directory:
```
VITE_API_URL=http://localhost:3000
NODE_ENV=development
```

---

## Additional Resources

- **Electron Docs:** https://www.electronjs.org/docs
- **Vite Docs:** https://vitejs.dev/
- **React Docs:** https://react.dev/

---

**Ready to go!** 🚀 Run `npm run dev` in your terminal and the app will launch in an Electron window.
