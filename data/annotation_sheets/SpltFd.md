# 分裂域 — 语义标注

文章 `SpltFd.json` | Part: 13_代数基础 | 环境数: 22
说明: 代数进阶 — 分裂域，定义/定理/推论/充要条件

## 脚注
- [1] 也就是画出它的一棵真因子树。
- [2] 由于 $h(x)$ 是 $\mathbb{F}[x]$ 中的不可约元素，且 $\mathbb{F}[x]$ 是主理想整环，因此易证 $\langle h(x) \rangle$ 是 $\mathbb{F}[x]$ 上的极大理想，从而 $\mathbb{F}(x)/\langle h(x) \rangle$ 是域。
- [3] 即无重根时。
- [4] 这是因为 $\mathbb{F}_1$ 的保 $\mathbb{F}$ 自同构只有两种类型，保 $\mathbb{F}(\alpha_1)$ 和不保 $\mathbb{F}(\alpha_1)$ 的，而 $\sigma(\mathbb{F}(\alpha_1))$ 只取决于 $\sigma(\alpha_1)$，所以总可以用一个不保 $\mathbb{F}(\alpha_1)$ 的自同构把 $\s

---
## E1  definition — 定义 1

```
定义 1　分裂域
　　
给定域 $\mathbb{F}$ 及其上一个多项式 $f(x)$。若存在扩域 $\mathbb{K}/\mathbb{F}$，使得 $f(x)$ 在 $\mathbb{K}$ 上可以分解为 $f(x)=\prod_{i=1}^n (x-a_i)$，且 $\mathbb{K}=\mathbb{F}(a_1, a_2, \cdots, a_n)$，则称 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域（splitting field）。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 1　分裂域 |
| 1 | assumption | — | 给定域 $\mathbb{F}$ 及其上一个多项式 $f(x)$ |
| 2 | assumption | — | 若存在扩域 $\mathbb{K}/\mathbb{F}$，使得 $f(x)$ 在 $\mathbb{K}$ 上可以分解为 $f(x)=\prod_{i=1}^n (x-a_i)$，且 $\mathbb{K}=\mathbb{F}(a_1, a_2, \cdo |
| 3 | definition | — | 则称 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域（splitting field） |

**🤖 推断器 Scope 参考**:
  - Scope("分裂域（splitting field）定义", let_bind) { n2, n3 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 1　分裂域
[  ]  s1  给定域 $\mathbb{F}$ 及其上一个多项式 $f(x)$
[  ]  s2  若存在扩域 $\mathbb{K}/\mathbb{F}$，使得 $f(x)$ 在 $\mathbb{K}$ 上可以分解为 $f(x)=\prod_{i=1}^n (x-a_i)$，且 $\mathbb{K}=\mathbb{F}(a_1, a_2, \cdots, a_n)$
[  ]  s3  则称 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域（splitting field）

# 边:

# Scope:
```

---
## E2  theorem — 定理 1

```
定理 1　分裂域的存在性
　　
给定域 $\mathbb{F}$ 及其上一个多项式 $f(x)$，则 $f(x)\in \mathbb{F}[x]$ 上的分裂域存在。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | quantified | — | 定理 1　分裂域的存在性 |
| 1 | assumption | — | 给定域 $\mathbb{F}$ 及其上一个多项式 $f(x)$ |
| 2 | conclusion | — | 则 $f(x)\in \mathbb{F}[x]$ 上的分裂域存在 |

**🤖 推断器 Scope 参考**:
  - Scope("$f(x)\in \mathbb{F}[x]$ 上的分裂域存在", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定理 1　分裂域的存在性
[  ]  s1  给定域 $\mathbb{F}$ 及其上一个多项式 $f(x)$
[  ]  s2  则 $f(x)\in \mathbb{F}[x]$ 上的分裂域存在

# 边:

# Scope:
```

---
## E3  corollary — 推论 1

```
推论 1　
　　
设 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域，则 $[\mathbb{K}:\mathbb{F}]\leq \operatorname {deg}f$。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 推论 1 |
| 1 | assumption | — | 设 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域 |
| 2 | conclusion | — | 则 $[\mathbb{K}:\mathbb{F}]\leq \operatorname {deg}f$ |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("$[\mathbb{K}:\mathbb{F}]\leq \op…", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  推论 1
[  ]  s1  设 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域
[  ]  s2  则 $[\mathbb{K}:\mathbb{F}]\leq \operatorname {deg}f$

# 边:

# Scope:
```

---
## E4  corollary — 推论 2

