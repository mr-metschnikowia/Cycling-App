//use vue component to achiver another feature on same webpage to make structure more clear. 
//https://cn.vuejs.org/v2/guide/components.html (accessed: 03/04/2022)
;(function () {                              
    Vue.component("favourite-route", {
      name: "favouriteRoute",
      template: `
        <div class="fav-wrapper">
          <div class="table-container">
            <table class="table is-striped is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th>userName</th>
                  <th>routeName</th>
                  <th>routeStart</th>
                  <th>routeStop</th>
                  <th>operation</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in favouriteRoute" :key="index">
                  <td>{{item.userName}}</td>
                  <td>{{item.routeName}}</td>
                  <td>{{item.start}}</td>
                  <td>{{item.stop}}</td>
                  <td> <button @click="toView(index)" class="button is-primary">to view on map</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="map-wrapper">
            <ul class="route-list">
              <div class="route-list-item">
                <h2 class="title is-4">Steps </h2>
                <div class="steps-wrapper" v-if="routes && routes[0]">
                  <div class="step" v-for="(step ,stepIndex) in routes[0].legs[0].steps">
                    <p class="step-overview">
                      <span> {{step.distance.text}}</span> 
                      <span> {{step.duration.text}}</span> 
                    </p>
                    <p class="step-detail" v-html="step.instructions"></p>
                  </div>
                </div>
              </div>
            </ul>
            <div id="fav-route-map"></div>
          </div>
        </div>
      `,
      data() {
        return {
          userInfo: null,
          favouriteRoute: [],
          routes:[],
          map: null,
          directionsRenderer: null
        }
      },
      mounted() {
      //get the logged in user infor and userKey from localStorage , init map once the page is opened and display all routes favourited by this user.
        this.getUserInfo()
        this.initMap()
        this.getfavouriteRoute()
      },
      methods: {
        //get all routes favourited by this user from back-end.
        async getfavouriteRoute() {
          try {
            let res = await fetch(
              `/getFavouriteRoutes/${this.userInfo.userName}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Basic " + this.userInfo.userKey //to pass the basic auth authorise, pass the userKey to back-end.
                },
              }
            )
            let statusCode = res.status
            let resData = await res.json()
  
            if (statusCode == "200") {
              this.favouriteRoute = resData
            } else {
              throw new Error(resData.msg)
            }
          } catch (err) {
            alert(err)
          }
        },
        getUserInfo() {
          if (window.localStorage.getItem("userInfo")) {
            this.userInfo = JSON.parse(window.localStorage.getItem("userInfo"))
          } else {
            alert("Please Log in first!")
            window.location.href = "../index/index.html"
          }
        },
        initMap(){
         
          const map = new google.maps.Map(document.getElementById("fav-route-map"), {
            zoom: 16,
            center: { lat: 56.341885, lng: -2.794982 },
          })
          this.map = map
          this.directionsService = new google.maps.DirectionsService()
          this.directionsRenderer = new google.maps.DirectionsRenderer()
          this.directionsRenderer.setMap(map)
        },
        // use index to decide which favourite route is selceted, get the parameters stored in routeDetail
        toView(index){
          let routeParams = JSON.parse( this.favouriteRoute[index].routeDetail)
          this.calculateAndDisplayRoute(routeParams)
        },
        //use these parameters to get google response ,use the response to render the direction line on the map and detailed steps.
        calculateAndDisplayRoute(routeParams) {
          this.directionsService
            .route(routeParams)
            .then((response) => {
              this.routes = response.routes
              this.directionsRenderer.setDirections(response)
            })
            .catch((e) =>
              window.alert("Directions request failed due to " + status)
            )
        }
      }
    })
  })()
  