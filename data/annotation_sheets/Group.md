# 群 — 语义标注

文章 `Group.json` | Part: 13_代数基础 | 环境数: 20
说明: 代数基础 — 群的定义、定理、例题、习题

## 脚注
- [1] $n$ 个桶各里装了 1 个小球，1 号桶有 $n$ 种装球的可能性，2 号桶因此还剩下 $n-1$ 中可能性，以此类推，这 $n$ 个桶一共有 $n\times(n-1)\times\cdots\times1$ 种装球的可能性，每种可能性对应一个从初始状态而来的置换方式。因此，置换的数量一共有 $n\times(n-1)\times\cdots\times1=n!$ 种
- [2] 提示：用 $x^{-1}$ 去参与运算试试

---
## E1  definition — 定义 1

```
定义 1　群
　　
一个群 $(G, \cdot)$ 是在集合 $G$ 上赋予了一个二元运算 $\cdot$ 的结构，该运算满足以下要求：

 封闭性（closure）：$\forall x, y\in G, x\cdot y\in G$，即任意 $G$ 中元素 $x$,$y$ 满足 $x\cdot y$ 仍是 $G$ 中元素
 结合性（associativity）：$\forall x, y, z\in G, x\cdot(y\cdot z)=(x\cdot y)\cdot z$
 单位元（identity element）存在性：$\exists e\in G, \forall x\in G, e\cdot x=x\cdot e=x$
 逆元（inverse element）存在性：$\forall x\in G, \exists y\in G, x\cdot y=y\cdot x=e$。通常我们会把这样的 $y$ 称作 $x$ 的逆元，并记为 $x^{-1}$
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 1　群 |
| 1 | assertion | UCL | 一个群 $(G, \cdot)$ 是在集合 $G$ 上赋予了一个二元运算 $\cdot$ 的结构，该运算满足以下要求： |
| 2 | assertion | UCL | 封闭性（closure）：$\forall x, y\in G, x\cdot y\in G$ |
| 3 | conclusion | — | 即任意 $G$ 中元素 $x$,$y$ 满足 $x\cdot y$ 仍是 $G$ 中元素 |
| 4 | assertion | UCL | 结合性（associativity）：$\forall x, y, z\in G, x\cdot(y\cdot z)=(x\cdot y)\cdot z$ |
| 5 | quantified | — | 单位元（identity element）存在性：$\exists e\in G, \forall x\in G, e\cdot x=x\cdot e=x$ |
| 6 | quantified | — | 逆元（inverse element）存在性：$\forall x\in G, \exists y\in G, x\cdot y=y\cdot x=e$ |
| 7 | definition | — | 通常我们会把这样的 $y$ 称作 $x$ 的逆元，并记为 $x^{-1}$ |

**⚠ 悬置**:
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s2: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 1　群
[  ]  s1  一个群 $(G, \cdot)$ 是在集合 $G$ 上赋予了一个二元运算 $\cdot$ 的结构，该运算满足以下要求：
[  ]  s2  封闭性（closure）：$\forall x, y\in G, x\cdot y\in G$
[  ]  s3  即任意 $G$ 中元素 $x$,$y$ 满足 $x\cdot y$ 仍是 $G$ 中元素
[  ]  s4  结合性（associativity）：$\forall x, y, z\in G, x\cdot(y\cdot z)=(x\cdot y)\cdot z$
[  ]  s5  单位元（identity element）存在性：$\exists e\in G, \forall x\in G, e\cdot x=x\cdot e=x$
[  ]  s6  逆元（inverse element）存在性：$\forall x\in G, \exists y\in G, x\cdot y=y\cdot x=e$
[  ]  s7  通常我们会把这样的 $y$ 称作 $x$ 的逆元，并记为 $x^{-1}$

# 边:

# Scope:
```

---
## E2  theorem — 定理 1

```
定理 1　
　　

 $O(a)=O(a^{-1})$。
 设任意 $g\in G$，有 $O(gag^{-1})=O(a)$。
 若 $O(a)=n$，则 $O(a^r)=\frac{n}{(n,r)}$，$(n,r)$ 表示最大公因子。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 定理 1 |
| 1 | assertion | UCL | $O(a)=O(a^{-1})$。 |
| 2 | assumption | — | 设任意 $g\in G$，有 $O(gag^{-1})=O(a)$。 |
| 3 | assumption | — | 若 $O(a)=n$ |
| 4 | conclusion | — | 则 $O(a^r)=\frac{n}{(n,r)}$，$(n,r)$ 表示最大公因子 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("$O(a^r)=\frac{n}{(n,r)}$，$(n,r)$…", let_bind) { n3, n4 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定理 1
[  ]  s1  $O(a)=O(a^{-1})$。
[  ]  s2  设任意 $g\in G$，有 $O(gag^{-1})=O(a)$。
[  ]  s3  若 $O(a)=n$
[  ]  s4  则 $O(a^r)=\frac{n}{(n,r)}$，$(n,r)$ 表示最大公因子

# 边:

# Scope:
```

