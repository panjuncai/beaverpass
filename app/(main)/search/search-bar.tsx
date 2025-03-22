
import { SearchOutline } from 'antd-mobile-icons'
export default function SearchBar({ handleSearch }: { handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (<>
  <label className="input input-lg flex items-center w-full">
            <SearchOutline fontSize={24} className="mr-2" />
            <input
              type="text"
              className="grow"
              placeholder="Search"
              onChange={handleSearch}
            />
    </label>
  </>)
}
