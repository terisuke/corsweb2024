import { describe, it, expect } from 'vitest';
import { scanForViolations } from '../guardrails';

describe('scanForViolations — 公開禁止パターン検出', () => {
  it('クリーンな本文は違反0', () => {
    expect(scanForViolations('# 見出し\n\nAI導入のポイントを解説します。')).toHaveLength(0);
  });

  // 旧事業名（バグ＝検出漏れがあればこのアサーションが落ちる）
  it.each(['TapForge', 'BoltSite', 'IoTRealm', 'IoT戦略', 'IT戦略コンサル'])(
    '旧事業名 %s を検出する',
    (term) => {
      const v = scanForViolations(`弊社の${term}を活用して`);
      expect(v.some((x) => x.name === '旧事業名')).toBe(true);
    },
  );

  it('未取得認証の「取得済み」主張を検出する', () => {
    const v = scanForViolations('当社はISMSを取得済みです。');
    expect(v.some((x) => x.name.includes('未取得認証'))).toBe(true);
  });

  it('ISMS「整備中」表記は許可（誤検出しない）', () => {
    const v = scanForViolations('ISMSの取得に向け整備中です。');
    expect(v.filter((x) => x.name.includes('未取得認証'))).toHaveLength(0);
  });

  it('プレビューURL漏洩を検出する', () => {
    const v = scanForViolations('詳細は https://cor-jp-main--develop-v6sxy3wv.web.app をご覧ください');
    expect(v.some((x) => x.name.includes('プレビュー'))).toBe(true);
  });

  it('行番号とマッチ文字列を返す', () => {
    const v = scanForViolations('1行目\n2行目にTapForge');
    expect(v[0]).toMatchObject({ line: 2, match: 'TapForge' });
  });
});
