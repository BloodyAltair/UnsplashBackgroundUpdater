<?php
/*
 * Copyright © 2018 Denis Vadimov aka BloodyAltair
 * This file is part of UnsplashBackgroundUpdater.
 *
 * UnsplashBackgroundUpdater is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * UnsplashBackgroundUpdater is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with UnsplashBackgroundUpdater.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Created by PhpStorm.
 * User: DenisVadimov
 * Date: 30.03.18
 * Time: 16:18
 */
$config = json_decode (file_get_contents (dirname (__FILE__) . "/config.json"), true);
header ("Content-Type: application/json");
if (empty($_SERVER['HTTP_ORIGIN'])) die(json_encode (["success" => false, "error" => "Your request has no CORS headers"]));
header ("Access-Control-Allow-Headers: *");
header ("Access-Control-Request-Method: GET");
if (preg_match ('/^https:\\/\\/(.*)(\.?)('.$config['allowed_domain'].')$/', $_SERVER['HTTP_ORIGIN'])) {
	header ("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
} else {
	die(json_encode (["success" => false, "error" => "Request is not allowed. Reason: CORS Policy"]));
}

if (!empty($config['accessToken'])) {
	$url = "https://api.unsplash.com/photos/random?per_page=1&count=1&w=" . $config['width'] . "&h=" . $config['height'] . "&orientation=" . $config['orientation'] . ( ( !empty($config['query']) ) ? "&query=" . $config['query'] : "" ) . "&client_id=" . $config['accessToken'];
	$ch = curl_init ();
	curl_setopt ($ch, CURLOPT_HEADER, 0);
	curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt ($ch, CURLOPT_URL, $url);
	if (!empty($headers)) curl_setopt ($ch, CURLOPT_HTTPHEADER, $headers);
	$json = json_decode (curl_exec ($ch), true)[0];
	curl_close ($ch);
	$image_url = $json['urls']['custom'];
	$image_user_name = $json['user']['name'];
	$image_user_url = $json['user']['links']['html'];
	if ($json === null) exit(json_encode (["success" => false, "error" => "API unreachable. Probably reached requests limit."]));
	exit(json_encode (['success' => true, 'url' => $image_url, 'image_user_name' => $image_user_name, 'image_user_url' => $image_user_url]));
}
