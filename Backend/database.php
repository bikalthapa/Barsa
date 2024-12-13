<?php

// It will hold the certain properties of Students table
class Student {
    private $conn;
    private $table = "students";

    public function __construct($db) {
        $this->conn = $db;
    }

    // This function will retrive all the students from the database
    public function getStudents() {
        $sql = "SELECT * FROM " . $this->table;
        $result = $this->conn->query($sql);

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

    // This will add new students to the database
    public function setStudent($data) {
        if ($data['s_name'] != null && $data['s_email'] != null) {
            $sql = "INSERT INTO " . $this->table . " (s_name, s_email, s_password, s_contact, s_dob, s_isverified) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("sssssi", $data['s_name'], $data['s_email'], $data['s_password'], $data['s_contact'], $data['s_dob'], $data['s_isverified']);
    
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
