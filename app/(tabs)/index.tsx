import { useEffect, useState, useRef } from 'react';
import { PermissionsAndroid, StyleSheet, View, Text, Pressable, Image, Platform, Permission, Switch } from 'react-native';
import MapView,  { PROVIDER_GOOGLE, Marker,  } from 'react-native-maps';
import MavViewDirections from 'react-native-maps-directions'
import axios from 'axios';
import moment from 'moment';
import Moment from 'moment'


import * as Location from 'expo-location';

// import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
// import Constants from 'expo-constants';


// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

// async function sendPushNotification() {
//   let token = await Notifications.getExpoPushTokenAsync({
//     projectId: 'freemason-hackathon',
//   });

//   const message = {
//     to: token,
//     sound: 'default',
//     title: 'Original Title',
//     body: 'And here is the body!',
//     data: { someData: 'goes here' },
//   };

//   await fetch('https://exp.host/--/api/v2/push/send', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Accept-encoding': 'gzip, deflate',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(message),
//   });
// }

// async function registerForPushNotificationsAsync() {
//   console.log("registerForPushNotificationsAsync called")
//   if (Platform.OS === 'android') {
//     console.log("registerForPushNotificationsAsync updating android settings...")
//     Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#FF231F7C',
//     });
//   }

//   if (Device.isDevice) {
//     console.log("registerForPushNotificationsAsync isDevice found...")
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     console.log("registerForPushNotificationsAsync finalstatus...", finalStatus)

//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== 'granted') {
//       handleRegistrationError('Permission not granted to get push token for push notification!');
//       return;
//     }
//     const projectId = 'freemason-hackathon';

//       console.log("registerForPushNotificationsAsync projectId...", projectId)
//     if (!projectId) {
//       handleRegistrationError('Project ID not found');
//     }
//     try {
//       console.log("registerForPushNotificationsAsync pushTokenString fetching...")

//       const notificationResponse = await Notifications.getExpoPushTokenAsync({
//         projectId: 'freemason-hackathon',
//       })

//       console.log("notificationResponse", JSON.stringify(notificationResponse))

//       const pushTokenString = (
//         await Notifications.getExpoPushTokenAsync({
//           projectId,
//         })
//       ).data;
//       console.log("pushTokenString.............", pushTokenString);
//       return pushTokenString;
//     } catch (e: unknown) {
//       console.log(JSON.stringify(e))
//       handleRegistrationError(`${e}`);
//     }
//   } else {
//     handleRegistrationError('Must use physical device for push notifications');
//   }
// }

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

