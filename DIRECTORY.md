localpass/
├── public/                          # 静态资源
│   └── favicon.svg                 # 应用图标
├── src/                            # 源代码
│   ├── crypto/                     # 加密模块
│   │   └── crypto.ts              # 加密/解密/密钥派生
│   ├── i18n/                       # 国际化
│   │   └── locales.ts             # 中英文翻译
│   ├── pages/                      # 页面组件
│   │   ├── LockScreen.tsx         # 解锁/设置主密码页
│   │   ├── MainScreen.tsx         # 密码列表页
│   │   ├── EntryEditor.tsx        # 编辑/添加密码弹窗
│   │   ├── ExportPanel.tsx        # 导入导出面板
│   │   └── SettingsPanel.tsx      # 设置面板
│   ├── storage/                    # 存储模块
│   │   └── storage.ts             # IndexedDB CRUD
│   ├── App.tsx                     # 主应用/状态管理
│   ├── main.tsx                    # 入口文件
│   └── index.css                   # 全局样式
├── index.html                      # HTML 模板
├── package.json                    # 依赖配置
├── tsconfig.json                   # TypeScript 配置
├── vite.config.ts                  # Vite/PWA 配置
├── tailwind.config.js              # Tailwind CSS 配置
├── postcss.config.js               # PostCSS 配置
├── README.md                       # 使用说明
└── SECURITY.md                     # 安全说明
