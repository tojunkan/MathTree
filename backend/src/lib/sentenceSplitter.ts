/**
 * 阶段 2-3：粗切 + 细切 + 分类。
 * 把受保护的文本切成原子陈述并分类。
 */

import { protectMath, restoreMath, MathBlock } from './tokenizer.js';

export type StatementSubtype =
  | 'assumption' | 'definition' | 'conclusion'
  | 'condition' | 'assertion' | 'quantified';

export interface AtomicSentence {
  text: string;              // 当前文本（占位符形式）
  original: string;          // 恢复公式后的原文
  subtype: StatementSubtype;
  mathBlocks: MathBlock[];   // 此句涉及的公式
  flags: string[];           // 诊断标记
}

export interface SplitResult {
  sentences: AtomicSentence[];
  unresolved: { type: string; sentenceIndex: number; detail: string }[];
}

// ── 触发词 ──────────────────────────────────────
// 注意：所有正则均假设文本已经过 protectMath()，公式已被 __M{n}__ / __D{n}__ 替代。

const ASSUMPTION_WORDS = /^(设|假设|令|假定|已知|给定|若|如果|倘若|假如|考虑|当)/;
const DEFINITION_WORDS = /(定义|称|称为|称之为|称作|叫作|叫做|记作|记为|简述为|简记为|定义为|是指|即是)/;
const CONCLUSION_WORDS = /^(则|故|因此|所以|于是|从而|那么|即|可见|由此|综上|因而|这就证明了|从而有|可得出)/;
const QUANTIFIER_WORDS = /(存在|∃|任意|对一切|对所有|∀|对任意|对每个|都有|使得|有且仅有|∃!)/;
const EQUIVALENCE_WORDS = /(当且仅当|充要条件|充分必要条件|等价于|⇔|iff|等价)/;
const CONDITION_WORDS = /(当.+时|情形[一二三四五六七八九十\d]|情况[一二三四五六七八九十\d]|case\s*\d|分类讨论|分情况)/;

// 标点分隔符
const MAJOR_BREAKS = /[。！？\n](?!\s*\n)/;   // 句号/问号/感叹号（不匹配空行内的）
const SEMICOLON = /；(?=[^_]*$)/;              // 分号（不在占位符前——简化处理）

// ── 主入口 ──────────────────────────────────────

export function splitSentences(raw: string): SplitResult {
  const { text, mathBlocks } = protectMath(raw);
  const unresolved: SplitResult['unresolved'] = [];

  // Phase 1: 粗切
  const coarse = coarseSplit(text);

  // Phase 2: 细切
  const fine: string[] = [];
  for (const seg of coarse) {
    fine.push(...fineSplit(seg));
  }

  // Phase 2.5: 合并且/并 等承接连词
  const merged = mergeConjunctions(fine);

  // Phase 3: 分类 + 复核 + 恢复
  const sentences: AtomicSentence[] = [];
  for (let i = 0; i < merged.length; i++) {
    const s = merged[i].trim();
    if (!s) continue;

    const subtype = classify(s);
    const usedBlocks = findUsedBlocks(s, mathBlocks);
    const original = restoreMath(s, usedBlocks);

    // 悬置复核：检测歧义、等价标记、完全无法分类等情况
    const audit = auditSentence(s, subtype, i);
    const flags = [...audit.flags];

    // 纯显示公式检测：句子只是一个 __D{n}__ 占位符（不含中文文本）
    if (/^__D\d+__$/.test(s)) {
      flags.push('display_math');
      // 移除 unclassified——显示公式是正常的数学内容，不需要用户判断
      const ucIdx = flags.indexOf('unclassified');
      if (ucIdx >= 0) flags.splice(ucIdx, 1);
    }

    // 合并 audit 产出的 unresolved
    for (const u of audit.unresolved) {
      unresolved.push(u);
    }

    // 裸断言检测（保留旧逻辑，但只在未被 audit 标记为其他情况时追加）
    if (subtype === 'assertion' && !flags.includes('unclassified') && !flags.includes('display_math')) {
      const prevSubtype = i > 0 ? sentences[sentences.length - 1]?.subtype : null;
      if (!prevSubtype || prevSubtype === 'assertion') {
        flags.push('bare');
        unresolved.push({
          type: 'implicit_cite',
          sentenceIndex: i,
          detail: '断言无推理来源，需用户关联 implies 边',
        });
      }
    }

    sentences.push({ text: s, original, subtype, mathBlocks: usedBlocks, flags });
  }

  return { sentences, unresolved };
}

// ── 粗切 ────────────────────────────────────────

function coarseSplit(text: string): string[] {
  // Split display math blocks first (they act as standalone segments)
  const parts: string[] = [];
  let remaining = text;

  // Display math placeholders __D{n}__ are standalone
  const dmRegex = /__D\d+__/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = dmRegex.exec(remaining)) !== null) {
    const before = remaining.slice(lastIdx, match.index).trim();
    if (before) parts.push(before);
    parts.push(match[0]);
    lastIdx = dmRegex.lastIndex;
  }
  const after = remaining.slice(lastIdx).trim();
  if (after) parts.push(after);

  // Split each part on major breaks
  const result: string[] = [];
  for (const part of parts) {
    if (/^__D\d+__$/.test(part)) {
      result.push(part);
    } else {
      result.push(...part.split(MAJOR_BREAKS).map(s => s.trim()).filter(Boolean));
    }
  }

  return result;
}

// ── 细切 ────────────────────────────────────────

