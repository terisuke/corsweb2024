export interface CategoryConfig {
  id: string;
  label: {
    ja: string;
    en: string;
  };
  description?: {
    ja: string;
    en: string;
  };
  color?: string;
}

export const BLOG_CATEGORIES: CategoryConfig[] = [
  {
    id: 'ai',
    label: {
      ja: 'AI',
      en: 'AI'
    },
    description: {
      ja: 'AI・機械学習に関する記事',
      en: 'Articles about AI and Machine Learning'
    },
    color: 'bg-blue-500'
  },
  {
    id: 'engineering',
    label: {
      ja: 'エンジニアリング',
      en: 'Engineering'
    },
    description: {
      ja: 'ソフトウェア開発・技術に関する記事',
      en: 'Articles about software development and technology'
    },
    color: 'bg-green-500'
  },
  {
    id: 'founder',
    label: {
      ja: '創業者の歩み',
      en: 'Founder\'s Journey'
    },
    description: {
      ja: 'スタートアップ創業・経営に関する記事',
      en: 'Articles about startup founding and management'
    },
    color: 'bg-purple-500'
  },
  {
    id: 'lab',
    label: {
      ja: '技術実験室',
      en: 'Tech Lab'
    },
    description: {
      ja: '技術実験・創作プロジェクトに関する記事',
      en: 'Articles about technical experiments and creative projects'
    },
    color: 'bg-orange-500'
  }
];

export const getCategoryConfig = (categoryId: string): CategoryConfig | undefined => {
  return BLOG_CATEGORIES.find(cat => cat.id === categoryId);
};

export const getCategoryLabel = (categoryId: string, lang: 'ja' | 'en'): string => {
  const config = getCategoryConfig(categoryId);
  return config?.label[lang] || categoryId;
};

export const getCategoryIds = (): string[] => {
  return BLOG_CATEGORIES.map(cat => cat.id);
};

export const getCategoryDescription = (categoryId: string, lang: 'ja' | 'en'): string | undefined => {
  const config = getCategoryConfig(categoryId);
  return config?.description?.[lang];
};