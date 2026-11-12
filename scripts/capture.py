#!/usr/bin/env python3
"""Capture an evidence bundle from a live page, for JS-heavy sites (GSAP, WebGL, canvas).

Plain fetch sees an empty shell on these sites. This script loads the page in headless
Chromium, instruments it, and writes files the agent can read as text:

  captures/<slug>/report.json      stack, motion libraries, WebGL/shaders, fonts, colors, a11y, motion log
  captures/<slug>/stylesheets.txt  authored CSS (same-origin and CORS-readable)
  captures/<slug>/screens/*.png    viewport screenshots at scroll positions (keep out of the repo)

What report.json is evidence for:
  inspected -> values read from the live page (computed styles, GSAP tween vars, shader source, CSS)
  rendered pixel samples are what the screen showed, not shader constants; label them that way.

Usage:
  python3 scripts/capture.py URL [--out captures] [--scroll-steps 6] [--hover N] [--no-screens]
Requires: pip install playwright && playwright install chromium
Captures contain third-party pages: add `captures/` to .gitignore.
"""
import argparse, json, re, sys, time
from pathlib import Path
from urllib.parse import urlparse

INIT_JS = r"""
(() => {
  const W = window.__cap = {webgl: [], shaders: [], canvases2d: 0, motion: [], errors: []};
  const wrap = (proto, kind) => {
    if (!proto || !proto.getContext) return;
    const orig = proto.getContext;
    proto.getContext = function (type, ...a) {
      const ctx = orig.call(this, type, ...a);
      if (/webgl/i.test(type)) W.webgl.push({type, w: this.width, h: this.height});
      else if (type === '2d') W.canvases2d++;
      return ctx;
    };
  };
  wrap(HTMLCanvasElement.prototype);
  for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!C) continue;
    const o = C.prototype.shaderSource;
    C.prototype.shaderSource = function (sh, src) {
      if (W.shaders.length < 12) W.shaders.push(String(src).split('\n').filter(l => !/^\s*(precision |#define (attribute|varying|texture2D)|#version)/.test(l)).join('\n').trim().slice(0, 4000));
      return o.call(this, sh, src);
    };
  }
  // library-agnostic motion log: style/class mutations on elements
  const start = performance.now();
  const seen = new Map();
  const mo = new MutationObserver(list => {
    for (const m of list) {
      const el = m.target; if (!(el instanceof Element)) continue;
      let key = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
        (el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '');
      const rec = seen.get(key) || {el: key, changes: 0, attr: m.attributeName, first: null, last: null};
      rec.changes++;
      if (m.attributeName === 'style') {
        const v = el.getAttribute('style') || '';
        if (!rec.first) rec.first = v.slice(0, 200);
        rec.last = v.slice(0, 200);
      }
      seen.set(key, rec);
    }
  });
  document.addEventListener('DOMContentLoaded', () =>
    mo.observe(document.documentElement, {attributes: true, subtree: true, attributeFilter: ['style', 'class']}));
  W.motionLog = () => [...seen.values()].sort((a, b) => b.changes - a.changes).slice(0, 25);
})();
"""

