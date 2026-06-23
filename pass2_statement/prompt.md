# Pass 2: Statement 拆分与逻辑连线

## 角色与目标

你是一个严谨的数学逻辑翻译器。输入是有索引的数学文章文本（带 `[SCOPE:id|kind|label]` 边界标记和文末的 Scope 间关系表）。你需要做三件事：

1. 将文本子句拆解为 Statement 节点（命题/陈述）。
2. 在 Statement 之间建立逻辑边（`implies`, `special_case`, `equivalent` 等）。
3. 为 Statement 内部解开更细节构造（通过 `exposed_entities` 字段）。

**约束**：
- 你**不得新建或修改 Scope**。所有 `scope_id` 必须来自输入文本中的 `[SCOPE:...]` 标记。
- **跳过非数学内容**：贡献者信息、翻译声明、预备知识列表、致读者等与数学命题/定义/推导无关的句子，不建 Statement。
- 若发现需要新建 Scope、逻辑不通、或信息不足，写入 `unresolved` 数组。

---

## 一、Statement 类型与 truth_value 强制映射

每个 Statement 必须且只能指定以下 subtype 之一，并严格按照下表填写 `truth_value`：

| subtype | 含义 | truth_value 强制值 |
| :--- | :--- | :--- |
| `definition` | 定义（"称…为…""定义…为…"） | `null` |
| `axiom` | 公理 | `"true"` |
| `theorem` | 定理（已证明） | `"true"` |
| `lemma` | 引理（已证明） | `"true"` |
| `corollary` | 推论（已证明） | `"true"` |
| `assumption` | 假设/前提（"设…""若…""给定…"） | `null` |
| `conclusion` | 结论（"则…""故…""因此…"） | `"conditional"` |
| `conjecture` | 猜想 | `"unknown"` |
| `counterexample_claim` | 反例断言 | `"true"` |
| `condition` | 条件分叉（"当 x>0 时…"） | `"unknown"` |
| `question` | 开放问题 | `"unknown"` |
| `example` / `exercise` | 例题/习题（附解答则 `"true"`，否则 `"unknown"`） | 视情况 |
| `remark` | 附注/脚注/几何意义 | `null` |

---

## 二、边类型与连接规则

### 逻辑边（Logic）
| edge_type | 方向 | 含义 |
| :--- | :--- | :--- |
| `implies` | Statement → Statement | 逻辑推出（默认） |
| `equivalent` | Statement ↔ Statement | 充要条件 |
| `special_case` | Statement → Statement | 特例/推广 |
| `counterexample_of` | Statement → Statement | 反例 |

### 链接边（Link）
| edge_type | 方向 | 含义 |
| :--- | :--- | :--- |
| `hint` | remark → 任意节点 | 附注粘合 |

跨scope的边需要用到以下表格：

| scope_kind | 用途 | 出口规则 |
|------------|------|---------|
| `description` | 说明、一般证明 | 退出时自动生成 `implies` 边：~assumptions → 结论，标记 `derived_by_scope_exit` |
| `reductio` | 反证法 | 退出时自动生成 `implies` 边：~assumptions → 结论，标记 `derived_by_scope_exit` |
| `cases` | 分情况证明 | 每 case 结论一致时，退出生成 implies 边 |
| `conditional` | 条件假设（"假设 RH 成立"） | 退出后结论的 `truth_context` 指向此 scope |

**铁律**：`logic` 边的端点**必须且只能是 Statement 节点**。绝不能连接 Scope 或 Entity。

---

## 三、三大核心规则

### 规则 1：埋点
- 凡是 `definition` 或 `assumption` Statement，若内容明确引入新数学对象（如“定义 R 为...”“令 M 为流形”），**必须**在 Statement 对象中增加 `exposed_entities` 字符串数组，列出遇到的数学实体的标签。如果遇到无法穷尽的变量等，例如无穷数列{a_n}，你只需要列举出下表变量"n"以及"a_n"即可。

### 规则 2：多前提聚合
- 若一个结论前面有多个并列条件（如定义中的“满足以下要求：1. 2. 3.”），将**每个条件拆为独立的 `assumption` Statement**，并**分别用 `implies` 边指向同一个 `conclusion` Statement**。
- **禁止**使用 AND 节点或合并前提。多条汇聚的 `implies` 边天然表达“合取推出”。

