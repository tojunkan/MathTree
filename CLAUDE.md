# MathTree — 数学知识图谱 架构文档

## 核心理念

将数学语言翻译成**图**。图的基石是：

> **边是本位。边就是谓词。Statement 是把多条边封装在一起的语法糖。**
>
> 一个特殊的 Statement —— 当它只含一个核心谓词、恰好连接两个巨大的 Entity 时 —— 可以在折叠态"画成一条边"。这层边是语法糖上的语法糖。

边承载真值（truth_value）。Statement 通过聚合边来承载复杂逻辑结构（多重前提、证明链、量词约束）。

整个图可视化成一个**可导航的文件浏览器**：节点可以进入（展开内部子图），边也可以展开（揭示其背后的 Statement 及其内部边结构）。

---

## 一、节点类型

所有节点存储在 `nodes` 表中，通过 `type` 和 `subtype` 区分。

### 1.1 Entity（数学实体）

```sql
type = 'Entity'
subtype IN ('object', 'operation', 'relation', 'property', 'variable', 'quantifier')
```

| subtype | 含义 | 示例 |
|---------|------|------|
| `object` | 数学对象 | ℝ, ℕ, 函数f, 点, 线, 群, 向量空间 |
| `operation` | 运算/映射 | +, ×, lim, d/dx, ∫, 交, 并 |
| `relation` | 关系（含对偶等结构保持映射） | =, <, ⊆, ∼, dual_to, 同构, 相似, 平行 |
| `property` | 性质/属性 | 连续性, 紧致性, 交换律, 完备性, 正交性 |
| `variable` | 变量 | n, x, y, ε, a_n |
| `quantifier` | 量词 | ∀ (全称), ∃ (存在), ∃! (唯一存在) |

### 1.2 Statement（命题/陈述）

```sql
type = 'Statement'
subtype IN ('definition', 'axiom', 'theorem', 'lemma', 'corollary',
            'assumption', 'conclusion', 'conjecture', 'counterexample_claim',
            'condition', 'question', 'example', 'exercise', 'remark',
            'relation_application', 'operation_application')
truth_value IN ('true', 'false', 'unknown', 'conditional')
truth_context → node_id (nullable)  -- 最近依赖的 Scope（非堆叠，只一个指针）
```

| subtype | 含义 | truth_value | 可删除 | proof |
|---------|------|-------------|--------|-------|
| `definition` | 定义。本质是终点为"是"/"称为"的 implies 链路 | — | ✅ | ❌ |
| `axiom` | 公理。含代入规则等元逻辑 | true | ❌ | ❌ |
| `theorem` | 定理——已证明的陈述 | true | ⚠️ | ✅ |
| `lemma` | 引理 | true | ✅ | ✅ |
| `corollary` | 推论 | true | ✅ | ✅ |
| `assumption` | 假设——Scope 的根假设或定理前提。折叠态，"展开"内部可含 Entity 和 instance_of 边 | — | ✅ | ❌ |
| `conclusion` | 结论——implies 边的 target。"则/那么/故"引导的陈述 | conditional | ✅ | ❌ |
| `conjecture` | 猜想。被证明后直接改 subtype | unknown | ✅ | ❌ |
| `counterexample_claim` | 反例断言 | true | ✅ | ✅ |
| `condition` | 条件分叉。`is_exhaustive` 标记穷举性 | unknown | ✅ | ❌ |
| `question` | 开放问题（"是否每个连续函数都可微？"） | unknown | ✅ | ❌ |
| `example` | 例题。本质是命题，内部拆为 assumption → implies → conclusion | — | ✅ | ✅（解答=证明） |
| `exercise` | 习题。同 example，解答即 proof | — | ✅ | ✅（解答=证明） |
| `remark` | 附注：几何意义、直观解释、图解说明、脚注。通过 `hint` 边粘合到被注释的节点 | — | ✅ | ❌ |
| `relation_application` | 关系判定实例——承载参数和真值 | 取决于 scope | ✅ | ✅（可选） |
| `operation_application` | 运算应用实例——承载参数和产出值（result 边） | — | ✅ | ❌（运算不是判定） |

特别说明：condition类型的statement节点不能被用来当作一般的命题条件，要和assumption区分开。

