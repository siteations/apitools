const fs = require('fs');
const axios = require ('axios');
const Promise = require('bluebird');

//const {catalogs} = require(`./catalogList.js`);

// axios.get('https://www.biodiversitylibrary.org/api2/httpquery.ashx?op=GetAuthorTitles&creatorid=85242&apikey=02054668-4bc4-4885-8afb-ca7117ae6cef&format=json')
//   .then(function (response) {
//       var res = response.data['Result'];
//       var cats = res.map(item=>{
//         return {
//           id: item.TitleID,
//           long: item.FullTitle,
//           title: item.ShortTitle,
//           url: item.TitleUrl
//         }
//       })
//       // var collections = response.data['Result'].map(item=>item.FullTitle);
//       // var collectIds = response.data['Result'].map(item=>item.TitleID);
//       // here.setState({collections:collections, collectIds: collectIds});

//       //fs.writeFileSync(`./catalogList.js`, 'var catalogs='+JSON.stringify(cats)+'; module.exports.catalogs = catalogs');
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

// axios.get('https://www.biodiversitylibrary.org/api2/httpquery.ashx?op=GetItemMetadata&itemid=16800&pages=f&ocr=f&parts=f&apikey=02054668-4bc4-4885-8afb-ca7117ae6cef&format=json')
//   .then(function (response) {
//       var res = response.data['Result'];
//       console.log(res);
//       // var collections = response.data['Result'].map(item=>item.FullTitle);
//       // var collectIds = response.data['Result'].map(item=>item.TitleID);
//       // here.setState({collections:collections, collectIds: collectIds});

//       //fs.writeFileSync(`./catalogList.js`, 'var catalogs='+JSON.stringify(cats)+'; module.exports.catalogs = catalogs');
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

//---------------------ADD METADATA FOR TITLES-------------in advance of pages images, orc links------------------------------

/*
var files = [];
console.log(catalogs.length);
var s =20000;
var e = 24000;
var catCount = e-s;
var short = catalogs.slice(s,e); //0-4000, 4000-8000, 8000-12000

short.forEach((items, i)=>{
  axios.get(`https://www.biodiversitylibrary.org/api2/httpquery.ashx?op=GetTitleMetadata&titleid=${items.id}&items=f&apikey=02054668-4bc4-4885-8afb-ca7117ae6cef&format=json`)
    .then(function (response) {
        var res = [response.data['Result']];
        var cats = res.map(item=>{
          return {
            id: item.TitleID,
            long: item.FullTitle,
            title: item.ShortTitle,
            url: item.TitleUrl,
            place: item.PublisherPlace,
            date: item.PublicationDate,
            authors: item['Authors'].map(aut=>aut.Name),
            subjects: item['Subjects'].map(sub=>sub.SubjectText)
          }
        })

        files.push(cats);
        console.log(files.length);

        if (i === catCount-1){
          fs.writeFileSync(`./catalogListFull-5.js`, 'var catalogs='+JSON.stringify(files)+'; module.exports.catalogs = catalogs');
        }
        //fs.writeFileSync(`./catalogList.js`, 'var catalogs='+JSON.stringify(cats)+'; module.exports.catalogs = catalogs');
    })
    .catch(function (error) {
      //console.log(error);
    });

})
*/

//----------------------composite and map series into a master list-----------------------------
/*

const {catalogs0} = require(`./catalogListFull-0.js`);
const {catalogs1} = require(`./catalogListFull-1.js`);
const {catalogs2} = require(`./catalogListFull-2.js`);
const {catalogs3} = require(`./catalogListFull-3.js`);
const {catalogs4} = require(`./catalogListFull-4.js`);
const {catalogs5} = require(`./catalogListFull-5.js`);
const {catalogs6} = require(`./catalogListFull-6.js`);
const {catalogs7} = require(`./catalogListFull-7.js`);
const {catalogs8} = require(`./catalogListFull-8.js`);

var master = catalogs0.concat(catalogs1,catalogs2, catalogs3, catalogs4, catalogs5, catalogs6, catalogs7, catalogs8);

var catalogMaster = master.map(item=>item[0]).filter(item=>(item.date !== '' && item.date !== null && item.place !== '' && item.place !== null));

    catalogMaster = catalogMaster.map(item=>{
      var date = item.date.replace('.', '').replace('circa', '').replace('c', '').replace('[', '').replace(']', '');
      var place = item.place.replace(' :', '');

      item.date = date.trim();
      item.place = place.trim();

      return item;

    })

var date = [];
var place =[];

catalogMaster.forEach(item=>{
  if (date.indexOf(item.date)===-1){
    date.push(item.date)
  }

  if (place.indexOf(item.place)===-1){
    place.push(item.place)
  }

})

date.sort()
place = place.sort().map(item=>[item])

// fs.writeFileSync(`./catalogListFull.js`, 'var catalogs='+JSON.stringify(catalogMaster)+'; module.exports.catalogs = catalogs');
// fs.writeFileSync(`./catalogDate.js`, 'var date='+JSON.stringify(date)+'; module.exports.date = date');
// fs.writeFileSync(`./catalogPlace.js`, 'var place='+JSON.stringify(place)+'; module.exports.place = place');


console.log(date, place, catalogMaster.length, master.length, catalogs0.length);
*/



const {catalogs} = require(`./catalogListFull.js`);
const {place} = require(`./catalogPlaceAbbrev.js`);

var elem = []

var master = catalogs.map(item=>{
    const copy = Object.assign({}, item);

    var location = ''

    console.log('initial', item.place);

    for (var key in place){
      location = item.place+" "
      if (location.includes(key+" ")){
        location = location.replace(key, place[key])
        copy.place = location.trim();
        console.log(copy.place, location);
      }

    }



    copy.place = copy.place.replace('[','').replace(']','');

    console.log('revised', copy.place);

    // if (place[location]){
    //   loc[1]=place[location];
    //   var corrected = loc.join(', ');
    //   item.place = corrected;
    // }

    if (elem.indexOf(copy.place)===-1){elem.push(copy.place)}

    return item
})

elem.sort();

fs.writeFileSync(`./catalogPlace.js`, 'var place='+JSON.stringify(elem)+'; module.exports.place = place');

