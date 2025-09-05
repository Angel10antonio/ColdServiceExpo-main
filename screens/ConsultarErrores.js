import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import firebase from '../database/firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { collection, getDocs } from 'firebase/firestore';

const { db } = firebase;

const ConsultarErroresScreen = () => {
  const [reportes, setReportes] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(1);
  const [scrollViewHeight, setScrollViewHeight] = useState(1);
  const [atTop, setAtTop] = useState(true);

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

  const handlePressArrow = () => {
    if (!scrollRef.current) return;
    if (atTop) {
      scrollRef.current.scrollToEnd({ animated: true });
    } else {
      scrollRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      setAtTop(value < 50);
    });
    return () => scrollY.removeListener(listener);
  }, []);

  const indicatorHeight =
    (scrollViewHeight * scrollViewHeight) / contentHeight < 30
      ? 30
      : (scrollViewHeight * scrollViewHeight) / contentHeight;

  const translateY = scrollY.interpolate({
    inputRange: [0, Math.max(1, contentHeight - scrollViewHeight)],
    outputRange: [0, scrollViewHeight - indicatorHeight],
    extrapolate: 'clamp',
  });

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
      <Animated.FlatList
        ref={scrollRef}
        data={reportes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(w, h) => setContentHeight(h)}
        onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
      {/* Barra de scroll */}
      <View style={styles.scrollBarContainer}>
        <Animated.View
          style={[styles.scrollBar, { height: indicatorHeight, transform: [{ translateY }] }]}
        />
      </View>

      {/* Botón flotante */}
      <TouchableOpacity style={styles.floatingArrow} onPress={handlePressArrow}>
        <Icon name={atTop ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={36} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000080' },
  scrollContainer: { padding: 20 },
  card: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  titulo: { fontSize: 22, fontWeight: 'bold' },
  descripcion: { fontSize: 16, marginTop: 5 },
  meta: { fontSize: 14, marginTop: 5, color: '#555' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: 'white' },

  // Barra de scroll
  scrollBarContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
  },
  scrollBar: { width: 6, backgroundColor: '#dbdbd7dc', borderRadius: 3 },

  // Botón flotante
  floatingArrow: {
    position: 'absolute',
    bottom: 60,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: '#007bff',
    borderRadius: 30,
    padding: 8,
    elevation: 5,
  },
});

export default ConsultarErroresScreen;
