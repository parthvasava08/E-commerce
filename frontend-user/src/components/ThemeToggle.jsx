import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] text-gray-600 dark:text-[#f0f2f7] hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-colors cursor-pointer"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export default ThemeToggle;