---
## E3  exercise — 习题 1

```
习题 1　
　　
证明共轭子群定义 6  的阶和原群相同。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 习题 1 |
| 1 | definition | — | 证明共轭子群定义 6  的阶和原群相同 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  习题 1
[  ]  s1  证明共轭子群定义 6  的阶和原群相同

# 边:

# Scope:
```

---
## E4  exercise — 习题 2

```
习题 2　二元群
　　
定义一个只含有两个元素的集合，记为 $\{0, 1\}$。在这个集合上定义运算 “$+$”，由于只有四种运算方式，所以可以通过列举出每一个运算的结果来定义这个运算：

\begin{equation}
0+0=0~, \qquad 0+1=1~, \qquad 1+0=1~, \qquad 1+1=0~.
\end{equation}

 请用一个 $2\times2$ 的表格表示运算规则
 请根据定义 1  验证这个二元集合配上运算 $+$ 构成一个群
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 习题 2　二元群 |
| 1 | definition | — | 定义一个只含有两个元素的集合，记为 $\{0, 1\}$ |
| 2 | definition | — | 在这个集合上定义运算 “$+$”，由于只有四种运算方式 |
| 3 | definition | — | 所以可以通过列举出每一个运算的结果来定义这个运算： |
| 4 | assertion | DSP | \begin{equation}
0+0=0~, \qquad 0+1=1~, \qquad 1+0=1~, \qquad 1+1=0~.
\end{equation} |
| 5 | assertion | UCL | 请用一个 $2\times2$ 的表格表示运算规则 |
| 6 | definition | — | 请根据定义 1  验证这个二元集合配上运算 $+$ 构成一个群 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s5: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  习题 2　二元群
[  ]  s1  定义一个只含有两个元素的集合，记为 $\{0, 1\}$
[  ]  s2  在这个集合上定义运算 “$+$”，由于只有四种运算方式
[  ]  s3  所以可以通过列举出每一个运算的结果来定义这个运算：
[  ]  s4  \begin{equation}
0+0=0~, \qquad 0+1=1~, \qquad 1+0=1~, \qquad 1+1=0~.
\end{equation}
[  ]  s5  请用一个 $2\times2$ 的表格表示运算规则
[  ]  s6  请根据定义 1  验证这个二元集合配上运算 $+$ 构成一个群

# 边:

# Scope:
```

---
## E5  example — 例 1

```
例 1　整数加法群
　　
所有整数的集合 $\mathbb Z$，配合通常的整数加法运算构成一个群。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 1　整数加法群 |
| 1 | assertion | UCL | 所有整数的集合 $\mathbb Z$，配合通常的整数加法运算构成一个群 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 1　整数加法群
[  ]  s1  所有整数的集合 $\mathbb Z$，配合通常的整数加法运算构成一个群

# 边:

# Scope:
```

---
## E6  example — 例 2

