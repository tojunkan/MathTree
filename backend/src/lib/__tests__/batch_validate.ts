/**
 * 批量验证：对小时百科文章运行分句+推断，统计分类准确率。
 * 运行：npx tsx backend/src/lib/__tests__/batch_validate.ts
 */
import { splitSentences } from '../sentenceSplitter.js';
import { inferEdges } from '../edgeInferrer.js';
import * as fs from 'fs';
import * as path from 'path';

const PAGES_DIR = path.resolve('data/wuliwiki_pages');
const SAMPLE_SIZE = 40; // 验证文章数量

interface Stats {
  total: number;
  bySubtype: Record<string, number>;
  byFlag: Record<string, number>;
  unresolved: number;
  environmentsProcessed: number;
}

function emptyStats(): Stats {
  return { total: 0, bySubtype: {}, byFlag: {}, unresolved: 0, environmentsProcessed: 0 };
}

function main() {
  const files = fs.readdirSync(PAGES_DIR)
    .filter(f => f.endsWith('.json'))
    .sort(() => Math.random() - 0.5) // 随机抽样
    .slice(0, SAMPLE_SIZE);

  console.log(`=== 批量验证 ${files.length} 篇小时百科文章 ===\n`);

  const envStats = emptyStats();
  const proseStats = emptyStats();
  const inferStats = { scopes: 0, casesScopes: 0, letBindScopes: 0, edges: 0, equivEdges: 0 };

  const flaggedSamples: string[] = []; // 收集被标记的样本
  const misclassified: string[] = []; // 收集误分类样本

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, file), 'utf-8'));
    const name = data.name || file;

    // 处理所有环境
    for (const env of (data.environments || [])) {
      const text = env.text;
      if (!text || text.length < 5) continue;

      envStats.environmentsProcessed++;

      const result = splitSentences(text);
      envStats.total += result.sentences.length;

      for (const s of result.sentences) {
        envStats.bySubtype[s.subtype] = (envStats.bySubtype[s.subtype] || 0) + 1;
        for (const f of s.flags) {
          envStats.byFlag[f] = (envStats.byFlag[f] || 0) + 1;
        }
        envStats.unresolved += result.unresolved.length;

        // 收集被标记的样本（每种 flag 最多 3 个）
        if (s.flags.length > 0 && flaggedSamples.length < 30) {
          flaggedSamples.push(
            `[${name}] ${s.subtype} flags=[${s.flags}] text="${s.original.slice(0, 80)}..."`
          );
        }

        // 检测可能误分类：定义环境中的句子被归为 assertion 且无任何特殊标记
        if (env.type === 'definition' && s.subtype === 'assertion'
            && !s.flags.includes('unclassified')
            && !s.flags.includes('display_math')) {
          if (misclassified.length < 20) {
            misclassified.push(
              `[${name}] def→assertion (no flag): "${s.original.slice(0, 100)}"`
            );
          }
        }
      }

      // 运行推断
      const inferred = inferEdges(result.sentences);
      for (const scope of inferred.scopes) {
        inferStats.scopes++;
        if (scope.kind === 'cases') inferStats.casesScopes++;
        if (scope.kind === 'let_bind') inferStats.letBindScopes++;
      }
      inferStats.edges += inferred.scopes.flatMap(s => s.edges).length;
      inferStats.equivEdges += inferred.scopeEdges.filter(
        e => e.edge_type === 'equivalent'
      ).length;
    }
  }

  // ── 输出统计 ──
  console.log(`文章数: ${files.length}`);
  console.log(`环境数: ${envStats.environmentsProcessed}`);
  console.log(`句子总数: ${envStats.total}\n`);

  console.log('── 句子子类型分布 ──');
  const sorted = Object.entries(envStats.bySubtype).sort((a, b) => b[1] - a[1]);
  for (const [k, v] of sorted) {
    const pct = ((v / envStats.total) * 100).toFixed(1);
    console.log(`  ${k}: ${v} (${pct}%)`);
  }

  console.log('\n── Flags 分布 ──');
  for (const [k, v] of Object.entries(envStats.byFlag).sort((a, b) => b[1] - a[1])) {
    const pct = ((v / envStats.total) * 100).toFixed(1);
    console.log(`  ${k}: ${v} (${pct}%)`);
  }

  console.log(`\n── 悬置条目: ${envStats.unresolved} ──`);
  console.log(`── 推断结果 ──`);
  console.log(`  Scopes: ${inferStats.scopes} (let_bind: ${inferStats.letBindScopes}, cases: ${inferStats.casesScopes})`);
  console.log(`  Internal edges: ${inferStats.edges}`);
  console.log(`  Equivalent edges: ${inferStats.equivEdges}`);

  // 误分类样本
  if (misclassified.length > 0) {
    console.log(`\n── ⚠ 可能的误分类 (${misclassified.length}) ──`);
    for (const m of misclassified.slice(0, 8)) {
      console.log(`  ${m}`);
    }
  }

  // 被标记的样本（悬置实例）
  console.log(`\n── 🔍 被标记的句子样本 (前 10) ──`);
  for (const s of flaggedSamples.slice(0, 10)) {
    console.log(`  ${s}`);
  }

  // 准确率估算
  const unclassifiedCount = envStats.byFlag['unclassified'] || 0;
  const displayMathCount = envStats.byFlag['display_math'] || 0;
  const ambiguousCount = envStats.byFlag['ambiguous'] || 0;
  const cleanCount = envStats.total - unclassifiedCount - ambiguousCount - displayMathCount;
  console.log(`\n── 粗略准确率 ──`);
  console.log(`  明确分类: ${cleanCount}/${envStats.total} (${((cleanCount/envStats.total)*100).toFixed(1)}%)`);
  console.log(`  显示公式 (display_math, 正确识别): ${displayMathCount} (${((displayMathCount/envStats.total)*100).toFixed(1)}%)`);
  console.log(`  完全无法分类 (unclassified): ${unclassifiedCount} (${((unclassifiedCount/envStats.total)*100).toFixed(1)}%)`);
  console.log(`  歧义但已分类 (ambiguous): ${ambiguousCount} (${((ambiguousCount/envStats.total)*100).toFixed(1)}%)`);
}

main();
