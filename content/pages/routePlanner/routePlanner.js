//google maps javascript API tutorial  https://developers.google.com/maps/documentation/javascript (accessed: 01/04/2022)
  var app = new Vue({
    el: "#app",
    data: {
      message: "Welcome to Online Cyclist Platform",
      userInfo: null,
      menus: [
        {
          icon: "icon-luxian",
          text: "routes",
          actived: true,
        },
        {
          icon: "icon-shoucang",
          text: "Fav routes",
          actived: false,
        },
        
      ],
      map: null,
      directionsService:null,
      directionsRenderer:null,
      startPlace: null,
      endPlace: null,
      routes:[],
      routeParams: null
    },
    //use v-if to switch the two features 
    computed: {
      activedMenu() {
        return this.menus.filter((menu) => menu.actived == true)[0].text
      },
    },
    //get the logged in user infor and userKey from localStorage and init map once the page is opened.
    mounted() {
      this.getUserInfo()
      this.initMap()
    },
    methods: {
      getUserInfo() {
        if (window.localStorage.getItem("userInfo")) {
          this.userInfo = JSON.parse(window.localStorage.getItem("userInfo"))
        } else {
          alert("Please Log in first!")
          window.location.href = "../index/index.html"
        }
      },
      toLogout() {
        window.localStorage.removeItem("userInfo")
        window.location.href = "../index/index.html"
      },

      changeMenu(index) {
        this.menus.forEach((menu) => {
          menu.actived = false
        })
        this.menus[index].actived = true
      },
      initMap() {
        //let google map takes over div container.
        const map = new google.maps.Map(document.getElementById("container"), {
          zoom: 16,
          center: { lat: 56.341885, lng: -2.794982 },
        })
        this.map = map
        this.directionsService = new google.maps.DirectionsService()
        this.directionsRenderer = new google.maps.DirectionsRenderer()
        this.directionsRenderer.setMap(map)
        //let google takes over the search bars.
        this.placeSearch("start-point")
        this.placeSearch("end-point")
      },
      //store the place_id derived from google search bars , get response and render on map and steps.
      handleConfirm(){
        let startPlaceId = this.startPlace.place_id
        let endPlaceId = this.endPlace.place_id
        this.calculateAndDisplayRoute(this.directionsService, this.directionsRenderer, startPlaceId, endPlaceId)
      },
      placeSearch(inputId) {

        const searchBox = new google.maps.places.SearchBox( document.getElementById(inputId))
        this.map.addListener("bounds_changed", () => {
          searchBox.setBounds(this.map.getBounds())
        })
        let markers = []
        searchBox.addListener("places_changed", () => {
          const places = searchBox.getPlaces()
          console.log(places)
          if (places.length == 0) {
            return
          }
          // google API always only give me one route, so only need places[0].
          if(inputId == 'start-point'){
            this.startPlace = places[0]
          }
          if(inputId == 'end-point'){
            this.endPlace = places[0]
          }
          // Clear out the old markers.
          markers.forEach((marker) => {
            marker.setMap(null)
          })
          markers = []

          // For each place, get the icon, name and location.
          const bounds = new google.maps.LatLngBounds()

          places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
              console.log("Returned place contains no geometry")
              return
            }
            const icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25),
            }

            // Create a marker for each place.
            markers.push(
              new google.maps.Marker({
                map: this.map,
                icon,
                title: place.name,
                position: place.geometry.location,
              })
            )
            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport)
            } else {
              bounds.extend(place.geometry.location)
            }
          })
          this.map.fitBounds(bounds)
        })
      },
      //use these parameters to get google response ,use the response to render the direction line on the map and detailed steps.
      calculateAndDisplayRoute(directionsService, directionsRenderer,startPlaceId, endPlaceId) {
        let routeParams = {
          origin: { placeId: startPlaceId } ,
          destination:{ placeId: endPlaceId },
          travelMode: google.maps.TravelMode["BICYCLING"],
        }
        directionsService
          .route(routeParams)
          .then((response) => {
            
            directionsRenderer.setDirections(response)
            this.routes = response.routes
            //to make it eaiser to favourite and send to database, store  current  parameters 
            this.routeParams = JSON.stringify(routeParams) 
           
            
          })
          .catch((e) =>
            window.alert("Directions request failed due to " + status)
          )

      
      }, //favourite this route and pass relavent data of this route to back-end.
      async handleFavourite(){
        let prompt =  window.prompt("route name")
        let data = {
          userName: this.userInfo.userName,
          routeName: prompt,
          routeStart: this.startPlace.name,
          routeStop: this.endPlace.name,
          routeDetail: this.routeParams
        }
        console.log(data)
        
        try{
          let res = await fetch("/favouriteRoute/", {
            method: "POST",
            headers: { "Content-Type": "application/json",  
                        Authorization: "Basic " + this.userInfo.userKey }, //to pass the basic auth authorise, pass the userKey to back-end.
            body: JSON.stringify(data),
          })
          let statusCode = res.status
          let resData = await res.json()
  
          if(statusCode == '200'){
            alert(resData.msg)
            
          }else{
            throw new Error(resData.msg)
          }
        }catch(err){
          alert(err)
        }
      }
    },
  })

