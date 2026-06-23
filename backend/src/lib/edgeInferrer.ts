/**
 * 边推断器：分句 → 节点 + 边 + Scope。
 *
 * Pass 1 — 每句建节点
 * Pass 2 — 相邻句搭边
 * Pass 3 — 识别 Scope 包裹 logical-unit
 */

import type { AtomicSentence } from './sentenceSplitter.js';
import type { MathBlock } from './tokenizer.js';

export interface ParsedNode {
  id: string;
  type: 'Entity' | 'Statement' | 'Scope';
  subtype: string;
  label: string;
  fromSentence: number;
  flags: string[];
}

export interface ParsedEdge {
  from: string; to: string;
  edge_type: string;
  category: 'construction' | 'logic';
  truth_value?: string | null;
  unresolved?: string;
}

export interface ParsedScope {
  id: string;
  kind: 'let_bind' | 'cases' | 'conditional';
  label: string;
  children: string[];
  edges: ParsedEdge[];
}

export interface InferrerResult {
  allNodes: ParsedNode[];
  scopes: ParsedScope[];
  scopeEdges: ParsedEdge[];  // edges between scopes
  unresolved: string[];
}

// ── 主入口 ──────────────────────────────────────

export function inferEdges(sentences: AtomicSentence[]): InferrerResult {
  const unresolved: string[] = [];

  // Pass 1: 建节点
  const nodes: ParsedNode[] = [];
  for (let i = 0; i < sentences.length; i++) {
    nodes.push(...sentenceToNodes(sentences[i], i));
  }
  nodes.forEach((n, idx) => { n.id = `n${idx}`; });

  // Pass 2: 搭边
  const allEdges: ParsedEdge[] = [];
  for (let i = 0; i < sentences.length - 1; i++) {
    const curr = sentences[i];
    const next = sentences[i + 1];
    const a = nodeForSentence(nodes, i);
    const b = nodeForSentence(nodes, i + 1);
    if (!a || !b) continue;

    const isAssumptionOrCondition = (s: typeof curr) =>
      s.subtype === 'assumption' || s.subtype === 'condition';

    // E1: assumption/condition → conclusion/definition
    if (isAssumptionOrCondition(curr) && (next.subtype === 'conclusion' || next.subtype === 'definition')) {
      allEdges.push({ from: a.id, to: b.id, edge_type: 'implies', category: 'logic', truth_value: 'true' });
    }

    // E2: condition → condition（连续分类讨论：当x>0时…当x<0时…）
    if (curr.subtype === 'condition' && next.subtype === 'condition') {
      allEdges.push({ from: a.id, to: b.id, edge_type: 'case', category: 'case',
        unresolved: 'pending_user: 连续分类讨论，需用户确认 case 关系的正确性' });
    }

    // E3: equivalence flag → equivalent 边
    if (curr.flags?.includes('equivalence') || next.flags?.includes('equivalence')) {
      allEdges.push({ from: a.id, to: b.id, edge_type: 'equivalent', category: 'logic',
        unresolved: 'pending_user: 等价关系需用户确认，当前为句子级启发式检测' });
    }

    // E4: 句子标记了 has_assumption_context → 同时生成 assumption+define 提示
    // (暂时只记录，不实际建边；define 边在展开态才出现)
    if (curr.flags?.includes('has_assumption_context') || next.flags?.includes('has_assumption_context')) {
      unresolved.push(
        `句子 ${i}-${i+1} 含 has_assumption_context，可能同时需要 assumption 和 definition 节点，需用户拆分`
      );
    }

    // E5: define 边在折叠态不建（Entity 展开时才出现）
    // 折叠态只建 implies
  }

  // Pass 3: 包 Scope
  const scopes: ParsedScope[] = [];
  const scopedIds = new Set<string>();
  let si = 0;

  for (let i = 0; i < sentences.length; i++) {
    const curr = sentences[i];
    const next = sentences[i + 1];
    if (!next) continue;

    const isTrigger = curr.subtype === 'assumption' || curr.subtype === 'condition';
    const isTarget = next.subtype === 'conclusion' || next.subtype === 'definition';

    if (!isTrigger || !isTarget) continue;

    const a = nodeForSentence(nodes, i)!;
    const b = nodeForSentence(nodes, i + 1)!;
    const children: string[] = [a.id, b.id];

    // 内部边
    const internalEdges = allEdges.filter(e => children.includes(e.from) && children.includes(e.to));

    // 决定 Scope kind
    let kind: ParsedScope['kind'] = 'let_bind';
    if (curr.subtype === 'condition') {
      kind = 'cases';
    } else if (curr.subtype === 'assumption') {
      kind = 'let_bind';
    }

    // Scope 标签
    let label: string;
    if (next.subtype === 'definition') {
      const term = extractDefinedTerm(b.label);
      if (term) {
        label = term + '定义';
      } else {
        label = '未命名定义';
        unresolved.push(
          `scope${si}: 无法从定义句 "${b.label.slice(0, 40)}..." 提取被定义术语，flag=no_term_extracted`
        );
      }
    } else {
      label = scopeLabelFromConclusion(b.label);
    }

    scopes.push({ id: `scope${si++}`, kind, label, children, edges: internalEdges });
    children.forEach(id => scopedIds.add(id));
    i++; // 跳过 target 句
  }

  // 顶层节点 = 未入 Scope 的
  // (allNodes 保留全部节点；topNodes 用于展示不在 Scope 内的)
  const topNodes = nodes.filter(n => !scopedIds.has(n.id));

  // Scope 间边（heuristic）：共享函数名的相邻 Scope → special_case
  const scopeEdges: ParsedEdge[] = [];
  for (let i = 0; i < scopes.length - 1; i++) {
    const prev = scopes[i];
    const next = scopes[i + 1];
    const prevAssumption = prev.children
      .map(cid => nodes.find(n => n.id === cid))
      .find(n => n?.subtype === 'assumption');
    const nextAssumption = next.children
      .map(cid => nodes.find(n => n.id === cid))
      .find(n => n?.subtype === 'assumption');
    if (prevAssumption && nextAssumption && shareText(prevAssumption.label, nextAssumption.label)) {
      scopeEdges.push({
        from: nextAssumption.id, to: prevAssumption.id,
        edge_type: 'special_case', category: 'logic',
        unresolved: 'heuristical',
      });
      unresolved.push(`${next.label} → ${prev.label} special_case (heuristical)`);
    }
  }

  return { allNodes: nodes, scopes, scopeEdges, unresolved };
}

