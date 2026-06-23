import { splitSentences } from '../sentenceSplitter.js';
import { inferEdges } from '../edgeInferrer.js';

const samples: { source: string; text: string }[] = [
  {
    source: '环 - 半群和幺半群定义',
    text:
      '给定集合 $G$ 及其上的一个运算，运算符号忽略。' +
      '如果运算满足封闭性和结合性，那么称 $G$ 配合该运算构成一个半群。' +
      '如果半群中含单位元，则构成一个幺半群。',
  },
  {
    source: '环 - 环的定义',
    text:
      '一个环是一个集合 $R$ 与两种运算"加"和"乘"，分别记为 $+$ 和 $\\cdot$。' +
      '其中加法配合 $R$ 中所有元素构成一个阿贝尔群，加法群的单位元通常称为零元，记为 $0$；' +
      '乘法配合集合 $R$ 构成一个幺半群，其单位元通常称为幺元，记为 $1$。' +
      '另外还要求加法和乘法满足左分配律和右分配律。',
  },
  {
    source: '环 - 子环定义',
    text:
      '给定一个环 $R$，如果 $S$ 是 $R$ 的子集，并且在继承 $R$ 的两个运算后也构成环，那么称 $S$ 是 $R$ 的子环。',
  },
  {
    source: '泰勒展开 - 幂级数和收敛半径',
    text:
      '我们把形如 $\\sum_{n=0}^\\infty c_n (x-x_0)^n$ 的表达式叫做幂级数。' +
      '如果某幂级数收敛的点不止 $x_0$ 一点，那么必定存在一个收敛半径 $r>0$，使得当 $|x-x_0|<r$ 时幂级数收敛，当 $|x-x_0|>r$ 时幂级数必定发散。',
  },
  {
    source: '泰勒展开 - 系数公式推导',
    text:
      '我们假设当项数 $N\\to\\infty$ 时，存在唯一的多项式在某区间内处处趋于无穷可导函数 $f(x)$，即 $f(x)=\\sum c_n(x-x_0)^n$。' +
      '首先代入 $x=x_0$，可得 $c_0=f(x_0)$。' +
      '现在对等式两边在 $x_0$ 处求导，得 $f\'(x_0)=c_1$。' +
      '如果求二阶导数，得 $f\'\'(x_0)=2c_2$，即 $c_2=f\'\'(x_0)/2!$。' +
      '以此类推得系数公式 $c_m=\\frac{1}{m!}f^{(m)}(x_0)$。',
  },
];

for (const { source, text } of samples) {
  console.log(`\n${'═'.repeat(65)}`);
  console.log(`来源: ${source}`);
  console.log(`原文: ${text}`);
  console.log('');

  const split = splitSentences(text);
  console.log('【分句】');
  split.sentences.forEach((s, i) =>
    console.log(`  [${i}] ${s.subtype.padEnd(12)} ${s.original.slice(0, 90)}`)
  );

  const result = inferEdges(split.sentences);

  console.log('\n【节点】');
  for (const n of result.allNodes) {
    const inScope = result.scopes.filter(s => s.children.includes(n.id));
    const loc = inScope.length ? `→ ${inScope.map(s => s.label).join(', ')}` : '(顶层)';
    console.log(`  ${n.id} ${n.subtype.padEnd(12)} ${loc}`);
    console.log(`       "${n.label}"`);
  }

  if (result.scopes.length) {
    console.log('\n【Scope】');
    for (const s of result.scopes) {
      console.log(`  ${s.id} kind=${s.kind} "${s.label}"`);
      for (const e of s.edges) {
        console.log(`    └─ ${e.from} --[${e.edge_type}]--> ${e.to}`);
      }
    }
  }

  if (result.scopeEdges.length) {
    console.log('\n【Scope 间边】');
    for (const e of result.scopeEdges) {
      console.log(`  ${e.from} --[${e.edge_type}]--> ${e.to} ${e.unresolved ? '(⚑heuristical)' : ''}`);
    }
  }

  if (result.unresolved.length) {
    console.log('【悬置】');
    result.unresolved.forEach(u => console.log(`  ⚠ ${u}`));
  }
}