```
推论 2　
　　
设 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域，$\mathbb{M}$ 是 $\mathbb{K}$ 和 $\mathbb{F}$ 之间的中间域，则 $\mathbb{K}$ 也是 $f(x)\in \mathbb{E}[x]$ 上的分裂域。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 推论 2 |
| 1 | assumption | — | 设 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域，$\mathbb{M}$ 是 $\mathbb{K}$ 和 $\mathbb{F}$ 之间的中间域 |
| 2 | conclusion | — | 则 $\mathbb{K}$ 也是 $f(x)\in \mathbb{E}[x]$ 上的分裂域 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("$\mathbb{K}$ 也是 $f(x)\in \mathbb…", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  推论 2
[  ]  s1  设 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域，$\mathbb{M}$ 是 $\mathbb{K}$ 和 $\mathbb{F}$ 之间的中间域
[  ]  s2  则 $\mathbb{K}$ 也是 $f(x)\in \mathbb{E}[x]$ 上的分裂域

# 边:

# Scope:
```

---
## E5  example — 例 1

```
例 1　分裂域的一个例子
　　
在有理数域 $\mathbb{Q}$ 上有多项式 $f(x)=(x^2-2)^2(x^2-3)(x^2-6)(x^2+1)$，其在 $\mathbb{Q}$ 上有五个阶数大于 $1$ 的不可约因子：$(x^2-2), (x^2-2), (x^2-3), (x^2-6), (x^2+1)$。

　　
考虑因子 $(x^2-2)$，得到扩域 $\mathbb{Q}(\sqrt{2})$。在 $\mathbb{Q}(\sqrt{2})$ 上，$f$ 有分解：

\begin{equation}
f(x)=(x+\sqrt{2})^2(x-\sqrt{2})^2(x^2-3)(x^2-6)(x^2+1)~,
\end{equation}

　　
取其阶数大于 $1$ 的不可约因子 $x^2-3$，得到扩域 $\mathbb{Q}(\sqrt{2}, \sqrt{3})$。

　　
在 $\mathbb{Q}(\sqrt{2}, \sqrt{3})$ 上，$f$ 有分解：



\begin{equation}
\begin{aligned}
f(x)=&(x+\
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 1　分裂域的一个例子 |
| 1 | assertion | UCL | 在有理数域 $\mathbb{Q}$ 上有多项式 $f(x)=(x^2-2)^2(x^2-3)(x^2-6)(x^2+1)$，其在 $\mathbb{Q}$ 上有五个阶数大于 $1$ 的不可约因子：$(x^2-2), (x^2-2), (x^2-3), (x^ |
| 2 | assumption | — | 考虑因子 $(x^2-2)$，得到扩域 $\mathbb{Q}(\sqrt{2})$ |
| 3 | assertion | UCL | 在 $\mathbb{Q}(\sqrt{2})$ 上，$f$ 有分解： |
| 4 | assertion | DSP | \begin{equation}
f(x)=(x+\sqrt{2})^2(x-\sqrt{2})^2(x^2-3)(x^2-6)(x^2+1)~,
\end{equation} |
| 5 | assertion | UCL | 取其阶数大于 $1$ 的不可约因子 $x^2-3$，得到扩域 $\mathbb{Q}(\sqrt{2}, \sqrt{3})$。 |
| 6 | assertion | UCL | 在 $\mathbb{Q}(\sqrt{2}, \sqrt{3})$ 上，$f$ 有分解： |
| 7 | assertion | DSP | \begin{equation}
\begin{aligned}
f(x)=&(x+\sqrt{2})^2(x-\sqrt{2})^2(x+\sqrt{3})(x-\sqrt{3})\times\\
&(x+\sqrt{2}\sqrt{3})(x-\sqrt{ |
| 8 | assertion | UCL | 取其阶数大于 $1$ 的不可约因子 $x^2+1$，得到扩域 $\mathbb{Q}(\sqrt{2}, \sqrt{3}, \mathrm{i} )$。 |
| 9 | assertion | UCL | 你可以验证，在最后这个扩域下，$f$ 可分解为一阶多项式之积 |
| 10 | conclusion | — | 因此 |
| 11 | assertion | DSP | \begin{equation}
\begin{aligned}
&\mathbb{Q}(\sqrt{2}, \sqrt{3}, \mathrm{i} )=\\
&\{a+A \mathrm{i} +(b+B \mathrm{i} )\sqrt{2}+(c+C |
| 12 | assertion | UCL | 就是 $f\in\mathbb{Q}[x]$ 的分裂域 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s5: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s6: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s7: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s8: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s9: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s11: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s12: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 1　分裂域的一个例子
[  ]  s1  在有理数域 $\mathbb{Q}$ 上有多项式 $f(x)=(x^2-2)^2(x^2-3)(x^2-6)(x^2+1)$，其在 $\mathbb{Q}$ 上有五个阶数大于 $1$ 的不可约因子：$(x^2-2), (x^2-2), (x^2-3), (x^2-6), (x^2+1)$。
[  ]  s2  考虑因子 $(x^2-2)$，得到扩域 $\mathbb{Q}(\sqrt{2})$
[  ]  s3  在 $\mathbb{Q}(\sqrt{2})$ 上，$f$ 有分解：
[  ]  s4  \begin{equation}
f(x)=(x+\sqrt{2})^2(x-\sqrt{2})^2(x^2-3)(x^2-6)(x^2+1)~,
\end{equation}
[  ]  s5  取其阶数大于 $1$ 的不可约因子 $x^2-3$，得到扩域 $\mathbb{Q}(\sqrt{2}, \sqrt{3})$。
[  ]  s6  在 $\mathbb{Q}(\sqrt{2}, \sqrt{3})$ 上，$f$ 有分解：
[  ]  s7  \begin{equation}
\begin{aligned}
f(x)=&(x+\sqrt{2})^2(x-\sqrt{2})^2(x+\sqrt{3})(x-\sqrt{3})\times\\
&(x+\sqrt{2}\sqrt{3})(x-\sqrt{2}\sqrt{3})(x^2+1)~,
[  ]  s8  取其阶数大于 $1$ 的不可约因子 $x^2+1$，得到扩域 $\mathbb{Q}(\sqrt{2}, \sqrt{3}, \mathrm{i} )$。
[  ]  s9  你可以验证，在最后这个扩域下，$f$ 可分解为一阶多项式之积
[  ]  s10  因此
[  ]  s11  \begin{equation}
\begin{aligned}
&\mathbb{Q}(\sqrt{2}, \sqrt{3}, \mathrm{i} )=\\
&\{a+A \mathrm{i} +(b+B \mathrm{i} )\sqrt{2}+(c+C \mathrm{i} )\sqrt{3
[  ]  s12  就是 $f\in\mathbb{Q}[x]$ 的分裂域

# 边:

# Scope:
```

