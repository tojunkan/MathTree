# 极限的运算法则 — 语义标注

文章 `LimOp.json` | Part: 5_一元微积分 | 环境数: 2
说明: 一元微积分 — 极限运算法则，定理

## 脚注
- [1] “去心” 这个词让我想到 “比干挖心” 的传说故事
- [2] 严格来说，或许应该写为 $(x_0-\delta_1,x_0)\cup(x_0, x_0+\delta_1)$，不过在正文中这么写实在太繁琐了，也不利于把握重点 参考文献 [1] ^ J. Hass, C. Heil, M. Weir．Thomas' Cauculus 14ed

---
## E1  theorem — 定理 1

```
定理 1　极限的四则运算
　　
若两个函数分别存在极限 $\lim\limits_{x\to a} f(x)$ 和 $\lim\limits_{x\to a} g(x)$（$a$ 可取 $\pm \infty$），那么有

\begin{equation}
\lim_{x\to a} [f(x) \pm g(x)] = \lim_{x\to a}f(x) \pm \lim_{x\to a} g(x)~,
\end{equation}


\begin{equation}
\lim_{x\to a} [f(x) g(x)] = \lim_{x\to a}f(x) \lim_{x\to a} g(x)~,
\end{equation}


\begin{equation}
\lim_{x\to a} [f(x)/g(x)] = \lim_{x\to a}f(x)/\lim_{x\to a} g(x) \qquad (\lim_{x\to a} g(x) \ne 0)~.
\end{equation}

注意，可以四则运算的前提是参与运算的各个极限均存在。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 定理 1　极限的四则运算 |
| 1 | assumption | — | 若两个函数分别存在极限 $\lim\limits_{x\to a} f(x)$ 和 $\lim\limits_{x\to a} g(x)$（$a$ 可取 $\pm \infty$） |
| 2 | conclusion | — | 那么有 |
| 3 | assertion | DSP | \begin{equation}
\lim_{x\to a} [f(x) \pm g(x)] = \lim_{x\to a}f(x) \pm \lim_{x\to a} g(x)~,
\end{equation} |
| 4 | assertion | DSP | \begin{equation}
\lim_{x\to a} [f(x) g(x)] = \lim_{x\to a}f(x) \lim_{x\to a} g(x)~,
\end{equation} |
| 5 | assertion | DSP | \begin{equation}
\lim_{x\to a} [f(x)/g(x)] = \lim_{x\to a}f(x)/\lim_{x\to a} g(x) \qquad (\lim_{x\to a} g(x) \ne 0)~.
\end{equatio |
| 6 | quantified | — | 注意，可以四则运算的前提是参与运算的各个极限均存在 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s5: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("有", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定理 1　极限的四则运算
[  ]  s1  若两个函数分别存在极限 $\lim\limits_{x\to a} f(x)$ 和 $\lim\limits_{x\to a} g(x)$（$a$ 可取 $\pm \infty$）
[  ]  s2  那么有
[  ]  s3  \begin{equation}
\lim_{x\to a} [f(x) \pm g(x)] = \lim_{x\to a}f(x) \pm \lim_{x\to a} g(x)~,
\end{equation}
[  ]  s4  \begin{equation}
\lim_{x\to a} [f(x) g(x)] = \lim_{x\to a}f(x) \lim_{x\to a} g(x)~,
\end{equation}
[  ]  s5  \begin{equation}
\lim_{x\to a} [f(x)/g(x)] = \lim_{x\to a}f(x)/\lim_{x\to a} g(x) \qquad (\lim_{x\to a} g(x) \ne 0)~.
\end{equation}
[  ]  s6  注意，可以四则运算的前提是参与运算的各个极限均存在

# 边:

# Scope:
```

---
## E2  theorem — 定理 2

