export type Locale = 'ja' | 'en' | 'zh' | 'ko' | 'es';

const translations = {
  ja: {
    nav: { home: "Home", about: "About", products: "Products&Insights", blog: "Blog", contact: "Contact" },
    hero: {
      title: "言葉を超えて、想いを届ける。",
      subtitle: "かつてトランペットで伝えた感動を、今はコードで。元音楽家が追求する「誤解のないコミュニケーション」の実現。",
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
      subtitle: "かつてトランペットで追い求めた「言葉を超えた伝達」を、今はテクノロジーで。",
      paragraphs: [
        "創業者自身がASDという特性を持ち、「伝わらない」苦しみを知っています。",
        "だからこそ、誤解のないコミュニケーション実現に本気です。",
        "名刺交換で、ホームページで、AIを介した対話で。日常の小さな瞬間に「ああ、伝わった」という感動を。",
        "それが積み重なれば、誰もが自分の価値を正しく伝え、理解される社会になる。",
        "私たちは、テクノロジーを使って、人と人の間にある「言葉の壁」を取り払い、誰もが自分らしく輝ける世界を創ります。"
      ],
      stats: [
        { name: "設立から", value: "2年" },
        { name: "使える言語", value: "10" },
        { name: "プロジェクト", value: "15" },
        { name: "提供サービス", value: "App Develop & IT/AI Strategy" }
      ]
    },
    founderStory: {
      title: "代表の想い",
      subtitle: "なぜ元音楽家が、音楽関連ではない事業を?",
      paragraphs: [
        "小さい頃から「空気の読めない子供」でした。ASDという特性を持ち、他者との壁を常に感じながら生きてきました。",
        "高校2年生の冬、2000人のホールでトランペットソロを吹いた時、初めて「言葉を超えたコミュニケーション」の感動を味わいました。会場の全ての意識が集中し、言葉など必要ない一体感に魂を震わせました。",
        "しかし音楽業界で、その感動を二度と味わえませんでした。コネ、立場、腹の探り合い。表現は「仕事」に成り下がり、私は心を病みました。",
        "コロナ禍で音楽の道を離れ、リクルートで営業を経験。そこで「既存ツールの限界」と「言葉が届かないもどかしさ」に直面しました。",
        "そしてテクノロジーと出会いました。コードは裏切らない。AIは感情的にならない。何より、作ったものが誰かの課題を解決し、実際に生活を豊かにする様子を目の当たりにできる。",
        "あの高校時代の感動を、今度は日常に。名刺交換で、ホームページで、AIを介したコミュニケーションで。「ああ、伝わった」という小さな感動を積み重ねていく。",
        "それが、Cor.incの原点です。"
      ]
    },
    productBackstory: {
      title: "なぜこのサービスなのか",
      products: [
        {
          name: "TapForge",
          subtitle: "「出会い」から始まるコミュニケーション革新",
          story: "リクルートで営業をしていた時、名刺交換後に名刺が山のように溜まり、誰が誰だかわからなくなる状況を何度も経験しました。名刺交換という「儀式」は、本来「これから関係を築きましょう」という意思表示のはずが、実際には「一応連絡先を交換しました」という形式的な記録にしかなっていない。ここに大きなミスコミュニケーションを感じていました。TapForgeは、名刺交換を「本当の出会い」に変えるためのプロダクトです。タップ一つで相手のプロフィール、SNS、ポートフォリオ、予約カレンダーなど、あらゆる情報に瞬時にアクセスできる。「私はこういう仕事をしています」と口頭で説明する代わりに、タップ一つで自分の全てを視覚的に、直感的に伝えられる。これが、「言葉を超えたコミュニケーション」の第一歩です。"
        },
        {
          name: "BoltSite",
          subtitle: "企業の「想い」を形にする",
          story: "リクルートで営業をしていた時、多くの企業のホームページを見ましたが、その企業の「想い」や「情熱」が全く伝わってこないものばかりでした。経営者は熱い想いを持っている。自社の製品やサービスに誇りを持っている。でも、それがホームページに全く反映されていない。既存のツールの枠の中でしか表現できないからです。BoltSiteは、Astroというフレームワークを使った超高速なホームページ制作サービスですが、私が本当に大切にしているのは「その企業らしさ」を引き出すことです。ホームページ制作の打ち合わせでは、ひたすら経営者の話を聞きます。「なぜこの事業を始めたのか」「どんな想いで製品を作っているのか」。そして、その言葉の裏にある、言葉にならない想いを読み取り、デザインとコピーに落とし込む。結果として出来上がるのは、単なる「企業情報サイト」ではなく、その企業の「人格」が感じられるホームページです。"
        },
        {
          name: "IoTRealm",
          subtitle: "想いを形にする受託開発",
          story: "名刺とホームページで信頼関係を築いた後、多くの経営者が「実は、こういうことができたらいいなって思ってるんだけど...」と語ります。それは時に曖昧で、時に壮大で、時に技術的に可能なのかすらわからないアイデアです。でも、その奥には確実に「こうなったら嬉しい」という純粋な想いがある。IoTRealmは、そんな「想い」を形にするための受託開発サービスです。例えば、ある不動産・建設系スタートアップの代表は、「AIに敷地図を渡すだけで自動的に間取りを生成するプロダクト」を提案し、優勝しましたが、技術的な実現方法が分からず困っていました。私は2週間でプロトタイプを作成。YOLOという画像認識AIを使って敷地図から建設可能地を自動判定し、簡易的な間取り図を生成するアプリです。これもまた、「言葉を超えたコミュニケーション」です。複雑な法規制や計算を、視覚的なデータに変換することで、専門家と素人の間の知識の壁を取り払い、誤解なく情報を共有できます。"
        }
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
        privacy: "Privacy",
        legal: "特商法表記"
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
    linkTypes: {
      LitLink: "LitLink",
      X: "X",
      Zenn: "Zenn",
      Homepage: "ホームページ"
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
          demo: 'https://tapforge.pages.dev/',
        },
        {
          name: 'BoltSite',
          description: '光速0.3秒表示とSEO満点を実現する<br/>高性能Web制作',
          demo: 'https://boltsite.pages.dev/',
        },
        {
          name: 'IoTRealm',
          description: 'デジタルと現実を融合した<br/>革新的ソリューション',
          demo: 'https://iotrealm.pages.dev/',
        },
      ],
      pricing: {
        title: "料金一覧（税込）",
        services: [
          {
            name: "TapForge",
            items: [
              { item: "月額利用料金", price: "500円〜700円/月", note: "NFC名刺カード1枚サービス含む" },
              { item: "2枚目以降", price: "600円/枚" },
              { item: "100枚以上一括注文時", price: "500円/枚" }
            ]
          },
          {
            name: "BoltSite",
            items: [
              { item: "スタンダードプラン", price: "15,000円/月" },
              { item: "プロフェッショナルプラン", price: "25,000円/月" },
              { item: "エンタープライズ", price: "50,000円〜/月" }
            ],
            notes: ["パフォーマンス保証（3ヶ月）", "ビジネス成果保証（6ヶ月）", "年間契約プランあり（10%割引）"]
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
      ],
      youtubeMessages: {
        apiNotConfigured: 'YouTube APIが設定されていません',
        watchDirectly: 'YouTubeチャンネルを直接ご覧ください',
        loading: '動画を読み込み中...',
        noVideosFound: '動画が見つかりませんでした',
        loadFailed: '動画の読み込みに失敗しました',
        playbackError: '動画の再生でエラーが発生しました',
        channelNotFound: 'チャンネルが見つかりません',
        videosNotFound: '動画が見つかりません'
      },
      buttonTexts: {
        goTo: 'Go'
      }
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
        link: 'https://www.tapforge.org/p/company',
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
      title: "Beyond Words, Delivering Feelings.",
      subtitle: "Once expressed through trumpet, now through code. A former musician's pursuit of 'communication beyond words.'",
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
      subtitle: "What I once pursued with the trumpet - communication beyond words - now through technology.",
      paragraphs: [
        "Our founder has ASD and knows the pain of 'not being understood.'",
        "That's why we're serious about realizing miscommunication-free communication.",
        "Through business card exchanges, websites, and AI-mediated conversations. Small moments of 'ah, it got through' in daily life.",
        "When these accumulate, everyone can properly convey and be understood for their value.",
        "We use technology to remove the 'word barriers' between people, creating a world where everyone can shine as themselves."
      ],
      stats: [
        { name: "Since Founded", value: "2 years" },
        { name: "Languages", value: "10" },
        { name: "Projects", value: "15" },
        { name: "Services", value: "App Develop & IT/AI Strategy" }
      ]
    },
    founderStory: {
      title: "Founder's Story",
      subtitle: "Why does a former musician run a non-music business?",
      paragraphs: [
        "Since childhood, I was 'the kid who couldn't read the room.' With ASD, I've always felt a wall between myself and others.",
        "In my second year of high school, playing a trumpet solo in a hall filled with 2,000 people, I first experienced the emotion of 'communication beyond words.' Every consciousness in the venue focused on me, and my soul trembled with a sense of unity that needed no words.",
        "But in the music industry, I never felt that emotion again. Connections, hierarchy, reading between the lines. Expression degraded into mere 'work,' and I became ill.",
        "During the pandemic, I left music and worked in sales at Recruit. There, I faced 'the limitations of existing tools' and 'the frustration of words not reaching people.'",
        "Then I discovered technology. Code doesn't betray. AI doesn't get emotional. Most importantly, I could witness how what I created solved someone's problems and enriched their lives.",
        "That emotion from high school, now in daily life. In business card exchanges, on websites, through AI-mediated communication. Accumulating small moments of 'ah, it got through.'",
        "That is the origin of Cor.inc."
      ]
    },
    productBackstory: {
      title: "Why These Services?",
      products: [
        {
          name: "TapForge",
          subtitle: "Communication Revolution Starting from 'Meeting'",
          story: "During my time as a salesperson at Recruit, I repeatedly experienced situations where business cards would pile up after exchanges, making it impossible to remember who was who. The 'ritual' of exchanging business cards should be a declaration of intent to 'build a relationship,' but in reality, it only becomes a formal record of 'we exchanged contact information.' I felt a significant miscommunication here. TapForge is a product designed to transform business card exchanges into 'real encounters.' With just one tap, you can instantly access all information—profiles, SNS, portfolios, appointment calendars. Instead of verbally explaining 'This is what I do,' you can convey everything about yourself visually and intuitively with a single tap. This is the first step toward 'communication beyond words.'"
        },
        {
          name: "BoltSite",
          subtitle: "Shaping Companies' 'Feelings'",
          story: "When I was in sales at Recruit, I saw many company websites, but most failed to convey the 'feelings' or 'passion' of those companies. Business owners have passionate thoughts. They take pride in their products and services. But this is not reflected on their websites at all—because they can only express within the framework of existing tools. BoltSite is an ultra-fast website creation service using the Astro framework, but what I truly value is bringing out 'that company's essence.' In website creation meetings, I listen intently to business owners. 'Why did you start this business?' 'What feelings do you have when creating products?' Then, I interpret the unspoken feelings behind those words and translate them into design and copy. The result is not just a 'corporate information site' but a website where you can feel that company's 'personality.'"
        },
        {
          name: "IoTRealm",
          subtitle: "Contract Development to Shape Feelings",
          story: "After building trust through business cards and websites, many business owners say, 'Actually, I've been thinking it would be nice if we could do this...' Sometimes it's vague, sometimes grandiose, sometimes unclear if it's even technically possible. But behind it, there's definitely a pure desire: 'It would be great if this happened.' IoTRealm is a contract development service to shape such 'feelings.' For example, a real estate and construction startup representative proposed 'a product that automatically generates floor plans just by giving AI a site map,' won an award, but was struggling because they didn't know how to technically realize it. I created a prototype in two weeks—an app that uses YOLO image recognition AI to automatically determine buildable areas from site maps and generate simple floor plans. This is also 'communication beyond words.' By converting complex regulations and calculations into visual data, we can break down the knowledge barrier between experts and laypeople and share information without misunderstanding."
        }
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
        privacy: "Privacy",
        legal: "Legal Notice"
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
    linkTypes: {
      LitLink: "LitLink",
      X: "X",
      Zenn: "Zenn",
      Homepage: "Homepage"
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
          demo: 'https://tapforge.pages.dev/en/',
        },
        {
          name: 'BoltSite',
          description: 'Ultra-fast 0.3s loading with<br/>perfect SEO scores',
          demo: 'https://boltsite.pages.dev/en/',
        },
        {
          name: 'IoTRealm',
          description: 'Bridging digital innovation<br/>with physical reality',
          demo: 'https://iotrealm.pages.dev/en/',
        },
      ],
      pricing: {
        title: "Pricing List (Tax Included)",
        services: [
          {
            name: "TapForge",
            items: [
              { item: "Monthly usage fee", price: "¥500-700/month", note: "1 NFC business card service included" },
              { item: "2nd card onwards", price: "¥600/card" },
              { item: "100+ cards bulk order", price: "¥500/card" }
            ]
          },
          {
            name: "BoltSite",
            items: [
              { item: "Standard Plan", price: "¥15,000/month" },
              { item: "Professional Plan", price: "¥25,000/month" },
              { item: "Enterprise", price: "¥50,000+/month" }
            ],
            notes: ["Performance guarantee (3 months)", "Business results guarantee (6 months)", "Annual contract available (10% discount)"]
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
      ],
      youtubeMessages: {
        apiNotConfigured: 'YouTube API is not configured',
        watchDirectly: 'Please watch directly on the YouTube channel',
        loading: 'Loading video...',
        noVideosFound: 'No videos found',
        loadFailed: 'Failed to load video',
        playbackError: 'Video playback error occurred',
        channelNotFound: 'Channel not found',
        videosNotFound: 'No videos found'
      },
      buttonTexts: {
        goTo: 'Go'
      }
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
        link: 'https://www.tapforge.org/p/company',
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
  },
  zh: {
    nav: { home: "首页", about: "关于我们", products: "产品&洞察", blog: "博客", contact: "联系我们" },
    hero: {
      title: "比任何人都更快，超越地平线。",
      subtitle: "通过AI打破语言和文化壁垒，实现人们真正相互理解的社会。",
      cta: "查看我们的作品和产品"
    },
    services: {
      title: "服务",
      items: [
        { step: "01", name: "IT咨询与数据分析", description: "基于Python的爬虫和BI分析可视化现状，从战略规划到实施全程陪伴的DX支持服务。" },
        { step: "02", name: "Web与移动应用开发", description: "使用Flutter、React等最新框架，一站式提供高速且丰富UX的B2B/B2C应用。" },
        { step: "03", name: "AI解决方案开发", description: "利用生成AI/LLM、图像识别、语音处理，开发针对客户问题优化的智能应用和自动化工具。" }
      ]
    },
    about: {
      title: "关于我们",
      description: "Cor.inc以\"通过竞争而非共创开拓未来，实现幸福社会\"为使命，从事IT战略咨询及相关产品开发、自社AI产品开发销售。重视\"共创\"而非\"竞争\"，发挥初创企业的\"速度感\"优势，提供充满创造性和创新性的服务。",
      cta: "更多详情",
      heading: {
        title: "关于我们",
        description: "Cor.inc以\"通过竞争而非共创开拓未来，实现幸福社会\"为使命，从事IT战略咨询及相关产品开发、自社AI产品开发销售。重视\"共创\"而非\"竞争\"，发挥初创企业的\"速度感\"优势，提供充满创造性和创新性的服务。"
      }
    },
    mission: {
      title: "我们的使命",
      subtitle: "曾经用小号追求的「超越语言的传达」,现在用技术实现。",
      paragraphs: [
        "创始人自身具有ASD特质,深知「无法传达」的痛苦。",
        "正因如此,我们认真致力于实现无误解的沟通。",
        "在名片交换中、在网站上、在AI辅助的对话中。日常小小的瞬间产生「啊,传达到了」的感动。",
        "积累起来,就能形成每个人都能正确传达自己的价值、被他人理解的社会。",
        "我们使用技术消除人与人之间的「语言障碍」,创造每个人都能展现自我光彩的世界。"
      ],
      stats: [
        { name: "成立以来", value: "2年" },
        { name: "可用语言", value: "10" },
        { name: "项目", value: "15" },
        { name: "提供服务", value: "应用开发 & IT/AI战略" }
      ]
    },
    founderStory: {
      title: "创始人的故事",
      subtitle: "为什么前音乐家经营非音乐业务？",
      paragraphs: [
        "从小我就是那个'不会察言观色的孩子'。我患有ASD，一直感觉自己和他人之间有一堵墙。",
        "高中二年级的冬天，在容纳2000人的音乐厅里演奏小号独奏时，我第一次体验到了'超越语言的沟通'的感动。整个会场的意识都集中在我身上，那种不需要言语的一体感让我的灵魂为之震颤。",
        "但在音乐界，我再也没有感受到那种感动。人脉、地位、揣摩心意。表达沦为了'工作'，我病倒了。",
        "疫情期间，我离开了音乐，在Recruit做销售。在那里，我面对了'现有工具的局限性'和'言语无法传达的焦虑'。",
        "然后我发现了技术。代码不会背叛。AI不会情绪化。最重要的是，我能亲眼看到我创造的东西如何解决别人的问题，如何丰富他们的生活。",
        "将高中时代的那种感动，融入日常生活。在交换名片时，在网站上，通过AI中介的沟通。积累'啊，传达到了'的小小感动。",
        "这就是Cor.inc的起源。"
      ]
    },
    productBackstory: {
      title: "为什么是这些服务？",
      products: [
        {
          name: "TapForge",
          subtitle: "从'相遇'开始的沟通革命",
          story: "在Recruit做销售时，我多次经历名片交换后名片堆积如山，不知道谁是谁的情况。名片交换这个'仪式'本应是'让我们建立关系'的意向表达，但实际上只成为了'我们交换了联系方式'的形式记录。我在这里感受到了巨大的误解。TapForge是一个旨在将名片交换转变为'真正相遇'的产品。只需一次点击，您就可以立即访问所有信息——个人资料、社交媒体、作品集、预约日历。不用口头解释'我做这个工作'，只需一次点击就能视觉化、直观地传达您的一切。这是迈向'超越语言的沟通'的第一步。"
        },
        {
          name: "BoltSite",
          subtitle: "塑造企业的'情感'",
          story: "在Recruit做销售时，我看到了许多公司网站，但大多数都无法传达这些公司的'情感'或'热情'。企业主有热情的想法。他们为自己的产品和服务感到自豪。但这完全没有反映在他们的网站上——因为他们只能在现有工具的框架内表达。BoltSite是使用Astro框架的超高速网站创建服务，但我真正重视的是展现'那个公司的本质'。在网站创建会议中，我专注地倾听企业主的想法。'您为什么创办这项业务？''您在制造产品时有什么感受？'然后，我解读这些话语背后未说出口的感受，并将它们转化为设计和文案。结果不仅仅是'企业信息网站'，而是一个能让您感受到那个公司'个性'的网站。"
        },
        {
          name: "IoTRealm",
          subtitle: "塑造情感的承包开发",
          story: "通过名片和网站建立信任后，许多企业主会说：'实际上，我一直在想如果能做到这个就好了...'有时模糊，有时宏大，有时甚至不清楚技术上是否可行。但背后肯定有一个纯粹的愿望：'如果能实现这个就太好了'。IoTRealm是一个承包开发服务，旨在塑造这些'情感'。例如，一家房地产和建筑初创公司的代表提出了'只需给AI一个场地图就能自动生成平面图的产品'，并获得了奖项，但由于不知道如何在技术上实现而苦恼。我在两周内创建了一个原型——使用YOLO图像识别AI从场地图自动判断可建筑区域并生成简单平面图的应用程序。这也是'超越语言的沟通'。通过将复杂的法规和计算转换为视觉数据，我们可以打破专家和外行之间的知识壁垒，无误地分享信息。"
        }
      ]
    },
    contact: {
      title: "请随时咨询！",
      description1: "确认咨询内容后，我们将在3个工作日内由负责人联系您。请稍等片刻。",
      description2: "如上述期间内未收到回复，可能存在发送故障。麻烦您再次联系我们。",
      heading: {
        title: "联系我们",
        description: "如有疑问、咨询、估价请求等，请随时联系我们。"
      },
      form: {
        title: "请随时咨询！",
        description1: "确认咨询内容后，我们将在3个工作日内由负责人联系您。请稍等片刻。",
        description2: "如上述期间内未收到回复，可能存在发送故障。麻烦您再次联系我们。",
        fields: {
          name: "姓名",
          email: "邮箱地址",
          consultationType: "咨询内容",
          consultationTypePlaceholder: "请选择咨询内容",
          consultationOptions: [
            "关于TapForge的咨询",
            "关于BoltSite的咨询",
            "关于IoTRealm的咨询",
            "其他"
          ],
          message: "消息"
        },
        submit: "发送",
        reset: "重置"
      }
    },
    footer: {
      title: "页脚",
      social: "社交媒体",
      company: "公司",
      legal: "法律",
      links: {
        home: "首页",
        about: "关于我们",
        products: "产品&洞察",
        contact: "联系我们",
        privacy: "隐私",
        legal: "法律声明"
      },
      description: "Cor.inc以\"通过竞争而非共创开拓未来，实现幸福社会\"为使命，从事IT战略咨询及相关产品开发、自社AI产品开发销售。重视\"共创\"而非\"竞争\"，发挥初创企业的\"速度感\"优势，提供充满创造性和创新性的服务。",
      copyright: "© 2025 Cor.inc"
    },
    features: {
      title: "特色",
      items: [
        {
          id: 'uniqueness-1',
          name: '数字技术整合',
          description: '基于Python收集的信息制定IT战略，开发MVP Web应用进行测试营销...我们可以覆盖此类跨多个技术和流程的项目。'
        },
        {
          id: 'uniqueness-2',
          name: '一站式服务',
          description: '从规划到开发、测试发布、服务提供开始，我们全程负责。由于同一团队负责，认识差异较少，能以更低的成本提供更快速的开发。'
        },
        {
          id: 'uniqueness-3',
          name: '客户优先开发',
          description: '我们开发中最重视的是"客户分辨率"。通过细致的反馈、测试营销、里程碑，洞察客户真正需求，建立双赢的商务伙伴关系。'
        },
        {
          id: 'uniqueness-4',
          name: '「最速最智能」的体验',
          description: '我们敏锐捕捉新趋势和知识。快速将有益解决方案反映到提案中，提供前所未有的新体验。'
        },
        {
          id: 'uniqueness-5',
          name: '新价值观的创造',
          description: '不拘泥于传统概念，真诚面对新观点和想法。充分发挥初创企业特有的「速度感」，通过技术为刚诞生的价值观发声。'
        },
        {
          id: 'uniqueness-6',
          name: '独特视角解决社会课题',
          description: '人类对进步的激情永不停息。我们利用技术填补差距，促进有意义的沟通，同时积极致力于解决伴随进步的社会问题。'
        }
      ]
    },
    header: {
      mobileMenuDescription: "Cor.inc以\"通过竞争而非共创开拓未来，实现幸福社会\"为使命，从事IT战略咨询及相关产品开发、自社AI产品开发销售。重视\"共创\"而非\"竞争\"，发挥初创企业的\"速度感\"优势，提供充满创造性和创新性的服务。"
    },
    "404": {
      title: "404",
      subtitle: "页面未找到",
      description: "您访问的页面不存在。请检查地址栏中的URL并重试。",
      cta: "返回首页"
    },
    aboutPage: {
      title: "About",
      subtitle: "世界で一番「幸せ」のことを考えている企業であること、そして世界で一番本当の幸せを求めて社会を共創する企業であること。"
    },
    values: {
      title: "我们的价值观"
    },
    team: {
      title: "认识我们的团队"
    },
    linkTypes: {
      LitLink: "LitLink",
      X: "X",
      Zenn: "Zenn",
      Homepage: "主页"
    },
    faq: {
      title: "常见问题",
      questions: [
        {
          question: "开发流程是怎样的？项目完成前的典型时间表是什么？",
          answer: "在开发过程中，我们的工程师将在线听取您的需求，并定义必要的系统和需求。在初次会议后一周内，我们将计算每个产品的价格，在您批准后，我们将进行报价。由于我们不外包任何工作，所有项目都在内部处理，我们可以比平均交付时间快约20%交付产品。对于大型项目，我们可以分配与项目产生共鸣的自由职业工程师，实现更快、更具成本效益的交付。"
        },
        {
          question: "项目成本如何计算？付款方式如何？",
          answer: "定价根据客户需求而有所不同，因此我们将在初次会议后向您发送报价。与同行业类似项目相比，我们通常以约15%更低的成本提供提案。付款方式包括银行转账、Paypal等。请在初次会议时告知我们的工作人员您首选的付款方式。"
        },
        {
          question: "使用JavaScript、TypeScript、Python、Go等语言有什么好处？",
          answer: "JavaScript于1995年在Netscape诞生，已成为Web开发的基础。TypeScript作为其超集，添加了静态类型，提高了大型项目的可维护性。Python是1991年开发的通用语言，以简单易读的语法著称。它涵盖AI/机器学习、数据分析和Web开发，拥有丰富的库，开发效率极高。Go（Golang）是Google于2009年开发的轻量级、高速语言，具有简单的语法和并发处理（goroutines）。它非常适合云原生应用程序和微服务，编译速度快，内存效率高，是可扩展服务器开发的理想选择。"
        },
        {
          question: "使用Firebase、Supabase等BaaS以及云服务有什么优势？",
          answer: "BaaS（Backend as a Service）提供身份验证、数据库、存储和推送通知等后端功能。Firebase是Google的服务，具有实时数据库和丰富的功能。Supabase是开源的Firebase替代品，提供基于PostgreSQL的实时功能和RESTful API。云服务通常提供灵活性，可以根据需要扩展资源，同时保持较低的初始投资。AWS、Google Cloud和Azure等主要提供商提供高可用性、自动备份和安全功能。全球CDN、负载均衡和监控工具提高了性能和可靠性，同时显著减少了运营开销。主要优势包括缩短开发时间、降低运营成本和确保可扩展性。"
        },
        {
          question: "根据需求可以定制任务到什么程度？如果需要更改，如何处理？",
          answer: "我们会听取每个项目的需求并创建定制解决方案，因此定制几乎是无限的。但是，为了加快交付并避免关键系统错误，我们通常不接受生产过程中需求的更改。请在会议前充分总结您的需求。"
        },
        {
          question: "开发后如何进行维护和支持？是否有额外费用？",
          answer: "由于我们的主要业务是开发，除了重大定制外，我们不提供维护或支持。开发完成后，我们可以介绍我们专门从事维护和支持的合作伙伴公司。请与我们咨询有关费用的问题。"
        },
        {
          question: "如何确保数据安全和隐私？",
          answer: "为确保数据安全和隐私，我们使用先进的加密技术，并最大限度地利用Firebase和SupaBase等BaaS的安全功能。对于访问控制，我们为每个客户设置专用账户，并以最低必要权限进行管理。我们严格遵守数据保护政策，并进行定期安全审计，在整个开发、交付和维护过程中保护您的数据。"
        }
      ]
    },
    calendar: {
      title: "代表日程",
      description: "这是代表的公开日程。如需安排会议等，请参考此日程。",
      ariaLabel: "代表日程日历",
      note: "* 会议请求请通过下面的联系表单联系我们。"
    },
    testimonials: {
      title: "技术专长",
      items: [
        {
          name: "JavaScript/TypeScript",
          description: "前端&后端开发",
          image: "/assets/jsts.avif",
          message: "JavaScript于1995年在Netscape诞生，已成为Web开发的基础。TypeScript作为其超集，添加了静态类型，提高了大型项目的可维护性。它与Node.js和React结合使用，用于实时通信和UI构建。凭借异步处理和丰富的生态系统，它非常适合快速和交互式应用程序开发。"
        },
        {
          name: "Python",
          description: "AI&机器学习",
          image: "/assets/python.avif",
          message: "Python是1991年开发的通用编程语言。其特点是语法简单易读，广泛应用于机器学习、AI开发和数据分析。通过利用TensorFlow和PyTorch等库，可以快速构建复杂的AI模型，从初学者到高级用户都广泛支持。"
        },
        {
          name: "Go",
          description: "后端&高性能系统",
          image: "/assets/go.avif",
          message: "Go（Golang）是Google于2009年开发的轻量级、高速编程语言。其特点是语法简单和并发处理（goroutines），适合云原生应用程序和微服务。编译速度快，内存效率高，是开发可扩展服务器的理想选择。"
        }
      ]
    },
    cta: {
      title: "需要更详细的信息吗？",
      description: "请随时联系我们。如果您需要更详细的信息或有具体问题，我们的团队将为您提供支持。"
    },
    products: {
      heading: {
        title: "产品与洞察",
        description: "关于我们的产品、服务和技术洞察的详细信息。"
      }
    },
    homeCta: {
      title: "联系我们",
      description: "如有任何问题、咨询或报价请求，请随时联系我们。",
      button: "联系我们"
    },
    productsTable: {
      title: "业务列表",
      demoLabel: "演示/仓库",
      mediaTitle: "外部媒体",
      products: [
        {
          name: 'TapForge',
          description: '一键连接，<br/>下一代商务网络',
          demo: 'https://tapforge.pages.dev/zh/',
        },
        {
          name: 'BoltSite',
          description: '超快0.3秒加载<br/>完美SEO评分',
          demo: 'https://boltsite.pages.dev/zh/',
        },
        {
          name: 'IoTRealm',
          description: '数字创新<br/>与物理现实的桥梁',
          demo: 'https://iotrealm.pages.dev/zh/',
        },
      ],
      pricing: {
        title: "价格表（含税）",
        services: [
          {
            name: "TapForge",
            items: [
              { item: "月使用费", price: "¥500-700/月", note: "含1张NFC名片服务" },
              { item: "第2张起", price: "¥600/张" },
              { item: "100张以上批量订购", price: "¥500/张" }
            ]
          },
          {
            name: "BoltSite",
            items: [
              { item: "标准计划", price: "¥15,000/月" },
              { item: "专业计划", price: "¥25,000/月" },
              { item: "企业版", price: "¥50,000+/月" }
            ],
            notes: ["性能保证（3个月）", "业务成果保证（6个月）", "可选年度合同（10%折扣）"]
          },
          {
            name: "IoTRealm",
            items: [
              { item: "PoC（概念验证）", price: "¥100万~500万" },
              { item: "正式开发", price: "¥500万~" },
              { item: "维护运营", price: "¥10万~/月" }
            ]
          }
        ]
      },
      articles: [
        {
          name: 'Note',
          description: '发布生成AI活用技巧和经营视角专栏',
          icon: '/assets/Note.avif',
          action: 'https://note.com/cor_instrument',
        },
      ],
      youtube: [
        {
          name: 'YouTube',
          description: '我们提供技术和商业战略相关的视频内容。分享AI应用案例和产品开发的幕后故事。',
          isFlagged: true,
          icon: '/assets/Youtube.avif',
          action: 'https://www.youtube.com/@Cor.Incorporated',
        },
      ],
      youtubeMessages: {
        apiNotConfigured: 'YouTube API未配置',
        watchDirectly: '请直接在YouTube频道观看',
        loading: '正在加载视频...',
        noVideosFound: '未找到视频',
        loadFailed: '视频加载失败',
        playbackError: '视频播放发生错误',
        channelNotFound: '未找到频道',
        videosNotFound: '未找到视频'
      },
      buttonTexts: {
        goTo: '前往'
      }
    },
    contactInfo: {
      address: {
        label: "邮寄地址",
        value: "810-0001 福冈县 福冈市\n中央区天神2丁目3-10\n天神派恩克雷斯特719号"
      },
      phone: {
        label: "电话号码",
        value: "070-8561-1659"
      },
      chat: {
        label: "邮箱",
        value: "与AI Cloudia聊天"
      }
    },
    valuesData: [
      [
        {
          ref: '01',
          name: '首先行动',
          description: '只是想想谁都能做到。接受正确答案将由后来的人判断，一旦决定就快速行动，朝着最好的结果努力。',
        },
        {
          ref: '02',
          name: '经常自问自答',
          description: '幸福的形式总是在变化。为了追求真正的幸福，我们必须经常问自己"这是最好的吗？"，不断思考，持续行动。',
        },
        {
          ref: '03',
          name: '让双方都幸福',
          description: '只有幸福的人才能让别人幸福。总是思考既能让自己也能让对方双赢的行动，不牺牲任何东西。',
        },
      ],
      [
        {
          ref: '04',
          name: '明确表达意图',
          description: '犹豫不决的行动是浪费的，对双方都没有好处。任何事情都要自己坚定地决定，全力以赴。',
        },
        {
          ref: '05',
          name: '灵活的服务',
          description: '让尽可能多的利益相关者变得幸福。为此，我们故意不设标准化服务，而是根据个别任务构建最优服务。（例）根据客户要求即时定制WebAR名片和AI聊天机器人',
        },
        {
          ref: '06',
          name: '自己开拓命运',
          description: '无论成败，自己的行动都要自己负责。成果和反思都是自己行动的结果，笑着接受。',
        },
      ],
    ],
    teamData: [
      {
        name: 'Kousuke Terada',
        image: '/assets/k-terada.avif',
        job: 'CEO',
        description: '音乐学院毕业 → 乐器制造商销售 → 大型风险投资企业销售 → 转行IT。利用这一独特背景挑战"技术与语言的桥梁"。',
        comingSoon: false,
        link: 'https://www.tapforge.org/p/company',
      },
      {
        name: 'Cloudia Sorano',
        image: '/assets/cloudia.avif',
        job: 'AI大使',
        description: '用福冈方言分享技术话题的内部AI。目前挑战在Zenn和X上连续51周的Lightning Talks。',
        comingSoon: false,
        link: 'https://x.com/Cloudia_Cor',
        zennLink: 'https://zenn.dev/cloudia',
      },
      {
        name: 'Nagisa Terada',
        image: '/assets/nagi.avif',
        job: '员工',
        description: '美容学校毕业后，在沙龙工作了7年。学习编程后转行IT。每天都在努力将挑战转化为可能性。',
        comingSoon: false,
        link: 'https://digital-studio-c5abe.web.app/',
      },
    ],
    meta: {
      home: { title: "Cor.inc · 通过创新引领协作", description: "Cor.inc专注于Python驱动的数据分析和Web与移动应用开发，为想要改变世界的创新人士创建创新的、机器学习增强的解决方案。" },
      about: { title: "关于我们 · Cor.inc", description: "了解更多我们的历史、价值观、使命等。我们是一群拥有相同价值观的人。" },
      contact: { title: "联系我们 · Cor.inc", description: "联系我们的团队，了解更多我们如何帮助您。" },
      products: { title: "产品&洞察 · Cor.inc", description: "探索我们的产品和洞察页面，展示我们的创新IT解决方案和媒体推广。此页面提供有关我们产品组合、开发服务和战略洞察的详细信息。发现我们的尖端技术解决方案，了解我们的创新方法，并了解我们如何帮助改变您的数字形象。适合寻求综合IT服务和产品解决方案的企业。" },
      "404": { title: "未找到 · Cor.inc", description: "页面未找到。请检查地址栏中的URL并重试。" },
      privacy: { title: "隐私政策 · Cor.inc", description: "我们的隐私政策将帮助您了解收集了哪些信息以及如何使用。" }
    },
    privacy: {
      title: "隐私政策",
      lastUpdate: "最后更新：2024年5月13日",
      intro: "Cor.inc将客户隐私放在首位，致力于保护客户隐私。本隐私政策详细说明了我们在您使用我们的服务（包括网络分析工具、Flutter应用程序、机器学习解决方案等）时收集、使用和保护个人信息的做法。我们建议您查看本政策以了解我们的承诺。",
      section1: {
        title: "1. 我们收集的信息",
        description: "当您使用我们的服务时，我们可能会收集以下各种类型的个人信息：",
        items: [
          "您提供的信息：这可能包括您在创建账户或使用我们服务的特定功能时提供的姓名、电子邮件地址、联系方式和其他相关数据。",
          "使用数据：我们收集与您使用我们服务相关的数据，包括您的IP地址、浏览器类型、设备信息、访问的页面以及与我们服务的交互。",
          "Cookie和类似技术：为了改善用户体验和了解使用模式，我们的服务使用Cookie和类似技术。"
        ]
      },
      section2: {
        title: "2. 我们如何使用您的信息",
        description: "我们可能将您的个人信息用于以下目的：",
        items: [
          "服务提供和改进：我们使用您的数据来提供个性化体验并改进我们服务的功能。",
          "沟通：您的电子邮件地址和联系信息可能用于发送更新、新闻通讯和促销材料。您可以选择退出这些通信。",
          "分析：为了更好地了解用户行为并改进我们的服务，我们分析汇总和匿名化的数据。"
        ]
      },
      contact: {
        title: "联系我们",
        description: "如果您对我们的隐私政策有任何疑问或疑虑，请通过我们的",
        linkText: "联系表单",
        suffix: "与我们联系。"
      }
    }
  },
  ko: {
    nav: { home: "홈", about: "회사소개", products: "제품&인사이트", blog: "블로그", contact: "문의" },
    hero: {
      title: "누구보다 빠르게, 지평선 너머로.",
      subtitle: "AI로 언어와 문화의 벽을 넘어 사람들이 진정으로 이해하는 사회를 실현합니다.",
      cta: "실적과 제품 보기"
    },
    services: {
      title: "서비스",
      items: [
        { step: "01", name: "IT 컨설팅 및 데이터 분석", description: "Python 기반 스크래핑과 BI 분석으로 현황을 시각화하고, 전략 수립부터 구현까지 동반하는 DX 지원 서비스입니다." },
        { step: "02", name: "웹 및 모바일 앱 개발", description: "Flutter, React 등 최신 프레임워크를 활용하여 고속이고 풍부한 UX의 B2B/B2C 앱을 원스톱으로 제공합니다." },
        { step: "03", name: "AI 솔루션 개발", description: "생성 AI/LLM, 이미지 인식, 음성 처리를 활용하여 고객의 과제에 최적화된 지능형 앱과 자동화 도구를 개발합니다." }
      ]
    },
    about: {
      title: "회사소개",
      description: "Cor.inc는 '경쟁이 아닌 공동창조를 통해 미래를 개척하고, 행복한 사회를 실현한다'는 미션을 내걸고, IT 전략 컨설팅 및 관련 제품 개발, 자사 AI 제품 개발 및 판매를 하고 있습니다. '경쟁'보다 '공동창조'를 중시하며, 스타트업의 강점인 '속도감'을 살려 창조성과 혁신성이 넘치는 서비스를 제공하고 있습니다.",
      cta: "자세히 보기",
      heading: {
        title: "회사소개",
        description: "Cor.inc는 '경쟁이 아닌 공동창조를 통해 미래를 개척하고, 행복한 사회를 실현한다'는 미션을 내걸고, IT 전략 컨설팅 및 관련 제품 개발, 자사 AI 제품 개발 및 판매를 하고 있습니다. '경쟁'보다 '공동창조'를 중시하며, 스타트업의 강점인 '속도감'을 살려 창조성과 혁신성이 넘치는 서비스를 제공하고 있습니다."
      }
    },
    mission: {
      title: "우리의 미션",
      subtitle: "한때 트럼펫으로 추구했던 '말을 넘어선 전달'을, 지금은 기술로.",
      paragraphs: [
        "창업자 자신이 ASD라는 특성을 가지고 있어, '전달되지 않는' 고통을 알고 있습니다.",
        "그렇기 때문에 오해 없는 소통 실현에 진심입니다.",
        "명함 교환에서, 홈페이지에서, AI를 통한 대화에서. 일상의 작은 순간에 '아, 전달됐구나'라는 감동을.",
        "그것이 쌓이면, 누구나 자신의 가치를 제대로 전달하고 이해받는 사회가 됩니다.",
        "우리는 기술을 사용하여 사람과 사람 사이의 '언어의 벽'을 없애고, 누구나 자신답게 빛날 수 있는 세상을 만듭니다."
      ],
      stats: [
        { name: "설립부터", value: "2년" },
        { name: "사용 가능한 언어", value: "10" },
        { name: "프로젝트", value: "15" },
        { name: "제공 서비스", value: "앱 개발 & IT/AI 전략" }
      ]
    },
    founderStory: {
      title: "창립자의 이야기",
      subtitle: "왜 전직 음악가가 음악과 무관한 사업을?",
      paragraphs: [
        "어릴 때부터 '눈치 없는 아이'였습니다. ASD라는 특성을 가지고 있어, 항상 타인과의 벽을 느끼며 살아왔습니다.",
        "고등학교 2학년 겨울, 2000명이 들어가는 홀에서 트럼펫 솔로를 연주했을 때, 처음으로 '언어를 넘어선 소통'의 감동을 맛보았습니다. 회장의 모든 의식이 집중되고, 말이 필요 없는 일체감에 영혼이 떨렸습니다.",
        "하지만 음악 업계에서, 그 감동을 다시 맛볼 수 없었습니다. 인맥, 지위, 속마음 탐색. 표현은 '일'로 전락했고, 저는 마음의 병을 얻었습니다.",
        "코로나 시기에 음악의 길을 떠나 Recruit에서 영업을 경험했습니다. 거기서 '기존 도구의 한계'와 '말이 전달되지 않는 답답함'에 직면했습니다.",
        "그리고 기술을 만났습니다. 코드는 배신하지 않습니다. AI는 감정적이지 않습니다. 무엇보다 제가 만든 것이 누군가의 문제를 해결하고 실제로 삶을 풍요롭게 하는 모습을 목격할 수 있습니다.",
        "그 고등학교 시절의 감동을, 이제는 일상에서. 명함 교환에서, 홈페이지에서, AI를 통한 소통에서. '아, 전달되었다'는 작은 감동을 쌓아가는 것.",
        "그것이 Cor.inc의 원점입니다."
      ]
    },
    productBackstory: {
      title: "왜 이 서비스들인가?",
      products: [
        {
          name: "TapForge",
          subtitle: "'만남'에서 시작되는 소통 혁신",
          story: "Recruit에서 영업을 하던 시절, 명함 교환 후 명함이 산처럼 쌓여 누가 누구인지 알 수 없게 되는 상황을 여러 번 경험했습니다. 명함 교환이라는 '의식'은 본래 '앞으로 관계를 쌓아가자'는 의사 표시여야 하는데, 실제로는 '일단 연락처를 교환했습니다'라는 형식적인 기록에 불과했습니다. 여기에서 큰 미스커뮤니케이션을 느꼈습니다. TapForge는 명함 교환을 '진정한 만남'으로 바꾸기 위한 제품입니다. 한 번의 탭으로 프로필, SNS, 포트폴리오, 예약 캘린더 등 모든 정보에 즉시 접근할 수 있습니다. '저는 이런 일을 합니다'라고 구두로 설명하는 대신, 한 번의 탭으로 자신의 모든 것을 시각적으로, 직관적으로 전달할 수 있습니다. 이것이 '언어를 넘어선 소통'의 첫 번째 단계입니다."
        },
        {
          name: "BoltSite",
          subtitle: "기업의 '마음'을 형상화",
          story: "Recruit에서 영업을 할 때 많은 기업 웹사이트를 봤지만, 대부분 그 기업의 '마음'이나 '열정'이 전혀 전달되지 않았습니다. 경영자는 열정적인 생각을 가지고 있습니다. 자사 제품과 서비스에 자부심을 가지고 있습니다. 하지만 그것이 웹사이트에 전혀 반영되지 않습니다—기존 도구의 틀 안에서만 표현할 수 있기 때문입니다. BoltSite는 Astro 프레임워크를 사용한 초고속 웹사이트 제작 서비스이지만, 제가 진정으로 중요하게 여기는 것은 '그 기업다움'을 끌어내는 것입니다. 웹사이트 제작 미팅에서는 경영자의 이야기를 끊임없이 듣습니다. '왜 이 사업을 시작했나요?' '제품을 만들 때 어떤 마음이었나요?' 그리고 그 말 뒤에 있는, 말로 표현되지 않은 마음을 읽어내어 디자인과 카피에 담아냅니다. 그 결과 만들어지는 것은 단순한 '기업 정보 사이트'가 아니라, 그 기업의 '인격'이 느껴지는 웹사이트입니다."
        },
        {
          name: "IoTRealm",
          subtitle: "마음을 형상화하는 수탁 개발",
          story: "명함과 웹사이트로 신뢰 관계를 구축한 후, 많은 경영자들이 '사실은 이런 걸 할 수 있으면 좋겠다고 생각하고 있는데...'라고 말합니다. 때로는 모호하고, 때로는 거대하며, 때로는 기술적으로 가능한지조차 불분명한 아이디어입니다. 하지만 그 뒤에는 확실히 '이렇게 되면 좋겠다'는 순수한 마음이 있습니다. IoTRealm은 그런 '마음'을 형상화하기 위한 수탁 개발 서비스입니다. 예를 들어, 한 부동산·건설 스타트업 대표가 'AI에 부지 지도를 넘기기만 하면 자동으로 평면도를 생성하는 제품'을 제안해 우승했지만, 기술적으로 어떻게 실현할지 몰라 고민하고 있었습니다. 저는 2주 만에 프로토타입을 만들었습니다—YOLO 이미지 인식 AI를 사용해 부지 지도에서 건축 가능 지역을 자동 판정하고 간단한 평면도를 생성하는 앱입니다. 이것 역시 '언어를 넘어선 소통'입니다. 복잡한 법 규제와 계산을 시각적 데이터로 변환함으로써 전문가와 비전문가 사이의 지식 장벽을 허물고 오해 없이 정보를 공유할 수 있습니다."
        }
      ]
    },
    contact: {
      title: "언제든지 문의하세요!",
      description1: "문의 내용을 확인한 후, 3 영업일 이내에 담당자가 연락드리겠습니다. 잠시만 기다려 주세요.",
      description2: "위 기간 내에 답변이 없는 경우, 전송 문제의 가능성이 있습니다. 번거로우시겠지만 다시 연락해 주시기 바랍니다.",
      heading: {
        title: "문의",
        description: "질문이나 상담, 견적 요청 등 언제든지 문의해 주세요."
      },
      form: {
        title: "언제든지 문의하세요!",
        description1: "문의 내용을 확인한 후, 3 영업일 이내에 담당자가 연락드리겠습니다. 잠시만 기다려 주세요.",
        description2: "위 기간 내에 답변이 없는 경우, 전송 문제의 가능성이 있습니다. 번거로우시겠지만 다시 연락해 주시기 바랍니다.",
        fields: {
          name: "이름",
          email: "이메일 주소",
          consultationType: "상담 내용",
          consultationTypePlaceholder: "상담 내용을 선택해 주세요",
          consultationOptions: [
            "TapForge에 대한 상담",
            "BoltSite에 대한 상담",
            "IoTRealm에 대한 상담",
            "기타"
          ],
          message: "메시지"
        },
        submit: "전송",
        reset: "초기화"
      }
    },
    footer: {
      title: "푸터",
      social: "소셜",
      company: "회사",
      legal: "법적",
      links: {
        home: "홈",
        about: "회사소개",
        products: "제품&인사이트",
        contact: "문의",
        privacy: "개인정보처리방침",
        legal: "법적 고지"
      },
      description: "Cor.inc는 '경쟁이 아닌 공동창조를 통해 미래를 개척하고, 행복한 사회를 실현한다'는 미션을 내걸고, IT 전략 컨설팅 및 관련 제품 개발, 자사 AI 제품 개발 및 판매를 하고 있습니다. '경쟁'보다 '공동창조'를 중시하며, 스타트업의 강점인 '속도감'을 살려 창조성과 혁신성이 넘치는 서비스를 제공하고 있습니다.",
      copyright: "© 2025 Cor.inc"
    },
    features: {
      title: "특징",
      items: [
        {
          id: 'uniqueness-1',
          name: '디지털 기술 통합',
          description: 'Python으로 수집한 정보를 바탕으로 IT 전략을 수립하고, MVP 웹 앱을 개발하여 테스트 마케팅을 수행하는... 이러한 여러 기술과 공정에 걸친 프로젝트를 모두 우리 한 회사에서 커버할 수 있습니다.'
        },
        {
          id: 'uniqueness-2',
          name: '원스톱 서비스',
          description: '기획부터 개발, 테스트 릴리스, 서비스 제공 시작까지 일관되게 우리가 담당합니다. 같은 팀이 담당하므로 인식의 차이가 적고, 더 저렴하고 빠른 개발을 제공합니다.'
        },
        {
          id: 'uniqueness-3',
          name: '고객 우선 개발',
          description: '우리의 개발에서 가장 중시하는 것은 "고객의 해상도"입니다. 세심한 피드백이나 테스트 마케팅, 마일스톤을 통해 고객이 진정으로 원하는 것을 파악하고, Win-Win한 비즈니스 파트너가 될 수 있는 관계를 구축해 나갑니다.'
        },
        {
          id: 'uniqueness-4',
          name: '「최고속 스마트」한 경험',
          description: '우리는 새로운 트렌드와 지식을 항상 예리하게 포착합니다. 모든 이해관계자에게 유익한 솔루션을 빠르게 제안에 반영하여, 지금까지 없던 새로운 경험을 제공합니다.'
        },
        {
          id: 'uniqueness-5',
          name: '새로운 가치관의 창조',
          description: '기존 개념에 얽매이지 않고, 새로운 시각과 아이디어에 진지하게 접근합니다. 스타트업 특유의 「스피드감」을 최대한 활용하여, 막 태어난 가치관에 기술을 통해 목소리를 부여합니다.'
        },
        {
          id: 'uniqueness-6',
          name: '독자적 시각으로 사회과제 해결',
          description: '인류의 진보에 대한 열정은 멈추지 않습니다. 우리는 기술을 활용하여 갭을 메우고, 의미 있는 커뮤니케이션을 촉진하면서, 진보에 따른 사회 문제 해결에 적극적으로 노력하고 있습니다.'
        }
      ]
    },
    header: {
      mobileMenuDescription: "Cor.inc는 \"경쟁이 아닌 공동창조를 통해 미래를 개척하고 행복한 사회를 실현한다\"는 미션을 가지고 IT 전략 컨설팅 및 관련 제품 개발, 자사 AI 제품 개발·판매를 하고 있습니다. \"경쟁\"보다는 \"공동창조\"를 중시하고, 스타트업의 강점인 \"스피드감\"을 살려 창의성과 혁신성이 가득한 서비스를 제공합니다."
    },
    "404": {
      title: "404",
      subtitle: "페이지를 찾을 수 없습니다",
      description: "방문하신 페이지가 존재하지 않습니다. 주소 표시줄의 URL을 확인하고 다시 시도하세요.",
      cta: "홈으로 돌아가기"
    },
    aboutPage: {
      title: "About",
      subtitle: "世界で一番「幸せ」のことを考えている企業であること、そして世界で一番本当の幸せを求めて社会を共創する企業であること。"
    },
    values: {
      title: "우리의 가치관"
    },
    team: {
      title: "우리 팀을 만나보세요"
    },
    linkTypes: {
      LitLink: "LitLink",
      X: "X",
      Zenn: "Zenn",
      Homepage: "홈페이지"
    },
    faq: {
      title: "자주 묻는 질문",
      questions: [
        {
          question: "개발 프로세스는 어떻게 진행되나요? 프로젝트 완료까지의 일반적인 일정은 어떻게 되나요?",
          answer: "개발 프로세스에서 우리 엔지니어는 온라인으로 귀하의 요구사항을 듣고 필요한 시스템과 요구사항을 정의합니다. 초기 미팅 후 일주일 내에 각 제품의 가격을 계산하고, 귀하의 승인 후 견적을 진행합니다. 우리는 어떤 작업도 외주하지 않고 모든 프로젝트를 내부에서 처리하므로 평균 납기 시간보다 약 20% 빠르게 제품을 납품할 수 있습니다. 대규모 프로젝트의 경우 프로젝트와 공감하는 프리랜서 엔지니어를 배정하여 더 빠르고 비용 효율적인 납품이 가능합니다."
        },
        {
          question: "프로젝트 비용은 어떻게 계산되나요? 결제는 어떻게 이루어지나요?",
          answer: "가격은 클라이언트의 요구사항에 따라 달라지므로 초기 미팅 후 견적을 보내드립니다. 같은 업계의 유사한 프로젝트와 비교하여 약 15% 낮은 비용으로 제안하는 경우가 많습니다. 결제 방법에는 은행 송금, Paypal 등이 포함됩니다. 초기 미팅 시 직원에게 선호하는 결제 방법을 알려주시기 바랍니다."
        },
        {
          question: "JavaScript, TypeScript, Python, Go 등을 사용하는 이점은 무엇인가요?",
          answer: "JavaScript는 1995년 Netscape에서 탄생하여 웹 개발의 기반이 되었습니다. TypeScript는 그 슈퍼셋으로서 정적 타입을 추가하여 대규모 프로젝트의 유지보수성을 향상시킵니다. Python은 1991년에 개발된 범용 언어로 간단하고 읽기 쉬운 문법이 특징입니다. AI/머신러닝, 데이터 분석, 웹 개발에 광범위하게 사용되며 풍부한 라이브러리로 개발 효율이 매우 높습니다. Go(Golang)는 2009년 Google이 개발한 경량이고 고속인 언어로 간단한 문법과 동시성 처리(goroutines)가 특징입니다. 클라우드 네이티브 애플리케이션이나 마이크로서비스에 적합하며, 컴파일 속도가 빠르고 메모리 효율이 높아 확장 가능한 서버 개발에 이상적입니다."
        },
        {
          question: "Firebase, Supabase 등 BaaS와 클라우드 서비스를 사용하는 이점은 무엇인가요?",
          answer: "BaaS(Backend as a Service)는 인증, 데이터베이스, 스토리지, 푸시 알림 등의 백엔드 기능을 제공합니다. Firebase는 Google의 서비스로 실시간 데이터베이스와 풍부한 기능을 제공합니다. Supabase는 오픈소스 Firebase 대안으로 PostgreSQL 기반의 실시간 기능과 RESTful API를 제공합니다. 클라우드 서비스는 일반적으로 초기 투자를 낮게 유지하면서 필요에 따라 리소스를 확장할 수 있는 유연성을 제공합니다. AWS, Google Cloud, Azure 등 주요 제공업체는 고가용성, 자동 백업, 보안 기능을 제공합니다. 글로벌 CDN, 로드 밸런싱, 모니터링 도구로 성능과 신뢰성을 향상시키면서 운영 오버헤드를 크게 줄일 수 있습니다. 주요 이점으로는 개발 시간 단축, 운영 비용 절감, 확장성 보장이 있습니다."
        },
        {
          question: "요구사항에 따라 작업을 어느 정도까지 맞춤화할 수 있나요? 변경이 필요한 경우 어떻게 처리하나요?",
          answer: "각 프로젝트의 요구사항을 듣고 맞춤형 솔루션을 만들기 때문에 맞춤화는 사실상 무제한입니다. 하지만 납품을 빠르게 하고 중요한 시스템 오류를 피하기 위해 일반적으로 생산 중 요구사항 변경은 받지 않습니다. 회의 전에 요구사항을 충분히 정리해 주시기 바랍니다."
        },
        {
          question: "개발 후 유지보수와 지원은 어떻게 이루어지나요? 추가 비용이 있나요?",
          answer: "우리의 주요 사업은 개발이므로 주요 맞춤화를 제외하고는 유지보수나 지원을 제공하지 않습니다. 개발 완료 후 유지보수 및 지원을 전문으로 하는 파트너 회사를 소개해 드릴 수 있습니다. 비용에 대해서는 문의해 주시기 바랍니다."
        },
        {
          question: "데이터 보안과 프라이버시를 어떻게 보장하나요?",
          answer: "데이터 보안과 프라이버시를 보장하기 위해 고급 암호화 기술을 사용하고 Firebase와 SupaBase 등 BaaS의 보안 기능을 최대한 활용합니다. 액세스 제어의 경우 각 클라이언트에 대해 전용 계정을 설정하고 최소 필요 권한으로 관리합니다. 우리는 데이터 보호 정책을 엄격히 준수하고 정기적인 보안 감사를 실시하여 개발, 제공, 유지보수 전반에 걸쳐 귀하의 데이터를 보호합니다."
        }
      ]
    },
    calendar: {
      title: "대표 일정",
      description: "대표의 공개 일정입니다. 미팅 요청 등의 경우 참고해 주세요.",
      ariaLabel: "대표 일정 캘린더",
      note: "* 미팅 요청은 아래 문의 양식을 통해 연락해 주세요."
    },
    testimonials: {
      title: "기술 전문성",
      items: [
        {
          name: "JavaScript/TypeScript",
          description: "프론트엔드&백엔드 개발",
          image: "/assets/jsts.avif",
          message: "JavaScript는 1995년 Netscape에서 탄생하여 웹 개발의 기반이 되었습니다. TypeScript는 그 슈퍼셋으로서 정적 타입을 추가하여 대규모 프로젝트의 유지보수성을 향상시킵니다. Node.js와 React와 결합하여 실시간 통신과 UI 구축에 활용되며, 비동기 처리와 풍부한 생태계로 빠르고 인터랙티브한 애플리케이션 개발에 적합합니다."
        },
        {
          name: "Python",
          description: "AI&머신러닝",
          image: "/assets/python.avif",
          message: "Python은 1991년에 개발된 범용 프로그래밍 언어입니다. 간단하고 읽기 쉬운 문법이 특징이며, 머신러닝, AI 개발, 데이터 분석에 널리 사용됩니다. TensorFlow나 PyTorch 같은 라이브러리를 활용하여 복잡한 AI 모델을 빠르게 구축할 수 있으며, 초보자부터 고급 사용자까지 폭넓게 지지받고 있습니다."
        },
        {
          name: "Go",
          description: "백엔드&고성능 시스템",
          image: "/assets/go.avif",
          message: "Go(Golang)는 2009년 Google이 개발한 경량이고 고속인 프로그래밍 언어입니다. 간단한 문법과 동시성 처리(goroutines)가 특징이며, 클라우드 네이티브 애플리케이션이나 마이크로서비스에 적합합니다. 컴파일 속도가 빠르고 메모리 효율이 높아 확장 가능한 서버 개발에 이상적입니다."
        }
      ]
    },
    cta: {
      title: "더 자세한 정보가 필요하신가요?",
      description: "언제든지 문의해 주세요. 더 자세한 정보가 필요하거나 구체적인 질문이 있으시면 우리 팀이 도와드리겠습니다."
    },
    products: {
      heading: {
        title: "제품 및 인사이트",
        description: "우리의 제품, 서비스 및 기술 인사이트에 대한 자세한 정보입니다."
      }
    },
    homeCta: {
      title: "문의",
      description: "질문이나 상담, 견적 요청 등 언제든지 문의해 주세요.",
      button: "문의하기"
    },
    productsTable: {
      title: "사업 목록",
      demoLabel: "데모/저장소",
      mediaTitle: "외부 미디어",
      products: [
        {
          name: 'TapForge',
          description: '한 번의 탭으로 연결되는<br/>차세대 비즈니스 네트워킹',
          demo: 'https://tapforge.pages.dev/ko/',
        },
        {
          name: 'BoltSite',
          description: '초고속 0.3초 로딩<br/>완벽한 SEO 점수',
          demo: 'https://boltsite.pages.dev/ko/',
        },
        {
          name: 'IoTRealm',
          description: '디지털 혁신과<br/>물리적 현실의 다리',
          demo: 'https://iotrealm.pages.dev/ko/',
        },
      ],
      pricing: {
        title: "가격표 (세금 포함)",
        services: [
          {
            name: "TapForge",
            items: [
              { item: "월 사용료", price: "¥500-700/월", note: "NFC 명함 1장 서비스 포함" },
              { item: "2장부터", price: "¥600/장" },
              { item: "100장 이상 일괄 주문", price: "¥500/장" }
            ]
          },
          {
            name: "BoltSite",
            items: [
              { item: "스탠다드 플랜", price: "¥15,000/월" },
              { item: "프로페셔널 플랜", price: "¥25,000/월" },
              { item: "엔터프라이즈", price: "¥50,000+/월" }
            ],
            notes: ["성능 보장 (3개월)", "비즈니스 성과 보장 (6개월)", "연간 계약 가능 (10% 할인)"]
          },
          {
            name: "IoTRealm",
            items: [
              { item: "PoC (개념 증명)", price: "¥100만~500만" },
              { item: "본 개발", price: "¥500만~" },
              { item: "유지보수·운영", price: "¥10만~/월" }
            ]
          }
        ]
      },
      articles: [
        {
          name: 'Note',
          description: '생성 AI 활용 기법과 경영 관점 칼럼 발행',
          icon: '/assets/Note.avif',
          action: 'https://note.com/cor_instrument',
        },
      ],
      youtube: [
        {
          name: 'YouTube',
          description: '테크놀로지와 비즈니스 전략에 관한 동영상 콘텐츠를 배송합니다. AI 활용 사례와 제품 개발의 무대 뒤를 공개하고 있습니다.',
          isFlagged: true,
          icon: '/assets/Youtube.avif',
          action: 'https://www.youtube.com/@Cor.Incorporated',
        },
      ],
      youtubeMessages: {
        apiNotConfigured: 'YouTube API가 설정되지 않았습니다',
        watchDirectly: 'YouTube 채널에서 직접 시청해 주세요',
        loading: '동영상 로딩 중...',
        noVideosFound: '동영상을 찾을 수 없습니다',
        loadFailed: '동영상 로딩에 실패했습니다',
        playbackError: '동영상 재생 중 오류가 발생했습니다',
        channelNotFound: '채널을 찾을 수 없습니다',
        videosNotFound: '동영상을 찾을 수 없습니다'
      },
      buttonTexts: {
        goTo: '이동'
      }
    },
    contactInfo: {
      address: {
        label: "우편 주소",
        value: "810-0001 후쿠오카현 후쿠오카시\n츄오구 텐진 2-3-10\n텐진 파인 크레스트 719호"
      },
      phone: {
        label: "전화번호",
        value: "070-8561-1659"
      },
      chat: {
        label: "이메일",
        value: "AI Cloudia와 채팅"
      }
    },
    valuesData: [
      [
        {
          ref: '01',
          name: '먼저 행동',
          description: '생각만 한다면 누구나 할 수 있다. 정답은 나중 사람이 판단한다고 마음먹고, 정했으면 무조건 최선을 향해 빠르게 행동하는 것.',
        },
        {
          ref: '02',
          name: '항상 자문자답',
          description: '행복의 형태는 항상 변화한다. 진정한 행복을 추구하기 위해서는 항상 "이게 베스트인가?"를 자신에게 물어보고, 사고를 멈추지 않고 계속 움직여야 한다.',
        },
        {
          ref: '03',
          name: '상대도 자신도 행복하게',
          description: '행복한 사람만이 상대를 행복하게 할 수 있다. 무엇을 희생하지 않고 자신도 상대도 win-win가 되는 행동을 항상 생각해낸다.',
        },
      ],
      [
        {
          ref: '04',
          name: '의사표현은 명확하게',
          description: '어중간한 행동은 낭비이며 양쪽 모두에게 이익이 없다. 모든 일을 자신이 확실히 정하고, 전력으로 임한다.',
        },
        {
          ref: '05',
          name: '유연한 서비스',
          description: '조금이라도 많은 이해관계자가 행복해지도록 한다. 그 때문에 일부러 정형 서비스를 두지 않고, 개별 태스크에 맞춰 최적의 서비스를 구축한다. (예) WebAR 명함이나 AI 챗봇을 고객 요구에 맞춰 즉시 커스터마이징',
        },
        {
          ref: '06',
          name: '자신의 운명은 자신이 개척',
          description: '성패에 관계없이 자신의 행동은 자신이 책임진다. 성과도 반성도 모두 자신의 행동의 결과, 웃으며 받아들인다.',
        },
      ],
    ],
    teamData: [
      {
        name: 'Kousuke Terada',
        image: '/assets/k-terada.avif',
        job: 'CEO',
        description: '음악대학 졸업 → 악기 제조업체 영업 → 메가벤처 기업영업 → IT 전환. 이 독특한 배경을 활용해 "기술과 언어의 다리"에 도전합니다.',
        comingSoon: false,
        link: 'https://www.tapforge.org/p/company',
      },
      {
        name: 'Cloudia Sorano',
        image: '/assets/cloudia.avif',
        job: 'AI 대사',
        description: '후쿠오카 방언으로 기술 주제를 공유하는 인하우스 AI. 현재 Zenn과 X에서 51주 연속 Lightning Talks에 도전 중입니다.',
        comingSoon: false,
        link: 'https://x.com/Cloudia_Cor',
        zennLink: 'https://zenn.dev/cloudia',
      },
      {
        name: 'Nagisa Terada',
        image: '/assets/nagi.avif',
        job: '직원',
        description: '미용학교 졸업 후 7년간 살롱에서 근무. 프로그래밍을 배운 후 IT로 전환. 매일 도전을 가능성으로 바꾸기 위해 노력하고 있습니다.',
        comingSoon: false,
        link: 'https://digital-studio-c5abe.web.app/',
      },
    ],
    meta: {
      home: { title: "Cor.inc · 혁신을 통한 협력 선도", description: "Cor.inc는 Python 기반 데이터 분석과 웹 및 모바일 앱 개발에 전문성을 가지고 있으며, 세상을 바꾸고 싶어하는 혁신적인 사람들을 위한 혁신적이고 머신러닝이 강화된 솔루션을 만듭니다." },
      about: { title: "회사소개 · Cor.inc", description: "우리의 역사, 가치, 미션 등에 대해 더 알아보세요. 우리는 같은 가치를 공유하는 사람들의 그룹입니다." },
      contact: { title: "문의 · Cor.inc", description: "우리 팀에 연락하여 우리가 어떻게 도울 수 있는지 더 알아보세요." },
      products: { title: "제품&인사이트 · Cor.inc", description: "우리의 혁신적인 IT 솔루션과 미디어 확산을 보여주는 제품 및 인사이트 페이지를 탐색하세요. 이 페이지는 우리의 제품 포트폴리오, 개발 서비스 및 전략적 인사이트에 대한 자세한 정보를 제공합니다. 최첨단 기술 솔루션을 발견하고, 우리의 혁신적인 접근 방식에 대해 읽고, 우리가 어떻게 귀하의 디지털 존재를 변화시킬 수 있는지 알아보세요. 포괄적인 IT 서비스와 제품 솔루션을 찾는 기업에 이상적입니다." },
      "404": { title: "찾을 수 없음 · Cor.inc", description: "페이지를 찾을 수 없습니다. 주소 표시줄의 URL을 확인하고 다시 시도하세요." },
      privacy: { title: "개인정보처리방침 · Cor.inc", description: "우리의 개인정보처리방침은 수집된 정보와 사용 방법을 이해하는 데 도움이 됩니다." }
    },
    privacy: {
      title: "개인정보처리방침",
      lastUpdate: "최종 업데이트: 2024년 5월 13일",
      intro: "Cor.inc는 고객의 개인정보를 최우선으로 하여 보호에 최선을 다하고 있습니다. 본 개인정보처리방침에서는 웹 분석 도구, Flutter 앱, 머신러닝 솔루션 등 저희 서비스를 이용하실 때 개인정보의 수집, 사용, 보호에 대한 저희의 접근 방식에 대해 자세히 설명합니다. 저희의 노력을 이해하시기 위해 본 정책을 검토해 주시기를 권장합니다.",
      section1: {
        title: "1. 저희가 수집하는 정보",
        description: "저희 서비스를 이용하실 때 다음과 같은 다양한 유형의 개인정보를 수집할 수 있습니다:",
        items: [
          "고객이 제공하는 정보: 계정을 생성하거나 저희 서비스의 특정 기능을 이용할 때 제공하는 성명, 이메일 주소, 연락처, 기타 관련 데이터가 포함될 수 있습니다.",
          "이용 데이터: 고객의 IP 주소, 브라우저 유형, 기기 정보, 방문한 페이지, 저희 서비스와의 상호작용을 포함한 서비스 이용 관련 데이터를 수집합니다.",
          "쿠키 및 유사 기술: 사용자 경험을 향상시키고 이용 패턴을 파악하기 위해 저희 서비스에서는 쿠키 및 유사한 기술을 사용합니다."
        ]
      },
      section2: {
        title: "2. 고객 정보 사용 방법",
        description: "고객의 개인정보를 다음과 같은 목적으로 이용할 수 있습니다:",
        items: [
          "서비스 제공 및 개선: 개인화된 경험을 제공하고 저희 서비스의 기능을 향상시키기 위해 고객 데이터를 사용합니다.",
          "커뮤니케이션: 고객의 이메일 주소 및 연락처 정보는 업데이트, 뉴스레터, 홍보 자료 발송에 사용될 수 있습니다. 이러한 통신을 거부할 수 있는 옵션이 있습니다.",
          "분석: 사용자 행동을 더 잘 이해하고 저희 서비스를 개선하기 위해 집계 및 익명화된 데이터를 분석합니다."
        ]
      },
      contact: {
        title: "문의하기",
        description: "저희 개인정보처리방침에 대한 질문이나 궁금한 점이 있으시면",
        linkText: "문의 양식",
        suffix: "을 통해 연락해 주세요."
      }
    }
  },
  es: {
    nav: { home: "Inicio", about: "Acerca de", products: "Productos&Insights", blog: "Blog", contact: "Contacto" },
    hero: {
      title: "Más rápido que cualquiera, más allá del horizonte.",
      subtitle: "Superando las barreras del idioma y la cultura con IA para crear una sociedad donde las personas se entiendan verdaderamente.",
      cta: "Ver nuestro trabajo y productos"
    },
    services: {
      title: "Servicios",
      items: [
        { step: "01", name: "Consultoría IT y Análisis de Datos", description: "Servicio de apoyo DX que visualiza el estado actual mediante scraping basado en Python y análisis BI, acompañando desde la planificación estratégica hasta la implementación." },
        { step: "02", name: "Desarrollo de Aplicaciones Web y Móviles", description: "Provisión integral de aplicaciones B2B/B2C de alta velocidad y UX rica utilizando frameworks más recientes como Flutter y React." },
        { step: "03", name: "Desarrollo de Soluciones IA", description: "Desarrollo de aplicaciones inteligentes y herramientas de automatización optimizadas para los desafíos del cliente utilizando IA generativa/LLM, reconocimiento de imágenes y procesamiento de voz." }
      ]
    },
    about: {
      title: "Acerca de",
      description: "Cor.inc tiene como misión 'Abrir el futuro a través de la co-creación en lugar de la competencia, y realizar una sociedad feliz', y se dedica a la consultoría estratégica de TI y el desarrollo de productos relacionados, y al desarrollo y venta de productos de IA propios. Valoramos la 'co-creación' más que la 'competencia', y aprovechamos la 'sensación de velocidad' que es una fortaleza de las startups para proporcionar servicios llenos de creatividad e innovación.",
      cta: "Más detalles",
      heading: {
        title: "Acerca de",
        description: "Cor.inc tiene como misión 'Abrir el futuro a través de la co-creación en lugar de la competencia, y realizar una sociedad feliz', y se dedica a la consultoría estratégica de TI y el desarrollo de productos relacionados, y al desarrollo y venta de productos de IA propios. Valoramos la 'co-creación' más que la 'competencia', y aprovechamos la 'sensación de velocidad' que es una fortaleza de las startups para proporcionar servicios llenos de creatividad e innovación."
      }
    },
    mission: {
      title: "Nuestra misión",
      subtitle: "Lo que una vez perseguí con la trompeta - comunicación más allá de las palabras - ahora a través de la tecnología.",
      paragraphs: [
        "Nuestro fundador tiene TEA y conoce el dolor de 'no ser comprendido'.",
        "Por eso nos tomamos en serio la realización de una comunicación sin malentendidos.",
        "A través de intercambios de tarjetas de presentación, sitios web y conversaciones mediadas por IA. Pequeños momentos de 'ah, lo entendieron' en la vida cotidiana.",
        "Cuando se acumulan, todos pueden transmitir adecuadamente y ser comprendidos por su valor.",
        "Usamos la tecnología para eliminar las 'barreras del lenguaje' entre las personas, creando un mundo donde todos puedan brillar como ellos mismos."
      ],
      stats: [
        { name: "Desde la fundación", value: "2 años" },
        { name: "Idiomas disponibles", value: "10" },
        { name: "Proyectos", value: "15" },
        { name: "Servicios ofrecidos", value: "Desarrollo de Apps & Estrategia IT/IA" }
      ]
    },
    founderStory: {
      title: "Historia del Fundador",
      subtitle: "¿Por qué un ex músico dirige un negocio no relacionado con la música?",
      paragraphs: [
        "Desde pequeño, era 'el niño que no sabía leer el ambiente'. Con ASD, siempre he sentido un muro entre yo y los demás.",
        "En mi segundo año de secundaria, tocando un solo de trompeta en un auditorio lleno de 2,000 personas, experimenté por primera vez la emoción de 'comunicación más allá de las palabras'. Toda la conciencia del lugar se concentró en mí, y mi alma tembló con una sensación de unidad que no necesitaba palabras.",
        "Pero en la industria musical, nunca volví a sentir esa emoción. Conexiones, jerarquía, leer entre líneas. La expresión se degradó a mero 'trabajo', y enfermé.",
        "Durante la pandemia, dejé la música y trabajé en ventas en Recruit. Allí, enfrenté 'las limitaciones de las herramientas existentes' y 'la frustración de que las palabras no llegaran a la gente'.",
        "Luego descubrí la tecnología. El código no traiciona. La IA no se vuelve emocional. Y sobre todo, pude presenciar cómo lo que creé resolvió los problemas de alguien y enriqueció sus vidas.",
        "Esa emoción de la secundaria, ahora en la vida cotidiana. En intercambios de tarjetas de presentación, en sitios web, a través de comunicación mediada por IA. Acumulando pequeños momentos de 'ah, llegó'.",
        "Ese es el origen de Cor.inc."
      ]
    },
    productBackstory: {
      title: "¿Por Qué Estos Servicios?",
      products: [
        {
          name: "TapForge",
          subtitle: "Revolución de Comunicación que Comienza desde el 'Encuentro'",
          story: "Durante mi tiempo como vendedor en Recruit, experimenté repetidamente situaciones donde las tarjetas de presentación se acumulaban después del intercambio, haciendo imposible recordar quién era quién. El 'ritual' de intercambiar tarjetas de presentación debería ser una declaración de intención de 'construir una relación', pero en realidad, solo se convierte en un registro formal de 'intercambiamos información de contacto'. Sentí una comunicación errónea significativa aquí. TapForge es un producto diseñado para transformar el intercambio de tarjetas de presentación en 'encuentros reales'. Con solo un toque, puede acceder instantáneamente a toda la información: perfiles, redes sociales, portafolios, calendarios de citas. En lugar de explicar verbalmente 'Esto es lo que hago', puede transmitir todo sobre usted de manera visual e intuitiva con un solo toque. Este es el primer paso hacia la 'comunicación más allá de las palabras'."
        },
        {
          name: "BoltSite",
          subtitle: "Dando Forma a los 'Sentimientos' de las Empresas",
          story: "Cuando estaba en ventas en Recruit, vi muchos sitios web de empresas, pero la mayoría no lograba transmitir los 'sentimientos' o la 'pasión' de esas empresas. Los dueños de negocios tienen pensamientos apasionados. Se enorgullecen de sus productos y servicios. Pero esto no se refleja en absoluto en sus sitios web, porque solo pueden expresarse dentro del marco de las herramientas existentes. BoltSite es un servicio de creación de sitios web ultrarrápido que utiliza el framework Astro, pero lo que realmente valoro es sacar 'la esencia de esa empresa'. En las reuniones de creación de sitios web, escucho atentamente a los dueños de negocios. '¿Por qué comenzó este negocio?' '¿Qué sentimientos tiene al crear productos?' Luego, interpreto los sentimientos no expresados detrás de esas palabras y los traduzco en diseño y copia. El resultado no es solo un 'sitio de información corporativa', sino un sitio web donde puede sentir la 'personalidad' de esa empresa."
        },
        {
          name: "IoTRealm",
          subtitle: "Desarrollo por Contrato para Dar Forma a los Sentimientos",
          story: "Después de construir confianza a través de tarjetas de presentación y sitios web, muchos dueños de negocios dicen: 'En realidad, he estado pensando que sería bueno si pudiéramos hacer esto...' A veces es vago, a veces grandioso, a veces poco claro si es técnicamente posible. Pero detrás, definitivamente hay un deseo puro: 'Sería genial si esto sucediera'. IoTRealm es un servicio de desarrollo por contrato para dar forma a tales 'sentimientos'. Por ejemplo, un representante de una startup inmobiliaria y de construcción propuso 'un producto que genera automáticamente planos simplemente dándole a la IA un mapa del sitio', ganó un premio, pero estaba luchando porque no sabía cómo realizarlo técnicamente. Creé un prototipo en dos semanas: una aplicación que usa IA de reconocimiento de imágenes YOLO para determinar automáticamente áreas edificables a partir de mapas del sitio y generar planos simples. Esto también es 'comunicación más allá de las palabras'. Al convertir regulaciones y cálculos complejos en datos visuales, podemos derribar la barrera del conocimiento entre expertos y profanos y compartir información sin malentendidos."
        }
      ]
    },
    contact: {
      title: "¡Consulte con confianza!",
      description1: "Después de confirmar el contenido de la consulta, nos pondremos en contacto con usted dentro de 3 días hábiles. Por favor, espere un momento.",
      description2: "Si no recibe respuesta dentro del período anterior, es posible que haya un problema de envío. Le pedimos que se ponga en contacto con nosotros nuevamente.",
      heading: {
        title: "Contacto",
        description: "Para preguntas, consultas, solicitudes de presupuesto, etc., no dude en contactarnos."
      },
      form: {
        title: "¡Consulte con confianza!",
        description1: "Después de confirmar el contenido de la consulta, nos pondremos en contacto con usted dentro de 3 días hábiles. Por favor, espere un momento.",
        description2: "Si no recibe respuesta dentro del período anterior, es posible que haya un problema de envío. Le pedimos que se ponga en contacto con nosotros nuevamente.",
        fields: {
          name: "Nombre",
          email: "Dirección de correo electrónico",
          consultationType: "Tipo de consulta",
          consultationTypePlaceholder: "Seleccione el tipo de consulta",
          consultationOptions: [
            "Consulta sobre TapForge",
            "Consulta sobre BoltSite",
            "Consulta sobre IoTRealm",
            "Otros"
          ],
          message: "Mensaje"
        },
        submit: "Enviar",
        reset: "Restablecer"
      }
    },
    footer: {
      title: "Pie de página",
      social: "Social",
      company: "Empresa",
      legal: "Legal",
      links: {
        home: "Inicio",
        about: "Acerca de",
        products: "Productos&Insights",
        contact: "Contacto",
        privacy: "Privacidad",
        legal: "Aviso Legal"
      },
      description: "Cor.inc tiene como misión 'Abrir el futuro a través de la co-creación en lugar de la competencia, y realizar una sociedad feliz', y se dedica a la consultoría estratégica de TI y el desarrollo de productos relacionados, y al desarrollo y venta de productos de IA propios. Valoramos la 'co-creación' más que la 'competencia', y aprovechamos la 'sensación de velocidad' que es una fortaleza de las startups para proporcionar servicios llenos de creatividad e innovación.",
      copyright: "© 2025 Cor.inc"
    },
    features: {
      title: "Características",
      items: [
        {
          id: 'uniqueness-1',
          name: 'Integración de tecnologías digitales',
          description: 'Formulamos estrategias de TI basadas en información recopilada con Python, desarrollamos aplicaciones web MVP para realizar marketing de prueba... Podemos cubrir proyectos que abarcan múltiples tecnologías y procesos como este con una sola empresa.'
        },
        {
          id: 'uniqueness-2',
          name: 'Servicio integral',
          description: 'Nos encargamos de todo desde la planificación hasta el desarrollo, lanzamiento de prueba y inicio de prestación de servicios. Como el mismo equipo se encarga, es menos probable que haya discrepancias en la comprensión, y proporcionamos desarrollo más rápido y de menor costo.'
        },
        {
          id: 'uniqueness-3',
          name: 'Desarrollo centrado en el cliente',
          description: 'Lo que más valoramos en nuestro desarrollo es la "resolución del cliente". A través de retroalimentación detallada, marketing de prueba y hitos, identificamos lo que el cliente realmente necesita y construimos una relación que puede ser un socio comercial Win-Win.'
        },
        {
          id: 'uniqueness-4',
          name: 'Experiencia 「ultra rápida e inteligente」',
          description: 'Capturamos agudamente nuevas tendencias y conocimientos. Reflejamos rápidamente soluciones beneficiosas en nuestras propuestas, proporcionando experiencias nuevas nunca antes vistas.'
        },
        {
          id: 'uniqueness-5',
          name: 'Creación de nuevos valores',
          description: 'Sin estar limitados por conceptos tradicionales, nos enfrentamos seriamente a nuevas perspectivas e ideas. Aprovechamos al máximo el \"sentido de velocidad\" característico de las startups para dar voz a valores recién nacidos a través de la tecnología.'
        },
        {
          id: 'uniqueness-6',
          name: 'Resolución de desafíos sociales desde una perspectiva única',
          description: 'La pasión por el progreso humano no se detiene. Utilizamos la tecnología para llenar brechas, promover comunicación significativa y abordar activamente la resolución de problemas sociales que acompañan al progreso.'
        }
      ]
    },
    header: {
      mobileMenuDescription: "Cor.inc tiene como misión \"pionear el futuro a través de la co-creación en lugar de la competencia, realizando una sociedad feliz\". Nos dedicamos a la consultoría estratégica de TI, desarrollo de productos relacionados y desarrollo y venta de productos de IA propios. Valoramos la \"co-creación\" sobre la \"competencia\" y aprovechamos la fortaleza de las startups de \"sentido de velocidad\" para proporcionar servicios llenos de creatividad e innovación."
    },
    "404": {
      title: "404",
      subtitle: "Página no encontrada",
      description: "La página que visitaste no existe. Por favor, verifica la URL en la barra de direcciones e inténtalo de nuevo.",
      cta: "Volver al inicio"
    },
    aboutPage: {
      title: "About",
      subtitle: "世界で一番「幸せ」のことを考えている企業であること、そして世界で一番本当の幸せを求めて社会を共創する企業であること。"
    },
    values: {
      title: "Nuestros Valores"
    },
    team: {
      title: "Conoce a nuestro equipo"
    },
    linkTypes: {
      LitLink: "LitLink",
      X: "X",
      Zenn: "Zenn",
      Homepage: "Página web"
    },
    faq: {
      title: "Preguntas Frecuentes",
      questions: [
        {
          question: "¿Cómo se lleva a cabo el proceso de desarrollo? ¿Cuál es el cronograma típico hasta la finalización del proyecto?",
          answer: "En el proceso de desarrollo, nuestros ingenieros escucharán sus requisitos en línea y definirán los sistemas y requisitos necesarios. Dentro de una semana de la reunión inicial, calcularemos el precio para cada producto, y después de su aprobación, procederemos con la cotización. Como no subcontratamos ningún trabajo y manejamos todos los proyectos internamente, podemos entregar productos aproximadamente 20% más rápido que el tiempo de entrega promedio. Para proyectos grandes, podemos asignar ingenieros freelance que resuenen con el proyecto, permitiendo una entrega más rápida y rentable."
        },
        {
          question: "¿Cómo se calculan los costos del proyecto? ¿Cómo funcionan los pagos?",
          answer: "Los precios varían dependiendo de los requisitos del cliente, por lo que le enviaremos una cotización después de la reunión inicial. Comparado con proyectos similares en la misma industria, a menudo ofrecemos propuestas a aproximadamente 15% menor costo. Los métodos de pago incluyen transferencia bancaria, Paypal y más. Por favor, informe a nuestro personal sobre su método de pago preferido durante la reunión inicial."
        },
        {
          question: "¿Cuáles son los beneficios de usar JavaScript, TypeScript, Python, Go y otros lenguajes?",
          answer: "JavaScript nació en 1995 en Netscape y se ha convertido en la base del desarrollo web. TypeScript, como su superconjunto, añade tipado estático para mejorar la mantenibilidad en proyectos a gran escala. Python es un lenguaje de propósito general desarrollado en 1991, conocido por su sintaxis simple y legible. Cubre IA/aprendizaje automático, análisis de datos y desarrollo web con bibliotecas ricas, lo que hace que sea extremadamente eficiente para el desarrollo. Go (Golang) es un lenguaje ligero y de alta velocidad desarrollado por Google en 2009, con sintaxis simple y procesamiento concurrente (goroutines). Es ideal para aplicaciones nativas de la nube y microservicios, con velocidad de compilación rápida y alta eficiencia de memoria, lo que lo hace óptimo para el desarrollo de servidores escalables."
        },
        {
          question: "¿Cuáles son las ventajas de usar BaaS como Firebase y Supabase, y servicios en la nube en general?",
          answer: "BaaS (Backend as a Service) proporciona funciones backend como autenticación, bases de datos, almacenamiento y notificaciones push. Firebase es el servicio de Google con bases de datos en tiempo real y funcionalidad rica. Supabase es una alternativa de código abierto a Firebase que ofrece funciones en tiempo real basadas en PostgreSQL y APIs RESTful. Los servicios en la nube en general ofrecen flexibilidad para escalar recursos según sea necesario mientras se mantiene baja la inversión inicial. Los principales proveedores como AWS, Google Cloud y Azure proporcionan alta disponibilidad, copias de seguridad automáticas y funciones de seguridad. El CDN global, el equilibrio de carga y las herramientas de monitoreo mejoran el rendimiento y la confiabilidad mientras reducen significativamente la sobrecarga operativa. Los principales beneficios incluyen tiempo de desarrollo reducido, costos operativos más bajos y escalabilidad garantizada."
        },
        {
          question: "¿Cuánto se pueden personalizar las tareas según los requisitos? ¿Cómo se manejan los cambios si es necesario?",
          answer: "Escuchamos los requisitos de cada proyecto y creamos soluciones personalizadas, por lo que la personalización es prácticamente ilimitada. Sin embargo, para acelerar la entrega y evitar errores críticos del sistema, generalmente no aceptamos cambios en los requisitos durante la producción. Por favor, resuma sus requisitos a fondo antes de la reunión."
        },
        {
          question: "¿Cómo se maneja el mantenimiento y el soporte después del desarrollo? ¿Hay costos adicionales?",
          answer: "Como nuestro negocio principal es el desarrollo, no proporcionamos mantenimiento o soporte excepto para personalizaciones importantes. Después de que se complete el desarrollo, podemos presentarle a nuestras empresas asociadas especializadas en mantenimiento y soporte. Por favor, consúltenos sobre los costos."
        },
        {
          question: "¿Cómo se garantiza la seguridad y privacidad de los datos?",
          answer: "Para garantizar la seguridad y privacidad de los datos, utilizamos tecnologías de cifrado avanzadas y maximizamos las funciones de seguridad de BaaS como Firebase y SupaBase. Para el control de acceso, configuramos cuentas dedicadas para cada cliente y las administramos con los privilegios mínimos necesarios. Cumplimos estrictamente con las políticas de protección de datos y realizamos auditorías de seguridad periódicas para proteger sus datos durante todo el desarrollo, la entrega y el mantenimiento."
        }
      ]
    },
    calendar: {
      title: "Agenda del CEO",
      description: "Esta es la agenda pública del CEO. Si desea programar una reunión, consulte los horarios disponibles y contáctenos.",
      ariaLabel: "Calendario de agenda del CEO",
      note: "* Para solicitudes de reunión, contáctenos a través del formulario de contacto a continuación."
    },
    testimonials: {
      title: "Experiencia Técnica",
      items: [
        {
          name: "JavaScript/TypeScript",
          description: "Desarrollo Frontend & Backend",
          image: "/assets/jsts.avif",
          message: "JavaScript nació en 1995 en Netscape y se ha convertido en la base del desarrollo web. TypeScript, como su superconjunto, añade tipado estático para mejorar la mantenibilidad en proyectos a gran escala. Se usa en combinación con Node.js y React para comunicación en tiempo real y construcción de UI. Con procesamiento asíncrono y un ecosistema rico, es ideal para el desarrollo rápido e interactivo de aplicaciones."
        },
        {
          name: "Python",
          description: "IA & Aprendizaje Automático",
          image: "/assets/python.avif",
          message: "Python es un lenguaje de programación de propósito general desarrollado en 1991. Su característica es una sintaxis simple y legible, ampliamente utilizado en aprendizaje automático, desarrollo de IA y análisis de datos. Al aprovechar bibliotecas como TensorFlow y PyTorch, se pueden construir modelos de IA complejos rápidamente, y es ampliamente apoyado desde principiantes hasta usuarios avanzados."
        },
        {
          name: "Go",
          description: "Backend & Sistemas de Alto Rendimiento",
          image: "/assets/go.avif",
          message: "Go (Golang) es un lenguaje de programación ligero y de alta velocidad desarrollado por Google en 2009. Su característica es una sintaxis simple y procesamiento concurrente (goroutines), adecuado para aplicaciones nativas de la nube y microservicios. Tiene una velocidad de compilación rápida y alta eficiencia de memoria, lo que lo hace ideal para el desarrollo de servidores escalables."
        }
      ]
    },
    cta: {
      title: "¿Necesita información más detallada?",
      description: "No dude en contactarnos. Si necesita información más detallada o tiene preguntas específicas, nuestro equipo le ayudará."
    },
    products: {
      heading: {
        title: "Productos e Insights",
        description: "Información detallada sobre nuestros productos, servicios e insights técnicos."
      }
    },
    homeCta: {
      title: "Contáctanos",
      description: "No dude en contactarnos para cualquier pregunta, consulta o solicitud de cotización.",
      button: "Contáctanos"
    },
    productsTable: {
      title: "Lista de negocios",
      demoLabel: "Demo/Repositorio",
      mediaTitle: "Medios externos",
      products: [
        {
          name: 'TapForge',
          description: 'Conecta con un solo toque -<br/>Redes de negocios de próxima generación',
          demo: 'https://tapforge.pages.dev/es/',
        },
        {
          name: 'BoltSite',
          description: 'Carga ultra rápida de 0.3s con<br/>puntuaciones SEO perfectas',
          demo: 'https://boltsite.pages.dev/es/',
        },
        {
          name: 'IoTRealm',
          description: 'Tendiendo puentes entre la innovación digital<br/>y la realidad física',
          demo: 'https://iotrealm.pages.dev/es/',
        },
      ],
      pricing: {
        title: "Lista de precios (impuestos incluidos)",
        services: [
          {
            name: "TapForge",
            items: [
              { item: "Tarifa de uso mensual", price: "¥500-700/mes", note: "1 tarjeta de presentación NFC incluida" },
              { item: "Desde la 2da tarjeta", price: "¥600/tarjeta" },
              { item: "Pedido masivo de 100+ tarjetas", price: "¥500/tarjeta" }
            ]
          },
          {
            name: "BoltSite",
            items: [
              { item: "Plan Estándar", price: "¥15,000/mes" },
              { item: "Plan Profesional", price: "¥25,000/mes" },
              { item: "Empresarial", price: "¥50,000+/mes" }
            ],
            notes: ["Garantía de rendimiento (3 meses)", "Garantía de resultados empresariales (6 meses)", "Contrato anual disponible (10% descuento)"]
          },
          {
            name: "IoTRealm",
            items: [
              { item: "PoC (Prueba de Concepto)", price: "¥100万~500万" },
              { item: "Desarrollo completo", price: "¥500万~" },
              { item: "Mantenimiento y operación", price: "¥10万~/mes" }
            ]
          }
        ]
      },
      articles: [
        {
          name: 'Note',
          description: 'Publicando técnicas de utilización de IA generativa y columnas de perspectiva empresarial',
          icon: '/assets/Note.avif',
          action: 'https://note.com/cor_instrument',
        },
      ],
      youtube: [
        {
          name: 'YouTube',
          description: 'Distribuimos contenido de video sobre tecnología y estrategia empresarial. Publicamos casos de uso de IA y detrás de escena del desarrollo de productos.',
          isFlagged: true,
          icon: '/assets/Youtube.avif',
          action: 'https://www.youtube.com/@Cor.Incorporated',
        },
      ],
      youtubeMessages: {
        apiNotConfigured: 'YouTube API no está configurado',
        watchDirectly: 'Por favor, vea directamente en el canal de YouTube',
        loading: 'Cargando video...',
        noVideosFound: 'No se encontraron videos',
        loadFailed: 'Error al cargar el video',
        playbackError: 'Error en la reproducción del video',
        channelNotFound: 'Canal no encontrado',
        videosNotFound: 'No se encontraron videos'
      },
      buttonTexts: {
        goTo: 'Ir'
      }
    },
    contactInfo: {
      address: {
        label: "Dirección postal",
        value: "810-0001 Prefectura de Fukuoka, Ciudad de Fukuoka\nChuo-ku Tenjin 2-3-10\nTenjin Pine Crest 719"
      },
      phone: {
        label: "Número de teléfono",
        value: "070-8561-1659"
      },
      chat: {
        label: "Correo electrónico",
        value: "Chatea con AI Cloudia"
      }
    },
    valuesData: [
      [
        {
          ref: '01',
          name: 'Primero actuar',
          description: 'Cualquiera puede solo pensar. Acepta que la respuesta correcta será juzgada por las personas futuras, y una vez decidido, actúa rápidamente hacia el mejor resultado.',
        },
        {
          ref: '02',
          name: 'Siempre auto-reflexionar',
          description: 'La forma de la felicidad está constantemente cambiando. Para perseguir la verdadera felicidad, debemos siempre preguntarnos "¿Es esto lo mejor?" y continuar moviéndonos sin detener nuestro pensamiento.',
        },
        {
          ref: '03',
          name: 'Hacer felices tanto a otros como a uno mismo',
          description: 'Solo las personas felices pueden hacer felices a otros. Siempre piensa en acciones que creen situaciones ganar-ganar tanto para ti como para otros sin sacrificar nada.',
        },
      ],
      [
        {
          ref: '04',
          name: 'Expresar intenciones claramente',
          description: 'Las acciones indecisas son desperdiciadas y no benefician a nadie. Toma decisiones firmes por ti mismo y comprométete completamente con todo.',
        },
        {
          ref: '05',
          name: 'Servicios flexibles',
          description: 'Ayuda a tantos interesados como sea posible a ser felices. Para este propósito, deliberadamente evitamos servicios estandarizados y construimos servicios óptimos adaptados a tareas individuales. (Ejemplo) Personalizar instantáneamente tarjetas de presentación WebAR y chatbots de IA según los requisitos del cliente',
        },
        {
          ref: '06',
          name: 'Forjar tu propio destino',
          description: 'Independientemente del éxito o fracaso, tus propias acciones son tu responsabilidad. Los resultados y la reflexión son el resultado de tus propias acciones, acéptalo con una sonrisa.',
        },
      ],
    ],
    teamData: [
      {
        name: 'Kousuke Terada',
        image: '/assets/k-terada.avif',
        job: 'CEO',
        description: 'Graduado de universidad de música → Ventas en fabricante de instrumentos → Ventas corporativas en mega-venture → Transición a IT. Aprovechando este trasfondo único para desafiar "tender puentes entre tecnología y lenguaje".',
        comingSoon: false,
        link: 'https://www.tapforge.org/p/company',
      },
      {
        name: 'Cloudia Sorano',
        image: '/assets/cloudia.avif',
        job: 'Embajadora de IA',
        description: 'IA interna que comparte temas técnicos en dialecto de Fukuoka. Actualmente desafiando 51 semanas consecutivas de Lightning Talks en Zenn y X.',
        comingSoon: false,
        link: 'https://x.com/Cloudia_Cor',
        zennLink: 'https://zenn.dev/cloudia',
      },
      {
        name: 'Nagisa Terada',
        image: '/assets/nagi.avif',
        job: 'Personal',
        description: 'Después de graduarse de la escuela de belleza, trabajó en un salón durante 7 años. Transición a IT después de aprender programación. Esforzándose diariamente para convertir desafíos en posibilidades.',
        comingSoon: false,
        link: 'https://digital-studio-c5abe.web.app/',
      },
    ],
    meta: {
      home: { title: "Cor.inc · Liderando la Colaboración a través de la Innovación", description: "Cor.inc se especializa en análisis de datos basado en Python y desarrollo de aplicaciones web y móviles, creando soluciones innovadoras y mejoradas con aprendizaje automático para personas innovadoras que quieren cambiar el mundo." },
      about: { title: "Acerca de · Cor.inc", description: "Conoce más sobre nuestra historia, valores, misión y más. Somos un grupo de personas que comparten los mismos valores." },
      contact: { title: "Contacto · Cor.inc", description: "Contacta con nuestro equipo para aprender más sobre cómo podemos ayudarte." },
      products: { title: "Productos&Insights · Cor.inc", description: "Explora nuestra página de productos e insights que muestra nuestras soluciones IT innovadoras y alcance mediático. Esta página ofrece información detallada sobre nuestro portafolio de productos, servicios de desarrollo e insights estratégicos. Descubre nuestras soluciones tecnológicas de vanguardia, lee sobre nuestros enfoques innovadores y aprende cómo podemos ayudar a transformar tu presencia digital. Ideal para empresas que buscan servicios IT integrales y soluciones de productos." },
      "404": { title: "No encontrado · Cor.inc", description: "Página no encontrada. Por favor, verifica la URL en la barra de direcciones e inténtalo de nuevo." },
      privacy: { title: "Política de privacidad · Cor.inc", description: "Nuestra política de privacidad te ayudará a entender qué información se recopila y cómo se utiliza." }
    },
    privacy: {
      title: "Política de privacidad",
      lastUpdate: "Última actualización: 13 de mayo de 2024",
      intro: "En Cor.inc, priorizamos su privacidad y nos comprometemos a protegerla. Esta política de privacidad detalla nuestro enfoque para recopilar, usar y proteger información personal cuando utiliza nuestros servicios, incluyendo herramientas de análisis web, aplicaciones Flutter y soluciones de aprendizaje automático. Recomendamos revisar esta política para entender nuestro compromiso.",
      section1: {
        title: "1. Información que recopilamos",
        description: "Cuando utiliza nuestros servicios, podemos recopilar varios tipos de información personal, incluyendo:",
        items: [
          "Información que usted proporciona: Esto puede incluir su nombre, dirección de correo electrónico, información de contacto y otros datos relevantes cuando crea una cuenta o utiliza funciones específicas de nuestros servicios.",
          "Datos de uso: Recopilamos datos relacionados con su uso de nuestros servicios, incluyendo su dirección IP, tipo de navegador, información del dispositivo, páginas visitadas e interacciones con nuestros servicios.",
          "Cookies y tecnologías similares: Para mejorar la experiencia del usuario y entender los patrones de uso, nuestros servicios utilizan cookies y tecnologías similares."
        ]
      },
      section2: {
        title: "2. Cómo utilizamos su información",
        description: "Podemos utilizar su información personal para los siguientes propósitos:",
        items: [
          "Provisión y mejora de servicios: Utilizamos sus datos para proporcionar experiencias personalizadas y mejorar las funciones de nuestros servicios.",
          "Comunicación: Su dirección de correo electrónico e información de contacto pueden utilizarse para enviar actualizaciones, boletines y materiales promocionales. Tiene la opción de optar por no recibir estas comunicaciones.",
          "Análisis: Para entender mejor el comportamiento del usuario y mejorar nuestros servicios, analizamos datos agregados y anonimizados."
        ]
      },
      contact: {
        title: "Contáctanos",
        description: "Si tiene preguntas o inquietudes sobre nuestra política de privacidad, póngase en contacto con nosotros a través de nuestro",
        linkText: "formulario de contacto",
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
  if (/^\/zh(\/|$)/.test(pathname)) {
    return 'zh';
  }
  if (/^\/ko(\/|$)/.test(pathname)) {
    return 'ko';
  }
  if (/^\/es(\/|$)/.test(pathname)) {
    return 'es';
  }
  return 'ja';
}

export function getOtherLocale(currentLocale: Locale): Locale {
  const localeOrder: Locale[] = ['ja', 'en', 'zh', 'ko', 'es'];
  const currentIndex = localeOrder.indexOf(currentLocale);
  const nextIndex = (currentIndex + 1) % localeOrder.length;
  return localeOrder[nextIndex];
}

export function getLocalizedUrl(path: string, locale: Locale): string {
  if (locale === 'ja') return path;
  const localePrefix = `/${locale}`;
  return path === '/' ? localePrefix : `${localePrefix}${path}`;
}
