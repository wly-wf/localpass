# LocalPass - 本地密码管理器

一个完全离线、本地加密存储的密码管理器，支持 PWA 安装，可在电脑和手机上使用。

## 功能特性

- 🔐 **本地加密存储** - 所有数据使用 AES-256-GCM 加密
- 📱 **PWA 支持** - 可安装到手机桌面，离线使用
- 🔑 **主密码保护** -  argon2id/PBKDF2 密钥派生
- 💾 **IndexedDB 存储** - 浏览器本地存储
- 📤 **多种导出格式** - 支持 TXT、PDF、JSON
- 🌙 **暗色模式** - 保护眼睛
- 🌍 **多语言** - 支持中文和英文
- ⏰ **自动锁定** - 无操作自动上锁

## 技术栈

- TypeScript + React + Vite
- Tailwind CSS
- IndexedDB (idb 库)
- Web Crypto API
- jsPDF (PDF 生成)

## 安装与运行

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

### PWA 手机安装

1. 开发模式运行 `npm run dev`，确保手机和电脑在同一局域网
2. 手机浏览器访问电脑 IP 地址（如 http://192.168.1.100:5173）
3. 点击浏览器菜单，选择"添加到主屏幕"或"安装 App"

或者使用静态服务器：

```bash
# 构建后
npx serve dist
```

## 使用流程

1. **首次启动** - 设置主密码（至少 8 位）
2. **添加密码** - 点击右下角 + 按钮
3. **查看/复制** - 点击复制图标复制账号或密码
4. **搜索** - 在顶部搜索框输入关键词
5. **导出** - 点击右上角导出图标

## 数据安全

### 加密方案

- **密钥派生**: PBKDF2-SHA256 (WebCrypto 原生支持)
  - 迭代次数: 300,000
  - Salt: 16 字节随机
- **数据加密**: AES-256-GCM
  - IV: 12 字节随机
  - Auth Tag: 16 字节

### 存储结构

```typescript
interface EncryptedData {
  version: number      // 数据版本号
  salt: string         // Base64 编码的 salt
  iv: string          // Base64 编码的 IV
  ciphertext: string  // Base64 编码的密文
  authTag: string     // Base64 编码的认证标签
}
```

### 威胁模型

**保护范围:**
- 本地存储的密码数据
- 剪贴板中的临时数据

**不保护范围（无法防止）:**
- 设备被恶意软件完全控制
- 暴力破解弱主密码
- 社会工程学攻击（泄露主密码）
- 物理设备丢失后的离线攻击（可通过强主密码缓解）

### 安全建议

1. **主密码强度**: 使用 16 位以上随机密码
2. **自动锁定**: 建议设置 5-15 分钟自动锁定
3. **剪贴板清理**: 建议设置 10-30 秒自动清空
4. **导出风险**: 导出文件包含明文密码，务必妥善保管
5. **设备安全**: 确保设备本身无恶意软件

## 项目结构

```
localpass/
├── public/
│   └── favicon.svg
├── src/
│   ├── crypto/
│   │   └── crypto.ts      # 加密模块
│   ├── i18n/
│   │   └── locales.ts     # 多语言
│   ├── pages/
│   │   ├── LockScreen.tsx
│   │   ├── MainScreen.tsx
│   │   ├── EntryEditor.tsx
│   │   ├── ExportPanel.tsx
│   │   └── SettingsPanel.tsx
│   ├── storage/
│   │   └── storage.ts     # IndexedDB 操作
│   ├── App.tsx            # 主应用
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 许可证

MIT
