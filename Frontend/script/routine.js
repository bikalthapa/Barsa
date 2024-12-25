let daily_routine = document.getElementById("daily_routine");
let weekly_routine = document.getElementById("weekly_routine");

let daily_container = document.getElementById("daily_container");
let weekly_container = document.getElementById("weekly_container");

let curr_tab = false;
function toggleRoutineTab(){
    daily_container.classList.toggle("d-none");
    weekly_container.classList.toggle("d-none");
    daily_routine.classList.toggle("active");
    weekly_routine.classList.toggle("active");
    curr_tab = ! curr_tab;
}

daily_routine.addEventListener("click",()=>{
    if(curr_tab==true){
        toggleRoutineTab();
    }
})

weekly_routine.addEventListener("click",()=>{
    if(curr_tab==false){
        toggleRoutineTab();
    }
})
