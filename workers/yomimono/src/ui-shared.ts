// 管理画面 共通パーツ（CSS / ヘッダ・ナビ / 共通JS）。
// Worker が __BASE__ を env.BASE_PATH に置換して配信する（ベースパス注入）。
// 注: テンプレートリテラル内に ${ とバックティックを入れないこと。JSは文字列連結で書く。

export const CSS = `
  :root { --navy:#1b2c40; --navy2:#243a54; --ink:#1b2330; --muted:#64748b; --line:#e2e8f0; --bg:#f6f8fb; --ok:#16a34a; --warn:#dc2626; --accent:#2563eb; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:'Hiragino Sans','Hiragino Kaku Gothic ProN',system-ui,sans-serif; color:var(--ink); background:var(--bg); line-height:1.7; }
  header { background:var(--navy); color:#fff; padding:16px 24px; }
  .hd { max-width:980px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; }
  header h1 { margin:0; font-size:17px; letter-spacing:.04em; }
  header p { margin:3px 0 0; font-size:11px; color:#aebfd4; }
  .nav a { color:#aebfd4; text-decoration:none; font-size:13px; margin-left:16px; padding-bottom:2px; }
  .nav a.on { color:#fff; border-bottom:2px solid #fff; }
  .nav a:hover { color:#fff; }
  main { max-width:860px; margin:0 auto; padding:24px 16px 80px; }
  .wide { max-width:1100px; }
  .lead { color:var(--muted); font-size:13px; margin:0 0 18px; }
  .step { background:#fff; border:1px solid var(--line); border-radius:14px; padding:20px; margin-bottom:18px; box-shadow:0 1px 2px rgba(16,24,40,.04); }
  .step h2 { margin:0 0 4px; font-size:15px; color:var(--navy); }
  .step .hint { margin:0 0 14px; font-size:12px; color:var(--muted); }
  .num { display:inline-flex; width:22px; height:22px; border-radius:50%; background:var(--navy); color:#fff; font-size:12px; align-items:center; justify-content:center; margin-right:8px; }
  button { font:inherit; cursor:pointer; border:none; border-radius:10px; padding:11px 18px; font-weight:600; }
  .primary { background:var(--navy); color:#fff; }
  .primary:hover { background:var(--navy2); }
  .primary:disabled { background:#9aa7b8; cursor:not-allowed; }
  .ghost { background:#eef2f7; color:var(--ink); }
  .pub { background:var(--ok); color:#fff; }
  .pub:disabled { background:#bbb; cursor:not-allowed; }
  .card { border:1px solid var(--line); border-radius:12px; padding:14px; margin:10px 0; }
  .card.sel { border-color:var(--accent); background:#f0f6ff; }
  .card label { display:flex; gap:10px; align-items:flex-start; cursor:pointer; }
  .card .t { font-weight:700; font-size:14px; }
  .card .s { font-size:13px; color:#374151; margin:4px 0; }
  .card .src a { font-size:11px; color:var(--accent); margin-right:10px; word-break:break-all; }
  .badge { display:inline-block; font-size:11px; background:#eef2f7; color:var(--muted); border-radius:20px; padding:2px 9px; margin-left:6px; }
  .field { margin:10px 0; }
  .field label { display:block; font-size:12px; color:var(--muted); margin-bottom:4px; }
  .field input, .field textarea, .field select { width:100%; padding:9px 11px; border:1px solid var(--line); border-radius:8px; font:inherit; background:#fff; }
  .field textarea { min-height:280px; resize:vertical; font-family:ui-monospace,Menlo,monospace; font-size:13px; line-height:1.6; }
  .viol { background:#fff1f2; border:1px solid #fecaca; color:#991b1b; border-radius:8px; padding:10px 12px; font-size:12px; margin:8px 0; }
  .viol b { display:block; margin-bottom:4px; }
  .done { background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; border-radius:8px; padding:10px 12px; font-size:13px; }
  .done a { color:#166534; }
  .err { background:#fff1f2; border:1px solid #fecaca; color:#991b1b; border-radius:8px; padding:10px 12px; font-size:13px; margin:8px 0; }
  .spin { display:inline-block; width:15px; height:15px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:sp .8s linear infinite; vertical-align:-2px; margin-right:6px; }
  @keyframes sp { to { transform:rotate(360deg); } }
  .row { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
  .meta { font-size:12px; color:var(--muted); }
  [hidden] { display:none; }
  /* hub */
  .hub { display:grid; gap:16px; grid-template-columns:1fr 1fr; }
  .hub a { display:block; text-decoration:none; color:var(--ink); background:#fff; border:1px solid var(--line); border-radius:16px; padding:26px 22px; box-shadow:0 1px 2px rgba(16,24,40,.04); transition:transform .12s, box-shadow .12s, border-color .12s; }
  .hub a:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(16,24,40,.10); border-color:var(--accent); }
  .hub .ic { font-size:30px; }
  .hub h3 { margin:10px 0 6px; font-size:17px; color:var(--navy); }
  .hub p { margin:0; font-size:13px; color:var(--muted); }
  @media (max-width:680px){ .hub { grid-template-columns:1fr; } }
  /* manual editor */
  .split { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media (max-width:820px){ .split { grid-template-columns:1fr; } }
  .editor textarea { min-height:440px; }
  .drop { outline:2px dashed transparent; outline-offset:2px; }
  .drop.over { outline-color:var(--accent); background:#f0f6ff; }
  .preview { border:1px solid var(--line); border-radius:10px; padding:16px 18px; background:#fff; min-height:440px; overflow:auto; }
  .preview h1,.preview h2,.preview h3 { color:var(--navy); line-height:1.35; }
  .preview h2 { font-size:20px; margin:18px 0 8px; }
  .preview h3 { font-size:16px; margin:14px 0 6px; }
  .preview img { max-width:100%; border-radius:8px; margin:8px 0; }
  .preview p { margin:8px 0; }
  .preview code { background:#f1f5f9; padding:1px 5px; border-radius:4px; font-size:13px; }
  .preview ul,.preview ol { padding-left:22px; }
  .preview a { color:var(--accent); }
  .toolbar { display:flex; gap:8px; align-items:center; margin-bottom:8px; flex-wrap:wrap; }
`;

