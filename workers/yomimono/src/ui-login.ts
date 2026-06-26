import { head, tail } from './ui-shared';

// ログイン画面（Cloudflare Access の代替）。合言葉を入れてセッションCookieを得る。
const BODY = `<main style="max-width:420px;margin-top:9vh">
  <div class="step" style="text-align:center">
    <h1 style="font-size:18px;color:var(--navy);margin:2px 0">読みもの 作成スタジオ</h1>
    <p class="lead" style="text-align:center;margin:8px 0 16px">合言葉を入力してログインしてください。</p>
    <div class="field" style="text-align:left">
      <label>合言葉</label>
      <input id="pw" type="password" autocomplete="current-password" placeholder="合言葉">
    </div>
    <div class="row" style="justify-content:center;margin-top:6px">
      <button class="primary" id="loginBtn">ログイン</button>
    </div>
    <div id="msg" class="meta" style="margin-top:12px"></div>
  </div>
</main>`;

const JS = `
  function doLogin(){
    var pw = $('pw').value;
    if(!pw){ $('msg').innerHTML='<span style="color:#dc2626">合言葉を入力してください</span>'; return; }
    var b = $('loginBtn'); b.disabled=true; b.innerHTML='<span class="spin"></span>確認中…'; $('msg').textContent='';
    api('/api/login', { password: pw }).then(function(){ window.location = BASE + '/'; })
      .catch(function(e){ $('msg').innerHTML='<span style="color:#dc2626">'+esc(e.message)+'</span>'; b.disabled=false; b.innerHTML='ログイン'; });
  }
  $('loginBtn').addEventListener('click', doLogin);
  $('pw').addEventListener('keydown', function(e){ if(e.key==='Enter') doLogin(); });
`;

export const LOGIN_HTML = head('ログイン — 読みもの 作成スタジオ') + BODY + tail(JS);
