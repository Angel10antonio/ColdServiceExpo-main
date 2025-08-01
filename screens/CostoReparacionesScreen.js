import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ←
import firebase from '../database/firebase';
const { db, firebase: firebaseInstance } = firebase;

const STORAGE_KEY = 'costos_reparaciones_elementos'; // ←

export default function CostosReparacionesScreen() {
  // — estados originales —
  const [elementos, setElementos] = useState([]);
  const [nombrePrincipal, setNombrePrincipal] = useState('');
  const [fechaPrincipal, setFechaPrincipal] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [nombreSub, setNombreSub] = useState('');
  const [proveedorSub, setProveedorSub] = useState('');
  const [facturaSub, setFacturaSub] = useState('');
  const [elementoSeleccionado, setElementoSeleccionado] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [elementoEnEdicion, setElementoEnEdicion] = useState(null);
  const [modoEdicionSub, setModoEdicionSub] = useState(false);
  const [subEnEdicion, setSubEnEdicion] = useState(null);
  const [cantidadSub, setCantidadSub] = useState(''); // raw input
  const [cantidadNumerica, setCantidadNumerica] = useState(0); // número extraído
  const [serieSub, setSerieSub] = useState('');
  const [precioSub, setPrecioSub] = useState('');
  // precioRaw guarda solo lo numérico (p.ej. "4" o "4.5")
  const [precioRaw, setPrecioRaw] = useState('');
  // precioUnitario es el número puro para cálculos
  const [precioUnitario, setPrecioUnitario] = useState(0);
  // selection controla la posición del cursor
  const [selection, setSelection] = useState({ start: 1, end: 1 });

  // ← 1) Al montar, cargar lo guardado
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setElementos(JSON.parse(json));
      } catch (e) {
        console.warn('No se pudo cargar elementos:', e);
      }
    })();
  }, []);

  // ← 2) Cada que cambie `elementos`, guardarlo
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(elementos));
  }, [elementos]);

  const agregarElementoPrincipal = () => {
    const fechaString = fechaPrincipal.toISOString().split('T')[0];

    if (editMode && elementoEnEdicion) {
      // — lógica de edición existente —
      const elementosActualizados = elementos.map((el) =>
        el.id === elementoEnEdicion
          ? { ...el, nombre: nombrePrincipal, fecha: fechaString }
          : el,
      );
      setElementos(elementosActualizados);
      setEditMode(false);
      setElementoEnEdicion(null);
    } else {
      // — nueva rama: al agregar, además seleccionamos para subelementos —
      const newId = Date.now().toString();
      const nuevoElemento = {
        id: newId,
        nombre: nombrePrincipal,
        fecha: fechaString,
        subElementos: [],
        precio: 0,
      };
      setElementos([...elementos, nuevoElemento]);

      // limpia formulario de elemento
      setNombrePrincipal('');
      setFechaPrincipal(new Date());

      // selecciona este elemento para que abra el form de subelemento
      setElementoSeleccionado(newId);
      setModoEdicionSub(false);
      setSubEnEdicion(null);
    }
  };

  const handlePrecioChange = (text) => {
    // 1) Eliminar "$" inicial
    let cleaned = text.replace(/^\$/, ' ');
    // 2) Quitar caracteres ilegales
    cleaned = cleaned.replace(/[^0-9.]/g, '');
    // 3) Separar por punto
    const parts = cleaned.split('.');
    if (parts.length > 2) return; // si hay más de un punto, ignorar
    if (parts[1] && parts[1].length > 2) {
      // limitar decimales a 2 dígitos
      parts[1] = parts[1].slice(0, 2);
    }
    cleaned = parts.join('.');
    // 4) Validar que empiece con dígito
    if (cleaned && !/^\d+(\.\d{0,2})?$/.test(cleaned)) return;
    // 5) Convertir a número
    const value = parseFloat(cleaned);
    setPrecioUnitario(isNaN(value) ? 0 : value);
    // 6) Actualizar estados de texto y raw
    setPrecioRaw(cleaned);
    setPrecioSub(`$${cleaned}`);
    // 7) Calcular posición del cursor: 1 (por "$") + longitud de cleaned
    const pos = 2 + cleaned.length;
    setSelection({ start: pos, end: pos });
  };
  // Función para editar un elemento existente
  const handleEdit = (id) => {
    const elemento = elementos.find((el) => el.id === id);
    if (elemento) {
      setNombrePrincipal(elemento.nombre);
      setFechaPrincipal(new Date(elemento.fecha));
      setElementoEnEdicion(id);
      setEditMode(true);
      setElementoSeleccionado(null);
    }
  };

  // Función para eliminar un elemento principal
  const handleDelete = (id) => {
    setElementos(elementos.filter((el) => el.id !== id));
    if (elementoSeleccionado === id) {
      setElementoSeleccionado(null);
    }
  };

  // Función para seleccionar un elemento y agregarle subelementos
  const handleAddSubelement = (id) => {
    setElementoSeleccionado(id);
    setNombreSub('');
    setPrecioSub('');
    setCantidadSub('');
    setSerieSub('');
    setProveedorSub('');
    setFacturaSub('');
    // Si previamente estabas editando un subelemento, cancelamos la edición
    setModoEdicionSub(false);
    setSubEnEdicion(null);
  };
  const handleCantidadChange = (text) => {
    // intenta capturar un entero al inicio
    const match = text.match(/^(\d+)(.*)$/);
    if (!match) {
      // no empieza con dígitos: error
      Alert.alert('Error', 'La cantidad debe comenzar con un número entero.');
      return;
    }
    // match[1] = la parte numérica, match[2] = resto (letras, espacios...)
    setCantidadNumerica(parseInt(match[1], 10));
    setCantidadSub(text);
  };

  // Función para agregar o editar un subelemento
  // Al agregar/editar un subelemento:
  const agregarSubelemento = () => {
    if (!elementoSeleccionado) return;

    // 1) usa el estado numérico, no parseFloat(precioSub)
    // precioUnitario ya viene de handlePrecioChange
    if (isNaN(precioUnitario) || precioUnitario <= 0 || cantidadNumerica <= 0) {
      Alert.alert(
        'Error',
        'Precio debe ser un número válido > 0 y cantidad un entero > 0.',
      );
      return;
    }

    // 2) calcula el total correctamente
    const precioTotal = precioUnitario * cantidadNumerica;

    const nuevoSub = {
      id: Date.now().toString(),
      nombre: nombreSub,
      precio: precioTotal,
      precioUnitario, // ← aquí guardas el número puro
      cantidad: cantidadSub, // cadena “4 cilindros”
      serie: serieSub,
      proveedor: proveedorSub,
      factura: facturaSub,
    };

    // 3) inserta o sustituye en tu array de elementos
    const elementosActualizados = elementos.map((el) => {
      if (el.id === elementoSeleccionado) {
        let subElementos;
        if (modoEdicionSub && subEnEdicion) {
          subElementos = el.subElementos.map((sub) =>
            sub.id === subEnEdicion ? { ...nuevoSub, id: sub.id } : sub,
          );
        } else {
          subElementos = [...el.subElementos, nuevoSub];
        }
        return { ...el, subElementos };
      }
      return el;
    });

    setElementos(elementosActualizados);

    // 4) limpia el formulario de subelemento
    setNombreSub('');
    setPrecioSub('');
    setPrecioRaw('');
    setPrecioUnitario(0);
    setCantidadSub('');
    setCantidadNumerica(0);
    setSerieSub('');
    setProveedorSub('');
    setFacturaSub('');
    setModoEdicionSub(false);
    setSubEnEdicion(null);
  };

  // Función para editar un subelemento
  const editarSubelemento = (elementoId, subId) => {
    const elemento = elementos.find((el) => el.id === elementoId);
    const sub = elemento?.subElementos.find((s) => s.id === subId);
    if (sub) {
      setElementoSeleccionado(elementoId);
      setNombreSub(sub.nombre);
      setPrecioSub(sub.precioUnitario.toString());
      setCantidadSub(sub.cantidad.toString());
      setSerieSub(sub.serie);
      setProveedorSub(sub.proveedor);
      setFacturaSub(sub.factura);
      setModoEdicionSub(true);
      setSubEnEdicion(subId);
    }
  };

  // Función para eliminar un subelemento
  const eliminarSubelemento = (elementoId, subId) => {
    const elementosActualizados = elementos.map((el) => {
      if (el.id === elementoId) {
        const subElementos = el.subElementos.filter((sub) => sub.id !== subId);
        return { ...el, subElementos };
      }
      return el;
    });
    setElementos(elementosActualizados);
  };

  // Función que calcula el total de la reparación
  const calcularTotal = () => {
    return elementos.reduce((total, el) => {
      const totalSub = el.subElementos.reduce(
        (acc, sub) => acc + sub.precio,
        0,
      );
      return total + el.precio + totalSub;
    }, 0);
  };
  // Suponiendo que quieras usar el primer elemento de la lista:
  const primaryName = elementos[0]?.nombre || 'sin-nombre';
  const cleanName = primaryName.replace(/\s+/g, ''); // quita espacios
  const uploadDate = new Date().toISOString().split('T')[0]; // YYYY‑MM‑DD
  const docId = `${cleanName}_${uploadDate}`; // e.g. Rack_2025-04-17

  const saveCostosReparaciones = async () => {
    if (elementos.length === 0) {
      Alert.alert(
        'Error',
        'Agrega al menos un elemento para guardar el informe.',
      );
      return;
    }
    try {
      // Genera un ID legible (opcional)
      const primaryName =
        elementos[0]?.nombre.replace(/\s+/g, '') || 'sin-nombre';
      const uploadDate = new Date().toISOString().split('T')[0];
      const docId = `${primaryName}_${uploadDate}`;

      await db
        .collection('costo_reparaciones')
        .doc(docId)
        .set({
          elementos,
          totalReparacion: elementos.reduce(
            (t, el) => t + el.subElementos.reduce((a, s) => a + s.precio, 0),
            0,
          ),
          createdAt: firebaseInstance.firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert('Éxito', `Guardado con ID: ${docId}`);

      // — limpia todo: estado y AsyncStorage —
      setElementos([]);
      setElementoSeleccionado(null);
      await AsyncStorage.removeItem(STORAGE_KEY);

      // (Opcional) reiniciar formularios/flags
      setNombrePrincipal('');
      setFechaPrincipal(new Date());
      setNombreSub('');
      setPrecioSub('');
      setCantidadSub('');
      setSerieSub('');
      setProveedorSub('');
      setFacturaSub('');
      setEditMode(false);
      setModoEdicionSub(false);
      setElementoEnEdicion(null);
      setSubEnEdicion(null);
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'No se pudo guardar: ' + error.message);
    }
  };

  // Renderizado de subelementos (recibe el subelemento y el ID del elemento padre)
  const renderSubElemento = (subItem, elementoId) => (
    <View style={styles.subItemContainer}>
      <Text style={styles.subItemText}>
        {subItem.nombre} - ${' '}
        {subItem.precioUnitario?.toFixed(2) ?? subItem.precio.toFixed(2)}
      </Text>
      {subItem.cantidad ? (
        <Text style={styles.detailText}>Cantidad: {subItem.cantidad}</Text>
      ) : null}
      {subItem.serie ? (
        <Text style={styles.detailText}>Serie: {subItem.serie}</Text>
      ) : null}
      {subItem.proveedor ? (
        <Text style={styles.detailText}>Proveedor: {subItem.proveedor}</Text>
      ) : null}
      {subItem.factura ? (
        <Text style={styles.detailText}>Factura: {subItem.factura}</Text>
      ) : null}

      <View style={styles.subButtonsContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editarSubelemento(elementoId, subItem.id)}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => eliminarSubelemento(elementoId, subItem.id)}
        >
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizado de cada elemento principal
  const renderElemento = ({ item }) => {
    const totalElemento =
      item.precio + item.subElementos.reduce((acc, sub) => acc + sub.precio, 0);

    return (
      <View style={styles.mainItemContainer}>
        <TouchableOpacity
          onPress={() => setElementoSeleccionado(item.id)}
          style={[
            styles.mainItemHeader,
            elementoSeleccionado === item.id && styles.selectedItemHeader,
          ]}
        >
          <Text style={styles.mainItemText}>
            {item.nombre} {item.fecha ? `- ${item.fecha}` : ''}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.addSubButton}
            onPress={() => handleAddSubelement(item.id)}
          >
            <Text style={styles.buttonText}>Añadir Subelemento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(item.id)}
          >
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={item.subElementos}
          keyExtractor={(sub) => sub.id}
          renderItem={({ item: subItem }) =>
            renderSubElemento(subItem, item.id)
          }
        />
        <Text style={styles.totalPorElemento}>
          Total de {item.nombre}: $ {totalElemento.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {elementoSeleccionado ? (
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>
            {modoEdicionSub
              ? 'Editar Subelemento'
              : `Añadir Subelemento a: ${elementos.find((el) => el.id === elementoSeleccionado)?.nombre}`}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del subelemento (ej. Tornillo)"
            value={nombreSub}
            onChangeText={setNombreSub}
          />
          <TextInput
            style={styles.input}
            placeholder="$0"
            value={precioSub}
            onChangeText={handlePrecioChange}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Cantidad (ej. 4 cilindros)"
            value={cantidadSub}
            onChangeText={handleCantidadChange}
            keyboardType="default"
          />

          <TextInput
            style={styles.input}
            placeholder="Serie (ej. S123)"
            value={serieSub}
            onChangeText={setSerieSub}
          />
          <TextInput
            style={styles.input}
            placeholder="Proveedor (ej. ACME)"
            value={proveedorSub}
            onChangeText={setProveedorSub}
          />
          <TextInput
            style={styles.input}
            placeholder="Factura (ej. F-00123)"
            value={facturaSub}
            onChangeText={setFacturaSub}
          />
          <Button
            title={
              modoEdicionSub
                ? 'Guardar Cambios en Subelemento'
                : 'Agregar Subelemento'
            }
            onPress={agregarSubelemento}
          />
          <Button
            title="Cancelar"
            onPress={() => {
              setElementoSeleccionado(null);
              setModoEdicionSub(false);
              setSubEnEdicion(null);
            }}
          />
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>
            {editMode ? 'Editar Elemento' : 'Agregar Elemento'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del elemento (ej. Rack)"
            value={nombrePrincipal}
            onChangeText={setNombrePrincipal}
          />
          <TouchableOpacity
            onPress={() => setMostrarCalendario(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateButtonText}>
              {fechaPrincipal.toISOString().split('T')[0]}
            </Text>
          </TouchableOpacity>
          {mostrarCalendario && (
            <DateTimePicker
              value={fechaPrincipal}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setMostrarCalendario(false);
                if (selectedDate) {
                  setFechaPrincipal(selectedDate);
                }
              }}
            />
          )}
          <Button
            title={editMode ? 'Guardar Cambios' : 'Agregar Elemento'}
            onPress={agregarElementoPrincipal}
          />
        </View>
      )}

      <Text style={styles.sectionTitle}>Lista de Elementos</Text>
      <FlatList
        data={elementos}
        keyExtractor={(item) => item.id}
        renderItem={renderElemento}
      />

      {elementoSeleccionado && (
        <View style={styles.volverContainer}>
          <Button
            title="Volver a Agregar Elemento Principal"
            onPress={() => {
              setElementoSeleccionado(null);
              setModoEdicionSub(false);
              setSubEnEdicion(null);
            }}
          />
        </View>
      )}

      <Text style={styles.globalTotal}>
        Total de la Reparación: $ {calcularTotal().toFixed(2)}
      </Text>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveCostosReparaciones}
      >
        <Text style={styles.saveButtonText}>Enviar a Costo Reparaciones</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  formContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  mainItemContainer: {
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  mainItemHeader: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
  },
  selectedItemHeader: {
    backgroundColor: '#c2e7ff',
  },
  mainItemText: {
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 14,
    color: '#555',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  addSubButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subItemContainer: {
    marginLeft: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subItemText: {
    fontSize: 14,
  },
  subButtonsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    justifyContent: 'flex-start',
    gap: 10,
  },
  totalPorElemento: {
    marginTop: 4,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  globalTotal: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  volverContainer: {
    marginVertical: 16,
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
