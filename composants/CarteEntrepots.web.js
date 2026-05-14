import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

//si le user voir l'appli sur le web
const CarteEntrepots = forwardRef(function CarteEntrepots(_props, _ref) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.titre}>
        <FontAwesome name="map" size={16} color="dimgray" /> Carte 
      </Text>
      <Text style={styles.sous}>La map n'est pas disponible sur le web</Text>
    </View>
  );
});

export default CarteEntrepots;

const styles = StyleSheet.create({
  placeholder: {
    height: 160,
    margin: 16,
    backgroundColor: 'gainsboro',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  titre: { fontSize: 16, fontWeight: '700', color: 'dimgray' },
  sous:  { fontSize: 13, color: 'gray' },
});
