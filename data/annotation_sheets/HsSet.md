# 集合（高中） — 语义标注

文章 `HsSet.json` | Part: 2_高中数学 | 环境数: 19
说明: 高中数学 — 集合，大量定义，多种命名模式

## 脚注
- [1] 这里的集合概念是朴素的，之后因为引发了一些问题，导致数学家们又创立了新的定义，这个问题直到现在还莫衷一是。但就如一开始所说，高中阶段对集合的要求并不这么艰深，毕竟这事现在也没说太准。
- [2] 有的同学会好奇 “集合可不可以作为元素”，结论是肯定的，但是在高中阶段不涉及。
- [3] 如果感兴趣可以参考定义 2 处有序对的构建思路
- [4] 随着学习的深入，你会越来越感受到这帮人真的是一个字都不愿意多说。
- [5] 在高等数学领域，这些数集的记号为 $\mathbb{N,N^+,Z,Q,R}$，既表示他们的地位特殊，同时这些集合的定义都是广泛明确的，使用这个记号会方便交流。
- [6] 空集的元素数量是 0
- [7] 这里给出是因为教材上有提及，但如前面所说高中不涉及这一部分
- [8] 注意要求的前提是不能把塑料袋也当成 “一种水果”。但有时的研究考虑的是物品种类，这样塑料袋和各种水果就都算成不同的物品了，这个问题不在当前的讨论范围。如果专业点解释的话，就是在高中阶段，一个集合不会成为另一个集合的元素。
- [9] 这里给出的记法是人教版高中课本上的，在高中阶段请只使用这种写法。事实上，还有 $A\subset B,B\supset A$ 和 $A\subsetneq B,B\supsetneq A$ 两种写法用来表示 “$A$ 是 $B$ 的真子集”，且前一种更常用。
- [10] 实际上不存在这种集合，或者说满足这个概念的 “事物” 不是集合。

---
## E1  example — 例 1

```
例 1　塑料袋与水果
　　
我给了你一个塑料袋，求你帮我把它送给另一个人。塑料袋嘛，就是用来装东西的，里面装了三种水果：苹果、香蕉、橙子。至于多少个，我没说你也没看，反正不轻。

　　
你拎着这些东西到了他那里。他随口问了一声：“这个塑料袋里，装没装苹果？” 你打开一看，有，就回答他 “装了。” 你刚想放下，他又问：“这个塑料袋里，装没装西瓜？” 你只能又打开一看，没有，就回答他 “没装。” 他又要张嘴问你，奈何你的手已经不堪重负，于是你把塑料袋放地上了，跟他说：“东西我都放这里了，都在塑料袋里面我也没动，挺多的你自己看吧。”
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 1　塑料袋与水果 |
| 1 | assertion | UCL | 我给了你一个塑料袋，求你帮我把它送给另一个人 |
| 2 | assertion | UCL | 塑料袋嘛，就是用来装东西的，里面装了三种水果：苹果、香蕉、橙子 |
| 3 | assertion | UCL | 至于多少个，我没说你也没看，反正不轻。 |
| 4 | assertion | UCL | 你拎着这些东西到了他那里 |
| 5 | assertion | UCL | 他随口问了一声：“这个塑料袋里，装没装苹果 |
| 6 | assertion | UCL | ” 你打开一看，有，就回答他 “装了 |
| 7 | assertion | UCL | ” 你刚想放下，他又问：“这个塑料袋里，装没装西瓜 |
| 8 | assertion | UCL | ” 你只能又打开一看，没有，就回答他 “没装 |
| 9 | assertion | UCL | ” 他又要张嘴问你，奈何你的手已经不堪重负 |
| 10 | conclusion | — | 于是你把塑料袋放地上了，跟他说：“东西我都放这里了，都在塑料袋里面我也没动，挺多的你自己看吧 |
| 11 | assertion | UCL | ” |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s2: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s5: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s6: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s7: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s8: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s9: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s11: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 1　塑料袋与水果
[  ]  s1  我给了你一个塑料袋，求你帮我把它送给另一个人
[  ]  s2  塑料袋嘛，就是用来装东西的，里面装了三种水果：苹果、香蕉、橙子
[  ]  s3  至于多少个，我没说你也没看，反正不轻。
[  ]  s4  你拎着这些东西到了他那里
[  ]  s5  他随口问了一声：“这个塑料袋里，装没装苹果
[  ]  s6  ” 你打开一看，有，就回答他 “装了
[  ]  s7  ” 你刚想放下，他又问：“这个塑料袋里，装没装西瓜
[  ]  s8  ” 你只能又打开一看，没有，就回答他 “没装
[  ]  s9  ” 他又要张嘴问你，奈何你的手已经不堪重负
[  ]  s10  于是你把塑料袋放地上了，跟他说：“东西我都放这里了，都在塑料袋里面我也没动，挺多的你自己看吧
[  ]  s11  ”

# 边:

# Scope:
```

