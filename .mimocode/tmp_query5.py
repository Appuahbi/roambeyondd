import sqlite3, json, sys

db = sqlite3.connect(r'C:\Users\famil\.local\share\mimocode\mimocode.db')
db.row_factory = sqlite3.Row

# Get ALL write/edit tool calls from the current project sessions
print("=== FILE WRITES IN CURRENT PROJECT SESSIONS ===")
rows = db.execute("""
    SELECT m.session_id, s.title, json_extract(p.data, '$.tool') as tool, p.data
    FROM part p
    JOIN message m ON m.id = p.message_id
    JOIN session s ON s.id = m.session_id
    WHERE s.project_id = '931642c3-6808-46b7-80a6-c805628a6b71'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') IN ('write', 'edit')
      AND json_extract(m.data, '$.role') = 'assistant'
    ORDER BY m.time_created
""").fetchall()

for r in rows:
    pdata = json.loads(r['data'])
    state = pdata.get('state', {})
    inp = state.get('input', {})
    if isinstance(inp, dict):
        fpath = inp.get('file_path', '')
        tool = r['tool']
        print(f"  [{tool}] session={r['session_id'][:20]}  file={fpath}")

# Also check for any new session checkpoints
print()
print("=== CHECKPOINTS IN MEMORY TREE ===")
import os
memory_sessions = r'C:\Users\famil\.local\share\mimocode\memory\sessions'
for d in os.listdir(memory_sessions):
    cp = os.path.join(memory_sessions, d, 'checkpoint.md')
    if os.path.exists(cp):
        # Check if this is a current project session
        with open(cp, 'r', encoding='utf-8') as f:
            content = f.read()
        if 'roambeyondd' in content.lower() or '931642c3' in content.lower():
            print(f"  {d}: {content[:100].replace(chr(10), ' ')}")

# Check notes files
print()
print("=== NOTES IN MEMORY TREE ===")
for d in os.listdir(memory_sessions):
    notes = os.path.join(memory_sessions, d, 'notes.md')
    if os.path.exists(notes):
        with open(notes, 'r', encoding='utf-8') as f:
            content = f.read()
        if content.strip() and ('roambeyondd' in content.lower() or 'tour' in content.lower() or len(content) > 10):
            print(f"  {d}: {content[:200].replace(chr(10), ' ')}")

db.close()
