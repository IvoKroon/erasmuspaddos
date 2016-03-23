<?php

$dns = 'mysql:host=localhost;dbname=erasmuspaddos';
$user = 'root';
$pass = '';



$pdo = new PDO($dns, $user, $pass);



if($_POST['type'] === 'GET_SOUND')
{

	 $stmt = $pdo->prepare('SELECT * from sounds WHERE id=:id');
	 $stmt->bindParam(':id', $_POST['code']);
	 $stmt->execute();
	 $sounds = $stmt->fetchAll();
	 echo json_encode(["status" => "ok", "payload" => $sounds]);
}