---
## E2  definition — 定义 1

```
定义 1　集合
　　
一定范围内，某些能够确定的（well-defined，也称良定义的）、不同的对象（object）构成的整体（collection）称为集合（set），常用大写拉丁字母指代 $A,B,C,\cdots$，称为集合 $A$、集合 $B$、集合 $C$ 等。

　　
构成集合的每个对象称为该集合的元素2（element），常用小写拉丁字母指代 $a,b,c,\cdots$，称为元素 $a$、元素 $b$、元素 $c$ 等。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 1　集合 |
| 1 | definition | — | 一定范围内，某些能够确定的（well-defined，也称良定义的）、不同的对象（object）构成的整体（collection）称为集合（set），常用大写拉丁字母指代 $A,B,C,\cdots$ |
| 2 | definition | — | 称为集合 $A$、集合 $B$、集合 $C$ 等。 |
| 3 | definition | — | 构成集合的每个对象称为该集合的元素2（element），常用小写拉丁字母指代 $a,b,c,\cdots$ |
| 4 | definition | — | 称为元素 $a$、元素 $b$、元素 $c$ 等 |

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 1　集合
[  ]  s1  一定范围内，某些能够确定的（well-defined，也称良定义的）、不同的对象（object）构成的整体（collection）称为集合（set），常用大写拉丁字母指代 $A,B,C,\cdots$
[  ]  s2  称为集合 $A$、集合 $B$、集合 $C$ 等。
[  ]  s3  构成集合的每个对象称为该集合的元素2（element），常用小写拉丁字母指代 $a,b,c,\cdots$
[  ]  s4  称为元素 $a$、元素 $b$、元素 $c$ 等

# 边:

# Scope:
```

---
## E3  example — 例 2

```
例 2　是否存在一个集合是由“好看的明星”构成的？
　　
由于 “好看” 是一个主观标准，而 “明星” 是一个不确定的概念，因此，除非给定一个可以判定的 “明星” 概念，并量化 “好看” 的标准（即确定一些量来审核颜值），否则根据确定性，在一般的语境下，不存在一个由 “好看的明星” 构成集合。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | quantified | — | 例 2　是否存在一个集合是由“好看的明星”构成的？ |
| 1 | assertion | UCL | 由于 “好看” 是一个主观标准，而 “明星” 是一个不确定的概念 |
| 2 | conclusion | — | 因此，除非给定一个可以判定的 “明星” 概念，并量化 “好看” 的标准（即确定一些量来审核颜值），否则根据确定性，在一般的语境下，不存在一个由 “好看的明星” 构成集合 |

**⚠ 悬置**:
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 2　是否存在一个集合是由“好看的明星”构成的？
[  ]  s1  由于 “好看” 是一个主观标准，而 “明星” 是一个不确定的概念
[  ]  s2  因此，除非给定一个可以判定的 “明星” 概念，并量化 “好看” 的标准（即确定一些量来审核颜值），否则根据确定性，在一般的语境下，不存在一个由 “好看的明星” 构成集合

# 边:

# Scope:
```

