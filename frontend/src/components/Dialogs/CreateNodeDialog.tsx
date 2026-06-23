import { useState } from 'react';
import { useGraphStore } from '../../stores/graphStore';
import type { NodeType, EntitySubtype, StatementSubtype, ScopeKind } from '../../types';
import { ENTITY_SUBTYPES, STATEMENT_SUBTYPES, SCOPE_KINDS, SUBTYPE_LABELS } from '../../types';

interface Props { onClose: () => void; }

const NODE_TYPES: { value: NodeType; label: string; desc: string }[] = [
  { value: 'Entity', label: 'Entity 实体', desc: '数学对象、运算、关系、性质、变量、量词' },
  { value: 'Statement', label: 'Statement 陈述', desc: '定义、公理、定理、引理、假设、猜想…' },
  { value: 'Scope', label: 'Scope 作用域', desc: '反证法、分情况、条件假设、变量赋值' },
  { value: 'Reference', label: 'Reference 分身', desc: '指向另一节点的符号链接' },
  { value: 'Idea', label: 'Idea 数学思想', desc: 'ε-δ、归纳法、对角线论证…' },
];

export function CreateNodeDialog({ onClose }: Props) {
  const { createNode } = useGraphStore();
  const [type, setType] = useState<NodeType>('Entity');
  const [subtype, setSubtype] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [scopeKind, setScopeKind] = useState<ScopeKind>('reductio');
  const [submitting, setSubmitting] = useState(false);

  const subtypes: string[] = type === 'Entity' ? ENTITY_SUBTYPES
    : type === 'Statement' ? STATEMENT_SUBTYPES
    : type === 'Scope' ? SCOPE_KINDS
    : [];

  const handleSubmit = async () => {
    if (!label.trim()) return;
    setSubmitting(true);
    const extra: Record<string, any> = {};
    if (subtype) extra.subtype = subtype;
    if (type === 'Scope') extra.scope_kind = scopeKind;
    try {
      await createNode(type, label.trim(), description, extra);
      onClose();
    } catch { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-96 p-5">
        <h2 className="text-lg font-semibold mb-4">创建节点</h2>

        {/* Type */}
        <label className="block text-xs text-gray-400 mb-1.5">类型</label>
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {NODE_TYPES.map((t) => (
            <button key={t.value}
              className={`px-2 py-2 rounded text-xs text-left transition-colors ${type === t.value ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              onClick={() => { setType(t.value); setSubtype(''); }}
              title={t.desc}
            >
              <div className="font-medium">{t.label}</div>
              <div className="text-[10px] opacity-70">{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Subtype (if applicable) */}
        {subtypes.length > 0 && (
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1.5">子类型</label>
            <select value={subtype} onChange={(e) => setSubtype(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none">
              <option value="">选择子类型…</option>
              {subtypes.map((s) => (
                <option key={s} value={s}>{SUBTYPE_LABELS[s] || s} ({s})</option>
              ))}
            </select>
          </div>
        )}

        {/* Scope kind */}
        {type === 'Scope' && (
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1.5">作用域类型</label>
            <select value={scopeKind} onChange={(e) => setScopeKind(e.target.value as ScopeKind)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white">
              {SCOPE_KINDS.map((k) => <option key={k} value={k}>{SUBTYPE_LABELS[k] || k}</option>)}
            </select>
          </div>
        )}

        {/* Label */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1.5">名称</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
            placeholder="例如: 实数 ℝ" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="block text-xs text-gray-400 mb-1.5">描述 (可选)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white h-16 resize-none focus:border-blue-600 focus:outline-none" />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded">取消</button>
          <button onClick={handleSubmit} disabled={!label.trim() || submitting}
            className="px-4 py-2 text-sm bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded">
            {submitting ? '创建中…' : '创建'}
          </button>
        </div>
      </div>
    </div>
  );
}
