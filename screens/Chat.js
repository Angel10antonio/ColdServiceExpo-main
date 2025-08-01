import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import firebase from 'firebase/compat/app'; // Importa Firebase completo
import 'firebase/compat/auth'; // Importa auth de Firebase

class Main extends React.Component {
  static navigationOptions = {
    title: 'Chatter',
  };

  state = {
    userRole: null,  // Estado para el rol del usuario (inicialmente null mientras se carga)
  };

  // Función que se ejecuta cuando el componente se monta
  componentDidMount() {
    if (firebase.auth()) {
      firebase.auth().onAuthStateChanged(user => {
        console.log("Estado de autenticación:", user);

        if (user) {
          console.log("Correo del usuario:", user.email);
          
          // Comprobamos si el usuario es 'admin' o 'usuario' basándonos en el correo
          this.setState({
            userRole: user.email === 'admin@gmail.com' ? 'admin' : 'usuario',
          });
        } else {
          console.log("No hay usuario autenticado");
          this.setState({ userRole: null });
        }
      });
    } else {
      console.log("Firebase auth no está disponible");
    }
  }

  // Función que navega a la pantalla de chat con el usuario seleccionado
  onPressChat = () => {
    const { userRole } = this.state;

    // Generar un ID único para cada chat
    const chatId = userRole === 'admin' ? 'usuario' : 'admin';

    this.props.navigation.navigate('ChatRoom', { name: chatId });
  };

  render() {
    const { userRole } = this.state;

    // Si el estado de userRole aún no está definido (cargando datos), mostramos un mensaje de carga
    if (userRole === null) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Cargando...</Text>
        </View>
      );
    }

    // Si el usuario no tiene un rol válido, lo redirigimos a la pantalla de login
    if (userRole !== 'admin' && userRole !== 'usuario') {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Acceso no autorizado</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Elige con quién deseas chatear</Text>

        {/* Lista de contactos (Solo el chat con el admin si eres usuario y viceversa) */}
        <ScrollView style={styles.contactList}>
          <TouchableOpacity
            key={userRole === 'admin' ? 'Usuario' : 'Administrador'}
            style={styles.contactItem}
            onPress={this.onPressChat}
          >
            {/* Imagen de usuario (icono de FontAwesome dentro de un círculo) */}
            <View style={styles.avatarContainer}>
              <FontAwesome name="user" size={24} color="#fff" />
            </View>

            <Text style={styles.contactName}>
              {userRole === 'admin' ? 'Usuario' : 'Administrador'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const offset = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: offset,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: offset * 2,
    color: '#333',
  },
  contactList: {
    flex: 1,
    width: '100%',
  },
  contactItem: {
    backgroundColor: '#fff',
    padding: offset,
    borderRadius: 8,
    marginBottom: offset,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // For Android shadow
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff', // Fondo azul para el icono
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: offset,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
  },
});

export default Main;
