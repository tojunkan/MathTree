-- MathTree Seed Data: 微积分 + Fourier分析 示例
-- 这是一个小型的示例知识树，帮助理解系统如何工作

-- ============ Domains ============
INSERT OR IGNORE INTO domains (id, name, parent_id, color) VALUES
  ('d-root', '数学基础', NULL, '#6366f1'),
  ('d-analysis', '分析学', 'd-root', '#8b5cf6'),
  ('d-calculus', '微积分', 'd-analysis', '#a855f7'),
  ('d-fourier', 'Fourier分析', 'd-analysis', '#d946ef'),
  ('d-algebra', '代数学', 'd-root', '#f59e0b');

-- ============ Properties ============
INSERT OR IGNORE INTO properties (id, name, description) VALUES
  ('prop-completeness', '完备性', 'Cauchy序列必收敛'),
  ('prop-continuity', '连续性', '函数在小变化下输出变化小'),
  ('prop-differentiability', '可微性', '函数在某点导数存在'),
  ('prop-integrability', '可积性', '函数在某区间上Riemann/Lebesgue可积'),
  ('prop-orthogonality', '正交性', '内积为零；基函数两两正交'),
  ('prop-periodicity', '周期性', 'f(x+T)=f(x)对某T>0成立'),
  ('prop-boundedness', '有界性', '存在常数M使得|f(x)|≤M'),
  ('prop-linearity', '线性性', 'T(af+bg)=aT(f)+bT(g)'),
  ('prop-positivity', '正性', 'exp(x)>0对所有实数x成立'),
  ('prop-convergence', '收敛性', '序列/级数趋于有限极限'),
  ('prop-positive-definiteness', '正定性', '内积空间中的⟨x,x⟩≥0且等号仅当x=0');

-- ============ Math Ideas ============
INSERT OR IGNORE INTO math_ideas (id, name, description) VALUES
  ('mi-induction', '数学归纳法', '从n到n+1的递推证明方法'),
  ('mi-epsilon-delta', 'ε-δ 极限语言', '用ε-δ不等式精确定义极限'),
  ('mi-orthogonal-decomp', '正交分解', '将函数投影到正交基上'),
  ('mi-diagonalization', '对角线论证', 'Cantor对角线法的变体'),
  ('mi-completion', '完备化', '将不完备空间中的Cauchy序列的等价类作为新元素');

-- ============ Nodes (Items) ============
INSERT OR IGNORE INTO nodes (id, type, label, description) VALUES
  ('i-real', 'I', '实数 ℝ',
   '实数集，包含有理数和无理数。具有**完备性**：任意有上界的非空子集必有上确界。'),
  ('i-real-func', 'I', '实值函数',
   '定义在实数集或其子集上、取实数值的函数 $f: D \\to \\mathbb{R}$。'),
  ('i-l2', 'I', 'L² 空间',
   '平方可积函数构成的内积空间，配备内积 $\\langle f,g \\rangle = \\int f\\bar{g}$。具有**完备性**和**正交性**结构。'),
  ('i-trig', 'I', '三角函数系',
   '$\\{1, \\cos nx, \\sin nx\\}_{n=1}^{\\infty}$ 在 $[-\\pi, \\pi]$ 上构成一组正交函数系。'),
  ('i-exp', 'I', '指数函数 exp(x)',
   '$e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}$。最重要的性质：**正性**（$e^x > 0, \\forall x$）和 $(e^x)'' = e^x$。'),
  ('i-integral', 'I', 'Riemann 积分',
   '通过对定义域划分求和取极限来定义的积分。满足**线性性**。'),
  ('i-inner-product', 'I', '内积空间',
   '配备了内积运算 $\\langle \\cdot, \\cdot \\rangle$ 的向量空间。具有**正定性**和**线性性**。');

