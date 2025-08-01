import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import firebase from '../database/firebase';

const { db } = firebase;

const ConsultarEquiposConfiguradosScreen = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerEquipos = async () => {
      try {
        const snapshot = await db.collection('equipos_configurados').get();

        if (!snapshot.empty) {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEquipos(data);
        } else {
          Alert.alert('Error', 'No se encontraron equipos configurados.');
        }
      } catch (error) {
        console.error('Error al obtener los equipos:', error);
        Alert.alert('Error', 'No se pudo obtener los equipos: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerEquipos();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.text}>Cargando equipos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Consultar Equipos Configurados</Text>

        {equipos.length === 0 ? (
          <Text style={styles.text}>No hay equipos configurados.</Text>
        ) : (
          equipos.map((equipo) => (
            <View key={equipo.id} style={styles.equipoContainer}>
              <Text style={styles.label}>Nombre de tienda:</Text>
              <Text style={styles.info}>{equipo.nombreTienda || 'No especificado'}</Text>

              <Text style={styles.label}>Nombre del equipo:</Text>
              <Text style={styles.info}>{equipo.nombreEquipo}</Text>

              <Text style={styles.label}>Marca:</Text>
              <Text style={styles.info}>{equipo.marca}</Text>

              <Text style={styles.label}>Modelo:</Text>
              <Text style={styles.info}>{equipo.modelo}</Text>

              <Text style={styles.label}>Número de serie:</Text>
              <Text style={styles.info}>{equipo.numeroSerie}</Text>

              <Text style={styles.label}>Ubicación:</Text>
              <Text style={styles.info}>{equipo.ubicacion}</Text>

              {equipo.elementos && equipo.elementos.length > 0 && (
                <>
                  <Text style={styles.label}>Descripción del equipo:</Text>
                  {equipo.elementos.map((elemento, idx) => (
                    <Text key={idx} style={styles.info}>
                      {idx + 1}. {elemento.concepto}
                    </Text>
                  ))}
                </>
              )}

              <Text style={styles.label}>Fecha de configuración:</Text>
              <Text style={styles.info}>
                {equipo.fechaConfiguracion
                  ? new Date(equipo.fechaConfiguracion).toLocaleDateString()
                  : 'No especificado'}
              </Text>

              <Text style={styles.label}>Técnico responsable:</Text>
              <Text style={styles.info}>{equipo.tecnicoResponsable}</Text>

              <Text style={styles.label}>Observaciones:</Text>
              <Text style={styles.info}>{equipo.observaciones}</Text>

              <Text style={styles.label}>Estado del equipo:</Text>
              <Text style={styles.info}>{equipo.estado}</Text>

              <Text style={styles.label}>Fecha de último mantenimiento:</Text>
              <Text style={styles.info}>
                {equipo.fechaUltimoMantenimiento
                  ? new Date(equipo.fechaUltimoMantenimiento).toLocaleDateString()
                  : 'No especificado'}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000080',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: 'white',
  },
  equipoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
    fontWeight: 'bold',
  },
  info: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
});

export default ConsultarEquiposConfiguradosScreen;
