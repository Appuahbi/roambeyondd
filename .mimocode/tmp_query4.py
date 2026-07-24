import sqlite3, json, sys

db = sqlite3.connect(r'C:\Users\famil\.local\share\mimocode\mimocode.db')
db.row_factory = sqlite3.Row

# Check the most substantive session - Mobile React frontend with green cream white theme
sid = 'ses_06cac3e00ffeI6GbWMLFD7Qbug'
print(f"=== SESSION: {sid} ===")
print()

msgs = db.execute("""
    SELECT m.id, json_extract(m.data, '$.role') as role, m.agent_id, m.time_created
    FROM message m
    WHERE m.session_id = ?
    ORDER BY m.time_created
""", (sid,)).fetchall()

for m in msgs:
    role = m['role']
    aid = m['agent_id'] or 'main'
    label = f"{role.upper()}" if aid == 'main' else f"{role.upper()}/{aid[:20]}"
    
    parts = db.execute("""
        SELECT p.data
        FROM part p
        WHERE p.message_id = ?
        ORDER BY p.time_created
    """, (m['id'],)).fetchall()
    
    for pt in parts:
        pdata = json.loads(pt['data'])
        ptype = pdata.get('type')
        
        if ptype == 'text' and 'text' in pdata:
            text = pdata['text']
            # Skip system-reminder text
            if text.startswith('<system-reminder>'):
                continue
            print(f"  [{label}] {text[:1000]}")
            print()
        elif ptype == 'tool':
            tool = pdata.get('tool', '?')
            state = pdata.get('state', {})
            inp = state.get('input', {})
            
            if isinstance(inp, dict):
                if tool in ('write', 'edit'):
                    fpath = inp.get('file_path', '')
                    print(f"  [{label}] tool={tool} file={fpath}")
                elif tool == 'bash':
                    cmd = inp.get('command', '')[:300]
                    print(f"  [{label}] tool=bash cmd={cmd}")
                elif tool == 'read':
                    fpath = inp.get('file_path', '')
                    print(f"  [{label}] tool=read file={fpath}")
                elif tool == 'glob':
                    pattern = inp.get('pattern', '')
                    print(f"  [{label}] tool=glob pattern={pattern}")
                elif tool == 'grep':
                    pattern = inp.get('pattern', '')
                    print(f"  [{label}] tool=grep pattern={pattern}")
                elif tool == 'actor':
                    desc = inp.get('description', '')[:200]
                    print(f"  [{label}] tool=actor desc={desc}")
                else:
                    print(f"  [{label}] tool={tool} input_keys={list(inp.keys()) if isinstance(inp, dict) else '?'}")
            else:
                print(f"  [{label}] tool={tool}")
        elif ptype == 'step-finish':
            tokens = pdata.get('tokens', '?')
            print(f"  [{label}] [step-finish tokens={tokens}]")
            print()

db.close()
