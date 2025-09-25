export interface CategoryConfig {
  id: string;
  label: {
    ja: string;
    en: string;
    zh?: string;
    ko?: string;
    es?: string;
  };
  description?: {
    ja: string;
    en: string;
    zh?: string;
    ko?: string;
    es?: string;
  };
  color?: string;
}

export const BLOG_CATEGORIES: CategoryConfig[] = [
  {
    id: 'ai',
    label: {
      ja: 'AI',
      en: 'AI',
      zh: '人工智能',
      ko: 'AI',
      es: 'IA'
    },
    description: {
      ja: 'AI・機械学習に関する記事',
      en: 'Articles about AI and Machine Learning',
      zh: '關於人工智能和機器學習的文章',
      ko: 'AI 및 머신러닝에 대한 글',
      es: 'Artículos sobre IA y Aprendizaje Automático'
    },
    color: 'bg-blue-500'
  },
  {
    id: 'engineering',
    label: {
      ja: 'エンジニアリング',
      en: 'Engineering',
      zh: '工程',
      ko: '엔지니어링',
      es: 'Ingeniería'
    },
    description: {
      ja: 'ソフトウェア開発・技術に関する記事',
      en: 'Articles about software development and technology',
      zh: '關於軟件開發和技術的文章',
      ko: '소프트웨어 개발 및 기술에 대한 글',
      es: 'Artículos sobre desarrollo de software y tecnología'
    },
    color: 'bg-green-500'
  },
  {
    id: 'founder',
    label: {
      ja: '創業',
      en: 'Founder',
      zh: '創業',
      ko: '창업',
      es: 'Fundador'
    },
    description: {
      ja: 'スタートアップ創業・経営に関する記事',
      en: 'Articles about startup founding and management',
      zh: '關於創業和管理的文章',
      ko: '스타트업 창업 및 경영에 대한 글',
      es: 'Artículos sobre fundación y gestión de startups'
    },
    color: 'bg-purple-500'
  },
  {
    id: 'lab',
    label: {
      ja: 'ラボ',
      en: 'Lab',
      zh: '實驗室',
      ko: '연구소',
      es: 'Laboratorio'
    },
    description: {
      ja: '技術実験・創作プロジェクトに関する記事',
      en: 'Articles about technical experiments and creative projects',
      zh: '關於技術實驗和創意項目的文章',
      ko: '기술 실험 및 창작 프로젝트에 대한 글',
      es: 'Artículos sobre experimentos técnicos y proyectos creativos'
    },
    color: 'bg-orange-500'
  }
];

export const getCategoryConfig = (categoryId: string): CategoryConfig | undefined => {
  return BLOG_CATEGORIES.find(cat => cat.id === categoryId);
};

export const getCategoryLabel = (categoryId: string, lang: 'ja' | 'en' | 'zh' | 'ko' | 'es'): string => {
  const config = getCategoryConfig(categoryId);
  return config?.label[lang] || config?.label.en || categoryId;
};

export const getCategoryIds = (): string[] => {
  return BLOG_CATEGORIES.map(cat => cat.id);
};

export const getCategoryDescription = (categoryId: string, lang: 'ja' | 'en' | 'zh' | 'ko' | 'es'): string | undefined => {
  const config = getCategoryConfig(categoryId);
  return config?.description?.[lang] || config?.description?.en;
};