import React, { useEffect, useState, useRef } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Image,
  TouchableOpacity,
  Animated,
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

const ConsultarProcesoReparacionScreen = () => {
  const [procesos, setProcesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [userRole, setUserRole] = useState('user'); // Por defecto "user"

  const [userCity, setUserCity] = useState('');     // 🔹 nuevo
const [userStore, setUserStore] = useState('');   // 🔹 nuevo

  const scrollRef = useRef(null);
  const scrollY = useRef({ scrollY: new Animated.Value(0), contentHeight: 0, scrollViewHeight: 0 });
  const [atTop, setAtTop] = useState(true);

  const [modalRechazoVisible, setModalRechazoVisible] = useState(false);
  const [razonRechazo, setRazonRechazo] = useState('');
  const [idRechazando, setIdRechazando] = useState(null);



  // Detectar rol del usuario
 useEffect(() => {
  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const doc = await db.collection('users').doc(currentUser.uid).get();
      if (doc.exists) {
        const data = doc.data();
        setUserRole(data.role || 'user');    // rol
        setUserCity(data.ciudad || '');      // ciudad
        setUserStore(data.tienda || '');     // tienda
      }
    } catch (error) {
      console.error('Error obteniendo datos de usuario:', error);
    }
  };
  fetchUserData();
}, []);


  // 🔹 Solo traer reportes cuando ya tenemos los datos del usuario
useEffect(() => {
  if (!userRole) return; // Si todavía no tenemos rol, no hacemos nada

  const fetchProcesos = async () => {
    try {
      const snapshot = await db.collection('proceso_reparacion').get();
      let data = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));

      data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      // 🔹 Filtrar solo por tienda si es gerente
      if (userRole === 'gerente') {
        data = data.filter(item => item.tienda === userStore);
      }

      setProcesos(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al cargar los procesos.');
    } finally {
      setLoading(false);
    }
  };

  fetchProcesos();
}, [userRole, userStore]); // Dependencias



  // Listener scroll
  useEffect(() => {
    const listener = scrollY.current.scrollY.addListener(({ value }) => {
      setAtTop(value < 50);
    });
    return () => scrollY.current.scrollY.removeListener(listener);
  }, []);

  const handlePressArrow = () => {
    const { scrollY: _scrollY, contentHeight, scrollViewHeight } = scrollY.current;
    if (!scrollRef.current) return;

    if (atTop) {
      scrollRef.current.scrollTo({ y: contentHeight - scrollViewHeight, animated: true });
    } else {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  

  const aceptarReporte = async (id) => {
  try {
    await db.collection('proceso_reparacion').doc(id).update({
      estado: 'aceptado',
      fecha_respuesta: new Date()
    });
    Alert.alert('Aceptar', '✅ El reporte fue aceptado.');
    // Refrescar el estado en pantalla
    setProcesos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estado: 'aceptado' } : item
      )
    );
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'No se pudo aceptar el reporte.');
  }
};

const rechazarReporte = async (id) => {
  try {
    await db.collection('proceso_reparacion').doc(id).update({
      estado: 'rechazado',
      fecha_respuesta: new Date()
    });
    Alert.alert('Rechazar', '❌ El reporte fue rechazado.');
    // Refrescar el estado en pantalla
    setProcesos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estado: 'rechazado' } : item
      )
    );
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'No se pudo rechazar el reporte.');
  }
};

// Función al presionar Rechazar
const handleRechazar = (id) => {
  setIdRechazando(id);
  setRazonRechazo('');
  setModalRechazoVisible(true); // Abrir modal para escribir la razón
};

