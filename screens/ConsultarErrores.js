import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, item } from 'react-native';
import firebase from '../database/firebase';
const { db } = firebase;
import { collection, getDocs } from 'firebase/firestore';

const ConsultarErroresScreen = () => {
  const [reportes, setReportes] = useState([]);

  const obtenerReportes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'reporte_de_errores'));
      const reportesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReportes(reportesData);
    } catch (error) {
      console.error('Error al obtener los reportes:', error);
    }
  };

  useEffect(() => {
    obtenerReportes();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.titulo}>{item.titulo}</Text>
      <Text style={styles.descripcion}>{item.descripcion}</Text>
      <Text style={styles.meta}>Usuario: {item.usuario}</Text>
      <Text style={styles.meta}>Pantalla: {item.pantalla}</Text>
      <Text style={styles.meta}>
        Fecha: {new Date(item.fecha).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reportes de Errores</Text>
      <FlatList
        data={reportes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000080',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  card: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  descripcion: {
    fontSize: 16,
    marginTop: 5,
  },
  meta: {
    fontSize: 14,
    marginTop: 5,
    color: '#555',
  },
});

export default ConsultarErroresScreen;