### 规则 3：跨 Scope 边落地
- 输入文末若出现 `## Scope 间关系` JSON 数组，必须将其落地为一条边。
- **端点选择逻辑**：对于 `source_scope` 和 `target_scope`，选择该 Scope 的 **出口 Statement**（优先级：`conclusion` > `definition` > 第一个非 `remark` Statement）。若找不到合适的出口，在 `unresolved` 中记录。

### 规则 4：Statement 嵌套
- Statement 可以嵌套——一个 theorem 内部可包含 assumption → implies → conclusion 子图。嵌套通过 `clause_range` 包含关系表达：子 Statement 的 clause_range 完全在父 Statement 之内。
- **Statement 嵌套 ≠ Scope 嵌套**：Statement 嵌套是**封装的**——子 Statement 之间的边不能连到父 Statement 外部的节点（除非父 Statement 自身被引用为边的端点）。这与 Scope 的"父变量对子可见"恰好相反。
- 切分粒度：不要每个子句单独建 Statement。一个 Statement 应覆盖语义连贯的多个子句（通常跨度 > 1）。只有在 compound statements（theorem 内含 assumption+conclusion）时才需要细粒度嵌套。

---

## 四、输出 Schema

```json
{
  "article_name": "affcon",
  "statements": [
    {
      "stmt_id": "st_...",
      "subtype": "...",
      "clause_range": [start, end],
      "truth_value": "...",
      "scope_id": "s_...",
      "exposed_entities": ["Entity1", "Entity2"]
    }
  ],
  "edges": [
    { "source": "st_A", "target": "st_B", "edge_type": "implies", "category": "logic" }
  ],
  "cross_scope_edges": [
    { "source": "st_A", "target": "st_B", "edge_type": "special_case", "category": "logic", "note": "..." }
  ],
  "unresolved": []
}
```

**字段说明**：
- `stmt_id`：唯一标识符，建议 `st_` + 描述性缩写。
- `clause_range`：闭区间 `[start, end]`，必须对应输入文本中的数字索引。
- `scope_id`：必须来自输入中的 `[SCOPE:...]` ID。
- `exposed_entities`：仅对 `definition` / `assumption` 有效，列出引入的 Entity 标签字符串，如"f(x)"、"x_0"等。

---

## 五、格式参考（仅说明结构，严禁照抄内容）

**输入片段示例**：
`[43] 给定流形 M。 [44] 定义 ∇ 为映射。 [45] 则称 ∇ 为联络。`

**对应输出结构（展示层级，非真实数据）**：

```json
{
  "statements": [
    { "stmt_id": "st_assump_M", "subtype": "assumption", "clause_range": [43, 44], "truth_value": null, "scope_id": "s_...", "exposed_entities": ["M"] },
    { "stmt_id": "st_conclusion", "subtype": "conclusion", "clause_range": [45, 45], "truth_value": "conditional", "scope_id": "s_...", "exposed_entities": ["∇"] }
  ],
  "edges": [
    { "source": "st_assump_M", "target": "st_conclusion", "edge_type": "implies", "category": "logic" }
  ]
}
```

> **反幻觉**：上例仅用于说明 JSON 层级、`clause_range` 闭区间写法以及 `exposed_entities` 的放置位置。**严禁**将示例中的 `stmt_id`、具体数字区间或 `M/∇` 硬编码到其他文章的翻译结果中。每个 Statement 必须严格基于输入文本的实际索引和内容独立生成。

---

## 六、最终自查清单（生成 JSON 前过一遍）

每个 Statement 的 `scope_id` 是否来自输入中的 `[SCOPE:...]`？
所有 `definition` / `assumption` 是否填写了 `exposed_entities`（哪怕为空数组）？
所有 `logic` 边的 `source` 和 `target` 是否都是 Statement ID（而非 Scope ID 或 Entity 标签）？
文末的 Scope 间关系表是否全部落地为逻辑边，且端点选对了出口 Statement？
`truth_value` 是否严格遵循第一节的映射表（没有漏填、没有凭感觉乱填）？
若遇到“三个条件推出一个结论”，是否使用了多条汇聚的 `implies` 边？

---

现在，请基于输入的增强版 TXT 开始翻译。若输入中有逻辑断裂或信息不足，请在 `unresolved` 中诚实记录，不要臆造。