```
例 2　$n$ 元循环群
　　
取一个由 $n$ 个元素组成的集合 $G$，由于集合元素命名的任意性，不妨把 $G$ 记为 $\{0, 1, \cdots n-1\}$，定义运算为模 $n$ 的加法，即在一个有 $n$ 个整点的钟表上的加法（见 “整数”）。那么这个运算构成 $G$ 上的一个群运算，所构成的群 $G$ 称为 $n$ 元循环群（n-element cyclic group），通常记为 $C_n$ 或者 $\mathbb{Z}/n\mathbb{Z}$。

　　
命名为 $C_n$ 是取 “cyclic” 的含义，而命名为 $\mathbb{Z}/n\mathbb{Z}$ 是为了说明循环群是整数加法群 $\mathbb{Z}$ 的商群（例 1 ），而商群是将来会提到的重要概念。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 2　$n$ 元循环群 |
| 1 | definition | — | 取一个由 $n$ 个元素组成的集合 $G$，由于集合元素命名的任意性，不妨把 $G$ 记为 $\{0, 1, \cdots n-1\}$，定义运算为模 $n$ 的加法 |
| 2 | conclusion | — | 即在一个有 $n$ 个整点的钟表上的加法（见 “整数”） |
| 3 | definition | — | 那么这个运算构成 $G$ 上的一个群运算，所构成的群 $G$ 称为 $n$ 元循环群（n-element cyclic group），通常记为 $C_n$ 或者 $\mathbb{Z}/n\mathbb{Z}$。 |
| 4 | assertion | UCL | 命名为 $C_n$ 是取 “cyclic” 的含义，而命名为 $\mathbb{Z}/n\mathbb{Z}$ 是为了说明循环群是整数加法群 $\mathbb{Z}$ 的商群（例 1 ），而商群是将来会提到的重要概念 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 2　$n$ 元循环群
[  ]  s1  取一个由 $n$ 个元素组成的集合 $G$，由于集合元素命名的任意性，不妨把 $G$ 记为 $\{0, 1, \cdots n-1\}$，定义运算为模 $n$ 的加法
[  ]  s2  即在一个有 $n$ 个整点的钟表上的加法（见 “整数”）
[  ]  s3  那么这个运算构成 $G$ 上的一个群运算，所构成的群 $G$ 称为 $n$ 元循环群（n-element cyclic group），通常记为 $C_n$ 或者 $\mathbb{Z}/n\mathbb{Z}$。
[  ]  s4  命名为 $C_n$ 是取 “cyclic” 的含义，而命名为 $\mathbb{Z}/n\mathbb{Z}$ 是为了说明循环群是整数加法群 $\mathbb{Z}$ 的商群（例 1 ），而商群是将来会提到的重要概念

# 边:

# Scope:
```

---
## E7  example — 例 3

