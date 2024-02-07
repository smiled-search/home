<?php 
    $interval = 60 * 60 * 24 * 365 * 5; // 6 hours
    $max = time() + $interval;
    header("Last-Modified: " . gmdate ('r', $max));  
    header("Expires: " . gmdate ("r", $max));  
    header("Cache-Control: max-age=$interval");
    $css = file_get_contents('main.css', 'r');
    header("Content-type:text/css; charset=utf-8");
    echo $css;
?>