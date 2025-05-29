
import { FlowchartCanvas } from "@/components/FlowchartCanvas";

const Index = () => {
  return (
    <div className="h-screen w-full bg-gray-50">
      <div className="h-full flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Flowchart Builder</h1>
          <p className="text-sm text-gray-600 mt-1">Right-click to add nodes • Drag to connect • Double-click to delete</p>
        </header>
        <div className="flex-1">
          <FlowchartCanvas />
        </div>
      </div>
    </div>
  );
};

export default Index;
