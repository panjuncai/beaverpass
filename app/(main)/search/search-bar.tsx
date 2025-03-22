import { SearchOutline } from 'antd-mobile-icons'
export default function SearchBar({ handleSearch }: { handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (<>
  <label className="input input-lg flex items-center w-full focus-within:outline-none focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-500 transition-colors duration-200">
            <SearchOutline fontSize={24} className="mr-2" />
            <input
              type="text"
              className="grow focus:outline-none"
              placeholder="Search"
              onChange={handleSearch}
            />
    </label>
  </>)
}
