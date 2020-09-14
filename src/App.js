import React from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import './App.css';

const apiKey = process.env.REACT_APP_API_KEY;

const InputForm = props => {
  return (
    <div>
      <form onSubmit={props.handleSubmit}>
      <label htmlFor="ipinput">
        Ip address or Domain name
      </label>
      <input 
        type="text" 
        value={props.inputValue} 
        onChange={props.handleChange}
        id="ipinput"
        name="ipinput"
        placeholder="Enter IP address or domain"
      />
      <button type="submit" aria-label="submit button"></button>
      </form>
    </div>
  );
};

const AddressProp = props => {
  return (
    <div className="address-property">
      <h2>{props.addressProp}</h2>
      <p>{props.addressValue}</p>
    </div>
  );
};

const AddressDisplay = props => {
  return (
    <div className="address-display-container">
    <div className="address-display">
      <AddressProp 
        addressProp="Ip Address"
        addressValue={props.ip ? props.ip : "..."}
      />
      <hr></hr>
      <AddressProp 
        addressProp="Location"
        addressValue={props.location ? props.location : "..."}
      />
      <hr></hr>
      <AddressProp 
        addressProp="Timezone"
        addressValue={props.timezone ? ("UTC" + props.timezone) : "..."}
      />
      <hr></hr>
      <AddressProp 
        addressProp="Isp"
        addressValue={props.isp ? props.isp : "..."}
      />
    </div>
    </div>
  );
}

const DisplayMap = props => {
  if(props.latitude && props.longitude) {
    const position = [props.latitude, props.longitude];
    return (
      <div className="map-wrapper">
        <div className="map">
          <Map center={position} zoom={13} zoomControl={false}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <Marker position={position}>
              <Popup>Location</Popup>
            </Marker>
          </Map>
        </div>
      </div>
    );
  } else {
    return (
      <div className="map">
        <div></div>
      </div>
    );
  }
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      location: null,
      ip: null,
      isp: null,
      timezone: null,
      latitude: null,
      longitude: null,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateAddress = this.updateAddress.bind(this);

  }

  handleChange(event) {
    this.setState({inputValue: event.target.value});
  }
  
  updateAddress(address) {
    var location = address.location.city + ", " + address.location.region + " " + address.location.postalCode;
      this.setState({
        location: location,
        ip: address.ip,
        isp: address.isp,
        timezone: address.location.timezone,
        latitude: address.location.lat,
        longitude: address.location.lng,
    });
  }

  handleSubmit(event) {
    const updateAddress = address => {
      this.updateAddress(address);
    };
    var input = this.state.inputValue;
    if(input) {
      // test whether input is ip or domain
      var domainRegex = /^[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,}$/i;
      var ip4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      var domain, ipAddress;
      if(domainRegex.test(input)) {
        // set the domain request variable before the api fetch
        domain = input;
      } else {
        if(ip4Regex.test(input)) {
          // set the ipaddress request variable before the api call
          ipAddress = input;
        }
      }

      // perform APi call to get address detail
      const locationRequest = new XMLHttpRequest();
      var url = "https://geo.ipify.org/api/v1?apiKey=" + apiKey;
      locationRequest.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200) {
          // update address property of app state
          updateAddress({...(JSON.parse(this.responseText))});
        }
      }
      locationRequest.open(
        "GET", 
          url + (domain ? ("&domain=" + domain) : "") + (ipAddress ? ("&ipAddress=" + ipAddress) : ""),
          true);
      locationRequest.send();
    }
    event.preventDefault();
  }

  render() {
    return (
      <div className="App">
        <header>
          <h1 className="title">IP Address Tracker</h1>
          <InputForm 
            handleSubmit={this.handleSubmit}
            inputValue={this.state.inputValue}
            handleChange={this.handleChange}
          />
        </header>
        <main>
          <AddressDisplay 
            ip={this.state.ip}
            location={this.state.location}
            isp={this.state.isp}
            timezone={this.state.timezone}
          />
          <DisplayMap 
            latitude={this.state.latitude}
            longitude={this.state.longitude}
          />
        </main>
      </div>
    );
  }

  componentDidMount() {
    const updateAddress = address => {
      this.updateAddress(address);
    };
    // perform API  call without specifying the domain and ipaddress
      const locationRequest = new XMLHttpRequest();
      locationRequest.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200) {
          // update address property of app state
          updateAddress({...(JSON.parse(this.responseText))});
        }
      }

      var url = "https://geo.ipify.org/api/v1?apiKey=" + apiKey;
      
      locationRequest.open("GET", url, true);
      locationRequest.send();
  }
}

export default App;
