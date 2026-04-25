import { createContext, useContext, useState } from 'react';

const DocsTOCContext = createContext({
  headings: [],
  setHeadings: () => {},
});

export function DocsTOCProvider({ children }) {
  const [headings, setHeadings] = useState([]);
  
  return (
    <DocsTOCContext.Provider value={{ headings, setHeadings }}>
      {children}
    </DocsTOCContext.Provider>
  );
}

export function useDocsTOC() {
  const context = useContext(DocsTOCContext);
  if (!context) {
    throw new Error('useDocsTOC must be used within DocsTOCProvider');
  }
  return context;
}

export default DocsTOCContext;
