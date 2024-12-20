<?php
header('Content-Type: application/json');
include_once 'database.php';

// Different Parameters of the API
$act = isset($_GET['act']) ? $_GET['act'] : "read"; // Possible values are: read,write,delete
$typ = isset($_GET['typ']) ? $_GET['typ'] : null; // Possible values are: std
$api_key = isset($_GET['api_key']) ? $_GET['api_key'] : null;

// Initialize database connection
$database = new Database();
$conn = $database->getConnection();

// Different Error Messages
$no_record = "Record Not Found";
$no_change = "Can't Save Your Changes";
$invalid_parameter = "Invalid Parameters";
$nothing_found = "Nothing Found";
if ($api_key!=null) {
    $class_id = isset($_GET['c_id']) ? $_GET['c_id'] : null;
    if($class_id==null && $act!="update"){
        show_response(false, [], $invalid_parameter);
    }else if ($typ == "std") {// Operation Related to Students
        $student = new Student($conn);
        if ($act == "read") {
            // ?act=read&typ=std&c_id=4
            $students = $student->getStudents($class_id);
            if (!empty($students)) {
                show_response(true, $students);
            } else {
                show_response(false, [], $no_record);
            }
        } else if ($act == "write") {
            // /?act=write&typ=std&c_id=4&s_name=bikal&s_email=bikal
            // Getting the data for adding students//
            $name = isset($_GET['s_name']) ? $_GET['s_name'] : null;
            $dob = isset($_GET['s_dob']) ? $_GET['s_dob'] : null;
            $email = isset($_GET['s_email']) ? $_GET['s_email'] : null;
            $password = isset($_GET["s_password"]) ? $_GET['s_password'] : null;
            $contact = isset($_GET['s_contact']) ? $_GET['s_contact'] : null;
            $isVerified = isset($_GET['s_isverified']) ? $_GET['s_isverified'] : false;

            $students_data = ["s_name" => $name,"c_id"=>$class_id, "s_email" => $email, "s_password" => $password, "s_contact" => $contact, "s_dob" => $dob, "s_isverified" => $isVerified];
            $isUploaded = $student->setStudent($students_data);
            if ($isUploaded) {
                show_response(true, $students_data);
            } else {
                show_response(false, $students_data, $no_change);
            }
        } else if ($act == "delete") {
            $s_id = isset($_GET["id"]) ? $_GET["id"] : null;
            if ($student->removeStudent($s_id)) {
                show_response(true, [$s_id]);
            } else {
                show_response(false, [$s_id], $no_change);
            }
        } else if ($act == "update") {
            // /?act=update&typ=std&s_id=1&s_name=bikal
            if (isset($_GET['s_id'])) {
                $id = $_GET['s_id'];
                $name = isset($_GET['s_name']) ? $_GET['s_name'] : null;
                $dob = isset($_GET['s_dob']) ? $_GET['s_dob'] : null;
                $email = isset($_GET['s_email']) ? $_GET['s_email'] : null;
                $password = isset($_GET["s_password"]) ? $_GET['s_password'] : null;
                $contact = isset($_GET['s_contact']) ? $_GET['s_contact'] : null;
                $isVerified = isset($_GET['s_isverified']) ? $_GET['s_isverified'] : null;

                $data = ["s_name" => $name, "c_id"=>$class_id, "s_dob" => $dob, "s_email" => $email, "s_password" => $password, "s_contact" => $contact, "s_isverified" => $isVerified];
                if ($student->updateStudent($id, $data)) {
                    show_response(true, $data);
                } else {
                    show_response(false, $data, $no_change);
                }

            } else {
                show_response(false, [], $invalid_parameter);
            }
        } else if ($act == "search") {
            // /?act=search&typ=std&q=a
            $query = isset($_GET["q"]) ? $_GET["q"] : null;
            if ($query != null) {
                $result = $student->searchStudent($query,$class_id);
                if ($result != null) {
                    show_response(true, $result);
                } else {
                    show_response(false, [], $nothing_found);
                };
            } else {
                show_response(false, [], $invalid_parameter);
            }
        } else { // Negative Response if parameter is not valid
            show_response(false, [], $invalid_parameter);
        }
    } else if ($typ == "attend") {
        $attendance = new Attendance($conn);
        if ($act == "read") {
            // $year = isset()
            $result = $attendance->getAttendance($class_id);
            if (!empty($result)) {
                show_response(true, $result);
            } else {
                show_response(false, [], $no_record);
            }
        } else {
            show_response(false, [], $invalid_parameter);
        }
    } else {// Invalid Parameter Sent
        show_response(false, [], $invalid_parameter);
    }
}else{
    show_response(false,[],$invalid_parameter);
}




// This function will give response to the API request
function show_response($status, $data, $message = "ok")
{
    if ($status) {
        echo json_encode(array("status" => "success", "message" => $message, "data" => $data));
    } else {
        echo json_encode(array("status" => "error", "message" => $message, "data" => $data));
    }
}

// Close the connection
$conn->close();
?>