> **例题和习题不是独立类型**——它们本质是命题，内部结构 = assumption → implies → conclusion。`example`/`exercise` 只标记其教学角色，方便前端筛选和展示。
>
> **remark 是粘合性的**——所有 remark 必须通过 `hint` 边连接到被注释的节点。几何意义、图解、脚注都放在 remark 的 description 里。

`define` 语义：`{assumptions} → implies → [最终谓词="是"] → Entity被定义`。不过它不承载真值。

### 1.3 Reference（分身 / 符号链接）

`type = 'Reference'`。不附属于任何其他 type——它可以指向 Entity、Statement、Scope、Idea、甚至另一个 Reference。

```sql
type = 'Reference'
refers_to → node_id  -- 指向真身（任意类型）
```

| 属性 | 说明 |
|------|------|
| label / description | 继承自真身（只读） |
| 外观 | 真身类型徽章 + 📎 虚线框 |
| 参与边 | 与真身同权——可以作为 implies 前提、has_property 主语等 |
| 单击 | 右侧面板显示真身摘要 |
| 双击 | 跳转到真身所在位置（viewStack 导航） |

与真身从不同屏——不需要跨作用域的边，`refers_to` 是字段。

### 1.4 Idea（数学思想）

```sql
type = 'Idea'  -- 无 subtype
```

通过 `uses_idea` 逻辑边连接。多在substitute边中常见。如：对角线论证, ε-δ 语言, 数学归纳法, 正交分解。

---

## 二、边类型

```
edges:
  category: 'construction' | 'logic' | 'link' | 'case'
  edge_type: (见下表)
  truth_value: 'true' | 'false' | 'unknown' | 'conditional'  -- 仅 logic 边
  truth_context → node_id (nullable)
  scope_id → node_id (nullable)
  derived_by_scope_exit: boolean
```

> **构造边和 link 边不承载 truth_value。** 构造是定义性的（"由…组成"），link 是粘合性的（"附注于此"）。逻辑边是断言性的（"蕴含…"）。
>
> **所有边都承载 scope_id。** `instance_of` 和 `define` 的语义依赖作用域：同一个变量在不同 Scope 中的绑定不同。

### 2.1 构造边 (Construction)

表达"事物如何被构建出来"——不涉及真假。

| edge_type | 含义 | 示例 |
|-----------|------|------|
| `is_a` | 子类⊂父类 | ℕ → ℤ, 群 → 幺半群 |
| `instance_of` | 实例∈类 | 2 → ℕ, G → 群。变量实例化也用此边 |
| `compose` | 部分组成整体 | {a_n,cos,sin} → Fourier级数。多源用多条同 type + 同 label 的边 |
| `has_property` | 实体有某性质 | f → 连续性, + → 交换律 |
| `define` | 定义引入实体 | Statement/definition → Entity。可附带 assumption 作为先决条件 |
| `arg_1`, `arg_2`, ..., `arg_n` | 关系/运算判定的 n 元参数 | Entity_i → Application 节点 |
| `uses_template` | 关系/运算判定引用其模板 | Application → Entity/relation 或 Entity/operation |
| `result` | 运算 Application 的产出值 | OperationApplication → Entity（结果值） |
| `substitute` | 形式等价替换（恒真，无需计算）。可展开为用户自写的推导 | (x+y)² → x²+y²+2xy |
| `depend_on` | 变量依赖（分析学核心结构） | δ → ε, δ → x |

### 2.2 逻辑边 (Logic)

表达"命题之间的推理关系"——涉及真假。**逻辑边可展开**：展开后显示隐式 Statement 及其证明子图。

| edge_type | 含义 | 展开后 |
|-----------|------|--------|
| `implies` | 逻辑推出 | 证明子图 |
| `equivalent` | 等价/充要（可视化可画为无向/双向） | 等价性证明子图 |
| `special_case` | 特例 | 特化过程 |
| `counterexample_of` | 反例 | 验证推理 |
| `uses_idea` | 使用了某数学思想 | 引用 Idea 节点 |



### 2.3 链接边 (Link)

不承载 truth_value。用于粘合和绑定——表达"附属于"或"约束于"关系。

