const fs = require('fs');
const axios = require ('axios');
const Promise = require('bluebird');

/*
response keys

[ 'ItemID',
  'PrimaryTitleID',
  'ThumbnailPageID',
  'Source',
  'SourceIdentifier',
  'Volume',
  'Year',
  'CopySpecificInformation',
  'HoldingInstitution',
  'RightsHolder',
  'ScanningInstitution',
  'Sponsor',
  'Language',
  'LicenseUrl',
  'Rights',
  'DueDiligence',
  'CopyrightStatus',
  'CopyrightRegion',
  'ExternalUrl',
  'ItemUrl',
  'TitleUrl',
  'ItemThumbUrl',
  'Pages',
  'Parts',
  'Collections' ]
  */

/*var colors=['#61880d','#518312', '#597e17', '#547a1c', '#507521', '#4c7026', '#486b2b', '#446731', '#406236', '#3b5d3b', '#375840', '#61880d', '#335445', '#2f4f4a'];*/

//const {catalogs} = require('./wyPagesSelect.js');

var stateStrg = 'Alabama · Alaska · Arizona · Arkansas · California · Colorado · Connecticut · Delaware · District of Columbia · Florida · Georgia · Hawaii · Idaho · Illinois · Indiana · Iowa · Kansas · Kentucky · Louisiana · Maine · Maryland · Massachusetts · Michigan · Minnesota · Mississippi · Missouri · Montana · Nebraska · Nevada · New Hampshire · New Jersey · New Mexico · New York · North Carolina · North Dakota · Ohio · Oklahoma · Oregon · Pennsylvania · Rhode Island · South Carolina · South Dakota · Tennessee · Texas · Utah · Vermont · Virginia · Washington · West Virginia · Wisconsin · Wyoming';

var states = stateStrg.split(' · ');

const speciesRX = /pine|fir\s|spruce|yew|cedar|juniper|Abies|Pinus|Picea|Taxus|Cedrus|Juniperus/gi;
const statesRX = new RegExp(states.join("|"), 'gi');
//https://www.biodiversitylibrary.org/api2/httpquery.ashx?op=GetItemMetadata&itemid=133806&pages=t&ocr=t&parts=f&apikey=02054668-4bc4-4885-8afb-ca7117ae6cef&format=json

var vaArr=[];

//console.log(catalogs.length, catalogs.filter(item=>item.pages).length)


//-------------------2) this then batch downloads the images---------------------------------
/*
const {catalogs} = require('./paPagesSelect.js'); //53537942

var image=0;
var err =0

catalogs.forEach(item=>{
	if (item.pages!==undefined){

		item.pages.forEach(img=>{
			image ++;
			var address = img.imgSm
			axios({
				  method:'get',
				  url:address,
				  responseType:'stream'
				})
				.then(res=>{
					var name = res.request.path.split('/')[2];
						res.data.pipe(fs.createWriteStream(`../three/bhl/${name}.jpg`))
				})
				.catch(function (error) {
					err++
			    console.log('error', err, error.message);
			  });
		})

	}
})

console.log(image)
*/

//-------------------3) this then reformat---------------------------------


const {catalogs} = require('./wyPagesSelect.js');

// sort by date
catalogs.sort((a, b)=>{
  return a.date - b.date;
});

var master = [];

catalogs.forEach(item=>{

	var obj = Object.assign({}, item);

	delete obj.long;
	delete obj.subjects;
	delete obj.authors;

	obj.states = [];
	obj.trees = [];

	var sto =[];
	var tro = [];


	if (obj.pages){
		var pgAdj = obj.pages.map(pg=>{
			var pgObj = {};
			var st =[];
			var tr =[]

			pgObj.img= pg.imgSm.replace('https://www.biodiversitylibrary.org/pagethumb/', '../bhl/')+'.jpg';
			if (pg.states !== null) {
				pgObj.states = pg.states.filter(state=>{
					var stReg = new RegExp(state, 'gi');
					if (st.indexOf(state)===-1 && !item.place.match(stReg)){
						var stCap = state.split(' ').map(word=> word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
						st.push(stCap);
						return stCap;
					}
				});
			}
			if (pg.trees !== null) {
			pgObj.trees = pg.trees.filter(trees=>{
				if (tr.indexOf(trees.toLowerCase())===-1){
					tr.push(trees.toLowerCase().trim());
					return trees.toLowerCase().trim();
				}
			}).map(trees=>trees.toLowerCase().trim());
			}

			sto = sto.concat(st);
			tro = tro.concat(tr);

			return pgObj;

		})
	}

	obj.pages = pgAdj;

	sto.forEach(state=>{if (obj.states.indexOf(state)=== -1){ obj.states.push(state)} })
	tro.forEach(trees=>{if (obj.trees.indexOf(trees)=== -1){ obj.trees.push(trees)} })
	if (!obj.pages){
		delete obj.states
		delete obj.trees
	}


	master.push(obj);

})

fs.writeFileSync(`./WY.js`, 'var catalogs={Wyoming:'+JSON.stringify(master)+'};');




//-------------------1) run first to select orc matches---------------------------------

/*

const {catalogs} = require(`./wyTest.js`);

var cat = catalogs//.slice(0,2)

cat.forEach(item=>{
	const copy = Object.assign({}, item);

	axios.get(`https://www.biodiversitylibrary.org/api2/httpquery.ashx?op=GetItemMetadata&itemid=${item.itemId}&pages=t&ocr=t&parts=f&apikey=02054668-4bc4-4885-8afb-ca7117ae6cef&format=json`)
	  .then(function (response) {
	      var res = response.data['Result'];
	      var contents = res.Pages;
	      //console.log(contents[35]);

	      var pinePg = contents.filter(page=>{
	      	return (page.PageTypes[0].PageTypeName === 'Title Page' || page.OcrText.match(speciesRX) );
	      }).map(page=>{return {imgSm:page.ThumbnailUrl, trees:page.OcrText.match(speciesRX), states: page.OcrText.match(statesRX)}})
	      //console.log(pinePg, item);
	      if (pinePg.length > 1){
	      	copy.pages = pinePg;
	      }

	      vaArr.push(copy);

	   fs.writeFileSync(`./wyPagesSelect.js`, 'var catalogs='+JSON.stringify(vaArr)+'; module.exports.catalogs = catalogs');
	  })
	  .catch(function (error) {
	    console.log(error);
	  });

})
*/
