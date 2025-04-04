import { useState } from "react";
import { useDebounce } from 'use-debounce';
import { useEffect } from "react";

export default function SearchBar({ handleSearch }: { handleSearch: (value: string) => void }) {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch] = useDebounce(searchValue, 500);

  useEffect(() => {
    handleSearch(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className="relative w-full">
      <div className="w-full h-12 relative bg-white rounded-[10px] border border-neutral-300 flex items-center px-4">
        {/* Search Icon */}
        <div className="flex items-center justify-center w-6 h-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21L16.65 16.65" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* Input Field */}
        <input
          type="text"
          className="ml-2 w-full bg-transparent focus:outline-none text-zinc-700 placeholder-zinc-400 text-sm font-normal font-['Poppins'] tracking-wide"
          placeholder="What do you need?"
          onChange={(e) => setSearchValue(e.target.value)}
        />
        
        {/* Equalizer Icon */}
        <div className="flex items-center justify-center w-6">
          <div className="relative w-4 h-6">
            {/* Vertical lines */}
            <svg className="absolute" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Left line */}
              <line x1="2" y1="2" x2="2" y2="9" stroke="#818181" strokeWidth="2" strokeLinecap="round"/>
              <line x1="2" y1="12" x2="2" y2="18" stroke="#818181" strokeWidth="2" strokeLinecap="round"/>
              
              {/* Middle line */}
              <line x1="10" y1="2" x2="10" y2="7" stroke="#818181" strokeWidth="2" strokeLinecap="round"/>
              <line x1="10" y1="10" x2="10" y2="16" stroke="#818181" strokeWidth="2" strokeLinecap="round"/>
              
              {/* Right line */}
              <line x1="18" y1="2" x2="18" y2="10" stroke="#818181" strokeWidth="2" strokeLinecap="round"/>
              <line x1="18" y1="13" x2="18" y2="18" stroke="#818181" strokeWidth="2" strokeLinecap="round"/>
              
              {/* Horizontal lines */}
              <line x1="1" y1="9" x2="5" y2="9" stroke="#818181" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="7" x2="13" y2="7" stroke="#818181" strokeWidth="2" strokeLinecap="round"/>
              <line x1="17" y1="10" x2="21" y2="10" stroke="#818181" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
