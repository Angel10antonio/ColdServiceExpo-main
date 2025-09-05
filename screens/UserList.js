import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import firebase from '../database/firebase';

const UserList = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await firebase.db.collection('usuarios').get();
        const users = [];
        querySnapshot.forEach((doc) => {
          const { name, email, phone } = doc.data();
          users.push({
            id: doc.id,
            name,
            email,
            phone,
          });
        });
        setUsers(users);
        setFilteredUsers(users);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      }
    };

    fetchUsers();
  }, []);

  // Filtrar usuarios en base a la búsqueda
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        `${user.name}`.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredUsers(filtered);
    }
  }, [searchText, users]);

  const deleteUser = async (id) => {
    Alert.alert(
      'Eliminar Usuario',
      '¿Estás seguro de que quieres eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await firebase.db.collection('usuarios').doc(id).delete();
              Alert.alert('Usuario eliminado correctamente');
              setUsers(users.filter((user) => user.id !== id));
            } catch (error) {
              console.error('Error al eliminar usuario:', error);
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  const handleEmailPress = (email) => {
    const subject = 'Consulta desde la app';
    const body = 'Hola, me gustaría contactarte.';
    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de correo.');
    });
  };

  const handleWhatsAppPress = (phone) => {
    Linking.openURL(`https://wa.me/${phone}`).catch(() => {
      Alert.alert('Error', 'No se pudo abrir WhatsApp.');
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar usuario."
        placeholderTextColor="#fff"
        value={searchText}
        onChangeText={setSearchText}
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateUserScreen')}
      >
        <Text style={styles.createButtonText}>Crear Usuario</Text>
      </TouchableOpacity>

      {filteredUsers.length === 0 ? (
        <Text style={styles.noUsersText}>No hay usuarios registrados.</Text>
      ) : (
        filteredUsers.map((user) => (
          <View key={user.id} style={styles.userContainer}>
            <Text style={styles.text}>Nombre: {user.name}</Text>

            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => handleEmailPress(user.email)}
            >
              <Icon name="email" size={24} color="#007BFF" />
              <Text style={styles.iconText}>{user.email}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => handleWhatsAppPress(user.phone)}
            >
              <FontAwesome name="whatsapp" size={24} color="#25D366" />
              <Text style={styles.iconText}>{user.phone}</Text>
            </TouchableOpacity>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() =>
                  navigation.navigate('UserDetailScreen', { userId: user.id })
                }
              >
                <Icon name="settings" size={24} color="#007BFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => deleteUser(user.id)}
              >
                <Icon name="delete" size={24} color="#FF0000" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000080',
    
    
  },
  searchInput: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  userContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#007BFF',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  iconButton: {
    marginLeft: 15,
  },
  noUsersText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
     color: '#fff',
  },
});

export default UserList;