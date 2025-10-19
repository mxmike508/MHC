# FILE PROTECTION RULES FOR AI SESSIONS
**Created**: October 14, 2025
**Purpose**: Prevent AIs from overwriting working functionality

---

## 🚨 CRITICAL RULES FOR ALL AI SESSIONS

### Rule #1: Git Commit BEFORE Any Code Changes
```bash
# Before modifying ANY file, create checkpoint:
git add -A
git commit -m "CHECKPOINT: Before [what you're about to do]"
```

**Why**: Allows instant rollback if something breaks

### Rule #2: Create Timestamped Backups
```bash
# Before editing critical files:
cp file.js file.js.BACKUP_$(date +%Y%m%d_%H%M%S)
```

**Critical files**:
- `ui-prototype-sandbox/modules/chat/*.js`
- `ui-prototype-sandbox/modules/config/*.js`
- `production/Chat_*.html`
- Any file containing "v10" or "v1.x" in filename

### Rule #3: Test IMMEDIATELY After Changes
After modifying persona/chat/config code:

1. Open in browser
2. Create new project
3. Ask: "What is your persona?"
4. Verify AI responds with correct persona
5. ONLY commit if test passes

### Rule #4: Document Changes in Session Log
Append to `PERSONA_REBUILD_SESSION_LOG.md`:
- What was changed
- Why it was changed
- Test results
- Git commit hash

### Rule #5: NEVER "Upgrade" Old Versions
**DO NOT**:
- Update v10.4 files with "improvements" from v1.5.0
- Backport features from modular to monolithic files
- "Sync" configurators across versions

**WHY**: This destroys the ability to compare working vs broken versions

---

## 📁 FILE STATUS REFERENCE

### Working Data (DO NOT DELETE)
- localStorage `custom_personas_v1` - Contains 2 working personas
- localStorage `project_personas` - Contains 58+ project mappings

### Files With Missing Functions (Current State)
- `production/Chat_v10.4.html` - Persona UI exists, injection code missing
- `ui-prototype-sandbox/reference/Chat_v10.4.html` - Same issue
- All v10.4 files compromised

### Target for Rebuild
- `ui-prototype-sandbox/modules/chat/chat-v1.5.0.js` - ADD injection here
- `ui-prototype-sandbox/modules/config/config-v1.7.js` - Verify functions exist

---

## 🎯 STANDARD WORKFLOW FOR AI SESSIONS

### Starting New Session
1. Read `QUICK_START.md`
2. Read `PERSONA_REBUILD_SESSION_LOG.md` (latest status)
3. Check git status: `git status`
4. Verify last commit date/message

### Before Making Changes
1. Create git checkpoint
2. Create timestamped backup
3. Document intended change in session log

### After Making Changes
1. Test immediately (persona test protocol)
2. If working: Commit with "✅ WORKING:" prefix
3. If broken: Revert with `git reset --hard HEAD`
4. Document results in session log

### Ending Session
1. Update `PERSONA_REBUILD_SESSION_LOG.md` with summary
2. Create final commit with session summary
3. Update bootstrap_v7.md with session entry

---

## 🚫 COMMON MISTAKES TO AVOID

### Mistake #1: "I'll improve the old version"
**DON'T**: Update v10.4 files with new features
**DO**: Work only in modular v1.5.0 going forward

### Mistake #2: "I'll fix this little thing without testing"
**DON'T**: Make "quick fixes" without testing
**DO**: Test after EVERY change, no matter how small

### Mistake #3: "Version numbers will protect me"
**DON'T**: Rely on version numbers (v10.4, v10.5, etc.)
**DO**: Use git commits + timestamped backups

### Mistake #4: "I'll organize files later"
**DON'T**: Move/rename files during active development
**DO**: Keep file locations stable, use git for history

### Mistake #5: "The user will remember what worked"
**DON'T**: Assume user knows implementation details
**DO**: Document everything in session logs

---

## 📝 REQUIRED DOCUMENTATION

### Every Code Change Must Include:

1. **Git commit message** with format:
   ```
   [STATUS] Component: Description

   - Specific change 1
   - Specific change 2
   - Test results
   ```

2. **Session log entry** with:
   - Date/time
   - File(s) modified
   - Function(s) added/changed
   - Test results (pass/fail)
   - Commit hash

3. **Test results** documenting:
   - What was tested
   - Expected behavior
   - Actual behavior
   - Pass/Fail status

---

## 🔄 ROLLBACK PROCEDURES

### If Something Breaks

**Option 1: Revert Last Commit**
```bash
git reset --hard HEAD~1
```

**Option 2: Restore From Backup**
```bash
cp file.js.BACKUP_20251014_153000 file.js
```

**Option 3: Cherry-pick Working Commit**
```bash
git log --oneline  # Find working commit hash
git checkout <hash> -- path/to/file.js
```

---

## ✅ SUCCESS CRITERIA

### Persona System is "Working" When:
1. User creates project with specific persona
2. User asks: "What is your persona?"
3. AI correctly identifies the assigned persona
4. User changes persona in config
5. AI correctly identifies NEW persona when asked again

**All 5 steps must pass for system to be considered working.**

---

**Remember**: Git commits are free. Backups are cheap. Rebuilding from scratch is expensive.

**When in doubt**: Commit first, code second, test third.
