import { head, header, tail, toolbarButtonsHtml, draftBarHtml, UI_KIT_JS } from './ui-shared';

// 実績記事（cases）作成ページ。M1-I2 の非エンジニア向けUI改善キットを適用し、
// /api/validate /api/publish へ collection:'cases' を明示して送る。
const BODY =
  `<main class="wide">
  ` +
  draftBarHtml('m') +
  `
  <p class="lead">実績記事を作成します。本文は「課題・アプローチ・実装・成果」の見出しで書くと、既存の works 詳細ページに自然につながります。</p>
  <div class="step">
    <div class="row" style="gap:14px">
      <div class="field" style="flex:1;min-width:220px;margin:0"><label>タイトル</label><input id="m_title" placeholder="実績記事のタイトル"></div>
      <div class="field" style="width:210px;margin:0"><label>カテゴリ</label>
        <select id="m_cat">
          <option value="grift">Grift</option>
          <option value="confidential-ai">機密データAI</option>
          <option value="local-llm">ローカルLLM</option>
          <option value="ai-contract">AI受託・開発</option>
          <option value="tech-culture">技術文化・発信</option>
        </select>
      </div>
    </div>
    <div class="field" style="margin-top:10px"><label>リード文（実績ページ上部に表示）</label><input id="m_summary" placeholder="1〜2行で、どんな実績かを説明"></div>
    <div class="row" style="gap:14px;margin-top:10px">
      <div class="field" style="flex:1;min-width:220px;margin:0"><label>説明（カード・OGP用の1〜2文）</label><input id="m_desc" placeholder="一覧やSNSで表示される短い説明"></div>
      <div class="field" style="width:240px;margin:0"><label>タグ（カンマ区切り）</label><input id="m_tags" placeholder="AI, PoC"></div>
    </div>
    <div class="row" style="gap:14px;margin-top:10px">
      <div class="field" style="width:170px;margin:0"><label>公開日</label><input id="m_date" type="date"></div>
      <div class="field" style="width:170px;margin:0"><label>注目表示</label><label style="display:flex;align-items:center;gap:8px;padding-top:9px"><input id="m_featured" type="checkbox" style="width:auto"> featured</label></div>
      <label class="checkline" style="margin:0"><input id="m_draft_state" type="checkbox"> 下書きとして保存する</label>
    </div>
    <details class="advanced"><summary>URLを編集する（上級者向け）</summary>
      <div class="field" style="margin-top:8px"><label>URLの末尾（英小文字/数字/ハイフン・空欄でタイトルから自動生成）</label><input id="m_slug" placeholder="自動生成されます"></div>
    </details>
  </div>

  <div class="split">
    <div class="step editor">
      <div class="toolbar" id="m_toolbar">
        <strong style="font-size:13px;color:var(--navy)">本文</strong>
        ` +
  toolbarButtonsHtml() +
  `
        <button class="ghost" id="m_imgBtn" type="button">画像を追加</button>
        <span class="meta" id="m_imgMsg"></span>
        <input type="file" id="m_file" accept="image/*" multiple hidden>
      </div>
      <textarea id="m_body" class="drop" maxlength="100000" placeholder="## 課題

お客様やプロジェクトが抱えていた問題。

## アプローチ

どう考え、どんな方針で臨んだか。

## 実装

実際に作ったもの・技術的なポイント。

## 成果

結果・効果。NDA案件は具体名や数値を抽象化してください。"></textarea>
    </div>
    <div class="step">
      <div class="toolbar"><strong style="font-size:13px;color:var(--navy)">プレビュー</strong></div>
      <div class="preview" id="m_prev"><p class="meta">ここに表示されます。</p></div>
    </div>
  </div>

  <div class="step">
    <div class="row">
      <button class="pub" id="m_pub">実績記事を公開する</button>
      <button class="ghost" id="m_draft" type="button">下書きをブラウザに保存</button>
      <button class="ghost" id="m_check" type="button">公開前チェック</button>
      <span class="meta" id="m_msg"></span>
    </div>
    <div id="m_result"></div>
    <details class="help"><summary>技術的なメモ（かっこのある方向け）</summary>
      <div class="help-body">
        <ul>
          <li>公開は GitHub の現在の管理対象 branch へコミットされ、数分で静的サイトに反映されます。</li>
          <li>本文は Markdown 形式で保存されます。ツールバーが記号を自動挿入します。</li>
          <li>「下書きをブラウザに保存」はこの端末のブラウザ（localStorage）にのみ保存されます。サーバーには送信されません。</li>
          <li>入力中の内容は自動的にこのブラウザに保存されます（デバイスごと・公開時に消去）。</li>
        </ul>
      </div>
    </details>
  </div>
</main>`;

