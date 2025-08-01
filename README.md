# 不如 Not As Good As

[English](./README_EN.md) | 中文

一个以“仪式感”帮助情绪告别与珍藏的轻应用。  
技术栈：React + TypeScript + Vite，包管理器：pnpm。

本项目实现两大核心功能：
1) 回忆漂流瓶 Memories in a Bottle  
- 创建回忆（文字/图片/录音/日期）  
- 封存 Seal：设定未来解锁日期，解锁前不可见  
- 漂流 Let Go：优雅动画后永久删除、不可找回

2) 重返初遇 The First Encounter  
- 独立“初遇”故事线页面，记录时间/地点/天气/对话/心情等  
- 一旦锁定即进入只读模式，确保初始美好不被后续情绪污染

---

## 快速开始

要求：Node 18+，pnpm 8+

安装依赖：
```bash
pnpm install
```

开发：
```bash
pnpm dev
```

构建：
```bash
pnpm build
```

预览：
```bash
pnpm preview
```

Lint：
```bash
pnpm lint
```

---

## 路由与页面结构

计划中的路由：
- `/` 仪式感入口页（引导进入“回忆漂流瓶”“重返初遇”）
- `/memories` 回忆列表页（含创建入口与筛选）
- `/memories/new` 创建回忆页
- `/memories/:id` 回忆详情页  
  - 封存未到期：仅显示封存卡与解锁时间  
  - 到期自动解封：显示内容
- `/first-encounter` 初遇页  
  - 未创建：创建表单  
  - 未锁定：可编辑  
  - 已锁定：只读展示
- `*` 404 兜底

初期将完成页面骨架与导航，随后迭代功能。

---

## 数据模型

Memory 回忆
```ts
type MemoryType = "text" | "image" | "audio" | "date";

interface MemoryContent {
  text?: string;
  imageBlobIds?: string[]; // IndexedDB Blob 引用
  audioBlobId?: string;    // IndexedDB Blob 引用
  date?: string;           // ISO 字符串
}

interface Memory {
  id: string;
  type: MemoryType;
  content: MemoryContent;
  createdAt: string;       // ISO
  status: "active" | "sealed" | "drifted";
  sealedUntil?: string;    // ISO，仅当 sealed
  driftedAt?: string;      // ISO，漂流完成时间戳（可选）
  meta?: { tags?: string[] };
}
```

FirstEncounter 初遇
```ts
interface FirstEncounter {
  id: "first-encounter";
  createdAt: string;       // ISO
  locked: boolean;
  details: {
    time?: string;         // ISO
    location?: string;
    weather?: string;
    dialogues?: string[];  // 片段
    mood?: string;
    story?: string;        // Markdown/富文本（首版用纯文本）
    photos?: string[];     // IndexedDB Blob 引用
  };
}
```

---

## 持久化策略

- 首选 IndexedDB（推荐 Dexie 或 idb-keyval），存储结构化数据与 Blob（图片、音频）。
- localStorage 作为回退，仅保存轻量索引与元数据，不存大文件。
- 启动时加载索引；大对象按需加载。
- 封存展示策略：
  - 列表默认隐藏未解锁项；提供“查看封存”开关显示封存卡（遮蔽内容，仅展示解锁时间）
  - 到达 `sealedUntil` 后自动视为 active
- 漂流删除策略：
  - 两步确认 + “我理解不可找回”勾选
  - 播放漂流动画，动画结束后从 IndexedDB 物理删除
- 初遇只读锁定：
  - 锁定为不可逆；UI 与存储层同时禁止写入

---

## 交互流程（MVP）

1) 创建回忆  
- 进入 `/memories/new`，选择类型与填写内容  
- 保存为 `active`

2) 封存回忆  
- 详情页点击“封存”  
- 弹出时间胶囊对话框，设置未来日期  
- 保存为 `sealed`，解锁前不可见（或仅显示封存卡）

3) 漂流回忆  
- 点击“让它漂流”  
- 两步确认 + 勾选理解不可恢复  
- 播放漂流动画 → 删除记录与 Blob

4) 重返初遇  
- `/first-encounter` 未创建显示表单，保存可编辑  
- 点击“锁定初遇”后进入只读模式  
- 只读页面支持浏览、可选导出（后续增强）

---

## 可访问性与动画规范

- 键盘可达：表单与按钮具备清晰焦点管理；模态设置焦点陷阱
- 文案配合仪式感：轻提示（Toast）与操作确认分层明确
- 动画：
  - 漂流：瓶子远去与渐隐（CSS + keyframes 或 Lottie）
  - 封存：微粒聚拢与光晕收拢，展示解锁日期
- 尊重系统动效偏好：`prefers-reduced-motion` 降低动画强度/时长
- 色彩与对比度：遵循 WCAG AA

---

## 目录与组件规划

- `src/main.tsx` 应用入口
- `src/App.tsx` 路由与框架（后续引入 React Router）
- `src/pages/`
  - `Home.tsx`
  - `Memories/`
    - `List.tsx`
    - `New.tsx`
    - `Detail.tsx`
  - `FirstEncounter/`
    - `Index.tsx`
- `src/components/`
  - `memories/MemoryCard.tsx`
  - `memories/SealDialog.tsx`
  - `memories/LetGoDialog.tsx`
  - `memories/DriftAnimation.tsx`
  - `firstEncounter/FirstEncounterEditor.tsx`
  - `firstEncounter/FirstEncounterView.tsx`
  - `shared/MediaUploader.tsx`
  - `shared/AudioRecorder.tsx`
  - `shared/DateTimePicker.tsx`
  - `shared/ConfirmModal.tsx`
  - `shared/Toast.tsx`
- `src/state/`
  - `types.ts`
  - `db.ts` IndexedDB 封装
  - `store.ts` 轻量状态管理（Context/Reducer 或 Zustand）
- `src/utils/`
  - `date.ts`
  - `a11y.ts`

---

## 开发里程碑

MVP
- 路由与页面骨架
- 回忆创建/列表/详情（文本为主）
- 封存/解封逻辑（基于时间）
- 漂流确认与基础动画 + 删除
- 初遇创建/锁定只读
- IndexedDB 基础读写 + Blob 存储
- 基础 README 与文档

增强
- 图片/音频上传与录音
- 列表筛选与标签
- 导出只读页面为图片/PDF
- 动画精修与音效（可静音）
- 数据加密/隐私强化（可选）

---

## 约定与限制

- 数据仅存本地浏览器，无云端同步
- 漂流删除不可恢复，请务必确认
- 录音依赖浏览器 MediaRecorder，权限拒绝时回退为上传音频文件

---

## 贡献与代码规范

- 使用 TypeScript，遵循 ESLint 与基本命名规范
- 组件尽量保持可复用与无副作用
- 提交信息清晰：feat/fix/chore/docs 等前缀

---

## 许可证

MIT
