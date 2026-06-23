# Noble Boole — 踩坑经验与设计决策

本文档汇总 MathTree LLM 翻译器（Noble Boole）开发过程中遇到的关键问题、设计决策和调试经验。编写新 prompt 或修改流水线前应阅读本文。

---

## 一、架构决策

### 1.1 为什么分三层 Pass

- 认知负荷可控：Pass 1（Scope）不需要知道 Entity subtype
- 调试分离：Scope 问题只改 Pass 1 prompt，不影响其他
- Token 节省：每层只需 CLAUDE.md 子集
- 边本位递进：粗（Scope 间）→ 中（Statement 间）→ 细（Entity 间）

### 1.2 为什么 LaTeX 永远不拆开

三层 Pass 都需要公式语义：Pass 1 识别变量声明、Pass 2 判断等式方向、Pass 3 提取 Entity。占位符 `__M0__` 剥夺语义，token 节省微不足道。

### 1.3 边分层

| 层 | 边类型 | 连接什么 |
|----|--------|----------|
| Statement 层（Pass 2） | implies, equivalent, special_case, counterexample_of, uses_idea, case, hint | Statement ↔ Statement |
| Entity 层（Pass 3） | has_property, define, is_a, instance_of, compose, depend_on, substitute, scope-bind, quantity-bind | Entity ↔ Entity 或 Statement ↔ Entity |

`implies` 不能连两个 Entity。逻辑推出是命题间的。

### 1.4 Scope 不是节点

Scope 是命名空间容器。implies、equivalent 等逻辑边的端点不能是 Scope。Scope 间关系放在 `scope_relations` 表中，由 Pass 2 落地为连接具体 Statement 的边。

### 1.5 同名变量是否为同一 Entity

只看 Scope 父子关系。两个独立 Scope 里的 `f` 是两个不同 Entity。父 Scope 的变量在子 Scope 中可见。

### 1.6 跨文章引用：MVP 放弃

wuliwiki 引用信息不完整，LLM 翻译时不知道其他文章有什么实体。Reference 节点后续由人工补全。

### 1.7 命题正确性 ≠ 有显式证明

implies 边不需要 proof 字段。数学事实与文章是否提供了证明文字正交。

---

## 二、Schema 决策

### 2.1 bind 拆分为 scope-bind + quantity-bind

原 `bind` 混用 let 赋值（"令 f(x)=x²"）和量词约束（"∀ε>0"）。拆开后前者属于 `link` category（不承载 truth_value），后者在 Scope 语境中区分。

### 2.2 property：两层结构

底层 Entity/property（"连续性"） + 上层 Statement（断言"f 有连续性"），通过 `has_property` 边连接。

### 2.3 example/exercise：本质是命题

内部结构 = assumption → implies → conclusion。subtype 只标记教学角色。

### 2.4 remark：粘合型 Statement

几何意义、图解、脚注统归 `remark`，通过 `hint` 边（link category）粘合到被注释节点。

### 2.5 conditional ≠ 一般命题条件

`conditional` scope_kind 仅用于猜想式假设（"假设黎曼猜想成立"），真值存疑。定理前提用 `description` + 内部 `assumption`。

---

## 三、预处理踩坑（build_index.py）

### 3.1 第一个 h2 前的内容丢失

**现象**：AiryF 的定义（"艾里函数是微分方程 y''-xy=0"）全丢。
**原因**：`_find_blocks_in_container` 在遇到第一个标题前不创建 block。
**影响**：541/741 篇。
**修复**：第一个 h2 前的内容作为 preamble block（空标题）。

### 3.2 独立 `<a>` 链接丢失

**现象**：文内超链接如 "Gamma 函数""式 1""$\delta$ 函数列" 消失。
**原因**：`<a>` 标签直接作为 `<main>` 子元素，不在 `<p>` 内，代码未处理。
**影响**：332 篇，1357 个链接。
**修复**：提取为 `links/*.json` 侧车文件，正文中标记 `[链接 L0]`。

### 3.3 独立 `<b>` 术语丢失

**现象**：ODE1 的 "齐次的（homogeneous）""非齐次的" 等术语消失，句子断裂。
**原因**：`<b>` 是 `<main>` 直接子元素，未被任何分支捕获。
**修复**：增加 `<b>` 标签处理分支。

### 3.4 面板文章不分 block

**现象**：EuVS 的 17 个环境面板（定义/定理/例）挤在 1 个 block 里。
**原因**：面板内容只 `current_parts.append`，不触发新 block。
**修复**：面板 `<h3><b>` 中识别到环境关键词时创建新 block。

