import { head, header, tail } from './ui-shared';

// ログイン後の入口。AI生成 / ブログ作成 / 実績作成 / 既存記事編集 の入口。
export const HUB_HTML =
  head('ハブ — 読みもの 作成スタジオ') +
  header('hub') +
  '<main>' +
  '<p class="lead">記事の作り方を選んでください。どれで書いても、記事は main マージ不要でそのまま cor-jp.com に公開されます。</p>' +
  '<div class="hub">' +
  '<a href="__BASE__/ai"><div class="ic">🤖</div><h3>AI生成</h3>' +
  '<p>最新トピックを収集し、社長の文体でAIが下書き。確認・編集して公開します。</p></a>' +
  '<a href="__BASE__/manual"><div class="ic">✍️</div><h3>ブログ作成</h3>' +
  '<p>テキストと画像を自分で貼ってブログ記事を作成。ライブプレビューで確認して公開します。</p></a>' +
  '<a href="__BASE__/manual/cases"><div class="ic">📁</div><h3>実績作成</h3>' +
  '<p>実績記事を作成し、works 詳細ページへ追加します。カテゴリ・リード文・公開日を入力して公開します。</p></a>' +
  '<a href="__BASE__/edit"><div class="ic">✎</div><h3>既存記事を編集</h3>' +
  '<p>公開済みの記事を選んで、誤字修正や追記を同じURLのまま保存します。</p></a>' +
  '</div></main>' +
  tail('');
