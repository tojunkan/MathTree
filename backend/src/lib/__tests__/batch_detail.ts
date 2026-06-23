/**
 * 生成分句器批量验证的逐句明细报告。
 * 运行：npx tsx backend/src/lib/__tests__/batch_detail.ts
 */
import { splitSentences } from '../sentenceSplitter.js';
import * as fs from 'fs';
import * as path from 'path';

const PAGES_DIR = path.resolve('data/wuliwiki_pages');
const OUT_FILE = path.resolve('data/batch_validate_detail.txt');
const FILES = fs.readdirSync(PAGES_DIR)
  .filter(f => f.endsWith('.json'))
  .sort(() => Math.random() - 0.5)
  .slice(0, 25);

const lines: string[] = [];
lines.push('=== 小时百科分句器批量验证明细 ===');
lines.push('生成时间: ' + new Date().toISOString());
lines.push('');

let totalEnvs = 0, totalSentences = 0;
const envByType: Record<string, number> = {};
const subtypeByEnvType: Record<string, number> = {};

for (const file of FILES) {
  const data = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, file), 'utf-8'));
  const name = data.name || file;

  for (const env of (data.environments || [])) {
    const text = (env.text || '').trim();
    if (text.length < 10) continue;
    totalEnvs++;
    envByType[env.type] = (envByType[env.type] || 0) + 1;

    const result = splitSentences(text);

    lines.push('──────────────────────────────────────────────');
    lines.push(`文章: ${name} | 环境类型: ${env.type} | 标题: ${env.heading || '(无)'}`);
    lines.push(`原文: ${text.slice(0, 250).replace(/\n/g, ' ')}`);
    lines.push('');

    for (let j = 0; j < result.sentences.length; j++) {
      const s = result.sentences[j];
      totalSentences++;
      const key = `${env.type}→${s.subtype}`;
      subtypeByEnvType[key] = (subtypeByEnvType[key] || 0) + 1;

      const flagStr = s.flags.length ? ` [${s.flags.join(', ')}]` : '';
      lines.push(`  [${j}] ${s.subtype}${flagStr}: ${s.original.slice(0, 150)}`);
    }

    if (result.unresolved.length > 0) {
      lines.push(`  ⚠ unresolved (${result.unresolved.length}条):`);
      for (const u of result.unresolved.slice(0, 4)) {
        lines.push(`    - [${u.type}] s${u.sentenceIndex}: ${u.detail}`);
      }
      if (result.unresolved.length > 4) {
        lines.push(`    ... 共 ${result.unresolved.length} 条`);
      }
    }
    lines.push('');
  }
}

lines.push('');
lines.push('══════════════════════════════════════════════');
lines.push('汇总统计');
lines.push('══════════════════════════════════════════════');
lines.push(`文章数: ${FILES.length}`);
lines.push(`环境总数: ${totalEnvs}`);
lines.push(`句子总数: ${totalSentences}`);
lines.push('');
lines.push('── 环境类型分布 ──');
for (const [k, v] of Object.entries(envByType).sort((a, b) => b[1] - a[1])) {
  lines.push(`  ${k}: ${v}`);
}
lines.push('');
lines.push('── 环境类型 → 句子子类型 交叉分布 ──');
for (const [k, v] of Object.entries(subtypeByEnvType).sort()) {
  lines.push(`  ${k}: ${v}`);
}

// 分类准确率（排除纯公式）
lines.push('');
lines.push('── 说明 ──');
lines.push('  unclassified 标记表示句子无任何已知触发词（可能是纯公式、标题行、或上下文描述句），已悬置交用户判断。');
lines.push('  ambiguous 标记表示句子同时匹配 ≥3 个冲突触发词。');

fs.writeFileSync(OUT_FILE, lines.join('\n'), 'utf-8');
console.log(`Written ${lines.length} lines to ${OUT_FILE}`);
console.log(`Envs: ${totalEnvs}, Sentences: ${totalSentences}`);
