"use client"
import { motion } from "framer-motion";
import WalletConnect from "./WalletConnect";

interface NavBarProps {
  children?: React.ReactNode;
}
const NavBar: React.FC<NavBarProps> = ({ children }) => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                🧠 Chain Chat
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
           {children}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;