PAGE_JS = r"""
() => {
  const out = {};
  const g = window;
  const ver = (o) => (o && (o.version || o.VERSION || o.REVISION)) || null;
  out.libraries = {
    gsap: g.gsap ? {version: ver(g.gsap)} : null,
    ScrollTrigger: g.ScrollTrigger ? true : null,
    three: g.THREE ? {revision: g.THREE.REVISION} : null,
    lenis: g.Lenis ? true : null,
    locomotive: g.LocomotiveScroll ? true : null,
    barba: g.barba ? true : null,
    pixi: g.PIXI ? true : null,
    matter: g.Matter ? true : null,
    p5: g.p5 ? true : null,
    framer_motion_hint: !!document.querySelector('[data-framer-name],[data-projection-id]'),
    react: !!document.querySelector('[data-reactroot]') || !!g.__REACT_DEVTOOLS_GLOBAL_HOOK__,
    next: !!g.__NEXT_DATA__, nuxt: !!g.__NUXT__,
    webflow: !!g.Webflow, framer: !!document.querySelector('meta[name=generator][content*=Framer]'),
  };
  for (const k of Object.keys(out.libraries)) if (!out.libraries[k]) delete out.libraries[k];

  // GSAP live dump
  if (g.gsap && g.gsap.globalTimeline) {
    const name = (t) => { try { return (t.targets && t.targets().slice(0, 2).map(e => e.tagName ? e.tagName.toLowerCase() + (e.className && e.className.baseVal === undefined ? '.' + String(e.className).split(' ')[0] : '') : String(e).slice(0, 30)))} catch (e) { return [] } };
    out.gsap_tweens = g.gsap.globalTimeline.getChildren(true, true, false).filter(t => { try { const tg = t.targets ? t.targets() : []; return tg.length && tg.every(e => typeof e !== 'function'); } catch (e) { return false } }).slice(0, 40).map(t => ({
      targets: name(t), duration: t.duration && t.duration(), ease: t.vars && (typeof t.vars.ease === 'string' ? t.vars.ease : 'fn'),
      vars: Object.fromEntries(Object.entries(t.vars || {}).filter(([k, v]) => ['string', 'number', 'boolean'].includes(typeof v)).slice(0, 12)),
    }));
  }
  if (g.ScrollTrigger && g.ScrollTrigger.getAll) {
    out.scroll_triggers = g.ScrollTrigger.getAll().slice(0, 30).map(s => ({
      trigger: s.trigger && s.trigger.tagName ? s.trigger.tagName.toLowerCase() + (s.trigger.id ? '#' + s.trigger.id : '') : null,
      start: s.vars.start, end: s.vars.end, scrub: s.vars.scrub, pin: !!s.vars.pin,
    }));
  }
  // bundled GSAP: elements carry _gsap
  const gs = [];
  document.querySelectorAll('*').forEach(el => { if (el._gsap && (el._gsap.x != null || el._gsap.y != null || el._gsap.rotation != null || el._gsap.opacity != null) && gs.length < 25) gs.push({
    el: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + el.classList[0] : ''),
    x: el._gsap.x, y: el._gsap.y, rotation: el._gsap.rotation, scale: el._gsap.scaleX, opacity: el._gsap.opacity }); });
  if (gs.length) out.gsap_element_state = gs;

  // fonts
  const fams = new Map();
  const seenEls = Array.from(document.querySelectorAll('body *')).slice(0, 1500);
  for (const el of seenEls) { if (!el.childNodes.length) continue;
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!hasText) continue;
    const cs = getComputedStyle(el); const k = cs.fontFamily + ' | ' + cs.fontSize + ' | ' + cs.fontWeight;
    fams.set(k, (fams.get(k) || 0) + 1); }
  out.type_usage = [...fams.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, n]) => ({style: k, count: n}));
  out.font_faces = [...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status).slice(0, 15);

  // colors: computed, weighted by area
  const acc = new Map();
  const toHex = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).map(Number);
    if (p.length > 3 && p[3] === 0) return null; if (p.some(isNaN)) return null;
    return '#' + p.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase(); };
  for (const el of seenEls.concat([document.body])) { const r = el.getBoundingClientRect(); const area = Math.min(r.width * r.height, 2e6);
    if (area < 100) continue; const cs = getComputedStyle(el);
    for (const [prop, w] of [['backgroundColor', 1], ['color', 0.15], ['borderTopColor', 0.05]]) {
      const h = toHex(cs[prop]); if (h) acc.set(h, (acc.get(h) || 0) + area * w); } }
  out.computed_colors = [...acc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([h]) => h);

  // CSS custom properties on :root
  const vars = {};
  const rs = getComputedStyle(document.documentElement);
  for (const sheet of document.styleSheets) { let rules; try { rules = sheet.cssRules } catch (e) { continue }
    for (const r of rules) if (r.style && /^(:root|html|body)$/.test(r.selectorText || '')) for (const p of r.style)
      if (p.startsWith('--') && Object.keys(vars).length < 40) vars[p] = rs.getPropertyValue(p).trim().slice(0, 60); }
  out.css_variables = vars;

  // shadows / radii / borders
  const sh = new Map(), rad = new Map();
  for (const el of seenEls) { const cs = getComputedStyle(el);
    if (cs.boxShadow !== 'none') sh.set(cs.boxShadow.slice(0, 120), (sh.get(cs.boxShadow.slice(0, 120)) || 0) + 1);
    if (cs.borderRadius !== '0px') rad.set(cs.borderRadius, (rad.get(cs.borderRadius) || 0) + 1); }
  out.box_shadows = [...sh.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([v, n]) => ({value: v, count: n}));
  out.radii = [...rad.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([v, n]) => ({value: v, count: n}));

  // keyframes and transitions in authored CSS
  const kf = [];
  for (const sheet of document.styleSheets) { let rules; try { rules = sheet.cssRules } catch (e) { continue }
    for (const r of rules) { if (r.type === 7 && kf.length < 15) kf.push(r.name); } }
  out.css_keyframes = kf;

  // accessibility
  const lum = (h) => { const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const h = toHex(getComputedStyle(e).backgroundColor); if (h) return h; } return '#FFFFFF'; };
  const lowc = [];
  for (const el of seenEls) { if (lowc.length >= 8) break; const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!hasText) continue;
    const fg = toHex(getComputedStyle(el).color); if (!fg) continue; const bg = bgOf(el); const r = ratio(fg, bg);
    const fs = parseFloat(getComputedStyle(el).fontSize); const need = fs >= 24 ? 3 : 4.5;
    if (r < need) lowc.push({el: el.tagName.toLowerCase() + (el.classList.length ? '.' + el.classList[0] : ''), fg, bg, ratio: +r.toFixed(2), text: el.textContent.trim().slice(0, 30)}); }
  const small = [], noOutline = [];
  document.querySelectorAll('a,button,input,select,textarea,[role=button],[tabindex]').forEach(el => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    if (r.width && r.height && (r.width < 24 || r.height < 24) && small.length < 8) small.push({el: el.tagName.toLowerCase() + (el.classList.length ? '.' + el.classList[0] : ''), w: Math.round(r.width), h: Math.round(r.height)});
    if ((cs.outlineStyle === 'none' || cs.outlineWidth === '0px') && noOutline.length < 8) noOutline.push(el.tagName.toLowerCase() + (el.classList.length ? '.' + el.classList[0] : '')); });
  out.a11y = {
    low_contrast_text: lowc, small_targets_under_24px: small, outline_removed_on_interactive: noOutline,
    horizontal_overflow: document.documentElement.scrollWidth > innerWidth + 1,
    scroll_width: document.documentElement.scrollWidth, viewport_width: innerWidth,
    lang: document.documentElement.lang || null,
    images_without_alt: document.querySelectorAll('img:not([alt])').length,
    viewport_meta: (document.querySelector('meta[name=viewport]') || {}).content || null,
  };
  out.title = document.title;
  out.page_height = document.documentElement.scrollHeight;
  return out;
}
"""

