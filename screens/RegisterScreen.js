import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebaseApp from "../database/firebase"; // Importa el objeto default
const { auth, db } = firebaseApp;               // Desestructura auth y db

const RegistrarScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleRegister = async () => {
    if (!nombre || !telefono || !correo || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      // Crear usuario en Firebase Auth usando auth
      const userCredential = await auth.createUserWithEmailAndPassword(correo, password);
      const user = userCredential.user;

      // Guardar datos adicionales en Firestore usando db
      await db.collection("users").doc(user.uid).set({
        uid: user.uid,
        nombre,
        telefono,
        correo,
        role: "usuario",  // Rol asignado al registrar
      });

      Alert.alert("Éxito", "Usuario registrado correctamente");
      navigation.goBack(); // Volver a login

    } catch (error) {
      Alert.alert("Error al registrar", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro de Usuario</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor="#888"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        placeholderTextColor="#888"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#888"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0, shadowOpacity: 0 }]}
          placeholder="Contraseña"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <Ionicons
            name={isPasswordVisible ? "eye" : "eye-off"}
            size={24}
            color="#007BFF"
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RegistrarScreen;
