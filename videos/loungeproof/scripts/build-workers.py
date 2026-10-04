from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import subprocess,os,json
root=Path.cwd()
base='.hyperframes/frame-packets/'
def build(i):
 frame=f'{i:02d}-scene'
 prompt=f'''Read {base}_role.md and {base}{frame}.md in full first. They are your full role and bounded packet. Then read frame.md. Follow this frame only; do not edit any other frame, index, storyboard, or audio.
## Dispatch context
PROJECT_DIR: {root}
frame_id: {frame}
Confirmed sketch: no
Canvas: 1920x1080
Captions: disabled; keep content above y=896
Fonts: assets/fonts/dm-sans.ttf is the local DM Sans file (all weights); use @font-face inside template.
Actual UI screenshot crops are permitted for readability. Screenshots are 1470px wide, the answer panel begins around x=557,y=431. Display a focused answer region rather than shrinking a whole long webpage into illegible type. Preserve real screenshot pixels. Keep root scoped via #root, use namespaced descendants, full-bleed background clip and one paused registered timeline.
Do not include obsolete monthly-quota text in the Sanity shot. The original screenshot may be replaced by the orchestrator with the finished Knowledge Base view. The final narration counts are 38 source cases and 45 tests. Use evaluation.json as data, never as an img. Output one template fragment at compositions/frames/{frame}.html only.'''
 env={k:v for k,v in os.environ.items() if k in ('PATH','HOME','CODEX_HOME','TMPDIR')}
 result=subprocess.run(['/opt/homebrew/bin/codex','exec','--skip-git-repo-check','--ephemeral','--ignore-user-config','--sandbox','workspace-write','--color','never','-C',str(root),'-'],input=prompt,text=True,capture_output=True,env=env,timeout=420)
 (root/'.hyperframes'/f'worker-{frame}.log').write_text(result.stdout+result.stderr)
 print(json.dumps({'frame':frame,'exit':result.returncode,'artifact':(root/f'compositions/frames/{frame}.html').exists()}),flush=True)
with ThreadPoolExecutor(max_workers=3) as pool:
 list(pool.map(build,range(1,7)))
