const { exec } = require('child_process');
const fs = require('fs');

const WATCH_DIR = __dirname;
let debounceTimer;

const pushChanges = () => {
  const timestamp = new Date().toLocaleTimeString();
  
  // 1. Check if there are actual changes
  exec('git status --porcelain', (err, stdout) => {
    if (!stdout.trim()) return; // No changes to commit
    
    console.log(`\n[${timestamp}] Changes detected. Auto-saving...`);
    
    // 2. Add, Commit, Push
    exec('git add . && git commit -m "Auto-save: ' + timestamp + '" && git push', (err, stdout, stderr) => {
      if (err) {
        console.error(`[ERROR] Failed to push: ${stderr || err.message}`);
      } else {
        console.log(`[SUCCESS] Changes pushed to GitHub securely! 🚀`);
      }
    });
  });
};

console.log("=========================================");
console.log("   GitHub Auto-Saver is now ACTIVE!");
console.log("   Watching for file changes...");
console.log("   Keep this terminal window open.");
console.log("=========================================\n");

// Watch entire directory recursively
fs.watch(WATCH_DIR, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  
  // Ignore git metadata and node_modules
  if (filename.includes('.git') || filename.includes('node_modules') || filename.includes('.env')) {
    return;
  }
  
  // Debounce: Wait 3 seconds of file inactivity before committing
  // This prevents multiple commits when saving multiple files at once
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    pushChanges();
  }, 3000); 
});
