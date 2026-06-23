# Pass 1: Scope 标注

## 任务

给定一篇数学文章的预处理 JSON（`blocks` + `environments`），你要做三件事：

1. **划 Scope 边界**，确保每个 Scope 只有一个论述中心。必要时重组 block。
2. **标变量**：`let_bind` Scope 引入了哪些变量（函数也是变量）。
3. **标关系**：非 `let_bind` Scope 之间的逻辑关系，记录在 `scope_relations` 中。

## Scope 类型

| scope_kind | 用途 | 出口规则 |
|------------|------|---------|
| `description` | 定义、定理、引理、推论、公理、例题、习题。**默认。** | 可选生成 `special_case` 指向子定理 |
| `reductio` | 反证法（"假设…不成立""…矛盾"） | 退出时自动生成 `implies`，指回自身 |
| `cases` | 分情况证明 | 结论一致时退出生成 `implies` 指向父 Scope |
| `conditional` | **仅**猜想式假设（"假设黎曼猜想成立"），真值存疑 | 退出后 `truth_context` 指向此 scope |
| `let_bind` | 引入新变量（设/令/考虑/记/对任意…） | — |

**硬规则**：
- `conditional` ≠ 定理前提。定理前提用 `description` + 内部 `assumption`。
- 引入新变量就必须新建 `let_bind` Scope。
- Scope 不是节点——逻辑边的端点不能是 Scope。

## 逻辑边（供 `scope_relations` 使用）

| edge_type | 含义 |
|-----------|------|
| `implies` | 逻辑推出 |
| `equivalent` | 充要条件 |
| `special_case` | 特例/推广 |
| `counterexample_of` | 反例 |

> ⚠️ 以下示例仅用于说明输出格式和 Scope 嵌套结构。**不要照搬示例中的 label、scope_id 或 Scope 划分**——每篇文章的 Scope 应完全基于其自身内容独立判断。示例中的"费马定理""罗尔定理""常值 vs 非常值""极值点 c"只是示例文章的特定内容，不应出现在其他文章中。

## 示例：费马定理 → 罗尔定理

输入（节选）：
```
文章名: Rolle
标题: 罗尔中值定理

环境标记 (hints):
  [0] type=theorem heading=定理 1 title=费马定理
  [1] type=theorem heading=定理 2 title=罗尔定理

正文（2 个 block）：

## Block 0: 1. 费马定理（索引 0）

[0] 【定理 1 费马定理】
[1] 设函数 $f$ 在 $x_0$ 处可导，且在 $x_0$ 的某邻域内有定义。
[2] 若 $f$ 在 $x_0$ 处取得局部极值，则 $f'(x_0)=0$。
[3] 证明：不妨设 $f$ 在 $x_0$ 处取得局部极大值。
[4] 则存在 $\delta>0$，使得当 $0<|x-x_0|<\delta$ 时 $f(x)\le f(x_0)$。
[5] 由导数定义，
[6] \begin{equation} f'(x_0)=\lim_{x\to x_0}\frac{f(x)-f(x_0)}{x-x_0} \end{equation}
[7] 当 $x>x_0$ 时右极限 $\le0$，当 $x<x_0$ 时左极限 $\ge0$，而极限存在故必为 $0$。

## Block 1: 2. 罗尔定理（索引 8）

[8] 【定理 2 罗尔定理】
[9] 设函数 $f$ 在 $[a,b]$ 上连续，在 $(a,b)$ 内可导，且 $f(a)=f(b)$。
[10] 则存在 $c\in(a,b)$，使得 $f'(c)=0$。
[11] 证明：
[12] 若 $f$ 为常值函数，则 $f'(x)=0$ 对任意 $x\in(a,b)$ 成立，结论显然。
[13] 若 $f$ 不是常值函数，由最值定理，$f$ 在 $[a,b]$ 上取得最大值 $M$ 和最小值 $m$。
[14] 分两种情况讨论：
[15] 当 $M>f(a)=f(b)$ 时，最大值在 $(a,b)$ 内部的某点 $c$ 取得…
[16] 由费马定理知 $f'(c)=0$。
[17] 当 $m<f(a)=f(b)$ 时同理。
[18] 综上所述，总存在 $c\in(a,b)$ 使得 $f'(c)=0$。
```

