import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import firebase from '../database/firebase';

const { db } = firebase;

const UserDetailScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState({ name: '', email: '', phone: '' });

  // Obtener los datos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      const doc = await db.collection('usuarios').doc(userId).get();
      if (doc.exists) {
        setUser(doc.data());
      }
    };
    fetchUser();
  }, [userId]);

  // Actualizar el usuario
  const updateUser = async () => {
    await db.collection('usuarios').doc(userId).update(user);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputGroup}>
        <Ionicons
          name="business"
          size={24}
          color="#007BFF"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#888"
          value={user.name}
          onChangeText={(text) => setUser({ ...user, name: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Ionicons name="mail" size={24} color="#007BFF" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#888"
          value={user.email}
          onChangeText={(text) => setUser({ ...user, email: text })}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Ionicons name="call" size={24} color="#007BFF" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Número de Teléfono"
          placeholderTextColor="#888"
          value={user.phone}
          onChangeText={(text) => setUser({ ...user, phone: text })}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={updateUser}>
        <Text style={styles.buttonText}>Actualizar Usuario</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000080',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UserDetailScreen;
