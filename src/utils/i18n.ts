export type Locale = 'ja' | 'en';

const translations = {
  ja: {
    nav: { home: "Home", about: "About", products: "Products&Insights", blog: "Blog", contact: "Contact" },
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
      cta: "More details",
      heading: {
        title: "About",
        description: "Cor.inc は「競争ではなく共創を通じて未来を切り拓き、幸福な社会を実現する。」をミッションに掲げ、IT戦略コンサルタントやそれに伴うプロダクト開発、自社AI製品の開発・販売を行っています。「競争」よりも「共創」を重視し、スタートアップの強みである「スピード感」を活かし、創造性と革新性に満ちたサービスを提供しています。"
      }
    },
    mission: {
      title: "Our mission",
      subtitle: "誤解のないコミュニケーションを AI で実現し、誰もが自分の価値を発揮できる世界をつくる。",
      description: "Cor.inc は、ITを通じて「幸せ」を追求する世界一の企業として、コミュニケーションの課題を解決し、ユーザー間の共感と共通理解を促進するシステムや仕組みを開発しています。私たちの使命は、日々進化するテクノロジーを活用して、関わる全ての人々が自らの価値を明確に自覚し、真の幸せを追求し達成できるように支援することです。私たちは、すべてのステークホルダーがより幸せな社会を目指して協働し、技術力を駆使して共に真の幸せを共創する未来を創造していきます。",
      stats: [
        { name: "設立から", value: "2年" },
        { name: "使える言語", value: "10" },
        { name: "プロジェクト", value: "15" },
        { name: "提供サービス", value: "App Develop & IT/AI Strategy" }
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
          consultationType: "相談内容",
          consultationTypePlaceholder: "相談内容を選択してください",
          consultationOptions: [
            "TapForgeについてのご相談",
            "BoltSiteについてのご相談",
            "IoTRealmについてのご相談",
            "その他"
          ],
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
          question: "JavaScriptやTypeScript、Python、Goなどを使うメリットは？",
          answer: "JavaScriptは1995年にNetscapeで生まれ、ウェブ開発の基盤となる言語です。TypeScriptはそのスーパーセットとして、静的型付けを追加し、大規模プロジェクトでの保守性を向上させます。Pythonは1991年に開発された汎用性の高い言語で、シンプルで読みやすい文法が特徴です。AI・機械学習、データ分析、Web開発まで幅広く対応でき、豊富なライブラリにより開発効率が非常に高いです。Go（Golang）は2009年にGoogleが開発した軽量かつ高速な言語で、シンプルな文法と並行処理（goroutines）が特徴です。クラウドネイティブなアプリケーションやマイクロサービスに適しており、コンパイル速度が速く、メモリ効率が高いため、スケーラブルなサーバー開発に最適です。"
        },
        {
          question: "FirebaseやSupaBaseなどのBaaSをはじめとしたクラウドサービスを使う利点は？",
          answer: "BaaS（Backend as a Service）は認証、データベース、ストレージ、プッシュ通知などのバックエンド機能を提供します。FirebaseはGoogleのサービスでリアルタイムデータベースと豊富な機能が特徴です。SupabaseはオープンソースのFirebase代替で、PostgreSQLベースのリアルタイム機能とRESTful APIを提供します。クラウドサービス全般では、初期投資を抑えながら、必要に応じてリソースを拡張できる柔軟性があります。AWS、Google Cloud、Azureなどの主要プロバイダーは、高可用性、自動バックアップ、セキュリティ機能を提供します。グローバルなCDN、負荷分散、監視ツールにより、パフォーマンスと信頼性を向上させ、運用負荷を大幅に軽減できます。開発期間の短縮、運用コストの削減、スケーラビリティの確保が主な利点です。"
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
      title: "Technical Expertise",
      items: [
        {
          name: "JavaScript/TypeScript",
          description: "フロントエンド&サーバーサイド開発",
          image: "/assets/jsts.avif",
          message: "JavaScriptは1995年にNetscapeで生まれ、ウェブ開発の基盤となる言語です。TypeScriptはそのスーパーセットとして、静的型付けを追加し、大規模プロジェクトでの保守性を向上させます。Node.jsやReactと組み合わせてリアルタイム通信やUI構築に活用され、非同期処理や豊富なエコシステムにより、迅速でインタラクティブなアプリケーション開発に適しています。"
        },
        {
          name: "Python",
          description: "AI&機械学習",
          image: "/assets/python.avif",
          message: "Pythonは1991年に開発された汎用性の高いプログラミング言語です。シンプルで読みやすい文法が特徴で、機械学習、AI開発、データ分析に広く使われます。TensorFlowやPyTorchといったライブラリを活用することで、複雑なAIモデルを迅速に構築でき、初心者から上級者まで幅広く支持されています。"
        },
        {
          name: "Go",
          description: "バックエンド&高性能システム",
          image: "/assets/go.avif",
          message: "Go（Golang）は2009年にGoogleが開発した軽量かつ高速なプログラミング言語です。シンプルな文法と並行処理（goroutines）が特徴で、クラウドネイティブなアプリケーションやマイクロサービスに適しています。コンパイル速度が速く、メモリ効率が高いため、スケーラブルなサーバー開発に最適です。"
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
    homeCta: {
      title: "お問い合わせ",
      description: "ご質問やご相談、お見積もりのご依頼など、お気軽にお問い合わせください。",
      button: "Contact us"
    },
    productsTable: {
      title: "事業一覧",
      demoLabel: "Demo / Repo",
      mediaTitle: "外部メディア",
      products: [
        {
          name: 'TapForge',
          description: 'タップ一つで繋がる、次世代ビジネスカード',
          demo: 'https://zoom-clone-navy-eta.vercel.app/',
        },
        {
          name: 'BoltSite',
          description: '光速0.3秒表示とSEO満点を実現する<br/>高性能Web制作',
          demo: 'https://constellation-creator-639959525777.asia-northeast1.run.app/',
        },
        {
          name: 'IoTRealm',
          description: 'デジタルと現実を融合した<br/>革新的ソリューション',
          demo: 'https://github.com/terisuke/engineer-cafe-navigator',
        },
      ],
      pricing: {
        title: "料金一覧（税込）",
        services: [
          {
            name: "TapForge",
            items: [
              { item: "初期費用（1枚目）", price: "3,000円" },
              { item: "2枚目以降", price: "600円/枚" },
              { item: "100枚以上一括注文時", price: "500円/枚(2枚目以降)" }
            ]
          },
          {
            name: "BoltSite",
            items: [
              { item: "ビギナー", price: "15,000円/月" },
              { item: "スタンダード", price: "25,000円/月" },
              { item: "プレミアム", price: "30,000円/月" },
              { item: "エンタープライズ", price: "50,000円〜/月" }
            ]
          },
          {
            name: "IoTRealm",
            items: [
              { item: "PoC（概念実証）", price: "100万円〜500万円" },
              { item: "本開発", price: "500万円〜" },
              { item: "保守・運用", price: "10万円〜/月" }
            ]
          }
        ]
      },
      articles: [
        {
          name: 'Note',
          description: '生成 AI 活用術や経営視点コラムを発信',
          icon: '/assets/Note.avif',
          action: 'https://note.com/cor_instrument',
        },
      ],
      youtube: [
        {
          name: 'YouTube',
          description: 'テクノロジーとビジネス戦略に関する動画コンテンツを配信。AI活用事例やプロダクト開発の舞台裏を公開しています。',
          isFlagged: true,
          icon: '/assets/Youtube.avif',
          action: 'https://www.youtube.com/@Cor.Incorporated',
        },
      ]
    },
    contactInfo: {
      address: {
        label: "Postal address",
        value: "810-0001 福岡県 福岡市\n中央区天神2丁目3-10\n天神パインクレスト719号"
      },
      phone: {
        label: "Phone number",
        value: "070-8561-1659"
      },
      chat: {
        label: "Email",
        value: "Chat with AI Cloudia"
      }
    },
    valuesData: [
      [
        {
          ref: '01',
          name: 'まずは行動',
          description: '思うだけなら誰でもできる。正解は後の人が判断することと割り切り、決めたらとにかく最善に向かって素早く行動すること。',
        },
        {
          ref: '02',
          name: '常に自問自答する',
          description: '幸せの形は常に変化する。本当の幸せを追求するためには常に「これがベストか？」を自分自身に問いかけ、思考停止せずに動き続かなければいけない。',
        },
        {
          ref: '03',
          name: '相手も自分も幸せになる',
          description: '幸せな人しか相手を幸せにできない。何かを犠牲にすることなく、自分も相手もwin-winになる行動を常に考え抜くこと。',
        },
      ],
      [
        {
          ref: '04',
          name: '意思表示ははっきりと',
          description: 'どっちつかずな行動は無駄であり双方にメリットがない。何事も自分自身でしっかり決めて、全力で取り組むこと。',
        },
        {
          ref: '05',
          name: '柔軟性のあるサービス',
          description: '少しでも多くのステークホルダーに幸せになってもらう。そのためにあえて定型サービスを設けず、個々のタスクに合わせて最適なサービスを構築する。(例) WebAR 名刺や AI チャットボットを顧客要件に合わせ即時カスタマイズ',
        },
        {
          ref: '06',
          name: '自分の運命は自分で拓く',
          description: '成否に関わらず、自分の行動は自分で責任をとる。成果も反省も全て自分の行動の結果、笑って受け入れる。',
        },
      ],
    ],
    teamData: [
      {
        name: 'Kousuke Terada',
        image: '/assets/k-terada.avif',
        job: 'CEO',
        description: '音大卒 → 楽器メーカー営業 → メガベンチャーで法人営業 → IT へ転身という異色の経歴を活かし、"技術と言葉の橋渡し" に挑戦しています。',
        comingSoon: false,
        link: 'https://lit.link/terisuke',
      },
      {
        name: 'Cloudia Sorano',
        image: '/assets/cloudia.avif',
        job: 'AI アンバサダー',
        description: '福岡弁で技術ネタを発信する社内 AI。Zenn・X で 51 週連続 LT に挑戦中。',
        comingSoon: false,
        link: 'https://x.com/Cloudia_Cor',
        zennLink: 'https://zenn.dev/cloudia',
      },
      {
        name: 'Nagisa Terada',
        image: '/assets/nagi.avif',
        job: 'Staff',
        description: '美容学校卒業後、美容室に7年勤務。プログラミングを勉強後、IT業界に転職。苦手を可能にするため日々奮闘中。',
        comingSoon: false,
        link: 'https://digital-studio-c5abe.web.app/',
      },
    ],
    meta: {
      home: { title: "Cor.inc · Pioneering Collaboration Through Innovation", description: "Cor.inc specializes in Python-powered data analysis and Web & Mobile app development, creating innovative, machine learning-enhanced solutions for Innovative people who want to change the world." },
      about: { title: "About · Cor.inc", description: "Find more our history, values, mission and more. We are a group of people who share the same values." },
      contact: { title: "Contact · Cor.inc", description: "Contact our team to learn more about how we can help you." },
      products: { title: "Products&Insights · Cor.inc", description: "Explore our products and insights page showcasing our innovative IT solutions and media outreach. This page offers detailed information about our product portfolio, development services, and strategic insights. Discover our cutting-edge technology solutions, read about our innovative approaches, and learn how we can help transform your digital presence. Ideal for businesses seeking comprehensive IT services and product solutions." },
      "404": { title: "Not found · Cor.inc", description: "Page not found. Please check the URL in the address bar and try again." },
      privacy: { title: "Privacy policy · Cor.inc", description: "Our privacy policy will help you understand what information is collected and how it is used." }
    },
    privacy: {
      title: "プライバシーポリシー",
      lastUpdate: "Last update: May 13, 2024",
      intro: "Cor.incでは、お客様のプライバシーを最優先し、その保護に努めています。本プライバシーポリシーでは、ウェブ解析ツール、Flutterアプリ、機械学習ソリューションなど、弊社のサービスをご利用いただく際の個人情報の収集、使用、保護に関する弊社のアプローチについて詳しく説明します。当社の取り組みをご理解いただくため、本ポリシーをご確認いただくことをお勧めします。",
      section1: {
        title: "1. 当社が収集する情報",
        description: "当社のサービスをご利用いただく際に、当社は以下のような様々な種類の個人情報を収集することがあります：",
        items: [
          "お客様が提供する情報：これには、お客様がアカウントを作成したり、当社サービスの特定の機能を利用したりする際に、お客様の氏名、Eメールアドレス、連絡先、その他の関連データが含まれる場合があります。",
          "利用データ：当社は、お客様のIPアドレス、ブラウザの種類、デバイス情報、訪問したページ、および当社サービスとのインタラクションを含む、お客様の当社サービスの利用に関するデータを収集します。",
          "クッキーおよび類似技術：ユーザーエクスペリエンスを向上させ、利用パターンを把握するため、当社サービスではクッキーおよび類似の技術を利用しています。"
        ]
      },
      section2: {
        title: "2. お客様の情報の使用方法",
        description: "当社は、お客様の個人情報を以下の目的で利用することがあります：",
        items: [
          "サービスの提供と改善：当社では、パーソナライズされた体験を提供し、当社サービスの機能を向上させるためにお客様のデータを使用します。",
          "コミュニケーション：お客様のEメールアドレスおよび連絡先情報は、最新情報、ニュースレター、販促資料の送付に使用されることがあります。これらの通信を拒否するオプションがあります。",
          "アナリティクス：ユーザーの行動をよりよく理解し、当社のサービスを向上させるために、当社は集計および匿名化されたデータを分析します。"
        ]
      },
      contact: {
        title: "お問い合わせ",
        description: "当社の個人情報保護方針についてご質問やご不明な点がございましたら、",
        linkText: "お問い合わせフォーム",
        suffix: "までご連絡ください。"
      }
    }
  },
  en: {
    nav: { home: "Home", about: "About", products: "Products&Insights", blog: "Blog", contact: "Contact" },
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
      cta: "More details",
      heading: {
        title: "About",
        description: "Cor.inc's mission is to 'pioneer the future through co-creation rather than competition, realizing a happy society.' We provide IT strategy consulting, product development, and develop and sell our own AI products. We emphasize 'co-creation' over 'competition' and leverage the startup strength of 'speed' to provide services full of creativity and innovation."
      }
    },
    mission: {
      title: "Our mission",
      subtitle: "Realizing miscommunication-free communication through AI, creating a world where everyone can demonstrate their value.",
      description: "As the world's leading company pursuing 'happiness' through IT, Cor.inc develops systems and mechanisms that solve communication challenges and promote empathy and mutual understanding among users. Our mission is to support all involved parties in clearly recognizing their own value and pursuing and achieving true happiness by utilizing ever-evolving technology. We create a future where all stakeholders collaborate toward a happier society and co-create true happiness together using our technical capabilities.",
      stats: [
        { name: "Since Founded", value: "2 years" },
        { name: "Languages", value: "10" },
        { name: "Projects", value: "15" },
        { name: "Services", value: "App Develop & IT/AI Strategy" }
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
          consultationType: "Consultation Type",
          consultationTypePlaceholder: "Please select consultation type",
          consultationOptions: [
            "Consultation about TapForge",
            "Consultation about BoltSite",
            "Consultation about IoTRealm",
            "Other"
          ],
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
          question: "How is the development process carried out? What is the typical schedule until project completion?",
          answer: "In the development process, our engineers will listen to your requirements online and define the necessary systems and requirements. Within one week of the initial meeting, we will calculate the price for each product, and after your approval, we will proceed with the quotation. Since we do not outsource any work and handle all projects in-house, we can deliver products about 20% faster than the average delivery time. For large projects, we can assign freelance engineers who resonate with the project, enabling faster and more cost-effective delivery."
        },
        {
          question: "How are project costs calculated? How do payments work?",
          answer: "Pricing varies depending on the client's requirements, so we will send you a quote after the initial meeting. Compared to similar projects in the same industry, we often offer proposals at about 15% lower cost. Payment methods include bank transfer, Paypal, and more. Please let our staff know your preferred payment method during the initial meeting."
        },
        {
          question: "What are the benefits of using JavaScript, TypeScript, Python, Go, and other languages?",
          answer: "JavaScript was born in 1995 at Netscape and has become the foundation of web development. TypeScript, as its superset, adds static typing to improve maintainability in large-scale projects. Python is a versatile language developed in 1991, known for its simple and readable syntax. It covers AI/machine learning, data analysis, and web development with rich libraries, making it extremely efficient for development. Go (Golang) is a lightweight and fast language developed by Google in 2009, featuring simple syntax and concurrent processing (goroutines). It's ideal for cloud-native applications and microservices, with fast compilation speed and high memory efficiency, making it optimal for scalable server development."
        },
        {
          question: "What are the advantages of using BaaS like Firebase and Supabase, and cloud services in general?",
          answer: "BaaS (Backend as a Service) provides backend functions such as authentication, databases, storage, and push notifications. Firebase is Google's service featuring real-time databases and rich functionality. Supabase is an open-source Firebase alternative offering PostgreSQL-based real-time features and RESTful APIs. Cloud services in general offer flexibility to scale resources as needed while keeping initial investment low. Major providers like AWS, Google Cloud, and Azure provide high availability, automatic backups, and security features. Global CDN, load balancing, and monitoring tools improve performance and reliability while significantly reducing operational overhead. Main benefits include reduced development time, lower operational costs, and ensured scalability."
        },
        {
          question: "How much can tasks be customized according to requirements? How do you handle changes if needed?",
          answer: "We listen to your requirements for each project and create tailor-made solutions, so customization is virtually unlimited. However, to speed up delivery and avoid critical system errors, we generally do not accept changes to requirements during production. Please summarize your requirements thoroughly before the meeting."
        },
        {
          question: "How is maintenance and support handled after development? Are there any additional costs?",
          answer: "As our main business is development, we do not provide maintenance or support except for major customizations. After development is complete, we can introduce you to our partner companies specializing in maintenance and support. Please consult us regarding costs."
        },
        {
          question: "How do you ensure data security and privacy?",
          answer: "To ensure data security and privacy, we use advanced encryption technologies and maximize the security features of BaaS like Firebase and SupaBase. For access control, we set up dedicated accounts for each client and manage them with the minimum necessary privileges. We strictly adhere to data protection policies and conduct regular security audits to protect your data throughout development, delivery, and maintenance."
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
          name: "JavaScript/TypeScript",
          description: "Frontend & Backend Development",
          image: "/assets/jsts.avif",
          message: "JavaScript was born in 1995 at Netscape and has become the foundation of web development. TypeScript, as its superset, adds static typing to improve maintainability in large-scale projects. It's used in combination with Node.js and React for real-time communication and UI construction. With asynchronous processing and a rich ecosystem, it's ideal for rapid and interactive application development."
        },
        {
          name: "Python",
          description: "AI & Machine Learning",
          image: "/assets/python.avif",
          message: "Python is a versatile programming language developed in 1991. Known for its simple and readable syntax, it's widely used in machine learning, AI development, and data analysis. By leveraging libraries like TensorFlow and PyTorch, complex AI models can be built rapidly, making it popular from beginners to advanced users."
        },
        {
          name: "Go",
          description: "Backend & High-Performance Systems",
          image: "/assets/go.avif",
          message: "Go (Golang) is a lightweight and fast programming language developed by Google in 2009. Known for its simple syntax and concurrent processing (goroutines), it's ideal for cloud-native applications and microservices. With fast compilation speed and high memory efficiency, it's optimal for scalable server development."
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
    homeCta: {
      title: "Contact Us",
      description: "Feel free to contact us for any questions, consultations, or quote requests.",
      button: "Contact us"
    },
    productsTable: {
      title: "Business List",
      demoLabel: "Demo / Repo",
      mediaTitle: "External Media",
      products: [
        {
          name: 'TapForge',
          description: 'Connect with just a tap -<br/>Next-gen business networking',
          demo: 'https://zoom-clone-navy-eta.vercel.app/',
        },
        {
          name: 'BoltSite',
          description: 'Ultra-fast 0.3s loading with<br/>perfect SEO scores',
          demo: 'https://constellation-creator-639959525777.asia-northeast1.run.app/',
        },
        {
          name: 'IoTRealm',
          description: 'Bridging digital innovation<br/>with physical reality',
          demo: 'https://github.com/terisuke/engineer-cafe-navigator',
        },
      ],
      pricing: {
        title: "Pricing List (Tax Included)",
        services: [
          {
            name: "TapForge",
            items: [
              { item: "Initial cost (1st card)", price: "¥3,000" },
              { item: "2nd card onwards", price: "¥600/card" },
              { item: "100+ cards bulk order", price: "¥500/card (2nd onwards)" }
            ]
          },
          {
            name: "BoltSite",
            items: [
              { item: "Beginner", price: "¥15,000/month" },
              { item: "Standard", price: "¥25,000/month" },
              { item: "Premium", price: "¥30,000/month" },
              { item: "Enterprise", price: "¥50,000+/month" }
            ]
          },
          {
            name: "IoTRealm",
            items: [
              { item: "PoC (Proof of Concept)", price: "¥1M-5M" },
              { item: "Full Development", price: "¥5M+" },
              { item: "Maintenance & Support", price: "¥100K+/month" }
            ]
          }
        ]
      },
      articles: [
        {
          name: 'Note',
          description: 'Publishing generative AI utilization techniques and management perspective columns',
          icon: '/assets/Note.avif',
          action: 'https://note.com/cor_instrument',
        },
      ],
      youtube: [
        {
          name: 'YouTube',
          description: 'Delivering video content on technology and business strategy. Sharing AI use cases and behind-the-scenes product development insights.',
          isFlagged: true,
          icon: '/assets/Youtube.avif',
          action: 'https://www.youtube.com/@Cor.Incorporated',
        },
      ]
    },
    contactInfo: {
      address: {
        label: "Postal address",
        value: "810-0001 Fukuoka Prefecture, Fukuoka City\nChuo-ku Tenjin 2-3-10\nTenjin Pine Crest 719"
      },
      phone: {
        label: "Phone number",
        value: "070-8561-1659"
      },
      chat: {
        label: "Email",
        value: "Chat with AI Cloudia"
      }
    },
    valuesData: [
      [
        {
          ref: '01',
          name: 'Take Action First',
          description: 'Anyone can just think. Accept that the right answer will be judged by future people, and once decided, act quickly toward the best outcome.',
        },
        {
          ref: '02',
          name: 'Always Self-Reflect',
          description: 'The form of happiness is constantly changing. To pursue true happiness, we must always ask ourselves "Is this the best?" and continue moving without stopping our thinking.',
        },
        {
          ref: '03',
          name: 'Make Both Others and Yourself Happy',
          description: 'Only happy people can make others happy. Always think through actions that create win-win situations for both yourself and others without sacrificing anything.',
        },
      ],
      [
        {
          ref: '04',
          name: 'Express Intentions Clearly',
          description: 'Indecisive actions are wasteful and benefit no one. Make firm decisions yourself and commit fully to everything.',
        },
        {
          ref: '05',
          name: 'Flexible Services',
          description: 'Help as many stakeholders as possible become happy. For this purpose, we deliberately avoid standardized services and build optimal services tailored to individual tasks. (Example) Instantly customize WebAR business cards and AI chatbots according to customer requirements',
        },
        {
          ref: '06',
          name: 'Forge Your Own Destiny',
          description: 'Regardless of success or failure, take responsibility for your own actions. Accept all results and reflections from your actions with a smile.',
        },
      ],
    ],
    teamData: [
      {
        name: 'Kousuke Terada',
        image: '/assets/k-terada.avif',
        job: 'CEO',
        description: 'Music college graduate → Musical instrument manufacturer sales → Corporate sales at mega-venture → Career change to IT. Leveraging this unique background to challenge "bridging technology and language."',
        comingSoon: false,
        link: 'https://lit.link/terisuke',
      },
      {
        name: 'Cloudia Sorano',
        image: '/assets/cloudia.avif',
        job: 'AI Ambassador',
        description: 'In-house AI that shares technical topics in Fukuoka dialect. Currently challenging 51 consecutive weeks of Lightning Talks on Zenn and X.',
        comingSoon: false,
        link: 'https://x.com/Cloudia_Cor',
        zennLink: 'https://zenn.dev/cloudia',
      },
      {
        name: 'Nagisa Terada',
        image: '/assets/nagi.avif',
        job: 'Staff',
        description: 'After graduating from beauty school, worked at a salon for 7 years. Transitioned to IT after learning programming. Striving daily to turn challenges into possibilities.',
        comingSoon: false,
        link: 'https://digital-studio-c5abe.web.app/',
      },
    ],
    meta: {
      home: { title: "Cor.inc · Pioneering Collaboration Through Innovation", description: "Cor.inc specializes in Python-powered data analysis and Web & Mobile app development, creating innovative, machine learning-enhanced solutions for Innovative people who want to change the world." },
      about: { title: "About · Cor.inc", description: "Find more our history, values, mission and more. We are a group of people who share the same values." },
      contact: { title: "Contact · Cor.inc", description: "Contact our team to learn more about how we can help you." },
      products: { title: "Products&Insights · Cor.inc", description: "Explore our products and insights page showcasing our innovative IT solutions and media outreach. This page offers detailed information about our product portfolio, development services, and strategic insights. Discover our cutting-edge technology solutions, read about our innovative approaches, and learn how we can help transform your digital presence. Ideal for businesses seeking comprehensive IT services and product solutions." },
      "404": { title: "Not found · Cor.inc", description: "Page not found. Please check the URL in the address bar and try again." },
      privacy: { title: "Privacy policy · Cor.inc", description: "Our privacy policy will help you understand what information is collected and how it is used." }
    },
    privacy: {
      title: "Privacy Policy",
      lastUpdate: "Last update: May 13, 2024",
      intro: "At Cor.inc, we prioritize your privacy and are committed to protecting it. This privacy policy details our approach to collecting, using, and protecting personal information when you use our services, including web analytics tools, Flutter apps, and machine learning solutions. We recommend reviewing this policy to understand our commitment.",
      section1: {
        title: "1. Information We Collect",
        description: "When you use our services, we may collect various types of personal information, including:",
        items: [
          "Information you provide: This may include your name, email address, contact details, and other relevant data when you create an account or use specific features of our services.",
          "Usage data: We collect data about your use of our services, including your IP address, browser type, device information, pages visited, and interactions with our services.",
          "Cookies and similar technologies: Our services use cookies and similar technologies to enhance user experience and understand usage patterns."
        ]
      },
      section2: {
        title: "2. How We Use Your Information",
        description: "We may use your personal information for the following purposes:",
        items: [
          "Service provision and improvement: We use your data to provide personalized experiences and enhance the functionality of our services.",
          "Communication: Your email address and contact information may be used to send updates, newsletters, and promotional materials. You have the option to opt out of these communications.",
          "Analytics: We analyze aggregated and anonymized data to better understand user behavior and improve our services."
        ]
      },
      contact: {
        title: "Contact Us",
        description: "If you have any questions or concerns about our privacy policy, please contact us through our",
        linkText: "contact form",
        suffix: "."
      }
    }
  }
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}

export function getCurrentLocale(url: URL): Locale {
  const pathname = url.pathname;
  if (/^\/en(\/|$)/.test(pathname)) {
    return 'en';
  }
  return 'ja';
}

export function getOtherLocale(currentLocale: Locale): Locale {
  return currentLocale === 'ja' ? 'en' : 'ja';
}

export function getLocalizedUrl(path: string, locale: Locale): string {
  if (locale === 'ja') return path;
  return path === '/' ? '/en' : `/en${path}`;
}
