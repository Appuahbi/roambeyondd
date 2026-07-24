import sqlite3, json, sys

db = sqlite3.connect(r'C:\Users\famil\.local\share\mimocode\mimocode.db')
db.row_factory = sqlite3.Row

# Get project details
print("=== PROJECTS ===")
rows = db.execute("SELECT id, worktree, name FROM project").fetchall()
for r in rows:
    print(f"  {r['id']}  worktree={r['worktree']}  name={r['name']}")

# Recent sessions
print()
print("=== SESSIONS (recent 20, all projects) ===")
rows = db.execute("""
    SELECT s.id, s.directory, s.title, s.time_created, s.project_id
    FROM session s
    ORDER BY s.time_created DESC 
    LIMIT 20
""").fetchall()
for r in rows:
    print(f"  {r['id']}  created={r['time_created']}  dir={r['directory']}  pid={r['project_id']}  title={r['title']}")

# Filter for roambeyondd
print()
print("=== SESSIONS for roambeyondd ===")
rows = db.execute("""
    SELECT s.id, s.directory, s.title, s.time_created, s.project_id
    FROM session s
    JOIN project p ON p.id = s.project_id
    WHERE p.worktree LIKE '%roambeyondd%' OR p.worktree LIKE '%RoamBeyondDD%'
       OR s.directory LIKE '%roambeyondd%' OR s.directory LIKE '%RoamBeyondDD%'
    ORDER BY s.time_created DESC 
    LIMIT 30
""").fetchall()
if not rows:
    print("  (none found)")
for r in rows:
    print(f"  {r['id']}  created={r['time_created']}  dir={r['directory']}  pid={r['project_id']}  title={r['title']}")

# Distinct directories
print()
print("=== DISTINCT directories ===")
rows = db.execute("SELECT DISTINCT directory FROM session ORDER BY time_created DESC").fetchall()
for r in rows:
    print(f"  {r['directory']}")

db.close()
