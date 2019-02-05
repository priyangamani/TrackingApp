import React, { Component } from 'react';
import { TouchableOpacity, View, ActivityIndicator, Text, Alert} from 'react-native';
export default class fetchAPI extends Component {
  constructor(props){
    super(props);
     this.state={
      data:[], 
     } ;
}


componentWillMount() {
  fetch('http://13.58.240.80/locationlist/?latitude=12.9229&longitude=80.1275', {
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
      data:res.data,
    })
    this.props.data=res.data;
    //.then(gists => this.setState({ gists }))
  } )
  .catch((error) => {
    console.error(error);
  });
}








  render(){
  return(
   <View>
    {
      this.state.data.map((value,index) => {
        return (
          <View><Text>{this.state.data}</Text></View>
        )
      })
    }
</View> 
  );
}
}