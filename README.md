# 🚀 AutoSort - ML Powered File Manager

> Intelligent file organization with machine learning, OS visualizers, and advanced analytics.        

## 📋 Features

✨ **ML-Powered Intelligence**
- Multi-model ensemble classification (Decision Tree,  Random Forest, KNN, Naive Bayes)
- Automatic file categorization and organization
- Perceptual hashing for duplicate detection

📁 **File Management**
- Intelligent file explorer with grid/list views
- Smart search with natural language processing
- Batch operations (compress, move, delete)
- Real-time file scanning and indexing

🗜️ **Compression & Duplicates**
- Multi-format compression (ZIP, TAR, GZIP, 7Z)
- MD5/SHA256 hash-based duplicate detection
- Perceptual image hashing
- Space savings calculation

📊 **Analytics & Visualization**
- Real-time system monitoring
- File distribution charts
- Classification accuracy trends
- Performance metrics dashboard

⚙️ **OS Visualizers**
- Process manager with scheduling simulation
- CPU & Disk scheduling algorithms
- Memory allocation visualization
- Deadlock detection demo

## 🏗️ Project Structure

```
autosort-app/
├── electron-main/           # Electron main process
│   ├── main.ts             # Application entry point
│   ├── preload.ts          # IPC preload bridge
│   ├── filesystem.ts       # File system operations
│   └── ml-bridge.ts        # ML service integration
├── renderer/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Entry point
│   ├── vite.config.ts      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS config
│   └── package.json        # Dependencies
├── shared/                 # Shared types & interfaces
│   └── types.ts           # TypeScript definitions
├── db/                    # Database layer
│   └── database.ts        # SQLite manager
├── local-agent/           # Python ML backend (optional)
│   └── ml_service.py      # Flask ML service
├── tests/                 # Test suites
├── scripts/               # Build & deployment scripts
├── assets/                # Application assets
└── package.json          # Root dependencies
```

## 📦 Installation

### Prerequisites
- **Node.js** >= 16.x
- **npm** >= 8.x (or yarn)
- **Python** 3.8+ (optional, for ML backend)

### Step 1: Clone & Install Dependencies

```bash
# Navigate to project directory
cd autosort-app

# Install root dependencies
npm install

# Install renderer dependencies
cd renderer
npm install
cd ..

# For Python ML backend (optional)
pip install -r local-agent/requirements.txt
```

### Step 2: Configure Environment

Create `.env` files:

**Root `.env`:**
```
NODE_ENV=development
VITE_API_URL=http://localhost:5000
```

**Renderer `.env`:**
```
VITE_API_URL=http://localhost:5000
```

## 🎯 Development

### Start Development Mode

```bash
# Terminal 1: Start Vite dev server + Electron
npm run dev

# OR run separately:
npm run dev:renderer    # Terminal 1
npm run dev:electron    # Terminal 2 (after Vite starts)
```

### Build for Production

```bash
# Build renderer & main process
npm run build

# Create installers for current platform
npm run dist

# Build for all platforms (macOS, Windows, Linux)
npm run dist:all
```

### Run Tests

```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## 🔌 IPC API Reference

### File System Operations

```typescript
// Select folder dialog
await window.electronAPI.selectFolder();

// Scan directory recursively
await window.electronAPI.scanDirectory('/path/to/dir');

// Get file stats & classification
await window.electronAPI.getFileStats('/path/to/file');

// File operations
await window.electronAPI.moveFile(oldPath, newPath);
await window.electronAPI.deleteFile(filePath);
```

### ML Operations

```typescript
// Classify single file
await window.electronAPI.classifyFile('/path/to/file');

// Batch classify files
await window.electronAPI.batchClassify([file1, file2, ...]);
```

### System Operations

```typescript
// Get system usage (CPU, Memory, Disk)
await window.electronAPI.getSystemUsage();

// Get job history
await window.electronAPI.getJobHistory();

// Save application settings
await window.electronAPI.saveSettings({ key: 'value' });
```

## 🤖 ML Backend (Optional)

### Setup Python ML Service

```bash
# Install dependencies
pip install -r local-agent/requirements.txt

# Start ML service
python local-agent/ml_service.py

# Service runs on http://127.0.0.1:5000
```

### ML Service Endpoints

```
POST /health                 # Health check
POST /train                  # Train models
POST /predict               # Classify files
```

## 🛠️ Configuration

### Tailwind CSS Classes

Key utility classes used throughout the app:
- `bg-primary-*` - Primary color variants
- `text-gray-*` - Grayscale text
- `rounded-lg` - Rounded corners
- `shadow-sm` - Subtle shadows
- `border-*` - Border utilities

### Application Settings

Settings are stored in SQLite database:
- Theme preference (light/dark)
- UI animations on/off
- Performance settings
- File organization rules

## 📚 Component Guide

### Layout Components
- `Sidebar.tsx` - Navigation sidebar
- `Header.tsx` - Top header with search

### Page Components
- `Dashboard.tsx` - Overview & stats
- `FileExplorer.tsx` - File browser
- `CompressionTool.tsx` - Batch compression
- `DuplicateFinder.tsx` - Duplicate detection
- `SmartSearch.tsx` - AI-powered search
- `Analytics.tsx` - Data visualization
- `OSVisualizers.tsx` - System simulation
- `Settings.tsx` - App configuration

### Hooks
- `useFileSystem` - File operations
- `useDebounce` - Debounce utility
- `useDashboard` - Dashboard data

## 🚀 Deployment

### Windows

```bash
# Create NSIS installer
npm run dist

# Output: dist/AutoSort-Setup-1.0.0.exe
```

### macOS

```bash
# Create DMG installer
npm run dist

# Output: dist/AutoSort-1.0.0.dmg
```

### Linux

```bash
# Create AppImage
npm run dist

# Output: dist/AutoSort-1.0.0.AppImage
```

## 🔒 Security

- **Context Isolation**: Renderer isolated from main process
- **Preload Bridge**: Safe IPC communication
- **No Node Integration**: Renderer cannot access Node.js APIs directly
- **Safe File Paths**: Validated path handling to prevent directory traversal
- **Database Encryption**: Optional SQLite encryption support

## 📊 Data Storage

All application data stored locally in `autosort.db`:
- Job history
- File classifications
- System logs
- Application settings

No data sent to external servers by default.

## 🐛 Troubleshooting

### Issue: Electron fails to start
```bash
# Clear cache and reinstall
rm -rf node_modules electron-main/dist
npm install
npm run dev:electron
```

### Issue: React dev server not connecting
```bash
# Check port 3000 is available
# Kill process on port 3000:
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -i :3000
```

### Issue: Database locked
```bash
# Delete database and restart
rm autosort.db
npm run dev
```

## 📝 License

MIT © 2024 AutoSort Team

## 🤝 Contributing

Contributions are welcome! Please follow the guidelines:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request
