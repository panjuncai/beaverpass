export default function PostDetailMainPostAbout() {
  return (
    <div className="mt-4 flex flex-col">
      <span className="font-medium text-xl">About this item</span>
      <span className="text-sm text-gray-400">Dimensions:</span>
      <span className="text-lg">Table 81.3 cm x 40.6 cm x 71.1 cm.</span>
      <span className="text-md text-gray-400">
        Click to view the damage images below:
      </span>
      <a href="#" className="text-lg underline underline-offset-4 text-primary">
        Scratch: 2{" "}
      </a>
    </div>
  );
}