---
## E6  corollary — 推论 3

```
推论 3　
　　
设 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域，则 $[\mathbb{K}:\mathbb{F}]\leq \operatorname {deg}f$。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 推论 3 |
| 1 | assumption | — | 设 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域 |
| 2 | conclusion | — | 则 $[\mathbb{K}:\mathbb{F}]\leq \operatorname {deg}f$ |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("$[\mathbb{K}:\mathbb{F}]\leq \op…", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  推论 3
[  ]  s1  设 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域
[  ]  s2  则 $[\mathbb{K}:\mathbb{F}]\leq \operatorname {deg}f$

# 边:

# Scope:
```

---
## E7  corollary — 推论 4

```
推论 4　
　　
设 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域，$\mathbb{M}$ 是 $\mathbb{K}$ 和 $\mathbb{F}$ 之间的中间域，则 $\mathbb{K}$ 也是 $f(x)\in \mathbb{E}[x]$ 上的分裂域。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 推论 4 |
| 1 | assumption | — | 设 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域，$\mathbb{M}$ 是 $\mathbb{K}$ 和 $\mathbb{F}$ 之间的中间域 |
| 2 | conclusion | — | 则 $\mathbb{K}$ 也是 $f(x)\in \mathbb{E}[x]$ 上的分裂域 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("$\mathbb{K}$ 也是 $f(x)\in \mathbb…", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  推论 4
[  ]  s1  设 $\mathbb{K}$ 是 $f(x)\in \mathbb{F}[x]$ 上的分裂域，$\mathbb{M}$ 是 $\mathbb{K}$ 和 $\mathbb{F}$ 之间的中间域
[  ]  s2  则 $\mathbb{K}$ 也是 $f(x)\in \mathbb{E}[x]$ 上的分裂域

# 边:

# Scope:
```

---
## E8  example — 例 2