const JS = `
  // === 状態 ===
  var slugEdited = false;
  var DRAFT_KEY = 'draft:cases:new';
  var pendingDraft = null;
  var imgCache = {};
  var IMG_CACHE_MAX = 20; // プレビュー用 data URL のキャッシュ上限（古いものから破棄）
  var _pvTimer = null;
  var _draftTimer = null; // 下書き自動保存タイマー（公開成功時にキャンセルして競合防止）

  function todayString(){
    var d=new Date(), p=function(n){return (n<10?'0':'')+n;};
    return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());
  }
  function setDefaultDate(){ $('m_date').value = todayString(); }

  // imgCache に data URL を登録。上限超過時は最古のエントリから削除（挿入順 = 古い順）。
  function setImgCache(url, dataUrl){
    if(!url || imgCache.hasOwnProperty(url)) { imgCache[url]=dataUrl; return; }
    var keys = Object.keys(imgCache);
    while(keys.length >= IMG_CACHE_MAX && keys.length > 0){ delete imgCache[keys.shift()]; }
    imgCache[url]=dataUrl;
  }

  // === 最小 Markdown レンダラ（esc + safeUrl で安全に） ===
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
    var out = [], list = null, bq = false, inCode = false, codeBuf = [];
    function closeList(){ if(list){ out.push('</'+list+'>'); list=null; } }
    function closeBq(){ if(bq){ out.push('</blockquote>'); bq=false; } }
    for (var i=0;i<lines.length;i++){
      var ln = lines[i];
      if (/^\`\`\`/.test(ln)){
        if (inCode){ out.push('<pre><code>'+codeBuf.join('\\n')+'</code></pre>'); inCode=false; codeBuf=[]; }
        else { closeList(); closeBq(); inCode=true; }
        continue;
      }
      if (inCode){ codeBuf.push(esc(ln)); continue; }
      var mh = ln.match(/^(#{1,3})\\s+(.*)$/);
      var mu = ln.match(/^\\s*[-*]\\s+(.*)$/);
      var mo = ln.match(/^\\s*\\d+\\.\\s+(.*)$/);
      var mq = ln.match(/^>\\s?(.*)$/);
      var mhr = /^\\s*(?:-{3,}|\\*{3,}|_{3,})\\s*$/.test(ln);
      if (mhr){ closeList(); closeBq(); out.push('<hr>'); }
      else if (mh){ closeList(); closeBq(); var lvl=mh[1].length; out.push('<h'+lvl+'>'+inline(mh[2])+'</h'+lvl+'>'); }
      else if (mu){ closeBq(); if(list!=='ul'){ closeList(); list='ul'; out.push('<ul>'); } out.push('<li>'+inline(mu[1])+'</li>'); }
      else if (mo){ closeBq(); if(list!=='ol'){ closeList(); list='ol'; out.push('<ol>'); } out.push('<li>'+inline(mo[1])+'</li>'); }
      else if (mq){ closeList(); if(!bq){ out.push('<blockquote>'); bq=true; } out.push('<p>'+inline(mq[1])+'</p>'); }
      else if (/^\\s*$/.test(ln)){ closeList(); closeBq(); }
      else { closeList(); closeBq(); out.push('<p>'+inline(ln)+'</p>'); }
    }
    if (inCode){ out.push('<pre><code>'+codeBuf.join('\\n')+'</code></pre>'); }
    closeList(); closeBq();
    return out.join('');
  }
  function updatePreview(){
    var html = mdToHtml($('m_body').value);
    $('m_prev').innerHTML = html || '<p class="meta">ここに表示されます。</p>';
  }
  function schedulePreview(){ if(_pvTimer) clearTimeout(_pvTimer); _pvTimer=setTimeout(updatePreview, 120); }

  // === 画像アップロード（D&D / ペースト / ボタン） ===
  // アップロード直後の画像はまだ本番にデプロイされていないため、プレビューは data URL で即表示する（本文 markdown は /images/... のまま）。
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
        setImgCache(j.url, dataUrl);
        insertAtCursor('\\n![' + (file.name||'画像') + '](' + j.url + ')\\n');
        $('m_imgMsg').textContent='挿入しました: '+j.url;
      }).catch(function(e){ $('m_imgMsg').innerHTML='<span style="color:#dc2626">画像アップロード失敗: '+esc(e.message)+'</span>'; });
    };
    reader.readAsDataURL(file);
  }

  // === 入力データ収集 ===
  function gatherAll(){
    return {
      title:$('m_title').value,
      summary:$('m_summary').value,
      desc:$('m_desc').value,
      cat:$('m_cat').value,
      tags:$('m_tags').value,
      slug:$('m_slug').value,
      publishedAt:$('m_date').value,
      featured:$('m_featured').checked,
      isDraft:$('m_draft_state').checked,
      body:$('m_body').value
    };
  }
  function applyDraft(d){
    if(!d) return;
    $('m_title').value = d.title || '';
    $('m_summary').value = d.summary || '';
    $('m_desc').value = d.desc || '';
    $('m_cat').value = d.cat || 'grift';
    $('m_tags').value = d.tags || '';
    $('m_slug').value = d.slug || '';
    $('m_date').value = d.publishedAt || todayString();
    $('m_featured').checked = d.featured === true;
    $('m_draft_state').checked = d.isDraft === true;
    $('m_body').value = d.body || '';
    slugEdited = !!($('m_slug').value.trim());
    updatePreview();
  }
  function gather(){
    var tags = $('m_tags').value.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
    // URLの末尾は空欄ならタイトルから自動生成（非エンジニアは意識しない）
    var slug = $('m_slug').value.trim() || titleToSlug($('m_title').value);
    return {
      slug:slug,
      title:$('m_title').value.trim(),
      description:$('m_desc').value.trim(),
      category:$('m_cat').value,
      tags:tags,
      body:$('m_body').value,
      summary:$('m_summary').value.trim(),
      publishedAt:$('m_date').value,
      featured:$('m_featured').checked,
      isDraft:$('m_draft_state').checked
    };
  }
  function validateLocal(a){
    if(!a.title) return 'タイトルを入力してください';
    if(!a.summary) return 'リード文を入力してください';
    if(!a.description) return '説明を入力してください';
    if(a.publishedAt && !/^\\d{4}-\\d{2}-\\d{2}$/.test(a.publishedAt)) return '公開日は YYYY-MM-DD で入力してください';
    if(!a.body.trim()) return '本文を入力してください';
    if(!/^[a-z0-9-]{3,80}$/.test(a.slug)) return 'URLの末尾は英小文字・数字・ハイフン（3〜80字）で指定してください';
    return '';
  }
  function renderViolations(v){
    if(v.length){ $('m_msg').innerHTML='<span style="color:#dc2626">違反 '+v.length+'件: '+esc(v.map(function(x){return x.name;}).join(', '))+'</span>'; }
    else { $('m_msg').innerHTML='<span style="color:#16a34a">✓ 違反なし。公開できます</span>'; }
  }

  // === 下書き（LocalStorage 自動保存・復元） ===
  function scheduleDraftSave(){
    if(_draftTimer) clearTimeout(_draftTimer);
    _draftTimer = setTimeout(function(){ _draftTimer=null; saveDraft(DRAFT_KEY, gatherAll()); }, 800);
  }
  function cancelDraftSave(){ if(_draftTimer){ clearTimeout(_draftTimer); _draftTimer=null; } }
  function resetForm(){
    $('m_title').value=''; $('m_summary').value=''; $('m_desc').value=''; $('m_cat').value='grift';
    $('m_tags').value=''; $('m_slug').value=''; setDefaultDate(); $('m_featured').checked=false; $('m_draft_state').checked=false; $('m_body').value='';
    slugEdited = false; imgCache = {};
    updatePreview();
  }

  // === 初期化 ===
  setDefaultDate();
  wireToolbar($('m_toolbar'), $('m_body'));
  (function(){
    var d = loadDraft(DRAFT_KEY);
    if(d && (d.title || d.summary || d.desc || d.body)){ pendingDraft = d; $('m_draftBar').hidden = false; }
  })();

  // === イベント束ね ===
  $('m_title').addEventListener('input', function(){
    if(!slugEdited){ $('m_slug').value = titleToSlug($('m_title').value); }
    scheduleDraftSave();
  });
  $('m_slug').addEventListener('input', function(){ slugEdited = !!($('m_slug').value.trim()); scheduleDraftSave(); });
  $('m_summary').addEventListener('input', scheduleDraftSave);
  $('m_desc').addEventListener('input', scheduleDraftSave);
  $('m_tags').addEventListener('input', scheduleDraftSave);
  $('m_cat').addEventListener('change', scheduleDraftSave);
  $('m_date').addEventListener('change', scheduleDraftSave);
  $('m_featured').addEventListener('change', scheduleDraftSave);
  $('m_draft_state').addEventListener('change', scheduleDraftSave);
  $('m_body').addEventListener('input', function(){ schedulePreview(); scheduleDraftSave(); });

  $('m_restore').addEventListener('click', function(){ applyDraft(pendingDraft); $('m_draftBar').hidden = true; });
  $('m_discard').addEventListener('click', function(){ clearDraft(DRAFT_KEY); pendingDraft = null; $('m_draftBar').hidden = true; });

  $('m_imgBtn').addEventListener('click', function(){ $('m_file').click(); });
  $('m_file').addEventListener('change', function(){ for(var i=0;i<this.files.length;i++) uploadFile(this.files[i]); this.value=''; });
  var ta=$('m_body');
  ta.addEventListener('dragover', function(e){ e.preventDefault(); ta.classList.add('over'); });
  ta.addEventListener('dragleave', function(){ ta.classList.remove('over'); });
  ta.addEventListener('drop', function(e){ e.preventDefault(); ta.classList.remove('over'); var f=e.dataTransfer&&e.dataTransfer.files; if(f) for(var i=0;i<f.length;i++) uploadFile(f[i]); });
  ta.addEventListener('paste', function(e){ var it=e.clipboardData&&e.clipboardData.items; if(!it) return; for(var i=0;i<it.length;i++){ if(it[i].type&&it[i].type.indexOf('image')===0){ var f=it[i].getAsFile(); if(f){ e.preventDefault(); uploadFile(f); } } } });

  // === 公開前チェック ===
  $('m_check').addEventListener('click', function(){
    var a=gather(); var err=validateLocal(a);
    if(err){ $('m_msg').innerHTML='<span style="color:#dc2626">'+esc(err)+'</span>'; return; }
    var btn=this; btn.disabled=true; $('m_msg').textContent='チェック中…';
    api('/api/validate', { collection:'cases', article:a }).then(function(j){
      renderViolations(j.violations||[]);
      btn.disabled=false;
    }).catch(function(e){ $('m_msg').innerHTML='<span style="color:#dc2626">'+esc(e.message)+'</span>'; btn.disabled=false; });
  });

  // === 実績記事を公開する（collection:'cases' を明示） ===
  $('m_pub').addEventListener('click', function(){
    var a=gather(); var err=validateLocal(a);
    if(err){ $('m_msg').innerHTML='<span style="color:#dc2626">'+esc(err)+'</span>'; return; }
    var btn=this; btn.disabled=true; btn.innerHTML='<span class="spin"></span>公開中…'; $('m_msg').textContent='';
    api('/api/publish', { collection:'cases', article:a }).then(function(j){
      var link = j && j.commitUrl ? ('<a href="'+esc(safeUrl(j.commitUrl))+'" target="_blank" rel="noopener">コミットを見る</a>') : '';
      $('m_result').innerHTML='<div class="done">✓ 実績記事を公開しました（現在の管理対象 branch にコミット → 数分でサイトに反映されます） '+link+'</div>';
      $('m_msg').textContent='';
      cancelDraftSave();
      clearDraft(DRAFT_KEY);
      pendingDraft = null;
      $('m_draftBar').hidden = true;
      resetForm();
      btn.disabled=false; btn.innerHTML='実績記事を公開する';
    }).catch(function(e){ $('m_msg').innerHTML='<span style="color:#dc2626">'+esc(e.message)+'</span>'; btn.disabled=false; btn.innerHTML='実績記事を公開する'; });
  });

  // === 下書きをブラウザに保存（localStorage のみ・サーバーへは送信しない） ===
  $('m_draft').addEventListener('click', function(){
    var btn=this; btn.disabled=true;
    saveDraft(DRAFT_KEY, gatherAll());
    $('m_result').innerHTML='<div class="done">✓ このブラウザに下書きを保存しました（次回訪問時に復元できます・サーバーには送信されません）</div>';
    $('m_msg').textContent='';
    btn.disabled=false;
  });

  updatePreview();
`;

export const MANUAL_CASES_HTML =
  head('実績作成 — 読みもの 作成スタジオ') + header('manual-cases') + BODY + tail(UI_KIT_JS + JS);