---
## E4  example — 例 3

```
例 3　由“1,2,3,3,2,1”构成的集合有几个元素？
　　
翻译成 “塑料袋语言”：一个塑料袋里有两个苹果、两个香蕉、两个橙子，问有几种水果。答：三种。

　　
书面语：由于集合中的元素具有互异性，因此集合中只有 “1、2、3” 三个元素。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 3　由“1,2,3,3,2,1”构成的集合有几个元素？ |
| 1 | assertion | UCL | 翻译成 “塑料袋语言”：一个塑料袋里有两个苹果、两个香蕉、两个橙子，问有几种水果 |
| 2 | assertion | UCL | 答：三种。 |
| 3 | assertion | UCL | 书面语：由于集合中的元素具有互异性 |
| 4 | conclusion | — | 因此集合中只有 “1、2、3” 三个元素 |

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

[  ]  s0  例 3　由“1,2,3,3,2,1”构成的集合有几个元素？
[  ]  s1  翻译成 “塑料袋语言”：一个塑料袋里有两个苹果、两个香蕉、两个橙子，问有几种水果
[  ]  s2  答：三种。
[  ]  s3  书面语：由于集合中的元素具有互异性
[  ]  s4  因此集合中只有 “1、2、3” 三个元素

# 边:

# Scope:
```

---
## E5  example — 例 4

```
例 4　判断：一个班级的学生按出生日期排列和按身高排列构成不同的集合。
　　
如果将 “班级” 看成一个集合，将 “学生” 看成元素，则由于集合的无序性，不论怎么排序都不影响集合，因此错误。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 4　判断：一个班级的学生按出生日期排列和按身高排列构成不同的集合。 |
| 1 | assumption | — | 如果将 “班级” 看成一个集合，将 “学生” 看成元素 |
| 2 | conclusion | — | 则由于集合的无序性，不论怎么排序都不影响集合，因此错误 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("由于集合的无序性，不论怎么排序都不影响集合，因此错误", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 4　判断：一个班级的学生按出生日期排列和按身高排列构成不同的集合。
[  ]  s1  如果将 “班级” 看成一个集合，将 “学生” 看成元素
[  ]  s2  则由于集合的无序性，不论怎么排序都不影响集合，因此错误

# 边:

# Scope:
```

---
## E6  definition — 定义 2

```
定义 2　集合的基数
　　
有限集 $M$ 中的元素个数，称作集合的基数（cardinality，也称作集合的势），用 ${\rm card}(M)$ 表示。规定 ${\rm card}(\varnothing)=0$。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 2　集合的基数 |
| 1 | assertion | UCL | 有限集 $M$ 中的元素个数 |
| 2 | definition | — | 称作集合的基数（cardinality，也称作集合的势），用 ${\rm card}(M)$ 表示 |
| 3 | assertion | UCL | 规定 ${\rm card}(\varnothing)=0$ |

**⚠ 悬置**:
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 2　集合的基数
[  ]  s1  有限集 $M$ 中的元素个数
[  ]  s2  称作集合的基数（cardinality，也称作集合的势），用 ${\rm card}(M)$ 表示
[  ]  s3  规定 ${\rm card}(\varnothing)=0$

# 边:

# Scope:
```

---
## E7  example — 例 5

```
例 5　用列举法表示是从 $0$ 到 $50$ 的偶数构成的集合 $A$


\begin{equation}
A=\{0,2, \cdots ,48,50\}~.
\end{equation}
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 5　用列举法表示是从 $0$ 到 $50$ 的偶数构成的集合 $A$ |
| 1 | assertion | DSP | \begin{equation}
A=\{0,2, \cdots ,48,50\}~.
\end{equation} |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 5　用列举法表示是从 $0$ 到 $50$ 的偶数构成的集合 $A$
[  ]  s1  \begin{equation}
A=\{0,2, \cdots ,48,50\}~.
\end{equation}

# 边:

# Scope:
```

