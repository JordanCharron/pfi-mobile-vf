import { forwardRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Circle, Polyline } from 'react-native-maps';

// 8 points de référence à Montréal (PFI exige ≥ 7 coordonnées)
export const CHEMIN_POINTS = [
  { latitude: 45.5017, longitude: -73.5673 },
  { latitude: 45.5028, longitude: -73.5750 },
  { latitude: 45.5045, longitude: -73.5820 },
  { latitude: 45.5070, longitude: -73.5880 },
  { latitude: 45.5100, longitude: -73.5940 },
  { latitude: 45.5135, longitude: -73.5990 },
  { latitude: 45.5170, longitude: -73.6045 },
  { latitude: 45.5200, longitude: -73.6100 },
];


const CarteEntrepots = forwardRef(function CarteEntrepots(
  { entrepots, userPos, plusProcheId, selectionne, onSelectionner },
  ref
) {
  if (!entrepots || entrepots.length === 0) return null;

  const [region, setRegion] = useState({
    latitude:       userPos.latitude,
    longitude:      userPos.longitude,
    latitudeDelta:  0.5,
    longitudeDelta: 0.5,
  });

 
  const MagProche = entrepots.find(e => e.id === plusProcheId);
  const coordsChemin = MagProche
    ? [{ latitude: MagProche.latitude, longitude: MagProche.longitude }, userPos]
    : [];

  return (
    <MapView
      ref={ref}
      style={styles.carte}
      provider={PROVIDER_GOOGLE}
      region={region}
      onRegionChangeComplete={setRegion}
    >
      {/* cercles de 5 km autour de chaque entrepôt */}
      {entrepots.map(e => (
        <Circle
          key={'c-' + e.id}
          center={{ latitude: e.latitude, longitude: e.longitude }}
          radius={5000}
          strokeColor="rgba(0,122,255,0.6)"
          fillColor="rgba(0,122,255,0.12)"
          strokeWidth={1}
        />
      ))}

      {/* chemin vers entrepot le plus proche */}
      {coordsChemin.length > 0 && (
        <Polyline
          coordinates={coordsChemin}
          strokeColor="tomato"
          strokeWidth={3}
        />
      )}

      {/* markers des entrepot */}
      {entrepots.map(e => (
        <Marker
          key={e.id}
          coordinate={{ latitude: e.latitude, longitude: e.longitude }}
          title={e.nom}
          description={e.adresse}
          image={require('../assets/petitLogo.png')}
          onPress={() => onSelectionner && onSelectionner(e.id)}
        />
      ))}

      {/* market maison*/}
      <Marker
        coordinate={userPos}
        title="Ma maison"
        image={require('../assets/maison.png')}
      />
    </MapView>
  );
});

export default CarteEntrepots;

const styles = StyleSheet.create({
  carte: { width: '100%', height: '100%' },
});
