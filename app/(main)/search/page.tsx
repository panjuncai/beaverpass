"use client";
import SearchBar from "@/app/(main)/search/search-bar";
import ProductsShow from "@/app/(main)/search/search-show";
import SearchCategory from "@/app/(main)/search/search-category";
import { useState } from "react";
import AddressModal from "@/components/modals/address-modal";
import { useAuthStore } from "@/lib/store/auth-store";
export default function SearchPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { loginUser } = useAuthStore();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };
  // 打开地址选择模态框
  const showAddressModal = () => {
    setIsAddressModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-6 pb-4">
        <div
          className="relative w-80 h-5 cursor-pointer mb-4"
          onClick={() => showAddressModal()}
        >
          <div className="w-4 h-3.5 left-0 top-[3px] absolute overflow-hidden">
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.52564 0.125C9.80496 0.125 12.4631 2.3075 12.4631 5C12.4631 7.06 10.7002 9.305 7.21987 11.759C7.02635 11.8955 6.77961 11.9705 6.5245 11.9703C6.26938 11.9701 6.0228 11.8948 5.82958 11.758L5.59939 11.594C2.27317 9.204 0.588135 7.014 0.588135 5C0.588135 2.3075 3.24631 0.125 6.52564 0.125ZM6.52564 3.125C5.91997 3.125 5.33912 3.32254 4.91085 3.67417C4.48258 4.02581 4.24198 4.50272 4.24198 5C4.24198 5.49728 4.48258 5.97419 4.91085 6.32583C5.33912 6.67746 5.91997 6.875 6.52564 6.875C7.1313 6.875 7.71215 6.67746 8.14042 6.32583C8.56869 5.97419 8.80929 5.49728 8.80929 5C8.80929 4.50272 8.56869 4.02581 8.14042 3.67417C7.71215 3.32254 7.1313 3.125 6.52564 3.125Z" fill="#331901"/>
            </svg>
          </div>
          <div className="left-[22px] top-0 absolute justify-start text-yellow-950 text-sm font-semibold font-['Poppins']">
            {loginUser?.user_metadata.address 
              ? `${loginUser.user_metadata.address.substring(0, 30)}... < ${loginUser.user_metadata.searchRange || 5}km`
              : "Please select address"}
          </div>
        </div>
        <SearchBar handleSearch={handleSearch} />
      </div>
      <SearchCategory
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <div className="flex-1 overflow-auto px-4 pt-3 pb-20">
        <ProductsShow selectedCategory={selectedCategory} search={search} />
      </div>
      {/* 地址选择模态框 */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelect={() => {}}
        initialAddress={loginUser?.user_metadata.address}
        showSaveButton={true}
      />
    </div>
  );
}
