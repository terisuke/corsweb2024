interface JaTranslation {
  nav: {
    home: string;
    about: string;
    products: string;
    contact: string;
    privacy: string;
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
  };
  mission: {
    title: string;
    description1: string;
    description2: string;
    stats: Array<{
      name: string;
      value: string;
    }>;
  };
  contact: {
    title: string;
    description1: string;
    description2: string;
    form: {
      name: string;
      email: string;
      message: string;
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
    privacy: { title: string; description: string; };
  };
  faq: {
    questions: Array<{
      id: string;
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
    }>;
  };
}
declare const value: JaTranslation;
export default value;