// 共通JS（各ページIIFEの先頭で展開）。BASE はサーバが __BASE__ を注入。
// safeUrl は http(s) に加え、ルート相対(/images/...)も許可（手動プレビューの画像用）。
export const COMMON_JS = `
var BASE="__BASE__";
var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
var safeUrl=function(u){u=String(u==null?'':u).trim();return (/^https?:\\/\\//i.test(u)||/^\\/[a-z0-9._~-]/i.test(u))?u:'#';};
var $=function(id){return document.getElementById(id);};
function api(p,b){return fetch(BASE+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b||{})}).then(function(r){return r.json().then(function(j){if(!r.ok){throw new Error(j&&j.error?j.error:('HTTP '+r.status));}return j;});});}
`;

export function head(title: string): string {
  return (
    '<!doctype html><html lang="ja"><head><meta charset="utf-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1" />' +
    '<title>' +
    title +
    '</title><style>' +
    CSS +
    '</style></head><body>'
  );
}

export function header(active: 'hub' | 'ai' | 'manual'): string {
  const link = (href: string, label: string, key: string) =>
    '<a href="__BASE__' + href + '"' + (active === key ? ' class="on"' : '') + '>' + label + '</a>';
  return (
    '<header><div class="hd"><div><h1>読みもの 作成スタジオ</h1><p>Cor. 記事CMS</p></div>' +
    '<nav class="nav">' +
    link('/', 'ハブ', 'hub') +
    link('/ai', 'AI生成', 'ai') +
    link('/manual', '手動作成', 'manual') +
    '</nav></div></header>'
  );
}

// ページ末尾。COMMON_JS + ページ個別JS を1つのIIFEで包む。
export function tail(pageJs: string): string {
  return '<script>(function(){' + COMMON_JS + pageJs + '})();</script></body></html>';
}
