let tabId = ["individual_mode", "multiple_mode", "automatic_mode"];
let individual_cont = document.getElementById("individual_container");
let multiple_cont = document.getElementById("multiple_container");
let automatic_cont = document.getElementById("automatic_container");


let month_field = document.getElementById("calendar_title");
let year_field = document.getElementById("year");
let body = document.getElementById("calendar-body");
let prev_btn = document.getElementById("prev-month");
let next_btn = document.getElementById("next-month");
let year = 2081;
let month = 9;


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

// This function will get executed when the calender api fetched is success
const handleData = (api) => {
  hideSpinner();
  // Handle the fetched data here
  body.innerHTML = "";

  let month = api.data[0].mahina.english_name;
  let year = api.data[0].nepali_year;
  month_field.innerHTML = month;
  year_field.innerHTML = year;

  // Loop through data and populate the calendar
  let dayIndex = 0;
  for (let i = 0; i < 6; i++) {  // 6 rows for a month
    let row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {  // 7 columns for days of the week
      let cell = document.createElement("td");
      // Check if we still have valid data for this day (dayIndex is less than api.data length)
      if (dayIndex < api.data.length) {
        if (api.data[dayIndex].holiday == 1) {
          cell.classList.add("holiday");
        }

        let dayData = api.data[dayIndex];
        if (dayData.gate != null) {
          if (api.data[dayIndex].holiday != 1) {
            cell.classList.add("attended");
          }
          cell.innerHTML = dayData.gate;  // Display the "gate" (or other data) for this day
        }

      } else {
        cell.innerHTML = '';  // If no data for this day, leave the cell empty
      }

      row.appendChild(cell);
      dayIndex++;
    }
    body.appendChild(row);
  }
}
// This function will get extecuted when the data is fetched successfully from the server
const handelUser = (data) => {
  hideSpinner();
  // Handle the fetched data here
  console.log(data);
} 

// Error handeling function
const handelError = (error) => {
  hideSpinner();
  console.error(error);
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





function sendRequest() {
  // Fetch data from the Nepali Calendar API
  fetch(`https://calendar.amitdhakal.com.np/api/calendar?year=${year}&month=${month}`)
    .then(response => {
      // Check if the response is successful
      if (response.ok) {
        return response.json();  // Parse JSON if successful
      }
      throw new Error('Network response was not ok');
    })
    .then(api => {
      handleData(api);
    })
    .catch(error => {
      // Handle any errors that occur during the fetch
      console.error("Error fetching data:", error);
    });
}

prev_btn.addEventListener("click", () => {
  month--;
  if (month == 0) {
    month = 12;
    year--;
  }
  sendRequest();
})
next_btn.addEventListener("click", () => {
  month++;
  if (month == 13) {
    month = 1;
    year--;
  }
  sendRequest();
});

showSpinner("Loading Calendar...");
sendRequest();


// Fetching the attendance data for today
backend.getAttendance(handelUser, handelError);


