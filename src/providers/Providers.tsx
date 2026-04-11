"use client";

import { Provider } from "react-redux";
import store from "@/store/store";
import { ThemeProvider } from "@/components/theme-provider";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </Provider>
  );
}
