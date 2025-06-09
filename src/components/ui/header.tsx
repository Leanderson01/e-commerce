import { ShoppingCart, User, Search } from "lucide-react";

export function Header() {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-24">
      <div className="flex items-center justify-between content-center my-3">
        <a href="#" className="flex flex-row">
            <p className="text-4xl font-normal text-[#A18A68]">
            i
            </p>
            <p className="text-4xl font-normal text-gray-900 dark:text-gray-100">
            SHOP
            </p>
        </a>
        <div className="flex flex-row">
            <nav className="pr-16 gap-16 text-sm font-normal text-gray-900 dark:text-gray-100 flex border-r border-gray-200 dark:border-gray-700">
                <a href="#">Watch</a>
                <a href="#">Mac</a>
                <a href="#">iPad</a>
                <a href="#">iPhone</a>
            </nav>

            <div className="pl-11 flex items-center gap-9 text-gray-800 dark:text-gray-100">
                <Search className="h-5 w-5 cursor-pointer hover:opacity-75" />
                <ShoppingCart className="h-5 w-5 cursor-pointer hover:opacity-75" />
                <User className="h-5 w-5 cursor-pointer hover:opacity-75" />
            </div>
        </div>
      </div>
    </div>
  );
}
