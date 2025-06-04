interface EnTranslation {
  nav: {
    home: string;
    about: string;
    products: string;
    contact: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  services: {
    title: string;
    items: Array<{
      step: string;
      name: string;
      description: string;
    }>;
  };
  about: {
    title: string;
    description: string;
    cta: string;
    heading?: {
      title: string;
      description: string;
    };
  };
  mission: {
    title: string;
    subtitle?: string;
    description?: string;
    description1?: string;
    description2?: string;
    stats: Array<{
      name: string;
      value: string;
    }>;
  };
  contact: {
    title: string;
    description1: string;
    description2: string;
    heading?: {
      title: string;
      description: string;
    };
    form: {
      title?: string;
      description1?: string;
      description2?: string;
      fields?: {
        name: string;
        email: string;
        message: string;
      };
      submit: string;
      reset: string;
    };
  };
  footer: {
    title: string;
    social: string;
    company: string;
    legal: string;
    links: {
      home: string;
      about: string;
      products: string;
      contact: string;
      privacy: string;
    };
    description: string;
    copyright: string;
  };
  header: {
    mobileMenuDescription: string;
  };
  "404": {
    title: string;
    subtitle: string;
    description: string;
    cta: string;
  };
  aboutPage: {
    title: string;
    subtitle: string;
  };
  meta: {
    home: { title: string; description: string; };
    about: { title: string; description: string; };
    contact: { title: string; description: string; };
    products: { title: string; description: string; };
    "404": { title: string; description: string; };
    privacy?: { title: string; description: string; };
  };
  faq: {
    title?: string;
    questions: Array<{
      id?: string;
      question: string;
      answer: string;
    }>;
  };
  testimonials: {
    title: string;
    items: Array<{
      id: string;
      name: string;
      role: string;
      message: string;
    } | {
      name: string;
      description: string;
      image: string;
      message: string;
    }>;
  };
  features?: {
    title: string;
    items: Array<{
      id: string;
      name: string;
      description: string;
    }>;
  };
  cta?: {
    title: string;
    description: string;
  };
  products?: {
    heading: {
      title: string;
      description: string;
    };
  };
  homeCta?: {
    title: string;
    description: string;
    button: string;
  };
  productsTable?: {
    title: string;
    demoLabel: string;
    mediaTitle: string;
    products: Array<{
      name: string;
      description: string;
      demo: string;
    }>;
    articles?: Array<{
      name: string;
      description: string;
      icon: string;
      action: string;
      isFlagged?: boolean;
    }>;
    youtube?: Array<{
      name: string;
      description: string;
      isFlagged: boolean;
      icon: string;
      id: string[];
    }>;
  };
  calendar?: {
    title: string;
    description: string;
    ariaLabel: string;
    note: string;
  };
  contactInfo?: {
    address: {
      label: string;
      value: string;
    };
    phone: {
      label: string;
      value: string;
    };
    chat: {
      label: string;
      value: string;
    };
  };
  valuesData?: Array<Array<{
    ref: string;
    name: string;
    description: string;
  }>>;
  teamData?: Array<{
    name: string;
    image: string;
    job: string;
    description?: string;
    comingSoon: boolean;
    link: string;
    zennLink?: string;
  }>;
}
declare const value: EnTranslation;
export default value;
