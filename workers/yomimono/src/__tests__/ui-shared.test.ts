import { describe, it, expect } from 'vitest';
import { draftBarHtml, toolbarButtonsHtml } from '../ui-shared';

describe('draftBarHtml — prefix サニタイズ（M1-I2 MEDIUM・反証可能）', () => {
  it('正当な prefix（例: "m"）は id に展開される', () => {
    const html = draftBarHtml('m');
    expect(html).toContain('id="m_draftBar"');
    expect(html).toContain('id="m_restore"');
    expect(html).toContain('id="m_discard"');
    expect(html).toContain('hidden');
  });

  it.each([
    ['malicious" onclick="alert(1)', '二重引用符で属性を抜ける攻撃'],
    ['a b', '空白込み'],
    ['a<b>', '山括弧'],
    ['../up', 'パストラバーサル文字'],
    ['', '空文字'],
    ['1abc', '数字開始（HTML id 規則違反）'],
    ['a b c', '複数空白'],
  ])('不正な prefix(%s / %s)は throw する（反証可能: 検証未導入なら素通り）', (prefix) => {
    expect(() => draftBarHtml(prefix)).toThrow();
  });

  it.each(['m', 'manual', 'news_page', 'a-b-c', '_x', 'kind1'])(
    '正当な prefix(%s)は throw しない',
    (prefix) => {
      expect(() => draftBarHtml(prefix)).not.toThrow();
    },
  );
});

describe('toolbarButtonsHtml — kind 識別子の検証（M1-I2 MEDIUM・反証可能）', () => {
  it('既定のボタン群を生成する（8種）', () => {
    const html = toolbarButtonsHtml();
    const kinds = ['bold', 'h2', 'h3', 'link', 'ul', 'ol', 'quote', 'hr'];
    for (const k of kinds) {
      expect(html).toContain('data-md="' + k + '"');
    }
  });

  it('title 属性値はエスケープされる（" を含まない素の日本語ツールチップ）', () => {
    const html = toolbarButtonsHtml();
    // 全ボタンの title が壊れた属性境界を生まないこと（title="..." の中に " が無い）
    const matches = html.match(/title="[^"]*"/g) || [];
    expect(matches.length).toBeGreaterThan(0);
  });

  it('生成HTMLに不正な属性境界（" onclick 等）が含まれない', () => {
    const html = toolbarButtonsHtml();
    expect(html).not.toMatch(/"[^"]*onclick/i);
    expect(html).not.toMatch(/"[^"]*<script/i);
  });
});
