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
  PUBLISH_BRANCH: string;
  ALLOWED_EMAIL_DOMAIN: string;
  STYLE_GUIDE_PATH: string;
  // Cloudflare Access（JWT検証用）。Accessアプリ作成後に設定。未設定なら全リクエスト拒否（fail closed）。
  CF_ACCESS_TEAM_DOMAIN: string; // 例: cor.cloudflareaccess.com
  CF_ACCESS_AUD: string; // Access アプリの Application Audience (AUD) タグ
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
