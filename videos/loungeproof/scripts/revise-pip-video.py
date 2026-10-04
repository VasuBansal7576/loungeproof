"""One-off v2-to-v3 draft migration. Final hand-authored fragments in compositions/frames
are the render source of truth. This archival script predates the final gestures and
evidence recrops; do not rerun it to reproduce the delivered video. Use npm run render.
"""
from pathlib import Path
import json,re,shutil
root=Path(__file__).resolve().parents[3]
p=root/'videos/loungeproof'
performance=json.loads((p/'pip-performance-v3.json').read_text())
voices=[v for v in performance['voices'] if v['id'].startswith('v3-')]
request=json.loads((p/'audio_request-v3.json').read_text())
lines={v['id']:v['text'] for v in request['lines']}
backup=root/'reports/pip-v3/previous-video-frames';backup.mkdir(parents=True,exist_ok=True)
old_durations=[10.048,15.168,16.853,15.04,14.272,16.981]
rig=(root/'public/brand/pip-rig.svg').read_text()
frames=p/'compositions/frames'
for i,(voice,old_dur) in enumerate(zip(voices,old_durations),1):
    old_id=f'lpv2-{i:02d}';new_id=f'lpv3-{i:02d}'
    old=frames/(old_id+'.html')
    old_source=old.read_text() if old.exists() else (backup/(old_id+'.html')).read_text()
    if old.exists():shutil.move(old,backup/old.name)
    s=old_source.replace(old_id,new_id)
    duration=voice['duration_s'];factor=duration/old_dur
    s=re.sub(r'data-duration="[^"]+"',f'data-duration="{duration}"',s)
    svg=rig.replace('class="pip-rig"',f'class="pip-rig {new_id}-actor"').replace('id="',f'id="{new_id}-').replace('url(#',f'url(#{new_id}-').replace('<svg ','<svg style="width:100%;height:100%;display:block" ')
    def avatar(m):
        attrs=m.group(0)
        c=re.search(r'class="([^"]+)"',attrs)
        return ('<div class="'+c.group(1)+'">'+svg+'</div>') if c else svg
    s=re.sub(r'<img\b[^>]*src="assets/v2/pip-(?:wave|scan)\.png"[^>]*>',avatar,s)
    # Keep the proven layouts; retime their existing graphics to the new performance.
    motion=f'''\n      const retime = {factor:.9f};
      const authoredTweens = tl.getChildren(false,true,false);
      authoredTweens.forEach(t => {{ const at=t.startTime()*retime; t.duration(t.duration()*retime); t.startTime(at); }});
      const actor = '.{new_id}-actor';
      const joint = part => actor+' .rig-'+part;
      tl.set(joint('mouth'),{{scaleY:.16,svgOrigin:'209 239'}},0);
      tl.set(joint('eyes'),{{scaleY:1,svgOrigin:'209 206'}},0);
      tl.set(joint('torso'),{{svgOrigin:'235 355'}},0);
      tl.set(joint('arm-left'),{{svgOrigin:'155 239'}},0);
      tl.set(joint('arm-right'),{{svgOrigin:'318 240'}},0);
      tl.set(joint('foot-left'),{{svgOrigin:'185 382'}},0);
      tl.set(joint('foot-right'),{{svgOrigin:'295 382'}},0);
      const mouth = {json.dumps(voice['mouth'],separators=(',',':'))};
      mouth.forEach((v,i)=>tl.to(joint('mouth'),{{scaleY:v,duration:1/15,ease:'none'}},i/15));
      tl.to(joint('mouth'),{{scaleY:.16,duration:.12}}, {max(0,duration-.14):.6f});
      // Eyelids and gaze change independently; the viewer can see Pip thinking.
      for(let t=2;t<{duration:.6f}-.4;t+=3.2){{
        tl.to(joint('eyes'),{{scaleY:.08,duration:.09,ease:'power2.in'}},t);
        tl.to(joint('eyes'),{{scaleY:1,duration:.13,ease:'power2.out'}},t+.09);
      }}
      for(let t=.4;t<{duration:.6f}-1.1;t+=2.7){{
        tl.to(joint('torso'),{{rotation:1.8,y:-3,duration:.55,ease:'sine.inOut'}},t);
        tl.to(joint('torso'),{{rotation:-1,y:0,duration:.65,ease:'sine.inOut'}},t+.55);
      }}
      // A greeting, a point toward the evidence, then an open-handed explanation.
      tl.to(joint('arm-left'),{{rotation:32,duration:.22,ease:'power2.out'}},.4);
      tl.to(joint('arm-left'),{{rotation:8,duration:.22,ease:'power2.inOut'}},.62);
      tl.to(joint('arm-left'),{{rotation:32,duration:.22,ease:'power2.inOut'}},.84);
      tl.to(joint('arm-left'),{{rotation:2,duration:.3,ease:'power2.out'}},1.06);
      tl.to(joint('look'),{{x:-5,y:0,duration:.35}}, {duration*.27:.6f});
      tl.to(joint('arm-left'),{{rotation:-18,duration:.4}}, {duration*.29:.6f});
      tl.to(joint('arm-right'),{{rotation:-42,duration:.4,ease:'power3.out'}}, {duration*.46:.6f});
      tl.to(joint('look'),{{x:4,y:0,duration:.3}}, {duration*.46:.6f});
      tl.to(joint('arm-right'),{{rotation:-8,duration:.5}}, {duration*.65:.6f});
      tl.to(joint('arm-left'),{{rotation:18,duration:.4}}, {duration*.67:.6f});
      tl.to(joint('look'),{{x:0,y:-2,duration:.3}}, {duration*.76:.6f});
      tl.to(joint('arm-left'),{{rotation:0,duration:.4}}, {duration*.84:.6f});
      tl.to(joint('arm-right'),{{rotation:-27,duration:.3}}, {duration*.86:.6f});
      tl.to(joint('arm-right'),{{rotation:0,duration:.35}}, {duration*.91:.6f});
      // Footfalls during the existing travel into each proof position.
      for(let k=0;k<4;k++){{const t={duration*.35:.6f}+k*.24;
        tl.to(joint(k%2?'foot-right':'foot-left'),{{y:-8,rotation:k%2?8:-8,duration:.11}},t);
        tl.to(joint(k%2?'foot-right':'foot-left'),{{y:0,rotation:0,duration:.13}},t+.11);
      }}
'''
    # Each fragment ends its synchronously registered animation with the same IIFE.
    s=re.sub(r'\}\)\(\);',motion+'})();',s)
    if 'const authoredTweens' not in s:raise RuntimeError('Unmatched animation closure '+new_id)
    if i==1:
        s=s.replace('YOUR EVIDENCE GUIDE','YOUR TRIP GUIDE')
    (frames/(new_id+'.html')).write_text(s)
