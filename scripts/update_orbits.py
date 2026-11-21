"""Refresh public CelesTrak records for the fixed satellite list. Python standard library only."""
import concurrent.futures
import datetime as dt
import json
import math
import os
from pathlib import Path
import time
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
FIELDS = ('MEAN_MOTION', 'ECCENTRICITY', 'INCLINATION', 'RA_OF_ASC_NODE', 'ARG_OF_PERICENTER', 'MEAN_ANOMALY', 'BSTAR')


def epoch(row):
    value = dt.datetime.fromisoformat(row['EPOCH'].replace('Z', '+00:00'))
    return value.replace(tzinfo=dt.timezone.utc).timestamp() if value.tzinfo is None else value.timestamp()


def valid(row, allowed):
    try:
        return (isinstance(row, dict) and int(row['NORAD_CAT_ID']) in allowed
                and all(math.isfinite(float(row[key])) for key in FIELDS)
                and float(row['MEAN_MOTION']) > 0
                and 0 <= float(row['ECCENTRICITY']) < 1
                and math.isfinite(epoch(row)))
    except (KeyError, TypeError, ValueError, OverflowError):
        return False


def merge(target, rows, allowed):
    for row in rows:
        if valid(row, allowed):
            ident = int(row['NORAD_CAT_ID'])
            if ident not in target or epoch(row) >= epoch(target[ident]):
                target[ident] = row


def fetch_json(url):
    request = urllib.request.Request(url, headers={'Accept': 'application/json', 'User-Agent': 'Norge-i-bane-GitHub-Pages/1.0'})
    with urllib.request.urlopen(request, timeout=9) as response:
        return json.load(response)


def update(root=ROOT, previous_url=None, fetch=fetch_json):
    seed = json.loads((root / 'orbits.json').read_text())
    allowed = {int(row['NORAD_CAT_ID']) for row in seed}
    rows = {}
    merge(rows, seed, allowed)
    metadata = {}
    try:
        metadata = json.loads((root / 'orbit-data.json').read_text())
        merge(rows, metadata.get('rows', []), allowed)
    except (OSError, ValueError, TypeError):
        metadata = {}
    if previous_url and urllib.parse.urlparse(previous_url).scheme == 'https':
        try:
            previous = fetch(previous_url.rstrip('/') + '/orbit-data.json')
            if isinstance(previous, dict) and isinstance(previous.get('rows'), list):
                merge(rows, previous['rows'], allowed)
                if previous.get('fetchedAt', 0) > metadata.get('fetchedAt', 0):
                    metadata = previous
        except Exception:
            print('Previous publication unavailable; retaining bundled records.')

    def get(ident):
        try:
            result = fetch('https://celestrak.org/NORAD/elements/gp.php?CATNR=' + str(ident) + '&FORMAT=JSON')
            return [row for row in result if valid(row, {ident})] if isinstance(result, list) else []
        except Exception:
            return []

    received = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for batch in pool.map(get, sorted(allowed)):
            received.extend(batch)
    merge(rows, received, allowed)
    now = int(time.time() * 1000)
    count = len({int(row['NORAD_CAT_ID']) for row in received})
    ordered = [rows[int(row['NORAD_CAT_ID'])] for row in seed]
    payload = {'rows': ordered, 'fetchedAt': now if count else metadata.get('fetchedAt', 0),
               'onlineCount': count, 'attemptedAt': now, 'refreshSucceeded': bool(count)}
    for name, value in [('orbits.json', ordered), ('orbit-data.json', payload)]:
        temp = root / (name + '.tmp')
        temp.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n')
        temp.replace(root / name)
    print(f'CelesTrak: received {count}/{len(allowed)} records. Published set retains all {len(ordered)} satellites.')
    return payload


if __name__ == '__main__':
    update(previous_url=os.environ.get('PAGES_BASE_URL'))
