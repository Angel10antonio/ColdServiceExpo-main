import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert, // Mantén esta importación
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firebase from '../database/firebase';
import Signature from 'react-native-signature-canvas'; // Asegúrate de tener esta importación
import Icon from 'react-native-vector-icons/MaterialIcons'; // Para el icono en el botón
const { db } = firebase;

const CapturaProcesoReparacionScreen = () => {
  const [plaza, setPlaza] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [horaSalida, setHoraSalida] = useState(new Date());
  const [horaArribo, setHoraArribo] = useState(new Date());
  const [fechaTerminacion, setFechaTerminacion] = useState(new Date());
  const [horaTerminacion, setHoraTerminacion] = useState(new Date());
  const [directienda, setDirecciontienda] = useState('');
  const [tienda, setTienda] = useState('');
  const [urgencia, setUrgencia] = useState(null);
  const [reporte, setReporte] = useState('');
  const [ruta, setRuta] = useState('');
  const [cuadrilla, setCuadrilla] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showHoraSalidaPicker, setShowHoraSalidaPicker] = useState(false);
  const [showHoraArriboPicker, setShowHoraArriboPicker] = useState(false);
  const [showFechaTerminacionPicker, setShowFechaTerminacionPicker] =
    useState(false);
  const [showHoraTerminacionPicker, setShowHoraTerminacionPicker] =
    useState(false);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState(''); // Nuevo estado para Modelo
  const [noSerie, setNoSerie] = useState(''); // Nuevo estado para No. serie o placa
  const [trabajosEfectuados, setTrabajosEfectuados] = useState(''); // Nuevo campo
  const [gasRefrigerante, setGasRefrigerante] = useState(''); // Campo para gas refrigerante utilizado
  const [cargaGas, setCargaGas] = useState(''); // Nuevo estado para la carga de gas en gramos

  // Nuevos estados para "Falla Reportada" y "Reportada Por"
  const [fallaReportada, setFallaReportada] = useState('');
  const [reportadaPor, setReportadaPor] = useState('');

  const [descripcionDiagnostico, setDescripcionDiagnostico] = useState('');
  const [motivoCarga, setMotivoCarga] = useState([]);
  const [otroMotivo, setOtroMotivo] = useState(''); // Aquí defines el setter correctamente
  const [signature, setSignature] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false); // Para controlar el modal de firma

  const handlePress = (option) => {
    if (motivoCarga.includes(option)) {
      setMotivoCarga(motivoCarga.filter((item) => item !== option));

      // Si se deselecciona "Otro", limpiamos el campo
      if (option === 'Otro') {
        setOtroMotivo('');
      }
    } else {
      setMotivoCarga([...motivoCarga, option]);
    }
  };

  const motivoFinal = motivoCarga.includes('Otro')
    ? [...motivoCarga.filter((item) => item !== 'Otro'), otroMotivo]
    : motivoCarga;

  const [materiales, setMateriales] = useState([
    { concepto: '', cantidad: '', unidad: '' },
  ]);

  // Función para agregar una nueva fila
  const agregarMaterial = () => {
    setMateriales([...materiales, { concepto: '', cantidad: '', unidad: '' }]);
  };

  // Función para actualizar un campo de una fila específica
  const actualizarMaterial = (index, field, value) => {
    const nuevosMateriales = [...materiales];
    nuevosMateriales[index][field] = value;
    setMateriales(nuevosMateriales);
  };

  const [fechaProgramada, setFechaProgramada] = useState(null); // Inicializa como null
  const [showFechaProgramadaPicker, setShowFechaProgramadaPicker] =
    useState(false);

  const [trabajoPendiente, setTrabajoPendiente] = useState('');

  const [comentariosAdicionales, setComentariosAdicionales] = useState('');

  const handleSignature = (sig) => {
    if (sig) {
      setSignature(sig); // Guardamos la firma
      setShowSignatureModal(false); // Cerramos el modal de firma
    }
  };

  const handleSubmit = async () => {
    if (
      !plaza ||
      !directienda ||
      !tienda ||
      urgencia === null ||
      !fecha ||
      !fechaTerminacion ||
      !hora ||
      !horaSalida ||
      !horaArribo ||
      !horaTerminacion ||
      !reporte ||
      !ruta ||
      !cuadrilla ||
      !fallaReportada || // Verifica si "Falla Reportada" está vacío
      !reportadaPor || // Verifica si "Reportada Por" está vacío
      !descripcionDiagnostico ||
      !marca ||
      !modelo || // Verifica si "Modelo" está vacío
      !noSerie || // Verifica si "No. serie o placa" está vacío
      !trabajosEfectuados || // Verifica si "Trabajos Efectuados" está vacío
      !gasRefrigerante || // Validación para el campo de gas refrigerante
      !cargaGas ||
      motivoCarga.length === 0 // Verifica si al menos una opción de "Motivo de la carga" está seleccionada
    ) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    // Validación de fechas
    if (fechaTerminacion < fecha) {
      Alert.alert(
        'Error de fecha',
        'La fecha de terminación no puede ser anterior a la fecha de inicio.',
      );
      return;
    }

    if (!signature) {
      Alert.alert('Error', 'Por favor, firma antes de guardar.');
      return;
    }

    // Verificar el contenido de los materiales antes de enviarlos a Firebase
    //console.log('Materiales:', materiales);

    try {
      setLoading(true);
      await db.collection('proceso_reparacion').add({
        plaza,
        directienda,
        tienda,
        urgencia,
        fecha: fecha.toISOString(),
        fecha_terminacion: fechaTerminacion.toISOString(),
        hora: hora.toISOString(),
        hora_salida: horaSalida.toISOString(),
        hora_arribo: horaArribo.toISOString(),
        hora_terminacion: horaTerminacion.toISOString(),
        prestador: 'COLD SERVICE REFRIGERATION, SA DE C.V. (Héctor Espinoza)',
        reporte,
        ruta,
        cuadrilla,
        falla_reportada: fallaReportada, // Guardamos la falla reportada
        reportada_por: reportadaPor, // Guardamos quien reportó
        descripcion_diagnostico: descripcionDiagnostico, // Guardamos la descripción del diagnóstico
        marca,
        modelo, // Guardamos el modelo
        no_serie: noSerie, // Guardamos el "No. serie o placa"
        trabajos_efectuados: trabajosEfectuados, // Guardamos los trabajos efectuados
        gas_refrigerante: gasRefrigerante,
        carga_gas: cargaGas, // Guardamos la carga de gas
        motivo_carga: motivoFinal, // Guardamos el motivo de la carga
        otro_motivo: otroMotivo,
        trabajo_pendiente: trabajoPendiente,
        fecha_programada: fechaProgramada,
        comentarios_adicionales: comentariosAdicionales,
        materiales: materiales.map((material) => ({
          concepto: material.concepto,
          cantidad: material.cantidad,
          unidad: material.unidad,
        })),
        firma: signature, // <-- Asegúrate de guardar la firma aquí
      });
      Alert.alert('Éxito', 'Proceso de reparación guardado con éxito.');
      // Limpiar los campos después de guardar
      setPlaza('');
      setDirecciontienda('');
      setTienda('');
      setUrgencia(null);
      setFecha(new Date());
      setFechaTerminacion(new Date());
      setHora(new Date());
      setHoraSalida(new Date());
      setHoraArribo(new Date());
      setHoraTerminacion(new Date());
      setReporte('');
      setRuta('');
      setCuadrilla('');
      setFallaReportada(''); // Limpiar "Falla Reportada"
      setReportadaPor(''); // Limpiar "Reportada Por"
      setDescripcionDiagnostico(''); // Limpiar "Descripción Diagnóstico"
      setMarca(''); // Limpiar "Marca"
      setModelo(''); // Limpiar "Modelo"
      setNoSerie(''); // Limpiar "No. serie o placa"
      setTrabajosEfectuados(''); // Limpiar "Trabajos Efectuados"
      setGasRefrigerante(''); // Limpiar el campo de gas refrigerante
      setCargaGas(''); // Limpiar la carga de gas
      setMotivoCarga([]);
      setOtroMotivo(''); // Limpiar motivo de carga
      setMateriales([{ concepto: '', cantidad: '', unidad: '' }]); // Limpiar los materiales
      setTrabajoPendiente('');
      setComentariosAdicionales(''); // Limpiar "Comentarios Adicionales"
      setSignature(null);
    } catch (error) {
      console.error('Error al guardar datos:', error);
      Alert.alert(
        'Error',
        'Hubo un problema al guardar el proceso de reparación.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Captura de Proceso de Reparación</Text>

      <Text style={styles.label}>Plaza:</Text>
      <TextInput
        style={styles.input}
        value={plaza}
        onChangeText={setPlaza}
        placeholder="Ingrese la plaza"
      />

      <Text style={styles.label}>Dirección de tienda:</Text>
      <TextInput
        style={styles.input}
        value={directienda}
        onChangeText={setDirecciontienda}
        placeholder="Ingrese la dirección de la tienda"
      />

      <Text style={styles.label}>Tienda:</Text>
      <TextInput
        style={styles.input}
        value={tienda}
        onChangeText={setTienda}
        placeholder="Ingrese nombre de la tienda"
      />

      <Text style={styles.label}>Fecha:</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
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

      <Text style={styles.label}># Reporte:</Text>
      <TextInput
        style={styles.input}
        value={reporte}
        onChangeText={setReporte}
        placeholder="Ingrese el número de reporte"
      />

      <Text style={styles.label}>Ruta:</Text>
      <TextInput
        style={styles.input}
        value={ruta}
        onChangeText={setRuta}
        placeholder="Ingrese la ruta"
      />

      <Text style={styles.label}>Cuadrilla:</Text>
      <TextInput
        style={styles.input}
        value={cuadrilla}
        onChangeText={setCuadrilla}
        placeholder="Ingrese la cuadrilla"
      />

      <Text style={styles.label}>Urgencia:</Text>
      <View style={styles.urgencyContainer}>
        <TouchableOpacity
          style={[
            styles.urgencyButton,
            urgencia === 'Sí' && styles.selectedButton,
          ]}
          onPress={() => setUrgencia('Sí')}
        >
          <Text
            style={[
              styles.urgencyButtonText,
              urgencia === 'Sí' && styles.selectedButtonText,
            ]}
          >
            Sí
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.urgencyButton,
            urgencia === 'No' && styles.selectedButton,
          ]}
          onPress={() => setUrgencia('No')}
        >
          <Text
            style={[
              styles.urgencyButtonText,
              urgencia === 'No' && styles.selectedButtonText,
            ]}
          >
            No
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}></View>

      <Text style={styles.label}>Hora de reporte:</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.dateButtonText}>Seleccionar Hora</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={hora}
          mode="time"
          display="default"
          onChange={(e, selectedTime) => {
            setShowTimePicker(false);
            setHora(selectedTime || hora);
          }}
        />
      )}
      <Text style={styles.selectedDateText}>
        Hora seleccionada:{' '}
        {hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>

      {/* Hora de salida */}
      <Text style={styles.label}>Hora de salida:</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowHoraSalidaPicker(true)}
      >
        <Text style={styles.dateButtonText}>Seleccionar Hora de salida</Text>
      </TouchableOpacity>

      {showHoraSalidaPicker && (
        <DateTimePicker
          value={horaSalida}
          mode="time"
          display="default"
          onChange={(e, selectedTime) => {
            setShowHoraSalidaPicker(false);
            setHoraSalida(selectedTime || horaSalida);
          }}
        />
      )}
      <Text style={styles.selectedDateText}>
        Hora salida seleccionada:{' '}
        {horaSalida.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>

      {/* Hora de arribo */}
      <Text style={styles.label}>Hora de arribo:</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowHoraArriboPicker(true)}
      >
        <Text style={styles.dateButtonText}>Seleccionar Hora de arribo</Text>
      </TouchableOpacity>

      {showHoraArriboPicker && (
        <DateTimePicker
          value={horaArribo}
          mode="time"
          display="default"
          onChange={(e, selectedTime) => {
            setShowHoraArriboPicker(false);
            setHoraArribo(selectedTime || horaArribo);
          }}
        />
      )}
      <Text style={styles.selectedDateText}>
        Hora arribo seleccionada:{' '}
        {horaArribo.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>

      <View style={styles.divider}></View>

      {/* Fecha de terminación */}
      <Text style={styles.label}>Fecha de terminación:</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowFechaTerminacionPicker(true)}
      >
        <Text style={styles.dateButtonText}>
          Seleccionar Fecha de Terminación
        </Text>
      </TouchableOpacity>

      {showFechaTerminacionPicker && (
        <DateTimePicker
          value={fechaTerminacion}
          mode="date"
          display="default"
          onChange={(e, selectedDate) => {
            setShowFechaTerminacionPicker(false);
            setFechaTerminacion(selectedDate || fechaTerminacion);
          }}
        />
      )}
      <Text style={styles.selectedDateText}>
        Fecha terminación seleccionada: {fechaTerminacion.toLocaleDateString()}
      </Text>

      {/* Hora de terminación */}
      <Text style={styles.label}>Hora de terminación:</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowHoraTerminacionPicker(true)}
      >
        <Text style={styles.dateButtonText}>
          Seleccionar Hora de Terminación
        </Text>
      </TouchableOpacity>

      {showHoraTerminacionPicker && (
        <DateTimePicker
          value={horaTerminacion}
          mode="time"
          display="default"
          onChange={(e, selectedTime) => {
            setShowHoraTerminacionPicker(false);
            setHoraTerminacion(selectedTime || horaTerminacion);
          }}
        />
      )}
      <Text style={styles.selectedDateText}>
        Hora terminación seleccionada:{' '}
        {horaTerminacion.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
      <View style={styles.divider}></View>

      <Text style={styles.reportTitle}>REPORTE DE FALLAS</Text>

      {/* Falla Reportada */}
      <Text style={styles.label}>Falla Reportada:</Text>
      <TextInput
        style={styles.inputMultiline} // Usamos un estilo diferente para el cuadro de texto
        value={fallaReportada}
        onChangeText={setFallaReportada}
        placeholder="Ingrese la falla reportada"
        multiline={true} // Habilitamos el texto multilinea
        numberOfLines={7} // Número de líneas visibles por defecto
      />

      {/* Reportada Por */}
      <Text style={styles.label}>Reportada Por:</Text>
      <TextInput
        style={styles.input}
        value={reportadaPor}
        onChangeText={setReportadaPor}
        placeholder="Ingrese quien reportó"
      />

      <Text style={styles.reportTitle}>
        DESCRIPCION DEL DIAGNOSTICO AL REVISAR
      </Text>
      {/* Descripción Diagnóstico */}
      <Text style={styles.label}>Descripción Diagnóstico:</Text>
      <TextInput
        style={[styles.inputMultiline, { marginBottom: 20 }]} // Agrega un margen inferior de 20
        value={descripcionDiagnostico}
        onChangeText={setDescripcionDiagnostico}
        placeholder="Ingrese la descripción del diagnóstico"
        multiline={true} // Habilitamos el texto multilinea
        numberOfLines={7} // Número de líneas visibles por defecto
      />
      <View style={styles.divider}></View>

      <Text style={styles.reportTitle}>DESCRIPCION DEL EQUIPO</Text>
      {/* Marca */}
      <Text style={styles.label}>Marca:</Text>
      <TextInput
        style={styles.input}
        value={marca}
        onChangeText={setMarca}
        placeholder="Ingrese la marca del equipo"
      />

      {/* Modelo */}
      <Text style={styles.label}>Modelo:</Text>
      <TextInput
        style={styles.input}
        value={modelo}
        onChangeText={setModelo}
        placeholder="Ingrese el modelo del equipo"
      />

      {/* Numero de serie o placa */}
      <Text style={styles.label}>No. Serie o Placa:</Text>
      <TextInput
        style={styles.input}
        value={noSerie}
        onChangeText={setNoSerie}
        placeholder="Ingrese el No. serie o placa"
      />

      <View style={styles.divider}></View>

      <Text style={styles.reportTitle}>TRABAJOS EFECTUADOS</Text>
      <TextInput
        style={[styles.inputMultiline, { marginBottom: 20 }]} // Agregamos un margen inferior
        value={trabajosEfectuados}
        onChangeText={setTrabajosEfectuados}
        placeholder="Ingrese los trabajos efectuados"
        multiline={true}
        numberOfLines={7}
      />

      <View style={styles.divider}></View>

      <Text style={styles.reportTitle}>
        CONTROL DE CARGA DE GAS REFRIGERANTE
      </Text>

      <Text style={styles.label}>
        En caso de aplicar, especifique el gas refrigerante utilizado:
      </Text>
      <TextInput
        style={styles.input}
        value={gasRefrigerante}
        onChangeText={setGasRefrigerante}
        placeholder="Especifique el gas utilizado"
      />

      {/* Carga de gas en gramos */}
      <Text style={styles.label}>
        Indique la carga de gas refrigerante (en gramos):
      </Text>
      <TextInput
        style={styles.input}
        value={cargaGas}
        onChangeText={setCargaGas}
        placeholder="Ingrese la carga en gramos"
        keyboardType="numeric" // Permitir solo números
      />

      {/* Motivo de la carga */}
      <View style={{ padding: 20 }}>
        <Text style={styles.label}>Motivo de la carga:</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              motivoCarga.includes('Cambio de Compresores') &&
                styles.selectedButton,
            ]}
            onPress={() => handlePress('Cambio de Compresores')}
          >
            <Text
              style={[
                styles.optionButtonText,
                motivoCarga.includes('Cambio de Compresores') &&
                  styles.selectedButtonText,
              ]}
            >
              Cambio de Compresores
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              motivoCarga.includes('Fuga') && styles.selectedButton,
            ]}
            onPress={() => handlePress('Fuga')}
          >
            <Text
              style={[
                styles.optionButtonText,
                motivoCarga.includes('Fuga') && styles.selectedButtonText,
              ]}
            >
              Fuga
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              motivoCarga.includes('Calibración') && styles.selectedButton,
            ]}
            onPress={() => handlePress('Calibración')}
          >
            <Text
              style={[
                styles.optionButtonText,
                motivoCarga.includes('Calibración') &&
                  styles.selectedButtonText,
              ]}
            >
              Calibración
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              motivoCarga.includes('Otro') && styles.selectedButton,
            ]}
            onPress={() => handlePress('Otro')}
          >
            <Text
              style={[
                styles.optionButtonText,
                motivoCarga.includes('Otro') && styles.selectedButtonText,
              ]}
            >
              Otro (Especifique)
            </Text>
          </TouchableOpacity>

          {motivoCarga.includes('Otro') && (
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Especifique el motivo"
              value={otroMotivo}
              onChangeText={setOtroMotivo}
            />
          )}
        </View>
      </View>
      <View style={styles.divider}></View>

      <Text style={styles.reportTitle}>MATERIALES UTILIZADOS</Text>
      {materiales.map((material, index) => (
        <View key={index} style={styles.materialRow}>
          <TextInput
            style={[styles.materialInput, styles.conceptoInput]}
            placeholder="Concepto"
            value={material.concepto}
            onChangeText={(text) => actualizarMaterial(index, 'concepto', text)}
          />

          <TextInput
            style={[styles.materialInput, styles.cantidadInput]}
            placeholder="Cantidad"
            keyboardType="numeric"
            value={material.cantidad}
            onChangeText={(text) => actualizarMaterial(index, 'cantidad', text)}
          />
          <TextInput
            style={[styles.materialInput, styles.unidadInput]}
            placeholder="Unidad"
            value={material.unidad}
            onChangeText={(text) => actualizarMaterial(index, 'unidad', text)}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={agregarMaterial}>
        <Text style={styles.addButtonText}>+ Agregar Material</Text>
      </TouchableOpacity>

      <Text style={styles.reportTitle}>TRABAJOS PENDIENTES</Text>
      <TextInput
        style={styles.inputMultiline}
        value={trabajoPendiente}
        onChangeText={setTrabajoPendiente}
        placeholder="Ingrese los trabajos pendientes"
        multiline={true}
        numberOfLines={5} // Ajusta el número de líneas según el espacio que desees
      />

      <View>
        <Text style={styles.reportTitle}>FECHA PROGRAMADA</Text>
        <Text style={styles.label}>Fecha Programada:</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowFechaProgramadaPicker(true)}
        >
          <Text style={styles.dateButtonText}>
            Seleccionar Fecha Programada
          </Text>
        </TouchableOpacity>

        {showFechaProgramadaPicker && (
          <DateTimePicker
            value={fechaProgramada || new Date()} // Si no hay fecha, usa la fecha actual
            mode="date"
            display="default"
            onChange={(e, selectedDate) => {
              setShowFechaProgramadaPicker(false);
              setFechaProgramada(selectedDate || fechaProgramada);
            }}
          />
        )}

        {/* Solo muestra la fecha seleccionada si hay una */}
        {fechaProgramada && (
          <Text style={styles.selectedDateText}>
            Fecha programada seleccionada:{' '}
            {fechaProgramada.toLocaleDateString()}
          </Text>
        )}
      </View>

      <Text style={styles.reportTitle}>COMENTARIOS ADICIONALES</Text>
      {/* Comentarios adicionales */}
      <Text style={styles.label}>Comentarios Adicionales:</Text>
      <TextInput
        style={[styles.inputMultiline, { marginBottom: 20 }]}
        value={comentariosAdicionales} // El valor solo es lo que el usuario haya ingresado
        onChangeText={setComentariosAdicionales}
        placeholder="Sin comentarios adicionales" // Texto predeterminado cuando el campo está vacío
        multiline={true}
        numberOfLines={5}
      />

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
        style={[styles.photoButton, { backgroundColor: '#b7001f' }]}
        onPress={() => setShowSignatureModal(true)}
      >
        <Icon name="edit" size={20} color="#fff" />
        <Text style={styles.photoButtonText}>Firmar</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>Guardar Reporte</Text>
        </TouchableOpacity>
      )}
      <View style={{ height: 60 }} />

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
    padding: 20,
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
  urgencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  urgencyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  urgencyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedButton: {
    backgroundColor: '#ff5733',
    borderColor: '#d43f00',
    borderWidth: 2,
    elevation: 5,
  },
  selectedButtonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  dateButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedDateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    height: 4,
    backgroundColor: '#007bff',
    marginVertical: 20,
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    height: 60,
    justifyContent: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#007bff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333', // Puedes cambiar el color si lo prefieres
    textAlign: 'center', // Si quieres centrar el texto
    marginTop: 20, // Para añadir un poco de espacio antes del título
  },
  inputMultiline: {
    height: 200, // Puedes ajustar la altura según lo necesites
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 18, // Más espacio arriba y abajo
    backgroundColor: '#fff',
    fontSize: 16,
    textAlignVertical: 'top', // Alinea el texto desde la parte superior del cuadro
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#0303b5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  optionButtonText: {
    color: 'white',
    fontSize: 16,
  },
  selectedButton: {
    backgroundColor: '#28a745',
  },
  selectedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  materialRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 5,
  },

  materialInput: {
    borderWidth: 1,
    borderColor: 'grey',
    padding: 8,
    borderRadius: 4,
  },

  conceptoInput: {
    flex: 8, // más ancho
  },

  cantidadInput: {
    flex: 1, // ajustado a un valor positivo
    minWidth: 80, // valor mínimo para evitar que se encoja demasiado
  },

  unidadInput: {
    flex: -1, // ajustado a un valor positivo
    minWidth: 60, // valor mínimo para evitar que se encoja demasiado
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
});

export default CapturaProcesoReparacionScreen;
