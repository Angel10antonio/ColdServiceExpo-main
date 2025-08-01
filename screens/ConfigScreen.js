import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';

const ConfigScreen = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  const toggleNotifications = () => setIsNotificationsEnabled(prev => !prev);

  const handleReportError = () => {
    console.log("Reportar un error");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Configuración</Text>

      {/* Interruptor para notificaciones */}
      <View style={styles.switchContainer}>
        <Text style={styles.text}>Notificaciones</Text>
        <Switch 
          value={isNotificationsEnabled} 
          onValueChange={toggleNotifications} 
        />
      </View>

      {/* Botón para reportar un error */}
      <TouchableOpacity onPress={handleReportError}>
        <Text style={[styles.text, styles.marginTop]}>
          Reportar un error
        </Text>
      </TouchableOpacity>

      {/* Botón para cuenta */}
      <TouchableOpacity onPress={handleReportError}>
        <Text style={[styles.text, styles.marginTop]}>
          Cuenta
        </Text>
      </TouchableOpacity>

      {/* Botón para estadísticas */}
      <TouchableOpacity onPress={handleReportError}>
        <Text style={[styles.text, styles.marginTop]}>
          Estadísticas
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  switchContainer: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  marginTop: {
    marginTop: 35,
  },
});

export default ConfigScreen;