```
例 2　单扩张不等于分裂域的例子
　　
在 $\mathbb{Q}$ 上添加 $x^3-2$ 的一个根 $\sqrt[3]{2}$ 得到 $\mathbb{Q}(\sqrt[3]{2})$，但这个单扩域里并没有 $x^3-2$ 的剩下两个根 $\omega\sqrt[3]{2}$ 和 $\omega^2\sqrt[3]{2}$，其中 $\omega=-1/2+ \mathrm{i} \sqrt{3}/2$ 是 $3$ 次单位根。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 2　单扩张不等于分裂域的例子 |
| 1 | assertion | UCL | 在 $\mathbb{Q}$ 上添加 $x^3-2$ 的一个根 $\sqrt[3]{2}$ 得到 $\mathbb{Q}(\sqrt[3]{2})$，但这个单扩域里并没有 $x^3-2$ 的剩下两个根 $\omega\sqrt[3]{2}$ 和 $\omega |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 2　单扩张不等于分裂域的例子
[  ]  s1  在 $\mathbb{Q}$ 上添加 $x^3-2$ 的一个根 $\sqrt[3]{2}$ 得到 $\mathbb{Q}(\sqrt[3]{2})$，但这个单扩域里并没有 $x^3-2$ 的剩下两个根 $\omega\sqrt[3]{2}$ 和 $\omega^2\sqrt[3]{2}$，其中 $\

# 边:

# Scope:
```

---
## E9  theorem — 定理 2

```
定理 2　
　　
给定域 $\mathbb{F}$ 和其上一个多项式 $f$ 以后，所构造出来的分裂域是唯一的，或者说构造出来的两个分裂域都是同构的。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 定理 2 |
| 1 | assumption | — | 给定域 $\mathbb{F}$ 和其上一个多项式 $f$ 以后，所构造出来的分裂域是唯一的 |
| 2 | assertion | UCL | 或者说构造出来的两个分裂域都是同构的 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s2: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定理 2
[  ]  s1  给定域 $\mathbb{F}$ 和其上一个多项式 $f$ 以后，所构造出来的分裂域是唯一的
[  ]  s2  或者说构造出来的两个分裂域都是同构的

# 边:

# Scope:
```

---
## E10  theorem — 定理 3

```
定理 3　
　　
设 $\mathbb{K}$ 是多项式 $f\in\mathbb{F}[x]$ 的分裂域，$\mathbb{E}$ 是 $\mathbb{K}$ 的扩域。

　　
则对于 $\mathbb{E}$ 的任意保 $\mathbb{F}$自同态$\sigma$，有 $\sigma(\mathbb{K})=\mathbb{K}$。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 定理 3 |
| 1 | assumption | — | 设 $\mathbb{K}$ 是多项式 $f\in\mathbb{F}[x]$ 的分裂域，$\mathbb{E}$ 是 $\mathbb{K}$ 的扩域。 |
| 2 | conclusion | — | 则对于 $\mathbb{E}$ 的任意保 $\mathbb{F}$自同态$\sigma$，有 $\sigma(\mathbb{K})=\mathbb{K}$ |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("对于 $\mathbb{E}$ 的任意保 $\mathbb{F}…", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定理 3
[  ]  s1  设 $\mathbb{K}$ 是多项式 $f\in\mathbb{F}[x]$ 的分裂域，$\mathbb{E}$ 是 $\mathbb{K}$ 的扩域。
[  ]  s2  则对于 $\mathbb{E}$ 的任意保 $\mathbb{F}$自同态$\sigma$，有 $\sigma(\mathbb{K})=\mathbb{K}$

# 边:

# Scope:
```

---
## E11  definition — 定义 2

```
定义 2　正规扩张
　　
设 $\mathbb{K}/\mathbb{F}$ 是一个代数扩域。如果对于 $\mathbb{F}$ 上的任意不可约多项式 $f$，要么 $f$ 在 $\mathbb{K}$ 中无根，要么就所有根都在 $\mathbb{K}$ 中，则称 $\mathbb{K}/\mathbb{F}$ 是一个正规扩张。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 2　正规扩张 |
| 1 | assumption | — | 设 $\mathbb{K}/\mathbb{F}$ 是一个代数扩域 |
| 2 | assumption | — | 如果对于 $\mathbb{F}$ 上的任意不可约多项式 $f$，要么 $f$ 在 $\mathbb{K}$ 中无根，要么就所有根都在 $\mathbb{K}$ 中 |
| 3 | definition | — | 则称 $\mathbb{K}/\mathbb{F}$ 是一个正规扩张 |

**🤖 推断器 Scope 参考**:
  - Scope("正规扩张定义", let_bind) { n2, n3 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 2　正规扩张
[  ]  s1  设 $\mathbb{K}/\mathbb{F}$ 是一个代数扩域
[  ]  s2  如果对于 $\mathbb{F}$ 上的任意不可约多项式 $f$，要么 $f$ 在 $\mathbb{K}$ 中无根，要么就所有根都在 $\mathbb{K}$ 中
[  ]  s3  则称 $\mathbb{K}/\mathbb{F}$ 是一个正规扩张

# 边:

# Scope:
```

