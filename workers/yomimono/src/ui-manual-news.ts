import { head, header, tail, toolbarButtonsHtml, draftBarHtml, UI_KIT_JS } from './ui-shared';

// ニュース作成ページ。外部掲載リンクは externalUrl を入れれば本文なしで保存できる。
const BODY =
  `<main class="wide">
  ` +
  draftBarHtml('m') +
  `
  <p class="lead">ニュースを作成します。外部掲載・登壇・更新情報などを news として保存できます。外部URLがないニュースは本文を入力してください。</p>
  <div class="step">
    <div class="row" style="gap:14px">
      <div class="field" style="flex:1;min-width:220px;margin:0"><label>タイトル</label><input id="m_title" placeholder="ニュースのタイトル"></div>
      <div class="field" style="width:190px;margin:0"><label>カテゴリ</label>
        <select id="m_cat">
          <option value="info">お知らせ</option>
          <option value="media">メディア掲載</option>
          <option value="update">更新情報</option>
          <option value="event">イベント</option>
          <option value="award">受賞</option>
        </select>
      </div>
      <div class="field" style="width:170px;margin:0"><label>公開日</label><input id="m_date" type="date"></div>
    </div>
    <div class="field" style="margin-top:10px"><label>説明（カード・OGP用の1〜2文）</label><input id="m_desc" placeholder="一覧やSNSで表示される短い説明"></div>
    <div class="row" style="gap:14px;margin-top:10px">
      <div class="field" style="flex:1;min-width:220px;margin:0"><label>外部URL（任意・本文なし可）</label><input id="m_external" placeholder="https://example.com/news"></div>
      <div class="field" style="width:220px;margin:0"><label>出典名（任意）</label><input id="m_source" placeholder="Cor.株式会社"></div>
      <div class="field" style="width:240px;margin:0"><label>タグ（カンマ区切り）</label><input id="m_tags" placeholder="AI, お知らせ"></div>
    </div>
    <div class="row" style="gap:14px;margin-top:10px">
      <label class="checkline" style="margin:0"><input id="m_featured" type="checkbox"> 注目表示する</label>
      <label class="checkline" style="margin:0"><input id="m_draft_state" type="checkbox"> 下書きとして保存する</label>
    </div>
    <details class="advanced"><summary>URLを編集する（上級者向け）</summary>
      <div class="field" style="margin-top:8px"><label>URLの末尾（英小文字/数字/ハイフン・空欄でタイトルから自動生成）</label><input id="m_slug" placeholder="自動生成されます"></div>
    </details>
  </div>

  <div class="split">
    <div class="step editor">
      <div class="toolbar" id="m_toolbar">
        <strong style="font-size:13px;color:var(--navy)">本文（外部URLがない場合は必須）</strong>
        ` +
  toolbarButtonsHtml() +
  `
      </div>
      <textarea id="m_body" maxlength="100000" placeholder="外部URLがないニュースでは本文を入力してください。
例:
## 概要

お知らせ本文。"></textarea>
    </div>
    <div class="step">
      <div class="toolbar"><strong style="font-size:13px;color:var(--navy)">プレビュー</strong></div>
      <div class="preview" id="m_prev"><p class="meta">ここに表示されます。</p></div>
    </div>
  </div>

  <div class="step">
    <div class="row">
      <button class="pub" id="m_pub">ニュースを保存する</button>
      <button class="ghost" id="m_draft" type="button">下書きをブラウザに保存</button>
      <button class="ghost" id="m_check" type="button">公開前チェック</button>
      <span class="meta" id="m_msg"></span>
    </div>
    <div id="m_result"></div>
  </div>
</main>`;

