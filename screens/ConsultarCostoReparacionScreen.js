import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import firebase from '../database/firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { db, auth } = firebase;

// 📌 Componente Scroll con barra personalizada
const CustomScrollView = React.forwardRef(({ children, scrollYRef }, ref) => {
  const [contentHeight, setContentHeight] = useState(1);
  const [scrollViewHeight, setScrollViewHeight] = useState(1);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scrollYRef) {
      scrollYRef.current = { scrollY, contentHeight, scrollViewHeight };
    }
  }, [scrollY, contentHeight, scrollViewHeight]);

  const indicatorHeight =
    (scrollViewHeight * scrollViewHeight) / contentHeight < 30
      ? 30
      : (scrollViewHeight * scrollViewHeight) / contentHeight;

  const translateY = scrollY.interpolate({
    inputRange: [0, Math.max(1, contentHeight - scrollViewHeight)],
    outputRange: [0, scrollViewHeight - indicatorHeight],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        ref={ref}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(w, h) => setContentHeight(h)}
        onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {children}
      </Animated.ScrollView>

      <View style={styles.scrollBarContainer}>
        <Animated.View
          style={[styles.scrollBar, { height: indicatorHeight, transform: [{ translateY }] }]}
        />
      </View>
    </View>
  );
});

const ConsultarCostoReparacionScreen = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');

  const [modalRechazoVisible, setModalRechazoVisible] = useState(false);
  const [razonRechazo, setRazonRechazo] = useState('');
  const [idRechazando, setIdRechazando] = useState(null);

  const scrollRef = useRef(null);
  const scrollY = useRef({ scrollY: new Animated.Value(0), contentHeight: 0, scrollViewHeight: 0 });
  const [atTop, setAtTop] = useState(true);

  // Detectar rol del usuario
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const doc = await db.collection('users').doc(currentUser.uid).get();
        if (doc.exists) {
          const data = doc.data();
          if (data.role === 'admin') setUserRole('admin');
        }
      } catch (error) {
        console.error('Error obteniendo rol de usuario:', error);
      }
    };
    fetchUserRole();
  }, []);

  // Cargar reportes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await db.collection('costo_reparaciones').orderBy('createdAt', 'desc').get();
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setReportes(data);
      } catch (e) {
        console.error('Error al obtener los reportes:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Observamos scroll para cambiar dirección de la flecha
  useEffect(() => {
    const listener = scrollY.current.scrollY.addListener(({ value }) => {
      setAtTop(value < 50);
    });
    return () => scrollY.current.scrollY.removeListener(listener);
  }, []);

  const handlePressArrow = () => {
    const { contentHeight, scrollViewHeight } = scrollY.current;
    if (!scrollRef.current) return;

    if (atTop) {
      scrollRef.current.scrollTo({ y: contentHeight - scrollViewHeight, animated: true });
    } else {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Funciones para aceptar/rechazar
  const aceptarReporte = async (id) => {
    try {
      await db.collection('costo_reparaciones').doc(id).update({ estado: 'aceptado', fecha_respuesta: new Date() });
      setReportes((prev) => prev.map((item) => (item.id === id ? { ...item, estado: 'aceptado' } : item)));
      Alert.alert('Aceptar', '✅ El reporte fue aceptado.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo aceptar el reporte.');
    }
  };

  const handleRechazar = (id) => {
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
      await db.collection('costo_reparaciones').doc(idRechazando).update({
        estado: 'rechazado',
        fecha_respuesta: new Date(),
        razon_rechazo: razonRechazo,
      });
      setReportes((prev) =>
        prev.map((item) =>
          item.id === idRechazando ? { ...item, estado: 'rechazado', razon_rechazo: razonRechazo } : item
        )
      );
      setModalRechazoVisible(false);
      Alert.alert('Reporte rechazado', 'El reporte fue rechazado correctamente');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo rechazar el reporte');
    }
  };

  if (loading) {
    return <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>Cargando...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportes de Costos de Reparación</Text>

      <CustomScrollView ref={scrollRef} scrollYRef={scrollY}>
        {reportes.length === 0 ? (
          <Text style={styles.empty}>No hay reportes disponibles.</Text>
        ) : (
          reportes.map((item) => (
            <View key={item.id} style={styles.card}>
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
                <Text style={styles.estadoTexto}>
                  {item.estado ? item.estado.toUpperCase() : 'PENDIENTE'}
                </Text>
              </View>

              {item.estado === 'rechazado' && item.razon_rechazo && (
                <Text style={styles.razonTexto}>Razón: {item.razon_rechazo}</Text>
              )}

              <Text style={styles.id}>ID: {item.id}</Text>
              <Text style={styles.total}>Total Reparación: ${item.totalReparacion?.toFixed(2)}</Text>

              <Text style={styles.subTitle}>Elementos:</Text>
              {item.elementos.map((el) => (
                <View key={el.id} style={styles.elemento}>
                  <Text style={styles.elementoNombre}>{el.nombre} - {el.fecha}</Text>
                  {el.subElementos.map((sub) => (
                    <Text key={sub.id} style={styles.subelemento}>- {sub.nombre} (${sub.precio.toFixed(2)})</Text>
                  ))}
                </View>
              ))}

              {userRole === 'admin' && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                  <TouchableOpacity
                    style={{ backgroundColor: 'green', padding: 10, borderRadius: 5 }}
                    onPress={() => aceptarReporte(item.id)}
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
          ))
        )}
      </CustomScrollView>

      {/* Modal para escribir motivo de rechazo */}
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
                  blurOnSubmit={false}
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
      
      {/* Botón flotante */}
      <TouchableOpacity style={styles.floatingArrow} onPress={handlePressArrow}>
        <Icon name={atTop ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={36} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#000080' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: 'white' },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#f9f9f9' },
  id: { fontWeight: 'bold', marginBottom: 5 },
  total: { fontWeight: 'bold', marginBottom: 5, color: '#2e7d32' },
  subTitle: { marginTop: 8, fontStyle: 'italic', color: '#333' },
  elemento: { marginTop: 4, paddingLeft: 8 },
  elementoNombre: { fontWeight: '600' },
  subelemento: { fontSize: 13, color: '#444', paddingLeft: 10 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },

  scrollBarContainer: { position: 'absolute', right: -16, top: -2, bottom: 0, width: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 },
  scrollBar: { width: 6, backgroundColor: '#dbdbd7dc', borderRadius: 3 },

  floatingArrow: { position: 'absolute', bottom: 60, left: '56%', transform: [{ translateX: -30 }], backgroundColor: '#007bff', borderRadius: 30, padding: 8, elevation: 5 },

  estadoContainer: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10, width: '100%', alignItems: 'center' },
  estadoTexto: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  estadoAceptado: { backgroundColor: 'green' },
  estadoRechazado: { backgroundColor: 'red' },
  estadoPendiente: { backgroundColor: 'gray' },
  razonTexto: { fontSize: 16, color: '#333', marginBottom: 10, fontStyle: 'italic' },

  modalBox: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, minHeight: 40 },
});

export default ConsultarCostoReparacionScreen;
