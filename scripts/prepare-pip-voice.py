from pathlib import Path
import array,json,math,subprocess,wave
root=Path(__file__).resolve().parents[1]
project=root/'videos/loungeproof'
meta=json.loads((project/'audio_engine_meta-v3.json').read_text())
output=project/'assets/voice/pip-final'
output.mkdir(parents=True,exist_ok=True)
samples=project/'assets/voice/app-samples';samples.mkdir(exist_ok=True)
voice_filter='asetrate=24960,aresample=24000,atempo=0.96153846,highpass=f=90,equalizer=f=2400:t=q:w=1:g=1.5,acompressor=threshold=0.15:ratio=2:attack=8:release=90,loudnorm=I=-17:TP=-1.5:LRA=7'
results=[]
for voice in meta['voices']:
    target=output/(voice['id']+'.wav')
    subprocess.run(['ffmpeg','-y','-v','error','-i',str(project/voice['path']),'-af',voice_filter,'-ar','24000','-ac','1','-c:a','pcm_s16le',str(target)],check=True)
    with wave.open(str(target)) as f:
        rate=f.getframerate(); data=array.array('h',f.readframes(f.getnframes())); duration=len(data)/rate
    # An envelope from the real audio, sampled at 15Hz. It closes the jaw in pauses.
    window=round(rate/15); rms=[]
    for i in range(0,len(data),window):
        chunk=data[i:i+window]
        energy=math.sqrt(sum((v/32768)**2 for v in chunk)/len(chunk))
        rms.append(round(min(1.25,.16+energy*7),3))
    entry={'id':voice['id'],'path':str(target.relative_to(project)),'duration_s':round(duration,6),'mouthHz':15,'mouth':rms}
    results.append(entry)
    if voice['id'].startswith('pip-'):
        subprocess.run(['ffmpeg','-y','-v','error','-i',str(target),'-c:a','libmp3lame','-b:a','80k',str(samples/(voice['id']+'.mp3'))],check=True)
(project/'pip-performance-v3.json').write_text(json.dumps({'voice':'bf_emma','provider':'local Kokoro','speed':1.10,'pitchSemitones':.679,'filter':voice_filter,'voices':results},indent=2)+'\n')
print(json.dumps({'lines':len(results),'developmentSamples':len(list(samples.glob('*.mp3'))),'videoDuration':sum(v['duration_s'] for v in results if v['id'].startswith('v3-'))}))
