# 开发任务分解与里程碑（MVP → 增强）

本文档将项目拆解为可执行任务，分阶段迭代，确保核心体验先行、风险受控与可持续扩展。

---

## 里程碑概览

- M0：项目骨架与文档（已完成）
- M1：页面与路由骨架、基础状态与持久化
- M2：Memories 基础闭环（创建/列表/详情/封存/解封）
- M3：漂流流程与动画、删除闭环
- M4：初遇创建/锁定只读
- M5：A11y 与动效落实、QA 与打磨
- M6：增强能力（图片/音频完善、导出、标签、隐私）

---

## M1：路由骨架与基础状态（1–2 天）

目标：可以在浏览器跑通路由导航，具备最小状态读写能力。

任务列表：
- [ ] 安装 React Router，配置路由与页面骨架（`Home`/`Memories/List`/`Memories/New`/`Memories/Detail`/`FirstEncounter/Index`/`404`）
- [ ] 全局布局与导航（顶部标题 + 主导航）
- [ ] 定义 `src/state/types.ts`（Memory/FirstEncounter 类型）
- [ ] IndexedDB 封装 `src/state/db.ts`（Dexie 初始化、`records`/`blobs` 表）
- [ ] 简单 Store（Context/Reducer 或 Zustand）与基本 API：读取列表/读取详情/创建占位
- [ ] README 更新：运行方式 + 路由说明

交付物：界面可切换，空数据占位显示，控制台无明显错误。

---

## M2：Memories 基础闭环（2–3 天）

目标：可创建文本回忆、列表查看、详情页展示；可封存与自动解封。

任务列表：
- [ ] `MemoryCreateForm`（支持 text 类型；MVP 暂不接入图片/音频）
- [ ] 创建回忆写入 IndexedDB（records）
- [ ] `MemoryList`：显示 active 回忆，提供“显示封存”开关
- [ ] `MemoryCard`：封存卡遮蔽展示（仅露出解锁时间）
- [ ] `MemoryDetail`：状态驱动视图（active/sealed）
- [ ] `SealDialog`：日期选择、校验与保存
- [ ] 自动解封逻辑（加载时判定 `sealedUntil <= now` 即视为 active）

交付物：Memories 从创建 → 列表 → 详情 → 封存/解封全流程跑通。

---

## M3：漂流 Let Go（1–2 天）

目标：优雅动画 + 永久删除不可找回。

任务列表：
- [ ] `LetGoDialog`：两步确认 + 勾选“我理解不可恢复”
- [ ] `DriftAnimation` 组件：动画与 `onFinished` 回调
- [ ] 删除事务：删除 record 与其 Blob（占位实现，后续图片/音频时沿用）
- [ ] 低动效模式（`prefers-reduced-motion`）下跳过动画

交付物：详情页点击漂流后动画播放、删除成功并返回列表，Toast 提示。

---

## M4：重返初遇 First Encounter（1–2 天）

目标：初遇故事线的编辑与只读锁定。

任务列表：
- [ ] `FirstEncounterEditor`：时间/地点/天气/对话（多段）/心情/故事（纯文本）
- [ ] 读取/写入 IndexedDB（固定主键 `first-encounter`）
- [ ] 锁定流程（模态确认 + 存储层写保护）
- [ ] `FirstEncounterView`：只读展示

交付物：创建与锁定只读流程稳定可用。

---

## M5：A11y 与动效落实、QA（1–2 天）

目标：确保“仪式感”与可用性兼顾。

任务列表：
- [ ] Modal 焦点陷阱 + Esc 关闭（漂流第二步可禁止 Esc）
- [ ] Toast 与错误条幅的 aria-live 辅助文本
- [ ] 统一表单校验提示（aria-invalid/aria-describedby）
- [ ] 动画时长按规范落地，支持 `prefers-reduced-motion`
- [ ] QA 自测清单走查（见《交互流程与可访问性/动画规范》）

交付物：通过 QA 清单，基础动效体验完成。

---

## M6：增强能力（按需）

可选增强任务：
- [ ] 图片上传（`MediaUploader`），预览与 Blob 存储
- [ ] 音频录制（`AudioRecorder`，MediaRecorder API）与上传回退
- [ ] 列表筛选与标签（meta.tags）
- [ ] 导出“初遇”只读页为图片/PDF
- [ ] 数据加密（结构化数据对称加密 + 用户口令）
- [ ] 动画精修与音效（可静音开关）
- [ ] 数据备份/恢复（导出 JSON，排除大 Blob 或引用导出）

---

## 技术约定

- 优先使用 TypeScript 类型约束数据边界
- 删除/锁定等不可逆操作统一使用 `ConfirmModal` 流程
- 任何涉及记录与 Blob 的删除必须在事务中完成
- 遵循文档规范与目录约定，组件职责单一

---

## 里程碑完成标准（DoD）

- 页面功能按“核心流程”跑通
- A11y 基线满足：键盘可达、焦点管理、可读的错误提示
- 持久化一致性：无悬挂 Blob 引用
- README 与 docs 与实现保持一致，更新变更记录
