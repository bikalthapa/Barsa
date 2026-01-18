<?php
// SELECT students.s_id, students.s_name, attendance.a_year, attendance.a_month,attendance.a_day, attendance.a_status from students INNER JOIN attendance ON students.s_id = attendance.s_id;
// It will hold the certain properties of Students table
class Student
{
    private $conn;
    private $table = "students";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // This function will retrive all the students from the database
    public function getStudents($class_id)
    {
        $sql = "SELECT * FROM " . $this->table . " WHERE c_id = $class_id AND del_fingerid = 0";
        $result = $this->conn->query($sql);
        if ($result) {
            if ($result->num_rows > 0) {
                $students = array();
                while ($row = $result->fetch_assoc()) {
                    $students[] = $row;
                }
                return $students;
            } else {
                return array();
            }
        }
    }

    // This will add new students to the database
    public function setStudent($data)
    {
        if ($data['s_name'] != null && $data['s_email'] != null) {
            $data['s_password'] = $data['s_password'] != null ? $data['s_password'] : $data['s_name'];
            $data['s_password'] = password_hash($data["s_password"], PASSWORD_BCRYPT);
            $sql = "INSERT INTO " . $this->table . " (s_name, c_id, s_email, s_password, s_contact, s_dob, fingerprint_id, s_gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);

            // Correct the data types in bind_param
            $stmt->bind_param("ssssssss", $data['s_name'], $data["c_id"], $data['s_email'], $data['s_password'], $data['s_contact'], $data['s_dob'], $data['fingerprint_id'], $data['s_gender']);

            // Execute the statement
            if ($stmt->execute()) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }


    // This will delete the students from the database
    public function removeStudent($s_id)
    {
        if ($s_id != null) {
            $sql = "UPDATE " . $this->table . " SET del_fingerid = 1 WHERE s_id = $s_id";
            $result = $this->conn->query($sql);
            if ($result) {
                return true;
            }
        }
        return false;
    }

    // This method will help to search the student's from the database
    public function searchStudent($q, $class_id)
    {
        $sql = "SELECT * FROM " . $this->table . " WHERE s_name LIKE '%$q%' AND c_id = $class_id";
        $result = $this->conn->query($sql);
        if ($result) {
            if ($result->num_rows > 0) {
                $students = array();
                while ($row = $result->fetch_assoc()) {
                    $students[] = $row;
                }
                return $students;
            } else {
                return null;
            }
        }
    }
    // This method will update the student's row from the database
    public function updateStudent($id, $data)
    {
        $fields = [];
        $values = [];
        $count = 0;

        // Build the SQL query
        $sql = "UPDATE " . $this->table . " SET ";

        foreach ($data as $key => $value) {
            if ($value !== null) {
                $fields[$count] = $key . " = ?";
                $values[$count] = $value;
                $count++;
            }
        }

        if ($count > 0) {
            $sql .= implode(", ", $fields) . " WHERE s_id = ?";
            $values[] = $id;

            $stmt = $this->conn->prepare($sql);

            // Determine the types of the parameters
            $types = str_repeat('s', $count) . 'i';
            $stmt->bind_param($types, ...$values);

            if ($stmt->execute()) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    // Method to enroll fingerprint for the students
    public function enrollFingerprint($id){
        $sql = "UPDATE " . $this->table . " SET add_fingerid = 1 WHERE s_id = ?";
        $stmt = $this->conn->prepare($sql);
        if ($stmt === false) {
            error_log('Prepare failed: ' . htmlspecialchars($this->conn->error));
            return false;
        }
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            return true;
        } else {
            error_log('Execute failed: ' . htmlspecialchars($stmt->error));
            return false;
        }
    }

}



class Attendance
{
    private $conn;
    private $table = "attendance";
    public function __construct($db)
    {
        $this->conn = $db;
    }
    public function getAttendance($class_id)
    {
        // Get the current date and time


        $sql = "SELECT students.s_id, students.s_name, attendance.a_status, attendance.a_id
                FROM students LEFT JOIN attendance
                ON students.s_id = attendance.s_id AND attendance.c_id = $class_id;";
        $result = $this->conn->query($sql);
        if ($result) {
            if ($result->num_rows > 0) {
                $students = array();
                while ($row = $result->fetch_assoc()) {
                    $students[] = $row;
                }
                return $students;
            } else {
                return array();
            }
        }
    }

    // This function will set the attendance
    public function setAttendance($data)
    {
        $sql = "INSERT INTO " . $this->table . " (s_id, c_id, checkindate, a_status) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
    
        if ($stmt === false) {
            error_log('Prepare failed: ' . htmlspecialchars($this->conn->error));
            return false;
        }
    
        $s_id = $data['s_id'];
        $c_id = $data['c_id'];
        $checkindate = date("Y-m-d"); // Use the current date
        $a_status = $data['a_status'];
    
        $stmt->bind_param("iiss", $s_id, $c_id, $checkindate, $a_status);
    
        if (!$stmt->execute()) {
            error_log('Execute failed: ' . htmlspecialchars($stmt->error));
            $stmt->close();
            return false;
        }
    
        $stmt->close();
        return true;
    }
    // This function will update the attendance
    public function updateAttendance($data)
    {
        // Check if required parameters are set
        if (!isset($data['a_id']) || !isset($data['a_status'])) {
            error_log('Missing required parameters: a_id or a_status');
            return false;
        }

        // Prepare the SQL statement
        $sql = "UPDATE " . $this->table . " SET a_status = ? WHERE a_id = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            error_log('Prepare failed: ' . $this->conn->error);
            return false;
        }

        // Bind the parameters
        $stmt->bind_param("si", $data['a_status'], $data['a_id']);

        // Execute the statement
        if ($stmt->execute() === false) {
            error_log('Execute failed: ' . $stmt->error);
            $stmt->close();
            return false;
        }

        // Close the statement
        $stmt->close();
        return true;
    }
}

class Authentication
{
    private $conn;
    private $table = "class";
    public function __construct($db)
    {
        $this->conn = $db;
    }
    // Function to validate login credintial
    public function validateCredintial($email, $password)
    {
        // Query the database for the user with the given email
        $sql = "SELECT * FROM " . $this->table . " WHERE c_email = '$email'";
        $result = $this->conn->query($sql);

        if ($result) {
            // Check if any user was found
            if ($result->num_rows > 0) {
                // Fetch the user record
                $user = $result->fetch_assoc();

                // Verify the provided password against the hashed password in the database
                if (password_verify($password, $user['c_password'])) {
                    // If the password is correct, return the user data
                    return $user;
                } else {
                    // If the password is incorrect, return an empty array
                    return array();
                }
            } else {
                // If no user was found with the given email, return an empty array
                return array();
            }
        }
    }

