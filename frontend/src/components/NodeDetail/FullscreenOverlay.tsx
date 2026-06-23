import { useState } from 'react';
import { useGraphStore } from '../../stores/graphStore';
import { MarkdownRenderer } from '../Common/MarkdownRenderer';
import type { ProofRow, PropertyRow } from '../../types';

interface FullscreenOverlayProps {
  mode: 'proof' | 'properties';
  proof?: ProofRow;
  onClose: () => void;
}

export function FullscreenOverlay({ mode, proof, onClose }: FullscreenOverlayProps) {
  const store = useGraphStore();
  const node = store.selectedNode;
  const { updateProof, deleteProof } = store;
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(proof?.content || '');

  if (!node) return null;

  const handleSave = async () => {
    if (proof) {
      await updateProof(proof.id, { content: editContent });
      setEditMode(false);
    }
  };

  const handleExportTex = async () => {
    if (!proof) return;
    const texContent = generateTexFile(node.label, proof.title, proof.content);
    const blob = new Blob([texContent], { type: 'application/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${node.label}-${proof.title}.tex`.replace(/[^a-zA-Z0-9一-鿿_-]/g, '_');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute inset-0 z-40 bg-gray-950/95 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-950/95 py-3 border-b border-gray-800 z-10">
          <div>
            <h2 className="text-lg font-semibold">
              {mode === 'proof' ? (
                <>📐 {node.label} — {proof?.title}</>
              ) : (
                <>🏷 {node.label} — 性质表</>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              [{node.type === 'Entity' ? 'Entity' : 'Statement'}] {node.description?.replace(/[*$_{}#\\]/g, '').slice(0, 80)}
            </p>
          </div>
          <div className="flex gap-2">
            {mode === 'proof' && proof && (
              <>
                <button
                  onClick={handleExportTex}
                  className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                  title="导出为 .tex 文件，可用 TeXstudio 打开"
                >
                  📥 导出 .tex
                </button>
                {!editMode ? (
                  <button
                    onClick={() => { setEditContent(proof.content); setEditMode(true); }}
                    className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                  >
                    ✏️ 编辑
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1.5 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                    >
                      取消
                    </button>
                  </>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            >
              ✕ 关闭
            </button>
          </div>
        </div>

        {/* Content */}
        {mode === 'proof' && proof && (
          <div>
            {editMode ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-96 bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-200 font-mono resize-none focus:border-blue-600 focus:outline-none"
                placeholder="Markdown + LaTeX 证明内容..."
              />
            ) : (
              <div className="proof-content bg-gray-900 rounded-lg p-6 text-sm leading-relaxed">
                <MarkdownRenderer content={proof.content || '暂无证明内容。点击上方「编辑」开始编写。'} />
              </div>
            )}
          </div>
        )}

        {mode === 'properties' && (
          <div>
            {node.properties && node.properties.length > 0 ? (
              <div className="space-y-3">
                {node.properties.map((p) => (
                  <div key={p.id} className="bg-gray-900 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-200">{p.name}</h3>
                    {p.description && (
                      <p className="text-sm text-gray-400 mt-1">{p.description}</p>
                    )}
                    {/* Show edges that use this property */}
                    <PropertyUsage propertyName={p.name} nodeId={node.id} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-12">
                该节点暂无性质。点击侧边栏的「+ 添加」来添加性质。
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyUsage({ propertyName, nodeId }: { propertyName: string; nodeId: string }) {
  const edges = useGraphStore((s) => s.edges);
  const nodes = useGraphStore((s) => s.nodes);
  const selectNode = useGraphStore((s) => s.selectNode);

  const relatedEdges = edges.filter(
    (e) => e.source_id === nodeId && e.label === propertyName
  );

  if (relatedEdges.length === 0) return null;

  return (
    <div className="mt-2 text-xs text-gray-500">
      <span className="text-gray-600">用到此性质的边：</span>
      {relatedEdges.map((e) => {
        const tgt = nodes.find((n) => n.id === e.target_id);
        return (
          <button
            key={e.id}
            className="ml-2 text-blue-400 hover:underline"
            onClick={() => selectNode(e.target_id)}
          >
            → {tgt?.label || e.target_id}
          </button>
        );
      })}
    </div>
  );
}

/** Generate a minimal .tex document from markdown proof content. */
function generateTexFile(nodeLabel: string, proofTitle: string, markdown: string): string {
  // Strip markdown formatting, keep LaTeX math
  let body = markdown
    .replace(/^###?\s+(.+)$/gm, '\\subsection*{$1}')
    .replace(/^##\s+(.+)$/gm, '\\section*{$1}')
    .replace(/^#\s+(.+)$/gm, '\\section*{$1}')
    .replace(/\*\*(.+?)\*\*/g, '\\textbf{$1}')
    .replace(/\*(.+?)\*/g, '\\textit{$1}')
    .replace(/\n\n/g, '\n\n')
    .replace(/\\n/g, '\n');

  return `\\documentclass[12pt,a4paper]{article}
\\usepackage[UTF8]{ctex}
\\usepackage{amsmath,amssymb,amsthm}
\\usepackage{hyperref}

\\\\title{${escapeLatex(nodeLabel)} — ${escapeLatex(proofTitle)}}
\\\\author{MathTree}
\\\\date{\\\\today}

\\\\begin{document}
\\\\maketitle

${body}

\\\\end{document}`;
}

function escapeLatex(s: string): string {
  return s.replace(/[&%$#_{}~^\\]/g, '\\$&');
}