```
例 3　$n$ 元置换群
　　
首先给定一个 $n$ 元集合，记作 $K=\{1,2, \cdots, n\}$，并将 $K$ 中的元素按现有的顺序编号。把 $K$ 看作是 $n$ 个桶中分别装了 1 个写着编号的球，初始状态下球的编号和桶的编号一致。我们可以把球从桶里面拿出来并进行任意的置换，保持每个桶里还是只有一个球，但是球的编号不一定和桶的编号一致了。每一个置换可以详细描述为 “把 1 号桶的球和 2 号桶的球交换”，“把 1 号桶的球放入 3 号桶，3 号桶的放入 4 号桶，4 号桶的放入 1 号桶” 等等。

　　
我们用全体 “置换” 动作，即所有 $K$ 到自身的一一映射，来作为元素，构成一个集合，称作 $n$ 个元素的置换集合（$n$ 元置换集），记为 $S_n$。$S_n$ 一共有 $n!$ 个元素1。从原始状态进行任意置换，所得到的结果状态和置换是一一对应的，所以我们也可以用 “从原始状态进行置换 $f$ 所得的结果” 来表示置换 $f$ 本身。

　　
置换之间可以定义一个运算 “$\circ$”，被称为置换间的复合，它是这样定义的：如果 $f$ 和 $g$ 是两
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 3　$n$ 元置换群 |
| 1 | assertion | UCL | 首先给定一个 $n$ 元集合 |
| 2 | definition | — | 记作 $K=\{1,2, \cdots, n\}$，并将 $K$ 中的元素按现有的顺序编号 |
| 3 | assertion | UCL | 把 $K$ 看作是 $n$ 个桶中分别装了 1 个写着编号的球，初始状态下球的编号和桶的编号一致 |
| 4 | quantified | — | 我们可以把球从桶里面拿出来并进行任意的置换，保持每个桶里还是只有一个球，但是球的编号不一定和桶的编号一致了 |
| 5 | assertion | UCL | 每一个置换可以详细描述为 “把 1 号桶的球和 2 号桶的球交换”，“把 1 号桶的球放入 3 号桶，3 号桶的放入 4 号桶，4 号桶的放入 1 号桶” 等等。 |
| 6 | assertion | UCL | 我们用全体 “置换” 动作 |
| 7 | conclusion | — | 即所有 $K$ 到自身的一一映射，来作为元素，构成一个集合 |
| 8 | definition | — | 称作 $n$ 个元素的置换集合（$n$ 元置换集），记为 $S_n$ |
| 9 | assertion | UCL | $S_n$ 一共有 $n!$ 个元素1 |
| 10 | quantified | — | 从原始状态进行任意置换，所得到的结果状态和置换是一一对应的 |
| 11 | conclusion | — | 所以我们也可以用 “从原始状态进行置换 $f$ 所得的结果” 来表示置换 $f$ 本身。 |
| 12 | definition | — | 置换之间可以定义一个运算 “$\circ$”，被称为置换间的复合，它是这样定义的：如果 $f$ 和 $g$ 是两个置换 |
| 13 | conclusion | — | 那么 $g\circ f$ 就是先进行 $f$ 置换，再进行 $g$ 置换 |
| 14 | assertion | UCL | 注意先后次序是从右到左进行的。 |
| 15 | assertion | UCL | 我们也可以这样来理解一个置换：原始状态下，$n$ 号桶中的小球为 $n$ |
| 16 | assertion | UCL | 进行一次 $f$ 置换后，$n$ 号桶中的小球就变成了 $f(n)$，再进行一次 $g$ 置换 |
| 17 | conclusion | — | 那么 $n$ 号桶中现在装的小球就变为 $g(f(n))$ |
| 18 | assertion | UCL | 这个过程也可以看成是进行了一次 $g\circ f$ 运算，让 $n$ 号桶中的小球变成 $g\circ f(n)$。 |
| 19 | assertion | UCL | 现在我们有了一个由置换组成的集合以及置换之间的运算，我们来验证在这个运算下，所有的置换构成一个群： |
| 20 | quantified | — | 显然，任意两个置换的复合还是一个置换 |
| 21 | conclusion | — | 因此该运算是封闭的。 |
| 22 | assertion | UCL | 映射的符合满足结合律可以通过带入任何一个 $K$ 中的数字来验证。 |
| 23 | assertion | UCL | 单位元素是恒等映射 |
| 24 | conclusion | — | 即保持所有数字不动的映射。 |
| 25 | quantified | — | 任意一个置换 $f$ 由于是满射 |
| 26 | conclusion | — | 所以对于每一个 $K$ 中的数字 $i$,都存在原像 $j$ 满足 $f(j)=i$，又因为 $f$ 是单射，所以原像唯一 |
| 27 | definition | — | 定义 $f^{-1}:K\rightarrow K$ 把每一个 $i$ 对应到它的唯一的原像 |
| 28 | definition | — | 可以验证，这样定义了 $f$ 的逆元。 |
| 29 | conclusion | — | 因此，$(S_n, \circ)$ 是一个群 |
| 30 | condition | — | 注意当 $n>2$ 时 $S_n$ 是不交换（非阿贝尔）的 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s5: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s6: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s9: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s14: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s15: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s16: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s18: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s19: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s22: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s23: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 3　$n$ 元置换群
[  ]  s1  首先给定一个 $n$ 元集合
[  ]  s2  记作 $K=\{1,2, \cdots, n\}$，并将 $K$ 中的元素按现有的顺序编号
[  ]  s3  把 $K$ 看作是 $n$ 个桶中分别装了 1 个写着编号的球，初始状态下球的编号和桶的编号一致
[  ]  s4  我们可以把球从桶里面拿出来并进行任意的置换，保持每个桶里还是只有一个球，但是球的编号不一定和桶的编号一致了
[  ]  s5  每一个置换可以详细描述为 “把 1 号桶的球和 2 号桶的球交换”，“把 1 号桶的球放入 3 号桶，3 号桶的放入 4 号桶，4 号桶的放入 1 号桶” 等等。
[  ]  s6  我们用全体 “置换” 动作
[  ]  s7  即所有 $K$ 到自身的一一映射，来作为元素，构成一个集合
[  ]  s8  称作 $n$ 个元素的置换集合（$n$ 元置换集），记为 $S_n$
[  ]  s9  $S_n$ 一共有 $n!$ 个元素1
[  ]  s10  从原始状态进行任意置换，所得到的结果状态和置换是一一对应的
[  ]  s11  所以我们也可以用 “从原始状态进行置换 $f$ 所得的结果” 来表示置换 $f$ 本身。
[  ]  s12  置换之间可以定义一个运算 “$\circ$”，被称为置换间的复合，它是这样定义的：如果 $f$ 和 $g$ 是两个置换
[  ]  s13  那么 $g\circ f$ 就是先进行 $f$ 置换，再进行 $g$ 置换
[  ]  s14  注意先后次序是从右到左进行的。
[  ]  s15  我们也可以这样来理解一个置换：原始状态下，$n$ 号桶中的小球为 $n$
[  ]  s16  进行一次 $f$ 置换后，$n$ 号桶中的小球就变成了 $f(n)$，再进行一次 $g$ 置换
[  ]  s17  那么 $n$ 号桶中现在装的小球就变为 $g(f(n))$
[  ]  s18  这个过程也可以看成是进行了一次 $g\circ f$ 运算，让 $n$ 号桶中的小球变成 $g\circ f(n)$。
[  ]  s19  现在我们有了一个由置换组成的集合以及置换之间的运算，我们来验证在这个运算下，所有的置换构成一个群：
[  ]  s20  显然，任意两个置换的复合还是一个置换
[  ]  s21  因此该运算是封闭的。
[  ]  s22  映射的符合满足结合律可以通过带入任何一个 $K$ 中的数字来验证。
[  ]  s23  单位元素是恒等映射
[  ]  s24  即保持所有数字不动的映射。
[  ]  s25  任意一个置换 $f$ 由于是满射
[  ]  s26  所以对于每一个 $K$ 中的数字 $i$,都存在原像 $j$ 满足 $f(j)=i$，又因为 $f$ 是单射，所以原像唯一
[  ]  s27  定义 $f^{-1}:K\rightarrow K$ 把每一个 $i$ 对应到它的唯一的原像
[  ]  s28  可以验证，这样定义了 $f$ 的逆元。
[  ]  s29  因此，$(S_n, \circ)$ 是一个群
[  ]  s30  注意当 $n>2$ 时 $S_n$ 是不交换（非阿贝尔）的

# 边:

# Scope:
```

