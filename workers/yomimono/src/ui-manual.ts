import { head, header, tail } from './ui-shared';

// 手動作成ページ。Markdown を書き、画像はドラッグ&ドロップ/貼り付け/ボタンでアップロード。
// 右側にライブプレビュー。公開は /api/validate → /api/publish（AI生成と同じ）。
const BODY = `<main class="wide">
  <p class="lead">テキストと画像で記事を作成します。画像は本文へドラッグ&ドロップ・貼り付け・「画像を追加」で挿入できます。書いたら「公開する」で cor-jp.com に公開（main マージ不要）。</p>
  <div class="step">
    <div class="row" style="gap:14px">
      <div class="field" style="flex:1;min-width:220px;margin:0"><label>タイトル</label><input id="m_title" placeholder="記事のタイトル"></div>
      <div class="field" style="width:160px;margin:0"><label>カテゴリ</label>
        <select id="m_cat"><option value="ai">AI</option><option value="engineering">エンジニアリング</option><option value="founder">創業</option><option value="lab">ラボ</option></select>
      </div>
    </div>
    <div class="row" style="gap:14px;margin-top:10px">
      <div class="field" style="flex:1;min-width:220px;margin:0"><label>説明（カード・OGP用の1〜2文）</label><input id="m_desc" placeholder="一覧やSNSで表示される短い説明"></div>
      <div class="field" style="width:240px;margin:0"><label>タグ（カンマ区切り）</label><input id="m_tags" placeholder="AI, 業務効率"></div>
    </div>
    <div class="field" style="margin-top:10px"><label>slug（URL・英小文字/数字/ハイフン）</label><input id="m_slug" placeholder="my-first-post"></div>
  </div>

  <div class="split">
    <div class="step editor">
      <div class="toolbar">
        <strong style="font-size:13px;color:var(--navy)">本文（Markdown）</strong>
        <button class="ghost" id="m_imgBtn" type="button">画像を追加</button>
        <span class="meta" id="m_imgMsg"></span>
        <input type="file" id="m_file" accept="image/*" multiple hidden>
      </div>
      <textarea id="m_body" class="drop" maxlength="100000" placeholder="## 見出し

本文をここに。**太字**、[リンク](https://example.com)、- 箇条書き なども使えます。
画像はここにドラッグ&ドロップ、または貼り付けできます。"></textarea>
    </div>
    <div class="step">
      <div class="toolbar"><strong style="font-size:13px;color:var(--navy)">プレビュー</strong></div>
      <div class="preview" id="m_prev"><p class="meta">ここに表示されます。</p></div>
    </div>
  </div>

  <div class="step">
    <div class="row">
      <button class="pub" id="m_pub">公開する</button>
      <button class="ghost" id="m_check" type="button">ガードレール再チェック</button>
      <span class="meta" id="m_msg"></span>
    </div>
    <div id="m_result"></div>
  </div>
</main>`;

