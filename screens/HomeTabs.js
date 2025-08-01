import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity, Alert, StyleSheet, View, Text } from 'react-native';
import firebase from '../database/firebase'; // Asegúrate de que la ruta sea la correcta

// Pantallas que quieres mostrar en las pestañas
import MainHomeScreen from './MainHomeScreen';
import ConfigScreen from './ConfigScreen';
import MensajesScreen from './Chat';

// Función para cerrar sesión con confirmación
const handleLogout = (navigation) => {
  Alert.alert(
    'Cerrar sesión',
    '¿Desea cerrar sesión?',
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Aceptar',
        onPress: async () => {
          try {
            await firebase.auth.signOut(); // Usamos firebase.auth para cerrar sesión
            navigation.replace('LoginScreen'); // Redirige al LoginScreen después de cerrar sesión
          } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Alert.alert('Error', 'No se pudo cerrar la sesión.');
          }
        },
      },
    ],
    { cancelable: true },
  );
};

// Componente vacío para "Cerrar Sesión"
const EmptyScreen = () => null;

const Tab = createBottomTabNavigator();

export default function HomeTabs({ route, navigation }) {
  const { userRole } = route.params;

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Inicio"
        component={MainHomeScreen}
        initialParams={{ userRole }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Mensaje"
        component={MensajesScreen}
        initialParams={{ userRole }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="comments" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Configuración"
        component={ConfigScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="cogs" size={size} color={color} />
          ),
        }}
      />

      {/* Botón personalizado para cerrar sesión */}
      <Tab.Screen
        name="Cerrar Sesión"
        component={EmptyScreen} // Asignamos el componente vacío aquí
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => handleLogout(navigation)}
              style={styles.logoutButton}
            >
              <View style={{ alignItems: 'center' }}>
                <FontAwesome name="user" size={24} color="grey" />
                <Text style={{ fontSize: 10, color: 'grey' }}>Cuenta</Text>
              </View>
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    padding: 15,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
