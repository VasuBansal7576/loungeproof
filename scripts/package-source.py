"""Package the runnable demo and evidence, excluding local credentials/runtime files."""
from pathlib import Path
import json, os, re, zipfile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'LoungeProof-source.zip'
SKIP_DIRS = {'node_modules', 'dist', '.git', '.sanity', '.hyperframes', '__pycache__', 'sources-capture', 'capture', 'snapshots', 'private', 'previous-ui', 'previous-video-frames'}
SKIP_FILES = {'context-token-setup.jpg', 'LoungeProof-source.zip.pending'}


def main():
    required = ROOT / 'public/walkthrough.mp4'
    if not required.is_file():
        raise SystemExit('Render and stage the walkthrough before packaging.')
    secrets = []
    env = ROOT / '.env'
    if env.is_file():
        for line in env.read_text().splitlines():
            key, sep, value = line.partition('=')
            if sep and re.search(r'TOKEN|KEY|SECRET|PASSWORD', key):
                secret = value.strip().strip('\"\'').encode()
                if len(secret) >= 16:
                    secrets.append(secret)
    files = []
    for base, dirs, names in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(('.venv', 'work-'))]
        for name in names:
            path = Path(base) / name
            rel = path.relative_to(ROOT)
            if name in SKIP_FILES or name.endswith(('.zip', '.log', '.pyc')):
                continue
            if name.startswith('.env') and name != '.env.example':
                continue
            if path.suffix == '.mp4' and rel != Path('public/walkthrough.mp4'):
                continue
            if path.is_symlink():
                continue
            data = path.read_bytes()
            if any(secret in data for secret in secrets):
                raise SystemExit('Credential-content scan failed; no archive written.')
            files.append((path, rel))
    pending = OUTPUT.with_suffix('.zip.pending')
    with zipfile.ZipFile(pending, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for path, rel in sorted(files):
            archive.write(path, Path('loungeproof') / rel)
    with zipfile.ZipFile(pending) as archive:
        if archive.testzip() is not None:
            raise SystemExit('Archive integrity check failed.')
        for item in archive.infolist():
            if any(secret in archive.read(item) for secret in secrets):
                raise SystemExit('Archive credential scan failed.')
    os.replace(pending, OUTPUT)
    print(json.dumps({'archive': OUTPUT.name, 'files': len(files), 'bytes': OUTPUT.stat().st_size, 'credentialsExcluded': True, 'integrityPassed': True, 'tourIncluded': True}))


if __name__ == '__main__':
    main()
