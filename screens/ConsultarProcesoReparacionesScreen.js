import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import firebase from '../database/firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { db } = firebase;

const ConsultarProcesoReparacionScreen = () => {
  const [procesos, setProcesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null); // Para almacenar la firma seleccionada

  useEffect(() => {
    const fetchProcesos = async () => {
      try {
        const snapshot = await db.collection('proceso_reparacion').get();
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });

        // Ordenar por fecha
        data.sort((a, b) => {
          const dateA = new Date(a.fecha);
          const dateB = new Date(b.fecha);
          return dateB - dateA;
        });

        setProcesos(data);
      } catch (error) {
        console.error('Error al obtener datos de reparación:', error);
        Alert.alert('Error', 'Hubo un problema al cargar los procesos.');
      } finally {
        setLoading(false);
      }
    };

    fetchProcesos();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <Text style={styles.title}>ATENCIÓN A REPORTES CORRECTIVOS</Text>

      {procesos.length === 0 ? (
        <Text style={styles.noData}>No hay registros aún.</Text>
      ) : (
        procesos.map((item) => {
          const fechaFormateada = new Date(item.fecha).toLocaleDateString();

          const horaFormateada = item.hora
            ? new Date(item.hora).toLocaleTimeString()
            : 'No disponible';

          const horaSalidaFormateada = item.hora_salida
            ? new Date(item.hora_salida).toLocaleTimeString()
            : 'No disponible';

          const horaArriboFormateada = item.hora_arribo
            ? new Date(item.hora_arribo).toLocaleTimeString()
            : 'No disponible';

          const fechaTerminacionFormateada = item.fecha_terminacion
            ? new Date(item.fecha_terminacion).toLocaleDateString()
            : 'No disponible';

          const horaTerminacionFormateada = item.hora_terminacion
            ? new Date(item.hora_terminacion).toLocaleTimeString()
            : 'No disponible';

          return (
            <View key={item.id} style={styles.card}>
              <Text style={[styles.label, styles.bold]}>
                Prestador de servicio: COLD SERVICE REFRIGERATION, SA DE C.V.
                (Héctor Espinoza)
              </Text>
              <Text style={styles.label}>
                Plaza: {item.plaza || 'No especificado'}
              </Text>
              <Text style={styles.label}>
                Dirección de Tienda: {item.directienda || 'No especificado'}
              </Text>
              <Text style={styles.label}>
                Tienda: {item.tienda || 'No especificado'}
              </Text>
              <Text style={styles.label}>Fecha: {fechaFormateada}</Text>
              <Text style={styles.label}>
                # Reporte: {item.reporte || 'No especificado'}
              </Text>
              <Text style={styles.label}>
                Ruta: {item.ruta || 'No especificado'}
              </Text>
              <Text style={styles.label}>
                Cuadrilla: {item.cuadrilla || 'No especificado'}
              </Text>
              <Text style={styles.label}>
                Urgencia: {item.urgencia || 'No especificado'}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.label}>
                Hora de Reporte:{' '}
                {new Date(item.hora).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={styles.label}>
                Hora de Salida:{' '}
                {new Date(item.hora_salida).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={styles.label}>
                Hora de Arribo a la Tienda:{' '}
                {new Date(item.hora_arribo).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={styles.label}>
                Fecha de Terminación: {fechaTerminacionFormateada}
              </Text>
              <Text style={styles.label}>
                Hora de Terminación:{' '}
                {new Date(item.hora_terminacion).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.title1}>Reporte de falla</Text>
              <Text style={styles.label}>
                Falla Reportada: {item.falla_reportada || 'No especificado'}
              </Text>
              <Text style={styles.label}>
                Reportada Por: {item.reportada_por || 'No especificado'}
              </Text>
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
                    <Image
                      source={{ uri: item.firma }}
                      style={styles.firmaImage}
                    />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.divider} />
              <Text style={styles.title1}>
                Descripción diagnostico al revisar
              </Text>
              <Text style={styles.label}>
                Descripción Diagnóstico:{' '}
                {item.descripcion_diagnostico || 'No especificado'}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.title1}>Descripción del equipo</Text>
              <Text style={styles.label}>
                Marca: {item.marca || 'No especificado'}
              </Text>
              <Text style={styles.label}>
                Modelo: {item.modelo || 'No especificado'}
              </Text>
              <Text style={styles.label}>
                No. Serie o Marca: {item.no_serie || 'No especificado'}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.title1}>Trabajos efectuados</Text>
              <Text style={styles.label}>
                Trabajos Efectuados:{' '}
                {item.trabajos_efectuados || 'No especificado'}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.title1}>
                Control de carga de gas refrigerante
              </Text>
              <Text style={styles.label}>
                Gas refrigerante utilizado:{' '}
                {item.gas_refrigerante || 'No especificado'}
              </Text>
              <Text style={styles.label}>
                Carga Gas (en gramos): {item.carga_gas || 'No especificado'}
              </Text>
              <Text style={styles.label}>
                Motivo de la carga:{' '}
                {Array.isArray(item.motivo_carga)
                  ? item.motivo_carga.join(', ')
                  : item.motivo_carga || 'No especificado'}
              </Text>

              <View style={styles.divider} />
              <Text style={styles.title1}>Materiales utilizados</Text>
              {item.materiales && item.materiales.length > 0 ? (
                item.materiales.map((material, index) => (
                  <View key={index}>
                    <Text style={styles.label}>
                      Concepto: {material.concepto || 'No especificado'}
                    </Text>
                    <Text style={styles.label}>
                      Cantidad: {material.cantidad || 'No especificado'}
                    </Text>
                    <Text style={styles.label}>
                      Unidad: {material.unidad || 'No especificado'}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.label}>No hay materiales disponibles</Text>
              )}
              <View style={styles.divider} />
              <Text style={styles.label}>
                Trabajos pendientes:{' '}
                {item.trabajo_pendiente || 'Sin trabajos pendientes'}
              </Text>
              <Text style={styles.label}>
                Fecha Programada:{' '}
                {item.fecha_programada
                  ? new Date(
                      item.fecha_programada.toDate(),
                    ).toLocaleDateString()
                  : 'No especificado'}
              </Text>

              <View style={styles.divider} />
              {/* Modal para imagen o firma ampliada */}
              <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                  <Pressable
                    style={styles.modalCloseArea}
                    onPress={() => setModalVisible(false)}
                  />
                  <Image
                    source={{ uri: selectedImage || selectedSignature }}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Icon name="close" size={30} color="#000" />
                  </TouchableOpacity>
                </View>
              </Modal>
              <Text style={styles.label}>
                Comentarios Adicionales:{' '}
                {item.comentarios_adicionales
                  ? item.comentarios_adicionales
                  : 'Sin comentarios adicionales'}
              </Text>

              {/* ESPACIADOR FINAL AÑADIDO */}
              <View style={{ height: 5 }} />
            </View>
          );
        })
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: 'white',
  },
  title1: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 5,
    color: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noData: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  bold: {
    fontWeight: 'bold',
  },
  divider: {
    height: 2,
    backgroundColor: '#007bff',
    marginVertical: 10,
  },
  firmaContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  firmaLabel: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  firmaImage: {
    width: 200,
    height: 100,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  modalCloseArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  fullImage: {
    width: '90%',
    height: '80%',
    borderRadius: 10,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 30,
    right: 30,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
  },
});

export default ConsultarProcesoReparacionScreen;