---
## E8  example — 例 4

```
例 4　二面体群
　　
对称性的意思，是在某种变换（通常是翻转变换或者旋转变换）下保持不变的性质。比如说，平面上的一个正方形，绕着几何中心旋转角度为 $\pi/4$（即角度制下的 $90^\circ$）的时候和没有旋转是完全重合的，那么我们就说正方形是关于角度为 $\pi/4$ 的旋转对称的。所有能够使得这个正方形不变的平面变换，比如特定角度的旋转、关于特定轴的翻转，配上变换间的复合运算（即先进行一个变换，再进行另一个），构成了一个 8 阶群（其元素构成为恒等变换，$\pi/4$ 的倍数的旋转和沿着四条对称轴的翻转），称为这个正方形的二面体群（dihedral group）记为 $D_8$。感兴趣的读者可以尝试验证这些变换的复合是封闭的。一般的，对于任意一个正多边形，保持其位置不变的旋转和翻转都会构成的一个群，统称为二面体群，记作 $D_n$。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 4　二面体群 |
| 1 | definition | — | 对称性的意思，是在某种变换（通常是翻转变换或者旋转变换）下保持不变的性质 |
| 2 | assertion | UCL | 比如说，平面上的一个正方形，绕着几何中心旋转角度为 $\pi/4$（即角度制下的 $90^\circ$）的时候和没有旋转是完全重合的 |
| 3 | definition | — | 那么我们就说正方形是关于角度为 $\pi/4$ 的旋转对称的 |
| 4 | definition | — | 所有能够使得这个正方形不变的平面变换，比如特定角度的旋转、关于特定轴的翻转，配上变换间的复合运算（即先进行一个变换，再进行另一个），构成了一个 8 阶群（其元素构成为恒等变换，$\pi/4$ 的倍数的旋转和沿着四条对称轴的翻转） |
| 5 | definition | — | 称为这个正方形的二面体群（dihedral group）记为 $D_8$ |
| 6 | assertion | UCL | 感兴趣的读者可以尝试验证这些变换的复合是封闭的 |
| 7 | definition | — | 一般的，对于任意一个正多边形，保持其位置不变的旋转和翻转都会构成的一个群，统称为二面体群 |
| 8 | definition | — | 记作 $D_n$ |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s2: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s6: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 4　二面体群
[  ]  s1  对称性的意思，是在某种变换（通常是翻转变换或者旋转变换）下保持不变的性质
[  ]  s2  比如说，平面上的一个正方形，绕着几何中心旋转角度为 $\pi/4$（即角度制下的 $90^\circ$）的时候和没有旋转是完全重合的
[  ]  s3  那么我们就说正方形是关于角度为 $\pi/4$ 的旋转对称的
[  ]  s4  所有能够使得这个正方形不变的平面变换，比如特定角度的旋转、关于特定轴的翻转，配上变换间的复合运算（即先进行一个变换，再进行另一个），构成了一个 8 阶群（其元素构成为恒等变换，$\pi/4$ 的倍数的旋转和沿着四条对称轴的翻转）
[  ]  s5  称为这个正方形的二面体群（dihedral group）记为 $D_8$
[  ]  s6  感兴趣的读者可以尝试验证这些变换的复合是封闭的
[  ]  s7  一般的，对于任意一个正多边形，保持其位置不变的旋转和翻转都会构成的一个群，统称为二面体群
[  ]  s8  记作 $D_n$

# 边:

# Scope:
```

---
## E9  exercise — 习题 3

