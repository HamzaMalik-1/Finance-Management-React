import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-all duration-300 
                 bg-zinc-200 text-zinc-800 hover:bg-zinc-300 
                 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default  ThemeToggle