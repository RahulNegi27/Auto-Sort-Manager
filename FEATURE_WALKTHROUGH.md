# 🎯 AutoSort - Step-by-Step Feature Walkthrough

## 🚀 Start Here

### Running the Application

**Open PowerShell and run:**
```powershell
cd 'e:\VS SORT\autosort-app'
$env:NODE_ENV='development'
./node_modules/.bin/electron.cmd dist/electron-main/main.js
```

**You should see:**
- Electron window opens
- Application loads in ~2-3 seconds
- Dashboard page appears with statistics
- DevTools panel opens (optional, close with Ctrl+Shift+C if you want)

---

## 📖 Feature Walkthrough

### 1️⃣ DASHBOARD (Default Page)

**What you see:**
```
┌─────────────────────────────────────┐
│ AutoSort │ ≡ Menu │ Search │ Stats  │
├─────────────────────────────────────┤
│ │ Dash │ Files │ Compress │ Find    │
│ │                                   │
│ │  📊 Dashboard                     │
│ │                                   │
│ │  Total Files: 2,847 files         │
│ │  Organized: 2,019 (92%)           │
│ │  Duplicates: 2,156 found          │
│ │  Space Recovered: 2.3 GB          │
│ │                                   │
│ │  System Usage:                    │
│ │  CPU: ████░░░░░░ 32%              │
│ │  Memory: ██████░░░░ 64%           │
│ │  Disk: ███████░░░ 78%             │
└─────────────────────────────────────┘
```

**How to use:**
1. App opens to Dashboard
2. See real-time stats updated every 5 seconds
3. Check system resources at a glance
4. Click sidebar icons to go to other features

---

### 2️⃣ FILE EXPLORER

**Access:**
```
Sidebar → 📁 Icon (second from top)
```

**What you'll see:**
```
┌─────────────────────────────────────┐
│ 📁 File Explorer                    │
├─────────────────────────────────────┤
│ Search: [        Search files...  ] │
│ Location: C:\Users\                 │
│                                     │
│ 📁 Documents/        1.2 GB         │
│ 📁 Downloads/        856 MB         │
│ 📁 Pictures/         2.1 GB         │
│ 📄 file.txt          2.3 KB         │
│                                     │
│ [Organize] [Delete] [Copy] [Cut]    │
└─────────────────────────────────────┘
```

**Step-by-step:**
1. Click "File Explorer" in sidebar
2. Browse folders by double-clicking
3. Use search bar to find files
4. Right-click for options
5. Select files to organize/delete
6. Click buttons to perform action

**Pro tip:** Use search box to quickly find files by name or type

---

### 3️⃣ COMPRESSION TOOL

**Access:**
```
Sidebar → 📦 Icon (third from top)
```

**What you'll see:**
```
┌──────────────────────────────────────┐
│ 📦 Compression Tool                  │
├──────────────────────────────────────┤
│                                      │
│ Files to Compress:                   │
│ [+ Add Files]  [+ Add Folder]        │
│                                      │
│ Selected Files:                      │
│ ✓ file1.txt       2.3 KB             │
│ ✓ file2.pdf       1.2 MB             │
│                                      │
│ Compression Format:                  │
│ ○ ZIP    ○ TAR    ◉ GZIP             │
│                                      │
│ Output Location:                     │
│ [C:\Compressed\              Browse]│
│                                      │
│ [Compress Files]                     │
└──────────────────────────────────────┘
```

**Step-by-step:**
1. Click "Compression Tool"
2. Click "[+ Add Files]" button
3. Select file(s) to compress
4. Choose format:
   - ZIP = Most compatible
   - TAR = Unix format
   - GZIP = Best compression
5. Set output folder (optional)
6. Click "Compress Files"
7. Wait for progress bar to finish
8. Compressed file created!

**What happens after:**
- New `.zip`/`.tar.gz`/`.gz` file created
- Original files unchanged
- Results shown in message

---

### 4️⃣ DUPLICATE FINDER

**Access:**
```
Sidebar → 🔍 Icon (fourth from top)
```

**What you'll see:**
```
┌─────────────────────────────────────┐
│ 🔍 Duplicate Finder                 │
├─────────────────────────────────────┤
│                                     │
│ [Select Folder to Scan]  [Start]    │
│                                     │
│ Scanning: C:\Users\Documents        │
│ ████████░░░░░░░░░░░░ 40%            │
│                                     │
│ Found Duplicates:                   │
│                                     │
│ ☑ image.jpg (2.4 MB)                │
│   ├─ C:\Users\...\image.jpg (ORIG)  │
│   ├─ ☐ C:\Users\...\image_old.jpg   │
│   └─ ☐ C:\Backup\image.jpg          │
│                                     │
│ ☑ document.docx (145 KB)            │
│   ├─ C:\Users\...\document.docx     │
│   └─ ☐ C:\Backup\document.docx      │
│                                     │
│ [Delete Selected]  [Cancel]         │
└─────────────────────────────────────┘
```

