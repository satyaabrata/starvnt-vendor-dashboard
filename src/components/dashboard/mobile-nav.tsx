"use client";

import { useState, createContext, useContext } from "react";

const SidebarContext = createContext<{
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}>({ isOpen: false, toggle: () => {}, close: () => {} });

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen((v) => !v),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarOverlay() {
  const { isOpen, close } = useSidebar();
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-30 lg:hidden"
      onClick={close}
    />
  );
}