| edge_type | 含义 | 示例 |
|-----------|------|------|
| `hint` | 附注粘合。remark → 被注释的节点 | "几何意义：..." --[hint]--> 定理 Statement |
| `scope-bind` | let 绑定：具体赋值/命名。Scope 为 `let_bind` 时使用 | Scope(let_bind) → 被赋值的变量 Entity；"记 f(x)=..." → f |
| `quantity-bind` | 量词约束。量词 Entity 管辖其变量 | ∀ → ε; ∃ → n; ∃ → Statement |

> **为什么拆开 bind？** 原 `bind` 边混用了两种语义：let 绑定（"令 f(x) = x²"——已赋值，不再变化）和量词约束（"∀ε>0"——留待实例化，每次实例化可不同）。前者是 link 性质（不承载真值），后者包含辖域信息。拆开后由所在 Scope 的 `scope_kind` 配合区分——`let_bind` Scope 内用 `scope-bind`，量词出现的 Scope 内用 `quantity-bind`。

### 2.4 分叉边 (Case)

| edge_type | 含义 | 示例 |
|-----------|------|------|
| `case` | Condition → 分叉出的 Scope | Condition "x∈ℝ" → case1 "x≥0", case2 "x<0" |

`is_exhaustive=true` 时系统要求附带证明（证明所有 case 穷举了可能）。无证明则警告但不阻止。

---

## 三、折叠/展开 —— 通用能力

**不存在独立的 'G' 节点类型。所有节点都可以通过 `group_members` 拥有内部结构。**

###3.1 节点的展开
```sql
group_members:
  parent_id → child_id  -- 任意节点均可为 parent
```

举例：

| 节点类型 | 展开后显示什么 | 
|----------|---------------|
| Entity/object (ℝ) | 构造子图 或 公理子图 |
| Entity/property (完备性) | 以该性质为主题的定理等价环 |
| Statement/theorem (Picard) | 证明子图（假设→引理→implies→结论） |
| Statement/definition (Fourier系数) | 构造子图（原材料 + compose → 新实体） |
| Scope | 内部作用域（assumption + 推理链 + scope exit） |
| 逻辑边 (implies) | 隐式 Statement 节点 + 证明 |

**多重展开**：一个节点可以有多种展开方式（ℝ 按 Cauchy 列 / 按域公理）。把每一种展开方式渲染成一个Statement节点，不同展开之间可用 `equivalent` 边。用户可以点开每一个Statement来查看每一个具体的证明/构造方法，也可以点equivalent（这里的equivalent是上文说过的语法糖的语法糖）查看不同构造/证明之间的充要性。

**导航**：双击进入 → ← 返回 → 面包屑导航：`📊 全局 ▸ 完备性 ▸ Cauchy准则`。`viewStack: string[]` 记录导航路径。


### 3.2 Scope（作用域 / 命名空间）

Scope 是**纯局部的命名空间与推理容器**，不是普通节点——它不参与逻辑边（implies、equivalent 等的端点不能是 Scope）。一个Scope内部的边、Statement等的truth_value 永远是**相对于当前 Scope 的根假设**的局部值，而非全局堆叠。

```sql
type = 'Scope'
scope_kind IN ('description', 'reductio', 'cases', 'conditional', 'let_bind')
```

| scope_kind | 用途 | 出口规则 |
|------------|------|---------|
| `description` | 说明、一般证明 | 退出时自动生成 `implies` 边：~assumptions → 结论，标记 `derived_by_scope_exit` |
| `reductio` | 反证法 | 退出时自动生成 `implies` 边：~assumptions → 结论，标记 `derived_by_scope_exit` |
| `cases` | 分情况证明 | 每 case 结论一致时，退出生成 implies 边 |
| `conditional` | 条件假设（"假设 RH 成立"） | 退出后结论的 `truth_context` 指向此 scope |
| `let_bind` | 变量赋值/语境切换 | 用 `scope-bind` 边绑定变量或别名 |

特别说明：conditional类型的scope不能被用来当作一般的命题条件，一般被用于传递某个数学猜想的真值，要和assumption区分开。

**Scope 的入口规则**：只要引入新的局部变量，就应新建 Scope。只要是一个定理/定义/引理，就应新建 Scope。变量的绑定（`scope-bind` / `quantity-bind`）必须在 Scope 创建的同一阶段完成，不得延后。