```
习题 3　
　　
证明

 实数集 $\mathbb R$ 以及通常的加法构成一个群。
 实数集 $\mathbb R$ 除去 $0$ 的集合，以及通常的乘法构成一个群。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 习题 3 |
| 1 | assertion | UCL | 证明 |
| 2 | assertion | UCL | 实数集 $\mathbb R$ 以及通常的加法构成一个群。 |
| 3 | assertion | UCL | 实数集 $\mathbb R$ 除去 $0$ 的集合，以及通常的乘法构成一个群 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s2: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  习题 3
[  ]  s1  证明
[  ]  s2  实数集 $\mathbb R$ 以及通常的加法构成一个群。
[  ]  s3  实数集 $\mathbb R$ 除去 $0$ 的集合，以及通常的乘法构成一个群

# 边:

# Scope:
```

---
## E10  example — 例 5

```
例 5　$n$ 阶可逆方阵群
　　
给定域 $F$ 上，全体 $n\times n$ 可逆矩阵构成的集合，配上矩阵乘法就构成了一个非阿贝尔群。

　　
这样的群被简记为 $GL(n, F)$。当不至于混淆时，这里的 $F$ 一般会指全体实数或者全体复数，这时也会把该群简记为 $GL(n)$。多数情况下，$GL(n)$ 也是不交换的。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 5　$n$ 阶可逆方阵群 |
| 1 | assumption | — | 给定域 $F$ 上，全体 $n\times n$ 可逆矩阵构成的集合，配上矩阵乘法就构成了一个非阿贝尔群。 |
| 2 | definition | — | 这样的群被简记为 $GL(n, F)$ |
| 3 | condition | AMB | 当不至于混淆时，这里的 $F$ 一般会指全体实数或者全体复数，这时也会把该群简记为 $GL(n)$ |
| 4 | assertion | UCL | 多数情况下，$GL(n)$ 也是不交换的 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [ambiguous_subtype] s3: 句子同时匹配了 definition, assumption, condition，当前归类为 condition
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("未命名定义", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 5　$n$ 阶可逆方阵群
[  ]  s1  给定域 $F$ 上，全体 $n\times n$ 可逆矩阵构成的集合，配上矩阵乘法就构成了一个非阿贝尔群。
[  ]  s2  这样的群被简记为 $GL(n, F)$
[  ]  s3  当不至于混淆时，这里的 $F$ 一般会指全体实数或者全体复数，这时也会把该群简记为 $GL(n)$
[  ]  s4  多数情况下，$GL(n)$ 也是不交换的

# 边:

# Scope:
```

---
## E11  example — 例 6

```
例 6　映射群
　　
给定两个集合 $S$ 和 $T$，考虑从 $S$ 到 $T$ 的所有映射构成的集合，记为 $M$。映射之间有复合运算，$M$ 配上复合以后，构成一个半群（其准确定义见下）。

　　
$M$ 中全体双射构成的集合，在复合运算下构成群。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 6　映射群 |
| 1 | definition | HAC | 给定两个集合 $S$ 和 $T$，考虑从 $S$ 到 $T$ 的所有映射构成的集合，记为 $M$ |
| 2 | definition | — | 映射之间有复合运算，$M$ 配上复合以后，构成一个半群（其准确定义见下）。 |
| 3 | assertion | UCL | $M$ 中全体双射构成的集合，在复合运算下构成群 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 6　映射群
[  ]  s1  给定两个集合 $S$ 和 $T$，考虑从 $S$ 到 $T$ 的所有映射构成的集合，记为 $M$
[  ]  s2  映射之间有复合运算，$M$ 配上复合以后，构成一个半群（其准确定义见下）。
[  ]  s3  $M$ 中全体双射构成的集合，在复合运算下构成群

# 边:

# Scope:
```

---
## E12  exercise — 习题 4

