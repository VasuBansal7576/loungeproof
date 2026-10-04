"""Build the slower, problem-first revision from frozen v3 fragments and voice assets."""
from pathlib import Path
import array, json, math, re, shutil, subprocess, wave

ROOT = Path(__file__).resolve().parents[3]
P = ROOT / 'videos/loungeproof'
OUT = P / 'assets/voice/v4-final'
OUT.mkdir(parents=True, exist_ok=True)
new_meta = json.loads((P / 'audio_engine_meta-v4.json').read_text())
old_meta = json.loads((P / 'audio_meta-v3.json').read_text())
old_request = json.loads((P / 'audio_request-v3.json').read_text())
new_request = json.loads((P / 'audio_request-v4.json').read_text())
new_text = {v['id']: v['text'] for v in new_request['lines']}
old_text = {v['id']: v['text'] for v in old_request['lines']}
voices = []
brighten = 'asetrate=24960,aresample=24000,atempo=0.96153846,highpass=f=90,equalizer=f=2400:t=q:w=1:g=1.5,acompressor=threshold=0.15:ratio=2:attack=8:release=90,loudnorm=I=-17:TP=-1.5:LRA=7'

def process(source, name, text, filters):
    target = OUT / (name + '.wav')
    subprocess.run(['ffmpeg','-y','-v','error','-i',str(source),'-af',filters,'-ar','24000','-ac','1','-c:a','pcm_s16le',str(target)],check=True)
    with wave.open(str(target)) as f:
        rate=f.getframerate(); samples=array.array('h',f.readframes(f.getnframes()))
    window=round(rate/15); mouth=[]
    for at in range(0,len(samples),window):
        chunk=samples[at:at+window]
        rms=math.sqrt(sum((v/32768)**2 for v in chunk)/len(chunk))
        mouth.append(round(min(1.25,.16+rms*7),3))
    voices.append({'id':name,'path':str(target.relative_to(P)),'duration_s':round(len(samples)/rate,6),'mouth':mouth,'text':text})

for voice in new_meta['voices']:
    process(P / voice['path'],voice['id'],new_text[voice['id']],brighten+',atempo=0.82')
voices.sort(key=lambda v: 0 if v['id']=='v4-problem' else 1)
for voice in old_meta['voices'][1:]:
    process(P / voice['path'],voice['id'].replace('v3-','v4-'),old_text[voice['id']], 'atempo=0.82,loudnorm=I=-17:TP=-1.5:LRA=7')

def mouth_code(actor, voice):
    return f"""
      const v4Mouth = {json.dumps(voice['mouth'],separators=(',',':'))};
      v4Mouth.forEach((v,i)=>tl.to('{actor} .rig-mouth',{{scaleY:v,duration:1/15,ease:'none'}},i/15));
      tl.to('{actor} .rig-mouth',{{scaleY:.16,duration:.12}}, {voice['duration_s']-.14:.6f});
"""

backup=ROOT/'reports/pip-v4/previous-video-frames'
backup.mkdir(parents=True,exist_ok=True)
frames=P/'compositions/frames'
for i,voice in enumerate(voices[1:],1):
    old_id=f'lpv3-{i:02d}'; new_id=f'lpv4-{i:02d}'
    source=frames/(old_id+'.html')
    if source.exists(): shutil.move(source,backup/source.name)
    s=(backup/(old_id+'.html')).read_text().replace(old_id,new_id)
    old_duration=old_meta['voices'][i-1]['duration_s']
    s=re.sub(r'data-duration="[^"]+"',f'data-duration="{voice["duration_s"]}"',s)
    s=re.sub(r'      const mouth = .*?;\n','',s)
    s=re.sub(r'      mouth\.forEach[^\n]+\n','',s)
    s=re.sub(r"      tl.to\('[^']+ \.rig-mouth',\{scaleY:\.16,duration:\.12\},[^\n]+\n",'',s)
    factor=voice['duration_s']/old_duration
    append=f"""
      const finalRetime={factor:.9f};
      tl.getChildren(false,true,false).forEach(t=>{{const at=t.startTime()*finalRetime;t.duration(t.duration()*finalRetime);t.startTime(at);}});
"""+mouth_code('.'+new_id+'-actor',voice)
    s=s.replace('})();',append+'})();')
    (frames/(new_id+'.html')).write_text(s)

