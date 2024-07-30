import { useEffect, useState, useRef } from 'react';
import { PermissionsAndroid, StyleSheet, View, Text, Pressable, Image } from 'react-native';
import MapView,  { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

import * as Location from 'expo-location';

export default function HomeScreen() {
  const [parkingType, setParkingType] = useState('Office');
  const [parkingProbability, setParkingProbability] = useState('0')
  const [suvCount, setSuvCount] = useState('0')
  const [hatchbackCount, sethatchbackCount] = useState('0')

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const MINUTE_MS = 6000;

  const gmapRef = useRef<MapView>(null);

  const [coord, setCoord] = useState({
    latitude: 18.551860,
    longitude: 73.889878,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [businessBayCords, setBusinessBayCords] = useState({
    latitude: 18.551860,
    longitude: 73.889878,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  })

  const getLocation = async () => {
    console.log("get current location called")
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log(location)
    
    return {
      latitude: location.coords.latitude, 
      longitude: location.coords.longitude
    };
  }

  const moveToLocation = async (latitude: any, longitude: any) => {
    console.log("latitue", latitude)
    console.log("longitude", longitude)

    gmapRef.current?.animateToRegion(
      {
        latitude: 18.5541,
        longitude: 73.9282,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      2000,
    );
  };

  const firstCall = async () => {
    let cords = await getLocation();
      moveToLocation(cords?.latitude, cords?.longitude);
  }

  useEffect(() => {
    firstCall();

    const interval = setInterval( async () => {
      console.log("inside interval")
      let cords = await getLocation();
      moveToLocation(cords?.latitude, cords?.longitude);
    }, MINUTE_MS);
  }, []);

  const onParkingButtonClick = () => {
   setParkingType('Ishanya')
  }

  return (
    <View
      style={[
        styles.container,
        {
          // Try setting `flexDirection` to `"row"`.
          flexDirection: 'column',
        },
      ]}>

      {
      // header for any logo
      }
      <View style={[styles.logoContainer]} >
        <Image
          style={styles.logo}
          source={require('@/assets/images/hpark.jpg')}
        />
      </View>

      {
      // car availability labels
      }
      <View 
        style={[
          styles.parkingCountContainer,
          {flexDirection: 'row'}
        ]}>
          <View style={[styles.suvContainer]}>
            <Text style={[styles.centerLabel]}>SUV</Text>
            <Text style={[styles.carCountLabel]}>{suvCount}</Text>
          </View>
          <View style={[styles.suvContainer]}>
            <Text style={[styles.centerLabel]}>Hatchback</Text>
            <Text style={[styles.carCountLabel]}>{hatchbackCount}</Text>
          </View>
      </View>
    
      <View style={[styles.parkingButtonContainer]}>
        <Pressable style={styles.parkingButton} onPress={onParkingButtonClick}>
          <Text style={styles.parkingButtonText}>{parkingType}</Text>
        </Pressable>
      </View>
      
      <View style={[styles.mapContainer]}>
        <MapView 
          followsUserLocation={true}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={coord}
          ref={gmapRef}
          >
          <Marker coordinate={businessBayCords}/>
        </MapView>
        
      </View>
      
      <View
        style={[styles.parkingProbabilityContainer]}
        >
        <Text style={styles.parkingProbabilityHeading}>Parking Probability</Text>
        <Text style={styles.parkingProbabilityText}>{parkingProbability} %</Text>
      </View>

      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  logoContainer: {
    flex: 1,
    backgroundColor: 'grey',
    marginTop: '5%',
    padding: 10,
    justifyContent: 'center',
  },
  parkingCountContainer: {
    height: 200
  },
  suvContainer: {
    flex: 1,
    margin: 10,
    justifyContent: 'center',
  },
  centerLabel: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 0,
    width: 200,
  },
  carCountLabel: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
    width: 200,
  },
  parkingButtonContainer: {
    marginTop: 10,
    marginBottom: 20,
    marginLeft: 30,
    marginRight: 30,
    height: 50,
  },
  parkingButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'red',
    cursor: 'pointer'
  },
  parkingButtonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  parkingProbabilityContainer: {
    flex: 1,
    alignItems: 'center'
  },
  parkingProbabilityText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
    width: 200,
  },
  parkingProbabilityHeading: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 0,
    width: 200,
  },
  mapContainer: {
    height: 200
  },
  map: {
    width: '100%',
    height: '100%',
  },
  logo: {
    width: 80,
    height: 60,
  },
});