```
习题 4　
　　
考虑实函数构成的集合 $\mathcal{R}$，记 $\mathcal{R}^*$ 是全体恒不等于零的函数的集合。对于两个实函数 $f(x)$ 和 $g(x)$，定义它们的加法为：$(f+g)(x)=f(x)+g(x)$；定义乘法为：$(f\times g)(x)=f(x) g(x)$。

　　
证明 $(\mathcal{R}, +)$ 和 $(\mathcal{R}^*,\times )$ 都是阿贝尔群。

　　
证明 $(\mathcal{R}^*\cup \{0\}, +)$ 也构成阿贝尔群。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 习题 4 |
| 1 | assumption | — | 考虑实函数构成的集合 $\mathcal{R}$，记 $\mathcal{R}^*$ 是全体恒不等于零的函数的集合 |
| 2 | definition | — | 对于两个实函数 $f(x)$ 和 $g(x)$，定义它们的加法为：$(f+g)(x)=f(x)+g(x)$；定义乘法为：$(f\times g)(x)=f(x) g(x)$。 |
| 3 | assertion | UCL | 证明 $(\mathcal{R}, +)$ 和 $(\mathcal{R}^*,\times )$ 都是阿贝尔群。 |
| 4 | assertion | UCL | 证明 $(\mathcal{R}^*\cup \{0\}, +)$ 也构成阿贝尔群 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("：。定义", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  习题 4
[  ]  s1  考虑实函数构成的集合 $\mathcal{R}$，记 $\mathcal{R}^*$ 是全体恒不等于零的函数的集合
[  ]  s2  对于两个实函数 $f(x)$ 和 $g(x)$，定义它们的加法为：$(f+g)(x)=f(x)+g(x)$；定义乘法为：$(f\times g)(x)=f(x) g(x)$。
[  ]  s3  证明 $(\mathcal{R}, +)$ 和 $(\mathcal{R}^*,\times )$ 都是阿贝尔群。
[  ]  s4  证明 $(\mathcal{R}^*\cup \{0\}, +)$ 也构成阿贝尔群

# 边:

# Scope:
```

---
## E13  definition — 定义 2

```
定义 2　半群
　　
一个半群 $(G, \cdot)$ 是在集合 $G$ 上赋予了一个二元运算 $\cdot$ 的结构，该运算满足封闭性和结合性。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 2　半群 |
| 1 | assertion | UCL | 一个半群 $(G, \cdot)$ 是在集合 $G$ 上赋予了一个二元运算 $\cdot$ 的结构，该运算满足封闭性和结合性 |

**⚠ 悬置**:
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 2　半群
[  ]  s1  一个半群 $(G, \cdot)$ 是在集合 $G$ 上赋予了一个二元运算 $\cdot$ 的结构，该运算满足封闭性和结合性

# 边:

# Scope:
```

---
## E14  definition — 定义 3

```
定义 3　幺半群
　　
若一个半群 $(G,\cdot )$ 满足：$\exists e\in G,\forall x\in G,e\cdot x=x\cdot e=x$，则称其为幺半群，其中 $e$ 称为它的幺元或单位元。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 3　幺半群 |
| 1 | assumption | — | 若一个半群 $(G,\cdot )$ 满足：$\exists e\in G,\forall x\in G,e\cdot x=x\cdot e=x$ |
| 2 | definition | — | 则称其为幺半群，其中 $e$ 称为它的幺元或单位元 |

**🤖 推断器 Scope 参考**:
  - Scope("幺元或单位元定义", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 3　幺半群
[  ]  s1  若一个半群 $(G,\cdot )$ 满足：$\exists e\in G,\forall x\in G,e\cdot x=x\cdot e=x$
[  ]  s2  则称其为幺半群，其中 $e$ 称为它的幺元或单位元

# 边:

# Scope:
```

---
## E15  example — 例 7

```
例 7　自然数加法幺半群
　　
自然数集 $\mathbb N=\{0,1,2,\cdots \}$，配合通常的加法运算构成一个幺半群。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 7　自然数加法幺半群 |
| 1 | assertion | UCL | 自然数集 $\mathbb N=\{0,1,2,\cdots \}$，配合通常的加法运算构成一个幺半群 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 7　自然数加法幺半群
[  ]  s1  自然数集 $\mathbb N=\{0,1,2,\cdots \}$，配合通常的加法运算构成一个幺半群

# 边:

# Scope:
```

---
## E16  example — 例 8

```
例 8　形如 $x^2+dy^2$ 的整数幺半群
　　
任给整数 $d$，所有形如 $x^2+dy^2(x,y\in \mathbb Z)$ 按通常的乘法构成幺半群。注意它对乘法封闭：
$$(x^2+dy^2)(u^2+dv^2)=x^2u^2+d^2y^2v^2+d(x^2v^2+y^2u^2)=(ux+dvy)^2+d(vx-uy)^2~.$$
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 8　形如 $x^2+dy^2$ 的整数幺半群 |
| 1 | assertion | UCL | 任给整数 $d$，所有形如 $x^2+dy^2(x,y\in \mathbb Z)$ 按通常的乘法构成幺半群 |
| 2 | assertion | UCL | 注意它对乘法封闭： |
| 3 | assertion | DSP | $(x^2+dy^2)(u^2+dv^2)=x^2u^2+d^2y^2v^2+d(x^2v^2+y^2u^2)=(ux+dvy)^2+d(vx-uy)^2~.$ |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s2: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 8　形如 $x^2+dy^2$ 的整数幺半群
[  ]  s1  任给整数 $d$，所有形如 $x^2+dy^2(x,y\in \mathbb Z)$ 按通常的乘法构成幺半群
[  ]  s2  注意它对乘法封闭：
[  ]  s3  $(x^2+dy^2)(u^2+dv^2)=x^2u^2+d^2y^2v^2+d(x^2v^2+y^2u^2)=(ux+dvy)^2+d(vx-uy)^2~.$

# 边:

# Scope:
```