### 3.5 面板间正文丢掉

**现象**：面板后的证明、解释段落全部丢失（EuVS 从 103 子句降到 51）。
**原因**：面板处理完后立即 flush，面板间的 `<p>` 落入无主状态。
**修复**：面板后的内容归入面板 block，直到下一个面板/标题才切。

### 3.6 目录/章节层级纯占 token

**修复**：删掉 indexed TXT 开头的 "章节层级" 部分。

---

## 四、LLM Pass 1 踩坑

### 4.1 phantom child_scopes 撑爆 JSON

**现象**：CptRe 2812 个 `s_ex2_letN`、Delta 4200+ 个 `s_exN`，JSON 50K chars 截断。
**原因**：LLM 在 `child_scopes` 中列出大量不存在的 scope_id。
**修复**：
- Prompt：`child_scopes` 必须一一对应，总数 3-30 个 Scope，每个 child_scopes 0-10 个
- 后处理：`len(children) > 50` 或引用不存在 ID → 裁剪
- 此问题非确定性——同一篇 Delta 第一次失败第二次成功

### 4.2 root scope 没有 clause_range

**现象**：校验报错 `scope root: missing clause_range`。
**决策**：root 覆盖全文，不需要范围。校验豁免 `parent_scope is null`。

### 4.3 section 级 Scope 漏填 clause_range

**现象**：AiryF、TrTnsr 等 21 篇有 section scope 缺范围。
**修复**：Prompt 强调 "每个非 root 的 Scope 必须填写 clause_range"。

### 4.4 max_tokens 不够

**现象**：Albert 的 JSON 被截断（原始 4096 tokens 不够，提高到 24576 才够）。

### 4.5 JSON mode 输出 markdown 包裹

**现象**：DeepSeek JSON mode 偶尔输出 \`\`\`json...\`\`\` 而非纯 JSON。
**修复**：解析失败时尝试从 markdown 代码块提取。

### 4.6 自动重试策略

**规则**：每篇文章最多尝试 3 次。间停 3/6/9 秒。3 次均失败则记录，继续下一篇。

### 4.7 few-shot 示例污染

**现象**：CoDer、ConFom、UQ、affcon 等文章的 Scope label 出现"费马定理""罗尔定理""常值 vs 非常值""极值点 c"——它们跟费马罗尔毫无关系。
**原因**：Pass 1 prompt 的费马→罗尔示例过于具体，LLM 将其作为模板直接套用。
**影响**：6 篇，31 处污染。
**修复**：在示例前加醒目警告——"以上示例仅供参考，不要照搬 label/scope_id/Scope 划分"。重跑后污染清除。
**教训**：few-shot 示例必须加反照搬声明。更好的做法是用抽象示例而非具体定理名。

### 4.8 unresolved 几乎全是源材料"未完成"

4% 文章的 unresolved 字段是 LLM 诚实汇报源文章自身的未完成标记，非翻译错误。这是正确行为。

---

## 五、实验流程

### Phase A: 示例制作
1. 选取 3-5 篇代表性文章（覆盖：纯定义、定理+证明、纯例题、嵌套 Scope、非标准结构）
2. 人工制作 Gold Standard
3. 成为 prompt 的 few-shot 素材和校验基准

### Phase B: Prompt 编写与单篇测试
1. 根据 Gold Standard 反推 prompt
2. 用不同文章测试
3. 人工标注错误类型

### Phase C: 迭代优化
1. 每轮只改一件事（prompt / schema / 预处理）
2. prompt 不足以修复 → 检查 CLAUDE.md schema → 回改 CLAUDE.md
3. 重复直到准确率达标

### Phase D: 批量处理
1. 全量按 Pass 1→2→3 顺序跑
2. 失败自动重试 3 次
3. 记录 pass/fail 和 token 消耗

### Phase E: 质量抽检
1. 随机抽样 5% 人工审查
2. 系统性偏差 → 回到 Phase C

---

## 六、Pass 1 批量统计

| 指标 | 值 |
|------|-----|
| 总文章 | 741 |
| 完全通过 | 740 |
| 有 unresolved | 30 (4%) |
| 有 validation error | 2 |
| 中位 Scope 数 | 11 |
| 有 relations 的文章 | 540 (73%) |
| 总 relations | 1896 |
| reductio 识别 | 86 |
| cases 识别 | 62 |
| conditional 识别 | 6 |
