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
        $sql = "SELECT * FROM " . $this->table . " WHERE c_id = $class_id";
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
            $sql = "INSERT INTO " . $this->table . " (s_name, c_id, s_email, s_password, s_contact, s_dob, s_finger, s_gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            
            // Correct the data types in bind_param
            $stmt->bind_param("ssssssss", $data['s_name'], $data["c_id"], $data['s_email'], $data['s_password'], $data['s_contact'], $data['s_dob'], $data['s_finger'], $data['s_gender']);
            
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
            $sql = "DELETE FROM " . $this->table . " WHERE s_id = $s_id";
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
        // SELECT students.s_id, students.s_name, attendance.a_status
        // FROM students
        // LEFT JOIN attendance ON students.s_id = attendance.s_id AND attendance.c_id = 3
        // WHERE attendance.a_status IS NULL;
        $year = date('Y');
        $month = date('m');
        $day = date('d');        
        // Get the current date and time
        
  
        $sql = "SELECT students.s_id, students.s_name, .$this->table .a_status FROM students LEFT JOIN  
        $this->table ON students.s_id = attendance.s_id AND attendance.c_id = $class_id";
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
}

class Authentication
{
    private $conn;
    private $table = "class";
    public function __construct($db)
    {
        $this->conn = $db;
    }
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

    // Set a secure cookie
   public function set_secure_cookie($name, $value, $days)
    {
        $expires = time() + ($days * 24 * 60 * 60);
        setcookie($name, $value, [
            'expires' => $expires,
            'path' => '/',
            'domain' => 'yourdomain.com',
            'secure' => true, // Only send over HTTPS
            'httponly' => true, // Not accessible via JavaScript
            'samesite' => 'Strict' // Prevents cross-site request forgery
        ]);
    }


    public function createCredintial($data)
    {
        // Generate a random and unique API key
        $api_key = bin2hex(random_bytes(16)); // Generates a 32-character hexadecimal string

        // Hash the password
        $hashed_password = password_hash($data["c_password"], PASSWORD_BCRYPT);

        $sql = "INSERT INTO " . $this->table . " (c_name, c_email, c_password, c_apikey) VALUES ('" . $data["c_name"] . "','" . $data["c_email"] . "', '" . $hashed_password . "', '" . $api_key . "')";
        $result = $this->conn->query($sql);
        if ($result) {
            return ["c_apikey" => $api_key];
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
?>