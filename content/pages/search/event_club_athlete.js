if(document.getElementById("club")){
    new Vue({
        el: '#club',
        data: {
            clubs: [],
            keyword: '',
            userInfo: null
        },
        mounted() {
            this.getUserInfo()
            this.search()
        },
        methods: {
            toLogout() {
                window.localStorage.removeItem("userInfo")
                window.location.href = "../index/index.html"
              },
            getUserInfo() {
                if (window.localStorage.getItem("userInfo")) {
                  this.userInfo = JSON.parse(window.localStorage.getItem("userInfo"))
                } else {
                  alert("Please Log in first!")
                  window.location.href = "../index/index.html"
                }
              },
            search(e) {
                if (e)
                    e.preventDefault();

                let clubName = this.keyword == "" ? "NA" : this.keyword;
                // grab clubname from input box, if no input yet, clubname == "NA"

                let url = '/clubs/' + clubName;
                // create URL using user input 

                fetch(url, { 
                    method: "GET",
                    headers: {
                        "Authorization": "Basic " + this.userInfo.userKey
                    }
                })
                    .then(resp => resp.json())
                    .then((data) => {
                        this.clubs = data
                    })
            },

            async join(club) {
                // fetch('clubs', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ event })
                // })

                let outerText = event.currentTarget.parentElement.outerText;
                // grabs outerText property of parent of button, where value == club name
                let outerTextArray = outerText.split("\n");
                let clubName = outerTextArray[0];
                // gets rid of junk from outerText
                // stirng.split(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split (accessed: 06/04/2022)
                // Node.parentElement: https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement (accessed: 06/04/2022)

                let data = {
                    clubName: clubName,
                    userName: this.userInfo.userName
                }
                // creates JSON object to be inserted into database

                try {
                    let res = await fetch(
                      '/joinClub',
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": "Basic " + this.userInfo.userKey 
                        },
                        body: JSON.stringify(data)
                      }
                    )
                    let statusCode = res.status
                    let resData = await res.json()
          
                    if (statusCode == "200") {
                        alert(resData.msg)
                    } else {
                      throw new Error(resData.msg)
                    }
                  } catch (err) {
                    alert(err)
                  }
            }



            // join(club) {
            //     fetch('/clubs', {
            //         method: 'POST',
            //         headers: { 'Content-Type': 'application/json' },
            //         body: JSON.stringify({ club })
            //     })
            // }
        },
    })
}else if(document.getElementById("athlete")){
    new Vue({
        el: '#athlete',
        data: {
            athletes: [],
            name: '',
            gender: '',
            country: '',
            userInfo: null
    
        },
        mounted() {
            this.getUserInfo()
            this.search()
        },
        methods: {
            toLogout() {
                window.localStorage.removeItem("userInfo")
                window.location.href = "../index/index.html"
              },
            getUserInfo() {
                if (window.localStorage.getItem("userInfo")) {
                  this.userInfo = JSON.parse(window.localStorage.getItem("userInfo"))
                } else {
                  alert("Please Log in first!")
                  window.location.href = "../index/index.html"
                }
              },
            search(e) {
                if (e)
                    e.preventDefault();
                // const params = new URLSearchParams({
                //     country: this.country,
                //     gender: this.gender,
                //     name: this.name,
                // });
    
                // // let url = '/athletes?' + params.toString()
                // let url = '/pages/index/data/athletes.json?' + params.toString()
    
                // fetch(url)
                //     .then(resp => resp.json())
                //     .then((data) => {
                //         this.athletes = data
                //     })

                let searchQuery = { name: this.name, country: this.country, gender: this.gender };
                // create JSON search query based on user inputs 

                fetch("/athletes", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', "Authorization": "Basic " + this.userInfo.userKey },
                    body: JSON.stringify(searchQuery)
                })
                    .then(resp => resp.json())
                    .then((data) => {
                        this.athletes = data
                    })








            },


            async subscribe(athlete) {

                let outerText = event.currentTarget.parentElement.outerText;
                let outerTextArray = outerText.split("\n");
                let athleteName = outerTextArray[0];
                // grab athlete name from outerText of button parent

                let data = {
                    athleteName: athleteName,
                    userName: this.userInfo.userName
                }
                // compile JSON object to be inserted into database 

                try {
                    let res = await fetch(
                      '/subscribe',
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": "Basic " + this.userInfo.userKey 
                        },
                        body: JSON.stringify(data)
                      }
                    )
                    let statusCode = res.status
                    let resData = await res.json()
          
                    if (statusCode == "200") {
                        alert(resData.msg)
                    } else {
                      throw new Error(resData.msg)
                    }
                  } catch (err) {
                    alert(err)
                  }
            }

            // subscribe(athlete) {
            //     fetch('/athletes', {
            //         method: 'POST',
            //         headers: { 'Content-Type': 'application/json' },
            //         body: JSON.stringify({ athlete })
            //     })
            // }
        },
    })
}else if(document.getElementById("event")){
    new Vue({
        el: '#event',
        data: {
            events: [],
            name: '',
            distance: '',
            region: '',
            userInfo: null
    
        },
        mounted() {
            this.getUserInfo()
            this.search()
        },
        methods: {
            toLogout() {
                window.localStorage.removeItem("userInfo")
                window.location.href = "../index/index.html"
              },
            getUserInfo() {
                if (window.localStorage.getItem("userInfo")) {
                  this.userInfo = JSON.parse(window.localStorage.getItem("userInfo"))
                } else {
                  alert("Please Log in first!")
                  window.location.href = "../index/index.html"
                }
              },



            search(e) {
                if (e)
                    e.preventDefault();

                let searchQuery = { region: this.region, distance: this.distance, name: this.name };
                // create JSON search query based on user input 
              
                fetch('/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', "Authorization": "Basic " + this.userInfo.userKey },
                    body: JSON.stringify(searchQuery)
                })
                    .then(resp => resp.json())
                    .then((data) => {
                        this.events = data
                    })

                
                // const params = new URLSearchParams({
                //     region: this.region,
                //     distance: this.distance,
                //     name: this.name,
                // });
    
                // // let url = '/events?' + params.toString()
                // let url = '/pages/index/data/events.json?' + params.toString()
    
                // fetch(url)
                //     .then(resp => resp.json())
                //     .then((data) => {
                //         this.events = data
                //     })
           

            },

            async join(event) {
                let outerText = event.currentTarget.parentElement.outerText;
                let outerTextArray = outerText.split("\n");
                let eventName = outerTextArray[0];
                // grab even details from outerText of button parent 

                let data = {
                    eventName: eventName,
                    userName: this.userInfo.userName
                }
                // compile JSON object to be inserted into database 

                try {
                    let res = await fetch(
                      '/joinEvent',
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": "Basic " + this.userInfo.userKey 
                        },
                        body: JSON.stringify(data)
                      }
                    )
                    let statusCode = res.status
                    let resData = await res.json()
          
                    if (statusCode == "200") {
                        alert(resData.msg)
                    } else {
                      throw new Error(resData.msg)
                    }
                  } catch (err) {
                    alert(err)
                  }
            }
        },
    })
}
