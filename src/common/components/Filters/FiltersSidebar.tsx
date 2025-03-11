import SidePanel from '../SidePanel/SidePanel';
import Button from '../Button/Button';

interface FilterGroup {
  title: string;
  items: string[];
  selectedItems: string[];
  onSelect: (item: string) => void;
}

interface FiltersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAll: () => void;
  filterGroups: FilterGroup[];
}

export default function FiltersSidebar({ isOpen, onClose, onClearAll, filterGroups }: FiltersSidebarProps) {
  if (!isOpen) return null;

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Data"
      description="Refine your view using multiple criteria"
      footer={
        <>
          <Button onClick={onClearAll}>Clear all filters</Button>
          <Button variant="primary" onClick={onClose}>
            Apply Filters
          </Button>
        </>
      }
    >
      {filterGroups.map((group, index) => (
        <div key={index} className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">{group.title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => group.items.forEach(group.onSelect)}
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                Select All
              </button>
              <button
                onClick={() => group.selectedItems.forEach(group.onSelect)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {group.items.map((item, itemIndex) => (
              <label key={itemIndex} className="flex items-center">
                <input
                  type="checkbox"
                  checked={group.selectedItems.includes(item)}
                  onChange={() => group.onSelect(item)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </SidePanel>
  );
}