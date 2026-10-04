from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import subprocess, os, json
root=Path.cwd()
def build(i):
 frame=f'lpv2-{i:02d}'
 role=(root/'.hyperframes/frame-packets/_role.md').read_text()
 packet=(root/f'.hyperframes/frame-packets/{frame}.md').read_text()
 context=f"""## Dispatch context
PROJECT_DIR: {root}
frame_id: {frame}
Confirmed sketch: no
Canvas: 1920x1080
Captions: disabled; all foreground above y=896
Design truth: read frame.md in full. Only local assets supplied in packet. Before composing, inspect supplied actual screenshots through image viewing if available; preserve their content. Wave and scan assets are1280square transparent. Result captures895wide; live-agent835x443.
Do not run CLI, create audio, edit other files, or open the shared storyboard. Output exactly one template at compositions/frames/{frame}.html. Classes must start with lpv2-, root styles via #root. No CSS keyframe or transition motion. One paused registered GSAP timeline. Do not create duplicate synthetic avatar; use image. Your final write is your terminal action.
"""
 prompt=role+'\n\n'+context+'\n\n'+packet
 env={k:v for k,v in os.environ.items() if k in ('PATH','HOME','CODEX_HOME','TMPDIR')}
 try:
  result=subprocess.run(['/opt/homebrew/bin/codex','exec','--skip-git-repo-check','--ephemeral','--ignore-user-config','--sandbox','workspace-write','--color','never','-C',str(root),'-'],input=prompt,text=True,capture_output=True,env=env,timeout=420)
  (root/'.hyperframes'/f'worker-{frame}.log').write_text(result.stdout+result.stderr)
  print(json.dumps({'frame':frame,'exit':result.returncode,'artifact':(root/f'compositions/frames/{frame}.html').exists()}),flush=True)
 except subprocess.TimeoutExpired as e:
  print(json.dumps({'frame':frame,'timeout':True,'artifact':(root/f'compositions/frames/{frame}.html').exists()}),flush=True)
with ThreadPoolExecutor(max_workers=3) as pool:
 list(pool.map(build,range(1,7)))
