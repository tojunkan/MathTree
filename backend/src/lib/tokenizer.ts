/**
 * 阶段 1：保护/恢复 LaTeX 公式。
 * 把 $...$ 和 $$...$$ 替换为占位符，防止分句器误切。
 */

export interface MathBlock {
  placeholder: string;
  original: string;
  display: boolean; // $$...$$ vs $...$
}

export interface ProtectedText {
  text: string;          // 带占位符的文本
  mathBlocks: MathBlock[]; // 占位符 → 原始公式的映射
}

/**
 * 保护所有 LaTeX 公式，返回占位文本 + 映射表。
 */
export function protectMath(raw: string): ProtectedText {
  const blocks: MathBlock[] = [];
  let i = 0;

  // First pass: protect $$...$$ (display math) — must come before $...$
  let text = raw.replace(/\$\$([\s\S]*?)\$\$/g, (_match, body) => {
    const placeholder = `__D${i}__`;
    blocks.push({ placeholder, original: `$$${body}$$`, display: true });
    i++;
    return placeholder;
  });

  // Second pass: protect \begin{env}...\end{env} (LaTeX display environments)
  // 常见的 wuli.wiki 数学环境：equation, align, aligned, gather, eqnarray, cases 等
  text = text.replace(
    /\\begin\{(equation|align|aligned|gather|eqnarray|cases|array|matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|split|multline|subequations)\*?\}([\s\S]*?)\\end\{\1\*?\}/g,
    (_match, _env, _body) => {
      const placeholder = `__D${i}__`;
      blocks.push({ placeholder, original: _match, display: true });
      i++;
      return placeholder;
    }
  );

  // Third pass: protect $...$ (inline math)
  text = text.replace(/\$(.+?)\$/g, (_match, body) => {
    // Avoid matching $$ remnants
    if (body.includes('__D')) return _match;
    const placeholder = `__M${i}__`;
    blocks.push({ placeholder, original: `$${body}$`, display: false });
    i++;
    return placeholder;
  });

  return { text, mathBlocks: blocks };
}

/**
 * 恢复占位符为原始公式。
 */
export function restoreMath(text: string, blocks: MathBlock[]): string {
  let result = text;
  for (const b of blocks) {
    result = result.replace(b.placeholder, b.original);
  }
  return result;
}
