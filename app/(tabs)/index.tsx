import { useEffect, useState, useRef } from 'react';
import { PermissionsAndroid, StyleSheet, View, Text, Pressable, Image } from 'react-native';
import MapView,  { PROVIDER_GOOGLE, Marker,  } from 'react-native-maps';
import MavViewDirections from 'react-native-maps-directions'

import * as Location from 'expo-location';

export default function HomeScreen() {
  const [parkingType, setParkingType] = useState('Office');
  const [parkingProbability, setParkingProbability] = useState(90)
  const [suvCount, setSuvCount] = useState(114)
  const [hatchbackCount, sethatchbackCount] = useState(246)

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const [latitudeDelta, setLatitudeDelta] = useState(0.012);
  const [longitudeDelta, setLongitudeDelta] = useState(0.012);
  
  const origin = { latitude: 18.5541, longitude: 73.9282 };
  const destination = { latitude: 37.423199, longitude: -122.084068 };
  const GOOGLE_MAPS_APIKEY = 'AIzaSyABpjcT06UusX2fFFceFahjDlQ1PAhc8mk';

  const MINUTE_MS = 15000;

  const gmapRef = useRef<MapView>(null);

  const [coord, setCoord] = useState({
    latitude: 18.551860,
    longitude: 73.889878,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  });

  const [businessBayCords, setBusinessBayCords] = useState({
    latitude: 18.551860,
    longitude: 73.889878,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012
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
    let zoomSwitch = Math.random() < 0.5;

    gmapRef.current?.animateToRegion(
      {
        latitude: 18.5541,
        longitude: 73.9282,
        latitudeDelta: zoomSwitch ? 0.012 : 0.1,
        longitudeDelta: zoomSwitch ? 0.012 : 0.1,
      },
      5000,
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

    const statsChangeMock = setInterval(() => {
      setParkingProbability(parkingProbability => parkingProbability - 1);
      setSuvCount(suvCount => suvCount - 2);
      sethatchbackCount(hatchbackCount => hatchbackCount - 3);
    }, 10000);
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
        <View style={[styles.logoContainerLeft]}>
          <Image
            style={styles.logo}
            source={require('@/assets/images/hpark.png')}
          />
        </View>
        <View style={[styles.logoContainerRight]}>
            <View style={{
              justifyContent: 'center',
              marginRight: 10,
            }}>
                <Text style={[styles.goodMorningLabel]}>Good Morning</Text>
                <Text style={[styles.usernameLabel]}>Nitish Kumar</Text>
            </View>
            <View style={{
              justifyContent: 'center',
              width: 30,
            }}>
              <Image
                style={styles.userIcon}
                source={require('@/assets/images/userIcon.png')}
              />
            </View>
        </View>
      </View>
      <View style={{
          height: 50,
          width: '100%',
          backgroundColor: 'grey',
          alignItems: 'center'
        }}>
          <Text style={{
            color: 'white',
            fontSize: 25,
            fontWeight: 'bold',
          }}>Find the best place to park</Text>
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
          <Marker coordinate={businessBayCords} identifier='destination' />
          {/* <Marker coordinate={origin} identifier='origin' /> */}
          <MavViewDirections 
            origin={origin}
            destination={businessBayCords}
            apikey='AIzaSyABpjcT06UusX2fFFceFahjDlQ1PAhc8mk'
            strokeWidth={3}
            strokeColor='blue'
          />
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
    height: 130,
    backgroundColor: 'grey',
    marginTop: '5%',
    padding: 10,
    flexDirection: 'row'
  },
  logoContainerLeft: {
    justifyContent: 'center',
    width: 200
  },
  logoContainerRight: {
    width: '250%',
    flexDirection: 'row',
    marginLeft: 50
  },
  userIcon: {
    height: 40,
    width: 40,
  },
  goodMorningLabel: {
    textAlign: 'right',
    color: 'white',
    fontSize: 18,
  },
  usernameLabel: {
    textAlign: 'right',
    color: 'white',
    fontSize: 18,
  },
  parkingCountContainer: {
    height: 150
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
    height: 100,
    alignItems: 'center',
    paddingTop: 10
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
    height: 300,
    padding: 10
  },
  map: {
    width: '100%',
    height: '100%',
  },
  logo: {
    width: 50,
    height: 100,
    marginLeft: 20
  },
});
