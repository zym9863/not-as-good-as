# 数据模型与持久化策略

本文档定义数据类型、存储结构与一致性规则，作为前端实现与单元测试的约束。

---

## 1. 数据类型定义

Memory 回忆
```ts
type MemoryType = "text" | "image" | "audio" | "date";

interface MemoryContent {
  text?: string;
  imageBlobIds?: string[]; // IndexedDB Blob 引用 key
  audioBlobId?: string;    // IndexedDB Blob 引用 key
  date?: string;           // ISO 字符串（仅做“纪念日”展示）
}

type MemoryStatus = "active" | "sealed" | "drifted";

interface Memory {
  id: string;                 // uuid
  type: MemoryType;
  content: MemoryContent;
  createdAt: string;          // ISO
  status: MemoryStatus;
  sealedUntil?: string;       // ISO，status=sealed 时有效
  driftedAt?: string;         // ISO，物理删除前的过渡标记（可选）
  meta?: {
    tags?: string[];
  };
}
```

FirstEncounter 初遇
```ts
interface FirstEncounter {
  id: "first-encounter";
  createdAt: string;         // ISO
  locked: boolean;
  details: {
    time?: string;           // ISO
    location?: string;
    weather?: string;
    dialogues?: string[];    // 片段
    mood?: string;
    story?: string;          // 文本/Markdown（MVP 用纯文本）
    photos?: string[];       // IndexedDB Blob 引用 key
  };
}
```

---

## 2. 存储分层

目标：结构化数据与大对象分离，降低读写压力并提升稳定性。

层级与职责：
- 元数据层（结构化记录）
  - 存储：IndexedDB 表 `records`（或 Dexie 表）
  - 回退：localStorage（仅存结构化索引与字段，不存 Blob）
- Blob 层（图片/音频）
  - 存储：IndexedDB 表 `blobs`
  - 命名：使用 uuid 作为 key，引用于 `imageBlobIds`/`audioBlobId`

建议库：
- Dexie（推荐，事务/索引友好）或 idb-keyval（极简）
- 本文档以 Dexie 结构为示例

---

## 3. IndexedDB 结构示例（Dexie）

数据库：`not-as-good-as`
- 表：`records`
  - key: `id`
  - schema: `id, type, status, createdAt, sealedUntil`
  - 存储对象：`Memory` 与 `FirstEncounter`（可通过 `type` 字段或固定 id 区分）
- 表：`blobs`
  - key: `id`
  - value: `Blob` 或 `{ id: string; blob: Blob; meta?: {...} }`

版本示例（伪代码）：
```ts
import Dexie, { Table } from "dexie";

class AppDB extends Dexie {
  records!: Table<any, string>;
  blobs!: Table<any, string>;

  constructor() {
    super("not-as-good-as");
    this.version(1).stores({
      records: "id, type, status, createdAt, sealedUntil",
      blobs: "id",
    });
  }
}
export const db = new AppDB();
```

---

## 4. 读写约束与一致性

- 事务：涉及记录与 Blob 的复合变更（如删除）需在事务中完成，避免悬挂引用。
- 引用一致性：
  - 写入记录时，先写 Blob，获取 blobId，再写记录。
  - 删除记录时，顺序为：播放动画（UI 层）→ 事务中删除记录与其引用的 Blob。
- 回退策略：
  - 若 IndexedDB 不可用/失败，退回 localStorage：
    - 仅存 `records` 的结构化部分；
    - Blob 文件需提示用户无法持久化（或降级为 dataURL，但不推荐大对象）。
- 自动解封：
  - 每次加载列表或详情时，若 `status=sealed` 且 `sealedUntil` 小于等于 `now`，在内存态视为 active。
  - 可选：懒更新持久层（下一次写入或定时器触发时更新为 active）。

---

## 5. 数据生命周期

Memory：
1) 创建
   - 校验：必填字段；当 `type=image/audio` 必须包含至少一项 Blob 引用
   - 写入：先写 Blob（如有）→ 写 `records`
2) 封存
   - 校验：`sealedUntil` 必须晚于当前时间
   - 更新：`status=sealed`，写入 `sealedUntil`
3) 解封
   - 条件：`status=sealed && sealedUntil <= now`
   - 行为：内存视为 active；可在下一次合适时机持久化更新
4) 漂流（删除）
   - UI：两步确认 + 勾选 → 播放动画
   - 存储：动画完成回调后，事务中删除 `record` 与其 `Blob` 引用
   - 最终：完全不可恢复

FirstEncounter：
1) 创建/编辑
   - 可多次保存；未锁定前可编辑
2) 锁定
   - 设置 `locked=true`
   - 存储层建议增加“写保护”守卫：当 `locked=true` 拒绝后续写入

---

## 6. 边界与错误处理

- 权限拒绝（录音）：捕获 `getUserMedia` 错误，提示并回退为上传音频文件
- 大文件：超过阈值（如 10MB）提示压缩或拒绝写入
- 存储失败：提示用户刷新或导出/备份（增强项）
- 数据迁移：版本升级时通过 Dexie 的 `version(n)` 执行 schema 迁移

---

## 7. 示例 API 约定（前端封装）

读取列表（可选筛选）：
```ts
async function listMemories(options?: { includeSealed?: boolean }) {
  // 默认过滤未到期 sealed
}
```

创建回忆：
```ts
async function createMemory(input: {
  type: MemoryType;
  content: MemoryContent;
  meta?: { tags?: string[] };
}): Promise<Memory> {}
```

封存回忆：
```ts
async function sealMemory(id: string, sealedUntilISO: string): Promise<Memory> {}
```

漂流删除：
```ts
async function driftMemory(id: string): Promise<void> {}
```

初遇读写与锁定：
```ts
async function getFirstEncounter(): Promise<FirstEncounter | null> {}
async function upsertFirstEncounter(payload: FirstEncounter): Promise<void> {} // 若 locked=true 拒绝
async function lockFirstEncounter(): Promise<void> {}
```

---

## 8. 安全与隐私

- 数据仅存本地，不上传
- 可选增强：对结构化数据进行对称加密（Crypto.subtle），密钥由用户输入口令派生（PBKDF2）
- 录音/相片包含敏感信息，提供清晰的删除指引与导出能力（增强阶段）

---

## 9. 测试要点

- 封存日期边界：等于当前时间应视为到期
- 事务完整性：删除记录时 Blob 不应遗留
- 锁定守卫：`locked=true` 时一切写操作被拒绝
- 回退路径：模拟 IndexedDB 失败时 localStorage 是否可用且信息不丢失（除 Blob）