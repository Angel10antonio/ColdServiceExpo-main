import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Firebase from '../database/firebase';
import 'firebase/compat/firestore';

const ComprasVentasScreen = () => {
  const [expanded, setExpanded] = useState(false);
  const [tipo, setTipo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [modelo, setModelo] = useState('');
  const [precio, setPrecio] = useState('');
  const [fotoUri, setFotoUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const unsubscribe = Firebase.db
      .collection('compra_venta')
      .orderBy('createdAt', 'desc')
      .onSnapshot((querySnapshot) => {
        const productosData = [];
        querySnapshot.forEach((doc) => {
          productosData.push({ id: doc.id, ...doc.data() });
        });
        setProductos(productosData);
      });

    return () => unsubscribe();
  }, []);

  const formatCurrency = (value) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePrecioChange = (text) => setPrecio(formatCurrency(text));

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso para usar la cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5, allowsEditing: true });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.5, allowsEditing: true });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const handleGuardar = async () => {
    try {
      setSaving(true);
      await Firebase.db.collection('compra_venta').add({
        tipo,
        nombre,
        descripcion,
        modelo,
        precio,
        fotoUri: fotoUri || '',
        createdAt: new Date(),
      });
      setSaving(false);
      Alert.alert('Éxito', 'Producto guardado correctamente');

      setTipo('');
      setNombre('');
      setDescripcion('');
      setModelo('');
      setPrecio('');
      setFotoUri(null);
      setExpanded(false);
    } catch (error) {
      setSaving(false);
      console.log('Error guardando producto:', error);
      Alert.alert('Error', 'No se pudo guardar el producto');
    }
  };

  const handleEliminar = (id) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await Firebase.db.collection('compra_venta').doc(id).delete();
              Alert.alert('Producto eliminado');
            } catch (error) {
              console.log('Error eliminando producto:', error);
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const renderProducto = ({ item }) => (
    <View style={styles.productCard}>
      {item.fotoUri ? <Image source={{ uri: item.fotoUri }} style={styles.productImage} /> : null}
      <Text style={styles.productName}>{item.nombre}</Text>
      <Text style={styles.productType}>{item.tipo}</Text>
      <Text style={styles.productModel}>{item.modelo}</Text>
      <Text style={styles.productPrice}>${item.precio}</Text>
      <Text style={styles.productDescription}>{item.descripcion}</Text>

      {/* Botón eliminar */}
      <TouchableOpacity
        style={styles.buttonEliminar}
        onPress={() => handleEliminar(item.id)}
      >
        <Text style={styles.buttonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View>
      <Text style={styles.title}>Compras - Ventas</Text>

      <TouchableOpacity style={styles.accordionHeader} onPress={() => setExpanded(!expanded)}>
        <Ionicons
          name={expanded ? 'chevron-down' : 'add-circle-outline'}
          size={22}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.accordionText}>
          {expanded ? 'Ocultar formulario' : 'Agregar producto a la venta'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <ScrollView style={styles.formContainer} nestedScrollEnabled>
          <TextInput
            style={styles.input}
            placeholder="Tipo"
            value={tipo}
            onChangeText={setTipo}
            multiline
            textAlignVertical="top"
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
            multiline
            textAlignVertical="top"
          />
          <TextInput
            style={styles.input}
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            textAlignVertical="top"
          />
          <TextInput
            style={styles.input}
            placeholder="Modelo"
            value={modelo}
            onChangeText={setModelo}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.precioContainer}>
            <Text style={styles.signoPesos}>$</Text>
            <TextInput
              style={styles.inputPrecio}
              placeholder="Precio"
              value={precio}
              onChangeText={handlePrecioChange}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.fotoContainer}>
            {fotoUri && <Image source={{ uri: fotoUri }} style={styles.foto} />}
            <View style={styles.fotoButtons}>
              <TouchableOpacity style={styles.buttonFoto} onPress={takePhoto}>
                <Text style={styles.buttonText}>Tomar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonFoto} onPress={pickImage}>
                <Text style={styles.buttonText}>Seleccionar de Galería</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.buttonGuardar, saving && { backgroundColor: '#ccc' }]}
            onPress={handleGuardar}
            disabled={saving}
          >
            <Text style={styles.buttonText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );

  return (
    <FlatList
      key={expanded ? 'expanded' : 'collapsed'}
      ListHeaderComponent={renderHeader}
      data={productos}
      keyExtractor={(item) => item.id}
      renderItem={renderProducto}
      contentContainerStyle={styles.container}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1919afff',
    textAlign: 'center',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1919afff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  accordionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  formContainer: {
    maxHeight: 500,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    minHeight: 50,
  },
  precioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  signoPesos: {
    fontSize: 16,
    marginRight: 5,
    color: '#333',
  },
  inputPrecio: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  fotoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  foto: {
    width: 200,
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
  fotoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonFoto: {
    backgroundColor: '#1919afff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonGuardar: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonEliminar: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  productImage: {
    width: 180,
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  productType: {
    color: '#555',
    marginBottom: 5,
  },
  productModel: {
    color: '#555',
    marginBottom: 5,
  },
  productPrice: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#28a745',
  },
  productDescription: {
    textAlign: 'center',
    color: '#555',
  },
});

export default ComprasVentasScreen;
