import { describe, it, expect } from 'vitest';
import { safeJsonLd } from '../json-ld';

describe('safeJsonLd', () => {
  it('escapes </script> so a <script type="application/ld+json"> block cannot be closed early', () => {
    const malicious = {
      headline: 'hello</script><script>alert(document.cookie)</script>world',
    };

    const serialized = safeJsonLd(malicious);

    // 反証可能性: このアサーションは JSON.stringify をそのまま使うと必ず失敗する
    // (`</script>` がそのまま出力に残るため)。safeJsonLd が < をエスケープして
    // 初めて成立する。
    expect(serialized).not.toContain('</script>');
    expect(serialized).not.toContain('<script>');
  });

  it('produces valid JSON that round-trips back to the original value', () => {
    const malicious = {
      title: 'hello</script><script>alert(1)</script>world',
      tags: ['<b>tag</b>', 'normal-tag'],
    };

    const serialized = safeJsonLd(malicious);
    const parsed = JSON.parse(serialized);

    expect(parsed).toEqual(malicious);
  });

  it('leaves ordinary content untouched other than the JSON.stringify formatting', () => {
    const data = { headline: 'ふつうのタイトル', count: 3, ok: true };

    expect(safeJsonLd(data)).toBe(JSON.stringify(data));
  });

  it('demonstrates the vulnerability that motivated this fix: raw JSON.stringify is unsafe', () => {
    const malicious = { headline: 'hello</script><script>alert(1)</script>world' };

    // これは safeJsonLd ではなく素の JSON.stringify の挙動を示す対照実験。
    // </script> が生の文字列としてそのまま残ることを確認し、safeJsonLd が
    // 対処している問題が実在することを裏付ける。
    expect(JSON.stringify(malicious)).toContain('</script>');
  });
});
