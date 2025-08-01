import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import firebase from '../database/firebase';
import { collection, addDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

const { db } = firebase;

const ReportarErrorScreen = () => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [usuario, setUsuario] = useState('');
  const [pantalla, setPantalla] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!titulo || !descripcion || !usuario || !pantalla || !fecha) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    const reporte = {
      titulo,
      descripcion,
      usuario,
      pantalla,
      fecha: fecha.toISOString(),
    };

    try {
      const docRef = await addDoc(
        collection(db, 'reporte_de_errores'),
        reporte,
      );
      console.log('📤 Reporte enviado:', reporte);
      Alert.alert('Éxito', 'Reporte enviado correctamente');
      setTitulo('');
      setDescripcion('');
      setUsuario('');
      setPantalla('');
      setFecha(new Date()); // Reset the date picker
    } catch (error) {
      console.error('Error al enviar el reporte:', error);
      Alert.alert('Error', 'Hubo un problema al enviar el reporte.');
    }
  };

  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Captura de Reporte de Error</Text>

        <Text style={styles.label}>Título de Error</Text>
        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />

        <Text style={styles.label}>Usuario</Text>
        <TextInput
          style={styles.input}
          value={usuario}
          onChangeText={setUsuario}
        />

        <Text style={styles.label}>Pantalla</Text>
        <TextInput
          style={styles.input}
          value={pantalla}
          onChangeText={setPantalla}
        />

        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={showDatePickerHandler}
        >
          <Text style={styles.dateButtonText}>Seleccionar Fecha</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display="default"
            onChange={(e, selectedDate) => {
              setShowDatePicker(false);
              setFecha(selectedDate || fecha);
            }}
          />
        )}

        <Text style={styles.selectedDateText}>
          Fecha seleccionada: {fecha.toLocaleDateString()}
        </Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>Enviar Reporte</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fefefe',
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
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: 'white',
  },
  selectedDateText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#007bff',
  },
  saveButton: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 50,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReportarErrorScreen;