**退出规则**：跨过出口边的 Statement 带出（带 `truth_context`）；未跨出口边的被锁在 Scope 内。`truth_context` 只一个指针，指向最近依赖的 Scope。

Context switching（"在这个证明中，用 f 表示..."）由 `scope-bind` 边解决，不需要新机制。

**父 Scope 可见性**：父 Scope 中声明的变量（Entity/variable）和实体（Entity/object）在子 Scope 中可见。子 Scope 内的边可以引用父 Scope 的节点（如 `instance_of`、`has_property` 等构造边）。这意味着边的 `scope_id` 可以和 source/target 的所属 Scope 不同。

```
父 Scope "极大值定义" { f(x), O, x₀, x, … }
  │
  └── 子 Scope "费马定理" { … }
        └── 边: x₀ --[instance_of]--> 极值点  (x₀ 来自父 Scope)
```

**子 Scope 出口可见性**：子 Scope 退出时，其 conclusion Statement 或 define 产出的 Entity 可以**暴露给兄弟 Scope**。在 Scope 之间搭边时（如 `special_case`），以暴露的节点作为边的端点。未暴露的中间步骤被锁在 Scope 内。

```
Scope "费马定理" 暴露: "f'(x₀)=0" (conclusion Statement)
Scope "罗尔定理" 暴露: "∃x₀: f'(x₀)=0" (conclusion Statement)

"∃x₀: f'(x₀)=0" --[special_case]--> "f'(x₀)=0"
  (端点是被 Scope 暴露的 conclusion Statement，而非 Scope 本身。
   罗尔的假设能推出费马的假设 → 罗尔更强)
```

#### 3.2.1 Scope 与实体同一性（关键规则）

**同名变量是否为同一 Entity，只看 Scope 的父子关系。没有其他判断标准。**

这是 Scope 模型最容易被误解的地方。以下是常见疑问和判定：

**疑问 1**："定理 1 里有个 `f`，定理 2 里也有个 `f`，它们是同一个 Entity 吗？"

回答：**看 Scope**。
- 如果定理 1 和定理 2 是两个独立 Scope（无父子关系），`f₁` 和 `f₂` 是**两个不同的 Entity**。哪怕它们标签相同、类型相同、甚至语义上读者认为"这显然是同一个 f"——在图中就是两个节点。这正是 Scope 设计的目的：每个 Scope 是一个独立命名空间。
- 如果定理 2 的 Scope 是定理 1 Scope 的子 Scope（定理 2 依赖定理 1 的条件），那么定理 1 中定义的 `f` 在定理 2 中**可见**——不需要新建 Entity，直接引用父 Scope 的 `f` 即可。

**疑问 2**："那不就没有全局唯一实体了吗？比如 ℝ 出现在 50 篇文章里，难道要有 50 个 ℝ 节点？"

回答：ℝ 这种**跨文章的共享实体**，在 MVP 阶段通过 Reference 节点处理（见 1.3 节）。同一篇文章内，如果多个独立 Scope 都用到 ℝ，且它们的父 Scope（如文章根 Scope）声明了 ℝ，则它们都引用那个 ℝ。跨文章的全局唯一性由后续的 Reference 解析步骤（人工或自动化）完成，不在 LLM 翻译阶段强求。

**疑问 3**："怎么确定一个变量是在哪个 Scope 声明的？"

回答：遵循编程语言的词法作用域规则。出现"设/令/记/定义/∀/∃"的 Scope 就是该变量的声明 Scope。如果一句话同时引入变量并做出断言（"设函数 f 在点 x₀ 处可导，则..."），变量在所在 Scope 的 assumption 子句中声明，在 conclusion 子句中被使用。

**疑问 4**："如果 LLM 翻译时搞错了 Scope 嵌套怎么办？"

回答：Scope 的划分和嵌套是 Pass 1 的全部职责。Pass 2（Statement 拆分）和 Pass 3（Entity 展开）**不得新建 Scope**——如果 Pass 2/3 发现需要新建 Scope，说明 Pass 1 失败，应返回 Pass 1 重做。这既是质量门，也是调试分界线。

---

## 四、语法糖

### 4.1 定语堆叠

多条 `has_property` 边在折叠态聚合成节点旁的嵌套修饰块（Scratch 风格）：

