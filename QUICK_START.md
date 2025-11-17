# 🚀 AutoSort - Quick Start Guide

## ✅ Application Status: RUNNING ✅

Your AutoSort application is **fully functional and ready to use**!

---

## 🎯 How to Run the Application

### Method 1: Direct Start (Recommended)
```powershell
cd 'e:\VS SORT\autosort-app'
$env:NODE_ENV='development'
./node_modules/.bin/electron.cmd dist/electron-main/main.js
```

### Method 2: With Auto-Build
```powershell
cd 'e:\VS SORT\autosort-app'

# Terminal 1: Build when files change
npx tsc --project tsconfig.electron.json --watch

# Terminal 2: Run Electron
$env:NODE_ENV='development'
./node_modules/.bin/electron.cmd dist/electron-main/main.js
```

### Method 3: Full Development Mode
```powershell
# Terminal 1: Start Vite dev server (optional, for hot reload)
cd 'e:\VS SORT\autosort-app\renderer'
npm run dev

# Terminal 2: Start Electron
cd 'e:\VS SORT\autosort-app'
$env:NODE_ENV='development'
./node_modules/.bin/electron.cmd dist/electron-main/main.js
```

---

## 📊 Features Overview

The application includes these main features:

### 1. **Dashboard** (Home Page)
- System statistics (Total files, Organized files, Duplicates found)
- Real-time system usage (CPU, Memory, Disk)
- File organization metrics
- Quick access to recent activities

### 2. **File Explorer**
- Browse your file system
- View file details
- Organize files by category
- Search and filter capabilities

### 3. **Compression Tool**
- Compress files to ZIP, TAR, or GZIP
- Batch compression support
- Progress tracking
- View compression results

### 4. **Duplicate Finder**
- Scan for duplicate files
- Compare file hashes
- Preview duplicates side-by-side
- Safe deletion with confirmation

### 5. **Smart Search**
- Advanced file search with filters
- Search by name, size, type, date
- Save search queries
- Export search results

### 6. **Analytics Dashboard**
- File organization statistics
- Usage patterns and trends
- Storage breakdown by file type
- Export reports

### 7. **OS Visualizers**
- CPU scheduling simulation
- Memory allocation visualization
- Disk scheduling demo
- Process management simulator

### 8. **Settings**
- Application preferences
- Theme selection
- Storage location configuration
- Backup settings

---

## 🔧 Navigation

### Left Sidebar
- Click any menu item to navigate to that feature
- Icons indicate current page
- "Pro Tip" section at bottom with helpful hints

### Top Header
- Search bar for quick access
- System stats (CPU, Memory, Disk usage)
- Notification bell
- User profile menu

---

## 💡 Working with Features

### Using the Dashboard
1. **View Statistics**: Main dashboard shows key metrics
2. **Monitor System**: Watch real-time CPU, Memory, Disk usage
3. **Access Tools**: Click sidebar items to use specific features

### Finding & Organizing Files
1. Navigate to **File Explorer**
2. Browse directories or use search
3. Select files and choose action
4. Use bulk operations for multiple files

### Compressing Files
1. Go to **Compression Tool**
2. Select files to compress
3. Choose compression format
4. Set output location
5. Click "Compress" to start

### Finding Duplicates
1. Open **Duplicate Finder**
2. Select folder to scan
3. Wait for scan to complete
4. Review found duplicates
5. Mark for deletion (with confirmation)

### Analyzing Storage
1. Check **Analytics** page
2. View storage breakdown
3. See file type distribution
4. Export reports

---

## 🎨 UI Features

### Responsive Design
- Works on different window sizes
- Sidebar collapses on small screens
- Touch-friendly buttons

### Real-Time Updates
- System stats refresh every 5 seconds
- Live progress indicators
- Instant feedback on actions

### Keyboard Shortcuts
- `Ctrl+Q` or `Cmd+Q`: Quit application
- `Ctrl+Shift+I`: Open DevTools (for debugging)
- `F5`: Refresh page

---

## 🛠️ Troubleshooting

### App Won't Start
```powershell
# Clean rebuild
cd 'e:\VS SORT\autosort-app'
Remove-Item -Recurse -Force dist, renderer/dist -ErrorAction SilentlyContinue
npm run build:renderer
npx tsc --project tsconfig.electron.json
$env:NODE_ENV='development'
./node_modules/.bin/electron.cmd dist/electron-main/main.js
```

### App Crashes
- Check DevTools console (Ctrl+Shift+I)
- Look for red error messages
- Restart the application
- Rebuild if needed

### Features Not Working
- Ensure all dependencies installed: `npm install`
- Check renderer build: `npm run build:renderer`
- Verify Electron compiled: `npx tsc --project tsconfig.electron.json`

---

## 📁 Project Structure

```
autosort-app/
├── electron-main/          # Electron backend
│   ├── main.ts            # App entry point
│   ├── filesystem.ts      # File operations
│   └── preload.ts         # IPC bridge
├── renderer/              # React frontend
│   ├── src/
│   │   ├── pages/        # Feature pages
│   │   ├── components/   # UI components
│   │   ├── hooks/        # React hooks
│   │   └── index.css     # Styles
│   └── dist/             # Built files
├── shared/               # Shared types
├── db/                   # Database
└── dist/                 # Compiled output
```

---

## 🚀 Next Steps

### To Customize the App:

1. **Modify Dashboard**
   - Edit: `renderer/src/pages/Dashboard.tsx`
   - Rebuild: `npx tsc --project tsconfig.electron.json`
   - Restart: `./node_modules/.bin/electron.cmd dist/electron-main/main.js`

2. **Add New Feature**
   - Create page in `renderer/src/pages/`
   - Add route in `renderer/src/App.tsx`
   - Add navigation item in `renderer/src/components/layout/Sidebar.tsx`

3. **Modify Backend**
   - Edit TypeScript in `electron-main/`
   - Recompile: `npx tsc --project tsconfig.electron.json`
   - Restart app

4. **Change Styling**
   - Edit `renderer/src/index.css` (vanilla CSS)
   - Changes visible after app restart

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `electron-main/main.ts` | App lifecycle, window creation |
| `electron-main/preload.ts` | IPC bridge to renderer |
| `renderer/src/App.tsx` | React root, routing |
| `renderer/src/pages/Dashboard.tsx` | Dashboard feature |
| `shared/types.ts` | TypeScript interfaces |
| `db/database.ts` | SQLite database |

---

## ✨ Tips & Tricks

- **DevTools**: Press `Ctrl+Shift+I` to debug
- **Reload**: Press `F5` to reload page
- **Quit**: Press `Alt+F4` or use File menu
- **Check Logs**: Open DevTools Console tab
- **Performance**: Check Console for warnings

---

## 🎓 Learning Resources

- **Electron Docs**: https://www.electronjs.org/docs
- **React Docs**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs

---

## 🎉 Congratulations!

Your AutoSort application is **fully set up and running**. Start exploring features and enjoy the powerful file management capabilities!

**Questions?** Check the detailed documentation in `README.md` or `IMPLEMENTATION_GUIDE.md`.

---

**AutoSort v1.0.0** | *Professional Desktop Application*  
Last Updated: November 16, 2025
