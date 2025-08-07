import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './context/AuthContext'; // Importa el AuthProvider
import { ThemeProvider } from './context/ThemeContext';
import HomeTabs from './screens/HomeTabs';

// Importa las pantallas
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/MainHomeScreen';
import UserList from './screens/UserList';
import CreateUserScreen from './screens/CreateUserScreen';
import UserDetailScreen from './screens/UserDetailScreen';
import ReportesScreen from './screens/ReportesScreen';
import ReporteViaticosScreen from './screens/ReporteViaticosScreen'; // Importa la pantalla de reporte de viáticos
import ConsultarReportesScreen from './screens/ConsultarReportesScreen';
import ConfigScreen from './screens/ConfigScreen';
import ProcesoReparacionScreen from './screens/ProcesoReparacionScreen';
import ConsultarProcesoReparacionesScreen from './screens/ConsultarProcesoReparacionesScreen'; // Agrega la importación
import ReportarErrorScreen from './screens/ReportarErrorScreen'; // ajusta el path si es necesario
import ConsultarErroresScreen from './screens/ConsultarErrores';
import Chat from './screens/Chat'; // tu segunda pantalla (la de chat)
import ChatRoom from './screens/ChatRoom';
import EquipoConfiguradoScreen from './screens/EquipoConfiguradoScreen';
import ConsultarEquiposConfiguradosScreen from './screens/ConsultarEquiposConfiguradosScreen';
import CostoReparacionesScreen from './screens/CostoReparacionesScreen';
import ViaticosScreen from './screens/ViaticosScreen';
import LicenciasTecnicosScreen from './screens/LicenciasTecnicosScreen';
import ImageViewer from './screens/ImageViewer';
import ConsultarCostoReparacionScreen from './screens/ConsultarCostoReparacionScreen';
import RegisterScreen from './screens/RegisterScreen';

// Crea el navegador de pila
const Stack = createNativeStackNavigator();

// Define la pila de navegación
function MyStack() {
  return (
    <Stack.Navigator initialRouteName="LoginScreen">
      {/* Pantalla de inicio de sesión */}
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      {/* Pantalla principal */}
      <Stack.Screen
        name="HomeScreen"
        component={HomeTabs}
        options={{ headerShown: false }}
      />

      {/* Pantallas de gestión de usuarios */}
      <Stack.Screen
        name="UserList"
        component={UserList}
        options={{ title: 'Lista de Usuarios' }}
      />
      <Stack.Screen
        name="ConsultarCostoReparacionScreen"
        component={ConsultarCostoReparacionScreen}
        options={{ title: 'Consultar Costos Reparacion' }}
      />
      <Stack.Screen
        name="ImageViewer"
        component={ImageViewer}
        options={{ title: 'ImageViewer' }}
      />
      <Stack.Screen
        name="CreateUserScreen"
        component={CreateUserScreen}
        options={{ title: 'Crear Usuario' }}
      />
      <Stack.Screen
        name="UserDetailScreen"
        component={UserDetailScreen}
        options={{ title: 'Detalle del Usuario' }}
      />

      {/* Pantallas de reportes */}
      <Stack.Screen
        name="ReportesScreen"
        component={ReportesScreen}
        options={{ title: 'Reportes de Servicio' }}
      />

      <Stack.Screen
        name="ViaticosScreen"
        component={ViaticosScreen}
        options={{ title: 'Reporte de Viaticos' }}
      />
      <Stack.Screen
        name="ConsultarReportesScreen"
        component={ConsultarReportesScreen}
        options={{ title: 'Consultar Reportes' }}
      />
      <Stack.Screen
        name="ReporteViaticosScreen"
        component={ReporteViaticosScreen}
        options={{ title: 'Reporte de Viáticos' }}
      />

      {/* Pantalla de configuración */}
      <Stack.Screen
        name="ConfigScreen"
        component={ConfigScreen}
        options={{ title: 'Configuración' }}
      />

      {/* Pantallas de Proceso de Reparación */}
      <Stack.Screen
        name="ProcesoReparacionScreen"
        component={ProcesoReparacionScreen}
        options={{ title: 'Proceso de Reparación' }}
      />
      <Stack.Screen
        name="ConsultarProcesoReparacionesScreen"
        component={ConsultarProcesoReparacionesScreen}
        options={{ title: 'Consultar Reportes de Reparación' }}
      />

      {/* Pantallas de errores */}
      <Stack.Screen
        name="ReportarErrorScreen"
        component={ReportarErrorScreen}
        options={{ title: 'Reportar Error' }}
      />
      <Stack.Screen
        name="ConsultarErroresScreen"
        component={ConsultarErroresScreen}
        options={{ title: 'Consultar Errores' }}
      />

      {/* Pantallas de chat */}
      <Stack.Screen name="Chat" component={Chat} options={{ title: 'Chat' }} />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoom}
        options={{ title: 'Sala de Chat' }}
      />
      {/* Pantallas de relevantes a Técnicos */}
      <Stack.Screen
        name="LicenciasTecnicosScreen"
        component={LicenciasTecnicosScreen}
        options={{ title: 'Licencias de Técnicos' }}
      />

      {/* Pantallas de equipos configurados */}
      <Stack.Screen
        name="EquipoConfiguradoScreen"
        component={EquipoConfiguradoScreen}
        options={{ title: 'Equipo configurado' }}
      />
      <Stack.Screen
        name="ConsultarEquiposConfiguradosScreen"
        component={ConsultarEquiposConfiguradosScreen}
        options={{ title: 'Ver Equipos Configurados' }}
      />
      <Stack.Screen
        name="CostoReparacionesScreen"
        component={CostoReparacionesScreen}
        options={{ title: 'Costo Reparación' }}
      />
      <Stack.Screen
        name="RegisterScreen"
        component={RegisterScreen}
        options={{ title: 'Registrar' }}
      />
    </Stack.Navigator>
  );
}

// Componente principal de la aplicación
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MyStack />
      </NavigationContainer>
    </AuthProvider>
  );
}