const JS = `
  var slugEdited = false;
  var DRAFT_KEY = 'draft:news:new';
  var pendingDraft = null;
  var _pvTimer = null;
  var _draftTimer = null;

  function todayString(){
    var d=new Date(), p=function(n){return (n<10?'0':'')+n;};
    return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());
  }
  function setDefaultDate(){ $('m_date').value = todayString(); }
  function inline(t){
    t = esc(t);
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
  function gatherAll(){
    return {
      title:$('m_title').value,
      desc:$('m_desc').value,
      cat:$('m_cat').value,
      tags:$('m_tags').value,
      slug:$('m_slug').value,
      publishedAt:$('m_date').value,
      externalUrl:$('m_external').value,
      source:$('m_source').value,
      featured:$('m_featured').checked,
      isDraft:$('m_draft_state').checked,
      body:$('m_body').value
    };
  }
  function applyDraft(d){
    if(!d) return;
    $('m_title').value = d.title || '';
    $('m_desc').value = d.desc || '';
    $('m_cat').value = d.cat || 'info';
    $('m_tags').value = d.tags || '';
    $('m_slug').value = d.slug || '';
    $('m_date').value = d.publishedAt || todayString();
    $('m_external').value = d.externalUrl || '';
    $('m_source').value = d.source || '';
    $('m_featured').checked = d.featured === true;
    $('m_draft_state').checked = d.isDraft === true;
    $('m_body').value = d.body || '';
    slugEdited = !!($('m_slug').value.trim());
    updatePreview();
  }
  function gather(){
    var tags = $('m_tags').value.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
    var slug = $('m_slug').value.trim() || titleToSlug($('m_title').value);
    return {
      slug:slug,
      title:$('m_title').value.trim(),
      description:$('m_desc').value.trim(),
      category:$('m_cat').value,
      tags:tags,
      body:$('m_body').value,
      publishedAt:$('m_date').value,
      externalUrl:$('m_external').value.trim(),
      source:$('m_source').value.trim(),
      featured:$('m_featured').checked,
      isDraft:$('m_draft_state').checked
    };
  }
  function validateLocal(a){
    if(!a.title) return 'タイトルを入力してください';
    if(!a.description) return '説明を入力してください';
    if(a.publishedAt && !/^\\d{4}-\\d{2}-\\d{2}$/.test(a.publishedAt)) return '公開日は YYYY-MM-DD で入力してください';
    if(a.externalUrl && !/^https?:\\/\\//i.test(a.externalUrl)) return '外部URLは http(s) のURLを入力してください';
    if(!a.externalUrl && !a.body.trim()) return '外部URLがないニュースは本文を入力してください';
    if(!/^[a-z0-9-]{3,80}$/.test(a.slug)) return 'URLの末尾は英小文字・数字・ハイフン（3〜80字）で指定してください';
    return '';
  }
  function renderViolations(v){
    if(v.length){ $('m_msg').innerHTML='<span style="color:#dc2626">違反 '+v.length+'件: '+esc(v.map(function(x){return x.name;}).join(', '))+'</span>'; }
    else { $('m_msg').innerHTML='<span style="color:#16a34a">✓ 違反なし。保存できます</span>'; }
  }
  function scheduleDraftSave(){
    if(_draftTimer) clearTimeout(_draftTimer);
    _draftTimer = setTimeout(function(){ _draftTimer=null; saveDraft(DRAFT_KEY, gatherAll()); }, 800);
  }
  function cancelDraftSave(){ if(_draftTimer){ clearTimeout(_draftTimer); _draftTimer=null; } }
  function resetForm(){
    $('m_title').value=''; $('m_desc').value=''; $('m_cat').value='info';
    $('m_tags').value=''; $('m_slug').value=''; setDefaultDate(); $('m_external').value=''; $('m_source').value='';
    $('m_featured').checked=false; $('m_draft_state').checked=false; $('m_body').value='';
    slugEdited = false;
    updatePreview();
  }

  setDefaultDate();
  wireToolbar($('m_toolbar'), $('m_body'));
  (function(){
    var d = loadDraft(DRAFT_KEY);
    if(d && (d.title || d.desc || d.externalUrl || d.body)){ pendingDraft = d; $('m_draftBar').hidden = false; }
  })();
  $('m_title').addEventListener('input', function(){
    if(!slugEdited){ $('m_slug').value = titleToSlug($('m_title').value); }
    scheduleDraftSave();
  });
  $('m_slug').addEventListener('input', function(){ slugEdited = !!($('m_slug').value.trim()); scheduleDraftSave(); });
  $('m_desc').addEventListener('input', scheduleDraftSave);
  $('m_tags').addEventListener('input', scheduleDraftSave);
  $('m_cat').addEventListener('change', scheduleDraftSave);
  $('m_date').addEventListener('change', scheduleDraftSave);
  $('m_external').addEventListener('input', scheduleDraftSave);
  $('m_source').addEventListener('input', scheduleDraftSave);
  $('m_featured').addEventListener('change', scheduleDraftSave);
  $('m_draft_state').addEventListener('change', scheduleDraftSave);
  $('m_body').addEventListener('input', function(){ schedulePreview(); scheduleDraftSave(); });
  $('m_restore').addEventListener('click', function(){ applyDraft(pendingDraft); $('m_draftBar').hidden = true; });
  $('m_discard').addEventListener('click', function(){ clearDraft(DRAFT_KEY); pendingDraft = null; $('m_draftBar').hidden = true; });

  $('m_check').addEventListener('click', function(){
    var a=gather(); var err=validateLocal(a);
    if(err){ $('m_msg').innerHTML='<span style="color:#dc2626">'+esc(err)+'</span>'; return; }
    var btn=this; btn.disabled=true; $('m_msg').textContent='チェック中…';
    api('/api/validate', { collection:'news', article:a }).then(function(j){
      renderViolations(j.violations||[]);
      btn.disabled=false;
    }).catch(function(e){ $('m_msg').innerHTML='<span style="color:#dc2626">'+esc(e.message)+'</span>'; btn.disabled=false; });
  });
  $('m_pub').addEventListener('click', function(){
    var a=gather(); var err=validateLocal(a);
    if(err){ $('m_msg').innerHTML='<span style="color:#dc2626">'+esc(err)+'</span>'; return; }
    var btn=this; btn.disabled=true; btn.innerHTML='<span class="spin"></span>保存中…'; $('m_msg').textContent='';
    api('/api/publish', { collection:'news', article:a }).then(function(j){
      var link = j && j.commitUrl ? ('<a href="'+esc(safeUrl(j.commitUrl))+'" target="_blank" rel="noopener">コミットを見る</a>') : '';
      $('m_result').innerHTML='<div class="done">✓ ニュースを保存しました（数分でサイトに反映されます） '+link+'</div>';
      $('m_msg').textContent='';
      cancelDraftSave();
      clearDraft(DRAFT_KEY);
      pendingDraft = null;
      $('m_draftBar').hidden = true;
      resetForm();
      btn.disabled=false; btn.innerHTML='ニュースを保存する';
    }).catch(function(e){ $('m_msg').innerHTML='<span style="color:#dc2626">'+esc(e.message)+'</span>'; btn.disabled=false; btn.innerHTML='ニュースを保存する'; });
  });
  $('m_draft').addEventListener('click', function(){
    var btn=this; btn.disabled=true;
    saveDraft(DRAFT_KEY, gatherAll());
    $('m_result').innerHTML='<div class="done">✓ このブラウザに下書きを保存しました（次回訪問時に復元できます・サーバーには送信されません）</div>';
    $('m_msg').textContent='';
    btn.disabled=false;
  });
  updatePreview();
`;

export const MANUAL_NEWS_HTML =
  head('ニュース作成 — 読みもの 作成スタジオ') + header('manual-news') + BODY + tail(UI_KIT_JS + JS);
