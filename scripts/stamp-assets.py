#!/usr/bin/env python3
"""Cache-bust local assets with ?v=<version> so each deploy gets past Cloudflare's 4 h edge cache.
Usage: scripts/stamp-assets.py 1.0.76   (run by write-version.sh). Idempotent: replaces any old ?v=."""
import re, sys, glob, os
v = sys.argv[1]
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
V = r'(?:\?v=[\w.\-]*)?'
def sub(path, pattern, repl):
    s = open(path).read(); n = re.sub(pattern, repl, s, flags=re.M); open(path, 'w').write(n)
# HTML: local <script src> and <link href> to js/css/manifest (skip http(s) and //)
for h in glob.glob('*.html'):
    sub(h, r'((?:src|href)=")(?!https?:|//|#|mailto:)([^"?]+\.(?:js|css|webmanifest|json))' + V + '"', r'\g<1>\g<2>?v=' + v + '"')
# Service worker registration stays at the plain '/sw.js': the shared hub embed also registers '/sw.js',
# and two different script URLs would make the registration flip-flop on every page load.
# sw.js itself changes every release (CACHE name), and page assets are ?v-stamped, so the page is fresh either way.
for f in ('app.js', 'boot.js'):
    sub(f, r"register\('/sw\.js" + V + "'", "register('/sw.js'")
# Web Worker URL and its importScripts
sub('app.js', r"new Worker\('worker\.js" + V + "'\\)", "new Worker('worker.js?v=" + v + "')")
sub('worker.js', r"importScripts\('algorithm\.js" + V + "'\\)", "importScripts('algorithm.js?v=" + v + "')")
# sw.js precache: every local script referenced by index.html, stamped, plus the static shell
scripts = re.findall(r'<script src="(?!https?:|//)([^"?]+\.js)', open('index.html').read())
pre = ['/', '/offline.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']
pre += ['/' + s.lstrip('/') + '?v=' + v for s in scripts + ['worker.js']]
sub('sw.js', r"^const PRE = \[.*\];", "const PRE = [" + ", ".join("'" + p + "'" for p in dict.fromkeys(pre)) + "];")
print('stamped ?v=' + v + ' (' + str(len(scripts)) + ' scripts)')
