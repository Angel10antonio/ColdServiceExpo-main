import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import firebase from '../database/firebase';
import { useEffect } from 'react';




const { db, firebase: firebaseInstance } = firebase;

const EquipoConfiguradoScreen = () => {
  const [nombreTienda, setNombreTienda] = useState('');
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [fechaConfiguracion, setFechaConfiguracion] = useState(new Date());
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [fechaConfiguracionSeleccionada, setFechaConfiguracionSeleccionada] = useState(false);
  const [tecnicoResponsable, setTecnicoResponsable] = useState('');
  const [voltaje, setVoltaje] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [estado, setEstado] = useState('Operativo');
  const [fechaUltimoMantenimiento, setFechaUltimoMantenimiento] = useState(new Date());
  const [mostrarFechaMantenimiento, setMostrarFechaMantenimiento] = useState(false);
  const [fechaMantenimientoSeleccionada, setFechaMantenimientoSeleccionada] = useState(false);
  const [elementos, setElementos] = useState([{ concepto: '' }]);
  const [usuarios, setUsuarios] = useState([]);


  const agregarElemento = () => {
  setElementos([...elementos, { concepto: '' }]);
};

const actualizarElemento = (index, campo, valor) => {
  const nuevosElementos = [...elementos];
  nuevosElementos[index][campo] = valor;
  setElementos(nuevosElementos);
};

useEffect(() => {
  const obtenerUsuarios = async () => {
    try {
      const snapshot = await db.collection('usuarios').get();
      const listaUsuarios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsuarios(listaUsuarios);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  obtenerUsuarios();
}, []);



  const guardarEnFirebase = async () => {
    if (!nombreEquipo || !marca || !modelo || !fechaConfiguracionSeleccionada || !fechaMantenimientoSeleccionada) {
      Alert.alert('Error', 'Por favor completa al menos los campos obligatorios.');
      return;
    }

    try {
      await db.collection('equipos_configurados').add({
        nombreTienda,
        nombreEquipo,
        marca,
        modelo,
        numeroSerie,
        ubicacion,
        fechaConfiguracion: fechaConfiguracion.toISOString(),
        tecnicoResponsable,
        voltaje,
        capacidad,
        descripcion,
        observaciones,
        estado,
        fechaUltimoMantenimiento: fechaUltimoMantenimiento.toISOString(),
        elementos,
        creadoEn: firebaseInstance.firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Éxito', 'Datos guardados correctamente.');
      limpiarCampos();
    } catch (error) {
      console.error('Error al guardar el equipo:', error);
      Alert.alert('Error', 'No se pudo guardar: ' + error.message);
    }
  };

  const limpiarCampos = () => {
    setNombreTienda(''); 
    setNombreEquipo('');
    setMarca('');
    setModelo('');
    setNumeroSerie('');
    setUbicacion('');
    setFechaConfiguracion(new Date());
    setFechaConfiguracionSeleccionada(false);
    setTecnicoResponsable('');
    setVoltaje('');
    setCapacidad('');
    setDescripcion('');
    setObservaciones('');
    setEstado('Operativo');
    setFechaUltimoMantenimiento(new Date());
    setFechaMantenimientoSeleccionada(false);
    setElementos([{ concepto: '' }]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Equipo Configurado</Text>

      <Text style={styles.label}>Nombre de tienda</Text>
<View style={styles.pickerWrapper}>
  <Picker
    selectedValue={nombreTienda}
    onValueChange={(value) => setNombreTienda(value)}
  >
    <Picker.Item label="Selecciona una tienda" value="" />
    {usuarios.map((usuario) => (
      <Picker.Item key={usuario.id} label={usuario.name} value={usuario.name} />
    ))}
  </Picker>
</View>


      <Text style={styles.label}>Nombre del equipo</Text>
<View style={styles.pickerWrapper}>
  <Picker
    selectedValue={nombreEquipo}
    onValueChange={(value) => setNombreEquipo(value)}
  >
    <Picker.Item label="Selecciona un nombre de equipo" value="" />
    <Picker.Item label="Marco alimentos congelados 3 puertas" value="Marco alimentos congelados 3 puertas" />
    <Picker.Item label="Cuarto frio comida Rapida" value="Cuarto frio comida Rapida" />
    <Picker.Item label="Cuarto frio bebidas" value="Cuarto frio bebidas" />
    <Picker.Item label="Vitrina abierta vegetales" value="Vitrina abierta vegetales" />
    <Picker.Item label="vitrina abierta alimentos preparados" value="vitrina abierta alimentos preparados" />
  </Picker>
</View>


     <Text style={styles.label}>Marca</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={marca}
            onValueChange={(value) => setMarca(value)}
          >
            <Picker.Item label="Selecciona una marca" value="" />
            <Picker.Item label="ANTHONY" value="ANTHONY" />
            <Picker.Item label="Hill Phoenix" value="Phoenix" />
            {/* Puedes agregar más marcas si lo necesitas */}
          </Picker>
        </View>

        <Text style={styles.label}>Modelo</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={modelo}
              onValueChange={(value) => setModelo(value)}
            >
              <Picker.Item label="Selecciona un modelo" value="" />
              <Picker.Item label="101B" value="101B" />
              <Picker.Item label="EM1P" value="EM1P" />
              <Picker.Item label="05DM6" value="05DM6" />
              <Picker.Item label="O5DMB" value="O5DMB" />
              {/* Puedes agregar más modelos si lo necesitas */}
            </Picker>
          </View>

          <Text style={styles.label}>Número de serie</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={numeroSerie}
                onValueChange={(value) => setNumeroSerie(value)}
              >
                <Picker.Item label="Selecciona un número de serie" value=""/>
                <Picker.Item label="MG2665A21" value="MG2665A21" />
                <Picker.Item label="CUSTOM" value="CUSTOM" />
                <Picker.Item label="K12" value="K12" />
                <Picker.Item label="J12" value="J12" />
                {/* Puedes agregar más números de serie si lo necesitas */}
              </Picker>
            </View>


      <Text style={styles.label}>Ubicación</Text>
      <TextInput style={styles.input} value={ubicacion} onChangeText={setUbicacion} />

      <Text style={styles.label}>Fecha de configuración</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setMostrarFecha(true)}>
        <Text style={styles.dateButtonText}>Seleccionar Fecha</Text>
      </TouchableOpacity>
      {fechaConfiguracionSeleccionada && (
        <Text style={styles.selectedDateText}>{fechaConfiguracion.toLocaleDateString()}</Text>
      )}
      {mostrarFecha && (
        <DateTimePicker
          value={fechaConfiguracion}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setMostrarFecha(false);
            if (selectedDate) {
              setFechaConfiguracion(selectedDate);
              setFechaConfiguracionSeleccionada(true);
            }
          }}
        />
      )}

      <Text style={styles.label}>Técnico responsable</Text>
      <TextInput style={styles.input} value={tecnicoResponsable} onChangeText={setTecnicoResponsable} />

      <Text style={styles.label}>Descripción del equipo</Text>
        {elementos.map((elemento, index) => (
          <View key={index} style={styles.elementoRow}>
            <View style={styles.numeroContainer}>
              <Text style={styles.elementoNumero}>{index + 1}.</Text>
            </View>
            <TextInput
          style={styles.elementoInput}
          placeholder="Concepto"
          value={elemento.concepto}
          onChangeText={(text) => actualizarElemento(index, 'concepto', text)}
          multiline={true}
          textAlignVertical="top"
        />
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={agregarElemento}>
          <Text style={styles.addButtonText}>+ Agregar Elemento</Text>
        </TouchableOpacity>


      <Text style={styles.label}>Observaciones</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={observaciones}
        onChangeText={setObservaciones}
        multiline
      />

      <Text style={styles.label}>Estado del equipo</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={estado} onValueChange={(value) => setEstado(value)}>
          <Picker.Item label="En mantenimiento" value="En mantenimiento" />
          <Picker.Item label="Dañado" value="Dañado" />
        </Picker>
      </View>

      <Text style={styles.label}>Fecha de último mantenimiento</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setMostrarFechaMantenimiento(true)}>
        <Text style={styles.dateButtonText}>Seleccionar Fecha</Text>
      </TouchableOpacity>
      <View style={{ height: 30 }} />
      {fechaMantenimientoSeleccionada && (
        <Text style={styles.selectedDateText}>{fechaUltimoMantenimiento.toLocaleDateString()}</Text>
      )}
      {mostrarFechaMantenimiento && (
        <DateTimePicker
          value={fechaUltimoMantenimiento}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setMostrarFechaMantenimiento(false);
            if (selectedDate) {
              setFechaUltimoMantenimiento(selectedDate);
              setFechaMantenimientoSeleccionada(true);
            }
          }}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={guardarEnFirebase}>
        <Text style={styles.saveButtonText}>Guardar equipo</Text>
      </TouchableOpacity>
      <View style={{ height: 10 }} />
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
  selectedDateText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
    textAlign: 'center',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
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
  pickerWrapper: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 10,
  backgroundColor: '#fff',
  marginBottom: 20,
},
elementoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
},

numeroContainer: {
  width: 30,
  alignItems: 'center',
},

elementoNumero: {
  fontSize: 13,
  fontWeight: 'bold',
  color: '#333',
},

elementoInput: {
  flex: 1,
  minHeight: 50,
  maxHeight: 120,
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 10,
  paddingHorizontal: 15,
  paddingVertical: 10,
  backgroundColor: '#fff',
  fontSize: 16,
},
addButton: {
  backgroundColor: '#28a745',       // Verde bonito
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignItems: 'center',
  marginBottom: 20,
},

addButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
});

export default EquipoConfiguradoScreen;
