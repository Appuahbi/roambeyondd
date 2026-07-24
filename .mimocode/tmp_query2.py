import sqlite3, json, sys

db = sqlite3.connect(r'C:\Users\famil\.local\share\mimocode\mimocode.db')
db.row_factory = sqlite3.Row

# The current project sessions (931642c3) - recent ones with user work
session_ids = [
    'ses_06cac3e00ffeI6GbWMLFD7Qbug',  # Mobile React frontend with green cream white theme
    'ses_06cad7e44ffehXjk95oV3VZiu4',  # can u read my backend
    'ses_06cad7e11ffe7st6iaVKHAHWMv',  # can u redesign the frontend
    'ses_06cad7e0effeBta6C6Zv47QYrq',  # can u make me a 3d landing page (latest)
    'ses_06cad7e16ffeGaimuqyGK8XDjs',  # can u make me an landing page (earlier)
]

for sid in session_ids:
    print(f"\n{'='*80}")
    print(f"SESSION: {sid}")
    
    # Get session info
    r = db.execute("SELECT title, time_created FROM session WHERE id=?", (sid,)).fetchall()
    if r:
        print(f"  Title: {r[0]['title']}")
    
    # Get all messages in order - limit to first 30
    msgs = db.execute("""
        SELECT m.id, json_extract(m.data, '$.role') as role, m.agent_id
        FROM message m
        WHERE m.session_id = ?
        ORDER BY m.time_created
        LIMIT 30
    """, (sid,)).fetchall()
    
    for m in msgs:
        role = m['role']
        aid = m['agent_id']
        label = role.upper()
        if aid and aid != 'main':
            label = f"{role.upper()}/{aid[:15]}"
        
        # Get text parts only
        parts = db.execute("""
            SELECT p.data
            FROM part p
            WHERE p.message_id = ?
            ORDER BY p.time_created
        """, (m['id'],)).fetchall()
        
        for pt in parts:
            pdata = json.loads(pt['data'])
            if pdata.get('type') == 'text' and 'text' in pdata:
                text = pdata['text'][:1200]
                print(f"  [{label}] {text}")
            elif pdata.get('type') == 'tool':
                tool = pdata.get('tool', '?')
                state = pdata.get('state', {})
                # For write/edit tools, show file path
                inp = state.get('input', {})
                if isinstance(inp, dict):
                    fpath = inp.get('file_path', inp.get('path', ''))
                    if fpath:
                        print(f"  [{label}] tool={tool} file={fpath}")
                    else:
                        cmd = inp.get('command', '')[:200]
                        print(f"  [{label}] tool={tool} cmd={cmd}")
                else:
                    print(f"  [{label}] tool={tool}")

db.close()
