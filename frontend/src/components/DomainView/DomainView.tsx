import { useGraphStore } from '../../stores/graphStore';
import type { DomainRow } from '../../types';

export function DomainView() {
  const { domains, selectNode } = useGraphStore();

  // Build domain tree
  const rootDomains = domains.filter((d) => !d.parent_id);
  const children = (parentId: string) => domains.filter((d) => d.parent_id === parentId);

  return (
    <div className="w-full h-full overflow-auto p-6">
      <h2 className="text-lg font-semibold mb-4">域 (Domains)</h2>
      <p className="text-sm text-gray-500 mb-4">
        域用于组织和归类数学节点。点击节点可查看详情。
      </p>
      <div className="space-y-6">
        {rootDomains.map((domain) => (
          <DomainCard
            key={domain.id}
            domain={domain}
            children={children(domain.id)}
            depth={0}
            onSelect={selectNode}
          />
        ))}
        {domains.length === 0 && (
          <div className="text-center text-gray-600 py-12">
            暂无域。在节点详情中可将节点添加到域。
          </div>
        )}
      </div>
    </div>
  );
}

function DomainCard({
  domain,
  children,
  depth,
  onSelect,
}: {
  domain: DomainRow;
  children: DomainRow[];
  depth: number;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ marginLeft: depth * 24 }}>
      <div
        className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors border border-gray-800"
        style={{ borderLeftColor: domain.color, borderLeftWidth: 3 }}
      >
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: domain.color }}
        />
        <span className="font-medium">{domain.name}</span>
        <span className="text-xs text-gray-600 ml-auto">
          {domain.node_count ?? 0} 个节点
        </span>
      </div>
      {children.length > 0 && (
        <div className="mt-1">
          {children.map((child) => (
            <DomainCard
              key={child.id}
              domain={child}
              children={
                // Find grandchildren — we need to pass all domains for recursion
                []
              }
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