// Función para enviar rechazo
const enviarRechazo = async () => {
  if (razonRechazo.trim() === '') {
    Alert.alert('Error', 'Debes escribir un motivo del rechazo');
    return;
  }

  try {
    await db.collection('proceso_reparacion').doc(idRechazando).update({
      estado: 'rechazado',
      fecha_respuesta: new Date(),
      razon_rechazo: razonRechazo,
    });

    setProcesos((prev) =>
      prev.map((item) =>
        item.id === idRechazando
          ? { ...item, estado: 'rechazado', razon_rechazo: razonRechazo }
          : item
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomScrollView ref={scrollRef} scrollYRef={scrollY}>
        <Text style={styles.title}>ATENCIÓN A REPORTES CORRECTIVOS</Text>

        {procesos.length === 0 ? (
          <Text style={styles.noData}>No hay registros aún.</Text>
        ) : (
          procesos.map((item) => {
            const fechaFormateada = new Date(item.fecha).toLocaleDateString();
            const fechaTerminacionFormateada = item.fecha_terminacion
              ? new Date(item.fecha_terminacion).toLocaleDateString()
              : 'No disponible';

            return (
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

              {/* Mostrar razón solo si está rechazado */}
              {item.estado === 'rechazado' && item.razon_rechazo ? (
                <Text style={styles.razonTexto}>Razónnnn: {item.razon_rechazo}</Text>
              ) : null}

              <View style={styles.divider} />

                {/* TODOS TUS CAMPOS MANTENIDOS */}
                <Text style={[styles.label, styles.bold]}>
                  Prestador de servicio: COLD SERVICE REFRIGERATION, SA DE C.V. (Héctor Espinoza)
                </Text>
               
                <Text style={styles.label}>Plaza: {item.plaza || 'No especificado'}</Text>
                <Text style={styles.label}>Dirección de Tienda: {item.directienda || 'No especificado'}</Text>
                <Text style={styles.label}>Tienda: {item.tienda || 'No especificado'}</Text>
                <Text style={styles.label}>Fecha: {fechaFormateada}</Text>
                <Text style={styles.label}># Reporte: {item.reporte || 'No especificado'}</Text>
                <Text style={styles.label}>Ruta: {item.ruta || 'No especificado'}</Text>
                <Text style={styles.label}>Cuadrilla: {item.cuadrilla || 'No especificado'}</Text>
                <Text style={styles.label}>Urgencia: {item.urgencia || 'No especificado'}</Text>

                <View style={styles.divider} />

                <Text style={styles.label}>
                  Hora de Reporte: {item.hora ? new Date(item.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No disponible'}
                </Text>
                <Text style={styles.label}>
                  Hora de Salida: {item.hora_salida ? new Date(item.hora_salida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No disponible'}
                </Text>
                <Text style={styles.label}>
                  Hora de Arribo a la Tienda: {item.hora_arribo ? new Date(item.hora_arribo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No disponible'}
                </Text>
                <Text style={styles.label}>Fecha de Terminación: {fechaTerminacionFormateada}</Text>
                <Text style={styles.label}>
                  Hora de Terminación: {item.hora_terminacion ? new Date(item.hora_terminacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No disponible'}
                </Text>

                <View style={styles.divider} />
                <Text style={styles.title1}>Reporte de falla</Text>
                <Text style={styles.label}>Falla Reportada: {item.falla_reportada || 'No especificado'}</Text>
                <Text style={styles.label}>Reportada Por: {item.reportada_por || 'No especificado'}</Text>
                {item.firma && (
                  <View style={styles.firmaContainer}>
                    <Text style={styles.firmaLabel}>Firma:</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedSignature(item.firma);
                        setSelectedImage(null);
                        setModalVisible(true);
                      }}
                    >
                      <Image source={{ uri: item.firma }} style={styles.firmaImage} />
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.divider} />
                <Text style={styles.title1}>Descripción diagnostico al revisar</Text>
                <Text style={styles.label}>Descripción Diagnóstico: {item.descripcion_diagnostico || 'No especificado'}</Text>

                <View style={styles.divider} />
                <Text style={styles.title1}>Descripción del equipo</Text>
                <Text style={styles.label}>Marca: {item.marca || 'No especificado'}</Text>
                <Text style={styles.label}>Modelo: {item.modelo || 'No especificado'}</Text>
                <Text style={styles.label}>No. Serie o Marca: {item.no_serie || 'No especificado'}</Text>

                <View style={styles.divider} />
                <Text style={styles.title1}>Trabajos efectuados</Text>
                <Text style={styles.label}>Trabajos Efectuados: {item.trabajos_efectuados || 'No especificado'}</Text>

                <View style={styles.divider} />
                <Text style={styles.title1}>Control de carga de gas refrigerante</Text>
                <Text style={styles.label}>Gas refrigerante utilizado: {item.gas_refrigerante || 'No especificado'}</Text>
                <Text style={styles.label}>Carga Gas (en gramos): {item.carga_gas || 'No especificado'}</Text>
                <Text style={styles.label}>
                  Motivo de la carga: {Array.isArray(item.motivo_carga) ? item.motivo_carga.join(', ') : item.motivo_carga || 'No especificado'}
                </Text>

                <View style={styles.divider} />
                <Text style={styles.title1}>Materiales utilizados</Text>
                {item.materiales && item.materiales.length > 0 ? (
                  item.materiales.map((material, index) => (
                    <View key={index}>
                      <Text style={styles.label}>Concepto: {material.concepto || 'No especificado'}</Text>
                      <Text style={styles.label}>Cantidad: {material.cantidad || 'No especificado'}</Text>
                      <Text style={styles.label}>Unidad: {material.unidad || 'No especificado'}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.label}>No hay materiales disponibles</Text>
                )}

                <View style={styles.divider} />
                <Text style={styles.label}>Trabajos pendientes: {item.trabajo_pendiente || 'Sin trabajos pendientes'}</Text>
                <Text style={styles.label}>
                  Fecha Programada: {item.fecha_programada ? new Date(item.fecha_programada.toDate()).toLocaleDateString() : 'No especificado'}
                </Text>

                <View style={{ height: 5 }} />

                {/* Modal para imagen o firma ampliada */}
                <Modal visible={modalVisible} transparent animationType="fade">
                  <View style={styles.modalContainer}>
                    <Pressable style={styles.modalCloseArea} onPress={() => setModalVisible(false)} />
                    <Image source={{ uri: selectedImage || selectedSignature }} style={styles.fullImage} resizeMode="contain" />
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                      <Icon name="close" size={30} color="#000" />
                    </TouchableOpacity>
                  </View>
                </Modal>

                <Text style={styles.label}>
                  Comentarios Adicionales: {item.comentarios_adicionales || 'Sin comentarios adicionales'}
                </Text>

                 {/* Botones solo para admin */}
                {userRole === 'admin' && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                    <TouchableOpacity
                      style={{ backgroundColor: 'green', padding: 10, borderRadius: 5 }}
                      onPress={() => aceptarReporte(item.id)}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Aceptar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ backgroundColor: 'red', padding: 10, borderRadius: 5 }}
                      onPress={() => handleRechazar(item.id)} // Abrimos el modal para escribir la razón
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
{/* Modal para escribir motivo de rechazo */}
      <Modal
        visible={modalRechazoVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalRechazoVisible(false)}
      >
        {/* Fondo semitransparente que cubre toda la pantalla */}
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)', // 🔹 Esto difumina todo lo de abajo
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%', alignItems: 'center' }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalBox}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                  Motivo del rechazo
                </Text>

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
            </CustomScrollView>
            <TouchableOpacity style={styles.floatingArrow} onPress={handlePressArrow}>
              <Icon name={atTop ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={36} color="white" />
            </TouchableOpacity>
          </View>
        );
      };

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#000080' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20, 
    color: 'white' 
  },
  title1: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'left', 
    marginBottom: 5, 
    color: 'black' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center' 
  },
  noData: { 
    fontSize: 16, 
    textAlign: 'center', 
    color: '#666' 
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 15, 
    marginBottom: 15, 
    elevation: 3 
  },
  label: { 
    fontSize: 16, 
    marginBottom: 5, 
    color: '#555' 
  },
  bold: { 
    fontWeight: 'bold' 
  },
  divider: { 
    height: 2, 
    backgroundColor: '#007bff',
    marginVertical: 10 
    },
  firmaContainer: { 
    marginTop: 10, 
    alignItems: 'center' 
  },
  firmaLabel: { 
    fontSize: 18, 
    color: '#333', 
    marginBottom: 10 
  },
  firmaImage: { 
    width: 200, 
    height: 100, 
    borderRadius: 10 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.7)' 
  },
  modalCloseArea: { 
    position: 'absolute', 
    top: 0, 
    bottom: 0, 
    left: 0, 
    right: 0 
  },
  fullImage: { 
    width: '90%', 
    height: '80%', 
    borderRadius: 10 
  },
  modalCloseButton: { 
    position: 'absolute', 
    top: 30, 
    right: 30, 
    backgroundColor: 'white',
    padding: 10,
     borderRadius: 30 
    },
  scrollBarContainer: { 
    position: 'absolute', 
    right: -16,
    top: -2, 
    bottom: 0, 
    width: 6, 
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3 
    },
  scrollBar: { 
    width: 6, 
    backgroundColor: '#dbdbd7dc', 
    borderRadius: 3 
  },
  floatingArrow: { 
    position: 'absolute',
     bottom: 60, 
     left: '57%', 
     transform: [{ translateX: -30 }],
     backgroundColor: '#007bff',
     borderRadius: 30,
     padding: 8,
     elevation: 5 },
  estadoContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start', // para que no ocupe todo el ancho
    marginBottom: 10,
    width: '100%', // 🔹 ocupa todo el ancho disponible
    alignItems: 'center', // centra el texto
  },
  estadoTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  estadoAceptado: {
    backgroundColor: 'green',
  },
  estadoRechazado: {
    backgroundColor: 'red',
  },
  estadoPendiente: {
    backgroundColor: 'gray',
  },
  razonTexto: { 
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontStyle: 'italic' 
  },
  modalBox: { 
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%' 
  },
  modalInput: { 
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    minHeight: 40 
  },
});

export default ConsultarProcesoReparacionScreen;
