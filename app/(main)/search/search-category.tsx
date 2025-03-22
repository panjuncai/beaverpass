export default function SearchCategory({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="overflow-x-auto p-2 ml-2 mr-2">
      <div className="flex gap-2 min-w-max">
        <button
          className={`btn ${
            selectedCategory === "All"
              ? "btn-primary"
              : "btn-outline text-gray-400"
          }`}
          onClick={() => setSelectedCategory("All")}
        >
          All
        </button>
        <button
          className={`btn ${
            selectedCategory === "Bed"
              ? "btn-primary"
              : "btn-outline text-gray-400"
          }`}
          onClick={() => setSelectedCategory("Bed")}
        >
          Beds
        </button>
        <button
          className={`btn ${
            selectedCategory === "Desk"
              ? "btn-primary"
              : "btn-outline text-gray-400"
          }`}
          onClick={() => setSelectedCategory("Desk")}
        >
          Desks
        </button>
        <button
          className={`btn ${
            selectedCategory === "Chair"
              ? "btn-primary"
              : "btn-outline text-gray-400"
          }`}
          onClick={() => setSelectedCategory("Chair")}
        >
          Chairs
        </button>
        <button
          className={`btn ${
            selectedCategory === "Table"
              ? "btn-primary"
              : "btn-outline text-gray-400"
          }`}
          onClick={() => setSelectedCategory("Table")}
        >
          Tables
        </button>
        <button
          className={`btn ${
            selectedCategory === "Sofa"
              ? "btn-primary"
              : "btn-outline text-gray-400"
          }`}
          onClick={() => setSelectedCategory("Sofa")}
        >
          Sofas
        </button>
        <button
          className={`btn ${
            selectedCategory === "Storage"
              ? "btn-primary"
              : "btn-outline text-gray-400"
          }`}
          onClick={() => setSelectedCategory("Storage")}
        >
          Storage
        </button>
        <button
          className={`btn ${
            selectedCategory === "Other"
              ? "btn-primary"
              : "btn-outline text-gray-400"
          }`}
          onClick={() => setSelectedCategory("Other")}
        >
          Other
        </button>
      </div>
    </div>
  );
}
