var index = new Vue({
  el: "#index-app",
  data: {
    userName: undefined,
    password: undefined,
    country: undefined,
    gender: undefined,
    city:undefined,

    userInfo:{
      userName: "",
      userKey: ""
    },

    showLogin: false,
    showRegister: false,
  },
  
  methods: {
    //show and hide the login/regiseter dialog box.
    toShowLogin() {
      this.showLogin = true
    },
    toShowRegister() {
      this.showRegister = true
    },
    toHiddenLogin() {
      this.userName = ""
      this.password = ""
      this.showLogin = false
    },
    toHiddenRegister() {
      this.userName = ""
      this.password = ""
      this.showRegister = false
    },
    //navigate buttons to other pages.
    toRides(){
      window.location.href = "../ride_feature/rides.html"
    },
    toSearch(){
      window.location.href = "../search/events.html"
    },
    toRoutePlanner(){
      window.location.href = "../routePlanner/routePlanner.html"
    },
    //once logout, clean the userinfo stored in localStorage. Log in button will show again due to the missing of userKey.
    toLogout(){
      window.localStorage.removeItem("userInfo")
      this.userInfo = null
      window.location.href = "./index.html"
      
    },
    //pass userName and password to back-end.
    async toLogin() {
      try{
        let res = await fetch("/login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName:this.userName, password:this.password }), 
        })
        
        let statusCode = res.status
        let resData = await res.json()
        if(statusCode == '200'){
          alert(resData.msg)
          //once log in successfully, generate a encrypted userKey as the credential of logged in user.
          //and store in localStorage for other pages to get.
          this.userInfo ={
            userName : resData.userName,
            userKey:this.generateUserKey(resData.userName, resData.password)
          }
          window.localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        }else{
          throw new Error(resData.msg)
        }
      }catch(err){
        alert(err)
      }finally{
        this.toHiddenLogin()
        

      }
    },
     //pass register information to back-end.
    async toRegister() {
      try{
        let res = await fetch("/register/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            userName:this.userName, 
            password:this.password,
            country:this.country,
            city:this.city,
            gender:this.gender,
           })
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
      } finally{
        this.toHiddenRegister()
      }
    },
//generate a encrypted userKey using userName and password as the credential of logged in user.
    generateUserKey(userName, password){
      return  btoa(userName + ":" + password)
    }
  }
})