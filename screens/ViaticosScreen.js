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
  ImageBackground,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import firebaseInstance from '../database/firebase';

const db = firebaseInstance.db;
const storage = firebaseInstance.storage;
const firebase = firebaseInstance.firebase;
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
  const [currentUser] = useState(firebase.auth().currentUser);
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

  // Migrado a expo-image-picker y permisos compatibles
  const handleSelectImages = async () => {
    if (!isConnected) {
      Alert.alert('Sin conexión', 'Conéctate a internet para continuar');
      return;
    }
    if (comprobantes.length >= 5) {
      Alert.alert('Límite', 'No puedes agregar más de 5 fotos.');
      return;
    }

    // Pide permisos si no los tiene
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

  // Ya no hay guardado local en disco; solo simulado
  const uploadComprobantes = async () => {
    // Aquí iría el código de subida a la nube si decides hacerlo en futuro
    return comprobantes.map((comp) => comp.uri); // solo URIs de imagen
  };

  const saveViatico = async () => {
    if (!form.tipoGasto || !form.monto || !form.descripcion) {
      Alert.alert('Campos requeridos', 'Completa los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      const localImagePaths =
        comprobantes.length > 0 ? await uploadComprobantes() : [];

      const newEntry = {
        ...form,
        monto: parseFloat(form.monto),
        fecha: fecha.toISOString(),
        comprobantes: localImagePaths,
        estado: 'pendiente',
        usuario: 'usuario_demo',
        usuarioId: 'uid_demo',
        empresa: route.params?.company || 'Cold Service',
        createdAt: new Date().toISOString(),
      };

      console.log('Viático guardado localmente:', newEntry);

      Alert.alert('Éxito', 'Viático registrado localmente', [
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
      Alert.alert('Error', error.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/favicon4.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(5, 25, 55, 0.85)', 'rgba(0, 78, 146, 0.9)']}
        style={styles.gradientOverlay}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>REGISTRO DE VIÁTICOS</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tipo de Gasto *</Text>
                <View style={styles.radioGroup}>
                  {tiposGasto.map((tipo) => (
                    <TouchableOpacity
                      key={tipo.id}
                      style={[
                        styles.radioButton,
                        form.tipoGasto === tipo.id &&
                          styles.radioButtonSelected,
                      ]}
                      onPress={() => handleChange('tipoGasto', tipo.id)}
                    >
                      <Text
                        style={[
                          styles.radioButtonText,
                          form.tipoGasto === tipo.id &&
                            styles.radioButtonTextSelected,
                        ]}
                      >
                        {tipo.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Descripción *</Text>
                <TextInput
                  style={[styles.inputField, styles.multilineInput]}
                  placeholder="Detalle del gasto..."
                  placeholderTextColor="#95A5A6"
                  value={form.descripcion}
                  onChangeText={(text) => handleChange('descripcion', text)}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Monto ($) *</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="0.00"
                  placeholderTextColor="#95A5A6"
                  keyboardType="numeric"
                  value={form.monto}
                  onChangeText={(text) => handleChange('monto', text)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Proveedor</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Nombre del proveedor"
                  placeholderTextColor="#95A5A6"
                  value={form.proveedor}
                  onChangeText={(text) => handleChange('proveedor', text)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Fecha</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ fontSize: 20, marginRight: 10 }}>📅</Text>
                  <Text style={styles.dateText}>
                    {fecha.toLocaleDateString('es-MX')}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={fecha}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>COMPROBANTES</Text>

              <TouchableOpacity
                style={[
                  styles.scanButton,
                  comprobantes.length >= 5 && styles.disabledButton,
                ]}
                onPress={handleSelectImages}
                disabled={comprobantes.length >= 5}
              >
                <Text style={styles.scanButtonText}>
                  {comprobantes.length >= 5
                    ? 'LÍMITE 5 FOTOS'
                    : '📸 AGREGAR FOTOS'}
                </Text>
              </TouchableOpacity>

              {comprobantes.length > 0 ? (
                <ScrollView horizontal style={styles.imagesContainer}>
                  {comprobantes.map((comp, index) => (
                    <View key={index} style={styles.imageCard}>
                      <Image
                        source={{ uri: comp.uri }}
                        style={styles.previewImage}
                      />
                      <TouchableOpacity
                        style={styles.deleteImageButton}
                        onPress={() =>
                          setComprobantes(
                            comprobantes.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <Text style={{ fontSize: 18, color: '#E74C3C' }}>
                          ❌
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyImagesContainer}>
                  <Text style={{ fontSize: 40 }}>📷</Text>
                  <Text style={styles.emptyImagesText}>
                    No hay fotos agregadas
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (loading || !isConnected) && styles.disabledButton,
            ]}
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
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  gradientOverlay: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 8,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#FBFCFC',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  radioButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3498DB',
    marginBottom: 10,
    backgroundColor: '#FFF',
    minWidth: width * 0.28,
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#3498DB',
  },
  radioButtonText: {
    color: '#3498DB',
    fontSize: 14,
    fontWeight: '500',
  },
  radioButtonTextSelected: {
    color: '#FFF',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#FBFCFC',
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  scanButton: {
    backgroundColor: '#27AE60',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  scanButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
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
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#95A5A6',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RegistroViaticosScreen;