function fineSplit(segment: string): string[] {
  // Already a placeholder, pass through
  if (/^__[DM]\d+__$/.test(segment.trim())) return [segment.trim()];

  let parts = [segment];

  // Rule 1: split on semicolons
  parts = parts.flatMap(p => splitOn(p, /；(?![^_]*__[DM])/));

  // Rule 2: split on "，则" "，故" "，即" "，因此" "，所以" "，于是"
  parts = parts.flatMap(p => splitBefore(p, /，(则|故|即|因此|所以|于是|从而|那么)/));

  // Rule 3: split on "，且" "，并" "，和" "，或"
  parts = parts.flatMap(p => splitBefore(p, /，(且|并|和|或)(?![^_]*__[DM])/));

  // Rule 4: split on "，" before "称" "定义为" etc
  parts = parts.flatMap(p => splitBefore(p, /，(称|定义为|记作)/));

  // Rule 5: split before "则称/则称之为/那么称/则记/那么记"（条件定义的转折点）
  parts = parts.flatMap(p => splitBefore(p, /，?(则称|则称之为|那么称|则记|那么记|则定义)/));

  // Rule 6: split on equivalence markers（当且仅当/等价于 两侧断开）
  parts = parts.flatMap(p => splitOn(p, /(⇔|当且仅当|等价于|iff)/));

  return parts.filter(s => s.trim());
}

// ── 辅助 ────────────────────────────────────────

/** Split on regex, keeping the delimiter on the second part */
function splitBefore(text: string, regex: RegExp): string[] {
  const match = regex.exec(text);
  if (!match || match.index === undefined) return [text];
  const before = text.slice(0, match.index).trim();
  const after = text.slice(match.index + 1).trim(); // skip the "，" itself
  if (!before || !after) return [text];
  return [before, after];
}

/** Split on regex, discarding the delimiter */
function splitOn(text: string, regex: RegExp): string[] {
  const parts = text.split(regex).map(s => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : [text];
}

// ── 合并承接连词 ─────────────────────────────────

const CONTINUATION_WORDS = /^(且|并|和|以及|并且|而且)/;

/**
 * 将以"且""并"等开头的从句合并回前一句。
 * 这些词承接前面的主语，不应独立成句。
 */
function mergeConjunctions(parts: string[]): string[] {
  if (parts.length <= 1) return parts;
  const result: string[] = [parts[0]];
  for (let i = 1; i < parts.length; i++) {
    const prev = result[result.length - 1];
    const curr = parts[i].trim();
    if (CONTINUATION_WORDS.test(curr)) {
      // Merge into previous
      result[result.length - 1] = prev + '，' + curr;
    } else {
      result.push(curr);
    }
  }
  return result;
}

// ── 分类 ────────────────────────────────────────

function classify(text: string): StatementSubtype {
  // 0. condition 优先——检测分类讨论（当…时/情形/情况/分类讨论）
  if (CONDITION_WORDS.test(text)) return 'condition';

  // 1. definition——命名动词出现即定义（无锚定）
  if (DEFINITION_WORDS.test(text)) return 'definition';

  // 2. assumption——句首的假设触发词
  if (ASSUMPTION_WORDS.test(text)) return 'assumption';

  // 3. conclusion——句首的结论触发词
  if (CONCLUSION_WORDS.test(text)) return 'conclusion';

  // 4. quantified——存在/任意量词
  if (QUANTIFIER_WORDS.test(text)) return 'quantified';

  // 5. 兜底
  return 'assertion';
}

/**
 * 对已分类的句子做二次复核，检测歧义和等价标记。
 * 返回需要追加的 flags 和 unresolved 条目。
 */
function auditSentence(
  text: string,
  subtype: StatementSubtype,
  sentenceIndex: number,
): { flags: string[]; unresolved: { type: string; sentenceIndex: number; detail: string; candidates?: string[] }[] } {
  const flags: string[] = [];
  const unresolved: { type: string; sentenceIndex: number; detail: string; candidates?: string[] }[] = [];

  // 检测等价标记（当且仅当/充要条件/等价于）
  if (EQUIVALENCE_WORDS.test(text)) {
    flags.push('equivalence');
  }

  // 检测歧义：assumption 句同时含定义触发词
  if (subtype === 'definition' && ASSUMPTION_WORDS.test(text)) {
    flags.push('has_assumption_context');
  }

  // 检测歧义：同时匹配多个冲突触发词
  const hits: string[] = [];
  if (DEFINITION_WORDS.test(text)) hits.push('definition');
  if (ASSUMPTION_WORDS.test(text)) hits.push('assumption');
  if (CONCLUSION_WORDS.test(text)) hits.push('conclusion');
  if (QUANTIFIER_WORDS.test(text)) hits.push('quantified');
  if (CONDITION_WORDS.test(text)) hits.push('condition');

  if (hits.length >= 3) {
    flags.push('ambiguous');
    unresolved.push({
      type: 'ambiguous_subtype',
      sentenceIndex,
      detail: `句子同时匹配了 ${hits.join(', ')}，当前归类为 ${subtype}`,
      candidates: hits,
    });
  }

  // 检测存在唯一量词（不展开，交用户处理）
  if (/有且仅有|∃!/.test(text)) {
    flags.push('unique_existence');
    unresolved.push({
      type: 'unique_existence',
      sentenceIndex,
      detail: '存在唯一量词(∃!)，不自动展开为 ∃+唯一性，需用户确认',
    });
  }

  // 完全无法判断的情况
  if (subtype === 'assertion' && hits.length === 0) {
    flags.push('unclassified');
    unresolved.push({
      type: 'unclassified',
      sentenceIndex,
      detail: '句子无任何已知触发词，逻辑角色完全无法自动判断',
    });
  }

  return { flags, unresolved };
}

// ── 公式映射 ─────────────────────────────────────

function findUsedBlocks(text: string, allBlocks: MathBlock[]): MathBlock[] {
  const used: MathBlock[] = [];
  for (const b of allBlocks) {
    if (text.includes(b.placeholder)) used.push(b);
  }
  return used;
}