// ── 单句 → 节点 ─────────────────────────────────

function sentenceToNodes(s: AtomicSentence, idx: number): ParsedNode[] {
  // 折叠态：一句 = 一个 Statement 节点。类型由分句器决定。
  // assertion 规范化，但 condition 保留原值（用于创建 cases Scope）
  const subtype = (s.subtype === 'assertion')
    ? 'assumption' : s.subtype;
  return [{
    id: '', type: 'Statement', subtype,
    label: s.original, fromSentence: idx, flags: s.flags,
  }];
}

// ── 辅助 ────────────────────────────────────────

function nodeForSentence(nodes: ParsedNode[], idx: number): ParsedNode | undefined {
  return nodes.find(n => n.fromSentence === idx && n.type === 'Statement')
    || nodes.find(n => n.fromSentence === idx);
}

/** 从定义句中提取被定义术语。按优先级尝试多种模式。 */
function extractDefinedTerm(text: string): string | null {
  // 多模式按优先级尝试
  const patterns: RegExp[] = [
    // D1: 称...为/是...一个/一种... TERM（量词后捕获到句尾）
    /(?:称|称为|称之为|称作|叫作|叫做).+(?:为|是|作).+?(?:一个|一种|某个)\s*(.+?)$/,
    // D1b: 称...为/是... TERM（无量词，捕获到句尾）
    /(?:称|称为|称之为|称作|叫作|叫做).+(?:为|是|作)\s*(.+?)$/,
    // D6: 定义...为 TERM
    /(?:定义).+(?:为|是)\s*(.+?)$/,
    // D2: XXX 称为/叫作 YYY → 取 YYY (2nd capture, lazy middle)
    /(.+?)(?:称为|叫作|叫做|称之为|称作).*?(?:一个|一种|某个)?\s*(.+?)$/,
    // D10: 称之为 TERM
    /(?:称之为|则称为|称为)\s*(?:一个|一种|某个)?\s*(.+?)$/,
    // D4/D5: 若/设...则称 TERM
    /(?:若|如果|设).+(?:则称|则称之为|那么称).*?(?:一个|一种|某个)?\s*(.+?)$/,
  ];

  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      // 优先取最后一个捕获组（术语名）
      let term = (m[2] || m[1] || '').trim();
      if (!term) continue;
      // 去掉 LaTeX 公式——仅当术语中含中文时才移除（避免纯公式术语变空）
      const termWithoutMath = term.replace(/\$[^$]+\$/g, '').trim();
      if (termWithoutMath) {
        term = termWithoutMath;
      }
      // 去掉 "的" 前面的修饰（"集合G的基数" → "基数"）
      const deIdx = term.lastIndexOf('的');
      if (deIdx >= 0) term = term.slice(deIdx + 1).trim();
      // 去掉残留量词
      term = term.replace(/^(一个|一种|某个)\s*/, '');
      if (term) return term;
    }
  }
  return null;
}

/** 从 conclusion 文本生成简短 Scope 标签 —— 保留 LaTeX 公式 */
function scopeLabelFromConclusion(text: string): string {
  // 去掉引导词（则/那么/故等），保留核心断言
  let clean = text.replace(/^\s*(则|那么|故|因此|所以|于是|从而|即)\s*/, '').trim();
  // 截断到合理长度，尽量保留公式
  if (clean.length <= 35) return clean;
  return clean.slice(0, 32) + '…';
}

function shareText(a: string, b: string): boolean {
  // 检查共享函数名
  const fnA = a.match(/\\?([a-zA-Z])\s*\(/g) || [];
  const fnB = b.match(/\\?([a-zA-Z])\s*\(/g) || [];
  return fnA.length > 0 && fnA.some(fa => fnB.includes(fa));
}
