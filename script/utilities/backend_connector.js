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
        }else if(typ == "upCred"){
            this.typ = "auth";
            this.act = "update";
            this.param = `${this.baseUrl}?typ=${this.typ}&act=${this.act}&c_id=${this.get_c_id()}&c_name=${this.data.c_name}&n_password=${this.data.n_password}&o_password=${this.data.o_password}`;
        } else if (typ == "gtStd") {
            // http://localhost/?typ=std&act=read&api_key=23&c_id=1
            this.typ = "std";
            this.act = "read";
            this.param = `${this.baseUrl}?api_key=${this.get_api_key()}&typ=${this.typ}&act=${this.act}&c_id=${this.get_c_id()}`;
        } else if (typ == "setStd") {
            // http://localhost/?typ=std&act=create&api_key=23&c_id=1&std_name=John&std_contact=123456789&std_email=john%40gmail.com&std_dob=2021-09-09
            this.typ = "std";
            this.act = "write";
            this.param = `${this.baseUrl}?api_key=${this.get_api_key()}&typ=${this.typ}&act=${this.act}&c_id=${this.get_c_id()}&s_name=${this.data.name}&s_contact=${this.data.contact}&s_email=${this.data.email}&s_dob=${this.data.dob}&fingerprint_id=${this.data.finger}&s_gender=${this.data.gender}`;
        } else if (typ == "srchStd") {
            // http://localhost/?typ=std&act=search&api_key=23&c_id=1&query=John
            this.typ = "std";
            this.act = "search";
            this.param = `${this.baseUrl}?api_key=${this.get_api_key()}&typ=${this.typ}&act=${this.act}&c_id=${this.get_c_id()}&q=${this.data.query}`;
        } else if (typ == "delStd") {
            // http://localhost/?typ=std&act=delete&api_key=23&c_id=1&s_id=1
            this.typ = "std";
            this.act = "delete";
            this.param = `${this.baseUrl}?api_key=${this.get_api_key()}&typ=${this.typ}&act=${this.act}&c_id=${this.get_c_id()}&s_id=${this.data.s_id}`;
        } else if (typ == "upStd") {
            // http://localhost/?typ=std&act=update&api_key=23&c_id=1&s_id=1&s_name=John&s_contact=123456789&s_email=john%40gmail.com&s_dob=2021-09-09
            this.typ = "std";
            this.act = "update";
            this.param = `${this.baseUrl}?api_key=${this.get_api_key()}&typ=${this.typ}&act=${this.act}&c_id=${this.get_c_id()}&s_id=${this.data.s_id}&s_name=${this.data.name}&s_contact=${this.data.contact}&s_email=${this.data.email}&s_dob=${this.data.dob}&fingerprint_id=${this.data.finger}&s_gender=${this.data.gender}`;
        } else if (typ == "gtAtt") {
            // http://localhost/?typ=att&act=read&api_key=23&c_id=1
            this.typ = "attend";
            this.act = "read";
            this.param = `${this.baseUrl}?api_key=${this.get_api_key()}&typ=${this.typ}&act=${this.act}&c_id=${this.get_c_id()}`;
        } else if (typ == "stAtt") {
            this.typ = "attend";
            this.act = "write";
            this.param = `${this.baseUrl}?api_key=${this.get_api_key()}&typ=${this.typ}&act=${this.act}&c_id=${this.get_c_id()}&s_id=${this.data.s_id}&a_status=${this.data.a_status}`;
        } else if (typ == "upAtt") {
            this.typ = "attend";
            this.act = "update";
            this.param = `${this.baseUrl}?api_key=${this.get_api_key()}&typ=${this.typ}&act=${this.act}&c_id=${this.get_c_id()}&s_id=${this.data.s_id}&a_id=${this.data.a_id}&a_status=${this.data.a_status}`;
        }else if(typ == "enrollFP"){
            this.typ = "fingerprint";
            this.act = "enroll";
            this.param = `${this.baseUrl}?api_key=${this.get_api_key()}&typ=${this.typ}&act=${this.act}&c_id=${this.get_c_id()}&s_id=${this.data.s_id}`;
        }else if(typ == "delFP"){
            this.typ = "fingerprint";
            this.act = "delete";
            this.param = `${this.baseUrl}?api_key=${this.get_api_key()}&typ=${this.typ}&act=${this.act}&c_id=${this.get_c_id()}&s_id=${this.data.s_id}`;
        }else if(typ == "individualAttendence"){
            this.typ = "attendence";
            this.act = "readAttendence";
            this.param = `${this.baseUrl}?api_key=${this.get_api_key()}&typ=${this.typ}&act=${this.act}&c_id=${this.get_c_id()}&s_id=${this.data.s_id}`;
        }
    }

    // This function will fetch the data
    fetchBackend(onSuccess, onError) {
        console.log("Fetching from:", this.param);
        fetch(this.param)  // Use this.param instead of this.baseUrl
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                console.log("Raw response:", text);
                if (!text) {
                    throw new Error("Empty response from server");
                }
                try {
                    const data = JSON.parse(text);
                    onSuccess(data);
                } catch (e) {
                    throw new Error(`Invalid JSON response: ${text}`);
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
                onError(error);
            });
    }

    // function to store the api key in the local storage
    store_login_credintial(data, isLogedIn = true) {
        if (isLogedIn == true) {
            localStorage.setItem("api_key", data.c_apikey);
            localStorage.setItem("c_id", data.c_id);
            localStorage.setItem("c_name", data.c_name);
            localStorage.setItem("c_email", data.c_email);
        } else {
            localStorage.removeItem("api_key");
            localStorage.removeItem("c_id");
            localStorage.removeItem("c_name", data.c_name);
            localStorage.removeItem("c_email", data.c_email);
        }
    }

    // This function will get the api Key
    get_api_key() {
        return localStorage.getItem("api_key");
    }
    get_c_id() {
        return localStorage.getItem("c_id");
    }
    get_user_name() {
        return localStorage.getItem("c_name");
    }
    get_email() {
        return localStorage.getItem("c_email");
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

    // This function will update the user credintial
    updateCredintial(data, onSuccess, onError){
        this.data = data;
        this.setParam("upCred");
        this.fetchBackend(onSuccess, onError);
    }

    // -------------------------------- This section is for students ----------------------------------------
    // This function will get all the students
    getStudents(onSuccess, onError) {
        this.setParam("gtStd");
        this.fetchBackend(onSuccess, onError);
    }

    // This function will set the students
    setStudent(data, onSuccess, onError) {
        this.data = data;
        this.setParam("setStd");
        this.fetchBackend(onSuccess, onError);
    }
    // This function will search the students
    searchStudent(data, onSuccess, onError) {
        this.data.query = data.query;
        this.setParam("srchStd");
        this.fetchBackend(onSuccess, onError);
    }
    // This function will delete the students
    deleteStudent(data, onSuccess, onError) {
        this.data.s_id = data.s_id;
        this.setParam("delStd");
        this.fetchBackend(onSuccess, onError);
    }
    // Function to enroll students for fingerprint
    enrollFingerPrint(data, onSuccess, onError){
        this.data.s_id = data.s_id;
        this.setParam("enrollFP");
        this.fetchBackend(onSuccess, onError);
    }
    // function to delete the fingerprint
    deleteFingerPrint(data, onSuccess, onError){
        this.data.s_id = data.s_id;
        this.setParam("delFP");
        this.fetchBackend(onSuccess, onError);
    }
    // This function will get the individual attendance
    getIndividualAttendence(data, onSuccess, onError){
        this.data.s_id = data.s_id;
        this.setParam("individualAttendence");
        this.fetchBackend(onSuccess, onError);
    }
    // This function will update the students
    updateStudent(data, onSuccess, onError) {
        this.data = data;
        this.setParam("upStd");
        this.fetchBackend(onSuccess, onError);
    }


    // -------------------------------- This section is for attendance ----------------------------------------
    getAttendance(onSuccess, onError) {
        this.setParam("gtAtt");
        this.fetchBackend(onSuccess, onError);
    }
    // Function to set attendance
    setAttendance(data, onSuccess, onError) {
        this.data = data;
        this.setParam("stAtt");
        this.fetchBackend(onSuccess, onError);
    }
    // Function to update the attendance
    updateAttendance(data, onSuccess, onError) {
        this.data = data;
        this.setParam("upAtt");
        this.fetchBackend(onSuccess, onError);
    }
}

let api_url = `${window.location.protocol}//${window.location.host}/Backend/index.php`;
let backend = new BackendConnector(api_url);