-- ============ Nodes (Theorems: 实数完备性六大等价表述) ============
INSERT OR IGNORE INTO nodes (id, type, label, description) VALUES
  ('t-supremum', 'T', '确界原理',
   '非空有上界的实数子集必有上确界。这是实数完备性最经典的表述，也被称为最小上界性质。'),
  ('t-monotone-bounded', 'T', '单调有界定理',
   '单调递增且有上界的实数序列必收敛。单调递减且有下界的序列同理。'),
  ('t-cauchy', 'T', 'Cauchy 收敛准则',
   '实数序列收敛的充要条件是它是 Cauchy 序列：$\\forall \\varepsilon>0, \\exists N, \\forall m,n>N, |a_m-a_n|<\\varepsilon$。'),
  ('t-nested-interval', 'T', '闭区间套定理',
   '若 $[a_n,b_n]$ 满足 $[a_{n+1},b_{n+1}]\\subseteq[a_n,b_n]$ 且 $b_n-a_n\\to 0$，则存在唯一的 $\\xi$ 属于所有区间。'),
  ('t-bw', 'T', 'Bolzano-Weierstrass 定理（聚点原理）',
   '有界无穷集合必有聚点。等价地说，有界序列必有收敛子列。'),
  ('t-heine-borel', 'T', 'Heine-Borel 有限覆盖定理',
   '闭区间 $[a,b]$ 的任意开覆盖必有有限子覆盖。这是紧致性在实数中的具体体现。'),

  -- G node: 完备性 (虚顶点，封装六大等价定理)
  ('g-completeness', 'G', '完备性',
   '实数完备性的六大等价表述的封装。对外只需知道"实数具有完备性"即可，内部展开可见确界原理、单调有界、Cauchy准则等六个定理及其等价关系。'),

  -- Other theorems
  ('t-exp-prop', 'T', '指数函数的基本性质',
   'exp(x) 满足：exp(x)>0（正性）、exp''(x)=exp(x)（自导性）、exp(x+y)=exp(x)exp(y)（指数律）。'),
  ('t-parseval', 'T', 'Parseval 恒等式',
   '对于平方可积的周期函数，其 Fourier 系数的平方和等于函数本身的 $L^2$ 范数：$\\sum |c_n|^2 = \\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} |f(x)|^2 dx$。'),
  ('t-fourier-conv', 'T', 'Fourier 级数的收敛定理',
   '满足 Dirichlet 条件的周期函数，其 Fourier 级数逐点收敛到函数在该点的左右极限的平均值。'),
  ('t-riemann-int', 'T', 'Riemann 可积的充要条件',
   '有界函数 $f$ 在 $[a,b]$ 上 Riemann 可积当且仅当其不连续点集为零测集（Lebesgue准则）。'),
  ('t-ftc', 'T', '微积分基本定理',
   '若 $F'' = f$ 且 $f$ 在 $[a,b]$ 上可积，则 $\\int_a^b f = F(b) - F(a)$。建立了微分与积分的互逆关系。');

