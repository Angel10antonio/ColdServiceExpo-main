import React, { useState, useEffect } from 'react';
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
  Platform,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import NetInfo from '@react-native-community/netinfo';
import firebaseInstance from '../database/firebase';
import { collection, addDoc } from 'firebase/firestore';

const db = firebaseInstance.db;
const { width } = Dimensions.get('window');

const RegistroViaticosScreen = ({ navigation, route }) => {
  const [form, setForm] = useState({
    tipoGasto: '',
    descripcion: '',
    monto: '',
    proveedor: '',
  });
  const [fecha, setFecha] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [comprobantes, setComprobantes] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  const tiposGasto = [
    { id: 'caseta', nombre: 'Caseta 🛣️' },
    { id: 'comida', nombre: 'Comida 🍴' },
    { id: 'hotel', nombre: 'Hotel 🏨' },
    { id: 'combustible', nombre: 'Combustible ⛽' },
    { id: 'otros', nombre: 'Otros ✨' },
  ];

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectImages = async () => {
    if (!isConnected) {
      Alert.alert('Sin conexión', 'Conéctate a internet para continuar');
      return;
    }
    if (comprobantes.length >= 5) {
      Alert.alert('Límite', 'No puedes agregar más de 5 fotos.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Se necesita permiso para acceder a la galería',
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newImage = {
        uri: asset.uri,
        name: asset.fileName || `comprobante_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
      };
      setComprobantes((prev) => [...prev, newImage]);
    }
  };

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fecha;
    setShowDatePicker(Platform.OS === 'ios');
    setFecha(currentDate);
  };

  const saveViatico = async () => {
    if (!form.tipoGasto || !form.monto || !form.descripcion) {
      Alert.alert('Campos requeridos', 'Completa los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      const newEntry = {
        ...form,
        monto: parseFloat(form.monto),
        fecha: fecha.toISOString(),
        comprobantes: comprobantes.map((c) => c.uri), // aquí solo se guardan las URIs
        estado: 'pendiente',
        usuario: 'usuario_demo', // aquí puedes poner firebase.auth().currentUser?.email o uid
        usuarioId: 'uid_demo',
        empresa: route.params?.company || 'Cold Service',
        createdAt: new Date().toISOString(),
      };

      // Guardar en Firestore en la colección "viaticos"
      await addDoc(collection(db, 'viaticos'), newEntry);

      console.log('📤 Viático enviado:', newEntry);
      Alert.alert('Éxito', 'Viático registrado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            setForm({
              tipoGasto: '',
              descripcion: '',
              monto: '',
              proveedor: '',
            });
            setComprobantes([]);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Error al guardar viático:', error);
      Alert.alert('Error', 'Hubo un problema al guardar el viático.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>REGISTRO DE VIÁTICOS</Text>

      <Text style={styles.label}>Tipo de Gasto *</Text>
      <View style={styles.radioGroup}>
        {tiposGasto.map((tipo) => (
          <TouchableOpacity
            key={tipo.id}
            style={[
              styles.radioButton,
              form.tipoGasto === tipo.id && styles.radioButtonSelected,
            ]}
            onPress={() => handleChange('tipoGasto', tipo.id)}
          >
            <Text
              style={[
                styles.radioButtonText,
                form.tipoGasto === tipo.id && styles.radioButtonTextSelected,
              ]}
            >
              {tipo.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Descripción *</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Detalle del gasto..."
        placeholderTextColor="#95A5A6"
        value={form.descripcion}
        onChangeText={(text) => handleChange('descripcion', text)}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Monto ($) *</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor="#95A5A6"
        keyboardType="numeric"
        value={form.monto}
        onChangeText={(text) => handleChange('monto', text)}
      />

      <Text style={styles.label}>Proveedor</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del proveedor"
        placeholderTextColor="#95A5A6"
        value={form.proveedor}
        onChangeText={(text) => handleChange('proveedor', text)}
      />

      <Text style={styles.label}>Fecha</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateButtonText}>📅 {fecha.toLocaleDateString('es-MX')}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={fecha}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Comprobantes</Text>
      <TouchableOpacity
        style={[styles.scanButton, comprobantes.length >= 5 && styles.disabledButton]}
        onPress={handleSelectImages}
        disabled={comprobantes.length >= 5}
      >
        <Text style={styles.scanButtonText}>
          {comprobantes.length >= 5 ? 'LÍMITE 5 FOTOS' : '📸 AGREGAR FOTOS'}
        </Text>
      </TouchableOpacity>

      {comprobantes.length > 0 ? (
        <ScrollView horizontal style={styles.imagesContainer}>
          {comprobantes.map((comp, index) => (
            <View key={index} style={styles.imageCard}>
              <Image source={{ uri: comp.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.deleteImageButton}
                onPress={() => setComprobantes(comprobantes.filter((_, i) => i !== index))}
              >
                <Text style={{ fontSize: 18, color: '#E74C3C' }}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyImagesContainer}>
          <Text style={{ fontSize: 40 }}>📷</Text>
          <Text style={styles.emptyImagesText}>No hay fotos agregadas</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.saveButton, (loading || !isConnected) && styles.disabledButton]}
        onPress={saveViatico}
        disabled={loading || !isConnected}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.saveButtonText}>
            {isConnected ? '💾 GUARDAR VIÁTICO' : '📵 SIN CONEXIÓN'}
          </Text>
        )}
      </TouchableOpacity>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    fontSize: 16,
  },
  scanButton: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#95A5A6',
  },
  imagesContainer: {
    marginTop: 10,
    maxHeight: 160,
  },
  imageCard: {
    position: 'relative',
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: 140,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#EEE',
  },
  deleteImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImagesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F8F9F9',
    borderStyle: 'dashed',
  },
  emptyImagesText: {
    marginTop: 10,
    color: '#95A5A6',
    fontSize: 14,
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
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  radioButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007bff',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    backgroundColor: '#007bff',
  },
  radioButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  radioButtonTextSelected: {
    color: '#fff',
  },
});

export default RegistroViaticosScreen;
