let pending_btn = document.getElementById("pending_btn");
let history_btn = document.getElementById("history_btn");
let pending_container = document.getElementById("pending_container");
let history_container = document.getElementById("history_container");
let current_application = true;
function toggleApplication(){
    pending_btn.classList.toggle("active");
    history_btn.classList.toggle("active");
    pending_container.classList.toggle("d-none");
    history_container.classList.toggle("d-none");
}
pending_btn.addEventListener("click",()=>{
    if(current_application==false){
        toggleApplication();
        current_application = !current_application;
    }
})
history_btn.addEventListener("click",()=>{
    if(current_application==true){
        toggleApplication();
        current_application = !current_application;
    }
})
