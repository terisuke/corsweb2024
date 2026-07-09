import { head, header, tail } from './ui-shared';

const BODY = `<main class="wide">
  <p class="lead">既存コンテンツを選んで、同じURLのまま更新します。slug は事故防止のため変更できません。</p>

  <section class="step">
    <h2>種類を選ぶ</h2>
    <p class="hint">編集する collection を切り替えると、一覧と入力項目も切り替わります。</p>
    <div class="row" role="group" aria-label="編集するコンテンツ種別">
      <button class="ghost collection-tab" id="tab_blog" type="button" data-collection="blog" aria-pressed="true">ブログ</button>
      <button class="ghost collection-tab" id="tab_news" type="button" data-collection="news" aria-pressed="false">ニュース</button>
      <button class="ghost collection-tab" id="tab_cases" type="button" data-collection="cases" aria-pressed="false">実績</button>
      <span class="meta" id="e_collection_status"></span>
    </div>
  </section>

  <div class="split">
    <section class="step">
      <h2 id="e_list_title">ブログを選ぶ</h2>
      <p class="hint">最近のコンテンツから順に表示します。修正したい項目の「編集」を押してください。</p>
      <div class="row" style="margin-bottom:10px">
        <button class="ghost" id="e_reload" type="button">一覧を更新</button>
        <span class="meta" id="e_list_status"></span>
      </div>
      <div class="article-list" id="e_list"></div>
    </section>

    <section class="step" id="e_form_box" hidden>
      <h2 id="e_form_title">コンテンツを修正する</h2>
      <p class="hint">保存前に公開前チェックを実行します。問題がなければ同じURLの記事を更新します。</p>
      <input id="e_sha" type="hidden">
      <input id="e_original_slug" type="hidden">
      <div class="field"><label>URL（変更不可）</label><input id="e_slug" readonly></div>
      <div class="field"><label>タイトル</label><input id="e_title"></div>
      <div class="field"><label>説明</label><input id="e_desc"></div>
      <div class="row" style="gap:14px">
        <div class="field" style="flex:1;min-width:190px;margin:0"><label>カテゴリ</label><select id="e_cat"></select></div>
        <div class="field" style="width:170px;margin:0"><label id="e_date_label">公開日</label><input id="e_date" type="date"></div>
        <div class="field" style="flex:2;min-width:220px;margin:0"><label>タグ（カンマ区切り）</label><input id="e_tags"></div>
      </div>
      <div class="field" id="e_summary_box" hidden><label>リード文</label><input id="e_summary"></div>
      <div class="row" id="e_news_box" style="gap:14px" hidden>
        <div class="field" style="flex:1;min-width:220px;margin:0"><label>外部URL（任意・本文なし可）</label><input id="e_external"></div>
        <div class="field" style="width:220px;margin:0"><label>出典名（任意）</label><input id="e_source"></div>
      </div>
      <div class="field"><label id="e_body_label">本文</label><textarea id="e_body" maxlength="100000"></textarea></div>
      <div class="row" style="margin-top:10px">
        <label class="checkline" style="margin:0"><input id="e_featured" type="checkbox"> 注目表示する</label>
        <label class="checkline" style="margin:0"><input id="e_draft" type="checkbox"> 下書きとして保存する</label>
      </div>
      <div class="row" style="margin-top:14px">
        <button class="pub" id="e_save" type="button">更新する</button>
        <span class="meta" id="e_msg"></span>
      </div>
      <div id="e_result"></div>
    </section>
  </div>
</main>`;