输出：
```json
{
  "article_name": "Rolle",
  "scopes": [
    { "scope_id": "root", "scope_kind": "description", "label": "罗尔中值定理",
      "parent_scope": null, "block_indices": [0,1], "child_scopes": ["s_fermat","s_rolle"], "variables": [] },
    { "scope_id": "s_fermat", "scope_kind": "description", "label": "费马定理",
      "parent_scope": "root", "block_indices": [0],
      "clause_range": [3, 9], "child_scopes": ["s_fermat_let"], "variables": ["f","x_0"] },
    { "scope_id": "s_fermat_let", "scope_kind": "let_bind", "label": "费马定理的变量",
      "parent_scope": "s_fermat", "block_indices": [0], "clause_range": [3, 5],
      "variables": [{"label":"f","bind_type":"scope-bind"},{"label":"x_0","bind_type":"scope-bind"}] },
    { "scope_id": "s_rolle", "scope_kind": "description", "label": "罗尔定理",
      "parent_scope": "root", "block_indices": [1], "clause_range": [10, 25],
      "child_scopes": ["s_rolle_let","s_rolle_cases"], "variables": ["f","a","b"] },
    { "scope_id": "s_rolle_let", "scope_kind": "let_bind", "label": "罗尔定理的变量",
      "parent_scope": "s_rolle", "block_indices": [1], "clause_range": [10, 12],
      "variables": [{"label":"f","bind_type":"scope-bind"},{"label":"a","bind_type":"scope-bind"},{"label":"b","bind_type":"scope-bind"}] },
    { "scope_id": "s_rolle_cases", "scope_kind": "cases", "label": "常值 vs 非常值",
      "parent_scope": "s_rolle", "block_indices": [1], "clause_range": [16, 25],
      "child_scopes": ["s_rolle_c2"], "variables": [] },
    { "scope_id": "s_rolle_c2", "scope_kind": "let_bind", "label": "极值点 c",
      "parent_scope": "s_rolle_cases", "block_indices": [1], "clause_range": [21, 25],
      "variables": [{"label":"c","bind_type":"scope-bind"},{"label":"M","bind_type":"scope-bind"},{"label":"m","bind_type":"scope-bind"}] }
  ],
  "scope_relations": [
    { "source_scope": "s_rolle", "target_scope": "s_fermat",
      "edge_type": "special_case", "category": "logic",
      "note": "罗尔的证明引用费马结论。Pass 2 落地时端点应为各自的 conclusion Statement。" }
  ],
  "unresolved": []
}
```

说明：`clause_range: [3, 9]` 表示该 Scope 覆盖从索引 3 到索引 9（含）的所有子句。范围可跨越多个 block。

`clause_range` 是**含两端**的闭区间 `[start, end]`。如果 Scope 由不连续的多个片段组成，用 `clause_ranges: [[3,5],[12,15]]`。

## 规则

1. 每个 theorem / definition / lemma / example / exercise → `description` Scope
2. 每个"设/令/考虑/对任意"引入的变量 → `let_bind` 子 Scope。一个 `let_bind` 覆盖变量从声明到不再被引用的整段范围。
3. **`child_scopes` 必须一一对应**：如果你在 `child_scopes` 中引用了一个 ID，你**必须**在 `scopes` 数组中定义它。先创建 Scope，再引用。不要引用不存在的 ID。
4. **Scope 总数通常 3-30 个，每个 Scope 的 child_scopes 通常 0-10 个**。如果 child_scopes 超过 20 个条目，说明切分太细，应合并。
5. **每个非 root 的 Scope 必须填写 `clause_range`**（或 `clause_ranges`）。root Scope 不需要。
6. `conditional` ≠ 一般命题条件
7. 逻辑边端点不是 Scope → 放 `scope_relations`
8. `clause_range` 可跨 block，也可用 `clause_ranges` 表示不连续片段
9. `incomplete: true` 标记未完成内容
10. **数列/无穷列举变量**（如 $a_1, a_2, \dots, a_n$）：只绑定代表整个序列的变量（如 `a_n`）和索引变量（如 `n`）。不要逐一列举，不要出现省略号。
