/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Button,
  FlatList,
  Dimensions
} from 'react-native';
import RNGooglePlaces from 'react-native-google-places';
import MapView, { Marker, AnimatedRegion, Polyline } from 'react-native-maps';
import haversine from "haversine";


const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE =13.0827;
const LONGITUDE =80.2707;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const GOOGLE_MAPS_APIKEY = 'AIzaSyBNXTgyG9IbaxJ03Jpr89uLH-DKFITEpBk';

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      locationlist: [],
      addressQuery: '',
      predictions: [],
      currentAddress:'',
      destinationPlace:"I'm going to",
      coordinates: [
        {
          latitude:0.0000,
          longitude:0.000,
        },
      ],
      currentAddress:"",
      setmarker: true,
      routeCoordinates: [],
      distanceTravelled: 0,
      prevLatLng: {},
      latitude: LATITUDE,
      longitude: LONGITUDE,
      coordinate: new AnimatedRegion({
        latitude: LATITUDE,
        longitude: LONGITUDE
      })
    };
    this.mapView = null;
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  calcDistance = newLatLng => {
    const { prevLatLng } = this.state;
    return haversine(prevLatLng, newLatLng) || 0;
  };

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  });

  componentWillMount() {

    navigator.geolocation.getCurrentPosition(
      position => {},
      error => alert(error.message),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000
      }
    );
  }

  

  componentDidMount() {
    const { coordinate } = this.state;
    this.fetchAPI();
    this.fetchLocation();

    this.watchID = navigator.geolocation.watchPosition(
      position => {
        const { coordinate, routeCoordinates, distanceTravelled } = this.state;
        const { latitude, longitude } = position.coords;

        const newCoordinate = {
          latitude,
          longitude
        };

        if (Platform.OS === "android") {
          if (this.marker) {
            this.marker._component.animateMarkerToCoordinate(
              newCoordinate,
              500
            );
          }
        } else {
          coordinate.timing(newCoordinate).start();
        }

        this.setState({
          latitude,
          longitude,
          routeCoordinates: routeCoordinates.concat([newCoordinate]),
          distanceTravelled:
            distanceTravelled + this.calcDistance(newCoordinate),
          prevLatLng: newCoordinate
        });
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
    RNGooglePlaces.getCurrentPlace()
    .then((results) => {
      console.log("result",results);
      this.setState({
        currentAddress:results[0].name,
        coordinates: [
          {
            latitude:results[0].latitude ,
            longitude:results[1].longitude,
          },
        ],
      })
    }
   )
    .catch((error) => console.log("erroronGetCurrentPlacePress",error.message));
  }
  //LocationList
fetchAPI(){
  fetch('http://13.58.240.80/locationlist/?latitude=13.0405&longitude=80.2337', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization':'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZmEyYzFkMTFhM2U0M2QxYTBiMTAwMzZmZjQ3ODQzYyIsImV4cCI6MTU0MDY1NTE1M30.ZhSAHiExjl9WmKxB0alHobOSCWinTDqkiaq3psEC20QFjXu3Eejav7IapOr9xh3OvFpUFhYOUZk1UN7kc4hRbg',
    },
})
.then(response => response.json())
  .then((res) =>{
    console.log("data",res.data);
    this.setState({
      locationlist:res.data,
    })   
  } )
  .catch((error) => {
    console.error(error);
  });
}
//PutLocation
fetchLocation(){
  fetch('http://13.58.240.80/location/9cb10f82-df6f-414a-8748-088fa0838f21', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization':'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZmEyYzFkMTFhM2U0M2QxYTBiMTAwMzZmZjQ3ODQzYyIsImV4cCI6MTU0MDY1NTE1M30.ZhSAHiExjl9WmKxB0alHobOSCWinTDqkiaq3psEC20QFjXu3Eejav7IapOr9xh3OvFpUFhYOUZk1UN7kc4hRbg',
    },
   body: JSON.stringify({
      "CurrentlyAvailable": true,
      "LatestLatitude": "13.0405",
      "LatestLongitude": "80.2337",
      "VehicleId":"e9b04fec-ec69-4a4f-b6db-0349e9d0e8e5"
      }),
})
.then(response => response.json())
  .then((res) =>{
    console.log("data",res);
   alert("Location Update");
  } )
  .catch((error) => {
    console.error(error);
  });
  
}
  onOpenPickerPress = () => {
    console.log('picker');
    RNGooglePlaces.openPlacePickerModal({
      country: 'IN',
      type: 'establishment',
      latitude: 13.0827,
      longitude: 80.2707,
      radius: 10
    })
    .then((place) => {
      console.log("pickerplace",place);
      this.setState({destinationPlace:place.name});
    })
    .catch(error => console.log(error.message));
   
  }

  onOpenCurrentPickerPress= () => {
    console.log('picker');
    RNGooglePlaces.openPlacePickerModal({
      country: 'IN',
      type: 'establishment',
      latitude: 13.0827,
      longitude: 80.2707,
      radius: 10
    })
    .then((place) => {
      console.log("pickerplace",place);
      this.setState({currentAddress:place.name});
     this.setStat({
      coordinates: [
        {
          latitude:place.latitude,
          longitude:place.longitude,
        },
      ],
     }) 
    })
    .catch(error => console.log(error.message));
   
  }

  render() {
    console.log(this.state.locationlist.map(p=>[p.Latitude,p.Longitude]))
  
    const map = this.state.locationlist.map(p=>{
      return (
    <MapView.Marker
      coordinate={{
           latitude: parseFloat(p.Latitude),
            longitude:parseFloat(p.Longitude),
      }}
     
      title={p.Name}
      description={p.VehicleId}
     
      image={require('./assets/carMarker.png')}
    />
    )
    })


    return (
      <View style={styles.container}>
       <MapView
        initialRegion={{
          latitude: LATITUDE,
          longitude: LONGITUDE,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showUserLocation
          followUserLocation
          loadingEnabled
          region={this.getMapRegion()}
        style={{ flex: 1 }}>
 
      {this.state.setmarker && this.state.coordinates.map((coordinate, index) =>
          <MapView.Marker key={`coordinate_${index}`} coordinate={coordinate}  
           pinColor="blue"  />
        )}
         {map}
        
        <Polyline coordinates={this.state.routeCoordinates} strokeWidth={5}  />
          <Marker.Animated 
            ref={marker => {
              this.marker = marker;
            }}
            coordinate={this.state.coordinate} />
      </MapView>
        
         <View>
        
          <Text style={{color: '#000000'}}>Choose pick-up location</Text>

          <TouchableOpacity style={styles.inputLauncher} onPress={this.onOpenCurrentPickerPress}>
            <Text style={{color: '#70818A'}}>{this.state.currentAddress}</Text>
          </TouchableOpacity>

          <Text style={{color: '#000000'}}>Choose drop-off location</Text>

          <TouchableOpacity style={styles.inputLauncher} onPress={this.onOpenPickerPress}>
            <Text style={{color: '#70818A'}}>{this.state.destinationPlace}</Text>
          </TouchableOpacity>

          
            <Text style={styles.headline}>
              {parseFloat(this.state.distanceTravelled).toFixed(2)} km
            </Text>
          
        
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    paddingTop: 45
  },
  button: {
    backgroundColor: '#263238',
    flexDirection: 'row',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  buttonText: {
    color: 'white'
  },
  inputLauncher: {
    backgroundColor: '#F3F7F9',
    width: '100%',
    borderRadius: 4,
    height: 35,
    justifyContent: 'center',
    paddingLeft: 10,
    marginBottom: 16
  },
  inputWrapper: {
    backgroundColor: '#F3F7F9',
    width: '100%',
    borderRadius: 2,
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  input: {
    color: '#000',
    height: 35,
    fontSize: 15,
    paddingVertical: 4
  },
  list: {
    marginTop: 16,
    height: Dimensions.get('window').height - 70
  },
  listItemWrapper: {
    backgroundColor: 'transparent',
    height: 56
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%'
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#DAE4E9',
    width: '92%',
    marginHorizontal: 16,
    opacity: 0.6
  },
  primaryText: {
    color: '#222B2F',
    fontSize: 15,
    marginBottom: 3
  },
  placeMeta: {
    flex: 1,
    marginLeft: 15
  },
  secondaryText: {
    color: '#9BABB4',
    fontSize: 13,
  },
  listIcon: {
    width: 25,
    height: 25
  },
 
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  headline: {
    textAlign: 'center', // <-- the magic
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 0,
    width: 200,
    backgroundColor: 'yellow',
  }
});