---
## E12  theorem — 定理 4

```
定理 4　有限扩张时，正规扩张等价于分裂域
　　
设 $\mathbb{K}/\mathbb{F}$ 是一个有限扩域，那么有：

　　
$\mathbb{K}/\mathbb{F}$ 为正规扩张 $\iff$ $\mathbb{K}$ 是某个多项式 $f\in\mathbb{F}[x]$ 的分裂域。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 定理 4　有限扩张时，正规扩张 |
| 1 | assertion | EQF,UCL | 等价于 |
| 2 | assertion | UCL | 分裂域 |
| 3 | assumption | — | 设 $\mathbb{K}/\mathbb{F}$ 是一个有限扩域 |
| 4 | conclusion | — | 那么有： |
| 5 | assertion | UCL | $\mathbb{K}/\mathbb{F}$ 为正规扩张 $\iff$ $\mathbb{K}$ 是某个多项式 $f\in\mathbb{F}[x]$ 的分裂域 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s2: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s5: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("有：", let_bind) { n3, n4 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定理 4　有限扩张时，正规扩张
[  ]  s1  等价于
[  ]  s2  分裂域
[  ]  s3  设 $\mathbb{K}/\mathbb{F}$ 是一个有限扩域
[  ]  s4  那么有：
[  ]  s5  $\mathbb{K}/\mathbb{F}$ 为正规扩张 $\iff$ $\mathbb{K}$ 是某个多项式 $f\in\mathbb{F}[x]$ 的分裂域

# 边:

# Scope:
```

---
## E13  example — 例 3

```
例 3　正规扩张的反例
　　
$\mathbb{Q}(2^{1/3})$ 不是 $\mathbb{Q}$ 的正规扩张。因为存在多项式 $f(x)=x^3-2$，它在 $\mathbb{Q}$ 上不可约，有一个根 $2^{1/3}$ 在 $\mathbb{Q}(2^{1/3})$ 上，但另外两个根都是复数，不在其中。

　　
显然，另外两个根的模都是 $2^{1/3}$，与正实轴的夹角分别为 $\pm 2\pi/3$。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 3　正规扩张的反例 |
| 1 | assertion | UCL | $\mathbb{Q}(2^{1/3})$ 不是 $\mathbb{Q}$ 的正规扩张 |
| 2 | quantified | — | 因为存在多项式 $f(x)=x^3-2$，它在 $\mathbb{Q}$ 上不可约，有一个根 $2^{1/3}$ 在 $\mathbb{Q}(2^{1/3})$ 上，但另外两个根都是复数，不在其中。 |
| 3 | assertion | UCL | 显然，另外两个根的模都是 $2^{1/3}$，与正实轴的夹角分别为 $\pm 2\pi/3$ |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 3　正规扩张的反例
[  ]  s1  $\mathbb{Q}(2^{1/3})$ 不是 $\mathbb{Q}$ 的正规扩张
[  ]  s2  因为存在多项式 $f(x)=x^3-2$，它在 $\mathbb{Q}$ 上不可约，有一个根 $2^{1/3}$ 在 $\mathbb{Q}(2^{1/3})$ 上，但另外两个根都是复数，不在其中。
[  ]  s3  显然，另外两个根的模都是 $2^{1/3}$，与正实轴的夹角分别为 $\pm 2\pi/3$

# 边:

# Scope:
```

---
## E14  exercise — 习题 1

```
习题 1　
　　
求 $x^3-2\in\mathbb{Q}[x]$ 的分裂域。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 习题 1 |
| 1 | assertion | UCL | 求 $x^3-2\in\mathbb{Q}[x]$ 的分裂域 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  习题 1
[  ]  s1  求 $x^3-2\in\mathbb{Q}[x]$ 的分裂域

# 边:

# Scope:
```

---
## E15  corollary — 推论 5

```
推论 5　
　　
设有域扩张 $\mathbb{E}/\mathbb{F}$。则任意 $f\in\mathbb{F}[x]$ 的分裂域 $\mathbb{K}$，在 $\mathbb{E}$ 中最多只有一个。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 推论 5 |
| 1 | assumption | — | 设有域扩张 $\mathbb{E}/\mathbb{F}$ |
| 2 | conclusion | — | 则任意 $f\in\mathbb{F}[x]$ 的分裂域 $\mathbb{K}$，在 $\mathbb{E}$ 中最多只有一个 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("任意 $f\in\mathbb{F}[x]$ 的分裂域 $\ma…", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  推论 5
[  ]  s1  设有域扩张 $\mathbb{E}/\mathbb{F}$
[  ]  s2  则任意 $f\in\mathbb{F}[x]$ 的分裂域 $\mathbb{K}$，在 $\mathbb{E}$ 中最多只有一个

# 边:

# Scope:
```

