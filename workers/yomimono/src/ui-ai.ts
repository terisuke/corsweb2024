import { head, header, tail } from './ui-shared';

// AI生成ページ（情報収集→テーマ選択→生成→レビュー→公開）。
// 共通JS(BASE/esc/safeUrl/$/api)は ui-shared の COMMON_JS から供給される。
const BODY = `<main>
  <p class="lead">情報収集 → テーマ選定 → 生成 → レビュー → 公開（main マージ不要で公開されます）</p>
  <section class="step" id="s1">
    <h2><span class="num">1</span>情報収集</h2>
    <p class="hint">直近およそ27時間の AI / DX / ローカルLLM などの話題から、中小企業に刺さる候補テーマを集めます。</p>
    <div class="row">
      <button class="primary" id="collectBtn">情報収集を開始</button>
      <span class="meta" id="recentMeta"></span>
    </div>
    <div id="collectErr"></div>
  </section>
  <section class="step" id="s2" hidden>
    <h2><span class="num">2</span>テーマを選ぶ（複数可）</h2>
    <p class="hint">書きたいテーマにチェックを入れて、記事生成へ進んでください。</p>
    <div id="cands"></div>
    <div class="row" style="margin-top:12px">
      <button class="primary" id="genBtn" disabled>選択したテーマで記事を生成</button>
      <span class="meta" id="selMeta">0 件選択中</span>
    </div>
  </section>
  <section class="step" id="s3" hidden>
    <h2><span class="num">3</span>レビュー & 公開</h2>
    <p class="hint">本文を確認・編集してから「公開する」を押してください。ガードレール違反があると公開できません。</p>
    <div id="arts"></div>
  </section>
</main>`;

