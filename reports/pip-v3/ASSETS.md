# Pip v3 assets

- Original articulated SVG: `public/brand/pip-rig.svg`, authored in code and embedded with unique IDs per frame. The app and video share its joints. Earlier generated PNG assets are preserved; this revision uses the SVG.
- Local Kokoro `bf_emma` voice: `assets/voice/pip-final/v3-01.wav` through `v3-06.wav`. Metadata: `audio_engine_meta-v3.json` and `pip-performance-v3.json`. Processing uses a 4% pitch lift, slight EQ/compression, -17 LUFS and -1.5dB true peak. No identity cloning or cloud synthesis.
- `assets/v3/app-home.png`, `icici-result.png`, `hdfc-evidence.png`, `axis-result.png`: actual app screenshots captured through authorized browser control. Published rules are real; supplied traveller facts are invented.
- Sanity Knowledge Base and completed live-agent screenshots remain the verified prior captures in `assets/v2/`.
- Six existing quiet UI cues are reused from the bundled asset library, with provenance in the earlier redesign asset report.
- Optional website voice samples are archived under video assets. The website has no speech controls or voice playback.
