// screens/ImageViewer.js
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const ImageViewer = ({ route }) => {
  const { uri } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ImageViewer;