intro=voices[0]
rig=(ROOT/'public/brand/pip-rig.svg').read_text().replace('class="pip-rig"','class="pip-rig lpv4-00-actor"').replace('id="','id="lpv4-00-').replace('url(#','url(#lpv4-00-').replace('<svg ','<svg style="width:100%;height:100%;display:block" ')
template=(P/'scripts/problem-intro.template.txt').read_text()
template=template.replace('__DURATION__',str(intro['duration_s'])).replace('__RIG__',rig).replace('__MOUTH__',mouth_code('.lpv4-00-actor',intro))
(frames/'lpv4-00.html').write_text(template)

titles=['The lounge eligibility problem','Meet Pip','ICICI balance route','HDFC dated terms','Axis exact trip','Sanity + live agent','Proof + scope']
duration=sum(v['duration_s'] for v in voices)
story=f'''---
format: 1920x1080
duration: {duration:.6f}s
message: "Know which lounge rule applies before reaching the desk"
arc: Problem → solution → guide → examples → evidence → verification
audience: cardholders and hackathon reviewers
mode: autonomous
music: none
captions: skipped; key facts accompany narration
---

## Revision direction

Begin with the traveller's problem, the conditions hidden behind a lounge perk and conflicting bank pages. Explain LoungeProof's job before demonstrating it. New opening/guide voice is local bf_emma at 0.82; existing example narration is pitch-preserved at 82% speed. Articulation and picture timing follow the slower audio. Website remains silent.
'''
chapters=[];offset=0
for i,(title,voice) in enumerate(zip(titles,voices),1):
    file=f'compositions/frames/lpv4-{i-1:02d}.html'
    story+=f'\n## Frame {i} — {title}\n\n- status: animated\n- src: {file}\n- duration: {voice["duration_s"]}s\n- transition_in: cut\n- scene: {title}\n- voiceover: {json.dumps(voice["text"])}\n- blueprint: compose\n\n'+ ('Promise card reveals spend, date, quota and terminal conditions. The question becomes which rule applies to this trip. Close with the exact-card, dated-rule and bank-evidence path. Pip reacts and points; no app screenshot appears until the next scene.\n' if i==1 else 'Preserve the verified v3 visual states, captures and joint performance, retimed to the slower voice.\n')
    chapters.append({'title':title,'start':round(offset,6)});offset+=voice['duration_s']
(P/'STORYBOARD-v4.md').write_text(story)
(P/'SCRIPT-v4.md').write_text('# LoungeProof, problem first\n\nSame local synthetic character voice, slower delivery. No website speech.\n\n'+'\n\n'.join('## '+t+'\n\n'+v['text'] for t,v in zip(titles,voices))+'\n')
meta={'bgm':None,'voices':[{'frame':i,'id':v['id'],'path':v['path'],'duration_s':v['duration_s'],'words':[]} for i,v in enumerate(voices,1)],'sfx':[]}
for cue in old_meta['sfx']:
    c=dict(cue);old_i=c['frame'];new_d=voices[old_i]['duration_s'];old_d=old_meta['voices'][old_i-1]['duration_s'];c.update(frame=old_i+1,offset_s=round(c['offset_s']*new_d/old_d,6));meta['sfx'].append(c)
(P/'audio_meta-v4.json').write_text(json.dumps(meta,indent=2)+'\n')
(P/'pip-performance-v4.json').write_text(json.dumps({'voice':'bf_emma','newNarrationSpeed':.82,'reusedNarrationTempo':.82,'mouthHz':15,'voices':voices},indent=2)+'\n')
(ROOT/'src/tour-chapters.json').write_text(json.dumps(chapters,indent=2)+'\n')
motion=json.loads((P/'index.motion.json').read_text().replace('lpv3-','lpv4-'))
motion['duration']=duration;motion['assertions']=[a for a in motion['assertions'] if a['kind']!='appearsBy']
motion['assertions'].insert(0,{'kind':'appearsBy','selector':'.lpv4-00-title','bySec':.6})
(P/'index.motion.json').write_text(json.dumps(motion,indent=2)+'\n')
print(json.dumps({'duration':duration,'introDuration':intro['duration_s'],'frames':len(voices),'chapters':chapters}))
