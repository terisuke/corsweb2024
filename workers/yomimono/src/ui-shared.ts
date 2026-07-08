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
  .preview pre { background:#0f172a; color:#e2e8f0; padding:12px 14px; border-radius:8px; overflow:auto; font-size:13px; line-height:1.55; }
  .preview pre code { background:none; color:inherit; padding:0; }
  .preview ul,.preview ol { padding-left:22px; }
  .preview a { color:var(--accent); }
  .preview blockquote { margin:10px 0; padding:6px 14px; border-left:3px solid var(--line); color:var(--muted); }
  .preview blockquote p { margin:4px 0; }
  .preview hr { border:none; border-top:1px solid var(--line); margin:16px 0; }
  .toolbar { display:flex; gap:8px; align-items:center; margin-bottom:8px; flex-wrap:wrap; }
  /* 非エンジニア向けUI改善キット */
  .tb-btn { background:#eef2f7; color:var(--ink); padding:6px 11px; font-size:13px; font-weight:600; border-radius:8px; }
  .tb-btn:hover { background:#e0e7f1; }
  .tb-btn b { font-weight:700; }
  .advanced > summary, .help > summary { cursor:pointer; font-size:12px; color:var(--muted); user-select:none; }
  .advanced { margin-top:12px; }
  .help { margin-top:14px; }
  .help-body { font-size:12px; color:var(--muted); margin-top:8px; line-height:1.7; }
  .help-body ul { margin:6px 0; padding-left:18px; }
  .help-body code { background:#f1f5f9; padding:1px 5px; border-radius:4px; font-size:12px; }
  .draft-bar { background:#fffbeb; border:1px solid #fde68a; color:#92400e; border-radius:8px; padding:10px 12px; margin-bottom:12px; display:flex; gap:8px; align-items:center; font-size:13px; flex-wrap:wrap; }
  .draft-bar button { padding:5px 10px; font-size:12px; }
  /* .draft-bar の display:flex は [hidden]{display:none} より後に定義されるため
     specificity で hidden が負ける。属性セレクタを併用して hidden を優先する。 */
  .draft-bar[hidden] { display:none; }
`;

// 共通JS（各ページIIFEの先頭で展開）。BASE はサーバが __BASE__ を注入。
// safeUrl は http(s) に加え、ルート相対(/images/...)も許可（手動プレビューの画像用）。
export const COMMON_JS = `
var BASE="__BASE__";
var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
var safeUrl=function(u){u=String(u==null?'':u).trim();return (/^https?:\\/\\//i.test(u)||/^\\/[a-z0-9_~-]/i.test(u))?u:'#';};
var $=function(id){return document.getElementById(id);};
function api(p,b){return fetch(BASE+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b||{})}).then(function(r){return r.json().then(function(j){if(!r.ok){throw new Error(j&&j.error?j.error:('HTTP '+r.status));}return j;});});}
// 長時間API（収集/生成）用: 本文は「空白ハートビート + 改行 + 最終JSON」。最終行をparse。
function apiLong(p,b){return fetch(BASE+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b||{})}).then(function(r){return r.text().then(function(t){var lines=String(t).split('\\n').filter(function(s){return s.trim();});var last=lines.length?lines[lines.length-1]:'';var j;try{j=JSON.parse(last);}catch(e){throw new Error('応答の解析に失敗しました（時間がかかりすぎた可能性）');}if(j&&j.error)throw new Error(j.error);return j;});});}
`;

function escHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string);
}

// 属性値用エスケープ（escHtml に加え " を &quot; に）。ツールバーの title 属性等に使用。
function escAttr(s: string): string {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  );
}

// HTML id / data-* 識別子として安全な字面か検証（注入・壊れた属性値を防ぐ）。
// prefix/kind 等、DOM id や data-md 属性に展開される値のみに適用（表示テキストは対象外）。
const ID_RE = /^[a-zA-Z_][a-zA-Z0-9_-]*$/;
function assertId(value: string, name: string): void {
  if (!ID_RE.test(value)) {
    throw new Error('ui-shared: 無効な ' + name + ' 識別子です: "' + value + '"');
  }
}

export function head(title: string): string {
  return (
    '<!doctype html><html lang="ja"><head><meta charset="utf-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1" />' +
    '<title>' +
    escHtml(title) +
    '</title><style>' +
    CSS +
    '</style></head><body>'
  );
}

export function header(active: 'hub' | 'ai' | 'manual' | 'manual-news' | 'manual-cases'): string {
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

// === 非エンジニア向けUI改善キット（ui-manual / ui-manual-news / ui-manual-cases 共通） ===
// ツールバーのボタン群。data-md 属性で insertMarkdown の kind を指定する。
// 画像ボタンは各ページで独自ロジック（アップロード）を持つためここには含めない。
export function toolbarButtonsHtml(): string {
  const btn = (kind: string, label: string, title: string): string => {
    // kind は data-md 属性に展開され JS の dispatch で比較される識別子。ID_RE で厳密検証。
    assertId(kind, 'kind');
    // title は表示用ツールチップ（日本語）なので HTML 属性としてエスケープ。
    return (
      '<button type="button" class="tb-btn" data-md="' +
      kind +
      '" title="' +
      escAttr(title) +
      '">' +
      label +
      '</button>'
    );
  };
  return (
    btn('bold', '<b>B</b>', '太字') +
    btn('h2', '大見出し', '大見出し（節見出し）') +
    btn('h3', '小見出し', '小見出し') +
    btn('link', 'リンク', 'リンク') +
    btn('ul', '箇条書き', '箇条書きリスト') +
    btn('ol', '番号リスト', '番号リスト') +
    btn('quote', '引用', '引用') +
    btn('hr', '区切り線', '区切り線')
  );
}

// 下書き復元バー（prefix はページの id 接頭辞。例: 'm'）。
export function draftBarHtml(prefix: string): string {
  // prefix はDOM id に展開されるため ID_RE で検証（不正文字で id が壊れるのを防ぐ）。
  assertId(prefix, 'prefix');
  return (
    '<div id="' + prefix + '_draftBar" class="draft-bar" hidden>' +
    '<span>入力中の下書きがあります</span>' +
    '<button type="button" class="ghost" id="' + prefix + '_restore">復元する</button>' +
    '<button type="button" class="ghost" id="' + prefix + '_discard">破棄</button>' +
    '</div>'
  );
}

// 共通UI改善JS（各ページの pageJs 先頭に連結して tail() で包む。COMMON_JS の esc/safeUrl/$/api を利用）。
// 注: テンプレートリテラル内に ${ とバックティックを入れないこと。バックスラッシュは2重化。
export const UI_KIT_JS = `
  // --- titleToSlug: タイトルから URL slug を自動生成 ---
  // カナ→ローマ字（簡易）→ ASCII のみ抽出 → ハイフン結合 → 空ならタイムスタンプ fallback。
  // 非エンジニアは slug 概念に触れず、タイトル入力で URL が決まる。
  var SLUG_H='あいうえおぁぃぅぇぉかきくけこさしすせそたちつてとっなにぬねのはひふへほまみむめもやゃゆゅよょらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ';
  var SLUG_K='アイウエオァィゥェォカキクケコサシスセソタチツテトッナニヌネノハヒフヘホマミムメモヤャユュヨョラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ';
  var SLUG_R=['a','i','u','e','o','a','i','u','e','o','ka','ki','ku','ke','ko','sa','shi','su','se','so','ta','chi','tsu','te','to','tsu','na','ni','nu','ne','no','ha','hi','fu','he','ho','ma','mi','mu','me','mo','ya','ya','yu','yu','yo','yo','ra','ri','ru','re','ro','wa','wo','n','ga','gi','gu','ge','go','za','ji','zu','ze','zo','da','ji','zu','de','do','ba','bi','bu','be','bo','pa','pi','pu','pe','po'];
  function titleToSlug(title){
    var map={};
    for(var i=0;i<SLUG_H.length;i++){ map[SLUG_H.charAt(i)]=SLUG_R[i]; map[SLUG_K.charAt(i)]=SLUG_R[i]; }
    var s=String(title==null?'':title).trim().toLowerCase();
    s=s.replace(/[あ-んァ-ヶ]/g,function(ch){ return map[ch]||''; });
    s=s.replace(/[^a-z0-9\\s-]/g,'');
    s=s.replace(/[\\s-]+/g,'-').replace(/^-+|-+$/g,'');
    // SLUG_RE は {3,80} なので 3文字未満の slug（例: 「AI導入」→「ai」）は受理されない。
    // 空or短すぎる場合はタイムスタンプでパディングし、3文字以上を保証する。
    if(s.length<3){
      var d=new Date(),p=function(n){return (n<10?'0':'')+n;};
      var ts=d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds());
      s = s ? s+'-'+ts : 'post-'+ts;
    }
    if(s.length>80){ s=s.slice(0,80).replace(/-[a-z0-9]*$/,'')||s.slice(0,80); }
    return s;
  }
  // --- insertMarkdown: textarea の選択範囲に Markdown 記号を挿入 ---
  // インライン(kind=bold/link)は選択範囲を記号で囲む。ブロック(kind=h2/h3/ul/ol/quote)は行頭に prefix。
  // kind=hr はカーソル位置に区切り線を挿入。挿入後に input イベントを発火（プレビュー・下書き保存が連動）。
  function insertMarkdown(ta,kind){
    var s=ta.selectionStart,e=ta.selectionEnd,val=ta.value;
    var before=val.slice(0,s),sel=val.slice(s,e),after=val.slice(e);
    var prefix='',suffix='',block=false;
    if(kind==='bold'){prefix='**';suffix='**';}
    else if(kind==='h2'){block=true;prefix='## ';}
    else if(kind==='h3'){block=true;prefix='### ';}
    else if(kind==='link'){prefix='[';suffix='](https://example.com)';}
    else if(kind==='ul'){block=true;prefix='- ';}
    else if(kind==='ol'){block=true;prefix='1. ';}
    else if(kind==='quote'){block=true;prefix='> ';}
    else if(kind==='hr'){
      ta.value=before+'\\n---\\n'+after;
      ta.selectionStart=ta.selectionEnd=before.length+5;
      ta.focus(); ta.dispatchEvent(new Event('input')); return;
    } else { return; }
    if(block){
      var lineStart=before.lastIndexOf('\\n')+1;
      var seg=val.slice(lineStart,e);
      var newSeg=seg.split('\\n').map(function(l){return prefix+l;}).join('\\n');
      ta.value=val.slice(0,lineStart)+newSeg+after;
      ta.selectionStart=lineStart; ta.selectionEnd=lineStart+newSeg.length;
    } else {
      ta.value=before+prefix+sel+suffix+after;
      if(sel){ ta.selectionStart=s+prefix.length; ta.selectionEnd=s+prefix.length+sel.length; }
      else { ta.selectionStart=ta.selectionEnd=s+prefix.length; }
    }
    ta.focus();
    ta.dispatchEvent(new Event('input'));
  }
  // --- wireToolbar: container 内の [data-md] ボタンにクリックハンドラを束ねる ---
  function wireToolbar(container,ta){
    if(!container||!ta) return;
    var btns=container.querySelectorAll('[data-md]');
    for(var i=0;i<btns.length;i++){
      (function(btn){ btn.addEventListener('click',function(ev){ ev.preventDefault(); insertMarkdown(ta,btn.getAttribute('data-md')); }); })(btns[i]);
    }
  }
  // --- LocalStorage 下書き（プライベートモード・容量超過は静かに無視） ---
  function saveDraft(key,data){ try{ localStorage.setItem(key,JSON.stringify(data)); }catch(_){} }
  function loadDraft(key){ try{ var v=localStorage.getItem(key); return v?JSON.parse(v):null; }catch(_){ return null; } }
  function clearDraft(key){ try{ localStorage.removeItem(key); }catch(_){} }
`;
