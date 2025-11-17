# 🎯 AutoSort - Command Reference & Feature Guide

## 🚀 QUICK START COMMANDS

### Start the App (One Command)
```powershell
cd 'e:\VS SORT\autosort-app'; $env:NODE_ENV='development'; ./node_modules/.bin/electron.cmd dist/electron-main/main.js
```

### Rebuild & Run
```powershell
cd 'e:\VS SORT\autosort-app'; npx tsc --project tsconfig.electron.json; $env:NODE_ENV='development'; ./node_modules/.bin/electron.cmd dist/electron-main/main.js
```

### Build Frontend
```powershell
cd 'e:\VS SORT\autosort-app\renderer'; npm run build
```

### Build Electron Backend
```powershell
cd 'e:\VS SORT\autosort-app'; npx tsc --project tsconfig.electron.json
```

---

## 📖 FEATURE GUIDE

### 🏠 Dashboard
**Location**: Home / Main Page
**What It Does**:
- Shows real-time system statistics
- Displays CPU, Memory, Disk usage
- Shows file organization metrics
- Quick access to all tools

**How to Use**:
1. Launch the app
2. Dashboard opens automatically
3. View live system metrics
4. Click sidebar icons to access other features

---

### 📁 File Explorer
**Location**: Sidebar → Files Icon
**What It Does**:
- Browse your computer's files
- View file details (name, size, type)
- Organize files by category
- Search for specific files

**How to Use**:
1. Click "File Explorer" in sidebar
2. Navigate through folders
3. Click on files to select them
4. Use search bar to find files
5. Right-click for options (organize, delete, etc.)

**Pro Tips**:
- Use search bar for quick file finding
- Sort by name, size, or date modified
- Toggle between list and grid view

---

### 📦 Compression Tool
**Location**: Sidebar → Compression Icon
**What It Does**:
- Compress files into ZIP, TAR, or GZIP
- Batch compress multiple files
- Track compression progress
- Preview compression results

**How to Use**:
1. Click "Compression Tool" in sidebar
2. Select files to compress
   - Click "Add Files" button
   - Select one or multiple files
   - Or drag & drop files
3. Choose compression format:
   - **ZIP** - Best compatibility
   - **TAR** - Unix/Linux format
   - **GZIP** - Highest compression
4. Set output location
5. Click "Compress" button
6. Wait for progress bar to complete
7. Preview results

**Pro Tips**:
- ZIP is most universal format
- GZIP offers best compression ratio
- Use batch mode for multiple files

---

### 🔍 Duplicate Finder
**Location**: Sidebar → Duplicate Icon
**What It Does**:
- Scans folders for duplicate files
- Compares file hashes
- Shows duplicate groups
- Safely delete duplicates

**How to Use**:
1. Click "Duplicate Finder" in sidebar
2. Click "Select Folder" to scan
3. Choose target folder
4. Click "Start Scan" button
5. Wait for scan completion
   - Progress bar shows status
   - Scans through files...
6. Review found duplicates
   - Shows grouped duplicates
   - Original file marked
7. Select duplicates to delete
8. Click "Delete Selected" with confirmation

**Pro Tips**:
- Always backup before deleting
- Keep original, delete copies
- Can save space from duplicates

---

### 🔎 Smart Search
**Location**: Sidebar → Search Icon
**What It Does**:
- Advanced file search with filters
- Search by name, size, type, date
- Save frequent searches
- Export search results

**How to Use**:
1. Click "Smart Search" in sidebar
2. Enter search term in search box
3. Add filters (optional):
   - File type (PDF, JPG, etc.)
   - Size range (smallest to largest)
   - Date modified (before/after)
   - Location (folder path)
4. Click "Search" button
5. View results in list
6. Click result to open file
7. Export results if needed

**Pro Tips**:
- Use wildcards: `*.pdf` for all PDFs
- Combine multiple filters for precise search
- Save searches for repeated use

---

### 📊 Analytics Dashboard
**Location**: Sidebar → Analytics Icon
**What It Does**:
- View storage breakdown by file type
- See file organization trends
- Track space usage over time
- Export reports

**How to Use**:
1. Click "Analytics" in sidebar
2. View statistics:
   - **Pie Chart** - File type distribution
   - **Bar Chart** - Top file types by size
   - **Line Chart** - Usage trends
3. Select date range for analysis
4. Click "Export Report" to download
5. Use for storage planning

**Pro Tips**:
- Export reports for records
- Use trends to plan cleanup
- Identify space hogs

---

### 🎮 OS Visualizers
**Location**: Sidebar → Visualizers Icon
**What It Does**:
- CPU scheduling simulation
- Memory allocation visualization
- Disk I/O scheduling demo
- Process management simulator

**How to Use**:

