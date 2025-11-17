# 📂 AutoSort Complete File Structure

```
autosort-app/
│
├── 📄 package.json                    # Root dependencies & scripts
├── 📄 tsconfig.electron.json          # TypeScript config for Electron main
├── 📄 .gitignore                      # Git ignore patterns
├── 📄 .env.example                    # Environment variables template
├── 📄 README.md                       # Full documentation
├── 📄 QUICKSTART.md                   # Quick setup guide
│
├── 📁 electron-main/                  # Electron Main Process
│   ├── main.ts                        # App entry point & window setup
│   ├── preload.ts                     # IPC preload bridge (safe API)
│   ├── filesystem.ts                  # File system operations manager
│   ├── ml-bridge.ts                   # ML service integration
│   └── dist/                          # Compiled output (auto-generated)
│
├── 📁 renderer/                       # React Frontend Application
│   ├── 📄 package.json                # React dependencies
│   ├── 📄 tsconfig.json               # React TypeScript config
│   ├── 📄 vite.config.ts              # Vite bundler config
│   ├── 📄 tailwind.config.js          # Tailwind CSS theme
│   ├── 📄 postcss.config.js           # PostCSS config
│   ├── 📄 index.html                  # HTML entry point
│   ├── 📄 dist/                       # Build output (auto-generated)
│   │
│   └── 📁 src/
│       ├── main.tsx                   # React entry point
│       ├── App.tsx                    # Root component & routing
│       ├── index.css                  # Global styles
│       │
│       ├── 📁 components/
│       │   ├── 📁 layout/
│       │   │   ├── Sidebar.tsx        # Navigation sidebar
│       │   │   ├── Header.tsx         # Top header bar
│       │   │   └── Footer.tsx         # Footer component
│       │   │
│       │   ├── 📁 dashboard/
│       │   │   ├── Dashboard.tsx      # Dashboard main page
│       │   │   ├── StatsGrid.tsx      # Statistics cards
│       │   │   └── Charts.tsx         # Chart components
│       │   │
│       │   ├── 📁 files/
│       │   │   ├── FileExplorer.tsx   # File browser
│       │   │   ├── FileGrid.tsx       # Grid view
│       │   │   ├── FileList.tsx       # List view
│       │   │   └── FilePreview.tsx    # File preview modal
│       │   │
│       │   ├── 📁 compression/
│       │   │   └── CompressionTool.tsx # Compression UI
│       │   │
│       │   ├── 📁 duplicates/
│       │   │   └── DuplicateFinder.tsx # Duplicate detection UI
│       │   │
│       │   ├── 📁 analytics/
│       │   │   └── Analytics.tsx      # Analytics dashboard
│       │   │
│       │   ├── 📁 search/
│       │   │   └── SmartSearch.tsx    # AI search UI
│       │   │
│       │   ├── 📁 settings/
│       │   │   └── Settings.tsx       # Settings page
│       │   │
│       │   └── 📁 os-visualizers/
│       │       ├── OSVisualizers.tsx  # Visualizer tabs
│       │       ├── ProcessManager.tsx # Process scheduling
│       │       ├── DeadlockVisualizer.tsx
│       │       ├── DiskScheduler.tsx
│       │       ├── CPUScheduler.tsx
│       │       └── MemoryAllocator.tsx
│       │
│       ├── 📁 pages/
│       │   ├── Dashboard.tsx          # Dashboard page
│       │   ├── FileExplorer.tsx       # Files page
│       │   ├── CompressionTool.tsx    # Compression page
│       │   ├── DuplicateFinder.tsx    # Duplicates page
│       │   ├── SmartSearch.tsx        # Search page
│       │   ├── Analytics.tsx          # Analytics page
│       │   ├── OSVisualizers.tsx      # Visualizers page
│       │   └── Settings.tsx           # Settings page
│       │
│       ├── 📁 hooks/
│       │   ├── useFileSystem.ts       # File operations hook
│       │   ├── useDebounce.ts         # Debounce utility
│       │   ├── useDashboard.ts        # Dashboard data hook
│       │   ├── useLocalStorage.ts     # Local storage hook
│       │   └── useAsync.ts            # Async operations hook
│       │
│       ├── 📁 context/
│       │   ├── AppContext.tsx         # App state context
│       │   ├── FileContext.tsx        # File operations context
│       │   └── SettingsContext.tsx    # Settings context
│       │
│       ├── 📁 utils/
│       │   ├── formatters.ts          # Format utilities
│       │   ├── validators.ts          # Validation functions
│       │   ├── logger.ts              # Logging utility
│       │   └── constants.ts           # App constants
│       │
│       └── 📁 ml-engine/
│           └── MLClassifier.ts        # ML classification logic
│
├── 📁 shared/                         # Shared Code
│   └── types.ts                       # TypeScript interfaces
│       ├── FileItem interface
│       ├── ClassificationResult
│       ├── SystemUsage
│       ├── CompressionJob
│       ├── DuplicateGroup
│       └── ElectronAPI
│
├── 📁 db/                             # Database Layer
│   └── database.ts                    # SQLite manager
│       ├── initTables()
│       ├── logJob()
│       ├── getJobHistory()
│       ├── saveSetting()
│       └── logAnalyticsEvent()
│
├── 📁 local-agent/                    # Python ML Backend (Optional)
│   ├── ml_service.py                  # Flask ML server
│   ├── requirements.txt               # Python dependencies
│   │   - Flask
│   │   - scikit-learn
│   │   - pandas
│   │   - numpy
│   │   - joblib
│   └── ml_models/                     # Trained models directory
│
├── 📁 scripts/                        # Build & Deployment Scripts
│   ├── build.js                       # Build script
│   ├── dev.js                         # Development launcher
│   ├── dist.js                        # Distribution builder
│   └── clean.js                       # Cleanup script
│
├── 📁 tests/                          # Test Suites
│   ├── 📁 electron-main/
│   │   └── filesystem.test.ts         # Filesystem tests
│   ├── 📁 renderer/
│   │   └── components.test.tsx        # Component tests
│   └── jest.config.js                 # Jest configuration
│
├── 📁 assets/                         # Application Assets
│   ├── icon.png                       # App icon
│   ├── icon.ico                       # Windows icon
│   ├── icon.icns                      # macOS icon
│   └── screenshots/                   # Documentation screenshots
│
└── 📁 dist/                           # Distribution Output (auto-generated)
    ├── AutoSort-1.0.0.exe             # Windows installer
    ├── AutoSort-1.0.0.dmg             # macOS installer
    └── AutoSort-1.0.0.AppImage        # Linux AppImage
```

