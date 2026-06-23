import { splitSentences } from '../sentenceSplitter.js';

const tests: { name: string; input: string }[] = [
  {
    name: '基础：设…则称…',
    input: '设 f(x) 是以 2π 为周期的函数，且在 [-π,π] 上有界可积，则称 a_n 为 f 的 Fourier 系数。',
  },
  {
    name: '孤悬等式 + 结论',
    input: '|f+g| ≤ |f| + |g|。因此 lim(f+g) = L+M。',
  },
  {
    name: '公式内含逗号不误切',
    input: '设 $a, b \\in \\mathbb{R}$ 且 $a > 0, b > 0$。则 $a+b > 0$。',
  },
  {
    name: '分号分隔',
    input: 'f 在 [a,b] 上连续；g 在 [a,b] 上有界。',
  },
  {
    name: '若…则跨逗号',
    input: '若 f 在 R 上连续，则 f 有界。',
  },
  // ── 新增：condition / equivalence / 多种定义模式 ──
  {
    name: '条件分叉：当…时',
    input: '当 x > 0 时，函数 f(x) 单调递增。当 x < 0 时，函数 f(x) 单调递减。',
  },
  {
    name: '等价标记：当且仅当',
    input: '函数 f 在 x₀ 处连续，当且仅当对于任意 ε > 0，存在 δ > 0 使得 |x-x₀|<δ 蕴含 |f(x)-f(x₀)|<ε。',
  },
  {
    name: '定义模式：所谓…是指…',
    input: '所谓函数 f 在 x₀ 处可导，是指存在极限 lim_{h→0} (f(x₀+h)-f(x₀))/h。',
  },
  {
    name: '定义模式：形如…称为…',
    input: '形如 "若 P，则 Q" 的复合命题称为条件命题，记作 P→Q。',
  },
  {
    name: '定义模式：定义为',
    input: '定义形式微商算子 D: F[x]→F[x] 为对多项式求形式导数。',
  },
  {
    name: '歧义检测：多触发词冲突',
    input: '当 x>0 时若对任意 y 都有 f(y)≥f(x) 则称 x 为极大值点，那么 f 在 x 处取到极大值。',
  },
  {
    name: '存在唯一：有且仅有',
    input: '方程 f(x)=0 在区间 [a,b] 上有且仅有一个实根。',
  },
  {
    name: '充要条件',
    input: '域 F 是完全域的充要条件是：F 上任意不可约多项式在其分裂域中无重根。',
  },
  {
    name: '给定…称…（定义）',
    input: '给定实数域 R 上的 n 维线性空间 V，称 f: V→R 为 V 上的一个线性函数。',
  },
];

for (const { name, input } of tests) {
  console.log(`\n=== ${name} ===`);
  console.log(`IN:  ${input}`);
  const result = splitSentences(input);
  for (let j = 0; j < result.sentences.length; j++) {
    const s = result.sentences[j];
    console.log(` [${j}] ${s.subtype}: "${s.original}"`);
    if (s.flags.length) console.log(`      flags: ${s.flags.join(', ')}`);
  }
  if (result.unresolved.length) {
    console.log(` ⚠ unresolved:`);
    for (const u of result.unresolved) {
      console.log(`    - [${u.type}] s${u.sentenceIndex}: ${u.detail}`);
    }
  }
}
