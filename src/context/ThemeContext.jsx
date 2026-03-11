import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check local storage or default to 'dark'
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

useEffect(() => {
  const root = window.document.documentElement;
  
  // 1. Remove classes
  root.classList.remove("light", "dark");
  
  // 2. Add current theme class
  root.classList.add(theme);
  
  // 3. ❗ THIS IS THE FIX: Tell the browser explicitly what the scheme is
  // This prevents the browser from "guessing" based on OS settings
  root.style.colorScheme = theme; 
  
  localStorage.setItem("theme", theme);
  console.log("Theme changed to:", theme);
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