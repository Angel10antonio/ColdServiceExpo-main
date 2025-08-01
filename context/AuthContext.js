import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado del usuario (solo correo)

  // Función para iniciar sesión
  const login = (email) => {
    setUser(email); // Guarda el correo del usuario
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null); // Elimina el usuario del estado
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};