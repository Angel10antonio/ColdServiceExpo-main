import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Icono de usuario
import firebase from 'firebase/compat/app'; // Importa Firebase
import 'firebase/compat/firestore'; // Importa Firestore de Firebase

export default function ChatRoom({ route }) {
  const { chatId, name } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const scrollViewRef = useRef();

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  };

  const sendMessage = async () => {
    if (message.trim()) {
      const newMessage = { 
        text: message, 
        from: name,
        timestamp: new Date().toISOString(),
      };

      const userChatId = name === 'admin' ? 'usuario' : 'admin';

      await firebase.firestore().collection('chats').doc(`${userChatId}-${name}`).collection('messages').add(newMessage);
      await firebase.firestore().collection('chats').doc(`${name}-${userChatId}`).collection('messages').add(newMessage);

      setMessage(''); // Limpia el campo de mensaje después de enviarlo
    }
  };

  const loadMessages = () => {
    const userChatId = name === 'admin' ? 'usuario' : 'admin';
    const messagesRef = firebase.firestore().collection('chats').doc(`${userChatId}-${name}`).collection('messages');

    const unsubscribe = messagesRef.orderBy('timestamp', 'asc').onSnapshot((snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(newMessages);
    });

    return () => {
      unsubscribe();
    };
  };

  useEffect(() => {
    loadMessages();

    return () => {
      firebase.firestore().collection('chats').doc(`${name === 'admin' ? 'usuario' : 'admin'}-${name}`).collection('messages').onSnapshot(() => {});
    };
  }, [chatId, name]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, []);  // Desplazarse al último mensaje solo cuando se cargan los mensajes al inicio

  const deleteMessage = async (messageId, messageFrom) => {
    if (messageFrom !== name) {
      Alert.alert('Error', 'No puedes eliminar los mensajes que no has enviado.');
      return;
    }

    const userChatId = name === 'admin' ? 'usuario' : 'admin';
    const messageRefAdmin = firebase.firestore().collection('chats').doc(`${userChatId}-${name}`).collection('messages').doc(messageId);
    const messageRefUser = firebase.firestore().collection('chats').doc(`${name}-${userChatId}`).collection('messages').doc(messageId);

    try {
      await messageRefAdmin.delete();
      await messageRefUser.delete();
      Alert.alert('Mensaje eliminado', 'El mensaje ha sido eliminado con éxito');
    } catch (error) {
      console.error('Error al eliminar el mensaje:', error);
      Alert.alert('Error', 'Hubo un problema al eliminar el mensaje.');
    }
  };

  const handleLongPress = (messageId, messageFrom) => {
    setSelectedMessage(messageId);
    Alert.alert(
      'Eliminar mensaje',
      '¿Estás seguro de que deseas eliminar este mensaje?',
      [
        {
          text: 'Cancelar',
          onPress: () => setSelectedMessage(null),
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            deleteMessage(messageId, messageFrom);
            setSelectedMessage(null);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const groupMessagesByDate = (messages) => {
    const groupedMessages = [];
    let currentDate = null;

    messages.forEach((msg, index) => {
      const messageDate = new Date(msg.timestamp).toDateString();
      if (messageDate !== currentDate) {
        groupedMessages.push({ date: messageDate, messages: [msg] });
        currentDate = messageDate;
      } else {
        groupedMessages[groupedMessages.length - 1].messages.push(msg);
      }
    });

    return groupedMessages;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <View style={styles.container}>
      <Text style={styles.chatHeader}>Chat con {name === 'admin' ? 'Administrador' : name}</Text>

      <ScrollView 
        style={styles.messageContainer} 
        ref={scrollViewRef}
        onContentSizeChange={() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }}
      >
        {groupedMessages.map((group, index) => (
          <View key={index}>
            <Text style={styles.dateLabel}>{formatDate(group.date)}</Text>
            {group.messages.map((msg) => (
              <View key={msg.id} style={msg.from === name ? styles.userMessage : styles.adminMessage}>
                <Text
                  style={msg.from === name ? styles.userText : styles.adminText}
                  onLongPress={() => handleLongPress(msg.id, msg.from)}
                >
                  {msg.text}
                </Text>
                <Text style={msg.from === name ? styles.userTime : styles.adminTime}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <FontAwesome name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  chatHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  messageContainer: {
    flex: 1,
    marginBottom: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'blue',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    maxWidth: '80%',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  adminMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e1e1e1',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    maxWidth: '80%',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userText: {
    color: 'white',
    fontSize: 16,
  },
  adminText: {
    color: '#333',
    fontSize: 16,
  },
  userTime: {
    color: 'white',
    fontSize: 11,
    marginTop: 5,
  },
  adminTime: {
    color: '#aaa',
    fontSize: 11,
    marginTop: 5,
  },
  dateLabel: {
    fontSize: 17,
    color: 'black',
    marginVertical: 10,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#ddd',
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginLeft: 10,
  },
});