---
## E16  theorem — 定理 5

```
定理 5　
　　
给定域 $\mathbb{F}$ 和其上一个多项式 $f$，设 $f\in\mathbb{F}[x]$ 的分裂域是 $\mathbb{K}$，$\mathbb{K}$ 到自身的保 $\mathbb{F}$ 自同构数量为 $N$，那么 $N\leq[\mathbb{K}:\mathbb{F}]$。

　　
当且仅当 $f$ 的每一个不可约因子 $h$ 的不同根数目恰为 $ \operatorname {deg}h$ 时3，等号成立。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 定理 5 |
| 1 | assumption | — | 给定域 $\mathbb{F}$ 和其上一个多项式 $f$，设 $f\in\mathbb{F}[x]$ 的分裂域是 $\mathbb{K}$，$\mathbb{K}$ 到自身的保 $\mathbb{F}$ 自同构数量为 $N$ |
| 2 | conclusion | — | 那么 $N\leq[\mathbb{K}:\mathbb{F}]$。 |
| 3 | assumption | EQF | 当且仅当 |
| 4 | assertion | UCL | $f$ 的每一个不可约因子 $h$ 的不同根数目恰为 $ \operatorname {deg}h$ 时3，等号成立 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("$N\leq[\mathbb{K}:\mathbb{F}]$。", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定理 5
[  ]  s1  给定域 $\mathbb{F}$ 和其上一个多项式 $f$，设 $f\in\mathbb{F}[x]$ 的分裂域是 $\mathbb{K}$，$\mathbb{K}$ 到自身的保 $\mathbb{F}$ 自同构数量为 $N$
[  ]  s2  那么 $N\leq[\mathbb{K}:\mathbb{F}]$。
[  ]  s3  当且仅当
[  ]  s4  $f$ 的每一个不可约因子 $h$ 的不同根数目恰为 $ \operatorname {deg}h$ 时3，等号成立

# 边:

# Scope:
```

---
## E17  example — 例 4

```
例 4　
　　
给定有理数域 $\mathbb{Q}$ 及其上的多项式 $f(x)=x^2-2$。则 $f\in\mathbb{Q}[x]$ 的分裂域为 $\mathbb{Q}(\sqrt{2})=\{a+b\sqrt{2}|a, b\in\mathbb{Q}\}$。

　　
$\mathbb{Q}(\sqrt{2})$ 一共有两个保 $\mathbb{Q}$ 自同构：第一个就是恒等映射，第二个 $\sigma$ 则定义如下：

\begin{equation}
\sigma(a+b\sqrt{2})=a-b\sqrt{2}~.
\end{equation}

也就是说，$\sigma$ 把根 $\pm\sqrt{2}$ 映射到根 $\mp\sqrt{2}$。

　　
而 $[\mathbb{Q}(\sqrt{2}):\mathbb{Q}]=2$，因此这是一个定理 5  取等号的例子。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 4 |
| 1 | assumption | — | 给定有理数域 $\mathbb{Q}$ 及其上的多项式 $f(x)=x^2-2$ |
| 2 | conclusion | — | 则 $f\in\mathbb{Q}[x]$ 的分裂域为 $\mathbb{Q}(\sqrt{2})=\{a+b\sqrt{2}\|a, b\in\mathbb{Q}\}$。 |
| 3 | assertion | UCL | $\mathbb{Q}(\sqrt{2})$ 一共有两个保 $\mathbb{Q}$ 自同构：第一个就是恒等映射，第二个 $\sigma$ |
| 4 | definition | — | 定义如下： |
| 5 | assertion | DSP | \begin{equation}
\sigma(a+b\sqrt{2})=a-b\sqrt{2}~.
\end{equation} |
| 6 | assertion | UCL | 也就是说，$\sigma$ 把根 $\pm\sqrt{2}$ 映射到根 $\mp\sqrt{2}$。 |
| 7 | assertion | UCL | 而 $[\mathbb{Q}(\sqrt{2}):\mathbb{Q}]=2$ |
| 8 | conclusion | — | 因此这是一个定理 5  取等号的例子 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s5: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s6: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s7: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("$f\in\mathbb{Q}[x]$ 的分裂域为 $\math…", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 4
[  ]  s1  给定有理数域 $\mathbb{Q}$ 及其上的多项式 $f(x)=x^2-2$
[  ]  s2  则 $f\in\mathbb{Q}[x]$ 的分裂域为 $\mathbb{Q}(\sqrt{2})=\{a+b\sqrt{2}|a, b\in\mathbb{Q}\}$。
[  ]  s3  $\mathbb{Q}(\sqrt{2})$ 一共有两个保 $\mathbb{Q}$ 自同构：第一个就是恒等映射，第二个 $\sigma$
[  ]  s4  定义如下：
[  ]  s5  \begin{equation}
\sigma(a+b\sqrt{2})=a-b\sqrt{2}~.
\end{equation}
[  ]  s6  也就是说，$\sigma$ 把根 $\pm\sqrt{2}$ 映射到根 $\mp\sqrt{2}$。
[  ]  s7  而 $[\mathbb{Q}(\sqrt{2}):\mathbb{Q}]=2$
[  ]  s8  因此这是一个定理 5  取等号的例子

# 边:

# Scope:
```

