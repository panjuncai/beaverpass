'use client';
import SearchBar from '@/app/(main)/search/search-bar';
import ProductsShow from '@/app/(main)/search/search-show';
import SearchCategory from '@/app/(main)/search/search-category';
import { useState } from 'react';

export default function SearchPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  }
  return (
    <div className="grid grid-cols-1 gap-2 p-2"> 
      <SearchBar handleSearch={handleSearch} />
      <SearchCategory selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      <ProductsShow selectedCategory={selectedCategory} search={search} />
      <div className="h-20"></div>
    </div>
  );
} 