---
## E8  example — 例 6

```
例 6　
　　
从 $0$ 到 $50$ 的偶数构成的集合 $A$，可以描述如下：



\begin{equation}
\begin{aligned}
A={}&\{x \mid x\text{是大于等于}0\text{且小于等于}50\text{的偶数}\}\\
={}&\{x \mid x=2k,k\text{是大于等于}0\text{且小于等于}25\text{的整数}\}\\
={}&\{2k\mid\}~.
\end{aligned}
\end{equation}
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 6 |
| 1 | assertion | UCL | 从 $0$ 到 $50$ 的偶数构成的集合 $A$，可以描述如下： |
| 2 | assertion | DSP | \begin{equation}
\begin{aligned}
A={}&\{x \mid x\text{是大于等于}0\text{且小于等于}50\text{的偶数}\}\\
={}&\{x \mid x=2k,k\text{是大于等于}0\text{且小 |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s2: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 6
[  ]  s1  从 $0$ 到 $50$ 的偶数构成的集合 $A$，可以描述如下：
[  ]  s2  \begin{equation}
\begin{aligned}
A={}&\{x \mid x\text{是大于等于}0\text{且小于等于}50\text{的偶数}\}\\
={}&\{x \mid x=2k,k\text{是大于等于}0\text{且小于等于}25\text{的整数}\}\\

# 边:

# Scope:
```

---
## E9  definition — 定义 3

```
定义 3　属于与不属于
　　
若 $a$ 在集合 $A$ 中，称 $a$ 属于（belong to）集合 $A$，记作：

\begin{equation}
a \in A~.
\end{equation}

　　
若 $a$ 不在集合 $A$ 中，称 $a$ 不属于（not belong to）集合 $A$，记作：

\begin{equation}
a\notin A~
\end{equation}
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 3　属于与不属于 |
| 1 | assumption | — | 若 $a$ 在集合 $A$ 中 |
| 2 | definition | — | 称 $a$ 属于（belong to）集合 $A$，记作： |
| 3 | assertion | DSP | \begin{equation}
a \in A~.
\end{equation} |
| 4 | assumption | — | 若 $a$ 不在集合 $A$ 中 |
| 5 | definition | — | 称 $a$ 不属于（not belong to）集合 $A$，记作： |
| 6 | assertion | DSP | \begin{equation}
a\notin A~
\end{equation} |

**⚠ 悬置**:
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s6: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("：定义", let_bind) { n1, n2 }
  - Scope("：定义", let_bind) { n4, n5 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 3　属于与不属于
[  ]  s1  若 $a$ 在集合 $A$ 中
[  ]  s2  称 $a$ 属于（belong to）集合 $A$，记作：
[  ]  s3  \begin{equation}
a \in A~.
\end{equation}
[  ]  s4  若 $a$ 不在集合 $A$ 中
[  ]  s5  称 $a$ 不属于（not belong to）集合 $A$，记作：
[  ]  s6  \begin{equation}
a\notin A~
\end{equation}

# 边:

# Scope:
```

---
## E10  definition — 定义 4

```
定义 4　空集
　　
如果任何元素都不属于某个集合，则这个集合称为空集（empty set），记作 $\varnothing$，即对所有的元素 $a$：

\begin{equation}
a\notin\varnothing~.
\end{equation}
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 4　空集 |
| 1 | assumption | — | 如果任何元素都不属于某个集合 |
| 2 | definition | — | 则这个集合称为空集（empty set） |
| 3 | definition | — | 记作 $\varnothing$，即对所有的元素 $a$： |
| 4 | assertion | DSP | \begin{equation}
a\notin\varnothing~.
\end{equation} |

**⚠ 悬置**:
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("空集（empty set）定义", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 4　空集
[  ]  s1  如果任何元素都不属于某个集合
[  ]  s2  则这个集合称为空集（empty set）
[  ]  s3  记作 $\varnothing$，即对所有的元素 $a$：
[  ]  s4  \begin{equation}
a\notin\varnothing~.
\end{equation}

# 边:

# Scope:
```