-- ============ Proofs ============
INSERT OR IGNORE INTO proofs (id, theorem_id, title, content, is_primary) VALUES
  -- Completeness equivalence proofs
  ('proof-supremum-1', 't-supremum', '确界原理 ⇒ 单调有界定理',
   '## 确界原理 ⇒ 单调有界定理\n\n设 $\\{a_n\\}$ 单调递增且有上界。\n\n由**确界原理**，集合 $\\{a_n\\}$ 有上确界 $M = \\sup\\{a_n\\}$。\n\n对任意 $\\varepsilon > 0$，$M - \\varepsilon$ 不是上界，故存在 $N$ 使得 $a_N > M - \\varepsilon$。\n\n由单调性，当 $n \\geq N$ 时：\n\n$$\nM - \\varepsilon < a_N \\leq a_n \\leq M < M + \\varepsilon\n$$\n\n即 $|a_n - M| < \\varepsilon$，故 $a_n \\to M$。', 1),
  ('proof-monotone-1', 't-monotone-bounded', '单调有界定理 ⇒ Cauchy收敛准则',
   '## 单调有界定理 ⇒ Cauchy收敛准则\n\n($\\Rightarrow$) 收敛必 Cauchy：由三角不等式直接可得。\n\n($\\Leftarrow$) 设 $\\{a_n\\}$ 为 Cauchy 序列。\n\n1. Cauchy 序列必有界（取 $\\varepsilon=1$，除有限项外全在 $(a_N-1,a_N+1)$ 内）\n2. 定义 $b_n = \\inf_{k \\geq n} a_k$，$c_n = \\sup_{k \\geq n} a_k$\n3. $\\{b_n\\}$ 单调递增有上界，$\\{c_n\\}$ 单调递减有下界\n4. 由单调有界定理，$b_n \\to L$，$c_n \\to L''$\n5. 由 Cauchy 性质推得 $L = L''$，故 $a_n \\to L$', 1),
  ('proof-cauchy-1', 't-cauchy', 'Cauchy收敛准则 ⇒ 闭区间套定理',
   '## Cauchy收敛准则 ⇒ 闭区间套定理\n\n设 $\\{[a_n,b_n]\\}$ 满足 $[a_{n+1},b_{n+1}]\\subseteq[a_n,b_n]$ 且 $b_n-a_n\\to 0$。\n\n1. $\\{a_n\\}$ 单调递增有上界（任意 $b_k$ 均为上界）\n2. $\\{b_n\\}$ 单调递减有下界\n3. 对任意 $\\varepsilon>0$，取 $N$ 使 $b_N-a_N<\\varepsilon$\n4. 当 $m,n \\geq N$ 时，$|a_m-a_n| \\leq b_N-a_N < \\varepsilon$\n5. 故 $\\{a_n\\}$ 为 Cauchy 序列，由 Cauchy 收敛准则，$a_n \\to \\xi$\n6. 同理 $b_n \\to \\xi$（因为 $|b_n-a_n|\\to 0$）\n7. $\\xi$ 属于所有 $[a_n,b_n]$（因 $a_n\\leq\\xi\\leq b_n$），唯一性由 $b_n-a_n\\to 0$ 保证', 1),
  ('proof-nested-1', 't-nested-interval', '闭区间套定理 ⇒ Bolzano-Weierstrass',
   '## 闭区间套定理 ⇒ Bolzano-Weierstrass\n\n设 $\\{x_n\\}$ 为有界序列。\n\n1. 取 $[a_1,b_1]$ 包含所有 $x_n$\n2. 将区间二分，至少有一半包含无穷多项，取之为 $[a_2,b_2]$\n3. 重复得区间套 $[a_k,b_k]$，长度 $\\to 0$\n4. 由闭区间套定理，存在唯一 $\\xi$ 属于所有 $[a_k,b_k]$\n5. 从每个区间中选取一项得子列 $x_{n_k}$，有 $|x_{n_k}-\\xi|\\leq (b_1-a_1)/2^k \\to 0$\n6. 故子列收敛于 $\\xi$，即 $\\xi$ 为聚点', 1),
  ('proof-bw-1', 't-bw', 'Bolzano-Weierstrass ⇒ Heine-Borel',
   '## Bolzano-Weierstrass ⇒ Heine-Borel\n\n设 $\\{U_\\alpha\\}$ 为 $[a,b]$ 的开覆盖。\n\n用反证法：假设无有限子覆盖。\n\n1. 将 $[a,b]$ 二分，至少有一半不能被有限覆盖，记为 $[a_1,b_1]$\n2. 重复得区间套 $[a_n,b_n]$，每个不能被有限覆盖\n3. 选取中点 $x_n$，由 BW 定理，有收敛子列 $x_{n_k}\\to\\xi\\in[a,b]$\n4. $\\xi$ 被某个 $U_{\\alpha_0}$ 覆盖，存在 $\\delta>0$ 使 $(\\xi-\\delta,\\xi+\\delta)\\subseteq U_{\\alpha_0}$\n5. 当 $k$ 足够大时，$[a_{n_k},b_{n_k}]\\subseteq(\\xi-\\delta,\\xi+\\delta)\\subseteq U_{\\alpha_0}$\n6. 这与 $[a_{n_k},b_{n_k}]$ 不能被有限覆盖矛盾', 1),
  ('proof-heine-1', 't-heine-borel', 'Heine-Borel ⇒ 确界原理',
   '## Heine-Borel ⇒ 确界原理\n\n设 $S\\subseteq\\mathbb{R}$ 非空有上界，要证其上确界存在。\n\n用反证法：设 $S$ 无上确界。\n\n1. 取 $a\\in S$，$b$ 为 $S$ 的上界\n2. 对每个 $x\\in[a,b]$：若 $x$ 为上界，则存在 $\\delta_x>0$ 使 $(x-\\delta_x,x]$ 中无 $S$ 的元素\n   若 $x$ 不是上界，则存在 $\\delta_x>0$ 使 $[x,x+\\delta_x)$ 中仍无上界\n3. $\\{(x-\\delta_x,x+\\delta_x)\\}$ 构成 $[a,b]$ 的开覆盖\n4. 由 Heine-Borel，有有限子覆盖\n5. 从 $a$ 出发逐个传递可推出矛盾（$b$ 不可能同时被覆盖又是上界）\n6. 故上确界必存在', 1),
  -- Other proofs
  ('proof-ftc-1', 't-ftc', 'Riemann和的标准证明',
   '## 微积分基本定理的证明\n\n### 第一部分\n设 $F''(x) = f(x)$。对 $[a,b]$ 的一个划分 $a = x_0 < x_1 < \\dots < x_n = b$：\n\n$$\nF(b) - F(a) = \\sum_{i=1}^n [F(x_i) - F(x_{i-1})]\n$$\n\n由 Lagrange 中值定理，存在 $\\xi_i \\in (x_{i-1}, x_i)$ 使得：\n\n$$\nF(x_i) - F(x_{i-1}) = f(\\xi_i)(x_i - x_{i-1})\n$$\n\n取极限使划分无限加密，即得 $\\int_a^b f(x)dx = F(b) - F(a)$。\n\n### 注意\n此证明用到了 Lagrange 中值定理，而中值定理又依赖于实数的完备性。', 1),
  ('proof-ftc-2', 't-ftc', 'Lebesgue积分的证明',
   '## 用 Lebesgue 积分证明\n\n在 Lebesgue 积分框架下：\n\n$$\nF(b) - F(a) = \\int_a^b F''(x) dx\n$$\n\n这实际上是 **Lebesgue 微分定理**的直接推论：\n绝对连续函数的导数几乎处处存在且可积。', 0),
  ('proof-parseval-1', 't-parseval', '正交分解证法',
   '## Parseval 恒等式的证明\n\n设 $f(x) = \\sum_{n=-\\infty}^{\\infty} c_n e^{inx}$ 为 Fourier 展开。\n\n计算 $L^2$ 范数：\n\n$$\n\\begin{aligned}\n\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} |f(x)|^2 dx \n&= \\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} \\left(\\sum_m c_m e^{imx}\\right)\\left(\\sum_n \\bar{c}_n e^{-inx}\\right) dx \\\\\n&= \\sum_{m,n} c_m \\bar{c}_n \\cdot \\frac{1}{2\\pi} \\int_{-\\pi}^{\\pi} e^{i(m-n)x} dx\n\\end{aligned}\n$$\n\n由三角函数的**正交性**，当 $m \\neq n$ 时积分为 0，$m = n$ 时为 1。\n\n故 $= \\sum_n |c_n|^2$。', 1),
  ('proof-fourier-1', 't-fourier-conv', 'Dirichlet核的标准证明',
   '## Fourier 级数收敛定理\n\n### Dirichlet 核\n\n设 $D_N(x) = \\frac{1}{2\\pi}\\sum_{n=-N}^{N} e^{inx} = \\frac{\\sin((N+1/2)x)}{2\\pi \\sin(x/2)}$。\n\n部分和为 $S_N(f)(x) = (f * D_N)(x)$。\n\n### 关键步骤\n\n1. Dirichlet 核的积分为 1：$\\int_{-\\pi}^{\\pi} D_N(x) dx = 1$\n2. 在满足 Dirichlet 条件时，$S_N(f)(x) \\to \\frac{f(x^+) + f(x^-)}{2}$\n3. 这由 **Riemann-Lebesgue 引理**保证：震荡积分在 $N \\to \\infty$ 时趋于零', 1),
  ('proof-exp-1', 't-exp-prop', '级数定义证法',
   '## 指数函数基本性质的证明\n\n### 正性的证明\n\n由级数定义 $e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}$：\n\n- 当 $x \\geq 0$ 时，所有项非负，且 $n=0$ 项为 1，故 $e^x \\geq 1 > 0$\n- 当 $x < 0$ 时，注意到 $e^x \\cdot e^{-x} = 1$（指数律），且 $e^{-x} > 0$，故 $e^x = 1/e^{-x} > 0$\n\n### 自导性的证明\n\n逐项求导：$\\frac{d}{dx} \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = \\sum_{n=1}^{\\infty} \\frac{x^{n-1}}{(n-1)!} = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}$', 1);

