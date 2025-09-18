import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import HomeTabs from "./screens/HomeTabs";

// Pantallas
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/MainHomeScreen";
import CreateUserScreen from "./screens/CreateUserScreen";
import UserDetailScreen from "./screens/UserDetailScreen";
import ReportesScreen from "./screens/ReportesScreen";
import ReporteViaticosScreen from "./screens/ReporteViaticosScreen";
import ConsultarReportesScreen from "./screens/ConsultarReportesScreen";
import ConfigScreen from "./screens/ConfigScreen";
import ProcesoReparacionScreen from "./screens/ProcesoReparacionScreen";
import ConsultarProcesoReparacionesScreen from "./screens/ConsultarProcesoReparacionesScreen";
import ReportarErrorScreen from "./screens/ReportarErrorScreen";
import ConsultarErroresScreen from "./screens/ConsultarErrores";
import UsuariosListaScreen from "./screens/UsuariosListaScreen";
import ChatRoomScreen from "./screens/ChatRoomScreen";
import EquipoConfiguradoScreen from "./screens/EquipoConfiguradoScreen";
import ConsultarEquiposConfiguradosScreen from "./screens/ConsultarEquiposConfiguradosScreen";
import CostoReparacionesScreen from "./screens/CostoReparacionesScreen";
import ViaticosScreen from "./screens/ViaticosScreen";
import LicenciasTecnicosScreen from "./screens/LicenciasTecnicosScreen";
import ImageViewer from "./screens/ImageViewer";
import ConsultarCostoReparacionScreen from "./screens/ConsultarCostoReparacionScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ComprasVentasScreen from "./screens/ComprasVentasScreen";
import UserList from './screens/UserList';
import ConsultarViaticosScreen from "./screens/ConsultarViaticosScreen";






// Crear el Stack Navigator
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="LoginScreen">

            {/* Login */}
            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{ headerShown: false }}
            />

            {/* Home */}
            <Stack.Screen
              name="HomeScreen"
              component={HomeTabs}
              options={{ headerShown: false }}
            />

          <Stack.Screen
            name="UsuariosListaScreen"
            component={UsuariosListaScreen}
            options={{ title: "Usuarios Disponibles" }}
          />

          <Stack.Screen
            name="ChatRoom"
            component={ChatRoomScreen}
            options={({ route }) => ({ title: route.params.usuario.nombre })}
          />
          
            {/* Gestión de usuarios */}
            <Stack.Screen
              name="CreateUserScreen"
              component={CreateUserScreen}
              options={{ title: "Crear Usuario" }}
            />
            <Stack.Screen
              name="UserDetailScreen"
              component={UserDetailScreen}
              options={{ title: "Detalle del Usuario" }}
            />

            {/* Reportes */}
            <Stack.Screen
              name="ReportesScreen"
              component={ReportesScreen}
              options={{ title: "Reportes de Servicio" }}
            />
            <Stack.Screen
              name="ViaticosScreen"
              component={ViaticosScreen}
              options={{ title: "Reporte de Viáticos" }}
            />
            <Stack.Screen
              name="ConsultarReportesScreen"
              component={ConsultarReportesScreen}
              options={{ title: "Consultar Reportes" }}
            />
            <Stack.Screen
              name="ReporteViaticosScreen"
              component={ReporteViaticosScreen}
              options={{ title: "Reporte de Viáticos" }}
            />

            {/* Configuración */}
            <Stack.Screen
              name="ConfigScreen"
              component={ConfigScreen}
              options={{ title: "Configuración" }}
            />

            {/* Proceso de Reparación */}
            <Stack.Screen
              name="ProcesoReparacionScreen"
              component={ProcesoReparacionScreen}
              options={{ title: "Proceso de Reparación" }}
            />
            <Stack.Screen
              name="ConsultarProcesoReparacionesScreen"
              component={ConsultarProcesoReparacionesScreen}
              options={{ title: "Consultar Reportes de Reparación" }}
            />

            {/* Errores */}
            <Stack.Screen
              name="ReportarErrorScreen"
              component={ReportarErrorScreen}
              options={{ title: "Reportar Error" }}
            />
            <Stack.Screen
              name="ConsultarErroresScreen"
              component={ConsultarErroresScreen}
              options={{ title: "Consultar Errores" }}
            />

            {/* Licencias y equipos */}
            <Stack.Screen
              name="LicenciasTecnicosScreen"
              component={LicenciasTecnicosScreen}
              options={{ title: "Licencias de Técnicos" }}
            />
            <Stack.Screen
              name="EquipoConfiguradoScreen"
              component={EquipoConfiguradoScreen}
              options={{ title: "Equipo Configurado" }}
            />
            <Stack.Screen
              name="ConsultarEquiposConfiguradosScreen"
              component={ConsultarEquiposConfiguradosScreen}
              options={{ title: "Ver Equipos Configurados" }}
            />
            <Stack.Screen
              name="CostoReparacionesScreen"
              component={CostoReparacionesScreen}
              options={{ title: "Costo Reparación" }}
            />
            <Stack.Screen
              name="ConsultarCostoReparacionScreen"
              component={ConsultarCostoReparacionScreen}
              options={{ title: "Consultar Costos Reparación" }}
            />

            <Stack.Screen
              name="ConsultarViaticosScreen"
              component={ConsultarViaticosScreen}
              options={{ title: "Consultar Viaticos" }}
            />

            {/* Otros */}
            <Stack.Screen
              name="ImageViewer"
              component={ImageViewer}
              options={{ title: "ImageViewer" }}
            />
            <Stack.Screen
              name="RegisterScreen"
              component={RegisterScreen}
              options={{ title: "Registrar" }}
            />
            <Stack.Screen
              name="ComprasVentasScreen"
              component={ComprasVentasScreen}
              options={{ title: "Compra Venta" }}
            />
            <Stack.Screen
              name="UserList"
              component={UserList}
              options={{ title: "Usuarios Disponibles" }}
            />


          
           
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}