const JS = `
  // slug 既定値（post-YYYYMMDD-HHMM）。ユーザーは編集可。
  (function(){ var d=new Date(), p=function(n){return (n<10?'0':'')+n;};
    $('m_slug').value='post-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes()); })();

  // アップロード直後の画像はまだ本番にデプロイされていないため、
  // プレビューでは data URL を使って即表示する（本文の markdown は /images/... のまま）。
  var imgCache = {};

  // --- 最小 Markdown レンダラ（esc + safeUrl で安全に） ---
  function inline(t){
    t = esc(t);
    t = t.replace(/!\\[([^\\]]*)\\]\\(([^)\\s]+)\\)/g, function(m,alt,url){ var src = imgCache[url] ? imgCache[url] : esc(safeUrl(url)); return '<img src="'+src+'" alt="'+alt+'">'; });
    t = t.replace(/\\[([^\\]]+)\\]\\(([^)\\s]+)\\)/g, function(m,tx,url){ return '<a href="'+esc(safeUrl(url))+'" target="_blank" rel="noopener">'+tx+'</a>'; });
    t = t.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*])\\*([^*]+)\\*/g, '$1<em>$2</em>');
    t = t.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
    return t;
  }
  function mdToHtml(md){
    var lines = String(md||'').split(/\\r?\\n/);
    var out = [], list = null, inCode = false, codeBuf = [];
    function closeList(){ if(list){ out.push('</'+list+'>'); list=null; } }
    for (var i=0;i<lines.length;i++){
      var ln = lines[i];
      if (/^\`\`\`/.test(ln)){
        if (inCode){ out.push('<pre><code>'+codeBuf.join('\\n')+'</code></pre>'); inCode=false; codeBuf=[]; }
        else { closeList(); inCode=true; }
        continue;
      }
      if (inCode){ codeBuf.push(esc(ln)); continue; }
      var mh = ln.match(/^(#{1,3})\\s+(.*)$/);
      var mu = ln.match(/^\\s*[-*]\\s+(.*)$/);
      var mo = ln.match(/^\\s*\\d+\\.\\s+(.*)$/);
      if (mh){ closeList(); var lvl=mh[1].length; out.push('<h'+lvl+'>'+inline(mh[2])+'</h'+lvl+'>'); }
      else if (mu){ if(list!=='ul'){ closeList(); list='ul'; out.push('<ul>'); } out.push('<li>'+inline(mu[1])+'</li>'); }
      else if (mo){ if(list!=='ol'){ closeList(); list='ol'; out.push('<ol>'); } out.push('<li>'+inline(mo[1])+'</li>'); }
      else if (/^\\s*$/.test(ln)){ closeList(); }
      else { closeList(); out.push('<p>'+inline(ln)+'</p>'); }
    }
    if (inCode){ out.push('<pre><code>'+codeBuf.join('\\n')+'</code></pre>'); } // 未閉じフェンスも描画
    closeList();
    return out.join('');
  }
  function updatePreview(){
    var html = mdToHtml($('m_body').value);
    $('m_prev').innerHTML = html || '<p class="meta">ここに表示されます。</p>';
  }
  var _pvTimer = null;
  $('m_body').addEventListener('input', function(){ if(_pvTimer) clearTimeout(_pvTimer); _pvTimer=setTimeout(updatePreview, 120); });

  // --- 画像アップロード ---
  function insertAtCursor(text){
    var ta=$('m_body'), s=ta.selectionStart, e=ta.selectionEnd;
    ta.value = ta.value.slice(0,s) + text + ta.value.slice(e);
    ta.selectionStart = ta.selectionEnd = s + text.length;
    ta.focus(); updatePreview();
  }
  function uploadFile(file){
    if(!file || !/^image\\//.test(file.type||'')){ $('m_imgMsg').textContent='画像ファイルのみ対応です'; return; }
    $('m_imgMsg').innerHTML='<span class="spin" style="border-color:#1b2c40;border-top-color:transparent"></span>アップロード中…';
    var reader=new FileReader();
    reader.onerror=function(){ $('m_imgMsg').innerHTML='<span style="color:#dc2626">画像の読み込みに失敗しました</span>'; };
    reader.onload=function(){
      var dataUrl=String(reader.result||'');
      var base64=dataUrl.split(',')[1]||'';
      api('/api/upload-image', { filename:file.name||'image.png', dataBase64:base64 }).then(function(j){
        imgCache[j.url]=dataUrl; // プレビュー即表示用
        insertAtCursor('\\n![' + (file.name||'画像') + '](' + j.url + ')\\n');
        $('m_imgMsg').textContent='挿入しました: '+j.url;
      }).catch(function(e){ $('m_imgMsg').innerHTML='<span style="color:#dc2626">画像アップロード失敗: '+esc(e.message)+'</span>'; });
    };
    reader.readAsDataURL(file);
  }
  $('m_imgBtn').addEventListener('click', function(){ $('m_file').click(); });
  $('m_file').addEventListener('change', function(){ for(var i=0;i<this.files.length;i++) uploadFile(this.files[i]); this.value=''; });

  var ta=$('m_body');
  ta.addEventListener('dragover', function(e){ e.preventDefault(); ta.classList.add('over'); });
  ta.addEventListener('dragleave', function(){ ta.classList.remove('over'); });
  ta.addEventListener('drop', function(e){ e.preventDefault(); ta.classList.remove('over'); var f=e.dataTransfer&&e.dataTransfer.files; if(f) for(var i=0;i<f.length;i++) uploadFile(f[i]); });
  ta.addEventListener('paste', function(e){ var it=e.clipboardData&&e.clipboardData.items; if(!it) return; for(var i=0;i<it.length;i++){ if(it[i].type&&it[i].type.indexOf('image')===0){ var f=it[i].getAsFile(); if(f){ e.preventDefault(); uploadFile(f); } } } });

  // --- 公開 / 再チェック ---
  function gather(){
    var tags = $('m_tags').value.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
    return { slug:$('m_slug').value.trim(), title:$('m_title').value.trim(), description:$('m_desc').value.trim(), category:$('m_cat').value, tags:tags, body:$('m_body').value };
  }
  function validateLocal(a){
    if(!/^[a-z0-9-]{3,80}$/.test(a.slug)) return 'slug は英小文字・数字・ハイフン 3〜80字で入力してください';
    if(!a.title) return 'タイトルを入力してください';
    if(!a.description) return '説明を入力してください';
    if(!a.body.trim()) return '本文を入力してください';
    return '';
  }
  $('m_check').addEventListener('click', function(){
    var a=gather(); var err=validateLocal(a);
    if(err){ $('m_msg').innerHTML='<span style="color:#dc2626">'+esc(err)+'</span>'; return; }
    var btn=this; btn.disabled=true; $('m_msg').textContent='チェック中…';
    api('/api/validate', { article:a }).then(function(j){
      var v=j.violations||[];
      if(v.length){ $('m_msg').innerHTML='<span style="color:#dc2626">違反 '+v.length+'件: '+esc(v.map(function(x){return x.name;}).join(', '))+'</span>'; }
      else { $('m_msg').innerHTML='<span style="color:#16a34a">✓ 違反なし。公開できます</span>'; }
      btn.disabled=false;
    }).catch(function(e){ $('m_msg').innerHTML='<span style="color:#dc2626">'+esc(e.message)+'</span>'; btn.disabled=false; });
  });
  $('m_pub').addEventListener('click', function(){
    var a=gather(); var err=validateLocal(a);
    if(err){ $('m_msg').innerHTML='<span style="color:#dc2626">'+esc(err)+'</span>'; return; }
    var btn=this; btn.disabled=true; btn.innerHTML='<span class="spin"></span>公開中…'; $('m_msg').textContent='';
    api('/api/publish', { article:a }).then(function(j){
      var link = j && j.commitUrl ? ('<a href="'+esc(safeUrl(j.commitUrl))+'" target="_blank" rel="noopener">コミットを見る</a>') : '';
      $('m_result').innerHTML='<div class="done">✓ 公開しました（main にコミット → 数分でサイトに反映されます） '+link+'</div>';
      $('m_msg').textContent='';
      btn.disabled=false; btn.innerHTML='公開する'; // 成功後もボタンを復帰（別記事を続けて書けるように）
    }).catch(function(e){ $('m_msg').innerHTML='<span style="color:#dc2626">'+esc(e.message)+'</span>'; btn.disabled=false; btn.innerHTML='公開する'; });
  });
`;

export const MANUAL_HTML = head('手動作成 — 読みもの 作成スタジオ') + header('manual') + BODY + tail(JS);
