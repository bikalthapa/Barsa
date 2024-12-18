let tabId = ["individual_mode", "multiple_mode", "automatic_mode"];
let individual_cont = document.getElementById("individual_container");
let multiple_cont = document.getElementById("multiple_container");
let automatic_cont = document.getElementById("automatic_container");

for (let i = 0; i < tabId.length; i++) {
    let tab = document.getElementById(tabId[i]);
    tab.addEventListener("click", (e) => {
        if (e.target.id == tabId[0]) {//individual mode clicked
            individual_cont.classList.remove("d-none");
            multiple_cont.classList.add("d-none");
            automatic_cont.classList.add("d-none");

            e.target.classList.add("active");
            document.getElementById(tabId[1]).classList.remove("active");
            document.getElementById(tabId[2]).classList.remove("active");
        } else if (e.target.id == tabId[1]) {// Multiple mode is clicked
            individual_cont.classList.add("d-none");
            multiple_cont.classList.remove("d-none");
            automatic_cont.classList.add("d-none");

            e.target.classList.add("active");
            document.getElementById(tabId[0]).classList.remove("active");
            document.getElementById(tabId[2]).classList.remove("active");
        } else if (e.target.id == tabId[2]) {// automatic_mode is clicked
            individual_cont.classList.add("d-none");
            multiple_cont.classList.add("d-none");
            automatic_cont.classList.remove("d-none");

            e.target.classList.add("active");
            document.getElementById(tabId[1]).classList.remove("active");
            document.getElementById(tabId[0]).classList.remove("active");
            startWebCam();
        };

    });
}

function startWebCam() {
    const video = document.getElementById('video');

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error('Error accessing the camera:', error);
        });

}