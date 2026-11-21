"""Copy the deployable static site to _site, including all paths relative to index.html."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent


def build(root=ROOT):
    destination = root / '_site'
    if destination.exists():
        shutil.rmtree(destination)
    destination.mkdir()
    for name in ['index.html', 'style.css', 'app.js', 'satellite.js', 'orbit-core.js', 'passes-worker.js',
                 'fleet.json', 'orbits.json', 'orbit-data.json', '.nojekyll', 'README.md', 'LICENSE-satellite-js.md']:
        shutil.copy2(root / name, destination / name)
    shutil.copytree(root / 'assets', destination / 'assets')
    print('Static GitHub Pages site prepared in _site/')
    return destination


if __name__ == '__main__':
    build()
