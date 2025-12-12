import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';

interface CommandBarProps {
  onSearch: (query: string) => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ onSearch }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      setValue('');
    }
  };

  return (
    <div className="h-14 bg-slate-900 border-t border-slate-800 flex items-center px-4 relative shrink-0">
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-4 group">
        <div className="text-slate-500 group-focus-within:text-sky-500 transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter Bible reference (e.g. 'Gen 1:1' or 'John 1:1')"
          className="bg-transparent border-none outline-none flex-1 text-slate-100 placeholder:text-slate-600 font-medium"
        />
        <div className="flex items-center gap-2">
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-800 bg-slate-950 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
            <span className="text-xs">ENTER</span>
          </kbd>
          <button 
            type="submit"
            className="p-1.5 rounded-md bg-slate-800 hover:bg-sky-600 hover:text-white transition-all text-slate-400"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommandBar;