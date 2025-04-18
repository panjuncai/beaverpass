import { motion } from "framer-motion";

export default function NoDeal() {
  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-full text-gray-400"
        >
          <svg
            className="w-12 h-12"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
          >
            <rect width="256" height="256" fill="none" />
            <circle cx="88" cy="216" r="16" fill="currentColor"/>
            <circle cx="192" cy="216" r="16" fill="currentColor"/>
            <path
              d="M16,32H40L76.75,164.28A16,16,0,0,0,92.16,176H191a16,16,0,0,0,15.42-11.72L232,72H51.11"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="16"
            />
          </svg>
          <h2 className="text-lg font-semibold">No Deal</h2>
        </motion.div>
      );
}