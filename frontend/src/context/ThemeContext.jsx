import { createContext, useContext } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Hardcoded to light mode as per requirements
  const darkMode = false;
  const toggleDark = () => {}; // No-op

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