export default function HomeScreen() {
  const [parkingType, setParkingType] = useState('Office');
  const [parkingProbability, setParkingProbability] = useState(90)
  const [suvCount, setSuvCount] = useState(0)
  const [hatchbackCount, sethatchbackCount] = useState(0)
  const [carType, setCarType] = useState("HatchBack")
 
  const [isSUV, setIsSUV] = useState(true);
  const toggleCarType = () => setIsSUV((previousState) => {
    const newState = !previousState

    if (newState) {
      setCarType('SUV')
    } else {
      setCarType('HatchBack')
    }

    return newState;
  });



  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const [latitudeDelta, setLatitudeDelta] = useState(0.012);
  const [longitudeDelta, setLongitudeDelta] = useState(0.012);
  
  const origin = { latitude: 18.5541, longitude: 73.9282 };
  const destination = { latitude: 37.423199, longitude: -122.084068 };
  const GOOGLE_MAPS_APIKEY = 'AIzaSyABpjcT06UusX2fFFceFahjDlQ1PAhc8mk';

  const MINUTE_MS = 15000;

  const gmapRef = useRef<MapView>(null);


  // const getExpoPushToken = () => Notifications.getExpoPushTokenAsync({
  //   projectId: 'freemason-hackathon',
  // })

  // push notification settings
  // const [expoPushToken, setExpoPushToken] = useState(getExpoPushToken());

  const getCurrentDatetime = () => {
    const formattedDateTime = moment().format('DD-MM-yyyy HH:mm:ss');
    console.log("formattedDateTime", formattedDateTime)
    return formattedDateTime;
  }

  const getEvaluatedDateTime = () => {
    const currentTime = new Date();
    const futureTime = new Date(currentTime.getTime() + 40 * 60000);
    const formatedFuturedate =  Moment(futureTime).format('DD-MM-yyyy HH:mm:ss');
    console.log("formatedFuturedate", formatedFuturedate)
    return formatedFuturedate;
  }

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


 


  const generateNotification = async () => {
    console.log("generateNotification called")

    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    //show the notification to the user
    await Notifications.scheduleNotificationAsync({
      //set the content of the notification
      content: {
        title: "Demo title",
        body: "Demo body",
      },
      trigger: {
        seconds: 10, // Set the interval in seconds (e.g., 60 seconds for daily)
        repeats: true
      },
    });
  };

  const updateParkingStats =  async () => {
    console.log("updateParkingStats calling...")
    await fetch('http://34.93.157.250:8081/api/get-parking-data', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateTime: getEvaluatedDateTime(),
        carType: carType
      }),
    })
    .then(response => response.json())
    .then(response => {
      console.log("updateParkingStats response.......", JSON.stringify(response))
      // Handle the data here
      console.log("/get-parking-data", response);
      setParkingProbability(response.parkingProbPercentage)
    })
    .catch(error => {
      // Handle any errors
      console.error('Error fetching get-parking-data:', error);
    });


    await fetch('http://34.93.157.250:8080/getParkingData', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateTime: getCurrentDatetime(),
        carType: "suv"
      }),
    })
    .then(response => response.json())
    .then(response => {
      console.log("updateParkingStats response.......", JSON.stringify(response))
      // Handle the data here
      console.log("/getParkingData", response);

      setSuvCount(response.availableSlots)
    })
    .catch(error => {
      // Handle any errors
      console.error('Error fetching get-parking-data:', error);
    });

    await fetch('http://34.93.157.250:8080/getParkingData', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateTime: getCurrentDatetime(),
        carType: "HatchBack"
      }),
    })
    .then(response => response.json())
    .then(response => {
      console.log("updateParkingStats response.......", JSON.stringify(response))
      // Handle the data here
      console.log("/getParkingData", response);

      sethatchbackCount(response.availableSlots)
    })
    .catch(error => {
      // Handle any errors
      console.error('Error fetching get-parking-data:', error);
    });
  }

  useEffect(() => {
    // registerForPushNotificationsAsync()
    //   .then(token => setExpoPushToken(expoPushToken ?? ''))
    //   .catch((error: any) => setExpoPushToken(getExpoPushToken()));

    firstCall();

    const interval = setInterval( async () => {
      console.log("inside interval")
      let cords = await getLocation();
      moveToLocation(cords?.latitude, cords?.longitude);
    }, MINUTE_MS);

    // const statsChangeMock = setInterval(() => {
    //   setParkingProbability(parkingProbability => parkingProbability - 1);
    //   setSuvCount(suvCount => suvCount - 2);
    //   sethatchbackCount(hatchbackCount => hatchbackCount - 3);
    // }, 10000);

    // console.log("expoPushToken", expoPushToken);
    // console.log("getExpoPushToken", getExpoPushToken())

    

    // sendPushNotification();

    // generateNotification();

    // const test = async () => {
    //   console.log("checking getAllScheduledNotificationsAsync")
    //   let output = await Notifications.getAllScheduledNotificationsAsync();
    //   console.log(output)
    // }
    // test();

    const testParkingData = async () => {
      await updateParkingStats();
    }
    testParkingData();
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

      
      <View style={{
        backgroundColor: "grey",
        height: 120,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        paddingHorizontal: 20
      }}>
 
      <View>
        {/** logo */}
        <Image
            style={styles.logo}
            source={require('@/assets/images/hpark.png')}
          />
      </View>
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
          <View>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: 'white'
          }}>Nitish Kumar</Text>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: 'white'
          }}>Good Afternoon</Text>
          </View>
          <Image
                style={{
                    width: 50,
                    height: 50,
                    borderRadius: 2
                }}
                source={require('@/assets/images/user.jpg')}
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
      <View style={[styles.switchContainer]}>
            <View>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: isSUV ? 'grey' : 'red',
                marginHorizontal:20,
              }}>HatchBack</Text>
            </View>
            <View>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isSUV ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleCarType}
                value={isSUV}
              />
            </View>
            <View>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: isSUV ? 'red' : 'grey',
                marginRight: 20,
                marginLeft: 20
              }}>SUV</Text>
            </View>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  logoContainerLeft: {
    justifyContent: 'center',
    maxWidth: 60
  },
  logoContainerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    height: 110
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
    height: 250,
    padding: 10
  },
  map: {
    width: '100%',
    height: '100%',
  },
  logo: {
    width: 40,
    height: 60,
    marginHorizontal: 20
  },
  switchContainer: {
    flexDirection: 'row',
    marginHorizontal: 40,
    justifyContent: 'center'
  }
});