---
## E17  theorem — 定理 2

```
定理 2　群运算满足消去律
　　
给定一个群 $G$，若 对于 $ a, b\in G$ 有某个 $x\in G$ 使得 $ax=bx$，那么必然有 $a=b$；类似地，如果 $xa=xb$，也必然有 $a=b$。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 定理 2　群运算满足消去律 |
| 1 | assumption | — | 给定一个群 $G$，若 对于 $ a, b\in G$ 有某个 $x\in G$ 使得 $ax=bx$ |
| 2 | conclusion | — | 那么必然有 $a=b$；类似地，如果 $xa=xb$，也必然有 $a=b$ |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("必然有 $a=b$；类似地，如果 $xa=xb$，也必然有 $a=b$", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定理 2　群运算满足消去律
[  ]  s1  给定一个群 $G$，若 对于 $ a, b\in G$ 有某个 $x\in G$ 使得 $ax=bx$
[  ]  s2  那么必然有 $a=b$；类似地，如果 $xa=xb$，也必然有 $a=b$

# 边:

# Scope:
```

---
## E18  exercise — 习题 5

```
习题 5　单位元的唯一性
　　
从定理 2  可知左右单位元分别是唯一的。请证明左单位 $e_1$ 元等于右单位元 $e_2$（提示：将它们相乘）。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 习题 5　单位元的唯一性 |
| 1 | assertion | UCL | 从定理 2  可知左右单位元分别是唯一的 |
| 2 | assertion | UCL | 请证明左单位 $e_1$ 元等于右单位元 $e_2$（提示：将它们相乘） |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s2: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  习题 5　单位元的唯一性
[  ]  s1  从定理 2  可知左右单位元分别是唯一的
[  ]  s2  请证明左单位 $e_1$ 元等于右单位元 $e_2$（提示：将它们相乘）

# 边:

# Scope:
```

---
## E19  theorem — 定理 3

```
定理 3　逆元的唯一性
　　
在一个群中，对任意 $x$，假设它存在一个左逆元 $a$，那么我们必然有 $ax=e$。考虑结合性可知，$ae=a=ea=(ax)a=a(xa)$，于是 $xa=e$，即 $a$ 也是 $x$ 的右逆元。也就是说，一个群里的元素只要有左逆元，那么右逆元也存在，并且等于左逆元。反之亦然。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 定理 3　逆元的唯一性 |
| 1 | quantified | — | 在一个群中，对任意 $x$，假设它存在一个左逆元 $a$ |
| 2 | conclusion | — | 那么我们必然有 $ax=e$ |
| 3 | assumption | — | 考虑结合性可知，$ae=a=ea=(ax)a=a(xa)$ |
| 4 | conclusion | — | 于是 $xa=e$，即 $a$ 也是 $x$ 的右逆元 |
| 5 | assertion | UCL | 也就是说，一个群里的元素只要有左逆元 |
| 6 | conclusion | — | 那么右逆元也存在，并且等于左逆元 |
| 7 | assertion | UCL | 反之亦然 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s5: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s7: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("$xa=e$，即 $a$ 也是 $x$ 的右逆元", let_bind) { n3, n4 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定理 3　逆元的唯一性
[  ]  s1  在一个群中，对任意 $x$，假设它存在一个左逆元 $a$
[  ]  s2  那么我们必然有 $ax=e$
[  ]  s3  考虑结合性可知，$ae=a=ea=(ax)a=a(xa)$
[  ]  s4  于是 $xa=e$，即 $a$ 也是 $x$ 的右逆元
[  ]  s5  也就是说，一个群里的元素只要有左逆元
[  ]  s6  那么右逆元也存在，并且等于左逆元
[  ]  s7  反之亦然

# 边:

# Scope:
```

---
## E20  exercise — 习题 6

```
习题 6　
　　
证明 $(ab)^{-1} = b^{-1}a^{-1}$
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 习题 6 |
| 1 | assertion | UCL | 证明 $(ab)^{-1} = b^{-1}a^{-1}$ |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  习题 6
[  ]  s1  证明 $(ab)^{-1} = b^{-1}a^{-1}$

# 边:

# Scope:
```