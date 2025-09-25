import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';

// Escalado dinámico según el ancho de pantalla
const { width: screenWidth } = Dimensions.get('window');
const guidelineBaseWidth = 360;
const scale = (size) => (screenWidth / guidelineBaseWidth) * size;

const HomeScreen = ({ navigation, route }) => {
  const role = route.params?.userRole?.trim().toLowerCase();

  const [activeIndex1, setActiveIndex1] = useState(0);
  const [activeIndex2, setActiveIndex2] = useState(0);
  const [activeIndex3, setActiveIndex3] = useState(0);
  const [activeIndex4, setActiveIndex4] = useState(0);
  const [activeIndex5, setActiveIndex5] = useState(0);

  const handleScroll = (e, setActive) => {
    const slideSize = e.nativeEvent.layoutMeasurement.width;
    const index = Math.round(e.nativeEvent.contentOffset.x / slideSize);
    setActive(index);
  };

  // --------------------
  // MENÚ GERENTE
  // --------------------
  if (role === 'gerente') {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>MENÚ GERENTE</Text>

        <View style={[styles.horizontalContainer, { justifyContent: 'center' }]}>
          <TouchableOpacity
            style={[styles.squareButtonContainer, { width: scale(150), height: scale(130) }]}
            onPress={() => navigation.navigate('ConsultarProcesoReparacionesScreen')}
          >
            <Image
              source={require('../assets/consultar.png')}
              style={{ width: scale(80), height: scale(50), marginBottom: 5 }}
              resizeMode="contain"
            />
            <Text style={styles.squareButtonText}>Consultar Reparación</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.squareButtonContainer, { width: scale(150), height: scale(130), marginLeft: scale(20) }]}
            onPress={() => navigation.navigate('ConsultarEquiposConfiguradosScreen')}
          >
            <Image
              source={require('../assets/consultar.png')}
              style={{ width: scale(80), height: scale(50), marginBottom: 5 }}
              resizeMode="contain"
            />
            <Text style={styles.squareButtonText}>Ver Equipos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --------------------
  // MENÚ GERENTE DE ZONA
  // --------------------
  if (role === 'gerentezona') {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>MENÚ GERENTE DE ZONA</Text>

        <View style={[styles.horizontalContainer, { justifyContent: 'center' }]}>
          <TouchableOpacity
  style={[styles.squareButtonContainer, { width: scale(150), height: scale(130) }]}
  onPress={() =>
    navigation.navigate('ConsultarProcesoReparacionesScreen', {
      zona: route.params?.zona,           // 👈 Pasas la zona del gerente
      tienda: route.params?.tienda || '' // 👈 Si el gerente ya eligió una tienda
    })
  }
>
            <Image
              source={require('../assets/consultar.png')}
              style={{ width: scale(80), height: scale(50), marginBottom: 5 }}
              resizeMode="contain"
            />
            <Text style={styles.squareButtonText}>Reparaciones Zona</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.squareButtonContainer, { width: scale(150), height: scale(130), marginLeft: scale(20) }]}
            onPress={() => navigation.navigate('ConsultarEquiposConfiguradosScreen')}
          >
            <Image
              source={require('../assets/consultar.png')}
              style={{ width: scale(80), height: scale(50), marginBottom: 5 }}
              resizeMode="contain"
            />
            <Text style={styles.squareButtonText}>Técnicos Zona</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --------------------
  // MENÚ ADMIN / USUARIO
  // --------------------
  return (
    <View style={styles.container}>
      <Text style={styles.header}>MENÚ</Text>

      {/* Fila 1: Cuadros 1 al 3 */}
      <View style={styles.horizontalContainer}>
        {/* Cuadro 1 */}
        <View style={styles.squareButtonContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => handleScroll(e, setActiveIndex1)}
            scrollEventThrottle={16}
          >
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('ProcesoReparacionScreen')}
            >
              <Image
                source={require('../assets/herramientas.png')}
                style={{ width: scale(90), height: scale(65), marginBottom: 5 }}
                resizeMode="contain"
              />
              <Text style={styles.squareButtonText}>Reporte de Reparación</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('ConsultarProcesoReparacionesScreen')}
            >
              <Image
                source={require('../assets/consultar.png')}
                style={{ width: scale(90), height: scale(60), marginBottom: 2 }}
                resizeMode="contain"
              />
              <Text style={styles.squareButtonText}>Consultar Reparación</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.dotsContainer}>
            <View style={[styles.dot, activeIndex1 === 0 ? styles.activeDot : styles.inactiveDot]} />
            <View style={[styles.dot, activeIndex1 === 1 ? styles.activeDot : styles.inactiveDot]} />
          </View>
        </View>

        {/* Cuadro 2 */}
        <View style={styles.squareButtonContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => handleScroll(e, setActiveIndex2)}
            scrollEventThrottle={16}
          >
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('CostoReparacionesScreen')}
            >
              <Image
                source={require('../assets/costoreparaciones.png')}
                style={{ width: scale(90), height: scale(70), marginBottom: 5 }}
                resizeMode="contain"
              />
              <Text style={styles.squareButtonText}>Costo Reparaciones</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('ConsultarCostoReparacionScreen')}
            >
              <Image
                source={require('../assets/consultar.png')}
                style={{ width: scale(90), height: scale(60), marginBottom: 2 }}
                resizeMode="contain"
              />
              <Text style={styles.squareButtonText}>Consultar Costos</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.dotsContainer}>
            <View style={[styles.dot, activeIndex2 === 0 ? styles.activeDot : styles.inactiveDot]} />
            <View style={[styles.dot, activeIndex2 === 1 ? styles.activeDot : styles.inactiveDot]} />
          </View>
        </View>

        {/* Cuadro 3 */}
        <View style={styles.squareButtonContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => handleScroll(e, setActiveIndex3)}
            scrollEventThrottle={16}
          >
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('EquipoConfiguradoScreen')}
            >
              <Image
                source={require('../assets/configuracio.png')}
                style={{ width: scale(90), height: scale(50), marginBottom: 5 }}
                resizeMode="contain"
              />
              <Text style={styles.squareButtonText}>Equipo Configurado</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('ConsultarEquiposConfiguradosScreen')}
            >
              <Image
                source={require('../assets/consultar.png')}
                style={{ width: scale(90), height: scale(60), marginBottom: 2 }}
                resizeMode="contain"
              />
              <Text style={styles.squareButtonText}>Ver Equipos</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.dotsContainer}>
            <View style={[styles.dot, activeIndex3 === 0 ? styles.activeDot : styles.inactiveDot]} />
            <View style={[styles.dot, activeIndex3 === 1 ? styles.activeDot : styles.inactiveDot]} />
          </View>
        </View>
      </View>

      {/* Fila 2: Cuadros 4 al 6 */}
      <View style={styles.horizontalContainer}>
        {/* Cuadro 4 */}
        <View style={styles.squareButtonContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => handleScroll(e, setActiveIndex4)}
            scrollEventThrottle={16}
          >
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('ReportarErrorScreen')}
            >
              <Image
                source={require('../assets/error.png')}
                style={{ width: scale(90), height: scale(50), marginBottom: 5 }}
                resizeMode="contain"
              />
              <Text style={styles.squareButtonText}>Reportar Error</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('ConsultarErroresScreen')}
            >
              <Image
                source={require('../assets/consultar.png')}
                style={{ width: scale(90), height: scale(50), marginBottom: 2 }}
                resizeMode="contain"
              />
              <Text style={styles.squareButtonText}>Consultar Errores</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.dotsContainer}>
            <View style={[styles.dot, activeIndex4 === 0 ? styles.activeDot : styles.inactiveDot]} />
            <View style={[styles.dot, activeIndex4 === 1 ? styles.activeDot : styles.inactiveDot]} />
          </View>
        </View>

        {/* Cuadro 5 */}
        <View style={styles.squareButtonContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => handleScroll(e, setActiveIndex5)}
            scrollEventThrottle={16}
          >
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('ViaticosScreen')}
            >
              <Image
                source={require('../assets/billeter.png')}
                style={{ width: scale(100), height: scale(80), marginBottom: 5 }}
                resizeMode="contain"
              />
              <Text style={styles.squareButtonText}>Viáticos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('ConsultarViaticosScreen')}
            >
              <Image
                source={require('../assets/consultar.png')}
                style={{ width: scale(90), height: scale(60), marginBottom: 2 }}
                resizeMode="contain"
              />
              <Text style={styles.squareButtonText}>Consultar Viáticos</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.dotsContainer}>
            <View style={[styles.dot, activeIndex5 === 0 ? styles.activeDot : styles.inactiveDot]} />
            <View style={[styles.dot, activeIndex5 === 1 ? styles.activeDot : styles.inactiveDot]} />
          </View>
        </View>

        {/* Cuadro 6 */}
        <View style={styles.squareButtonContainer}>
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => navigation.navigate('LicenciasTecnicosScreen')}
          >
            <Image
              source={require('../assets/licenciaste.png')}
              style={{ width: scale(90), height: scale(68), marginBottom: 5 }}
              resizeMode="contain"
            />
            <Text style={styles.squareButtonText}>Licencias Técnicos</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Botón visible solo para admin */}
      {role === 'admin' && (
        <View style={styles.squareButtonContainer}>
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => navigation.navigate('UserList')}
          >
            <Image
              source={require('../assets/daralta.png')}
              style={{ width: scale(46), height: scale(60), marginBottom: 5 }}
              resizeMode="contain"
            />
            <Text style={styles.squareButtonText}>Dar de alta usuario</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Estilos con escala
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: scale(12),
  },
  header: {
    fontSize: scale(29),
    fontWeight: 'bold',
    marginBottom: scale(10),
    color: 'black',
  },
  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: scale(20),
  },
  squareButtonContainer: {
    width: scale(110),
    height: scale(155),
    backgroundColor: '#1919afff',
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(4),
    marginHorizontal: scale(-3),
    marginBottom: scale(15),
  },
  squareButton: {
    width: scale(80),
    height: scale(119),
    backgroundColor: '#1919afff',
    borderRadius: scale(90),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: scale(10),
  },
  squareButtonText: {
    marginTop: scale(5),
    color: 'white',
    fontSize: scale(9),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: scale(1),
  },
  dot: {
    width: scale(10),
    height: scale(10),
    borderRadius: 56,
    margin: scale(5),
  },
  activeDot: {
    backgroundColor: '#f2f2f2',
  },
  inactiveDot: {
    backgroundColor: 'grey',
  },
});

export default HomeScreen;
