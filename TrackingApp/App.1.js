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
  FlatList,
  Dimensions
} from 'react-native';
import RNGooglePlaces from 'react-native-google-places';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import fetchAPi from './fetchiAPI';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 13.0827;
const LONGITUDE = 80.2707;

const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const GOOGLE_MAPS_APIKEY = 'AIzaSyAxG3TGex2EO7WDXjrC6gfb4wumx7CP1PI';

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      showInput: false,
      addressQuery: '',
      predictions: [],
      currentAddress:'',
      destinationPlace:"I'm going to",
      coordinates: [
        {
          latitude:  13.067439,
          longitude:80.005172,
        },
        {
          latitude: 13.067439,
          longitude:80.237617,
        },
      ],
    };
    this.mapView = null;
  }



  componentWillMount() {
    RNGooglePlaces.getCurrentPlace()
    .then((results) => {
      console.log("result",results);
      this.setState({
        currentAddress:results[0].name,
      })
    }
   )
    .catch((error) => console.log("erroronGetCurrentPlacePress",error.message));
   
  }

  onMapPress = (e) => {
    this.setState({
      coordinates: [
        ...this.state.coordinates,
        e.nativeEvent.coordinate,
      ],
    });
  }

  onShowInputPress = () => {
    console.log('show input');
    this.setState({showInput: true});
  }

  onOpenPickerPress = () => {
    console.log('picker');
    RNGooglePlaces.openPlacePickerModal({
      country: 'IN',
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
    })
    .then((place) => {
      console.log("pickerplace",place);
      this.setState({currentAddress:place.name});
    })
    .catch(error => console.log(error.message));
   
  }

  onOpenAutocompletePress = () => {
    RNGooglePlaces.openAutocompleteModal({
      country: 'IN',
    })
    .then((place) => {
		  console.log("openAutoComplete",place);
    })
    .catch(error => console.log(error.message));
  }



  onSelectSuggestion(placeID) {
    console.log("placeid",placeID);
    // getPlaceByID call here
    RNGooglePlaces.lookUpPlaceByID(placeID)
    .then((results) => console.log(results))
    .catch((error) => console.log(error.message));

    this.setState({
      showInput: false,
      predictions: []
    });
  }

  keyExtractor = item => item.placeID;

  renderItem = ({ item }) => {
    return (
      <View style={styles.listItemWrapper}>
          <TouchableOpacity style={styles.listItem}
              onPress={() => this.onSelectSuggestion(item.placeID)}>
              <View style={styles.avatar}>
                <Image style={styles.listIcon} source={require('./assets/icon-home.png')}/>
              </View>
              <View style={styles.placeMeta}>
                  <Text style={styles.primaryText}>{item.primaryText}</Text>
                  <Text style={styles.secondaryText}>{item.secondaryText}</Text>
              </View>
          </TouchableOpacity>
          <View style={styles.divider} />
      </View>
    );
  }

  

  render() {
    
    return (
      <View style={styles.container}>
       <MapView
        initialRegion={{
          latitude: LATITUDE,
          longitude: LONGITUDE,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        style={StyleSheet.absoluteFill}
        ref={c => this.mapView = c}
        onPress={this.onMapPress}
      >
        {this.state.coordinates.map((coordinate, index) =>
          <MapView.Marker key={`coordinate_${index}`} coordinate={coordinate}   title="Title"
          description="description"   image={require('./assets/carMarker.png')}/>
        )}
        {(this.state.coordinates.length >= 2) && (
          <MapViewDirections
            origin={this.state.coordinates[0]}
            waypoints={ (this.state.coordinates.length > 2) ? this.state.coordinates.slice(1, -1): null}
            destination={this.state.coordinates[this.state.coordinates.length-1]}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor="hotpink"
            onStart={(params) => {
              console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
            }}
            onReady={(result) => {
              this.mapView.fitToCoordinates(result.coordinates, {
                edgePadding: {
                  right: (width / 20),
                  bottom: (height / 20),
                  left: (width / 20),
                  top: (height / 20),
                }
              });
            }}
            onError={(errorMessage) => {
              // console.log('GOT AN ERROR');
            }}
          />
        )}
      </MapView>
        
        {!this.state.showInput && <View>
        
          <Text style={{color: '#000000'}}>Current Location</Text>
        
          <TouchableOpacity style={styles.inputLauncher} onPress={this.onOpenCurrentPickerPress}>
            <Text style={{color: '#70818A'}}>{this.state.currentAddress}</Text>
          </TouchableOpacity>

          <Text style={{color: '#000000'}}>Destination</Text>

          <TouchableOpacity style={styles.inputLauncher} onPress={this.onOpenPickerPress}>
            <Text style={{color: '#70818A'}}>{this.state.destinationPlace}</Text>
          </TouchableOpacity>


          
        </View>}
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
    color: '#222B2F',
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
  }
});