**Step-by-step:**
1. Click "Duplicate Finder"
2. Click "Select Folder to Scan"
3. Choose folder (e.g., Documents)
4. Click "Start" to scan
5. Wait for scan to complete (shows progress %)
6. Review found duplicates:
   - Original marked with (ORIG)
   - Copies shown below
7. Check boxes next to duplicates to delete
8. Click "Delete Selected"
9. Confirm deletion

**After deletion:**
- Selected duplicates removed
- Originals kept safely
- Space freed
- Summary shown

---

### 5️⃣ SMART SEARCH

**Access:**
```
Sidebar → 🔎 Icon (fifth from top)
```

**What you'll see:**
```
┌──────────────────────────────────────┐
│ 🔎 Smart Search                      │
├──────────────────────────────────────┤
│                                      │
│ Search Term: [*.pdf          ]      │
│                                      │
│ Filters:                             │
│ File Type: [All Types      ▼]        │
│ Size Range: [All Sizes     ▼]        │
│ Date Range: [All Dates     ▼]        │
│ Location: [C:\Users\       ]         │
│                                      │
│ [Search Now]  [Save Search]          │
│                                      │
│ Results (23 found):                  │
│                                      │
│ ✓ invoice1.pdf       145 KB   11/15  │
│ ✓ invoice2.pdf       152 KB   11/14  │
│ ✓ report.pdf         2.1 MB   11/10  │
│                                      │
│ [Export Results]                     │
└──────────────────────────────────────┘
```

**Step-by-step:**
1. Click "Smart Search"
2. Enter search term:
   - `*.pdf` = all PDF files
   - `report` = files containing "report"
   - `2024` = files from 2024
3. Add filters (optional):
   - File type (PDF, JPG, etc.)
   - Size (larger than X, smaller than Y)
   - Date range (modified after/before)
   - Location (which folder)
4. Click "Search Now"
5. View results list
6. Click result to open file
7. Export results if needed

**Pro tips:**
- Use wildcards: `*.jpg` for images
- Combine filters for precision
- Save frequent searches

---

### 6️⃣ ANALYTICS

**Access:**
```
Sidebar → 📊 Icon (sixth from top)
```

**What you'll see:**
```
┌──────────────────────────────────────┐
│ 📊 Analytics Dashboard               │
├──────────────────────────────────────┤
│                                      │
│ File Type Distribution:              │
│     ┌──────────────────┐            │
│     │      ╱╲ PDFs     │            │
│     │     ╱  ╲ 23%     │            │
│     │    ╱    ╲        │            │
│     │   ╱ JPGs ╲ 31%   │            │
│     │  ╱        ╲      │            │
│     └──────────────────┘            │
│     Videos 28%  Others 18%          │
│                                      │
│ Storage Breakdown:                   │
│ PDFs:     5.2 GB ████████            │
│ JPGs:     7.1 GB ██████████          │
│ Videos:   6.3 GB █████████           │
│ Others:   3.4 GB █████               │
│                                      │
│ [Export Report]                      │
└──────────────────────────────────────┘
```

**How to use:**
1. Click "Analytics"
2. See pie chart of file types
3. See bar chart of storage usage
4. View statistics
5. Export report for records
6. Use data to plan cleanup

---

### 7️⃣ OS VISUALIZERS

**Access:**
```
Sidebar → 🎮 Icon (seventh from top)
```

**What you'll see:**
```
[CPU Scheduling] [Memory] [Disk] [Processes]

CPU SCHEDULING:
┌──────────────────────────┐
│ Process Queue:           │
│ P1: ████░░░░ 40%         │
│ P2: ░░████░░░ 30%  (wait)│
│ P3: ░░░░░░░░░░ 0% (wait)│
│                          │
│ Time: 245 ms  Quantum: 50│
│ [Start] [Pause] [Reset]  │
└──────────────────────────┘
```

**How to use:**
1. Click "OS Visualizers"
2. Select tab:
   - **CPU Scheduling**: Watch CPU scheduling algorithm
   - **Memory**: See memory allocation
   - **Disk**: Watch disk I/O scheduling
   - **Processes**: See active processes
