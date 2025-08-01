import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import firebase from '../database/firebase';

const db = firebase.db;

const ConsultarCostoReparacionScreen = () => {
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await db.collection('costo_reparaciones').orderBy('createdAt', 'desc').get();
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setReportes(data);
      } catch (e) {
        console.error('Error al obtener los reportes:', e);
      }
    };
    fetchData();
  }, []);

  const renderItem = ({ item }) => {
    const fecha = item.createdAt?.toDate?.().toLocaleDateString?.('es-MX') ?? 'Fecha desconocida';
    return (
      <View style={styles.card}>
        <Text style={styles.id}>ID: {item.id}</Text>
        <Text style={styles.fecha}>Fecha: {fecha}</Text>
        <Text style={styles.total}>Total Reparación: ${item.totalReparacion?.toFixed(2)}</Text>
        <Text style={styles.subTitle}>Elementos:</Text>
        {item.elementos.map((el) => (
          <View key={el.id} style={styles.elemento}>
            <Text style={styles.elementoNombre}>{el.nombre} - {el.fecha}</Text>
            {el.subElementos.map((sub) => (
              <Text key={sub.id} style={styles.subelemento}>- {sub.nombre} (${sub.precio.toFixed(2)})</Text>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportes de Costos de Reparación</Text>
      <FlatList
        data={reportes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No hay reportes disponibles.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000080',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  id: {
    fontWeight: 'bold',
  },
  fecha: {
    color: '#555',
  },
  total: {
    marginTop: 4,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  subTitle: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#333',
  },
  elemento: {
    marginTop: 4,
    paddingLeft: 8,
  },
  elementoNombre: {
    fontWeight: '600',
  },
  subelemento: {
    fontSize: 13,
    color: '#444',
    paddingLeft: 10,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  },
});

export default ConsultarCostoReparacionScreen;
