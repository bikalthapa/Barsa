<?php
require './../database.php';
// Database Design for users
// id	username	serialnumber	gender	email	fingerprint_id	fingerprint_select	user_date	time_in	del_fingerid	add_fingerid	


// Database Design for users_logs

// id
// username
// serialnumber
// fingerprint_id
// checkindate
// timein
// timeout

if (isset($_POST['FingerID'])) {

    // Retrieve the fingerprint ID from the POST request
    $fingerID = $_POST['FingerID'];

    // Prepare an SQL statement to select a user with the given fingerprint ID
    $sql = "SELECT * FROM students WHERE fingerprint_id=?";
    $result = mysqli_stmt_init($conn);
    if (!mysqli_stmt_prepare($result, $sql)) {
        echo "SQL_Error_Select_card";
        exit();
    } else {
        // Bind the fingerprint ID to the SQL statement and execute it
        mysqli_stmt_bind_param($result, "s", $fingerID);
        mysqli_stmt_execute($result);
        $resultl = mysqli_stmt_get_result($result);

        // Check if a row with the given fingerprint ID exists
        if ($row = mysqli_fetch_assoc($resultl)) {
            // An existing fingerprint has been detected for login or logout
            if (!empty($row['s_name'])) {
                $Uname = $row['s_name'];
                $Number = $row['serialnumber'];

                // Prepare an SQL statement to check for an existing log entry for the current date without a timeout
                $sql = "SELECT * FROM attendance WHERE fingerprint_id=? AND checkindate=CURDATE() AND timeout=''";
                $result = mysqli_stmt_init($conn);
                if (!mysqli_stmt_prepare($result, $sql)) {
                    echo "SQL_Error_Select_logs";
                    exit();
                } else {
                    // Bind the fingerprint ID to the SQL statement and execute it
                    mysqli_stmt_bind_param($result, "i", $fingerID);
                    mysqli_stmt_execute($result);
                    $resultl = mysqli_stmt_get_result($result);

                    // Check if there is no existing log entry (Login)
                    if (!$row = mysqli_fetch_assoc($resultl)) {
                        // Insert a new log entry with the current time as the login time
                        $sql = "INSERT INTO attendance (s_name, serialnumber, fingerprint_id, checkindate, timein, timeout) VALUES (? ,?, ?, CURDATE(), CURTIME(), ?)";
                        $result = mysqli_stmt_init($conn);
                        if (!mysqli_stmt_prepare($result, $sql)) {
                            echo "SQL_Error_Select_login1";
                            exit();
                        } else {
                            $timeout = "";
                            mysqli_stmt_bind_param($result, "sdis", $Uname, $Number, $fingerID, $timeout);
                            mysqli_stmt_execute($result);
                            echo "login" . $Uname;
                            exit();
                        }
                        // Check if there is an existing log entry (Logout)
                    } else {
                        // Update the log entry with the current time as the logout time
                        $sql = "UPDATE attendance SET timeout=CURTIME() WHERE fingerprint_id=? AND checkindate=CURDATE()";
                        $result = mysqli_stmt_init($conn);
                        if (!mysqli_stmt_prepare($result, $sql)) {
                            echo "SQL_Error_insert_logout1";
                            exit();
                        } else {
                            mysqli_stmt_bind_param($result, "i", $fingerID);
                            mysqli_stmt_execute($result);
                            echo "logout" . $Uname;
                            exit();
                        }
                    }
                }
                // An available fingerprint has been detected
            } else {
                // Prepare an SQL statement to check for an available fingerprint
                $sql = "SELECT fingerprint_select FROM students WHERE fingerprint_select=1";
                $result = mysqli_stmt_init($conn);
                if (!mysqli_stmt_prepare($result, $sql)) {
                    echo "SQL_Error_Select";
                    exit();
                } else {
                    mysqli_stmt_execute($result);
                    $resultl = mysqli_stmt_get_result($result);

                    // Check if an available fingerprint is found
                    if ($row = mysqli_fetch_assoc($resultl)) {
                        // Update the fingerprint selection
                        $sql = "UPDATE students SET fingerprint_select=0";
                        $result = mysqli_stmt_init($conn);
                        if (!mysqli_stmt_prepare($result, $sql)) {
                            echo "SQL_Error_insert";
                            exit();
                        } else {
                            mysqli_stmt_execute($result);
                            $sql = "UPDATE students SET fingerprint_select=1 WHERE fingerprint_id=?";
                            $result = mysqli_stmt_init($conn);
                            if (!mysqli_stmt_prepare($result, $sql)) {
                                echo "SQL_Error_insert_An_available_card";
                                exit();
                            } else {
                                mysqli_stmt_bind_param($result, "i", $fingerID);
                                mysqli_stmt_execute($result);
                                echo "available";
                                exit();
                            }
                        }
                        // No available fingerprint found, update the fingerprint selection
                    } else {
                        $sql = "UPDATE students SET fingerprint_select=1 WHERE fingerprint_id=?";
                        $result = mysqli_stmt_init($conn);
                        if (!mysqli_stmt_prepare($result, $sql)) {
                            echo "SQL_Error_insert_An_available_card";
                            exit();
                        } else {
                            mysqli_stmt_bind_param($result, "i", $finger_sel, $fingerID);
                            mysqli_stmt_execute($result);
                            echo "available";
                            exit();
                        }
                    }
                }
            }
            // New fingerprint has been added
        } else {
            $Uname = "";
            $Number = "";
            $gender = "";

            // Prepare an SQL statement to check for an available fingerprint
            $sql = "SELECT fingerprint_select FROM students WHERE fingerprint_select=1";
            $result = mysqli_stmt_init($conn);
            if (!mysqli_stmt_prepare($result, $sql)) {
                echo "SQL_Error_Select";
                exit();
            } else {
                mysqli_stmt_execute($result);
                $resultl = mysqli_stmt_get_result($result);

                // Check if an available fingerprint is found
                if ($row = mysqli_fetch_assoc($resultl)) {
                    // Update the fingerprint selection
                    $sql = "UPDATE students SET fingerprint_select =0";
                    $result = mysqli_stmt_init($conn);
                    if (!mysqli_stmt_prepare($result, $sql)) {
                        echo "SQL_Error_insert";
                        exit();
                    } else {
                        mysqli_stmt_execute($result);
                        $sql = "INSERT INTO stuents (s_name , serialnumber, s_gender, fingerprint_id, fingerprint_select) VALUES (?, ?, ?, ?, ?)";
                        $result = mysqli_stmt_init($conn);
                        if (!mysqli_stmt_prepare($result, $sql)) {
                            echo "SQL_Error_Select_add";
                            exit();
                        } else {
                            mysqli_stmt_bind_param($result, "sdsi", $Uname, $Number, $gender, $fingerID);
                            mysqli_stmt_execute($result);
                            echo "succesful1";
                            exit();
                        }
                    }
                    // No available fingerprint found, insert a new fingerprint
                } else {
                    $sql = "INSERT INTO students (s_name , serialnumber, s_gender, fingerprint_id, fingerprint_select) VALUES (?, ?, ?, ?, ?)";
                    $result = mysqli_stmt_init($conn);
                    if (!mysqli_stmt_prepare($result, $sql)) {
                        echo "SQL_Error_Select_add";
                        exit();
                    } else {
                        mysqli_stmt_bind_param($result, "sdsi", $Uname, $Number, $gender, $fingerID);
                        mysqli_stmt_execute($result);
                        echo "succesful2";
                        exit();
                    }
                }
            }
        }
    }

}
if (isset($_POST['Get_Fingerid'])) {

    if ($_POST['Get_Fingerid'] == "get_id") {
        $sql = "SELECT fingerprint_id FROM students WHERE add_fingerid=1";
        $result = mysqli_stmt_init($conn);
        if (!mysqli_stmt_prepare($result, $sql)) {
            echo "SQL_Error_Select";
            exit();
        } else {
            mysqli_stmt_execute($result);
            $resultl = mysqli_stmt_get_result($result);
            if ($row = mysqli_fetch_assoc($resultl)) {
                echo "add-id" . $row['fingerprint_id'];
                exit();
            } else {
                echo "Nothing";
                exit();
            }
        }
    } else {
        exit();
    }
}
if (!empty($_POST['confirm_id'])) {

    $fingerid = $_POST['confirm_id'];

    $sql = "UPDATE students SET add_fingerid=0 WHERE =1";
    $result = mysqli_stmt_init($conn);
    if (!mysqli_stmt_prepare($result, $sql)) {
        echo "SQL_Error_Select";
        exit();
    } else {
        mysqli_stmt_execute($result);

        $sql = "UPDATE students SET add_fingerid=0, fingerprint_select=1 WHERE fingerprint_id=?";
        $result = mysqli_stmt_init($conn);
        if (!mysqli_stmt_prepare($result, $sql)) {
            echo "SQL_Error_Select";
            exit();
        } else {
            mysqli_stmt_bind_param($result, "s", $fingerid);
            mysqli_stmt_execute($result);
            echo "Fingerprint has been added!";
            exit();
        }
    }
}
if(!empty($_POST['confim_delete_id'])){
    $fingerid = $_POST['confim_delete_id'];

    $sql = "UPDATE students SET del_fingerid=0 WHERE del_fingerid=1";
    $result = mysqli_stmt_init($conn);
    if (!mysqli_stmt_prepare($result, $sql)) {
        echo "SQL_Error_Select";
        exit();
    } else {
        mysqli_stmt_execute($result);

        $sql = "UPDATE students SET del_fingerid=1 WHERE fingerprint_id=?";
        $result = mysqli_stmt_init($conn);
        if (!mysqli_stmt_prepare($result, $sql)) {
            echo "SQL_Error_Select";
            exit();
        } else {
            mysqli_stmt_bind_param($result, "s", $fingerid);
            mysqli_stmt_execute($result);
            echo "Fingerprint is ready to delete!";
            exit();
        }
    }
}
if (isset($_POST['DeleteID'])) {

    if ($_POST['DeleteID'] == "check") {
        $sql = "SELECT fingerprint_id FROM students WHERE del_fingerid=1";
        $result = mysqli_stmt_init($conn);
        if (!mysqli_stmt_prepare($result, $sql)) {
            echo "SQL_Error_Select";
            exit();
        } else {
            mysqli_stmt_execute($result);
            $resultl = mysqli_stmt_get_result($result);
            if ($row = mysqli_fetch_assoc($resultl)) {

                echo "del-id" . $row['fingerprint_id'];

                $sql = "DELETE FROM students WHERE del_fingerid=1";
                $result = mysqli_stmt_init($conn);
                if (!mysqli_stmt_prepare($result, $sql)) {
                    echo "SQL_Error_delete";
                    exit();
                } else {
                    mysqli_stmt_execute($result);
                    exit();
                }
            } else {
                echo "nothing";
                exit();
            }
        }
    } else {
        exit();
    }
}
?>