## 📊 Component Dependency Tree

```
App (Root)
├── Sidebar (Navigation)
├── Header (Top bar)
└── Routes
    ├── Dashboard
    │   ├── StatsGrid
    │   └── Charts
    ├── FileExplorer
    │   ├── FileGrid
    │   └── FileList
    ├── CompressionTool
    ├── DuplicateFinder
    ├── SmartSearch
    ├── Analytics
    │   └── Recharts components
    ├── OSVisualizers
    │   ├── ProcessManager
    │   ├── DeadlockVisualizer
    │   ├── DiskScheduler
    │   ├── CPUScheduler
    │   └── MemoryAllocator
    └── Settings
```

## 🔌 IPC Channel Structure

```
Main Process (Electron)
    ↓
IPC Handler (ipcMain)
    ↓
┌─────────────────────────────────────┐
│  File System Operations             │
├─────────────────────────────────────┤
│  fs:select-folder                   │
│  fs:scan-directory                  │
│  fs:get-stats                       │
│  fs:move-file                       │
│  fs:delete-file                     │
│  fs:compress-files                  │
├─────────────────────────────────────┤
│  ML Operations                      │
├─────────────────────────────────────┤
│  ml:classify-file                   │
│  ml:batch-classify                  │
│  ml:train-models                    │
├─────────────────────────────────────┤
│  System Operations                  │
├─────────────────────────────────────┤
│  system:get-usage                   │
│  system:get-resources               │
├─────────────────────────────────────┤
│  Database Operations                │
├─────────────────────────────────────┤
│  db:get-job-history                 │
│  db:save-settings                   │
│  db:get-settings                    │
│  db:log-event                       │
└─────────────────────────────────────┘
    ↓
Preload Bridge (contextBridge)
    ↓
React Components
(via window.electronAPI)
```

## 📦 Build Artifacts

After running `npm run dist`:

```
dist/
├── AutoSort-1.0.0-win.exe            # Windows installer
├── AutoSort-1.0.0-mac.dmg            # macOS disk image
├── AutoSort-1.0.0.AppImage           # Linux AppImage
├── AutoSort-Setup-1.0.0.exe           # NSIS installer
└── AutoSort-1.0.0.tar.gz              # Source archive
```

## 📝 File Size Reference

- Total uncompressed: ~350 MB
- Electron + Node: ~200 MB
- React + deps: ~80 MB
- Source code: ~5 MB
- Installer size: ~100-150 MB per platform

## 🔒 Protected Directories

```
.gitignore protects:
├── node_modules/
├── dist/
├── build/
├── *.log
├── *.db
├── .env (sensitive)
└── OS cache files
```

---

**Last Updated**: 2024
**AutoSort Version**: 1.0.0
