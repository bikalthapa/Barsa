<?php
// SELECT students.s_id, students.s_name, attendance.a_year, attendance.a_month,attendance.a_day, attendance.a_status from students INNER JOIN attendance ON students.s_id = attendance.s_id;
// It will hold the certain properties of Students table
class Student {
    private $conn;
    private $table = "students";

    public function __construct($db) {
        $this->conn = $db;
    }

    // This function will retrive all the students from the database
    public function getStudents($class_id) {
        $sql = "SELECT * FROM " . $this->table. " WHERE c_id = $class_id";
        $result = $this->conn->query($sql);
        if($result){
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
    public function setStudent($data) {
        if ($data['s_name'] != null && $data['s_email'] != null) {
            $data['s_password'] = $data['s_password']!=null?$data['s_password']:$data['s_name'];
            $sql = "INSERT INTO " . $this->table . " (s_name,c_id, s_email, s_password, s_contact, s_dob, s_isverified) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("ssssssi", $data['s_name'],$data["c_id"], $data['s_email'], $data['s_password'], $data['s_contact'], $data['s_dob'], $data['s_isverified']);
    
            if ($stmt->execute()) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }
    

    // This will delete the students from the database
    public function removeStudent($s_id){
        if($s_id!=null){
            $sql = "DELETE FROM ". $this->table . " WHERE s_id = $s_id";
            $result = $this->conn->query($sql);
            if($result){
                return true;
            }
        }
        return false;
    }

    // This method will help to search the student's from the database
    public function searchStudent($q, $class_id){
        $sql = "SELECT * FROM " . $this->table . " WHERE s_name LIKE '%$q%' AND c_id = $class_id";
        $result = $this->conn->query($sql);
        if($result){
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
    public function updateStudent($id, $data) {
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



class Attendance{
    private $conn;
    private $table = "attendance";
    public function __construct($db) {
        $this->conn = $db;
    } 
    public function getAttendance($class_id){
        $sql = "SELECT * FROM " . $this->table." WHERE c_id = $class_id";
        $result = $this->conn->query($sql);
        if($result){
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

// Database class for managing database
class Database {
    private $hostname = "localhost";
    private $username = "root";
    private $password = "";
    private $dbname = "barsa_attend";
    public $conn;

    public function __construct() {
        $this->conn = new mysqli($this->hostname, $this->username, $this->password, $this->dbname);

        if ($this->conn->connect_error) {
            die("Connection failed: " . $this->conn->connect_error);
        }
    }

    public function getConnection() {
        return $this->conn;
    }
}
?>
