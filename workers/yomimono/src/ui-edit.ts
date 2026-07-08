import { head, header, tail } from './ui-shared';

const BODY = `<main class="wide">
  <p class="lead">公開済みの記事を選んで、タイトル・説明・カテゴリ・タグ・本文を修正できます。URL（slug）は事故防止のため変更しません。</p>

  <div class="split">
    <section class="step">
      <h2>記事を選ぶ</h2>
      <p class="hint">最近の記事から順に表示します。修正したい記事の「編集」を押してください。</p>
      <div class="row" style="margin-bottom:10px">
        <button class="ghost" id="e_reload" type="button">一覧を更新</button>
        <span class="meta" id="e_list_status"></span>
      </div>
      <div class="article-list" id="e_list"></div>
    </section>

    <section class="step" id="e_form_box" hidden>
      <h2>記事を修正する</h2>
      <p class="hint">保存前に公開前チェックを実行します。問題がなければ同じURLの記事を更新します。</p>
      <input id="e_sha" type="hidden">
      <div class="field"><label>URL（変更不可）</label><input id="e_slug" readonly></div>
      <div class="field"><label>タイトル</label><input id="e_title"></div>
      <div class="field"><label>記事のまとめ</label><input id="e_desc"></div>
      <div class="row" style="gap:14px">
        <div class="field" style="flex:1;min-width:190px;margin:0"><label>カテゴリ</label>
          <select id="e_cat"><option value="ai">AI</option><option value="engineering">エンジニアリング</option><option value="founder">創業</option><option value="lab">ラボ</option></select>
        </div>
        <div class="field" style="flex:2;min-width:220px;margin:0"><label>タグ（カンマ区切り）</label><input id="e_tags"></div>
      </div>
      <div class="field"><label>本文</label><textarea id="e_body" maxlength="100000"></textarea></div>
      <label class="checkline"><input id="e_draft" type="checkbox"> 下書きとして保存する（公開一覧には出しません）</label>
      <div class="row" style="margin-top:14px">
        <button class="pub" id="e_save" type="button">更新する</button>
        <span class="meta" id="e_msg"></span>
      </div>
      <div id="e_result"></div>
    </section>
  </div>
</main>`;

const JS = `
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
  function renderList(items){
    var box=$('e_list');
    if(!items.length){ box.innerHTML='<div class="empty">編集できる記事が見つかりません。</div>'; return; }
    box.innerHTML=items.map(function(a){
      var state=a.isDraft?'<span class="badge">下書き</span>':'';
      return '<article class="article-item"><div><b>'+esc(a.title||a.slug)+'</b>'+state+
        '<p>'+esc(a.description||'説明なし')+'</p><small>'+esc(a.pubDate||'日付なし')+' / '+esc(a.category||'未分類')+' / '+esc(a.slug)+'</small></div>'+
        '<button class="ghost" type="button" data-slug="'+esc(a.slug)+'">編集</button></article>';
    }).join('');
    var buttons=box.querySelectorAll('button[data-slug]');
    for(var i=0;i<buttons.length;i++){
      buttons[i].addEventListener('click',function(){ loadArticle(this.getAttribute('data-slug')); });
    }
  }
  function loadList(){
    $('e_list_status').textContent='読み込み中…';
    getJson('/api/articles').then(function(j){
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
    getJson('/api/article?slug='+encodeURIComponent(slug)).then(function(j){
      var a=j.article||{};
      $('e_sha').value=j.sha||'';
      $('e_slug').value=a.slug||slug;
      $('e_title').value=a.title||'';
      $('e_desc').value=a.description||'';
      $('e_cat').value=a.category||'ai';
      $('e_tags').value=(a.tags||[]).join(', ');
      $('e_body').value=a.body||'';
      $('e_draft').checked=a.isDraft===true;
      $('e_form_box').hidden=false;
      $('e_msg').textContent='記事を読み込みました';
    }).catch(function(e){
      $('e_msg').innerHTML='<span style="color:#dc2626">'+esc(e.message)+'</span>';
    });
  }
  function gather(){
    return {
      slug:$('e_slug').value.trim(),
      title:$('e_title').value.trim(),
      description:$('e_desc').value.trim(),
      category:$('e_cat').value,
      tags:$('e_tags').value.split(',').map(function(s){return s.trim();}).filter(Boolean),
      body:$('e_body').value,
      isDraft:$('e_draft').checked
    };
  }
  function validateLocal(a){
    if(!/^[a-z0-9-]{3,80}$/.test(a.slug)) return 'URL が不正です。記事を開き直してください';
    if(!a.title) return 'タイトルを入力してください';
    if(!a.description) return '記事のまとめを入力してください';
    if(!a.body.trim()) return '本文を入力してください';
    if(!$('e_sha').value) return '更新元の記事情報がありません。記事を開き直してください';
    return '';
  }
  $('e_reload').addEventListener('click',loadList);
  $('e_save').setAttribute('data-label','更新する');
  $('e_save').addEventListener('click',function(){
    var article=gather();
    var err=validateLocal(article);
    if(err){ $('e_msg').innerHTML='<span style="color:#dc2626">'+esc(err)+'</span>'; return; }
    if(!confirm('この記事を同じURLで更新します。よろしいですか？')) return;
    var btn=this; setBusy(btn,true,'更新中…'); $('e_msg').textContent='公開前チェック中…'; $('e_result').innerHTML='';
    postJson('/api/update',{article:article,sha:$('e_sha').value}).then(function(j){
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
  loadList();
`;

export const EDIT_HTML = head('既存記事を編集 — 読みもの 作成スタジオ') + header('edit') + BODY + tail(JS);