def slugify(url):
    p = urlparse(url); s = (p.netloc + p.path).strip('/')
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:60] or 'page'

def anim_probe(page):
    """Reduced-motion check: does the page's CSS animation change under prefers-reduced-motion?"""
    return page.evaluate("() => document.getAnimations().filter(a => a.playState==='running').length")

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('url'); ap.add_argument('--out', default='captures')
    ap.add_argument('--scroll-steps', type=int, default=6)
    ap.add_argument('--hover', type=int, default=3, help='hover this many interactive elements and log what changes')
    ap.add_argument('--no-screens', action='store_true')
    ap.add_argument('--wait', type=float, default=2.5, help='seconds to settle after load')
    ap.add_argument('--viewport', default='1440x900')
    a = ap.parse_args()
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('playwright not installed: pip install playwright && playwright install chromium'); return 2
    vw, vh = map(int, a.viewport.split('x'))
    out = Path(a.out) / slugify(a.url); (out / 'screens').mkdir(parents=True, exist_ok=True)
    report = {'url': a.url, 'captured': time.strftime('%Y-%m-%d'), 'viewport': a.viewport, 'notes': []}
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = b.new_context(viewport={'width': vw, 'height': vh})
        ctx.add_init_script(INIT_JS)
        page = ctx.new_page()
        sheets, console_err, failed = {}, [], []
        page.on('console', lambda m: console_err.append(m.text[:200]) if m.type == 'error' and len(console_err) < 8 else None)
        page.on('requestfailed', lambda r: failed.append(r.url[:120]) if len(failed) < 8 else None)
        page.on('response', lambda r: sheets.__setitem__(r.url, r) if 'text/css' in (r.headers.get('content-type') or '') else None)
        try:
            resp = page.goto(a.url, wait_until='load', timeout=45000)
            report['status'] = resp.status if resp else None
        except Exception as e:
            report['notes'].append(f'goto failed: {str(e)[:200]}'); report['status'] = None
            (out / 'report.json').write_text(json.dumps(report, indent=2)); print(json.dumps(report, indent=2)); b.close(); return 1
        page.wait_for_timeout(int(a.wait * 1000))
        if report['status'] and report['status'] >= 400 or 'just a moment' in (page.title() or '').lower():
            report['notes'].append('page looks blocked (bot wall or error); report may describe the block page, not the site')

        report.update(page.evaluate(PAGE_JS))
        report['webgl'] = page.evaluate('window.__cap.webgl'); report['shaders'] = page.evaluate('window.__cap.shaders')
        report['canvas2d_count'] = page.evaluate('window.__cap.canvases2d')
        report['canvases'] = page.evaluate("() => [...document.querySelectorAll('canvas')].slice(0,6).map(c=>({w:c.width,h:c.height,cls:c.className||null}))")
        report['running_animations_at_load'] = anim_probe(page)

        # scroll sweep with real wheel input; record scroll-driven change
        total = page.evaluate('document.documentElement.scrollHeight'); steps = max(1, a.scroll_steps)
        step_px = max(200, min(vh, (total - vh) // steps if total > vh else 0)) if total > vh else 0
        scroll_log = []
        for i in range(steps if step_px else 0):
            page.mouse.move(vw / 2, vh / 2); page.mouse.wheel(0, step_px); page.wait_for_timeout(700)
            y = page.evaluate('scrollY'); scroll_log.append(y)
            if not a.no_screens: page.screenshot(path=str(out / 'screens' / f'scroll-{i+1:02d}.png'))
        report['scroll_positions'] = scroll_log
        report['scroll_moved'] = bool(scroll_log and scroll_log[-1] > 0)
        report['motion_log'] = page.evaluate('window.__cap.motionLog()')
        if a.hover:
            page.evaluate('scrollTo(0,0)'); page.wait_for_timeout(400)
            targets = page.query_selector_all('a,button,[role=button],.card,[class*=card],[class*=item]')
            hov = []
            for el in targets[:40]:
                if len(hov) >= a.hover: break
                try:
                    if not el.is_visible(): continue
                    before = el.evaluate("e=>{const c=getComputedStyle(e);return [c.transform,c.backgroundColor,c.boxShadow,c.color,c.opacity]}")
                    el.hover(timeout=1500); page.wait_for_timeout(500)
                    after = el.evaluate("e=>{const c=getComputedStyle(e);return [c.transform,c.backgroundColor,c.boxShadow,c.color,c.opacity]}")
                    names = ['transform', 'background', 'box-shadow', 'color', 'opacity']
                    diff = {n: [x, y] for n, x, y in zip(names, before, after) if x != y}
                    hov.append({'el': el.evaluate("e=>e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:'')"), 'changed': diff or 'no computed change'})
                except Exception: continue
            report['hover_probe'] = hov
        # reduced motion
        page.emulate_media(reduced_motion='reduce'); page.wait_for_timeout(500)
        report['running_animations_reduced_motion'] = anim_probe(page)
        page.emulate_media(reduced_motion='no-preference')
        # rendered pixel sample (what was on screen, NOT shader constants)
        if report['webgl'] and not a.no_screens:
            try:
                from PIL import Image
                page.evaluate('scrollTo(0,0)'); page.wait_for_timeout(600)
                shot = out / 'screens' / 'top.png'; page.screenshot(path=str(shot))
                im = Image.open(shot).convert('RGB').resize((6, 4))
                report['rendered_pixel_grid_6x4'] = ['#%02X%02X%02X' % im.getpixel((x, y)) for y in range(4) for x in range(6)]
                report['notes'].append('rendered_pixel_grid is sampled from a screenshot (rendered blend); do not report it as a shader constant')
            except Exception as e:
                report['notes'].append(f'pixel sample skipped: {e}')
        elif not a.no_screens:
            page.evaluate('scrollTo(0,0)'); page.wait_for_timeout(300); page.screenshot(path=str(out / 'screens' / 'top.png'))

        # CSS text
        css_out = []
        for u, r in list(sheets.items())[:15]:
            try: css_out.append(f'/* {u} */\n' + r.text()[:60000])
            except Exception: css_out.append(f'/* {u} (unreadable) */')
        inline = page.evaluate("() => [...document.querySelectorAll('style')].map(s=>s.textContent.slice(0,60000))")
        css_out += [f'/* inline <style> */\n{s}' for s in inline]
        (out / 'stylesheets.txt').write_text('\n\n'.join(css_out), encoding='utf-8')
        report['stylesheets'] = len(css_out)
        report['console_errors'] = console_err; report['failed_requests'] = failed
        b.close()

    # verdict hints the agent can paste into evidence
    r = report
    r['evidence_hint'] = {
        'tokens': 'inspected' if r.get('computed_colors') else 'inferred',
        'palette': 'inspected' if r.get('computed_colors') and not r['notes'] else 'inferred',
        'stack': 'inspected' if (r.get('libraries') or r.get('webgl')) else 'inferred',
        'interactions': 'inspected' if (r.get('gsap_tweens') or r.get('scroll_triggers') or r.get('motion_log') or r.get('hover_probe')) else 'inferred',
        'caveat': 'Hints only. A bot wall, cookie overlay or WebGL-less rendering lowers them. Read screens/ before claiming inspected.',
    }
    (out / 'report.json').write_text(json.dumps(r, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'wrote {out}/report.json')
    print(json.dumps({k: r.get(k) for k in ('title', 'status', 'libraries', 'webgl', 'scroll_moved', 'evidence_hint')}, indent=2, ensure_ascii=False))
    return 0

if __name__ == '__main__':
    sys.exit(main())
