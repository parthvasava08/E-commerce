import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] flex items-center justify-center text-gray-500 dark:text-[#9aa2b1] hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-colors cursor-pointer"
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

export default ThemeToggle;