---
## E18  example — 例 5

```
例 5　
　　
给定实数域 $\mathbb{R}$ 及其上的多项式 $f(x)=x^2+x+1$，则 $f\in\mathbb{R}[x]$ 的分裂域为 $\mathbb{R}(\omega)=\{a+b\omega+c\omega^2 \mid a, b, c\in\mathbb{R}\}$，其中 $\omega$ 是 $1$ 的三次单位根 $\frac{1}{2}(-1+ \mathrm{i} \sqrt{3})= \mathrm{e} ^{\frac{2\pi}{3} \mathrm{i} }$。

　　
$\mathbb{R}(\omega)$ 一共有两个保 $\mathbb{R}$ 自同构：第一个是恒等映射；第二个则是将 $\omega$ 映射到 $\omega^2$、$\omega^2$ 映射到 $\omega$ 的映射。

　　
$[\mathbb{R}(\omega):\mathbb{R}]=2$。这可以从定理 2  得到，也可以验证 $\omega^2=-1-\omega$ 得到。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 5 |
| 1 | assumption | — | 给定实数域 $\mathbb{R}$ 及其上的多项式 $f(x)=x^2+x+1$ |
| 2 | conclusion | — | 则 $f\in\mathbb{R}[x]$ 的分裂域为 $\mathbb{R}(\omega)=\{a+b\omega+c\omega^2 \mid a, b, c\in\mathbb{R}\}$，其中 $\omega$ 是 $1$ 的三次单位根 $\frac |
| 3 | assertion | UCL | $\mathbb{R}(\omega)$ 一共有两个保 $\mathbb{R}$ 自同构：第一个是恒等映射；第二个则是将 $\omega$ 映射到 $\omega^2$、$\omega^2$ 映射到 $\omega$ 的映射。 |
| 4 | assertion | UCL | $[\mathbb{R}(\omega):\mathbb{R}]=2$ |
| 5 | assertion | UCL | 这可以从定理 2  得到，也可以验证 $\omega^2=-1-\omega$ 得到 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s5: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("$f\in\mathbb{R}[x]$ 的分裂域为 $\math…", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 5
[  ]  s1  给定实数域 $\mathbb{R}$ 及其上的多项式 $f(x)=x^2+x+1$
[  ]  s2  则 $f\in\mathbb{R}[x]$ 的分裂域为 $\mathbb{R}(\omega)=\{a+b\omega+c\omega^2 \mid a, b, c\in\mathbb{R}\}$，其中 $\omega$ 是 $1$ 的三次单位根 $\frac{1}{2}(-1+ \mathrm{i
[  ]  s3  $\mathbb{R}(\omega)$ 一共有两个保 $\mathbb{R}$ 自同构：第一个是恒等映射；第二个则是将 $\omega$ 映射到 $\omega^2$、$\omega^2$ 映射到 $\omega$ 的映射。
[  ]  s4  $[\mathbb{R}(\omega):\mathbb{R}]=2$
[  ]  s5  这可以从定理 2  得到，也可以验证 $\omega^2=-1-\omega$ 得到

# 边:

# Scope:
```

---
## E19  exercise — 习题 2

