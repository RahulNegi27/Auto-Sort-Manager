(async () => {
  try {
    const path = require('path');
    const fs = require('fs');
    const { AutoSortCore } = require('../dist/electron-main/autosort-core.js');
    const { FileSystemManager } = require('../dist/electron-main/filesystem.js');

    const testDir = path.join(__dirname, '..', 'tmp_dryrun');
    console.log('Test dir:', testDir);

    // Ensure test dir exists and has sample files
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'doc.txt'), 'sample document');
    fs.writeFileSync(path.join(testDir, 'movie.mp4'), 'sample video');

    const core = new AutoSortCore();

    console.log('\n== RUNNING previewAutoSort (should NOT move files) ==');
    const preview = await core.previewAutoSort(testDir, { useML: false, rules: [{ category: 'video', extensions: ['.mp4'], confidence: 0.99 }] });
    console.log('Preview result:', preview);
    console.log('Files after preview exist? doc:', fs.existsSync(path.join(testDir, 'doc.txt')), 'movie:', fs.existsSync(path.join(testDir, 'movie.mp4')));

    console.log('\n== RUNNING autoSortDirectory with global dry-run flag (simulate external flag) ==');
    FileSystemManager.dryRunEnabled = true;
    const result = await core.autoSortDirectory(testDir, { dryRun: false, useML: false, rules: [{ category: 'video', extensions: ['.mp4'], confidence: 0.99 }] });
    console.log('autoSortDirectory result:', result);
    console.log('Files after simulated-dry-run exist? doc:', fs.existsSync(path.join(testDir, 'doc.txt')), 'movie:', fs.existsSync(path.join(testDir, 'movie.mp4')));

    // Clean up
    FileSystemManager.dryRunEnabled = false;

    console.log('\nTest completed.');
  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  }
})();
