import { splitSentences } from '../sentenceSplitter.js';
import { inferEdges } from '../edgeInferrer.js';

const text =
  '考虑实函数 $f(x)$。' +
  '如果存在一个实数轴上的开集 $O$，且有 $x_0\\in O$，使得对于任意的 $x\\in O$，都有 $f(x_0)\\geq f(x)$，则称 $f(x_0)$ 是 $f$ 在 $O$ 上的一个极大值。' +
  '如果 $x_0$ 是 $f$ 的一个极值点，且 $f(x)$ 在 $x_0$ 处可导，那么 $f\'(x_0)=0$。' +
  '设 $f(x)$ 在区间 $[a, b]$ 上连续，在 $(a, b)$ 内可导，且 $f(a)=f(b)$，那么存在一个 $x_0\\in(a, b)$，使得 $f\'(x_0)=0$。';

const split = splitSentences(text);
const result = inferEdges(split.sentences);

console.log('INPUT:');
console.log(text);
console.log('\n' + '═'.repeat(65));

// ── 分句 ──
console.log('\n【分句】');
split.sentences.forEach((s, i) =>
  console.log(`  [${i}] ${s.subtype.padEnd(12)} ${s.original.slice(0, 90)}`)
);

// ── 全部节点 ──
console.log('\n【节点（一句一节点）】');
for (const n of result.allNodes) {
  const inScope = result.scopes.filter(s => s.children.includes(n.id));
  const scopeNames = inScope.map(s => s.label).join(', ');
  const loc = inScope.length ? `(Scope: ${scopeNames})` : '(顶层)';
  console.log(`  ${n.id.padEnd(4)} ${n.subtype.padEnd(12)} ${loc.padEnd(30)} "${n.label.slice(0, 80)}"`);
}

// ── Scope ──
console.log('\n【Scope】');
for (const s of result.scopes) {
  const childNodes = s.children.map(cid => result.allNodes.find(n => n.id === cid));
  console.log(`  ${s.id}  kind=${s.kind}  "${s.label}"`);
  for (const cn of childNodes) {
    if (cn) console.log(`    ├─ ${cn.id} [${cn.subtype}] "${cn.label.slice(0, 70)}"`);
  }
  for (const e of s.edges) {
    console.log(`    └─ 边: ${e.from} --[${e.edge_type}]--> ${e.to}`);
  }
}

// ── Scope 间边 ──
if (result.scopeEdges.length) {
  console.log('\n【Scope 间边】');
  for (const e of result.scopeEdges) {
    console.log(`  ${e.from} --[${e.edge_type}]--> ${e.to}  ${e.unresolved || ''}`);
  }
}

// ── 悬置 ──
if (result.unresolved.length) {
  console.log('\n【悬置】');
  result.unresolved.forEach(u => console.log(`  ⚠ ${u}`));
}
