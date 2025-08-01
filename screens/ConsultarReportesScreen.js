import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import firebase from '../database/firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { db } = firebase;

const ConsultarReportesScreen = ({ route }) => {
  const { userRole } = route.params;
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null); // Para almacenar la firma seleccionada

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const querySnapshot = await db.collection('reportes').get();
        const reportesData = [];
        querySnapshot.forEach((doc) => {
          reportesData.push({ id: doc.id, ...doc.data() });
        });

        // Ordenar los reportes por fecha (más reciente primero)
        reportesData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });

        setReportes(reportesData);
      } catch (error) {
        console.error('Error al obtener los reportes:', error);
        Alert.alert('Error', 'Hubo un problema al cargar los reportes.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportes();
  }, []);

  const updateEstado = async (id, nuevoEstado) => {
    if (userRole !== 'admin') {
      Alert.alert('Error', 'No tienes permisos para cambiar el estado.');
      return;
    }

    try {
      await db.collection('reportes').doc(id).update({ estado: nuevoEstado });
      setReportes((prevReportes) =>
        prevReportes.map((reporte) =>
          reporte.id === id ? { ...reporte, estado: nuevoEstado } : reporte,
        ),
      );
      Alert.alert(
        'Éxito',
        'El estado del reporte se ha actualizado correctamente.',
      );
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      Alert.alert('Error', 'Hubo un problema al actualizar el estado.');
    }
  };

  const openImageModal = (imageUri) => {
    setSelectedImage(imageUri);
    setSelectedSignature(null);
    setModalVisible(true);
  };

  const openSignatureModal = (signatureUri) => {
    setSelectedSignature(signatureUri);
    setSelectedImage(null);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reportes Generados</Text>

      {reportes.length === 0 ? (
        <Text style={styles.noReportesText}>No hay reportes registrados.</Text>
      ) : (
        reportes.map((reporte) => (
          <View key={reporte.id} style={styles.reporteContainer}>
            <Text style={styles.label}>
              Cliente: {reporte.clientName || 'Sin nombre'}
            </Text>
            <Text style={styles.label}>
              Descripción: {reporte.serviceDescription || 'Sin descripción'}
            </Text>
            <Text style={styles.label}>
              Fecha: {reporte.date || 'No disponible'}
            </Text>
            <Text style={styles.label}>
              Ubicación: {reporte.location || 'Desconocida'}
            </Text>
            <Text style={styles.label}>
              Sucursal: {reporte.sucursal || 'No especificada'}
            </Text>
            <Text style={styles.label}>
              Pieza: {reporte.piezaName || 'Sin nombre'}
            </Text>
            <Text style={styles.label}>
              Estado: {reporte.estado || 'proceso'}
            </Text>

            {reporte.firma && (
              <View style={styles.firmaContainer}>
                <Text style={styles.firmaLabel}>Firma:</Text>
                <TouchableOpacity
                  onPress={() => openSignatureModal(reporte.firma)}
                >
                  <Image
                    source={{ uri: reporte.firma }}
                    style={styles.firmaImage}
                  />
                </TouchableOpacity>
              </View>
            )}

            {reporte.fotos?.length > 0 && (
              <ScrollView horizontal style={styles.imageContainer}>
                {reporte.fotos.map((foto, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => openImageModal(foto)}
                  >
                    <Image source={{ uri: foto }} style={styles.imagePreview} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {userRole === 'admin' && (
              <TouchableOpacity
                style={styles.estadoButton}
                onPress={() =>
                  updateEstado(
                    reporte.id,
                    reporte.estado === 'proceso' ? 'completado' : 'proceso',
                  )
                }
              >
                <Text style={styles.estadoButtonText}>
                  Cambiar a{' '}
                  {reporte.estado === 'proceso' ? 'completado' : 'proceso'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'Roboto',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noReportesText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
  reporteContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
    fontFamily: 'Roboto',
  },
  firmaContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  firmaLabel: {
    fontSize: 20,
    marginBottom: 5,
    color: '#555',
  },
  firmaImage: {
    width: 200,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  estadoButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  estadoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgb(255, 255, 255)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: { ...StyleSheet.absoluteFillObject },
  fullImage: {
    width: '90%',
    height: '70%',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
    elevation: 5,
  },
});

export default ConsultarReportesScreen;
