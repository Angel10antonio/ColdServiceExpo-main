// Chat.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import firebaseApp from "../database/firebase";

const { auth, db } = firebaseApp;

const ListaUsuariosScreen = ({ navigation }) => {
  const [usuarios, setUsuarios] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = db.collection("users").onSnapshot((snapshot) => {
      const data = snapshot.docs
        .map((doc) => doc.data())
        .filter((u) => u.uid !== user.uid); // Excluir usuario actual
      setUsuarios(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => navigation.navigate("ChatRoom", { usuario: item })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(item.nombre ? item.nombre.charAt(0) : "?").toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.nombre}>{item.nombre || "Sin nombre"}</Text>
              <Text style={styles.correo}>{item.correo || "Sin correo"}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4349a1ff",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Sombra en Android
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  correo: {
    color: "#777",
    fontSize: 14,
  },
});

export default ListaUsuariosScreen;
