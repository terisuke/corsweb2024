import type { Violation } from './types';

// 正本ガードレール（scripts/blog-guardrails.mjs の TS 版）。
// 旧事業名・未取得認証の「取得済み」主張・漏洩URL/メモを機械検出する。
const RULES: { name: string; re: RegExp; reason: string }[] = [
  {
    name: '旧事業名',
    re: /(TapForge|BoltSite|IoTRealm|IoT戦略|IT戦略コンサル)/g,
    reason: '公開禁止の旧事業名（正本ガードレール）',
  },
  {
    name: '未取得認証の取得済み主張',
    re: /(プライバシーマーク|Pマーク|ISMS|ISO\/?\s?27001|SOC\s?2|SCS|SGS)[^。\n]{0,16}(取得済み|取得しました|取得しています|認証済み|認証取得)/g,
    reason: '未取得の認証を「取得済み」と記載している疑い（ISMSは「取得に向け整備中」表記のみ可）',
  },
  {
    name: '未取得認証の取得済み主張(語順違い)',
    re: /(取得済み|取得しました|認証取得しました)[^。\n]{0,16}(プライバシーマーク|Pマーク|ISMS|ISO\/?\s?27001|SOC\s?2)/g,
    reason: '未取得の認証を「取得済み」と記載している疑い（語順違い）',
  },
  {
    name: 'developプレビューURL漏洩',
    re: /[a-z0-9-]+\.web\.app|cor-jp-main--/gi,
    reason: 'プレビュー/一時ホスティングURLが本文に混入（本番ドメイン cor-jp.com を使う）',
  },
  {
    name: 'draftKey/下書きURL漏洩',
    re: /draftKey|\/draft\/[^\s)]*\bid=/gi,
    reason: '第三者媒体の下書きキー/非公開URLが混入',
  },
  {
    name: '内部編集メモ',
    re: /(編集・監修用|公開時に外部リンクを本文から外す)/g,
    reason: '読者向けでない内部メモが本文に残っている',
  },
];

export function scanForViolations(markdown: string): Violation[] {
  const lines = markdown.split('\n');
  const violations: Violation[] = [];
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      for (const m of line.matchAll(rule.re)) {
        violations.push({ name: rule.name, reason: rule.reason, line: i + 1, match: m[0] });
      }
    }
  });
  return violations;
}