const JS = `
  var currentCollection = 'blog';
  var configs = {
    blog: {
      label:'ブログ',
      newPath:'/manual',
      dateKey:'pubDate',
      dateLabel:'公開日',
      categories:[['ai','AI'],['engineering','エンジニアリング'],['founder','創業'],['lab','ラボ']]
    },
    news: {
      label:'ニュース',
      newPath:'/manual/news',
      dateKey:'publishedAt',
      dateLabel:'公開日',
      categories:[['info','お知らせ'],['media','メディア掲載'],['update','更新情報'],['event','イベント'],['award','受賞']]
    },
    cases: {
      label:'実績',
      newPath:'/manual/cases',
      dateKey:'publishedAt',
      dateLabel:'公開日',
      categories:[['grift','Grift'],['confidential-ai','機密データAI'],['local-llm','ローカルLLM'],['ai-contract','AI受託・開発'],['tech-culture','技術文化・発信']]
    }
  };
  function getJson(p){
    return fetch(BASE+p,{method:'GET'}).then(function(r){return r.json().then(function(j){if(!r.ok){throw new Error(j&&j.error?j.error:('HTTP '+r.status));}return j;});});
  }
  function postJson(p,b){
    return fetch(BASE+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b||{})}).then(function(r){return r.json().then(function(j){if(!r.ok){throw new Error(j&&j.error?j.error:('HTTP '+r.status));}return j;});});
  }
  function setBusy(btn,busy,label){
    btn.disabled=busy;
    btn.innerHTML=busy?'<span class="spin"></span>'+label:btn.getAttribute('data-label');
  }
  function cfg(){ return configs[currentCollection]; }
  function setStatus(msg){ $('e_collection_status').textContent = msg || ''; }
  function renderCategories(selected){
    $('e_cat').innerHTML = cfg().categories.map(function(pair){
      return '<option value="'+esc(pair[0])+'"'+(pair[0]===selected?' selected':'')+'>'+esc(pair[1])+'</option>';
    }).join('');
  }
  function renderFields(){
    var c = cfg();
    $('e_list_title').textContent = c.label+'を選ぶ';
    $('e_form_title').textContent = c.label+'を修正する';
    $('e_date_label').textContent = c.dateLabel;
    $('e_summary_box').hidden = currentCollection !== 'cases';
    $('e_news_box').hidden = currentCollection !== 'news';
    $('e_featured').closest('label').hidden = currentCollection === 'blog';
    $('e_body_label').textContent = currentCollection === 'news' ? '本文（外部URLがない場合は必須）' : '本文';
    renderCategories('');
  }
  function resetForm(){
    $('e_form_box').hidden = true;
    $('e_sha').value = '';
    $('e_original_slug').value = '';
    $('e_result').innerHTML = '';
    $('e_msg').textContent = '';
  }
  function emptyHtml(){
    return '<div class="empty">'+esc(cfg().label)+'はまだ見つかりません。<br><a href="'+esc(BASE+cfg().newPath)+'">'+esc(cfg().label)+'を書く</a></div>';
  }
  function renderList(items){
    var box=$('e_list');
    if(!items.length){ box.innerHTML=emptyHtml(); return; }
    box.innerHTML=items.map(function(a){
      var state=a.isDraft?'<span class="badge">下書き</span>':'';
      var featured=a.featured?'<span class="badge">注目</span>':'';
      var date=a.pubDate||a.publishedAt||'日付なし';
      return '<article class="article-item"><div><b>'+esc(a.title||a.slug)+'</b>'+state+featured+
        '<p>'+esc(a.description||'説明なし')+'</p><small>'+esc(date)+' / '+esc(a.category||'未分類')+' / '+esc(a.slug)+'</small></div>'+
        '<button class="ghost" type="button" data-slug="'+esc(a.slug)+'">編集</button></article>';
    }).join('');
    var buttons=box.querySelectorAll('button[data-slug]');
    for(var i=0;i<buttons.length;i++){
      buttons[i].addEventListener('click',function(){ loadArticle(this.getAttribute('data-slug')); });
    }
  }
  function loadList(){
    resetForm();
    $('e_list_status').textContent='読み込み中...';
    getJson('/api/articles?collection='+encodeURIComponent(currentCollection)).then(function(j){
      renderList(j.articles||[]);
      $('e_list_status').textContent=(j.articles||[]).length+'件';
    }).catch(function(e){
      $('e_list').innerHTML='<div class="err">'+esc(e.message)+'</div>';
      $('e_list_status').textContent='';
    });
  }
  function loadArticle(slug){
    $('e_msg').textContent='';
    $('e_result').innerHTML='';
    getJson('/api/article?collection='+encodeURIComponent(currentCollection)+'&slug='+encodeURIComponent(slug)).then(function(j){
      var a=j.article||{};
      $('e_sha').value=j.sha||'';
      $('e_original_slug').value=a.slug||slug;
      $('e_slug').value=a.slug||slug;
      $('e_title').value=a.title||'';
      $('e_desc').value=a.description||'';
      renderCategories(a.category||cfg().categories[0][0]);
      $('e_date').value=a[cfg().dateKey]||'';
      $('e_tags').value=(a.tags||[]).join(', ');
      $('e_summary').value=a.summary||'';
      $('e_external').value=a.externalUrl||'';
      $('e_source').value=a.source||'';
      $('e_body').value=a.body||'';
      $('e_featured').checked=a.featured===true;
      $('e_draft').checked=a.isDraft===true;
      $('e_form_box').hidden=false;
      $('e_msg').textContent=cfg().label+'を読み込みました';
    }).catch(function(e){
      $('e_msg').innerHTML='<span style="color:#dc2626">'+esc(e.message)+'</span>';
    });
  }
  function gather(){
    var tags = $('e_tags').value.split(',').map(function(s){return s.trim();}).filter(Boolean);
    var article = {
      slug:$('e_slug').value.trim(),
      title:$('e_title').value.trim(),
      description:$('e_desc').value.trim(),
      category:$('e_cat').value,
      tags:tags,
      body:$('e_body').value,
      isDraft:$('e_draft').checked
    };
    if(currentCollection === 'blog'){
      article.pubDate = $('e_date').value;
    } else {
      article.publishedAt = $('e_date').value;
      article.featured = $('e_featured').checked;
    }
    if(currentCollection === 'news'){
      article.externalUrl = $('e_external').value.trim();
      article.source = $('e_source').value.trim();
    }
    if(currentCollection === 'cases'){
      article.summary = $('e_summary').value.trim();
    }
    return article;
  }
  function validateLocal(a){
    if(!/^[a-z0-9-]{3,80}$/.test(a.slug)) return 'URL が不正です。記事を開き直してください';
    if(a.slug !== $('e_original_slug').value) return 'URL は変更できません。記事を開き直してください';
    if(!a.title) return 'タイトルを入力してください';
    if(!a.description) return '説明を入力してください';
    var date = currentCollection === 'blog' ? a.pubDate : a.publishedAt;
    if(date && !/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) return '公開日は YYYY-MM-DD で入力してください';
    if(currentCollection === 'cases' && !a.summary) return 'リード文を入力してください';
    if(currentCollection === 'news'){
      if(a.externalUrl && !/^https?:\\/\\//i.test(a.externalUrl)) return '外部URLは http(s) のURLを入力してください';
      if(!a.externalUrl && !a.body.trim()) return '外部URLがないニュースは本文を入力してください';
    } else if(!a.body.trim()) {
      return '本文を入力してください';
    }
    if(!$('e_sha').value) return '更新元の記事情報がありません。記事を開き直してください';
    return '';
  }
  function switchCollection(next){
    if(!configs[next]) return;
    currentCollection = next;
    var tabs=document.querySelectorAll('.collection-tab');
    for(var i=0;i<tabs.length;i++){
      var on=tabs[i].getAttribute('data-collection')===next;
      tabs[i].setAttribute('aria-pressed',on?'true':'false');
      tabs[i].className=on?'primary collection-tab':'ghost collection-tab';
    }
    renderFields();
    setStatus(cfg().label+'を表示中');
    loadList();
  }
  $('e_reload').addEventListener('click',loadList);
  $('e_save').setAttribute('data-label','更新する');
  $('e_save').addEventListener('click',function(){
    var article=gather();
    var err=validateLocal(article);
    if(err){ $('e_msg').innerHTML='<span style="color:#dc2626">'+esc(err)+'</span>'; return; }
    if(!confirm(cfg().label+'を同じURLで更新します。よろしいですか？')) return;
    var btn=this; setBusy(btn,true,'更新中...'); $('e_msg').textContent='公開前チェック中...'; $('e_result').innerHTML='';
    postJson('/api/update',{collection:currentCollection,originalSlug:$('e_original_slug').value,article:article,sha:$('e_sha').value}).then(function(j){
      var link=j&&j.commitUrl?'<a href="'+esc(safeUrl(j.commitUrl))+'" target="_blank" rel="noopener">コミットを見る</a>':'';
      $('e_result').innerHTML='<div class="done">更新しました。数分でサイトに反映されます。 '+link+'</div>';
      $('e_msg').textContent='';
      setBusy(btn,false,'');
      loadList();
    }).catch(function(e){
      $('e_msg').innerHTML='<span style="color:#dc2626">'+esc(e.message)+'</span>';
      setBusy(btn,false,'');
    });
  });
  var tabs=document.querySelectorAll('.collection-tab');
  for(var i=0;i<tabs.length;i++){
    tabs[i].addEventListener('click',function(){ switchCollection(this.getAttribute('data-collection')); });
  }
  switchCollection('blog');
`;

export const EDIT_HTML = head('既存コンテンツを編集 — 読みもの 作成スタジオ') + header('edit') + BODY + tail(JS);