```
┌────────────────────┐
│  ℝ                 │
│ ┌────────────────┐ │
│ │ 完备            │ │
│ │ 阿基米德        │ │
│ │ ...(2项)        │ │  ← 只显示前二，点击展开全部
│ └────────────────┘ │
└────────────────────┘
```

### 4.2 switch-case

折叠态显示为决策树，展开后逐 case 进入 Scope。

### 4.3 逻辑边折叠

`implies` / `equivalent` 在折叠态画作虚线箭头表示可以展开，和一般的命题推导做区分，展开后显示隐式 Statement 及证明。

---

### 4.4 关系模型（Relation 与 RelationApplication）

关系不是边——它是 Entity/relation 模板。关系判定是一个 Statement。

```
[Entity a] ──(arg_left)──→ [RelationApplication] ←──(arg_right)── [Entity b]
                                  │
                            (uses_template)
                                  │
                                  ▼
                          [Entity : 关系 "<"]
                         (持有传递性、反对称性等属性)
```

**三层结构**：

| 层 | 是什么 | 存储 |
|----|--------|------|
| 关系模板 | Entity/relation。定义名称、元数、本身性质（自反性、对称性等） | nodes |
| 关系判定实例 | Statement/relation_application。承载 a、b 作为参数，truth_value，scope_id | nodes |
| 折叠态边 | a --[<]--> b。语法糖，在 UI 的可选边列表中 | edges（展开后可见内部三层） |

**用户双击边**：系统展开，隐藏的 RelationApplication Statement 浮现，展示：
- 关联的 Entity/relation 模板及其性质
- truth_context
- 证明链（如"为什么 2<3 为真"依赖自然数序公理）

**"=" 号处理**：
- 赋值/构造类：用 `define` 或 `compose` 边解决（"定义 a_n = ..."）
- 运算产出类：用 OperationApplication + `result` 边。如 `2+3` → `5` 是运算的必然产出，不是需要询问的关系判定
- 关系判定类：用 RelationApplication 解决（"f(x) = 0" —— 这里 = 是需要判定真假的）
- 结构替换类：用 `substitute`边解决，其本身可以算一个语法糖（如果用户在其背后加了证明的话），如果没有证明就只是一条边。

### 4.5 运算模型（OperationApplication）

运算和关系共用 arg_n + uses_template 结构。唯一区别：运算的产出是一个 Entity（通过 `result` 边），关系的产出是一个 truth_value。

```
2 ──(arg_1)──→ [OperationApplication] ←──(arg_2)── 3
                    │
              ┌─────┴──────┐
         (uses_template)  (result)
              │               │
              ▼               ▼
      [Entity/operation: +]  [Entity: 5]
```

`∃!`（存在唯一）是语法糖：用户点击后展开为 `∃y` + `∀y₁∀y₂(P(y₁)∧P(y₂) → y₁=y₂)` 的完整子图。

### 4.6 description 的地位

description附着在一个节点上，但本身不是本位的——它是**定义/定理展开结构的自然语言翻译**。本位的永远是图结构（节点+边）。description 用于：
- 帮助用户在折叠态快速理解节点含义
- 当图结构过于复杂时提供可读摘要
- 搜索索引
- 把图结构翻译为自然语言，同时也可以（一定程度上）反过来把自然语言翻译为图结构（这里目前想到了这几个难点：怎么识别引用的定理、怎么识别代词指代）。这一步是大幅扩充整个图结构的关键。

比如，结合律的完整定义不在 description 里——它在 `Statement/definition "结合律"` 展开后的子图里（∀a,b,c, (ab)c = a(bc)）。

---

## 五、核心设计原则

1. **边是本位**：边 = 谓词 + truth_value。Statement = 多条边的封装（语法糖）。特殊 Statement（单谓词连两大 Entity）可折叠为语法糖边
2. **一切皆可展开**：折叠 = 语法糖，展开 = 内部结构
3. **构造 != 逻辑**：构造边（怎么造）和逻辑边（真假推理）正交
4. **关系是模板，判定是实例**：Entity/relation 定义模板（名称+性质），Statement/relation_application 承载具体判定，折叠态画成 a--[<]-->b 语法糖边
5. **属性有归属**：property 是独立 Entity，通过 has_property 边连接——"+ 有交换律"而非"交换律是标签"
6. **Scope = 纯局部**：truth_value 相对当前 Scope 根假设的局部值，truth_context 只一个指针
7. **代入公理**："a=b 则 P(a) = P(b)" 作为不可删除的公理
8. **穷举性由用户保证**：is_exhaustive=true 需附证明，无证明则警告

