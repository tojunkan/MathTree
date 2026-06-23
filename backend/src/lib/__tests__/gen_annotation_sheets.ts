/**
 * 生成用户标注工作表。输出：data/annotation_sheets/*.md
 *
 * 约定：
 *   角色 [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他
 *   边     --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->
 *   Scope  Scope("名", kind) { ... }   kind: let_bind | cases | conditional | reductio
 */
import { splitSentences } from '../sentenceSplitter.js';
import { inferEdges } from '../edgeInferrer.js';
import * as fs from 'fs';
import * as path from 'path';

const PAGES_DIR = path.resolve('data/wuliwiki_pages');
const OUT_DIR = path.resolve('data/annotation_sheets');

const SELECTED = [
  { file: 'Group.json', desc: '代数基础 — 群的定义、定理、例题、习题' },
  { file: 'HsSet.json', desc: '高中数学 — 集合，大量定义，多种命名模式' },
  { file: 'LimOp.json', desc: '一元微积分 — 极限运算法则，定理' },
  { file: 'SpltFd.json', desc: '代数进阶 — 分裂域，定义/定理/推论/充要条件' },
];

function flagShort(flags: string[]): string {
  const m: Record<string, string> = {
    display_math: 'DSP', ambiguous: 'AMB', unclassified: 'UCL',
    equivalence: 'EQF', has_assumption_context: 'HAC', unique_existence: 'UEX',
  };
  return flags.map(f => m[f] || f).join(',') || '—';
}

function genSheet(file: string, desc: string): string {
  const fullPath = path.join(PAGES_DIR, file);
  if (!fs.existsSync(fullPath)) return `<!-- ${file} not found -->`;
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  const L: string[] = [];

  L.push(`# ${data.title || file} — 语义标注`);
  L.push('');
  L.push(`文章 \`${file}\` | Part: ${data.part} | 环境数: ${(data.environments||[]).length}`);
  L.push(`说明: ${desc}`);

  // 脚注
  if (data.footnotes?.length) {
    L.push(''); L.push('## 脚注');
    for (const fn of data.footnotes) L.push(`- [${fn.index}] ${fn.text.slice(0, 200)}`);
  }

  for (let ei = 0; ei < (data.environments || []).length; ei++) {
    const env = data.environments[ei];
    const text = (env.text || '').trim();
    if (text.length < 5) continue;

    const result = splitSentences(text);
    const inferred = inferEdges(result.sentences);

    L.push(''); L.push('---');
    L.push(`## E${ei + 1}  ${env.type} — ${env.heading || '(无标题)'}`);
    L.push('');
    L.push('```');
    L.push(text.slice(0, 500));
    L.push('```');
    L.push('');

    // 分句器输出表格
    L.push('| # | 机器分类 | 悬置 | 原文 |');
    L.push('|---|---|---|---|');
    for (let j = 0; j < result.sentences.length; j++) {
      const s = result.sentences[j];
      L.push(`| ${j} | ${s.subtype} | ${flagShort(s.flags)} | ${s.original.slice(0,130).replace(/\|/g,'\\|')} |`);
    }

    // 悬置
    if (result.unresolved.length) {
      L.push(''); L.push('**⚠ 悬置**:');
      for (const u of result.unresolved) L.push(`  - [${u.type}] s${u.sentenceIndex}: ${u.detail}`);
    }

    // Scope 机器参考
    if (inferred.scopes.length) {
      L.push(''); L.push('**🤖 推断器 Scope 参考**:');
      for (const sc of inferred.scopes) L.push(`  - Scope("${sc.label}", ${sc.kind}) { ${sc.children.join(', ')} }`);
    }

    // 用户标注区
    L.push(''); L.push('### 📝 标注');
    L.push('');
    L.push('```');
    L.push('# 角色: [AS]assumption [DF]definition [CL]conclusion [CD]condition [EQ]equivalence [QT]quantified [XX]其他');
    L.push('# 边:   --implies-->  --equivalent-->  --define-->  --case-->  --<自定义>-->');
    L.push('# Scope: Scope("名称", kind) { ... }   kind: let_bind | cases | conditional | reductio');
    L.push('');
    for (let j = 0; j < result.sentences.length; j++) {
      const s = result.sentences[j];
      L.push(`[  ]  s${j}  ${s.original.slice(0, 150)}`);
    }
    L.push('');
    L.push('# 边:');
    L.push('');
    L.push('# Scope:');
    L.push('```');
  }

  return L.join('\n');
}

// ── main ──
fs.mkdirSync(OUT_DIR, { recursive: true });

for (const { file, desc } of SELECTED) {
  console.log(`Generating: ${file}`);
  const out = path.join(OUT_DIR, file.replace('.json', '.md'));
  fs.writeFileSync(out, genSheet(file, desc), 'utf-8');
  const envs = (fs.readFileSync(out, 'utf-8').match(/^## E\d+/gm) || []).length;
  console.log(`  → ${out}  (${envs} environments)`);
}

// legend
const legend = `# 标注符号约定

## 语义角色
| 标记 | 含义 |
|------|------|
| [AS] | assumption — 前提/假设 |
| [DF] | definition — 定义 |
| [CL] | conclusion — 结论 |
| [CD] | condition — 分类讨论 |
| [EQ] | equivalence — 等价/充要 |
| [QT] | quantified — 量词句 |
| [XX] | 其他（请注） |

## 边
| 写法 | 含义 |
|------|------|
| --implies--> | 逻辑推出 |
| --equivalent--> | 等价 |
| --define--> | 定义产出 |
| --case--> | 分类讨论分叉 |

## Scope
\`Scope("名称", kind) { ... }\`
kind: let_bind | cases | conditional | reductio

## 悬置缩写
| 缩写 | 含义 |
|------|------|
| DSP | display_math (纯显示公式) |
| AMB | ambiguous (多触发词冲突) |
| UCL | unclassified (无法分类) |
| EQF | equivalence flag |
| HAC | has_assumption_context |
| UEX | unique_existence |
`;
fs.writeFileSync(path.join(OUT_DIR, '_LEGEND.md'), legend, 'utf-8');

console.log(`\nDone. ${OUT_DIR}/`);
for (const f of fs.readdirSync(OUT_DIR)) console.log(`  ${f}`);
