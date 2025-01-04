class BackendConnector {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.param = ``;
        this.typ = "std";
        this.act = "read";
        this.data = {};
    }

    //-------------------------- This is the section for api calls & response----------------------------
    setData(data) {
        this.data = data;
    }

    // This function will set the URL parameter
    setParam(typ) {
        if (typ == "login") {
            this.typ = "auth";
            this.act = "check";
            this.param = `${this.baseUrl}?typ=${this.typ}&act=${this.act}&c_email=${this.data.email}&c_password=${this.data.password}`;
        } else if (typ == "signup") {
            this.typ = "auth";
            this.act = "create";
            this.param = `${this.baseUrl}?typ=${this.typ}&act=${this.act}&c_email=${this.data.email}&c_password=${this.data.password}&c_name=${this.data.username}`;
        }
        else if (typ == "gtStd") {
            // http://localhost/?typ=std&act=read&api_key=23&c_id=1
            this.typ = "std";
            this.act = "read";
            this.param = `${this.baseUrl}?api_key=${this.get_api_key()}&typ=${this.typ}&act=${this.act}&c_id=${this.get_c_id()}`;
        }
    }

    // This function will fetch the data
    fetchBackend(onSuccess, onError) {
        fetch(this.param)  // Use this.param instead of this.baseUrl
            .then(response => response.json())
            .then(data => {
                if (data.status == "success") {
                    onSuccess(data);
                } else {
                    onError(data);
                }
                // store_login_credintial(data.data);
            })
            .catch(error => {
                onError(error);
            });
    }

    // function to store the api key in the local storage
    store_login_credintial(data, isLogedIn = true) {
        if(isLogedIn==true){
            localStorage.setItem("api_key", data.c_apikey);
            localStorage.setItem("c_id", data.c_id);
        }else{
            localStorage.removeItem("api_key");
            localStorage.removeItem("c_id");
        }
    }

    // This function will get the api Key
    get_api_key() {
        return localStorage.getItem("api_key");
    }
    get_c_id() {
        return localStorage.getItem("c_id");
    }

    // -----------------------------------This is authenticaton section--------------------------------------
    // This function will login the user
    login(email, password, onSuccess, onError) {
        this.data.email = email;
        this.data.password = password;
        this.setParam("login");
        this.fetchBackend(onSuccess, onError);
    }

    // This function will logout the user
    logout(loginPath) {
        this.store_login_credintial("", false);
        window.location.href = loginPath;
    }
    
    // This function will signup the user
    signup(username, email, password, onSuccess, onError) {
        this.data.username = username;
        this.data.email = email;
        this.data.password = password;
        this.setParam("signup");
        this.fetchBackend(onSuccess, onError);
    }

    // function to check if the user is logged in
    is_logged_in(loginPath) {
        let api_key = this.get_api_key();
        if (api_key == null) {
            window.location.href = loginPath;
        }
        return true;
    }


    // -------------------------------- This section is for students ----------------------------------------
    // This function will get all the students
    getStudents(onSuccess, onError) {
        this.setParam("gtStd");
        this.fetchBackend(onSuccess, onError);
    }

}

let api_url = "http://localhost/";
let backend = new BackendConnector(api_url);