---

## 六、可视化

| 模型元素 | 折叠态 | 展开态 |
|----------|--------|--------|
| has_property | 定语堆叠块 | property Entity 详情 |
| compose/is_a/define | 实线箭头 | 构造子图 |
| arg_left/arg_right/uses_template | （内部边，折叠态不可见） | RelationApplication 内部结构 |
| <, =, ⊆ … (关系判定) | 折叠为 a--[<]-->b 语法糖边 | 展开为 RelationApplication + 内部边 |
| implies/equivalent | 虚线箭头 | 证明子图 |
| case | 分叉箭头 | 对应 Scope |

- Entity: 实色边框（object=蓝, operation=绿, relation=黄, property=红）
- Statement: 浅色底, 框样式表 subtype（实线=axiom, 双线=definition, 点线=theorem, 虚线=conjecture, ?=assumption）
- Scope: 浅灰底, 边框标注 kind
- 可展开节点: ⊕ 徽标

---

## 七、术语退役表

| 旧名 | 新名 | 说明 |
|------|------|------|
| I 节点 | Entity | 按 subtype 细分 |
| T 节点 | Statement | 按 subtype 细分；公理不可删 |
| P边 | `has_property` (Construction) | |
| C边 | `compose` (Construction) | 多源同标签 |
| E节点 | Statement/counterexample_claim | |
| M标签 | Idea + `uses_idea` (Logic) | |
| G节点 | 不再存在 | 所有节点通过 group_members 展开 |
| truth_value | 增加 `conditional` | 附 `truth_context` |
| bind 边 | `scope-bind` + `quantity-bind`（均在 link 下） | 拆开 let 绑定和量词约束两种语义 |
| bind category | `link` category | 不承载 truth_value，粘合与绑定 |
| proposition | 不独立存在 | 任何命题内部都是 assumption → implies → conclusion |
| property 环境 | 分为两层：Statement 层（断言"X 有性质 P"）和 Entity/property 层（P 本身） | Statement 展开后揭示内部的 has_property 边 |

---

## 八、当前已实现

- [x] 基础 CRUD: nodes, edges, proofs, properties, domains, math_ideas
- [x] 文件浏览器式导航: viewStack, navigateTo/navigateBack, 面包屑
- [x] 种子数据: 完备性 G 封装 6 个等价定理
- [x] 多证明支持
- [x] 741 篇小时百科（wuliwiki）数学文章 HTML 抓取

## 九、待实现（按优先级）

1. **LLM 翻译器（Noble Boole）**：三层 Pass 流水线将 wuliwiki HTML → MathTree 图结构
   - Pass 1: Scope 划分 + Scope 间长距离边 + 变量绑定
   - Pass 2: Statement 拆分 + Statement 间边（implies, equivalent, case, hint）
   - Pass 3: Entity 展开（边本位——has_property, define, scope-bind, quantity-bind 等）
2. **预处理脚本（重写）**：从原始 HTML 清洗文本、分段、统一 environment 类型映射
3. **Schema 迁移**：DB schema 升级到 link category + 新 subtype
4. **通用展开**：移除 G 类型，group_members 对所有节点开放
5. **Scope 闭环**：出口时自动生成 derived_by_scope_exit 边
6. **Condition + case**：分叉节点 + is_exhaustive 校验
7. **定语堆叠**：has_property 边的折叠态语法糖
8. **逻辑边展开**：implies/equivalent 展开为 Statement 子图
9. **Reference 跨文章解析**：拓扑排序 + 人工补全

---

## 十、常见疑问与设计决策记录

详见 `LESSONS.md`。包含：架构决策（三层 Pass、LaTeX 不拆、边分层）、Schema 决策（bind 拆分、property 两层、example/exercise、remark、conditional）、预处理踩坑（6 个具体 bug + 修复）、LLM Pass 1 踩坑（phantom child_scopes、max_tokens、自动重试）、实验流程（Phase A-E）、Pass 1 批量统计。
