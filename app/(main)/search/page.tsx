'use client';
import SearchBar from '@/components/search/search-bar';
// import ProductsShow from '@/components/search/products-show';
export default function SearchPage() {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('value', value);
  }
  return (
    <div className="grid grid-cols-1 gap-0 p-2"> 
      <SearchBar handleSearch={handleSearch} />
      {/* <ProductsShow /> */}
    </div>
  );
} 