---
## E11  definition — 定义 5

```
定义 5　*有限集和无限集
　　
若集合含有有限多个元素，则称之为有限集，否则称之为无限集7。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 5　*有限集和无限集 |
| 1 | assumption | — | 若集合含有有限多个元素 |
| 2 | definition | — | 则称之为有限集，否则称之为无限集7 |

**🤖 推断器 Scope 参考**:
  - Scope("无限集7定义", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 5　*有限集和无限集
[  ]  s1  若集合含有有限多个元素
[  ]  s2  则称之为有限集，否则称之为无限集7

# 边:

# Scope:
```

---
## E12  definition — 定义 6

```
定义 6　集合相等
　　
对集合 A、B，若他们的元素完全相同，则称他们相等(equal)，记作：

\begin{equation}
A=B~.
\end{equation}
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 6　集合相等 |
| 1 | assertion | UCL | 对集合 A、B，若他们的元素完全相同 |
| 2 | definition | — | 则称他们相等(equal) |
| 3 | definition | — | 记作： |
| 4 | assertion | DSP | \begin{equation}
A=B~.
\end{equation} |

**⚠ 悬置**:
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 6　集合相等
[  ]  s1  对集合 A、B，若他们的元素完全相同
[  ]  s2  则称他们相等(equal)
[  ]  s3  记作：
[  ]  s4  \begin{equation}
A=B~.
\end{equation}

# 边:

# Scope:
```

---
## E13  definition — 定义 7

```
定义 7　子集
　　
对两个集合 $A,B$，若 $A$ 的所有元素都属于集合 $B$，即对所有的元素 $a$，只要有 $a\in A$，就有 $a\in B$，则称集合 $A$ 是集合 $B$ 的子集（subset），或者说集合 $B$包含集合 $A$、集合 $A$包含于集合 $B$，记作

\begin{equation}
A \subseteq B\qquad\text{或者}\qquad B \supseteq A~.
\end{equation}

否则，若存在 $A$ 的某个元素不属于集合 $B$，即 $\exists a\in A,a\notin B$，则称集合 $A$ 不是集合 $B$ 的子集，或者说集合 $B$不包含集合 $A$、集合 $A$不包含于集合 $B$，记作

\begin{equation}
A \nsubseteq B\qquad\text{或者}\qquad B \nsupseteq A~.
\end{equation}

规定，空集是任何集合的子集，即对任意一个集合 $A$：

\begin{equation}
\varnothing \subset
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 7　子集 |
| 1 | assertion | UCL | 对两个集合 $A,B$，若 $A$ 的所有元素都属于集合 $B$ |
| 2 | conclusion | — | 即对所有的元素 $a$，只要有 $a\in A$，就有 $a\in B$ |
| 3 | definition | — | 则称集合 $A$ 是集合 $B$ 的子集（subset），或者说集合 $B$包含集合 $A$、集合 $A$包含于集合 $B$ |
| 4 | definition | — | 记作 |
| 5 | assertion | DSP | \begin{equation}
A \subseteq B\qquad\text{或者}\qquad B \supseteq A~.
\end{equation} |
| 6 | quantified | — | 否则，若存在 $A$ 的某个元素不属于集合 $B$ |
| 7 | conclusion | — | 即 $\exists a\in A,a\notin B$ |
| 8 | definition | — | 则称集合 $A$ 不是集合 $B$ 的子集，或者说集合 $B$不包含集合 $A$、集合 $A$不包含于集合 $B$ |
| 9 | definition | — | 记作 |
| 10 | assertion | DSP | \begin{equation}
A \nsubseteq B\qquad\text{或者}\qquad B \nsupseteq A~.
\end{equation} |
| 11 | assertion | UCL | 规定，空集是任何集合的子集 |
| 12 | conclusion | — | 即对任意一个集合 $A$： |
| 13 | assertion | DSP | \begin{equation}
\varnothing \subseteq A~.
\end{equation} |

**⚠ 悬置**:
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s5: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s10: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s11: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s13: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 7　子集
[  ]  s1  对两个集合 $A,B$，若 $A$ 的所有元素都属于集合 $B$
[  ]  s2  即对所有的元素 $a$，只要有 $a\in A$，就有 $a\in B$
[  ]  s3  则称集合 $A$ 是集合 $B$ 的子集（subset），或者说集合 $B$包含集合 $A$、集合 $A$包含于集合 $B$
[  ]  s4  记作
[  ]  s5  \begin{equation}
A \subseteq B\qquad\text{或者}\qquad B \supseteq A~.
\end{equation}
[  ]  s6  否则，若存在 $A$ 的某个元素不属于集合 $B$
[  ]  s7  即 $\exists a\in A,a\notin B$
[  ]  s8  则称集合 $A$ 不是集合 $B$ 的子集，或者说集合 $B$不包含集合 $A$、集合 $A$不包含于集合 $B$
[  ]  s9  记作
[  ]  s10  \begin{equation}
A \nsubseteq B\qquad\text{或者}\qquad B \nsupseteq A~.
\end{equation}
[  ]  s11  规定，空集是任何集合的子集
[  ]  s12  即对任意一个集合 $A$：
[  ]  s13  \begin{equation}
\varnothing \subseteq A~.
\end{equation}

# 边:

# Scope:
```

