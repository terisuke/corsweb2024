import type { ChatLocale, ContactIntent } from '../types';

export interface PressFixture {
  name: string;
  locale: ChatLocale;
  requestType: 'interview' | 'speaking' | 'other';
  readyForContact: boolean;
  raw: string;
}

export const PRESS_INTENT: ContactIntent = 'press-speaking-other';

// Non-PII contract fixtures for the three outreach paths. These intentionally
// cover both a qualifying turn and a ready handoff without asserting prose style.
export const PRESS_FIXTURES: readonly PressFixture[] = [
  {
    name: 'ja interview qualifying',
    locale: 'ja',
    requestType: 'interview',
    readyForContact: false,
    raw: JSON.stringify({
      reply: '取材のテーマと掲載時期を教えてください。',
      summary: 'AI活用事例の取材依頼。掲載時期を確認中。',
      classification: 'genuine',
      readyForContact: false,
      intent: PRESS_INTENT,
      structuredLead: {
        purpose: 'AI活用事例の取材',
        industryRole: '技術メディア・編集者',
        dataSensitivity: '一般公開予定',
      },
    }),
  },
  {
    name: 'ja speaking ready',
    locale: 'ja',
    requestType: 'speaking',
    readyForContact: true,
    raw: JSON.stringify({
      reply: '登壇テーマ、形式、開催時期を確認しました。担当へ引き継ぐ準備が整いました。',
      summary: '生成AIの実務活用をテーマにした招待制カンファレンスの登壇依頼。来月開催、公開情報のみで準備予定。',
      classification: 'genuine',
      readyForContact: true,
      intent: PRESS_INTENT,
      structuredLead: {
        purpose: '生成AIの実務活用に関する30分登壇',
        industryRole: 'IT企業・企画担当',
        dataSensitivity: '招待制・公開情報のみ',
        stage: '企画進行中',
        timingBudget: '来月開催',
      },
    }),
  },
  {
    name: 'en speaking qualifying',
    locale: 'en',
    requestType: 'speaking',
    readyForContact: false,
    raw: JSON.stringify({
      reply: 'What audience and format should we plan for?',
      summary: 'Speaking invitation about practical AI adoption for an industry event; format and deadline are being confirmed.',
      classification: 'genuine',
      readyForContact: false,
      intent: PRESS_INTENT,
      structuredLead: {
        purpose: 'Speaking invitation about practical AI adoption',
        industryRole: 'Event organizer',
        dataSensitivity: 'Public event',
      },
    }),
  },
  {
    name: 'en other ready',
    locale: 'en',
    requestType: 'other',
    readyForContact: true,
    raw: JSON.stringify({
      reply: 'I have enough context to pass this event-participation request to the team for review.',
      summary: 'Request for Cor. participation in a public co-hosted event next month; the organizer role and format are confirmed.',
      classification: 'genuine',
      readyForContact: true,
      intent: PRESS_INTENT,
      structuredLead: {
        purpose: 'Participation in a co-hosted event',
        industryRole: 'Event organizer',
        dataSensitivity: 'Public event',
        stage: 'Planning',
        timingBudget: 'Next month',
      },
    }),
  },
];