3. Click "Start" to begin simulation
4. Watch the animation
5. Educational tool for learning OS concepts

---

### 8️⃣ SETTINGS

**Access:**
```
Sidebar → ⚙️ Icon (bottom)
```

**What you'll see:**
```
┌──────────────────────────────────────┐
│ ⚙️ Settings                          │
├──────────────────────────────────────┤
│                                      │
│ General Settings:                    │
│ Theme: [Light        ▼]              │
│ Language: [English   ▼]              │
│ Start on boot: ☑                     │
│                                      │
│ Storage Settings:                    │
│ Default Folder: [C:\Users\  Browse]  │
│ Backup Location: [E:\Backup\ Browse] │
│ Cache Size: [500 MB  ▼]              │
│                                      │
│ Advanced Settings:                   │
│ Enable Logging: ☐                    │
│ Auto-cleanup: ☑                      │
│ Database Maintenance: [Run Now]      │
│                                      │
│ [Save Changes]  [Reset to Default]   │
└──────────────────────────────────────┘
```

**How to use:**
1. Click "Settings"
2. Configure:
   - **Theme**: Light or Dark mode
   - **Language**: Select language
   - **Startup**: Auto-start app
   - **Folders**: Set default locations
   - **Advanced**: Debug options
3. Click "Save Changes"
4. Settings applied immediately

---

## ⌨️ KEYBOARD SHORTCUTS

```
Ctrl+Q           Quit Application
Ctrl+Shift+I     Open Developer Tools (for debugging)
F5               Reload current page
Ctrl+F           Focus search bar
Tab              Navigate between elements
Enter            Click focused button
Esc              Close dialogs/menus
```

---

## 💡 COMMON WORKFLOWS

### Workflow 1: Clean Your Drive
```
Step 1: Open Dashboard
Step 2: Go to Duplicate Finder
Step 3: Select Documents folder
Step 4: Click "Start" to scan
Step 5: Delete found duplicates
Step 6: Check Analytics to see space freed
```

### Workflow 2: Find Old Files
```
Step 1: Open Smart Search
Step 2: Enter search term
Step 3: Set date filter to "before 2023"
Step 4: Click Search
Step 5: View results
Step 6: Delete or archive old files
```

### Workflow 3: Compress Files
```
Step 1: Open File Explorer
Step 2: Select files you want to compress
Step 3: Go to Compression Tool
Step 4: Files already selected
Step 5: Choose ZIP format
Step 6: Click Compress
Step 7: Compressed file created
```

### Workflow 4: Organize Storage
```
Step 1: Check Analytics for space hogs
Step 2: Go to File Explorer
Step 3: Navigate to large folders
Step 4: Use Compression Tool to shrink files
Step 5: Use Duplicate Finder to remove copies
Step 6: Check Analytics again to verify savings
```

---

## 🆘 WHAT IF SOMETHING DOESN'T WORK?

### Issue: Feature Not Responding
**Fix:**
1. Press `F5` to reload
2. Try the feature again

### Issue: Unexpected Behavior
**Fix:**
1. Press `Ctrl+Shift+I` to open DevTools
2. Check Console tab for errors (red text)
3. Report the error

### Issue: App Freezes
**Fix:**
1. Close the app (Alt+F4)
2. Restart it
3. Try again

### Issue: Feature Takes Long
**Fix:**
1. Close background apps
2. Wait for operation to complete
3. Don't interrupt the process

---

## 🎯 TIPS FOR BEST RESULTS

1. **Regular Maintenance**
   - Run duplicate finder weekly
   - Check analytics monthly
   - Clear cache periodically

2. **File Organization**
   - Keep organized folder structure
   - Regular backups before changes
   - Use search before deleting

3. **Performance**
   - Close unused applications
   - Don't interrupt scans
   - Monitor available space

4. **Debugging**
   - Open DevTools (Ctrl+Shift+I)
   - Check console for errors
   - Look at Network tab

---

## ✨ YOU'RE ALL SET!

You now know:
- ✅ How to run the app
- ✅ How to use all 8 features
- ✅ Common workflows
- ✅ Troubleshooting steps
- ✅ Keyboard shortcuts

**Start using AutoSort now and enjoy organized storage!** 🎉

---

**Questions?** Check documentation files:
- `FEATURES_GUIDE.md` - Detailed feature information
- `README.md` - Complete reference
- `STATUS_REPORT.md` - Application status

**AutoSort v1.0.0** | Ready to use! 🚀
