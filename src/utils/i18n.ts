export type Locale = 'ja' | 'en';

const translations = {
  ja: {
    nav: { home: "Home", about: "About", products: "Products&Insights", contact: "Contact" },
    hero: {
      title: "Swifter than any, to the horizon beyond.",
      subtitle: "言葉・文化の壁を AI で乗り越え、人と人が真に理解し合える社会を実現します。",
      cta: "実績とプロダクトを見る"
    },
    services: {
      title: "Services",
      items: [
        { step: "01", name: "IT コンサルティング・データ分析", description: "Python ベースのスクレイピングと BI 分析で現状を可視化し、戦略立案から実装まで伴走する DX 支援サービスです。" },
        { step: "02", name: "Web・モバイルアプリ開発", description: "Flutter・React など最新 FW を駆使し、高速かつリッチな UX の B2B/B2C アプリをワンストップで提供します。" },
        { step: "03", name: "AI ソリューション開発", description: "生成 AI／LLM・画像認識・音声処理を活用し、お客様の課題に最適化した知的アプリや自動化ツールを開発します。" }
      ]
    },
    about: {
      title: "About",
      description: "Cor.inc は「競争ではなく共創を通じて未来を切り拓き、幸福な社会を実現する。」をミッションに掲げ、IT戦略コンサルタントやそれに伴うプロダクト開発、自社AI製品の開発・販売を行っています。「競争」よりも「共創」を重視し、スタートアップの強みである「スピード感」を活かし、創造性と革新性に満ちたサービスを提供しています。",
      cta: "More details"
    },
    mission: {
      title: "Our mission",
      subtitle: "誤解のないコミュニケーションを AI で実現し、誰もが自分の価値を発揮できる世界をつくる。",
      description: "Cor.inc は、ITを通じて「幸せ」を追求する世界一の企業として、コミュニケーションの課題を解決し、ユーザー間の共感と共通理解を促進するシステムや仕組みを開発しています。私たちの使命は、日々進化するテクノロジーを活用して、関わる全ての人々が自らの価値を明確に自覚し、真の幸せを追求し達成できるように支援することです。私たちは、すべてのステークホルダーがより幸せな社会を目指して協働し、技術力を駆使して共に真の幸せを共創する未来を創造していきます。",
      stats: [
        { name: "設立から", value: "2年" },
        { name: "使える言語", value: "10" },
        { name: "プロジェクト", value: "15" },
        { name: "提供サービス", value: "App Develop<br />IT/AI Strategy" }
      ]
    },
    contact: {
      title: "お気軽にご相談ください！",
      description1: "お問い合わせ内容を確認後、3営業日以内に担当者よりご連絡させていただきます。今しばらくお待ちください。",
      description2: "上記期間内に返信がない場合は、送信トラブルの可能性がございます。お手数をおかけいたしますが、再度ご連絡いただけますようお願い申し上げます。",
      heading: {
        title: "お問い合わせ",
        description: "ご質問やご相談、お見積もりのご依頼など、お気軽にお問い合わせください。"
      },
      form: {
        title: "お気軽にご相談ください！",
        description1: "お問い合わせ内容を確認後、3営業日以内に担当者よりご連絡させていただきます。今しばらくお待ちください。",
        description2: "上記期間内に返信がない場合は、送信トラブルの可能性がございます。お手数をおかけいたしますが、再度ご連絡いただけますようお願い申し上げます。",
        fields: {
          name: "お名前",
          email: "メールアドレス",
          message: "メッセージ"
        },
        submit: "送信",
        reset: "リセット"
      }
    },
    footer: {
      title: "Footer",
      social: "Social",
      company: "Company",
      legal: "Legal",
      links: {
        home: "Home",
        about: "About",
        products: "Products&Insights",
        contact: "Contact",
        privacy: "Privacy"
      },
      description: "Cor.inc は「競争ではなく共創を通じて未来を切り拓き、幸福な社会を実現する。」をミッションに掲げ、IT戦略コンサルタントやそれに伴うプロダクト開発、自社AI製品の開発・販売を行っています。「競争」よりも「共創」を重視し、スタートアップの強みである「スピード感」を活かし、創造性と革新性に満ちたサービスを提供しています。",
      copyright: "© 2025 Cor.inc"
    },
    features: {
      title: "Features",
      items: [
        {
          id: 'uniqueness-1',
          name: 'デジタル技術の統合',
          description: 'Pythonで収集した情報をもとにIT戦略を立案、MVPのWebアプリを開発してテストマーケティングを行う...このような複数の技術・工程にまたがったプロジェクトを全て私たち1社でカバーすることができます。'
        },
        {
          id: 'uniqueness-2',
          name: 'ワンストップなサービス',
          description: '企画立案から開発、テストリリース、サービス提供開始まで一貫して私たちが担当します。同じチームが担当するので、認識の食い違いが起きにくく、よりローコストでスピーディーな開発を提供します。'
        },
        {
          id: 'uniqueness-3',
          name: 'カスタマーファーストな開発',
          description: '私たちの開発で最も重視することは「顧客の解像度」。細やかなフィードバックやテストマーケティング、マイルストーンを通じて顧客の本当に求めているものを見抜き、Win-Winなビジネスパートナーになれる関係性を築いていきます。'
        },
        {
          id: 'uniqueness-4',
          name: '「最速でスマート」な体験を',
          description: '私たちは新たなトレンドや知識を常に鋭く捉えます。関係者全員にとって有益なソリューションを素早く提案に反映し、これまでにない新しい体験を提供します。'
        },
        {
          id: 'uniqueness-5',
          name: '新しい価値観の創造',
          description: '従来の概念にとらわれることなく、新しい視点やアイデアに真摯に向き合います。スタートアップ特有の「スピード感」を最大限に活かして、生まれたばかりの価値観にテクノロジーを通じて声を与えます。'
        },
        {
          id: 'uniqueness-6',
          name: '独自視点による社会課題の解決',
          description: '人類の進歩への情熱は止まるところを知りません。私たちは、テクノロジーを利用してギャップを埋め、有意義なコミュニケーションを促進しながら、進歩に伴う社会問題の解決に積極的に取り組んでいます。'
        }
      ]
    },
    header: {
      mobileMenuDescription: "Cor.inc は「競争ではなく共創を通じて未来を切り拓き、幸福な社会を実現する。」をミッションに掲げ、IT戦略コンサルタントやそれに伴うプロダクト開発、自社AI製品の開発・販売を行っています。「競争」よりも「共創」を重視し、スタートアップの強みである「スピード感」を活かし、創造性と革新性に満ちたサービスを提供しています。"
    },
    "404": {
      title: "404",
      subtitle: "ページが見つかりません",
      description: "URLをご確認の上、再度お試しください。",
      cta: "ホームに戻る"
    },
    aboutPage: {
      title: "About",
      subtitle: "世界で一番「幸せ」のことを考えている企業であること、そして世界で一番本当の幸せを求めて社会を共創する企業であること。"
    },
    values: {
      title: "Our Values"
    },
    team: {
      title: "Meet our team"
    },
    faq: {
      title: "FAQ",
      questions: [
        {
          question: "開発プロセスはどのように進められるのですか？プロジェクト完了までの一般的なスケジュールを教えてください。",
          answer: "開発プロセスでは、エンジニアがオンラインでお客様のご要望をお伺いし、必要なシステムや要件を定義します。また、初回のお打ち合わせから1週間以内に、各商品の価格を算出し、お客様のご了解をいただいた後、価格の作成に入ります。下請け会社を一切持たず、すべての案件を自社で責任を持って作成するため、通常の納期よりも平均で約20％早く商品を作ることができます。また、大型案件の場合は、プロジェクトに共感できるフリーランスのエンジニアをアサインすることで、より早く、より低コストで商品を提供することが可能です。"
        },
        {
          question: "プロジェクト費用はどのように計算されますか？支払いはどのように行われますか？",
          answer: "価格については、企業様ごとにご要望が異なりますので、初回お打ち合わせ後にお見積もりをお送りさせていただきます。同業種の類似案件と比較し、15％程度コストを抑えてご提案させていただくことが多いです。お支払い方法は、銀行振込やPaypal決済など、様々なお支払い方法に対応しております。初回打ち合わせ時にご希望のお支払い方法をスタッフにお伝えください。"
        },
        {
          question: "React、Flutter、Pythonを使うメリットは？FirebaseやSupaBaseなどのBaaSの利点は？",
          answer: "React、Flutter、Pythonは、最先端言語ゆえの拡張性、世界中にいる多くのユーザーのコミュニティサポートにより短期間で大規模なシステム/アプリ開発を可能にします。これらの言語は柔軟性があり、初心者にも理解しやすく、豊富なライブラリを持っています。また、FirebaseやSupaBaseのようなBaaSは、リアルタイムのデータ同期、様々な組み込み機能、スケーラビリティ、透明性、セキュリティなど拡張性の高いバックエンドを提供します。これらの技術を組み合わせることで、効率的で高品質なアプリケーション開発が可能になります。"
        },
        {
          question: "要件によってどこまでタスクをカスタマイズできますか?また変更が必要な場合はどのように対応しますか?",
          answer: "プロジェクトごとにお客様のご要望をお伺いし、オーダーメイドで製作するため、カスタマイズ性はほぼ無限です。ただし、納期を早め、致命的なシステムエラーを避けるため、制作途中でのご要望変更は基本お受けしておりません。打ち合わせまでに、お客様のご要望を十分にまとめ、ご対応いただきますようお願い申し上げます。"
        },
        {
          question: "開発後のメンテナンスやサポートはどのように行われますか?追加費用はありますか?",
          answer: "弊社は開発が本業のため、大規模なカスタマイズ以外の保守・サポートは行っておりません。開発完了後、弊社が提携している保守・サポート専門の会社をご紹介いたしますので、費用についてはご相談ください。"
        },
        {
          question: "データのセキュリティとプライバシーはどのように保証されますか?",
          answer: "データのセキュリティとプライバシーの保証のために、高度な暗号化技術を使用し、FirebaseやSupaBaseなどのBaaSのセキュリティ機能を最大限に活用します。アクセスコントロールについては、企業ごとに専用アカウントを設定し、必要最小限の権限で管理します。また、データ保護ポリシーの厳守と定期的なセキュリティ監査により、お客様のデータの安全を守ります。その結果、開発から提供、保守まで一貫して顧客データを保護する体制を確立しています。"
        }
      ]
    },
    calendar: {
      title: "代表スケジュール",
      description: "代表の公開スケジュールです。ミーティングのご依頼などの際にご参照ください。",
      ariaLabel: "代表スケジュールカレンダー",
      note: "* ミーティングのご依頼は下記のお問い合わせフォームよりご連絡ください。"
    },
    testimonials: {
      title: "Skilled code",
      items: [
        {
          name: "Python",
          description: "サーバーサイド&機械学習",
          image: "/assets/python.avif",
          message: "Pythonは1991年に開発された、汎用性の高いプログラミング言語です。初心者にも分かりやすい書き方で、データの分析、ブロックチェーンの開発、自動で仕事をするプログラム、AI（人工知能）の開発にもよく使われます。世界中に多くのコミュニティがあり、さまざまな人が開発したパッケージを使ってスピーディーに多機能なシステム開発をすることが可能です。"
        },
        {
          name: "Flutter",
          description: "モバイルアプリ開発",
          image: "/assets/flutter.avif",
          message: "Flutterは2018年にGoogleによって開発されたオープンソースのソフトウェア開発キットです。一つのコードベースからiOS、Android、Web、デスクトップアプリケーションを同時に構築することが可能です。多くのパッケージが開発者から発表されており、それらのパッケージを組み合わせてユーザーフレンドリーなアプリ開発を少ないコードで実現できます。"
        },
        {
          name: "React",
          description: "Webアプリ開発",
          image: "/assets/react.avif",
          message: "ReactはJavaScriptを用いた最も有名なフレームワークです。2013年にMeta(旧Facebook)により発表され、TypeScriptにも対応しています。コンポーネントベースのアーキテクチャを採用しており、再利用可能なUIパーツを作成し、それらを組み合わせることで、大規模かつパフォーマンスの高いWebアプリケーションを効率的に開発することができます。"
        }
      ]
    },
    cta: {
      title: "より詳細な情報を希望ですか?",
      description: "お気軽にお問い合わせください。さらに詳しい情報が必要である場合や、具体的なご質問がございましたら、私たちのチームがサポートいたします。"
    },
    products: {
      heading: {
        title: "Products & Insights",
        description: "私たちの製品やサービスに関する最新情報や、業界のトレンド、お役立ち情報をお届けします。"
      }
    },
    meta: {
      home: { title: "Cor.inc · Pioneering Collaboration Through Innovation", description: "Cor.inc specializes in Python-powered data analysis and Web & Mobile app development, creating innovative, machine learning-enhanced solutions for Innovative people who want to change the world." },
      about: { title: "About · Cor.inc", description: "Find more our history, values, mission and more. We are a group of people who share the same values." },
      contact: { title: "Contact · Cor.inc", description: "Contact our team to learn more about how we can help you." },
      products: { title: "Products&Insights · Cor.inc", description: "Explore our products and insights page showcasing our innovative IT solutions and media outreach. This page offers detailed information about our product portfolio, development services, and strategic insights. Discover our cutting-edge technology solutions, read about our innovative approaches, and learn how we can help transform your digital presence. Ideal for businesses seeking comprehensive IT services and product solutions." },
      "404": { title: "Not found · Cor.inc", description: "Page not found. Please check the URL in the address bar and try again." }
    }
  },
  en: {
    nav: { home: "Home", about: "About", products: "Products&Insights", contact: "Contact" },
    hero: {
      title: "Swifter than any, to the horizon beyond.",
      subtitle: "Breaking down language and cultural barriers with AI to create a society where people truly understand each other.",
      cta: "View Our Work & Products"
    },
    services: {
      title: "Services",
      items: [
        { step: "01", name: "IT Consulting & Data Analysis", description: "DX support service that visualizes current status through Python-based scraping and BI analysis, accompanying from strategy planning to implementation." },
        { step: "02", name: "Web & Mobile App Development", description: "One-stop provision of high-speed, rich UX B2B/B2C apps using the latest frameworks like Flutter and React." },
        { step: "03", name: "AI Solution Development", description: "Developing intelligent apps and automation tools optimized for customer challenges using generative AI/LLM, image recognition, and voice processing." }
      ]
    },
    about: {
      title: "About",
      description: "Cor.inc's mission is to 'pioneer the future through co-creation rather than competition, realizing a happy society.' We provide IT strategy consulting, product development, and develop and sell our own AI products. We emphasize 'co-creation' over 'competition' and leverage the startup strength of 'speed' to provide services full of creativity and innovation.",
      cta: "More details"
    },
    mission: {
      title: "Our mission",
      subtitle: "Realizing miscommunication-free communication through AI, creating a world where everyone can demonstrate their value.",
      description: "As the world's leading company pursuing 'happiness' through IT, Cor.inc develops systems and mechanisms that solve communication challenges and promote empathy and mutual understanding among users. Our mission is to support all involved parties in clearly recognizing their own value and pursuing and achieving true happiness by utilizing ever-evolving technology. We create a future where all stakeholders collaborate toward a happier society and co-create true happiness together using our technical capabilities.",
      stats: [
        { name: "Since Founded", value: "2 years" },
        { name: "Languages", value: "10" },
        { name: "Projects", value: "15" },
        { name: "Services", value: "App Develop<br />IT/AI Strategy" }
      ]
    },
    contact: {
      title: "Feel free to contact us!",
      description1: "After reviewing your inquiry, our representative will contact you within 3 business days. Please wait a moment.",
      description2: "If you do not receive a reply within the above period, there may be a transmission problem. We apologize for the inconvenience, but please contact us again.",
      heading: {
        title: "Contact Us",
        description: "For questions, consultations, quote requests, and more, please feel free to contact us."
      },
      form: {
        title: "Feel free to contact us!",
        description1: "After reviewing your inquiry, our representative will contact you within 3 business days. Please wait a moment.",
        description2: "If you do not receive a reply within the above period, there may be a transmission problem. We apologize for the inconvenience, but please contact us again.",
        fields: {
          name: "Your name",
          email: "Email",
          message: "Message"
        },
        submit: "Submit",
        reset: "Reset"
      }
    },
    footer: {
      title: "Footer",
      social: "Social",
      company: "Company",
      legal: "Legal",
      links: {
        home: "Home",
        about: "About",
        products: "Products&Insights",
        contact: "Contact",
        privacy: "Privacy"
      },
      description: "Cor.inc's mission is to 'pioneer the future through co-creation rather than competition, realizing a happy society.' We provide IT strategy consulting, product development, and develop and sell our own AI products. We emphasize 'co-creation' over 'competition' and leverage the startup strength of 'speed' to provide services full of creativity and innovation.",
      copyright: "© 2025 Cor.inc"
    },
    features: {
      title: "Features",
      items: [
        {
          id: 'uniqueness-1',
          name: 'Digital Technology Integration',
          description: 'We can cover all projects spanning multiple technologies and processes, from IT strategy planning based on information collected with Python, to developing MVP web apps and conducting test marketing, all within our single company.'
        },
        {
          id: 'uniqueness-2',
          name: 'One-Stop Service',
          description: 'We handle everything consistently from planning to development, test release, and service launch. Since the same team is responsible, misunderstandings are less likely to occur, providing more cost-effective and speedy development.'
        },
        {
          id: 'uniqueness-3',
          name: 'Customer-First Development',
          description: 'What we value most in our development is "customer resolution." Through detailed feedback, test marketing, and milestones, we identify what customers truly seek and build relationships to become Win-Win business partners.'
        },
        {
          id: 'uniqueness-4',
          name: 'Fastest and Smartest Experience',
          description: 'We constantly and sharply capture new trends and knowledge. We quickly reflect beneficial solutions for all stakeholders in our proposals, providing unprecedented new experiences.'
        },
        {
          id: 'uniqueness-5',
          name: 'Creating New Values',
          description: 'Without being bound by conventional concepts, we sincerely face new perspectives and ideas. We maximize the startup-specific "speed" to give voice to newly born values through technology.'
        },
        {
          id: 'uniqueness-6',
          name: 'Solving Social Issues with Unique Perspective',
          description: 'Our passion for human progress knows no bounds. We actively work to solve social problems accompanying progress while using technology to bridge gaps and promote meaningful communication.'
        }
      ]
    },
    header: {
      mobileMenuDescription: "Cor.inc's mission is to 'pioneer the future through co-creation rather than competition, realizing a happy society.' We provide IT strategy consulting, product development, and develop and sell our own AI products. We emphasize 'co-creation' over 'competition' and leverage the startup strength of 'speed' to provide services full of creativity and innovation."
    },
    "404": {
      title: "404",
      subtitle: "Page not found",
      description: "Please check the URL in the address bar and try again.",
      cta: "Go back home"
    },
    aboutPage: {
      title: "About",
      subtitle: "Being the company that thinks most about 'happiness' in the world, and being the company that seeks true happiness and co-creates society the most in the world."
    },
    values: {
      title: "Our Values"
    },
    team: {
      title: "Meet our team"
    },
    faq: {
      title: "FAQ",
      questions: [
        {
          question: "What technology stack do you use?",
          answer: "We primarily use Python, Flutter, React, and TypeScript. We select the optimal technology based on project requirements."
        },
        {
          question: "How long does development take?",
          answer: "It varies depending on the project scale, but typically 2-3 months for MVP and around 6 months for full-scale applications."
        },
        {
          question: "Can you tell me about your pricing structure?",
          answer: "We primarily use a fixed-price system based on projects. Please contact us for details."
        }
      ]
    },
    calendar: {
      title: "CEO Schedule",
      description: "This is the CEO's public schedule. If you would like to schedule a meeting, please check available time slots and contact us.",
      ariaLabel: "CEO Schedule Calendar",
      note: "* Please contact us through the contact form below for meeting requests."
    },
    testimonials: {
      title: "Technical Expertise",
      items: [
        {
          name: "Python",
          description: "Server-side & Machine Learning",
          image: "/assets/python.avif",
          message: "Python is a versatile programming language developed in 1991. With its beginner-friendly syntax, it's widely used for data analysis, blockchain development, automation, and AI development. With numerous communities worldwide and various packages developed by contributors, it enables speedy development of multifunctional systems."
        },
        {
          name: "Flutter",
          description: "Mobile App Development",
          image: "/assets/flutter.avif",
          message: "Flutter is an open-source software development kit developed by Google in 2018. It allows simultaneous development of iOS, Android, Web, and desktop applications from a single codebase. With many packages released by developers, it enables user-friendly app development with minimal code by combining these packages."
        },
        {
          name: "React",
          description: "Web App Development",
          image: "/assets/react.avif",
          message: "React is the most famous framework using JavaScript. Released by Meta (formerly Facebook) in 2013, it also supports TypeScript. It adopts a component-based architecture, allowing creation of reusable UI parts and efficient development of large-scale, high-performance web applications by combining them."
        }
      ]
    },
    cta: {
      title: "Need more detailed information?",
      description: "Feel free to contact us. If you need more detailed information or have specific questions, our team will support you."
    },
    products: {
      heading: {
        title: "Products & Insights",
        description: "Detailed information about our products, services, and technical insights."
      }
    },
    meta: {
      home: { title: "Cor.inc · Pioneering Collaboration Through Innovation", description: "Cor.inc specializes in Python-powered data analysis and Web & Mobile app development, creating innovative, machine learning-enhanced solutions for Innovative people who want to change the world." },
      about: { title: "About · Cor.inc", description: "Find more our history, values, mission and more. We are a group of people who share the same values." },
      contact: { title: "Contact · Cor.inc", description: "Contact our team to learn more about how we can help you." },
      products: { title: "Products&Insights · Cor.inc", description: "Explore our products and insights page showcasing our innovative IT solutions and media outreach. This page offers detailed information about our product portfolio, development services, and strategic insights. Discover our cutting-edge technology solutions, read about our innovative approaches, and learn how we can help transform your digital presence. Ideal for businesses seeking comprehensive IT services and product solutions." },
      "404": { title: "Not found · Cor.inc", description: "Page not found. Please check the URL in the address bar and try again." }
    }
  }
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.ja;
}

export function getCurrentLocale(url: URL): Locale {
  const pathname = url.pathname;
  if (pathname.startsWith('/en/') || pathname === '/en') {
    return 'en';
  }
  return 'ja';
}

export function getOtherLocale(currentLocale: Locale): Locale {
  return currentLocale === 'ja' ? 'en' : 'ja';
}

export function getLocalizedUrl(path: string, locale: Locale): string {
  if (locale === 'ja') {
    return path === '/' ? '/' : path;
  }
  return `/en${path === '/' ? '' : path}`;
}