    // Function to create new credintial
    public function createCredintial($data)
    {
        // Generate a random and unique API key
        $api_key = bin2hex(random_bytes(16)); // Generates a 32-character hexadecimal string

        // Hash the password
        $hashed_password = password_hash($data["c_password"], PASSWORD_BCRYPT);

        $sql = "INSERT INTO " . $this->table . " (c_name, c_email, c_password, c_apikey) VALUES ('" . $data["c_name"] . "','" . $data["c_email"] . "', '" . $hashed_password . "', '" . $api_key . "')";
        $result = $this->conn->query($sql);

        if ($result) {
            $sql = "SELECT c_id FROM " . $this->table . " WHERE c_apikey = $api_key";
            $result = $this->conn->query($sql);
            return ["c_apikey" => $api_key, "c_id" => $result["c_id"]];
        }
        return false;
    }

    // Function to update the credintial
    public function updateCredintial($data)
    {
        // Fetch the current credentials from the database
        $sql = "SELECT c_password, c_name FROM " . $this->table . " WHERE c_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $data["c_id"]);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($result) {
            // Verify the old password
            $updates = [];
            $params = [];
            $types = "";

            // Check if the username has changed
            if ($data["c_name"] !== $result["c_name"]) {
                $updates[] = "c_name = ?";
                $params[] = $data["c_name"];
                $types .= "s";
            }

            // Check if the new password is different from the old password
            if (!empty($data["n_password"])) {
                if (password_verify($data["o_password"], $result["c_password"])) { // Verify the old password
                    $hashed_password = password_hash($data["n_password"], PASSWORD_BCRYPT);
                    $updates[] = "c_password = ?";
                    $params[] = $hashed_password;
                    $types .= "s";
                } else {
                    return false;
                }
            }

            // If there are updates, execute the update query
            if (!empty($updates)) {
                $sql = "UPDATE " . $this->table . " SET " . implode(", ", $updates) . " WHERE c_id = ?";
                $params[] = $data["c_id"];
                $types .= "i";

                $stmt = $this->conn->prepare($sql);
                $stmt->bind_param($types, ...$params);
                $stmt->execute();
                $stmt->close();

                return true;
            }
        }

        return false;
    }

}


// Database class for managing database
class Database
{
    private $hostname = "localhost";
    private $username = "root";
    private $password = "";
    private $dbname = "barsa_attend";
    public $conn;

    public function __construct()
    {
        $this->conn = new mysqli($this->hostname, $this->username, $this->password, $this->dbname);

        if ($this->conn->connect_error) {
            die("Connection failed: " . $this->conn->connect_error);
        }
    }

    public function getConnection()
    {
        return $this->conn;
    }
}
$database = new Database();
$conn = $database->getConnection();
?>