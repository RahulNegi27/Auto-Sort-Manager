# AutoSort - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Install Dependencies

```bash
# Install all dependencies
npm install

# Install renderer dependencies
cd renderer && npm install && cd ..
```

### 2. Start Development Server

```bash
# This starts both Vite dev server and Electron app
npm run dev
```

The app will launch at `http://localhost:3000` with hot reload enabled.

### 3. Build for Production

```bash
# Build for your current platform
npm run dist

# Output: dist/AutoSort-1.0.0.*
```

## 📁 File Structure Overview

- `electron-main/` - Backend (Node.js + Electron)
- `renderer/` - Frontend (React + TypeScript)
- `shared/` - Shared types & interfaces
- `db/` - Database management
- `tests/` - Test suites

## 🎯 Development Workflow

1. **Edit React Components** → Hot reload automatically
2. **Edit Electron Files** → Restart app (Ctrl+R)
3. **Add New Route** → Update `App.tsx`
4. **Add New IPC Handler** → Update `main.ts` and `preload.ts`

## 🔥 Common Commands

```bash
npm run dev              # Start dev mode
npm run build            # Build for production
npm run dist             # Create installer
npm run test             # Run tests
npm run test:watch       # Watch tests
npm run test:coverage    # Coverage report
```

## 🐛 Debug Mode

Open DevTools:
- Press `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (macOS)

## 📚 Learn More

- [Electron Docs](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Change port in `renderer/vite.config.ts` |
| Electron won't start | Run `npm install` again |
| No hot reload | Check that both terminals are running |
| Database errors | Delete `autosort.db` and restart |

## 📦 Next Steps

1. ✅ Explore the dashboard
2. ✅ Test file explorer (select a folder)
3. ✅ Check system monitoring
4. ✅ Try compression tool
5. ✅ Review code structure

Happy coding! 🚀