-- ============ Node Properties ============
INSERT OR IGNORE INTO node_properties (node_id, property_id) VALUES
  ('i-real', 'prop-completeness'),
  ('i-real', 'prop-boundedness'),
  ('i-real-func', 'prop-continuity'),
  ('i-real-func', 'prop-differentiability'),
  ('i-real-func', 'prop-integrability'),
  ('i-l2', 'prop-completeness'),
  ('i-l2', 'prop-orthogonality'),
  ('i-trig', 'prop-orthogonality'),
  ('i-trig', 'prop-periodicity'),
  ('i-exp', 'prop-positivity'),
  ('i-exp', 'prop-differentiability'),
  ('i-integral', 'prop-linearity'),
  ('i-inner-product', 'prop-positive-definiteness'),
  ('i-inner-product', 'prop-linearity'),
-- T nodes also can have "properties" (examples/applications)
  ('t-supremum', 'prop-completeness'),
  ('t-monotone-bounded', 'prop-completeness'),
  ('t-cauchy', 'prop-completeness'),
  ('t-nested-interval', 'prop-completeness'),
  ('t-bw', 'prop-completeness'),
  ('t-heine-borel', 'prop-completeness'),
  ('t-parseval', 'prop-orthogonality'),
  ('t-fourier-conv', 'prop-convergence'),
  ('t-ftc', 'prop-linearity'),
  -- G node inherits completeness property (intersection of all 6 members)
  ('g-completeness', 'prop-completeness');