# Adapt the locked revised plan and actual audio metadata for the official assembler.
story=(p/'STORYBOARD-v2.md').read_text().replace('lpv2-','lpv3-')
story=story.replace('Original avatar-led product explanation','Articulated avatar performance with independently animated wings, eyes, torso, feet and audio-driven mouth. Original avatar-led product explanation')
for i,(v,old_dur) in enumerate(zip(voices,old_durations),1):
    pattern=rf'(## Frame {i} .*?)(?=\n## Frame |\Z)'
    def rewrite(m):
        section=m.group(1)
        section=re.sub(r'- duration: [^\n]+',f"- duration: {v['duration_s']}s",section)
        section=re.sub(r'- voiceover: [^\n]+','- voiceover: '+json.dumps(lines[v['id']]),section)
        return section+'\nIndependent joint performance replaces the still mascot. Mouth follows the actual voice RMS envelope at 15 Hz, closes on silence; gaze and pointing change with the explanation.\n'
    story=re.sub(pattern,rewrite,story,flags=re.S)
duration=sum(v['duration_s'] for v in voices)
story=re.sub(r'^duration: [^\n]+',f'duration: {duration:.6f}s',story,flags=re.M)
(p/'STORYBOARD-v3.md').write_text(story)
meta={'bgm':None,'voices':[{'frame':i,'id':v['id'],'path':v['path'],'duration_s':v['duration_s'],'words':[]} for i,v in enumerate(voices,1)],'sfx':[]}
old_sfx=json.loads((p/'audio_meta-v2.json').read_text())['sfx']
meta['sfx']=old_sfx
(p/'audio_meta-v3.json').write_text(json.dumps(meta,indent=2)+'\n')
chapters=[];offset=0
for title,v in zip(['Meet Pip','ICICI balance route','HDFC dated terms','Axis exact trip','Sanity + live agent','Proof + scope'],voices):
    chapters.append({'title':title,'start':round(offset,6)});offset+=v['duration_s']
(root/'src/tour-chapters.json').write_text(json.dumps(chapters,indent=2)+'\n')
motion=json.loads((p/'index.motion.json').read_text().replace('lpv2-','lpv3-'));motion['duration']=duration;(p/'index.motion.json').write_text(json.dumps(motion,indent=2)+'\n')
print(json.dumps({'duration':duration,'frames':len(voices),'rig':'shared articulated SVG','mouth':'actual audio envelope','chapters':chapters}))
