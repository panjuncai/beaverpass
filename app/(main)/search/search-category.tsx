export default function SearchCategory({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="overflow-x-auto no-scrollbar pt-2 pb-2 px-4">
      <div className="flex gap-4 min-w-max">
        <button
          className={`w-16 h-9 rounded-xl transition-colors flex items-center justify-center border border-neutral-900/20 text-sm font-semibold font-['Poppins'] ${
            selectedCategory === "All"
              ? "bg-yellow-900/90 text-white"
              : "bg-white text-neutral-900/20 hover:bg-gray-100"
          }`}
          onClick={() => setSelectedCategory("All")}
        >
          All
        </button>
        <button
          className={`h-9 px-6 rounded-xl transition-colors flex items-center justify-center border border-neutral-900/20 text-sm font-semibold font-['Poppins'] ${
            selectedCategory === "Bed"
              ? "bg-yellow-900/90 text-white"
              : "bg-white text-neutral-900/20 hover:bg-gray-100"
          }`}
          onClick={() => setSelectedCategory("Bed")}
        >
          Beds
        </button>
        <button
          className={`h-9 px-6 rounded-xl transition-colors flex items-center justify-center border border-neutral-900/20 text-sm font-semibold font-['Poppins'] ${
            selectedCategory === "Desk"
              ? "bg-yellow-900/90 text-white"
              : "bg-white text-neutral-900/20 hover:bg-gray-100"
          }`}
          onClick={() => setSelectedCategory("Desk")}
        >
          Desks
        </button>
        <button
          className={`h-9 px-6 rounded-xl transition-colors flex items-center justify-center border border-neutral-900/20 text-sm font-semibold font-['Poppins'] ${
            selectedCategory === "Chair"
              ? "bg-yellow-900/90 text-white"
              : "bg-white text-neutral-900/20 hover:bg-gray-100"
          }`}
          onClick={() => setSelectedCategory("Chair")}
        >
          Chairs
        </button>
        <button
          className={`h-9 px-6 rounded-xl transition-colors flex items-center justify-center border border-neutral-900/20 text-sm font-semibold font-['Poppins'] ${
            selectedCategory === "Table"
              ? "bg-yellow-900/90 text-white"
              : "bg-white text-neutral-900/20 hover:bg-gray-100"
          }`}
          onClick={() => setSelectedCategory("Table")}
        >
          Tables
        </button>
        <button
          className={`h-9 px-6 rounded-xl transition-colors flex items-center justify-center border border-neutral-900/20 text-sm font-semibold font-['Poppins'] ${
            selectedCategory === "Sofa"
              ? "bg-yellow-900/90 text-white"
              : "bg-white text-neutral-900/20 hover:bg-gray-100"
          }`}
          onClick={() => setSelectedCategory("Sofa")}
        >
          Sofas
        </button>
        <button
          className={`h-9 px-6 rounded-xl transition-colors flex items-center justify-center border border-neutral-900/20 text-sm font-semibold font-['Poppins'] ${
            selectedCategory === "Storage"
              ? "bg-yellow-900/90 text-white"
              : "bg-white text-neutral-900/20 hover:bg-gray-100"
          }`}
          onClick={() => setSelectedCategory("Storage")}
        >
          Storage
        </button>
        <button
          className={`h-9 px-6 rounded-xl transition-colors flex items-center justify-center border border-neutral-900/20 text-sm font-semibold font-['Poppins'] ${
            selectedCategory === "Other"
              ? "bg-yellow-900/90 text-white"
              : "bg-white text-neutral-900/20 hover:bg-gray-100"
          }`}
          onClick={() => setSelectedCategory("Other")}
        >
          Other
        </button>
      </div>
    </div>
  );
}
