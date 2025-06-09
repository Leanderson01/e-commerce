import { Linkedin, Facebook, Instagram, Twitter, MoveRight } from "lucide-react";

export function Footer() {
    return (
        <div className="grid grid-cols-2 place-content-between border-t border-gray-200 dark:border-gray-700 mt-24 h-40 pt-9 pb-8">
            <nav className="gap-9 text-sm h-10 items-center font-normal text-gray-600 dark:text-gray-400 flex">
                <a href="#">CONTACT</a>
                <a href="#">TERMS OF SERVICES</a>
                <a href="#">SHIPPING AND RETURNS</a>
            </nav>
            <div className="flex justify-end">


            <a href="" className="flex h-10 flex-row items-center w-xs justify-between border-b border-black dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Give an email, get the newsletter.
                </p>
                <MoveRight className="text-gray-600"/>
            
            </a>
            </div>    
            <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 Terms of use and privacy policy
            </p>
            <div className="flex space-x-4 justify-end">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <Twitter className="h-5 w-5" />
                </a>
            </div>
    </div>
    );
}   