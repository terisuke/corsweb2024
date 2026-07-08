import type { Locale } from '../utils/i18n';

export interface NewsCategoryConfig {
  id: string;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
}

export const NEWS_CATEGORIES = [
  {
    id: 'info',
    label: {
      ja: 'お知らせ',
      en: 'Information',
      zh: '公告',
      ko: '공지',
      es: 'Aviso',
    },
    description: {
      ja: 'Cor.株式会社からのお知らせ',
      en: 'Company updates from Cor. Inc.',
      zh: 'Cor.株式会社的公告',
      ko: 'Cor. 주식회사의 공지',
      es: 'Avisos de Cor. Inc.',
    },
  },
  {
    id: 'media',
    label: {
      ja: 'メディア',
      en: 'Media',
      zh: '媒体',
      ko: '미디어',
      es: 'Medios',
    },
    description: {
      ja: '外部掲載・発信に関する情報',
      en: 'External coverage and publishing updates',
      zh: '外部报道和发布信息',
      ko: '외부 게재 및 발신 정보',
      es: 'Cobertura externa y publicaciones',
    },
  },
  {
    id: 'update',
    label: {
      ja: 'アップデート',
      en: 'Update',
      zh: '更新',
      ko: '업데이트',
      es: 'Actualización',
    },
    description: {
      ja: 'サービス・サイト・公開情報の更新',
      en: 'Updates to services, the website, and public information',
      zh: '服务、网站和公开信息的更新',
      ko: '서비스, 사이트, 공개 정보의 업데이트',
      es: 'Actualizaciones de servicios, sitio e información pública',
    },
  },
  {
    id: 'event',
    label: {
      ja: 'イベント',
      en: 'Event',
      zh: '活动',
      ko: '이벤트',
      es: 'Evento',
    },
    description: {
      ja: '登壇・展示・イベント参加に関する情報',
      en: 'Talks, exhibitions, and event participation',
      zh: '演讲、展览和活动参与信息',
      ko: '발표, 전시, 이벤트 참여 정보',
      es: 'Charlas, exhibiciones y participación en eventos',
    },
  },
  {
    id: 'award',
    label: {
      ja: '受賞',
      en: 'Award',
      zh: '获奖',
      ko: '수상',
      es: 'Premio',
    },
    description: {
      ja: '受賞・採択などの公開可能な実績',
      en: 'Awards, selections, and other publishable achievements',
      zh: '获奖、入选等可公开成果',
      ko: '수상, 선정 등 공개 가능한 성과',
      es: 'Premios, selecciones y otros logros publicables',
    },
  },
] as const satisfies readonly NewsCategoryConfig[];

export const getNewsCategoryConfig = (categoryId: string): NewsCategoryConfig | undefined =>
  NEWS_CATEGORIES.find((category) => category.id === categoryId);

export const getNewsCategoryLabel = (categoryId: string, locale: Locale): string =>
  getNewsCategoryConfig(categoryId)?.label[locale] ?? categoryId;

export const getNewsCategoryIds = (): string[] => NEWS_CATEGORIES.map((category) => category.id);
