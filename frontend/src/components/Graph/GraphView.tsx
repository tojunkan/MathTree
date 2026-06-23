import { GraphCanvas } from './GraphCanvas';
import { GraphToolbar } from './GraphToolbar';

export function GraphView() {
  return (
    <div className="w-full h-full flex flex-col">
      <GraphToolbar />
      <div className="flex-1 overflow-hidden">
        <GraphCanvas />
      </div>
    </div>
  );
}