-- ============ Group Members ============
INSERT OR IGNORE INTO group_members (group_id, member_id, sort_order) VALUES
  ('g-completeness', 't-supremum', 0),
  ('g-completeness', 't-monotone-bounded', 1),
  ('g-completeness', 't-cauchy', 2),
  ('g-completeness', 't-nested-interval', 3),
  ('g-completeness', 't-bw', 4),
  ('g-completeness', 't-heine-borel', 5);

-- ============ Edges ============
INSERT OR IGNORE INTO edges (id, source_id, target_id, label, proof_id, description) VALUES
  -- 完备性 G 节点的外部边
  ('e-cg1', 'i-real', 'g-completeness', '完备性', NULL, '实数的完备性被封装在G节点中，展开可见六大等价表述'),
  ('e-cg2', 'g-completeness', 'i-l2', '完备性', NULL, 'L²空间的完备性证明归结为实数域的完备性'),

  -- 六大定理间的等价环（内部边：当 G 折叠时隐藏，展开时显示）
  ('e-eq12', 't-supremum', 't-monotone-bounded', '等价', NULL, '确界原理 ⇒ 单调有界定理'),
  ('e-eq23', 't-monotone-bounded', 't-cauchy', '等价', NULL, '单调有界定理 ⇒ Cauchy准则'),
  ('e-eq34', 't-cauchy', 't-nested-interval', '等价', NULL, 'Cauchy准则 ⇒ 闭区间套定理'),
  ('e-eq45', 't-nested-interval', 't-bw', '等价', NULL, '闭区间套定理 ⇒ Bolzano-Weierstrass'),
  ('e-eq56', 't-bw', 't-heine-borel', '等价', NULL, 'Bolzano-Weierstrass ⇒ Heine-Borel'),
  ('e-eq61', 't-heine-borel', 't-supremum', '等价', NULL, 'Heine-Borel ⇒ 确界原理（环闭合！）'),

  -- Fourier级数收敛 ← L²空间完备性
  ('e1', 'i-l2', 't-fourier-conv', '完备性', 'proof-fourier-1', 'Fourier级数的逐点收敛依赖于L²空间的完备结构'),
  -- Fourier级数收敛 ← 三角函数正交性
  ('e2', 'i-trig', 't-fourier-conv', '正交性', 'proof-fourier-1', '正交性使得Fourier系数可通过内积投影唯一确定'),
  -- Parseval ← 三角函数正交性
  ('e3', 'i-trig', 't-parseval', '正交性', 'proof-parseval-1', '利用三角函数的正交性，交叉项积分为零'),
  -- Parseval ← L²完备性
  ('e4', 'i-l2', 't-parseval', '完备性', 'proof-parseval-1', 'Parseval恒等式本质上说Fourier级数是L²中的正交基展开'),
  -- exp性质 ← 实数
  ('e5', 'i-real', 't-exp-prop', '完备性', 'proof-exp-1', '级数定义的收敛性依赖于实数的完备性'),
  -- FTC ← Riemann积分线性性
  ('e6', 'i-integral', 't-ftc', '线性性', 'proof-ftc-1', '积分作为线性泛函，保证了F(b)-F(a)的分解有效性'),
  -- FTC ← 实数完备性
  ('e7', 'i-real', 't-ftc', '完备性', 'proof-ftc-1', 'Lagrange中值定理依赖于实数的完备性'),
  -- FTC 用于 Parseval（T→T！定理依赖定理）
  ('e9', 't-ftc', 't-parseval', '线性性', 'proof-parseval-1', '在Parseval证明的广义函数版本中需要用到FTC的积分表示'),
  -- exp正性：exp → 实数
  ('e10', 'i-exp', 'i-real', '正性', NULL, 'exp(x)恒正，这是exp函数最本质的属性之一'),
  -- (旧边 e11 已替换为 e-cg2: g-completeness → i-l2)
  -- Riemann可积 ← 内积空间（通过L²建立联系）
  ('e12', 'i-integral', 'i-inner-product', '线性性', NULL, 'Riemann积分的线性性是内积空间双线性性的原型');