#### CPU Scheduler
1. Click "OS Visualizers" in sidebar
2. Select "CPU Scheduling" tab
3. Watch simulated scheduling
4. Processes show execution order
5. Colors indicate process states

#### Memory Manager
1. Select "Memory" tab
2. View memory allocation
3. See block allocation
4. Watch compaction process

#### Disk Scheduler
1. Select "Disk Scheduling" tab
2. View I/O requests
3. Watch scheduling algorithm
4. See head movement optimization

#### Process Manager
1. Select "Processes" tab
2. View active process list
3. See resource usage
4. Monitor system activity

**Pro Tips**:
- Educational tool for learning OS concepts
- Watch animations to understand scheduling
- Useful for system optimization knowledge

---

### ⚙️ Settings
**Location**: Sidebar → Settings Icon
**What It Does**:
- Configure application preferences
- Set default storage locations
- Enable/disable features
- Manage backup settings

**How to Use**:
1. Click "Settings" in sidebar
2. General Settings:
   - Application theme (light/dark)
   - Default language
   - Startup behavior
3. Storage Settings:
   - Default folders to monitor
   - Backup location
   - Cache settings
4. Advanced Settings:
   - Debug logging
   - Performance optimization
   - Database maintenance
5. Click "Save" to apply changes

**Pro Tips**:
- Enable logging for troubleshooting
- Set appropriate backup location
- Adjust cache for performance

---

## 🎨 UI Features Explained

### Top Header
- **Search Bar**: Quick search across all files
- **System Stats**: CPU%, Memory%, Disk% (updated every 5 sec)
- **Notification Bell**: Shows system alerts
- **User Menu**: Profile and logout options

### Left Sidebar
- **Logo & Title**: Click to go to Dashboard
- **Navigation Items**: Click to switch features
- **Active Indicator**: Shows current page
- **Pro Tip**: Helpful hints about features

### Main Content Area
- **Breadcrumb**: Shows current location
- **Controls**: Buttons and inputs for feature
- **Content**: Feature-specific content
- **Status Bar**: Shows progress/results

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Q` | Quit application |
| `Ctrl+Shift+I` | Open DevTools (Debug) |
| `F5` | Reload page |
| `Ctrl+F` | Focus search bar |
| `Tab` | Navigate between elements |
| `Enter` | Activate focused button |
| `Esc` | Close dialogs/menus |

---

## 🆘 Troubleshooting Features

### If Feature Not Responding
1. Press `F5` to reload
2. Check DevTools (Ctrl+Shift+I) for errors
3. Restart application
4. Rebuild if necessary

### If Files Don't Show
1. Check file permissions
2. Verify folder path exists
3. Check search filters
4. Try different folder

### If Scan Takes Long
1. Reduce scan scope
2. Close other applications
3. Check disk usage
4. Wait for completion (don't interrupt)

---

## 🎓 Learning by Feature

### For Beginners
Start with:
1. Dashboard - understand interface
2. File Explorer - browse files
3. Settings - customize app

### For File Organization
Use:
1. File Explorer - locate files
2. Duplicate Finder - remove duplicates
3. Compression Tool - save space
4. Analytics - track progress

### For Power Users
Explore:
1. Smart Search - advanced queries
2. Analytics - detailed reports
3. OS Visualizers - system learning
4. DevTools - debugging (Ctrl+Shift+I)

---

## 📈 Workflow Examples

### Workflow 1: Clean Your Computer
```
1. Dashboard → Overview of current state
2. Duplicate Finder → Find duplicate files
3. Compression Tool → Compress unnecessary files
4. Analytics → Check space freed
5. Settings → Configure auto-cleanup
```

### Workflow 2: Find Specific Files
```
1. File Explorer → Browse to general location
2. Smart Search → Use filters to narrow down
3. Review search results
4. Take action (organize, delete, compress)
```

### Workflow 3: Organize Storage
```
1. Analytics → See what's taking space
2. File Explorer → Navigate to problem areas
3. Compression Tool → Compress old files
4. Duplicate Finder → Remove duplicates
5. Analytics → Verify improvements
```

---

## 💡 Pro Tips

1. **Regular Maintenance**
   - Run duplicate finder weekly
   - Check analytics monthly
   - Clean cache regularly

2. **Performance**
   - Close other apps before large scans
   - Use compression to free space
   - Monitor system stats regularly

3. **File Management**
   - Keep organized folder structure
   - Regular backups before changes
   - Use search before deleting

4. **Debugging**
   - Open DevTools with Ctrl+Shift+I
   - Check console for errors
   - Look at Network tab for issues

---

## 🚀 Next: Customization

To modify the app:
- Edit files in `renderer/src/`
- Rebuild: `npx tsc --project tsconfig.electron.json`
- Restart app
- See IMPLEMENTATION_GUIDE.md for details

---

**AutoSort v1.0.0** | File Manager & System Utility  
Ready to use and fully functional! 🎉
