export type Collection = 'blog' | 'news' | 'cases';

export interface Env {
  // secrets
  ANTHROPIC_API_KEY: string;
  GH_APP_PRIVATE_KEY: string;
  // vars
  GH_OWNER: string;
  GH_REPO: string;
  GH_APP_ID: string;
  GH_INSTALLATION_ID: string;
  BLOG_DIR: string;
  NEWS_DIR: string;
  CASES_DIR: string;
  PUBLISH_BRANCH: string;
  STYLE_GUIDE_PATH: string;
  BASE_PATH: string; // マウントプレフィックス（例 /blog-admin）。cor-jp.com/blog-admin* ルートで使用。空ならルート直下。
  // ログイン（Worker内蔵セッション）。どちらか未設定なら全リクエスト拒否（fail closed）。secretで登録。
  ACCESS_PASSWORD: string; // ログインの合言葉
  SESSION_SECRET: string; // セッションCookieのHMAC署名鍵（ランダム32バイト推奨）
}

export interface TopicCandidate {
  title: string;
  summary: string;
  sources: string[];
  freshnessHours: number;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: 'ai' | 'engineering' | 'founder' | 'lab';
  tags: string[];
  body: string;
}

export interface Violation {
  name: string;
  reason: string;
  line: number;
  match: string;
}