```
习题 2　
　　
给定实数域 $\mathbb{R}$ 及其上的多项式 $f(x)=x^4+x^3+x^2+x+1$，则 $f\in\mathbb{R}[x]$ 的分裂域为 $\mathbb{R}(\gamma)=\{a+b\gamma+c\gamma^2+d\gamma^3+e\gamma^4 \mid a, b, c, d, e\in\mathbb{R}\}$，其中 $\gamma$ 是 $1$ 的五次单位根 $ \mathrm{e} ^{\frac{2\pi}{5} \mathrm{i} }$。

　　
$\mathbb{R}(\gamma)$ 一共有四个保 $\mathbb{R}$ 自同构。找出它们。

　　
提示：考虑 $\gamma$ 被映射到某根 $\gamma'$，那么 $\gamma^2$ 就被映射到 $\gamma'^2$。所以每个自同构唯一对应一个根 $\gamma'$。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 习题 2 |
| 1 | assumption | — | 给定实数域 $\mathbb{R}$ 及其上的多项式 $f(x)=x^4+x^3+x^2+x+1$ |
| 2 | conclusion | — | 则 $f\in\mathbb{R}[x]$ 的分裂域为 $\mathbb{R}(\gamma)=\{a+b\gamma+c\gamma^2+d\gamma^3+e\gamma^4 \mid a, b, c, d, e\in\mathbb{R}\}$，其中 $\ |
| 3 | assertion | UCL | $\mathbb{R}(\gamma)$ 一共有四个保 $\mathbb{R}$ 自同构 |
| 4 | assertion | UCL | 找出它们。 |
| 5 | assertion | UCL | 提示：考虑 $\gamma$ 被映射到某根 $\gamma'$ |
| 6 | conclusion | — | 那么 $\gamma^2$ 就被映射到 $\gamma'^2$ |
| 7 | conclusion | — | 所以每个自同构唯一对应一个根 $\gamma'$ |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s5: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("$f\in\mathbb{R}[x]$ 的分裂域为 $\math…", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  习题 2
[  ]  s1  给定实数域 $\mathbb{R}$ 及其上的多项式 $f(x)=x^4+x^3+x^2+x+1$
[  ]  s2  则 $f\in\mathbb{R}[x]$ 的分裂域为 $\mathbb{R}(\gamma)=\{a+b\gamma+c\gamma^2+d\gamma^3+e\gamma^4 \mid a, b, c, d, e\in\mathbb{R}\}$，其中 $\gamma$ 是 $1$ 的五次单位根 
[  ]  s3  $\mathbb{R}(\gamma)$ 一共有四个保 $\mathbb{R}$ 自同构
[  ]  s4  找出它们。
[  ]  s5  提示：考虑 $\gamma$ 被映射到某根 $\gamma'$
[  ]  s6  那么 $\gamma^2$ 就被映射到 $\gamma'^2$
[  ]  s7  所以每个自同构唯一对应一个根 $\gamma'$

# 边:

# Scope:
```

---
## E20  exercise — 习题 3

```
习题 3　
　　
求 $x^3-2\in\sqrt{Q}[x]$ 的分裂域及其所有保 $\mathbb{Q}$ 自同构。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 习题 3 |
| 1 | assertion | UCL | 求 $x^3-2\in\sqrt{Q}[x]$ 的分裂域及其所有保 $\mathbb{Q}$ 自同构 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  习题 3
[  ]  s1  求 $x^3-2\in\sqrt{Q}[x]$ 的分裂域及其所有保 $\mathbb{Q}$ 自同构

# 边:

# Scope:
```

---
## E21  exercise — 习题 4

```
习题 4　
　　
求 $x^p-1\in\mathbb{Q}[x]$ 的分裂域及其所有保 $\mathbb{Q}$ 自同构。这里 $p$ 为素数。注意判断 $x^p-1$ 是否为不可约多项式。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 习题 4 |
| 1 | assertion | UCL | 求 $x^p-1\in\mathbb{Q}[x]$ 的分裂域及其所有保 $\mathbb{Q}$ 自同构 |
| 2 | assertion | UCL | 这里 $p$ 为素数 |
| 3 | assertion | UCL | 注意判断 $x^p-1$ 是否为不可约多项式 |

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

[  ]  s0  习题 4
[  ]  s1  求 $x^p-1\in\mathbb{Q}[x]$ 的分裂域及其所有保 $\mathbb{Q}$ 自同构
[  ]  s2  这里 $p$ 为素数
[  ]  s3  注意判断 $x^p-1$ 是否为不可约多项式

# 边:

# Scope:
```

---
## E22  exercise — 习题 5

```
习题 5　
　　
求 $x^6-1\in\mathbb{Q}[x]$ 的分裂域及其所有保 $\mathbb{Q}$ 自同构。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 习题 5 |
| 1 | assertion | UCL | 求 $x^6-1\in\mathbb{Q}[x]$ 的分裂域及其所有保 $\mathbb{Q}$ 自同构 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  习题 5
[  ]  s1  求 $x^6-1\in\mathbb{Q}[x]$ 的分裂域及其所有保 $\mathbb{Q}$ 自同构

# 边:

# Scope:
```