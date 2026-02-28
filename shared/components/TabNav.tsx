'use client';

interface Tab {
  id: string;
  label: string;
}

interface TabNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  columns?: number;
  className?: string;
}

export function TabNav({
  tabs,
  activeTab,
  onTabChange,
  columns,
  className = '',
}: TabNavProps) {
  const gridCols = columns || tabs.length;

  return (
    <div
      className={`grid border-b border-white/10 ${className}`}
      style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-4 py-2 text-sm font-medium transition-all duration-200 relative text-center
            outline-none focus:outline-none
            ${
              activeTab === tab.id
                ? 'text-blue-500'
                : 'text-white/60 hover:text-white/90'
            }
          `}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}
