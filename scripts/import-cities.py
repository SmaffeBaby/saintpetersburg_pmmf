"""Build city directory: python3 scripts/import-cities.py cities500.zip admin1CodesASCII.txt alternateNamesV2.zip.
Sources: https://download.geonames.org/export/dump/ (GeoNames, CC BY 4.0).
"""
import gzip
import json
import sys
import zipfile
from collections import defaultdict
from pathlib import Path

archive, admin_file, names_archive = map(Path, sys.argv[1:4])
out = Path(__file__).resolve().parents[1] / 'server/assets/cities'
out.mkdir(parents=True, exist_ok=True)
regions = {}
for line in admin_file.read_text().splitlines():
    parts = line.split('\t')
    if len(parts) >= 4:
        regions[parts[0]] = (parts[1], parts[3])
countries = defaultdict(list)
wanted = {region[1] for region in regions.values()}
with zipfile.ZipFile(archive) as source:
    for line in source.read('cities500.txt').decode('utf-8').splitlines():
        row = line.split('\t')
        code, feature = row[8], row[7]
        if len(code) != 2 or (feature not in ('PPL', 'PPLC', 'PPLG') and not feature.startswith('PPLA')):
            continue
        region, region_id = regions.get(code + '.' + row[10], ('', ''))
        city = [row[0], row[1], row[3], region, row[10], int(row[14] or 0), region_id]
        countries[code].append(city)
        wanted.add(row[0])
translations = {}
with zipfile.ZipFile(names_archive) as source:
    with source.open('alternateNamesV2.txt') as stream:
        for raw in stream:
            row = raw.decode('utf-8').rstrip('\r\n').split('\t')
            if len(row) < 8 or row[1] not in wanted or row[2] not in ('ru', 'en') or row[6] == '1' or row[7] == '1':
                continue
            key = (row[1], row[2])
            score = (row[4] == '1', row[5] == '1', -len(row[3]))
            if key not in translations or score > translations[key][0]:
                translations[key] = (score, row[3])
def name(geoname_id, lang, fallback=''):
    return translations.get((geoname_id, lang), (None, fallback))[1]
coverage = [0, 0]
for code, cities in countries.items():
    cities.sort(key=lambda city: (-city[5], city[1], city[0]))
    for city in cities:
        region_id = city.pop()
        ru = name(city[0], 'ru')
        city.extend([ru, name(region_id, 'ru'), name(city[0], 'en'), name(region_id, 'en')])
        coverage[0] += bool(ru)
        coverage[1] += 1
    payload = json.dumps(cities, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    (out / (code + '.json.gz')).write_bytes(gzip.compress(payload, mtime=0))
print(f'{coverage[1]} cities, {coverage[0]} with Russian names, {len(countries)} countries/territories; {sum(p.stat().st_size for p in out.glob("*.gz")):,} bytes compressed')
