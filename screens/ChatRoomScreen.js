// ChatRoomScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import firebaseApp from "../database/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { auth, db } = firebaseApp;

const ChatRoomScreen = ({ route }) => {
  const { usuario } = route.params;
  const user = auth.currentUser;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatId, setChatId] = useState(null);

  // Buscar o crear chat
  useEffect(() => {
    const chatsRef = db.collection("chats");
    const q = chatsRef.where("usuarios", "array-contains", user.uid);

    const unsubscribe = q.onSnapshot(async (snapshot) => {
      let foundChat = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.usuarios.includes(usuario.uid)) {
          foundChat = { id: doc.id, ...data };
        }
      });

      if (foundChat) {
        setChatId(foundChat.id);
        listenMensajes(foundChat.id);
      } else {
        const docRef = await chatsRef.add({
          usuarios: [user.uid, usuario.uid],
          creadoEn: new Date(),
        });
        setChatId(docRef.id);
      }
    });

    return () => unsubscribe();
  }, []);

  const listenMensajes = (id) => {
    const mensajesRef = db
      .collection("chats")
      .doc(id)
      .collection("mensajes")
      .orderBy("createdAt", "asc");

    return mensajesRef.onSnapshot((snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          uid: data.user._id,
          nombre: data.user.name,
          createdAt: data.createdAt ? data.createdAt.toDate() : null,
        };
      });
      setMessages(msgs);
    });
  };

  const sendMessage = async () => {
    if (text.trim() === "" || !chatId) return;
    const mensajesRef = db
      .collection("chats")
      .doc(chatId)
      .collection("mensajes");

    await mensajesRef.add({
      text,
      createdAt: new Date(),
      user: { _id: user.uid, name: user.displayName || "Yo" },
    });
    setText("");
  };

  const formatTime = (date) => {
    if (!date) return "";
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = hours < 10 ? "0" + hours : hours;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    return `${formattedHours}:${formattedMinutes}`;
  };

  const renderItem = ({ item }) => {
    const isMyMessage = item.uid === user.uid;
    return (
      <View
        style={[
          styles.message,
          isMyMessage ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={isMyMessage ? styles.myMessageText : styles.theirMessageText}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
          {isMyMessage && (
            <MaterialCommunityIcons
              name="check-all"
              size={16}
              color="#4fc3f7"
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#4349a1ff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
    >
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <MaterialCommunityIcons
            name="send"
            size={24}
            color="#fff"
            style={{ transform: [{ rotate: "-20deg" }] }}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 15,
    maxWidth: "75%",
  },
  myMessage: {
    backgroundColor: "#dcf8c6",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  myMessageText: {
    color: "#000",
    fontSize: 16,
  },
  theirMessageText: {
    color: "#000",
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: "#555",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 30,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#4e9ef1",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

export default ChatRoomScreen;
