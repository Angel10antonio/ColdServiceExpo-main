import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';



const HomeScreen = ({ navigation, route }) => {
  const { userRole } = route.params;

  const [activeIndex1, setActiveIndex1] = useState(0);
  const [activeIndex2, setActiveIndex2] = useState(0);
  const [activeIndex3, setActiveIndex3] = useState(0);
  const [activeIndex4, setActiveIndex4] = useState(0);
  const [activeIndex5, setActiveIndex5] = useState(0);
  const [activeIndex6, setActiveIndex6] = useState(0);

  const handleScroll1 = (e) => setActiveIndex1(Math.floor(e.nativeEvent.contentOffset.x / 60));
  const handleScroll2 = (e) => setActiveIndex2(Math.floor(e.nativeEvent.contentOffset.x / 60));
  const handleScroll3 = (e) => setActiveIndex3(Math.floor(e.nativeEvent.contentOffset.x / 60));
  const handleScroll4 = (e) => setActiveIndex4(Math.floor(e.nativeEvent.contentOffset.x / 60));
  const handleScroll5 = (e) => setActiveIndex5(Math.floor(e.nativeEvent.contentOffset.x / 60));
  const handleScroll6 = (e) => setActiveIndex6(Math.floor(e.nativeEvent.contentOffset.x / 60));



  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cold Service</Text>

      {/* Fila 1: Cuadros 1 al 3 */}
      <View style={styles.horizontalContainer}>
       {/* Cuadro 1 */}
        <View style={styles.squareButtonContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll1}
          >
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('ProcesoReparacionScreen')}
            >
              <Image
                source={require('../assets/herramientas.png')} // Ajusta esta ruta si estás en otra carpeta
                style={{ width: 490, height: 65, marginBottom: 5 }}
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
                style={{ width: 500, height: 60, marginBottom: 2 }}
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
            onScroll={handleScroll2}
          >
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('CostoReparacionesScreen')}
            >
              <Image
                source={require('../assets/costoreparaciones.png')} // Usa tu imagen correspondiente
                style={{ width: 90, height: 70, marginBottom: 5 }}
                resizeMode="contain"
              />
              <Text style={styles.squareButtonText}>Costo Rep-araciones</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('ConsultarCostoReparacionScreen')}
            >
              <Image
                source={require('../assets/consultar.png')} // Usa tu imagen correspondiente
                style={{ width: 500, height: 60, marginBottom: 2 }}
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
          onScroll={handleScroll3}
        >
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => navigation.navigate('EquipoConfiguradoScreen')}
          >
            <Image
              source={require('../assets/configuracio.png')} // Imagen representativa para equipo configurado
              style={{ width: 490, height: 50, marginBottom: 5 }}
              resizeMode="contain"
            />
            <Text style={styles.squareButtonText}>Equipo Co-nfigurado</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => navigation.navigate('ConsultarEquiposConfiguradosScreen')}
          >
            <Image
              source={require('../assets/consultar.png')} // Imagen representativa para ver equipos
              style={{ width: 500, height: 60, marginBottom: 2 }}
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
            onScroll={handleScroll4}
          >
            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('ReportarErrorScreen')}
            >
              <Image
                source={require('../assets/error.png')} // Imagen representativa para reportar error
                style={{ width: 490, height: 50, marginBottom: 5 }}
                resizeMode="contain"
              />
              <Text style={styles.squareButtonText}>Reportar Error</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => navigation.navigate('ConsultarErroresScreen')}
            >
              <Image
                source={require('../assets/consultar.png')} // Imagen representativa para consultar errores
                style={{ width: 500, height: 50, marginBottom: 2 }}
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
          onScroll={handleScroll5}
        >
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => navigation.navigate('ViaticosScreen')}
          >
            <Image
              source={require('../assets/billeter.png')} // Imagen representativa para Viáticos
              style={{ width: 490, height: 76, marginBottom: 5 }}
              resizeMode="contain"
            />
            <Text style={styles.squareButtonText}>Viáticos</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

       
       {/* Cuadro 6 */}
      <View style={styles.squareButtonContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll6}
        >
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => navigation.navigate('LicenciasTecnicosScreen')}
          >
            <Image
              source={require('../assets/licenciaste.png')} // Imagen representativa para Licencias Técnicos
              style={{ width: 490, height: 68, marginBottom: 5 }}
              resizeMode="contain"
            />
            <Text style={styles.squareButtonText}>Licencias Técnicos</Text>
          </TouchableOpacity>
        </ScrollView>

        
      </View>
      </View>
{/* Cuadro solo visible para admin */}
      {/* Cuadro solo visible para admin */}
                {userRole === 'admin' && (
            <View style={styles.squareButtonContainer}>
              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={styles.squareButton}
                  onPress={() => navigation.navigate('UserList')}
                >
                  <Image
                    source={require('../assets/daralta.png')} // Reemplaza con tu imagen
                    style={{ width: 46, height: 60, marginBottom: -6 }}
                    resizeMode="contain"
                  />
                  <Text style={styles.squareButtonText}>Dar de alta nuevo usuario</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
          </View>
        );
      };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 9,
  },
  header: {
    fontSize: 29,
    fontWeight: 'bold',
    marginBottom: 40,
    color: 'black',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#05182cff',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  squareButtonContainer: {
    width: 120,
    height: 170,
    backgroundColor: '#1919afff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    marginBottom: 15,
  },
  squareButton: {
    width: 80,
    height: 109,
    backgroundColor: '#1919afff',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  squareButtonText: {
    marginTop: 7,
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 56,
    margin: 5,
  },
  activeDot: {
    backgroundColor: '#f2f2f2',
  },
  inactiveDot: {
    backgroundColor: 'grey',
  },
});

export default HomeScreen;
