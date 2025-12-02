import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Comandas from "./pages/Comandas";
import TabDetail from "./pages/TabDetail";
import Produtos from "./pages/Produtos";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { useEffect } from "react";
import { useComandaStore } from "@/store/comandaStore";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { PrivateRoute } from "@/components/auth/PrivateRoute";

const queryClient = new QueryClient();

const App = () => {
  const fetchInitialData = useComandaStore((state) => state.fetchInitialData);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" theme="dark" />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/" element={
                <PrivateRoute>
                  <Index />
                </PrivateRoute>
              } />
              <Route path="/comandas" element={
                <PrivateRoute>
                  <Comandas />
                </PrivateRoute>
              } />
              <Route path="/comandas/:id" element={
                <PrivateRoute>
                  <TabDetail />
                </PrivateRoute>
              } />
              <Route path="/produtos" element={
                <PrivateRoute>
                  <Produtos />
                </PrivateRoute>
              } />
              <Route path="/relatorios" element={
                <PrivateRoute>
                  <Relatorios />
                </PrivateRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
