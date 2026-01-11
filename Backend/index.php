<?php
/*
    --Student manipulation urls
    http://yourapi.com/api.php?act=read&typ=std&c_id=<class_id>&api_key=<your_api_key>
    http://yourapi.com/api.php?act=write&typ=std&c_id=<class_id>&s_name=<student_name>&s_email=<email>&s_password=<password>&s_contact=<contact>&s_dob=<dob>&s_isverified=<true/false>&api_key=<your_api_key>
    http://yourapi.com/api.php?act=delete&typ=std&id=<student_id>&api_key=<your_api_key>
    http://yourapi.com/api.php?act=update&typ=std&s_id=<student_id>&s_name=<new_name>&s_email=<new_email>&s_contact=<new_contact>&s_isverified=<true/false>&api_key=<your_api_key>

    http://localhost/?typ=auth&act=create&c_email=<your_email@example.com>&c_password=<your_password>&c_name=<your_name>
    http://localhost/?typ=auth&act=check&c_email=<engineeringssbss@gmail.com>&c_password=<your_password>
*/
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include_once 'database.php';

// Determine the request method (GET or POST)
$method = $_SERVER['REQUEST_METHOD'];

// Utility function to get parameter from GET or POST
function get_param($name)
{
    global $method;
    if ($method == 'POST') {
        return isset($_POST[$name]) ? $_POST[$name] : null;
    }
    return isset($_GET[$name]) ? $_GET[$name] : null;
}

// Different Parameters of the API
$act = get_param('act') ?: 'read';  // Default action is 'read'
$typ = get_param('typ');  // 'std' is for students
$api_key = get_param('api_key');  // API key


// Different Error Messages
$no_record = "Record Not Found";
$no_change = "Can't Save Your Changes";
$invalid_parameter = "Invalid Parameters";
$nothing_found = "Nothing Found";
if ($typ == "auth") {
    $auth = new Authentication($conn);
    if ($act == "check") {
        $email = get_param('c_email');
        $password = get_param('c_password');
        $user_data = $auth->validateCredintial($email, $password);
        if (count($user_data) >= 1) {
            show_response(true, $user_data);
        } else {
            show_response(false, [], $no_record);
        }
    } else if ($act == "create") {
        $username = get_param("c_name");
        $email = get_param("c_email");
        $password = get_param("c_password");
        $result = $auth->createCredintial(["c_name" => $username, "c_email" => $email, "c_password" => $password]);
        if ($result != false) {
            show_response(true, $result);
        } else {
            show_response(false, [], $no_change);
        }
    } else if ($act == "update") {
        $c_id = get_param("c_id");
        $username = get_param("c_name");
        $new_password = get_param("n_password");
        $old_password = get_param("o_password");
        $result = $auth->updateCredintial(["c_id" => $c_id, "c_name" => $username, "n_password" => $new_password, "o_password" => $old_password]);
        if ($result) {
            show_response(true, $result);
        } else {
            show_response(false, [], $no_change);
        }
    }
} else {
    if ($api_key != null) {
        $class_id = get_param('c_id');

        if ($class_id == null && $act != "update") {
            show_response(false, [], $invalid_parameter);
        } else if ($typ == "std") { // Operation Related to Students
            $student = new Student($conn);

            // Handle actions (read, write, delete, update, search)
            if ($act == "read") {
                $students = $student->getStudents($class_id);
                if (!empty($students)) {
                    show_response(true, $students);
                } else {
                    show_response(false, [], $no_record);
                }
            } else if ($act == "write") {
                // Getting the data for adding students
                $name = get_param('s_name');
                $dob = get_param('s_dob');
                $email = get_param('s_email');
                $password = get_param('s_password');
                $contact = get_param('s_contact');
                $fingerId = get_param('fingerprint_id');
                $gender = get_param('s_gender');

                $students_data = ["s_name" => $name, "c_id" => $class_id, "s_email" => $email, "s_password" => $password, "s_contact" => $contact, "s_dob" => $dob, "fingerprint_id" => $fingerId, "s_gender" => $gender];
                $isUploaded = $student->setStudent($students_data);
                if ($isUploaded) {
                    show_response(true, $students_data);
                } else {
                    show_response(false, $students_data, $no_change);
                }
            } else if ($act == "delete") {
                $s_id = get_param("s_id");
                if ($student->removeStudent($s_id)) {
                    show_response(true, [$s_id]);
                } else {
                    show_response(false, [$s_id], $no_change);
                }
            } else if ($act == "update") {
                $id = get_param('s_id');
                if ($id != null) {
                    $name = get_param('s_name');
                    $dob = get_param('s_dob');
                    $email = get_param('s_email');
                    $password = get_param('s_password');
                    $contact = get_param('s_contact');
                    $fingerId = get_param('fingerprint_id');
                    $gender = get_param('s_gender');

                    $data = ["s_name" => $name, "c_id" => $class_id, "s_dob" => $dob, "s_email" => $email, "s_password" => $password, "s_contact" => $contact, "fingerprint_id" => $fingerId, "s_gender" => $gender];
                    if ($student->updateStudent($id, $data)) {
                        show_response(true, $data);
                    } else {
                        show_response(false, $data, $no_change);
                    }
                } else {
                    show_response(false, [], $invalid_parameter);
                }
            } else if ($act == "search") {
                $query = get_param("q");
                if ($query != null) {
                    $result = $student->searchStudent($query, $class_id);
                    if ($result != null) {
                        show_response(true, $result);
                    } else {
                        show_response(false, [], $nothing_found);
                    }
                } else {
                    show_response(false, [], $invalid_parameter);
                }
            } else { // Negative Response if parameter is not valid
                show_response(false, [], $invalid_parameter);
            }
        } else if ($typ == "attend") {

            $attendance = new Attendance($conn);
            if ($act == "read") {
                $result = $attendance->getAttendance($class_id);
                if (!empty($result)) {
                    show_response(true, $result);
                } else {
                    show_response(false, [], $no_record);
                }
            } else if ($act == "write") {
                $s_id = get_param('s_id');
                $a_status = get_param('a_status');
                $result = $attendance->setAttendance(["s_id" => $s_id, "c_id" => $class_id, "a_status" => $a_status]);
                if ($result) {
                    show_response(true, [$s_id, $a_status]);
                } else {
                    show_response(false, [], $no_change);
                }
            } else if ($act == "update") {
                $s_id = get_param('s_id');
                $a_id = get_param('a_id');
                $a_status = get_param('a_status');
                $result = $attendance->updateAttendance(["s_id" => $s_id, "c_id" => $class_id, "a_id" => $a_id, "a_status" => $a_status]);
                if ($result) {
                    show_response(true, [$s_id, $a_status]);
                } else {
                    show_response(false, [], "Hi There is no change");
                }
            } else {
                show_response(false, [], $invalid_parameter);
            }
        } else { // Invalid Parameter Sent
            show_response(false, [], $invalid_parameter);
        }
    } else {
        show_response(false, [], $invalid_parameter);
    }
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