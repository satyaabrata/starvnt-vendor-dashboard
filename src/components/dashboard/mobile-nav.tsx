"use client";

import { useState, createContext, useContext } from "react";

const SidebarContext = createContext<{
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  close: () => void;
  toggleCollapse: () => void;
}>({
  isOpen: false,
  isCollapsed: false,
  toggle: () => {},
  close: () => {},
  toggleCollapse: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        toggle: () => setIsOpen((v) => !v),
        close: () => setIsOpen(false),
        toggleCollapse: () => setIsCollapsed((v) => !v),
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
