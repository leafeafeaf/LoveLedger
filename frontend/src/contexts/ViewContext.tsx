import React, { createContext, useContext, useState, ReactNode } from 'react';

type ViewType = 'you' | 'partner' | 'combined';

interface ViewContextType {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  partnerName: string;
  setPartnerName: (name: string) => void;
}

const defaultContext: ViewContextType = {
  activeView: 'you',
  setActiveView: () => {},
  partnerName: '파트너',
  setPartnerName: () => {}
};

const ViewContext = createContext<ViewContextType>(defaultContext);

export const useView = () => useContext(ViewContext);

interface ViewProviderProps {
  children: ReactNode;
}

export const ViewProvider: React.FC<ViewProviderProps> = ({ children }) => {
  const [activeView, setActiveView] = useState<ViewType>('you');
  const [partnerName, setPartnerName] = useState<string>('파트너');

  return (
    <ViewContext.Provider 
      value={{ 
        activeView, 
        setActiveView, 
        partnerName, 
        setPartnerName 
      }}
    >
      {children}
    </ViewContext.Provider>
  );
};