---
## E14  theorem — 定理 1

```
定理 1　根据子集关系判断集合相等
　　
如果两个集合互为对方的子集，那么他们相等，即：

\begin{equation}
A\subseteq B,B\subseteq A\implies A=B~.
\end{equation}
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 定理 1　根据子集关系判断集合相等 |
| 1 | assumption | — | 如果两个集合互为对方的子集 |
| 2 | conclusion | — | 那么他们相等，即： |
| 3 | assertion | DSP | \begin{equation}
A\subseteq B,B\subseteq A\implies A=B~.
\end{equation} |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("他们相等，即：", let_bind) { n1, n2 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定理 1　根据子集关系判断集合相等
[  ]  s1  如果两个集合互为对方的子集
[  ]  s2  那么他们相等，即：
[  ]  s3  \begin{equation}
A\subseteq B,B\subseteq A\implies A=B~.
\end{equation}

# 边:

# Scope:
```

---
## E15  definition — 定义 8

```
定义 8　真子集
　　
对于两个集合，$A$ 与 $B$，如果 $A\subseteq B$，并且 $A \ne B$，我们就说集合 $A$ 是集合 $B$ 的真子集，或者集合 $A$ 真包含于集合 $B$、集合 $B$ 真包含集合 $A$，记作：9

\begin{equation}
A \subsetneqq B\qquad\text{或者}\qquad B \supsetneqq A~.
\end{equation}
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 8　真子集 |
| 1 | assertion | UCL | 对于两个集合，$A$ 与 $B$，如果 $A\subseteq B$，并且 $A \ne B$，我们就说集合 $A$ 是集合 $B$ 的真子集，或者集合 $A$ 真包含于集合 $B$、集合 $B$ 真包含集合 $A$ |
| 2 | definition | — | 记作：9 |
| 3 | assertion | DSP | \begin{equation}
A \subsetneqq B\qquad\text{或者}\qquad B \supsetneqq A~.
\end{equation} |

**⚠ 悬置**:
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s3: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 8　真子集
[  ]  s1  对于两个集合，$A$ 与 $B$，如果 $A\subseteq B$，并且 $A \ne B$，我们就说集合 $A$ 是集合 $B$ 的真子集，或者集合 $A$ 真包含于集合 $B$、集合 $B$ 真包含集合 $A$
[  ]  s2  记作：9
[  ]  s3  \begin{equation}
A \subsetneqq B\qquad\text{或者}\qquad B \supsetneqq A~.
\end{equation}

# 边:

# Scope:
```

