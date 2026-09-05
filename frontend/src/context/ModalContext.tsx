import React, { createContext, useContext, useState } from 'react';
import { Article } from '../types';

interface ModalContextType {
  selectedArticle: Article | null;
  openArticleModal: (article: Article) => void;
  closeArticleModal: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <ModalContext.Provider
      value={{
        selectedArticle,
        openArticleModal: (article) => setSelectedArticle(article),
        closeArticleModal: () => setSelectedArticle(null),
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModals = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
};
