// JSON-LD を <script type="application/ld+json"> に set:html で埋め込む際の安全なシリアライズ。
// frontmatter (title/description/tags/author 等) に "</script><script>..." のような文字列が
// 含まれていても、</script> によるタグの早期終了を防ぐ。< は JSON文字列として正当な
// エスケープなので、JSON-LD を読むパーサー側では通常通り "<" として解釈される。
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
