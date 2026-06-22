// ブログ記事（自動生成・手動とも）のガードレール検査。
// 正本ルール違反（旧事業名・未取得認証の「取得済み」主張・漏洩URL/メモ）を機械検出する。
// 使い方: import { scanForViolations } from './blog-guardrails.mjs'
//        const violations = scanForViolations(markdownText)  // [] なら合格

const RULES = [
  {
    name: '旧事業名',
    re: /(TapForge|BoltSite|IoTRealm|IoT戦略|IT戦略コンサル)/g,
    reason: '公開禁止の旧事業名（正本ガードレール）',
  },
  {
    name: '未取得認証の取得済み主張',
    // 「ISMS取得に向け / 取得を目標」等はOK。取得済み/しました/認証取得 を違反とする。
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

/**
 * @param {string} markdown 記事全文（frontmatter含めてOK）
 * @returns {{name:string, reason:string, line:number, match:string}[]}
 */
export function scanForViolations(markdown) {
  const lines = markdown.split('\n');
  const violations = [];
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      for (const m of line.matchAll(rule.re)) {
        violations.push({ name: rule.name, reason: rule.reason, line: i + 1, match: m[0] });
      }
    }
  });
  return violations;
}

// 単体実行: node scripts/blog-guardrails.mjs <file.md> でチェック
if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('node:fs');
  const file = process.argv[2];
  if (!file) {
    console.error('使い方: node scripts/blog-guardrails.mjs <記事.md>');
    process.exit(2);
  }
  const md = fs.readFileSync(file, 'utf8');
  const v = scanForViolations(md);
  if (v.length === 0) {
    console.log(`✅ ガードレール合格: ${file}`);
    process.exit(0);
  }
  console.error(`❌ ガードレール違反 ${v.length}件: ${file}`);
  for (const x of v) console.error(`  L${x.line} [${x.name}] "${x.match}" — ${x.reason}`);
  process.exit(1);
}
