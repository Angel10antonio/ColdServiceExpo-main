import React, { useState, useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity, Alert, StyleSheet, View, Text, Modal, TouchableWithoutFeedback, Animated, Dimensions } from 'react-native';
import firebase from '../database/firebase';

import MainHomeScreen from './MainHomeScreen'; 
import ConfigScreen from './ConfigScreen';
import MensajesScreen from './UsuariosListaScreen';

const screenWidth = Dimensions.get('window').width;
const Tab = createBottomTabNavigator();

export default function HomeTabs({ route, navigation }) {
  const { userRole } = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [pin, setPin] = useState('');

  const usuario = firebase.auth.currentUser;

  // 🔹 Función para generar un PIN único de 4 dígitos
  const generarPinUnico = async () => {
    let unico = false;
    let nuevoPin = '';
    while (!unico) {
      nuevoPin = Math.floor(1000 + Math.random() * 9000).toString();
      const query = await firebase.db.collection('users').where('pin', '==', nuevoPin).get();
      if (query.empty) {
        unico = true;
      }
    }
    return nuevoPin;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      if (usuario) {
        try {
          const docRef = firebase.db.collection('users').doc(usuario.uid);
          const doc = await docRef.get();
          if (doc.exists) {
            const data = doc.data();
            setNombre(data.nombre || '');
            setTelefono(data.telefono || '');

            if (!data.pin) {
              const nuevoPin = await generarPinUnico();
              await docRef.update({ pin: nuevoPin });
              setPin(nuevoPin);
            } else {
              setPin(data.pin);
            }
          }
        } catch (error) {
          console.error("Error obteniendo datos del usuario:", error);
        }
      }
    };
    cargarDatos();
  }, []);

  const openSidePanel = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: screenWidth * 0.4,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeSidePanel = () => {
    Animated.timing(slideAnim, {
      toValue: screenWidth,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setModalVisible(false));
  };

  const cerrarSesion = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Desea cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Aceptar', 
          onPress: async () => {
            try {
              await firebase.auth.signOut();
              navigation.replace('LoginScreen');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar la sesión.');
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <>
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

        <Tab.Screen
          name="Cuenta"
          component={() => null}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="user" size={size} color={color} />
            ),
            tabBarLabel: 'Cuenta',
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props}
                onPress={openSidePanel}
                style={styles.tabButton}
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

      <Modal transparent visible={modalVisible} animationType="none">
        <TouchableWithoutFeedback onPress={closeSidePanel}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sidePanel, { left: slideAnim }]}>
          <Text style={styles.title}>Mi cuenta</Text>
          {usuario ? (
            <>
              <View style={styles.row}>
                <FontAwesome name="user" size={20} color="grey" />
                <Text style={styles.label}>{nombre || 'Cargando...'}</Text>
              </View>

              <View style={styles.row}>
                <FontAwesome name="envelope" size={20} color="grey" />
                <Text style={styles.label}>{usuario?.email || 'Cargando...'}</Text>
              </View>

              <View style={styles.row}>
                <FontAwesome name="phone" size={20} color="grey" />
                <Text style={styles.label}>{telefono || 'Cargando...'}</Text>
              </View>

              <View style={styles.row}>
                <FontAwesome name="lock" size={20} color="grey" />
                <Text style={styles.label}>PIN: {pin || 'Cargando...'}</Text>
              </View>

              {/* 🔹 Bloque temporal para actualizar datos (comentado)
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontWeight: 'bold' }}>Actualizar Datos</Text>
                <TextInput
                  placeholder="Nuevo Nombre"
                  value={nuevoNombre}
                  onChangeText={setNuevoNombre}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Nuevo Teléfono"
                  value={nuevoTelefono}
                  onChangeText={setNuevoTelefono}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
                <Button
                  title="Guardar Datos"
                  onPress={actualizarUsuario}
                  color="#28a745"
                />
              </View>
              */}

            </>
          ) : (
            <Text>No hay usuario autenticado</Text>
          )}

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={cerrarSesion}
          >
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    padding: 9,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sidePanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '60%',
    backgroundColor: '#ebe8e8ff',
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    marginLeft: 13,
  },
  logoutButton: {
    borderWidth: 2,
    borderColor: '#ca0b04ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ca0b04ff',
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
