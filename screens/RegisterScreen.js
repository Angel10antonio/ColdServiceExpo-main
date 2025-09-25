import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker"; 
import firebaseApp from "../database/firebase";

const { auth, db } = firebaseApp;

const RegistrarScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState("");
  const [tienda, setTienda] = useState(""); // antes empresa
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Campos para Gerente General
  const [estado, setEstado] = useState("");
  const [tiendaGeneral, setTiendaGeneral] = useState(""); // si quieres mantener separado

  // Campos para Gerente Zona
  const [ciudad, setCiudad] = useState("");
  const [tiendaZona, setTiendaZona] = useState("");
  const [directienda, setDirectienda] = useState(""); // antes puntoZona

  // 👇 Estado para el rol
  const [rol, setRol] = useState("usuario");

  const handleRegister = async () => {
    if (!nombre || !tienda || !telefono || !correo || !password || !rol) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (rol === "gerente" && (!estado || !tiendaGeneral)) {
      Alert.alert("Error", "Por favor completa Estado y Nombre de la tienda");
      return;
    }

    if (rol === "gerentezona" && (!ciudad || !tiendaZona || !directienda)) {
      Alert.alert(
        "Error",
        "Por favor completa Ciudad, Nombre de la tienda y Directienda"
      );
      return;
    }

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(
        correo,
        password
      );
      const user = userCredential.user;

      let data = {
        uid: user.uid,
        nombre,
        tienda, // antes empresa
        telefono,
        correo,
        role: rol,
      };

      if (rol === "gerente") {
        data.estado = estado;
        data.tienda = tiendaGeneral;
      }

      if (rol === "gerentezona") {
        data.zona = ciudad; // antes ciudad
        data.tienda = tiendaZona;
        data.directienda = directienda; // antes puntoZona
      }

      await db.collection("users").doc(user.uid).set(data);

      Alert.alert("Éxito", "Usuario registrado correctamente");
      navigation.goBack();
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
        placeholder="Tienda"
        placeholderTextColor="#888"
        value={tienda}
        onChangeText={setTienda}
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
          style={styles.passwordInput}
          placeholder="Contraseña"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Ionicons
            name={isPasswordVisible ? "eye" : "eye-off"}
            size={24}
            color="#000080"
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.usuario}>Seleccione su rol de usuario</Text>
      <View style={styles.input}>
        {rol === "" && (
          <Text style={styles.placeholder}>Selecciona un rol de usuario</Text>
        )}

        <Picker
          selectedValue={rol}
          onValueChange={(itemValue) => setRol(itemValue)}
          style={styles.picker}
          dropdownIconColor="#888"
        >
          <Picker.Item label="Usuario" value="usuario" />
          <Picker.Item label="Administrador" value="admin" />
          <Picker.Item label="Gerente General" value="gerente" />
          <Picker.Item label="Gerente Zona" value="gerentezona" />
        </Picker>

        {rol === "gerente" && (
          <View style={styles.gerenteFields}>
            <Text>Estado:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu estado"
              value={estado}
              onChangeText={setEstado}
            />

            <Text>Nombre de la tienda:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa el nombre de tu tienda"
              value={tiendaGeneral}
              onChangeText={setTiendaGeneral}
            />
          </View>
        )}

        {rol === "gerentezona" && (
          <View style={styles.gerenteFields}>
            <Text>Ciudad:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu ciudad"
              value={ciudad}
              onChangeText={setCiudad}
            />

            <Text>Nombre de la tienda:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa el nombre de tu tienda"
              value={tiendaZona}
              onChangeText={setTiendaZona}
            />

            <Text>Directienda:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa la directienda"
              value={directienda}
              onChangeText={setDirectienda}
            />
          </View>
        )}
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
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    marginLeft: 10,
  },
  picker: {
    width: "100%",
    height: 55,
    color: "#333",
  },
  gerenteFields: {
    marginTop: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#000080",
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
  usuario: {
    color: "#000080",
    width: "95%",
  },
});

export default RegistrarScreen;