const JS = `
  var recentSlugs = [];
  var _uid = 0;
  var show = function(id){ $(id).hidden = false; };

  fetch(BASE + '/api/recent').then(function(r){ return r.json(); }).then(function(j){
    recentSlugs = (j && j.slugs) ? j.slugs : [];
    $('recentMeta').textContent = '既存記事 ' + recentSlugs.length + ' 件を重複回避に使用';
  }).catch(function(){});

  $('collectBtn').addEventListener('click', function(){
    var b = $('collectBtn'); b.disabled = true; b.innerHTML = '<span class="spin"></span>収集中…（30〜60秒）';
    $('collectErr').innerHTML = '';
    api('/api/collect', { recentTitles: recentSlugs }).then(function(j){
      renderCands(j.candidates || []);
      show('s2'); $('s2').scrollIntoView({behavior:'smooth'});
    }).catch(function(e){
      $('collectErr').innerHTML = '<div class="err">情報収集に失敗しました: ' + esc(e.message) + '</div>';
    }).then(function(){ b.disabled = false; b.textContent = 'もう一度 情報収集'; });
  });

  function renderCands(list){
    var html = '';
    for (var i=0;i<list.length;i++){
      var c = list[i];
      var src = (c.sources||[]).map(function(u){ return '<a href="'+esc(safeUrl(u))+'" target="_blank" rel="noopener">'+esc(u)+'</a>'; }).join('');
      var fresh = c.freshnessHours ? ('<span class="badge">約'+esc(c.freshnessHours)+'時間前</span>') : '';
      html += '<div class="card" id="cand'+i+'"><label><input type="checkbox" data-i="'+i+'">'
        + '<span><span class="t">'+esc(c.title)+'</span>'+fresh
        + '<div class="s">'+esc(c.summary)+'</div>'
        + '<div class="src">'+src+'</div></span></label></div>';
    }
    $('cands').innerHTML = html || '<div class="meta">候補が見つかりませんでした。もう一度お試しください。</div>';
    window.__cands = list;
    var boxes = $('cands').querySelectorAll('input[type=checkbox]');
    for (var k=0;k<boxes.length;k++){ boxes[k].addEventListener('change', updateSel); }
  }

  function selectedIdx(){
    var out=[]; var boxes=$('cands').querySelectorAll('input[type=checkbox]:checked');
    for (var k=0;k<boxes.length;k++){ out.push(parseInt(boxes[k].getAttribute('data-i'),10)); }
    return out;
  }
  function updateSel(){
    var idx = selectedIdx();
    $('selMeta').textContent = idx.length + ' 件選択中';
    $('genBtn').disabled = idx.length === 0;
    var cards = $('cands').querySelectorAll('.card');
    for (var k=0;k<cards.length;k++){ cards[k].classList.remove('sel'); }
    for (var m=0;m<idx.length;m++){ var el=$('cand'+idx[m]); if(el) el.classList.add('sel'); }
  }

  $('genBtn').addEventListener('click', function(){
    var idx = selectedIdx(); if(!idx.length) return;
    var b = $('genBtn'); b.disabled = true;
    $('arts').innerHTML = ''; show('s3'); $('s3').scrollIntoView({behavior:'smooth'});
    var i = 0;
    function next(){
      if (i >= idx.length){ b.disabled=false; b.innerHTML='選択したテーマで記事を生成'; return; }
      var theme = window.__cands[idx[i]];
      b.innerHTML = '<span class="spin"></span>生成中 ' + (i+1) + '/' + idx.length + '…';
      var slot = document.createElement('div'); slot.className='card'; slot.innerHTML='<div class="meta"><span class="spin" style="border-color:#1b2c40;border-top-color:transparent"></span>「'+esc(theme.title)+'」を生成中…</div>';
      $('arts').appendChild(slot);
      api('/api/generate', { theme: theme, recentTitles: recentSlugs }).then(function(j){
        renderArticle(slot, j.article, j.violations||[]);
      }).catch(function(e){
        slot.innerHTML = '<div class="err">生成に失敗しました（'+esc(theme.title)+'）: '+esc(e.message)+'</div>';
      }).then(function(){ i++; next(); });
    }
    next();
  });

  function renderArticle(slot, a, viol){
    var uid = 'a' + (++_uid);
    var violHtml = '';
    if (viol.length){
      var items = viol.map(function(v){ return '・['+esc(v.name)+'] '+esc(v.reason)+'（'+esc(v.match)+' / '+esc(v.line)+'行目）'; }).join('<br>');
      violHtml = '<div class="viol"><b>⚠ ガードレール違反 '+viol.length+'件 — このままでは公開できません</b>'+items+'</div>';
    }
    slot.className='card';
    slot.innerHTML =
      '<div class="row" style="justify-content:space-between"><strong>'+esc(a.title)+'</strong>'
      + '<span class="meta">カテゴリ: '+esc(a.category)+' / タグ: '+esc((a.tags||[]).join(', '))+'</span></div>'
      + '<div class="meta" style="margin-top:4px">slug: '+esc(a.slug)+'</div>'
      + violHtml
      + '<div class="field"><label>タイトル</label><input id="'+uid+'_title" value="'+esc(a.title)+'"></div>'
      + '<div class="field"><label>説明（カード・OGP用）</label><input id="'+uid+'_desc" value="'+esc(a.description)+'"></div>'
      + '<div class="field"><label>本文（Markdown・編集可）</label><textarea id="'+uid+'_body" maxlength="100000">'+esc(a.body)+'</textarea></div>'
      + '<div class="row"><button class="pub" id="'+uid+'_pub"'+(viol.length?' disabled':'')+'>公開する</button>'
      + '<button class="ghost" id="'+uid+'_recheck">再チェック</button>'
      + '<span id="'+uid+'_msg" class="meta"></span></div>';

    var getArticle = function(){
      return { slug:a.slug, title:$(uid+'_title').value, description:$(uid+'_desc').value, category:a.category, tags:a.tags||[], body:$(uid+'_body').value };
    };
    $(uid+'_recheck').addEventListener('click', function(){
      var btn=this; btn.disabled=true; $(uid+'_msg').textContent='チェック中…';
      api('/api/validate', { article: getArticle() }).then(function(j){
        var v = j.violations || [];
        if (v.length){
          $(uid+'_msg').innerHTML='<span style="color:#dc2626">違反 '+v.length+'件: '+esc(v.map(function(x){return x.name;}).join(', '))+'</span>';
          $(uid+'_pub').disabled = true;
        } else {
          $(uid+'_msg').innerHTML='<span style="color:#16a34a">✓ 違反なし。公開できます</span>';
          $(uid+'_pub').disabled = false;
        }
        btn.disabled=false;
      }).catch(function(e){ $(uid+'_msg').innerHTML='<span style="color:#dc2626">'+esc(e.message)+'</span>'; btn.disabled=false; });
    });
    $(uid+'_pub').addEventListener('click', function(){
      var btn=this; btn.disabled=true; btn.innerHTML='<span class="spin"></span>公開中…'; $(uid+'_msg').textContent='';
      api('/api/publish', { article: getArticle() }).then(function(j){ finishPublish(slot, uid, j); })
        .catch(function(e){ $(uid+'_msg').innerHTML='<span style="color:#dc2626">'+esc(e.message)+'</span>'; btn.disabled=false; btn.textContent='公開する'; });
    });
  }

  function finishPublish(slot, uid, j){
    var link = j && j.commitUrl ? ('<a href="'+esc(safeUrl(j.commitUrl))+'" target="_blank" rel="noopener">コミットを見る</a>') : '';
    slot.innerHTML = '<div class="done">✓ 公開しました（main にコミット → 数分でサイトに反映されます） '+link+'</div>';
  }
`;

export const AI_HTML = head('AI生成 — 読みもの 作成スタジオ') + header('ai') + BODY + tail(JS);
