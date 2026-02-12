import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check local storage or default to 'dark'
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old theme and apply new one
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Persist to localStorage
    localStorage.setItem("theme", theme);
    console.log("running")
    // TODO: Here you can call your backend API to update theme_preference
    // updateUserSettings({ theme_preference: theme });
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);