import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light", icon: <Sun size={14} />, label: "Light" },
    { value: "dark", icon: <Moon size={14} />, label: "Dark" },
    { value: "system", icon: <Monitor size={14} />, label: "System" },
  ];

  return (
    <div className="flex items-center bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-lg p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={opt.label}
          className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors border-none cursor-pointer ${
            theme === opt.value
              ? "bg-[#4f8ef7] text-white"
              : "bg-transparent text-gray-400 dark:text-[#4a5568] hover:text-gray-900 dark:hover:text-[#f0f2f7]"
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

export default ThemeToggle;