-- ============ Node Domains ============
INSERT OR IGNORE INTO node_domains (node_id, domain_id) VALUES
  ('i-real', 'd-analysis'),
  ('i-real-func', 'd-calculus'),
  ('i-l2', 'd-fourier'),
  ('i-trig', 'd-fourier'),
  ('i-exp', 'd-calculus'),
  ('i-integral', 'd-calculus'),
  ('i-inner-product', 'd-analysis'),
  ('t-supremum', 'd-analysis'),
  ('t-monotone-bounded', 'd-analysis'),
  ('t-cauchy', 'd-analysis'),
  ('t-nested-interval', 'd-analysis'),
  ('t-bw', 'd-analysis'),
  ('t-heine-borel', 'd-analysis'),
  ('g-completeness', 'd-analysis'),
  ('t-exp-prop', 'd-calculus'),
  ('t-parseval', 'd-fourier'),
  ('t-fourier-conv', 'd-fourier'),
  ('t-riemann-int', 'd-calculus'),
  ('t-ftc', 'd-calculus');

-- ============ Node Math Ideas ============
INSERT OR IGNORE INTO node_math_ideas (node_id, idea_id) VALUES
  ('t-ftc', 'mi-epsilon-delta'),
  ('t-supremum', 'mi-diagonalization'),
  ('t-cauchy', 'mi-epsilon-delta'),
  ('t-bw', 'mi-diagonalization'),
  ('t-heine-borel', 'mi-diagonalization'),
  ('t-parseval', 'mi-orthogonal-decomp'),
  ('t-fourier-conv', 'mi-orthogonal-decomp'),
  ('t-exp-prop', 'mi-induction'),
  ('t-riemann-int', 'mi-epsilon-delta');
