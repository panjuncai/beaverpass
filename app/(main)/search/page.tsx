"use client";
import SearchBar from "@/app/(main)/search/search-bar";
import ProductsShow from "@/app/(main)/search/search-show";
import SearchCategory from "@/app/(main)/search/search-category";
import { useMemo, useState } from "react";
import AddressModal from "@/components/modals/address-modal";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { LocationFill } from "antd-mobile-icons";
export default function SearchPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { loginUser } = useAuthStore();
  const router = useRouter();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const memoizedProductsShow = useMemo(() => (
    <ProductsShow selectedCategory={selectedCategory} search={search} />
  ), [selectedCategory, search]);
  // 打开地址选择模态框
  const showAddressModal = () => {
    if (!loginUser) {
      router.push("/login");
      return;
    }
    setIsAddressModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col px-4 pt-2 pb-2 gap-2">
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => showAddressModal()}
        >
          <LocationFill fontSize={24} color="var(--adm-color-primary)" />
          <div className="text-yellow-950 text-sm font-semibold font-['Poppins']">
            {loginUser?.user_metadata.address 
              ? `${loginUser.user_metadata.address.substring(0, 40)}... < ${loginUser.user_metadata.searchRange || 5}km`
              : "Please select address"}
          </div>
        </div>
        <SearchBar handleSearch={(value) => setSearch(value)} />
      </div>
      <SearchCategory
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <div className="flex-1 overflow-auto px-4 pt-3 pb-20">
        {memoizedProductsShow}
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
