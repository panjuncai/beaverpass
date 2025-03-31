"use client";
import SearchBar from "@/app/(main)/search/search-bar";
import ProductsShow from "@/app/(main)/search/search-show";
import SearchCategory from "@/app/(main)/search/search-category";
import { useState } from "react";
import AddressModal from "@/components/modals/address-modal";
import { LocationFill } from "antd-mobile-icons";
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
    <div className="grid grid-cols-1 gap-2 p-2">
      <div
        className="flex items-center justify-center p-2"
        onClick={() => showAddressModal()}
      >
        <LocationFill className="text-lg" />
        <div className="flex-1 text-xm font-bold">
          {loginUser?.user_metadata.address||"Please select address"}
        </div>
      </div>
      <SearchBar handleSearch={handleSearch} />
      <SearchCategory
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <ProductsShow selectedCategory={selectedCategory} search={search} />
      <div className="h-20"></div>
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
