import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Signature from 'react-native-signature-canvas';
import firebase from '../database/firebase';

const { db, firebase: firebaseInstance } = firebase;

const ReportesScreen = ({ navigation }) => {
  const [clientName, setClientName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [sucursal, setSucursal] = useState('');
  const [piezaName, setPiezaName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [images, setImages] = useState([]);
  const [signature, setSignature] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false); // Para controlar el modal de firma

  const estado = 'completado';

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Se requiere permiso para acceder a la cámara.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Se requiere permiso para acceder a la galería.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    Alert.alert(
      'Eliminar imagen',
      '¿Estás seguro de que deseas eliminar esta imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: () => {
            const updatedImages = [...images];
            updatedImages.splice(index, 1);
            setImages(updatedImages);
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleSignature = (sig) => {
    if (sig) {
      setSignature(sig); // Guardamos la firma
      setShowSignatureModal(false); // Cerramos el modal de firma
    }
  };

  const saveReport = async () => {
    if (
      !clientName ||
      !serviceDescription ||
      !date ||
      !location ||
      !sucursal ||
      !piezaName
    ) {
      Alert.alert('Error', 'Completa todos los campos.');
      return;
    }

    if (!signature) {
      Alert.alert(
        'Falta la firma',
        'Por favor, añade una firma antes de guardar.',
      );
      return;
    }

    setLoading(true);
    try {
      await db.collection('reportes').add({
        clientName,
        serviceDescription,
        date: date.toISOString().split('T')[0],
        location,
        sucursal,
        piezaName,
        estado,
        fotos: images,
        firma: signature,
        createdAt: firebaseInstance.firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Éxito', 'El reporte se ha guardado correctamente.');
      setClientName('');
      setServiceDescription('');
      setDate(new Date());
      setLocation('');
      setPiezaName('');
      setSucursal('');
      setImages([]);
      setSignature(null);
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar el reporte:', error);
      Alert.alert('Error', 'Hubo un problema al guardar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reporte de Servicio</Text>

      <Text style={styles.label}>Nombre del Cliente</Text>
      <TextInput
        style={styles.input}
        value={clientName}
        onChangeText={setClientName}
        placeholder="Ingresa el nombre"
      />

      <Text style={styles.label}>Descripción del Servicio</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={serviceDescription}
        onChangeText={setServiceDescription}
        placeholder="Describe el servicio"
        multiline
      />

      <Text style={styles.label}>Nombre de la Pieza/s</Text>
      <TextInput
        style={styles.input}
        value={piezaName}
        onChangeText={setPiezaName}
        placeholder="Ingresa el nombre de la pieza"
      />

      <Text style={styles.label}>Fecha</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Icon name="event" size={20} color="#fff" />
        <Text style={styles.dateButtonText}>Seleccionar Fecha</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(e, selectedDate) => {
            setShowDatePicker(false);
            setDate(selectedDate || date);
          }}
        />
      )}
      <Text style={styles.selectedDateText}>
        Fecha seleccionada: {date.toLocaleDateString()}
      </Text>

      <Text style={styles.label}>Ubicación</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Ingresa la ubicación"
      />

      <Text style={styles.label}>Sucursal</Text>
      <TextInput
        style={styles.input}
        value={sucursal}
        onChangeText={setSucursal}
        placeholder="Ingresa el nombre de la Sucursal"
      />

      <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
        <Icon name="camera-alt" size={20} color="#fff" />
        <Text style={styles.photoButtonText}>Tomar Foto</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
        <Icon name="photo-library" size={20} color="#fff" />
        <Text style={styles.photoButtonText}>Seleccionar Foto</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <ScrollView horizontal style={styles.imageContainer}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: img }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Icon name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Mostrar la firma en el formulario */}
      {signature && (
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={styles.label}>Firma</Text>
          <Image
            source={{ uri: signature }}
            style={{
              width: 350,
              height: 220,
              borderWidth: 1,
              borderColor: '#ccc',
            }}
          />
        </View>
      )}

      {/* Botón para abrir el modal de firma */}
      <TouchableOpacity
        style={[styles.photoButton, { backgroundColor: '#6f42c1' }]}
        onPress={() => setShowSignatureModal(true)}
      >
        <Icon name="edit" size={20} color="#fff" />
        <Text style={styles.photoButtonText}>Firmar</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={saveReport}>
          <Text style={styles.saveButtonText}>Guardar Reporte</Text>
        </TouchableOpacity>
      )}

      {/* Modal de Firma */}
      <Modal visible={showSignatureModal} animationType="slide">
        <View style={{ flex: 1 }}>
          <Signature
            onOK={handleSignature}
            onEmpty={() => Alert.alert('Firma vacía')}
            onClear={() => console.log('clear')}
            onEnd={() => console.log('end')}
            descriptionText="Firma aquí"
            clearText="Limpiar"
            confirmText="Guardar"
            // Elimina webStyle si no es necesario o ajústalo
            webStyle={`
        .m-signature-pad--footer { 
          display: flex;
          justify-content: space-between;
          padding: 10px;
        }
        .m-signature-pad--footer button {
          background-color: #007bff;
          color: #fff;
          padding: 10px;
          border: none;
          border-radius: 5px;
        }
      `}
          />
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: '#dc3545', marginTop: 1 },
            ]}
            onPress={() => setShowSignatureModal(false)}
          >
            <Text style={styles.saveButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  dateButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  selectedDateText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    justifyContent: 'center',
  },
  photoButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#dc3545',
    borderRadius: 15,
    padding: 5,
  },
  saveButton: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReportesScreen;
