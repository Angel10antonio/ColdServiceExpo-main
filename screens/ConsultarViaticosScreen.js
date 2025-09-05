import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import firebaseInstance from '../database/firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const { db, auth } = firebaseInstance;

const ConsultarViaticosScreen = () => {
  const [viaticos, setViaticos] = useState([]);
  const [userRole, setUserRole] = useState('user');
  const [authReady, setAuthReady] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(1);
  const [scrollViewHeight, setScrollViewHeight] = useState(1);
  const [atTop, setAtTop] = useState(true);

  // Modal de rechazo
  const [modalRechazoVisible, setModalRechazoVisible] = useState(false);
  const [razonRechazo, setRazonRechazo] = useState('');
  const [idRechazando, setIdRechazando] = useState(null);

  // 🔐 Detectar rol (solo admin ve botones)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const snap = await getDoc(doc(db, 'users', user.uid));
          const data = snap.exists() ? snap.data() : null;
          setUserRole(data?.role === 'admin' ? 'admin' : 'user');
        } else {
          setUserRole('user');
        }
      } catch (e) {
        console.log('Error obteniendo rol:', e);
        setUserRole('user');
      } finally {
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  const obtenerViaticos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'viaticos'));
      const viaticosData = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setViaticos(viaticosData);
    } catch (error) {
      console.error('Error al obtener los viáticos:', error);
    }
  };

  useEffect(() => {
    obtenerViaticos();
  }, []);

  const handlePressArrow = () => {
    if (!scrollRef.current) return;
    if (atTop) {
      scrollRef.current.scrollToEnd({ animated: true });
    } else {
      scrollRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      setAtTop(value < 50);
    });
    return () => scrollY.removeListener(listener);
  }, []);

  const indicatorHeight =
    (scrollViewHeight * scrollViewHeight) / contentHeight < 30
      ? 30
      : (scrollViewHeight * scrollViewHeight) / contentHeight;

  const translateY = scrollY.interpolate({
    inputRange: [0, Math.max(1, contentHeight - scrollViewHeight)],
    outputRange: [0, scrollViewHeight - indicatorHeight],
    extrapolate: 'clamp',
  });

  // ✅ Aceptar viático (solo admin)
  const aceptarViatico = async (id) => {
    if (userRole !== 'admin') {
      Alert.alert('Permisos', 'Solo un administrador puede realizar esta acción.');
      return;
    }
    try {
      await updateDoc(doc(db, 'viaticos', id), {
        estado: 'aceptado',
        fecha_respuesta: new Date(),
        razonRechazo: null,
      });
      setViaticos((prev) =>
        prev.map((item) => (item.id === id ? { ...item, estado: 'aceptado', razonRechazo: null } : item))
      );
      Alert.alert('Aceptar', '✅ El viático fue aceptado.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo aceptar el viático.');
    }
  };

  // ✅ Rechazar viático (solo admin)
  const handleRechazar = (id) => {
    if (userRole !== 'admin') {
      Alert.alert('Permisos', 'Solo un administrador puede realizar esta acción.');
      return;
    }
    setIdRechazando(id);
    setRazonRechazo('');
    setModalRechazoVisible(true);
  };

  const enviarRechazo = async () => {
    if (razonRechazo.trim() === '') {
      Alert.alert('Error', 'Debes escribir un motivo del rechazo');
      return;
    }
    try {
      await updateDoc(doc(db, 'viaticos', idRechazando), {
        estado: 'rechazado',
        fecha_respuesta: new Date(),
        razonRechazo,
      });
      setViaticos((prev) =>
        prev.map((item) =>
          item.id === idRechazando ? { ...item, estado: 'rechazado', razonRechazo } : item
        )
      );
      setModalRechazoVisible(false);
      Alert.alert('Rechazo', 'El viático fue rechazado correctamente');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo rechazar el viático.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Estado */}
      <View
        style={[
          styles.estadoContainer,
          item.estado === 'aceptado'
            ? styles.estadoAceptado
            : item.estado === 'rechazado'
            ? styles.estadoRechazado
            : styles.estadoPendiente,
        ]}
      >
        <Text style={styles.estadoTexto}>{(item.estado || 'pendiente').toUpperCase()}</Text>
      </View>

      {item.estado === 'rechazado' && item.razonRechazo ? (
        <Text style={styles.razonTexto}>Razón: {item.razonRechazo}</Text>
      ) : null}

      <Text style={styles.titulo}>📝 {item.tipoGasto}</Text>
      <Text style={styles.descripcion}>{item.descripcion}</Text>
      <Text style={styles.meta}>💲 Monto: ${item.monto}</Text>
      <Text style={styles.meta}>📌 Proveedor: {item.proveedor || 'N/A'}</Text>
      <Text style={styles.meta}>
        📅 Fecha: {item.fecha ? new Date(item.fecha).toLocaleDateString('es-MX') : 'N/A'}
      </Text>

      {item.comprobantes && item.comprobantes.length > 0 ? (
        <View style={styles.imagesContainer}>
          {item.comprobantes.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.previewImage} />
          ))}
        </View>
      ) : (
        <Text style={styles.meta}>📷 Sin comprobantes</Text>
      )}

      {/* Botones solo si eres admin */}
      {authReady && userRole === 'admin' && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
          <TouchableOpacity
            style={{ backgroundColor: 'green', padding: 10, borderRadius: 5 }}
            onPress={() => aceptarViatico(item.id)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Aceptar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ backgroundColor: 'red', padding: 10, borderRadius: 5 }}
            onPress={() => handleRechazar(item.id)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={scrollRef}
        data={viaticos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(w, h) => setContentHeight(h)}
        onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      />

      {/* Barra de scroll */}
      <View style={styles.scrollBarContainer}>
        <Animated.View
          style={[styles.scrollBar, { height: indicatorHeight, transform: [{ translateY }] }]}
        />
      </View>

      {/* Botón flotante */}
      <TouchableOpacity style={styles.floatingArrow} onPress={handlePressArrow}>
        <Icon name={atTop ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={36} color="white" />
      </TouchableOpacity>

      {/* Modal Rechazo */}
      <Modal
        visible={modalRechazoVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalRechazoVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalBox}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Motivo del rechazo</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Escribe la razón..."
                  value={razonRechazo}
                  onChangeText={setRazonRechazo}
                  multiline
                  autoFocus
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                  <TouchableOpacity
                    style={{ backgroundColor: 'red', padding: 10, borderRadius: 5, flex: 1, marginRight: 5 }}
                    onPress={enviarRechazo}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Enviar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ backgroundColor: 'gray', padding: 10, borderRadius: 5, flex: 1, marginLeft: 5 }}
                    onPress={() => setModalRechazoVisible(false)}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000080' },
  scrollContainer: { padding: 20 },
  card: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 5, color: '#007bff' },
  descripcion: { fontSize: 16, marginBottom: 5, color: '#333' },
  meta: { fontSize: 14, marginTop: 2, color: '#555' },

  // Estado
  estadoContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  estadoTexto: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  estadoAceptado: { backgroundColor: 'green' },
  estadoRechazado: { backgroundColor: 'red' },
  estadoPendiente: { backgroundColor: 'gray' },
  razonTexto: { fontSize: 16, color: '#333', marginBottom: 10, fontStyle: 'italic' },

  // Barra de scroll
  scrollBarContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
  },
  scrollBar: { width: 6, backgroundColor: '#dbdbd7dc', borderRadius: 3 },

  // Botón flotante
  floatingArrow: {
    position: 'absolute',
    bottom: 60,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: '#007bff',
    borderRadius: 30,
    padding: 8,
    elevation: 5,
  },

  // Imágenes
  imagesContainer: { marginTop: 10, flexDirection: 'row' },
  previewImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#EEE',
  },

  // Modal
  modalBox: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, minHeight: 40, textAlignVertical: 'top' },
});

export default ConsultarViaticosScreen;
