# 路由与页面结构说明

本文档描述应用的页面信息架构、路由映射、导航关系与页面职责范围，作为实现与评审的统一依据。

## 一、路由表（计划）

- `/` Home 仪式感入口页  
  - 角色：项目简介、两大功能入口 CTA（“回忆漂流瓶”“重返初遇”）
  - 导航：到 `/memories`、`/first-encounter`
- `/memories` 回忆列表页  
  - 角色：展示回忆列表、创建入口、筛选（全部/封存/已解锁）、可查看封存卡（遮蔽内容）
  - 操作：进入创建 `/memories/new`；进入详情 `/memories/:id`
- `/memories/new` 创建回忆页  
  - 角色：选择类型（text/image/audio/date）与填写内容，提交创建为 active
- `/memories/:id` 回忆详情页  
  - 角色：展示单条回忆；当状态为 sealed 且未到 `sealedUntil`，仅显示封存卡与解锁时间
  - 操作：封存（Seal）、漂流（Let Go）；到期自动解封
- `/first-encounter` 初遇页  
  - 角色：首访若未创建显示表单；已创建未锁定可编辑；锁定后只读展示
- `*` 404

路由实现建议采用 React Router v6+，并按需分包以优化首屏体积。

## 二、页面职责与组件清单

Home
- 组件：`Hero`、`FeatureIntro`、`PrimaryCTA`
- 路由跳转：`/memories`、`/first-encounter`

Memories/List
- 组件：`MemoryList`、`FilterBar`、`EmptyState`、`MemoryCard`
- 状态：列表数据与筛选条件；“显示封存项”开关
- 操作：新建、进入详情

Memories/New
- 组件：`MemoryCreateForm`（内部包含类型切换、文本域/上传器/日期选择）
- 校验：必填项、录音权限提示、图片/音频大小限制

Memories/Detail
- 组件：`MemoryDetail`、`SealDialog`、`LetGoDialog`、`DriftAnimation`
- 逻辑：根据状态与时间决定展示内容或封存卡

FirstEncounter/Index
- 组件（互斥）：`FirstEncounterEditor`（未创建或未锁定）、`FirstEncounterView`（锁定只读）
- 操作：保存、锁定；锁定后不可逆

Shared
- `MediaUploader`、`AudioRecorder`、`DateTimePicker`、`ConfirmModal`、`Toast`
- A11y：键盘可达、焦点管理、`prefers-reduced-motion`

## 三、导航与状态流

- 自 Home 进入两个主分支：Memories 与 FirstEncounter
- Memories 分支：
  - List → New（创建）→ List
  - List → Detail（查看/封存/漂流）
  - Detail → 漂流动画完成后返回 List
- FirstEncounter 分支：
  - Index（未创建/未锁定）→ 保存/锁定 → Index（只读）

## 四、权限与边界

- 漂流为不可逆操作：两步确认 + 勾选“理解不可恢复”
- 封存解锁日期必须晚于当前时间
- 初遇锁定为不可逆：锁定后写入通道关闭

## 五、实现建议

- 先搭建路由骨架与页面空组件，确保信息架构稳定
- 动画事件应暴露 `onFinished` 回调，以串联删除与导航
- 使用懒加载与代码分割，减小首屏成本