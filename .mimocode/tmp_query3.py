import sqlite3, json, sys

db = sqlite3.connect(r'C:\Users\famil\.local\share\mimocode\mimocode.db')
db.row_factory = sqlite3.Row

# Search for user statements containing rules/decisions in all roambeyondd sessions
print("=== SEARCHING FOR USER RULES/DECISIONS ===")
keywords = ['always', 'never', 'remember', 'rule', 'decision', 'decided', 'must', 'should not', 'prefer']
for kw in keywords:
    rows = db.execute("""
        SELECT m.session_id, m.time_created, json_extract(p.data, '$.type') as ptype, p.data
        FROM part p
        JOIN message m ON m.id = p.message_id
        JOIN session s ON s.id = m.session_id
        WHERE json_extract(m.data, '$.role') = 'user'
          AND s.directory LIKE '%roambeyondd%'
          AND json_extract(p.data, '$.type') = 'text'
          AND json_extract(p.data, '$.text') LIKE ?
        ORDER BY m.time_created DESC
        LIMIT 5
    """, (f'%{kw}%',)).fetchall()
    for r in rows:
        pdata = json.loads(r['data'])
        text = pdata.get('text', '')[:500]
        if kw.lower() in text.lower():
            print(f"  [{kw}] session={r['session_id']} time={r['time_created']}")
            print(f"    {text[:400]}")
            print()

# Search for errors in bash tool output
print("=== SEARCHING FOR ERRORS IN ASSISTANT BASH OUTPUT ===")
rows = db.execute("""
    SELECT m.session_id, json_extract(p.data, '$.type') as ptype, p.data
    FROM part p
    JOIN message m ON m.id = p.message_id
    JOIN session s ON s.id = m.session_id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND s.directory LIKE '%roambeyondd%'
      AND s.project_id = '931642c3-6808-46b7-80a6-c805628a6b71'
      AND json_extract(p.data, '$.type') = 'tool'
      AND json_extract(p.data, '$.tool') = 'bash'
    ORDER BY m.time_created DESC
    LIMIT 20
""").fetchall()
for r in rows:
    pdata = json.loads(r['data'])
    state = pdata.get('state', {})
    output = str(state.get('output', ''))[:500]
    if 'error' in output.lower() or 'fail' in output.lower() or 'not found' in output.lower():
        print(f"  session={r['session_id']}")
        print(f"    output: {output[:300]}")
        print()

# Get message counts per session to understand scope
print("=== MESSAGE COUNTS PER SESSION (current project) ===")
rows = db.execute("""
    SELECT s.id, s.title, COUNT(m.id) as msg_count
    FROM session s
    JOIN message m ON m.session_id = s.id
    WHERE s.project_id = '931642c3-6808-46b7-80a6-c805628a6b71'
    GROUP BY s.id
    ORDER BY MAX(m.time_created) DESC
""").fetchall()
for r in rows:
    print(f"  {r['id']}  msgs={r['msg_count']}  title={r['title'][:60]}")

db.close()
