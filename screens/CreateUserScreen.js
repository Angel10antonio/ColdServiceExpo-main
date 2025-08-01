import React, { useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Para íconos
import firebase from '../database/firebase';

const CreateUserScreen = (props) => {
  const [state, setState] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleChangeText = (name, value) => {
    setState({ ...state, [name]: value });
  };

  const saveNewUser = async () => {
    if (state.name === '') {
      alert('Por favor introduzca un nombre');
    } else {
      try {
        await firebase.db.collection('usuarios').add({
          name: state.name,
          email: state.email,
          phone: state.phone,
        });
        props.navigation.navigate('UserList');
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Campo para el nombre de la empresa */}
      <View style={styles.inputGroup}>
        <Ionicons
          name="business"
          size={24}
          color="#007BFF"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre de la Empresa"
          placeholderTextColor="#888"
          onChangeText={(value) => handleChangeText('name', value)}
        />
      </View>

      {/* Campo para el correo electrónico */}
      <View style={styles.inputGroup}>
        <Ionicons name="mail" size={24} color="#007BFF" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#888"
          onChangeText={(value) => handleChangeText('email', value)}
          keyboardType="email-address"
        />
      </View>

      {/* Campo para el número de teléfono */}
      <View style={styles.inputGroup}>
        <Ionicons name="call" size={24} color="#007BFF" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Número de Teléfono"
          placeholderTextColor="#888"
          onChangeText={(value) => handleChangeText('phone', value)}
          keyboardType="phone-pad"
        />
      </View>

      {/* Botón para crear proveedor */}
      <TouchableOpacity style={styles.button} onPress={saveNewUser}>
        <Text style={styles.buttonText}>Crear Proveedor</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000080', // Fondo claro
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff', // Fondo blanco para los inputs
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Sombra en Android
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Sombra en Android
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateUserScreen;
