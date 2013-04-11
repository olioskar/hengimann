<?php 
/*
Vefforritun - lokaverkefni - hengimann
index.html, fetchword.php, hengimann.js, style.css
Author: Olafur Oskar Egilsson
Contact: olioskar @ gmail.com

Þessi kóði skilar JSON streng sem inniheldur upplýsingar
um streng valinn af handahófi úr orðasafni

Dæmi um notkun sem finnur streng af lengdinni 5 til 10: 
fetchword.php?random&min=5&max=10

Um min og max þarf eftirfarandi að gilda: 0<=min<=max
Sé min=max=0 þá skilar þulan streng af hvaða lengd sem er.
*/
class WordCollection {

	// Býr til tengingu við sqlite gagnagrunn sem inniheldur
	// orðasafn og býður uppá aðferð til að sækja þaðan
	// streng af handahófi.
	// (klasinn byggir á hjálpargögnum námskeiðs, gagnag.php)
 	// Notkunarlýsingar á aðferðum fylgja lauslega reglum um rökstudda
	// forritun.
	//	N: lýsir Notkun á aðferð, 
	// 	F: lýsir forskilyrðum (ef einhver)
	// 	E: lýsir eftirskilyrðum.
	
	// Breytur
	// tenging við gagnagrunn
	public static $db;
	// nafn á gagnagrunni
	public static $dbname = "ordadb.db"; 
	
	// Smiður
	// N: wc = new WordCollection();
	// F: ekkert
	// E: wc er nýr, ótengdur WordCollection hlutur
	public function __construct() {}
	
	// Eyðir
	public function __destruct() { unset($db); }

	// N: wc->connect();
	// E: stofnuð hefur verið tenging við gagnagrunn
	public static function connect() {
		self::$db = new PDO('sqlite:db/ordadb.db');
	}
	
	// N: wc->disconnect();
	// E: tenging við gagnagrunn hefur verið slitin
	public static function disconnect() {
		self::$db = NULL;
	}

	// N: word = wc->getRandomWordArray(min,max)
	// F: wc hefur náð tengingu við gagnagrunn, 0 <= min <= max
	// E: word er fylki. 
	// 	  word[string] inniheldur streng af lengd á bilini [min..max]
	//    word[lenght] segir til um lengd word[string]
	//	  word[letters] inniheldur fylki þar sem 
	//    lyklanir 0..word[length]-1 standa fyrir 
	//    hvern tilsvarandi staf í word[string].
	public static function getRandomWordArray($min,$max) {
		// Ekkert takmark á lengd af streng ef min og max er 0
		if ($min == 0 && $max == 0) {
			$result = self::$db->query("SELECT * FROM ord ORDER BY RANDOM() LIMIT 1");
		} else {
			// Sækjum orð af lengd milli min og max
			$result = self::$db->query("SELECT * FROM ord WHERE lengd >= " .$min." AND lengd <= ".$max." ORDER BY RANDOM() LIMIT 1");
		}
		$result->setFetchMode(PDO::FETCH_OBJ);
	    
		while($obj = $result->fetch()) {
			// notum trim til að fá bara orðið sjálft og losum okkur við sértákn
			$word = trim($obj->ord);
			$word = strtolower($word);
            $returnArray["string"] = "".$word;
			$returnArray["length"] = "".$obj->lengd;
			$returnArray["letters"] = str_split($word);
		}
		// Breytum öllum séríslensum stöfum í html kóða, til að
		// tryggja að þeir komi með og að json_encode fallið
		// geti unnið með fylkið.
		array_walk_recursive($returnArray, function(&$item, $key) {
			if(is_string($item)) {
				$item = htmlentities($item);
			}
		});
		return $returnArray;
	}
}

// Meðhöndlun á beiðni til fetchWord.php, skilar einnig villumeldingum
// ef notandi skjalsins uppfyllir ekki notkunarskilyrði
if (isset($_GET["random"])) {
	$wc = new WordCollection();
	$wc->connect();
	if (isset($_GET["min"]) && isset($_GET["max"])) {
		if($_GET["min"] > $_GET["max"]) { 
			echo "min verður að vera minna en max"; 
		} else {
			$arr = $wc->getRandomWordArray($_GET["min"],$_GET["max"]);
		}
	} else { 
		$arr = $wc->getRandomWordArray(0,0); 
	}
	if (isset($arr)) echo json_encode($arr);
} else { echo "villa í fyrirspurn"; }
?>
