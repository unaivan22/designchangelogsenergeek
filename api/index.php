<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "una", "unaivan", "designchangelogenergeek");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
    if (isset($_GET['project_id'])) {
        $project_id = $_GET['project_id'];
        $result = $conn->query("SELECT * FROM logs WHERE project_id=$project_id");
    } else {
        // Get projects and count of pending and ongoing logs
        $result = $conn->query("SELECT p.id, p.name,
                                       (SELECT COUNT(*) FROM logs t WHERE t.project_id = p.id AND t.status = 'pending') AS pending_count,
                                       (SELECT COUNT(*) FROM logs t WHERE t.project_id = p.id AND t.status = 'ongoing') AS ongoing_count
                                FROM projects p");
    }
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    break;


    case 'POST':
        // Handle file uploads for logs
        if (isset($_POST['project_id'])) {
            $project_id = $_POST['project_id'];
            $name = $_POST['name'];
            $imagePath = '';

            // Check if an image file was uploaded
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = 'uploads/';
                $imagePath = $uploadDir . basename($_FILES['image']['name']);
                move_uploaded_file($_FILES['image']['tmp_name'], $imagePath);
            }

            $stmt = $conn->prepare("INSERT INTO logs (project_id, name, image) VALUES (?, ?, ?)");
            $stmt->bind_param("iss", $project_id, $name, $imagePath);
            $stmt->execute();

            echo json_encode(["id" => $conn->insert_id]);
        } else {
            // Handle project creation
            $name = $input['name'];
            $conn->query("INSERT INTO projects (name) VALUES ('$name')");
            echo json_encode(["id" => $conn->insert_id]);
        }
        break;

    case 'PUT':
    if (isset($input['status'])) {
        $id = $input['id'];
        $status = $input['status'];

        // Validate status input to ensure only valid values are accepted
        if (in_array($status, ['pending', 'completed', 'ongoing'])) {
            $conn->query("UPDATE logs SET status='$status' WHERE id=$id");
            echo json_encode(["success" => true]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid status value"]);
        }
    } else {
        $id = $input['id'];
        $name = $input['name'];
        $conn->query("UPDATE projects SET name='$name' WHERE id=$id");
        echo json_encode(["success" => true]);
    }
    break;

    case 'DELETE':
    $id = $input['id'];
    $table = isset($input['project_id']) ? "logs" : "projects";
    
    // Fetch the image path before deleting the task
    if ($table === "logs") {
        $result = $conn->query("SELECT image FROM logs WHERE id=$id");
        $task = $result->fetch_assoc();
        
        // Check if an image exists for this task
        if ($task && $task['image']) {
            $imagePath = "uploads/" . $task['image'];
            echo "Image path: $imagePath"; // Debugging line to check the image path

            // Delete the image file from the uploads folder if it exists
            if (file_exists($imagePath)) {
                if (unlink($imagePath)) {
                    echo "File deleted successfully"; // Debugging line to confirm file deletion
                } else {
                    echo "Failed to delete the file"; // Debugging line for failure
                }
            } else {
                echo "File does not exist"; // Debugging line for missing file
            }
        }
    }

    // Delete the task (or project)
    $conn->query("DELETE FROM $table WHERE id=$id");
    echo json_encode(["success" => true]);
    break;

}

$conn->close();
