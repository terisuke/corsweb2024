import { head, header, tail } from './ui-shared';

// ログイン後の入口。統合CMSの collection 別作成 / 既存コンテンツ編集の入口。
export const HUB_HTML =
  head('ハブ — 読みもの 作成スタジオ') +
  header('hub') +
  '<main>' +
  '<p class="lead">作成・編集するコンテンツの種類を選んでください。保存すると GitHub 経由で静的サイトへ反映されます。</p>' +
  '<div class="hub">' +
  '<a href="__BASE__/manual"><div class="ic">✍️</div><h3>ブログを書く</h3>' +
  '<p>社内知見や技術記事をブログとして作成します。カテゴリ・タグ・本文を入力して公開します。</p></a>' +
  '<a href="__BASE__/manual/news"><div class="ic">📰</div><h3>ニュースを書く</h3>' +
  '<p>お知らせや外部掲載を news として作成します。外部URLがあれば本文なしでも保存できます。</p></a>' +
  '<a href="__BASE__/manual/cases"><div class="ic">📁</div><h3>実績を書く</h3>' +
  '<p>実績記事を作成し、works 詳細ページへ追加します。リード文・公開日・注目表示を入力できます。</p></a>' +
  '<a href="__BASE__/edit"><div class="ic">✎</div><h3>既存コンテンツを編集</h3>' +
  '<p>ブログ・ニュース・実績を選んで、同じURLのまま内容を更新します。</p></a>' +
  '</div></main>' +
  tail('');
