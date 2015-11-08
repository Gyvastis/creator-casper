<?php

// Run: php run_loc.php; chmod +x run_loc.sh; ./run_loc.sh; rm run_loc.sh

$accs = file_get_contents('accs.txt');
$accs = explode("\n", $accs);

$spins = 0;
$command = '';

$command .= "echo \"Script started!\";\n";

$command .= "echo \"Reseting tor..!\";\n";
$command .= "kill -1 $(ps -A | grep -m1 tor$ | awk '{print $1}');\n";
$command .= "sleep 10;\n\n";

foreach($accs as $acc){
	$acc = explode("\t", $acc);

	$params = trim(implode(' ', $acc));
	if(empty($params)){
		continue;
	}

	$command .= "echo \"\n".$acc[1]."\";\n";
	$command .= "casperjs --proxy=127.0.0.1:9050 --proxy-type=socks5 run.js $params;\n\n";

	$spins++;
	if($spins >= 5){
		// Request new ip
		$command .= "echo \"Reseting tor..!\";\n";
		$command .= "kill -1 $(ps -A | grep -m1 tor$ | awk '{print $1}');\n";
		$command .= "sleep 10;\n\n";
		$spins = 0;
	}
}

file_put_contents('run.sh', $command);
