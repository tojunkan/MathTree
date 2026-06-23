/**
 * 从小时百科（wuli.wiki）摘取的定理段落，用于验证分句器。
 */
import { splitSentences } from '../sentenceSplitter.js';

const samples: { source: string; text: string }[] = [
  {
    source: '微分中值定理 - Fermat 定理 + Rolle 定理',
    text:
      '考虑实函数 $f(x)$。如果存在一个实数轴上的开集 $O$，且有 $x_0\\in O$，使得对于任意的 $x\\in O$，都有 $f(x_0)\\geq f(x)$，则称 $f(x_0)$ 是 $f$ 在 $O$ 上的一个极大值。' +
      '如果 $x_0$ 是 $f$ 的一个极值点，且 $f(x)$ 在 $x_0$ 处可导，那么 $f\'(x_0)=0$。' +
      '设 $f(x)$ 在区间 $[a, b]$ 上连续，在 $(a, b)$ 内可导，且 $f(a)=f(b)$，那么存在一个 $x_0\\in(a, b)$，使得 $f\'(x_0)=0$。',
  },
  {
    source: '微分中值定理 - Lagrange + Cauchy',
    text:
      '若函数 $f(x)$ 在 $[a,b]$ 上连续，在 $(a,b)$ 内可导，则一定存在 $a<\\xi<b$ 使得 $f\'(\\xi)=\\frac{f(b)-f(a)}{b-a}$。' +
      '若函数 $f(x)$ 和 $g(x)$ 在 $[a,b]$ 上连续，在 $(a,b)$ 内可导，而且 $g\'(x)\\neq 0$，则在 $(a,b)$ 内至少存在一点 $\\xi$，使得 $\\frac{f\'(\\xi)}{g\'(\\xi)}=\\frac{f(b)-f(a)}{g(b)-g(a)}$。',
  },
  {
    source: '拓扑空间 - 拓扑公理',
    text:
      '对于任意给定的集合 $X$，如果我们按照一定规则将它的子集划分为开集和其它子集，那么所有开集的集合就叫做集合 $X$ 的一个拓扑 $\\mathcal{T}$。' +
      '这个规则是：空集 $\\varnothing$ 和 $X$ 本身必须是开子集；有限个开子集的交集为开子集；任意个开子集的并集为开子集。',
  },
  {
    source: '行列式 - 几何意义',
    text:
      '二阶行列式的绝对值对应平行四边形的面积。若把行列式的两列看成两个几何矢量的坐标，他们就是平行四边形的两条边。' +
      '当 $\\boldsymbol{\\mathbf{v}}_1$ 逆时针转动得到 $\\boldsymbol{\\mathbf{v}}_2$ 时，行列式的值为正，反之为负。',
  },
  {
    source: '群 - 群公理（自拟）',
    text:
      '设 $G$ 是一个非空集合，且在 $G$ 上定义了一个二元运算 $\\cdot$。若该运算满足结合律，且 $G$ 中存在单位元 $e$，且 $G$ 中每个元素都存在逆元，则称 $(G,\\cdot)$ 为一个群。',
  },
];

console.log('═'.repeat(70));
console.log('小时百科分句测试');
console.log('═'.repeat(70));

for (const { source, text } of samples) {
  console.log(`\n┌─ ${source}`);
  console.log(`│ 原文: ${text}`);
  console.log('├─ 分句结果:');
  const result = splitSentences(text);
  for (let i = 0; i < result.sentences.length; i++) {
    const s = result.sentences[i];
    console.log(`│ [${i}] ${s.subtype.padEnd(12)} │ ${s.original}`);
    if (s.flags.length) {
      console.log(`│      ⚑ ${s.flags.join(', ')}`);
    }
  }
  if (result.unresolved.length) {
    console.log('├─ 悬置:');
    for (const u of result.unresolved) {
      console.log(`│  ⚠ [${u.sentenceIndex}] ${u.type}: ${u.detail}`);
    }
  }
  console.log('└' + '─'.repeat(60));
}