---
## E16  exercise — 习题 1

```
习题 1　用列举法列出满足 $\{1\}\subseteq A\subsetneqq\{1,2,4\}$ 的所有集合 $A$
　　
对 $\{1\}\subseteq A$，由子集的定义，$1\in A$。对 $A\subsetneqq\{1,2,4\}$ 由真子集的定义，$A\neq \{1,2,4\}$，且 $2,4$ 可以属于 $A$。因此：

　　
$A$ 可以是 $\{1\},\{1,2\},\{1,4\}$。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 习题 1　用列举法列出满足 $\{1\}\subseteq A\subsetneqq\{1,2,4\}$ 的所有集合 $A$ |
| 1 | definition | — | 对 $\{1\}\subseteq A$，由子集的定义，$1\in A$ |
| 2 | definition | — | 对 $A\subsetneqq\{1,2,4\}$ 由真子集的定义，$A\neq \{1,2,4\}$，且 $2,4$ 可以属于 $A$ |
| 3 | conclusion | — | 因此： |
| 4 | assertion | UCL | $A$ 可以是 $\{1\},\{1,2\},\{1,4\}$ |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断
  - [unclassified] s4: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  习题 1　用列举法列出满足 $\{1\}\subseteq A\subsetneqq\{1,2,4\}$ 的所有集合 $A$
[  ]  s1  对 $\{1\}\subseteq A$，由子集的定义，$1\in A$
[  ]  s2  对 $A\subsetneqq\{1,2,4\}$ 由真子集的定义，$A\neq \{1,2,4\}$，且 $2,4$ 可以属于 $A$
[  ]  s3  因此：
[  ]  s4  $A$ 可以是 $\{1\},\{1,2\},\{1,4\}$

# 边:

# Scope:
```

---
## E17  definition — 定义 9

```
定义 9　全集
　　
研究集合间的关系时，如果要研究的集合全都是某个集合的子集，也即涉及到的要研究的元素全都在这个集合中，则称这个集合为全集（universal set），常用符号 $U$ 表示。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 9　全集 |
| 1 | assertion | UCL | 研究集合间的关系时，如果要研究的集合全都是某个集合的子集，也即涉及到的要研究的元素全都在这个集合中 |
| 2 | definition | — | 则称这个集合为全集（universal set），常用符号 $U$ 表示 |

**⚠ 悬置**:
  - [unclassified] s1: 句子无任何已知触发词，逻辑角色完全无法自动判断

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 9　全集
[  ]  s1  研究集合间的关系时，如果要研究的集合全都是某个集合的子集，也即涉及到的要研究的元素全都在这个集合中
[  ]  s2  则称这个集合为全集（universal set），常用符号 $U$ 表示

# 边:

# Scope:
```

---
## E18  definition — 定义 10

```
定义 10　补集
　　
给定全集 $U$。任取 $U$ 的子集 $A$，有一个集合 $B$，使得 $A\cap B=\varnothing$（$A$、$B$ 不交）且 $A\cup B=X$（任何元素不是在 $A$ 中就是在 $B$ 中），那么称 $B$ 是 $A$（相对于 $U$）的补集，记为 $\complement_UA$。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | definition | — | 定义 10　补集 |
| 1 | assumption | — | 给定全集 $U$ |
| 2 | quantified | — | 任取 $U$ 的子集 $A$，有一个集合 $B$，使得 $A\cap B=\varnothing$（$A$、$B$ 不交）且 $A\cup B=X$（任何元素不是在 $A$ 中就是在 $B$ 中） |
| 3 | definition | — | 那么称 $B$ 是 $A$（相对于 $U$）的补集，记为 $\complement_UA$ |

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  定义 10　补集
[  ]  s1  给定全集 $U$
[  ]  s2  任取 $U$ 的子集 $A$，有一个集合 $B$，使得 $A\cap B=\varnothing$（$A$、$B$ 不交）且 $A\cup B=X$（任何元素不是在 $A$ 中就是在 $B$ 中）
[  ]  s3  那么称 $B$ 是 $A$（相对于 $U$）的补集，记为 $\complement_UA$

# 边:

# Scope:
```