```
定理 2　局部保号性、保序性
　　
局部保号性：

\begin{equation}
\lim_{x\to x_0}f(x)>0\Rightarrow \exists \mathring{U} (x_0), \forall x \in \mathring{U} (x_0), f(x)>0~.
\end{equation}

　　
局部保序性：

\begin{equation}
\lim_{x\to x_0}f(x)=A>0 \Rightarrow \exists \mathring{U} (x_0), \forall x \in \mathring{U} (x_0), f(x)>A/2~.
\end{equation}

　　
$\mathring{U} (x_0)$ 指 $x_0$ 附近的一个小区间，但不包括 $x_0$ 自身，也称去心区间。1

　　
这是一组简单的、但却有点难以理解的结论。在处理一些刁钻的问题时，局部保号、保序性偶尔会派上用场。通俗地说，这意味着若 $\lim\limits_{x\to x_0}f(x)=A$，则 $x$ 在 $x_0$ 附近时，$f(x)$ 的
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 定理 2　局部保号性、保序性 |
| 1 | assertion | UCL | 局部保号性： |
| 2 | assertion | DSP | \begin{equation}
\lim_{x\to x_0}f(x)>0\Rightarrow \exists \mathring{U} (x_0), \forall x \in \mathring{U} (x_0), f(x)>0~.
\end{equa |
| 3 | assertion | UCL | 局部保序性： |
| 4 | assertion | DSP | \begin{equation}
\lim_{x\to x_0}f(x)=A>0 \Rightarrow \exists \mathring{U} (x_0), \forall x \in \mathring{U} (x_0), f(x)>A/2~.
\end |
| 5 | definition | — | $\mathring{U} (x_0)$ 指 $x_0$ 附近的一个小区间，但不包括 $x_0$ 自身，也称去心区间 |
| 6 | assertion | UCL | 1 |
| 7 | assertion | UCL | 这是一组简单的、但却有点难以理解的结论 |
| 8 | assertion | UCL | 在处理一些刁钻的问题时，局部保号、保序性偶尔会派上用场 |
| 9 | assertion | UCL | 通俗地说，这意味着若 $\lim\limits_{x\to x_0}f(x)=A$ |
| 10 | conclusion | — | 则 $x$ 在 $x_0$ 附近时，$f(x)$ 的函数值也会收缩到 $A$ 附近。 |
| 11 | assertion | UCL | 图 1：在 $(x_0-\delta, x_0+\delta)$ 区间内，$f(x)>0$. 仿自 [1] |
| 12 | definition | — | 局部保号性的一个幼稚 “证明”：如图 1  所示（其实就是图 4 ），我们总能取一个 $\varepsilon_1 \in (0,A)$，极限的定义保证了我们总能找到对应的 $\delta_1$ |
| 13 | assertion | UCL | 显然，在 $(x_0-\delta_1, x_0+\delta_1)$ 这个小去心区间2(即 $\mathring{U} ({x_0})$)内，有 $f(x)>0$。 |
| 14 | assertion | UCL | 同理，将选取 $\varepsilon$ 的区间改为 $(0,A/2)$，我们就能找到相应的、使 $f(x)>A/2$ 的区间 |
| 15 | conclusion | — | 即说明了局部保序性 |
| 16 | assertion | UCL | 原则上，由此可导出更广义的局部保序性 |
| 17 | conclusion | — | 即总存在 $f(x)>A/3,A/4,A/5,...$ 的区间 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s2: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s6: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s7: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s8: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s9: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s11: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s13: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s14: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s16: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定理 2　局部保号性、保序性
[  ]  s1  局部保号性：
[  ]  s2  \begin{equation}
\lim_{x\to x_0}f(x)>0\Rightarrow \exists \mathring{U} (x_0), \forall x \in \mathring{U} (x_0), f(x)>0~.
\end{equation}
[  ]  s3  局部保序性：
[  ]  s4  \begin{equation}
\lim_{x\to x_0}f(x)=A>0 \Rightarrow \exists \mathring{U} (x_0), \forall x \in \mathring{U} (x_0), f(x)>A/2~.
\end{equation}
[  ]  s5  $\mathring{U} (x_0)$ 指 $x_0$ 附近的一个小区间，但不包括 $x_0$ 自身，也称去心区间
[  ]  s6  1
[  ]  s7  这是一组简单的、但却有点难以理解的结论
[  ]  s8  在处理一些刁钻的问题时，局部保号、保序性偶尔会派上用场
[  ]  s9  通俗地说，这意味着若 $\lim\limits_{x\to x_0}f(x)=A$
[  ]  s10  则 $x$ 在 $x_0$ 附近时，$f(x)$ 的函数值也会收缩到 $A$ 附近。
[  ]  s11  图 1：在 $(x_0-\delta, x_0+\delta)$ 区间内，$f(x)>0$. 仿自 [1]
[  ]  s12  局部保号性的一个幼稚 “证明”：如图 1  所示（其实就是图 4 ），我们总能取一个 $\varepsilon_1 \in (0,A)$，极限的定义保证了我们总能找到对应的 $\delta_1$
[  ]  s13  显然，在 $(x_0-\delta_1, x_0+\delta_1)$ 这个小去心区间2(即 $\mathring{U} ({x_0})$)内，有 $f(x)>0$。
[  ]  s14  同理，将选取 $\varepsilon$ 的区间改为 $(0,A/2)$，我们就能找到相应的、使 $f(x)>A/2$ 的区间
[  ]  s15  即说明了局部保序性
[  ]  s16  原则上，由此可导出更广义的局部保序性
[  ]  s17  即总存在 $f(x)>A/3,A/4,A/5,...$ 的区间

# 边:

# Scope:
```