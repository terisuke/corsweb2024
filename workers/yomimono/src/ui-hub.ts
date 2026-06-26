import { head, header, tail } from './ui-shared';

// ログイン後の入口。AI生成 / 手動作成 の2択。
export const HUB_HTML =
  head('ハブ — 読みもの 作成スタジオ') +
  header('hub') +
  '<main>' +
  '<p class="lead">記事の作り方を選んでください。どちらで書いても、記事は main マージ不要でそのまま cor-jp.com に公開されます。</p>' +
  '<div class="hub">' +
  '<a href="__BASE__/ai"><div class="ic">🤖</div><h3>AI生成</h3>' +
  '<p>最新トピックを収集し、社長の文体でAIが下書き。確認・編集して公開します。</p></a>' +
  '<a href="__BASE__/manual"><div class="ic">✍️</div><h3>手動作成</h3>' +
  '<p>テキストと画像を自分で貼って記事を作成。ライブプレビューで確認して公開します。</p></a>' +
  '</div></main>' +
  tail('');