---
## E19  example — 例 7

```
例 7　补集的例子
 设全班同学为全集，则全体男生构成的子集，其补集为全体女生构成的子集。
 设实数集 $\mathbf{R}$ 为全集，则 $\complement_\mathbf{R}[a, b]=(-\infty, a)\cup(b, +\infty)$。
 设 $U=\{1, 2, 3, 4, 5, 6\}$ 为全集，令 $A=\{2, 3, 6\}$，则 $\complement_UA=\{1, 4, 5\}$。
 设整数集 $\mathbf{Z}$ 为全集，则 $\complement_\mathbf{Z}\{\text{全体偶数}\}=\{\text{全体奇数}\}$。
```

| # | 机器分类 | 悬置 | 原文 |
|---|---|---|---|
| 0 | assertion | UCL | 例 7　补集的例子 |
| 1 | assumption | — | 设全班同学为全集 |
| 2 | conclusion | — | 则全体男生构成的子集，其补集为全体女生构成的子集。 |
| 3 | assumption | — | 设实数集 $\mathbf{R}$ 为全集 |
| 4 | conclusion | — | 则 $\complement_\mathbf{R}[a, b]=(-\infty, a)\cup(b, +\infty)$。 |
| 5 | assumption | — | 设 $U=\{1, 2, 3, 4, 5, 6\}$ 为全集，令 $A=\{2, 3, 6\}$ |
| 6 | conclusion | — | 则 $\complement_UA=\{1, 4, 5\}$。 |
| 7 | assumption | — | 设整数集 $\mathbf{Z}$ 为全集 |
| 8 | conclusion | — | 则 $\complement_\mathbf{Z}\{\text{全体偶数}\}=\{\text{全体奇数}\}$ |

**⚠ 悬置**:
  - [unclassified] s0: 句子无任何已知触发词，逻辑角色完全无法自动判断

**🤖 推断器 Scope 参考**:
  - Scope("全体男生构成的子集，其补集为全体女生构成的子集。", let_bind) { n1, n2 }
  - Scope("$\complement_\mathbf{R}[a, b]=(-…", let_bind) { n3, n4 }
  - Scope("$\complement_UA=\{1, 4, 5\}$。", let_bind) { n5, n6 }
  - Scope("$\complement_\mathbf{Z}\{\text{全…", let_bind) { n7, n8 }

### 📝 标注

```
# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio

[  ]  s0  例 7　补集的例子
[  ]  s1  设全班同学为全集
[  ]  s2  则全体男生构成的子集，其补集为全体女生构成的子集。
[  ]  s3  设实数集 $\mathbf{R}$ 为全集
[  ]  s4  则 $\complement_\mathbf{R}[a, b]=(-\infty, a)\cup(b, +\infty)$。
[  ]  s5  设 $U=\{1, 2, 3, 4, 5, 6\}$ 为全集，令 $A=\{2, 3, 6\}$
[  ]  s6  则 $\complement_UA=\{1, 4, 5\}$。
[  ]  s7  设整数集 $\mathbf{Z}$ 为全集
[  ]  s8  则 $\complement_\mathbf{Z}\{\text{全体偶数}\}=\{\text{全体奇数}\}$

# 边:

# Scope:
```