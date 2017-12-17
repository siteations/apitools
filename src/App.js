import React, { Component } from 'react';
import './App.css';
import './css/bootstrap.css';
import './css/font-awesome.css';

import axios from 'axios';

class App extends Component {
  constructor(props) {
   super(props);
   this.state = {
    collections: [],
    collectIds: [],
   };
 }

// 'https://www.biodiversitylibrary.org/api2/httpquery.ashx?op=GetSubjectTitles&subject=seeds&apikey=02054668-4bc4-4885-8afb-ca7117ae6cef&format=json'
// 'https://www.biodiversitylibrary.org/api2/httpquery.ashx?op=GetCollections&apikey=02054668-4bc4-4885-8afb-ca7117ae6cef&format=json'

//85242

  componentDidMount() {
    const here = this;
    // axios.get('https://www.biodiversitylibrary.org/api2/httpquery.ashx?op=GetCollections&apikey=02054668-4bc4-4885-8afb-ca7117ae6cef&format=json')
    //   .then(function (response) {
    //       var collections = response.data['Result'].map(item=>item.CollectionName);
    //       var collectIds = response.data['Result'].map(item=>item.CollectionID);
    //       here.setState({collections:collections, collectIds: collectIds});
    //       console.log(here, here.state);
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });
    axios.get('https://www.biodiversitylibrary.org/api2/httpquery.ashx?op=GetAuthorTitles&creatorid=85242&apikey=02054668-4bc4-4885-8afb-ca7117ae6cef&format=json')
      .then(function (response) {
          var collections = response.data['Result'].map(item=>item.FullTitle);
          var collectIds = response.data['Result'].map(item=>item.TitleID);
          here.setState({collections:collections, collectIds: collectIds});
          console.log(response.data['Result']);
      })
      .catch(function (error) {
        console.log(error);
      });
  }



  render() {
    return (
      <div className="App">
        {this.state.collections.length>0 &&
          this.state.collections.map(item=>{
            return <div>{item}</div>
          })

        }
      </div>
    );
  }
}

export default App;
