/*
Vefforritun - lokaverkefni - hengimann
index.html, fetchword.php, hengimann.js, style.css
Author: Olafur Oskar Egilsson
Contact: olioskar @ gmail.com


Notkunarlýsingar á aðferðum fylgja lauslega reglum um rökstudda
forritun.
    N: lýsir Notkun á aðferð, 
    F: lýsir forskilyrðum (ef einhver)
    E: lýsir eftirskilyrðum.

*/

// Byrja strax að hlaða inn myndunum, síðar meir eru þær settar í fylki í hengimann hlutnum
var images = [];
loadImages = function() {
    for(num = 0; num < 13; num++){
        this.images[num] = $('<img id="image"/>').attr('src', 'img/'+num+'.png');
    }
}
loadImages();

// N: w = new Word(string,length,letters)
// F: string er strengur, length er tala og letters er fylki
// E: w er nýr Word hlutur sem geymir upplýsingar um eitt orð
function Word(string,length,letters) {
    this.string = string;
    this.length = length;
    this.letters = letters;
}
// N: g = new Game(w);
// F: w er hlutur af tagi Word
// E: nýr leikur hefur verið stilltur af með orðinu word
function Game(w) {
    /*
    Gögn: word geymir orðið sem leikurinn snýst um hverju sinni
          maxAttempts er fjöldi leyfilegra tilrauna til að giska og attempts
          er fjöldi ágiskana. Ef attempts = maxAttempts þá er leikurinn tapaður
          
          score segir til um hversu oft notandi hefur giskað á réttan staf
          ef score = word.length þá er leikurinn unninn
    
          images geymir myndirnar sem birta stöðu spilara í leiknum, hvert
          stak í images samsvarar til attempts. þ.e images[attempts] 

          alphabet er stafrófið sem við erum að vinna með.
    */
    this.word = w;
    this.maxAttempts = 12
    this.attempts = 0;
    this.score = 0;
    this.images = [];
    this.alphabet = ["a","&aacute;","b","d","&eth;","e","&eacute;","f","g","h","i"
                    ,"&iacute;","j","k","l","m","n","o","&oacute;","p"
                    ,"r","s","t","u","&uacute;","v","x","y","&yacute;"
                    ,"z","&thorn;","&aelig;","&ouml;"];

    // initImages stillir af myndirnar og setur upp upphafsmynd
    // N: w.initImages(arr);
    // F: myndir hafa verið hlaðnar inn í arr
    // E: w inniheldur allar myndir úr arr, mynd í staki 0 er sýnileg
    this.initImages = function(imgArray) {
        $("#visual").append("<img id='image' src = '' />");
        this.images = imgArray;
        this.updateImage(0);
    }
    // Uppfærir mynd í #image, kallað í af updateScore()
    // N: w.updateImage(frame);
    // F: frame <= maxAttempts
    // E: #image inniheldur mynd úr images[frame]
    this.updateImage = function(frame) {
        $("#image").replaceWith(this.images[frame])
    } 

    // Uppfærir stigin notað í wrongGuess() og rightGuess()
    // N: w.updateScore(a,s,g)
    // F: attempts er tala <= maxAttempts, 
    //    score er tala <= word.length, guessedWrong er bool
    // E: attempts og score hafa verið uppfærð eftir því hvort
    //    guessedWrong er true eða false
    this.updateScore = function(attempts,score,guessedWrong) {
        if (guessedWrong) this.updateImage(attempts);
        if (score >= this.word.length) this.gameWin();
        if (attempts >= this.maxAttempts) this.gameOver();
    }

    // showLetter sýnir staf, notast í rightGuess() og showWord()
    // N: w.showLetter(entry)
    // F: entry svarar til staks í w.word.letters
    // E: w.word.letters[entry] er sýnilegur
    this.showLetter = function(entry) {
        $('#letter'+entry).fadeIn("medium");
    }

    // showWord birtir orðið sem leitað er eftir, notast í gameOver()
    // N: w.showWord()
    // F: fjöldi leyfirlegra tilrauna er kominn uppí max, leikur er tapaður
    // E: þeir stafir sem ekki var búið að giska á eru sýnilegir.
    this.showWord = function() {
        for(entry in this.word.letters) {
            if($('#letter'+entry).css('display') == 'none') { 
                this.showLetter(entry);
                $('#letter'+entry).css("color","#AFAFAF");
            }
        } 
    }

    // animateWord notast í gameWin() setur smá effect á orðið sem giskað er á 
    // N: w.animateWord()
    // F: notandi hefur giskað á alla stafi í orði, leikur er unnin
    // E: hver stafur í orði hefur fade-að inn og út
    this.animateWord = function() {
        for(each in this.word.letters) {
            $("#letter"+each).show().delay(10).fadeOut("fast").delay(5*(each+1)).fadeIn("fast");
        }
    }

    // kallað í af update score ef attempts>= maxattempts, þ.e þegar leikur er tapaður
    // E: #playagain og orðið sem reynt var við er sýnilegt, lyklaborð er óvirtk
    this.gameOver = function() {
        this.showWord();
        this.disableObject($('button'));
        $("#playAgain").show();
        $("#menu").fadeIn("medium");    
    }

    // kallað í af updateScore ef score >= word.lenght, þ.e þegar leikur er unninn
    // E: #playagain og orðið sem reynt var við er sýnilegt, lyklaborð er óvirtk
    this.gameWin = function() {
        this.disableObject($('button'));
        $("#playAgain").show();
        $("#menu").fadeIn("medium");
        // Smá hakk, þessi skipun virkar ekki nema
        // að þessi object heiti hengimann. Geri þetta til
        // að tryggja að fadeIn() hafi örugglega lokið sér af.
        var t = setTimeout("hengimann.animateWord()",1000);
    }
    
    // notað í gameWin og gameOver
    // N: disableObject(obj)
    // F: obj er button
    // E: obj er núna óvirkur
    this.disableObject = function(obj) {
        obj.attr("disabled",true);
        obj.attr("class", "disabled");
    }

    // Notast þegar að spilari velur rangan staf
    // N: w.wrongGuess(obj)
    // F: obj er jquery hlutur sem á að fela
    // E: obj er ekki lengur sýnilegur, það eru einum færri ágiskanir eftir 
    this.wrongGuess = function(obj) {
        this.updateScore(this.attempts +=1,this.score, true);
        this.disableObject(obj);
    }

    // Notast þegar spilari velur réttan staf
    // N: w.rightGuess(letter,obj)
    // F: letter er strengur og inniheldur stafinn sem að valinn var
    //    obj er jquery hlutur sem á að fela
    // E: obj er ekki lengur sýnilegur. Öll span tög í #status 
    //    sem innihlada streng = letter eru sýnileg
    this.rightGuess = function(letter,obj) {
        this.disableObject(obj);
        for (entry in this.word.letters) {
            if (letter == this.word.letters[entry]) {
                this.showLetter(entry);
                this.updateScore(this.attempts, this.score+=1);
            }
        }
    }
        
    // setur upp svæði í #status fyrir réttar ágiskanir
    // N: w.makeWord()
    // F: búið er að sækja orð úr gagnagrunni og setja í w
    // E: #status inniheldur nú nokkur div tög sem hvert og eitt inniheldur 
    //    falið span tag. Þ.a. það myndar eitthvað svipað þessu: _ _ _ _ _ _
    this.makeWord = function() {
        for (entry in this.word.letters) {
            $('#word').append('<div class="letter"><span id="letter'+entry+'">'
                               +this.word.letters[entry]+'</span></div>');  
            $('#letter'+entry).hide();
        }
    }
    
    // býr til þær aðgerðir sem þarf til að hægt sé að smella á takka
    // N: w.makeClickable(entry, obj)
    // F: entry < w.alphabet.length. obj w.
    // E: sá takki sem samsvarar w.alphabet[entry] framkvæmir viðeigandi aðgerðir
    //    sé smellt á hann.
    this.makeClickable = function(entry,obj) {
        $('#alphabet'+entry).click(function() {
            if (obj.guess(obj.alphabet[entry])) obj.rightGuess(obj.alphabet[entry],$(this));
            else obj.wrongGuess($(this));
        })
    }

    // Teiknar upp stafaborðið
    // N: w.makeKeyboard()
    // F: w.alphabet inniheldur stafi
    // E: til er takki í #keyboard fyrir hvern og einn staf í this.alphabet 
    this.makeKeyboard = function() {
        for (entry in this.alphabet) {
            $('#keyboard').append('<button id="alphabet'+entry+'" class="button">'
                                   +this.alphabet[entry]+'</button>');
            this.makeClickable(entry,this);
        }

    }

    // Athugar hvaða niðurstöða kemur úr ágiskun
    // N: w.guess(letter);
    // F: letter er einvher stafur úr w.alphabet
    // E: skilar true ef letter er í w.word.letters, annars false
    this.guess = function(letter) {
        toOz = false;
        ofTheJedi = true;
        for (entry in this.word.letters) {
            if (this.word.letters[entry] == letter) return ofTheJedi;
        }
        return toOz; 
    }

    // setur upp leiksvæði!
    // N: w.setup()
    // F: búið er að hlaða inn gögnum (orði og myndum)
    // E: mynda- og orðasvæði er sýnilegt ásamt lyklaborði
    this.setup = function() {
        this.initImages(images);
        this.makeKeyboard();
        this.makeWord();
    }
}

// N: startGame(min,max)
// F: click event sem gerður er í makeMenu() kallar á þetta fall
//    0 <= min <= max
// E: leikur er hafinn með orð af lengd á bilinu [min..max]
//    ef min = max = 0 þá eru engar hömlur á lengd.
startGame = function(min,max) {
    getJsonData = $.getJSON('fetchword.php?random&min='+min+'&max='+max);   
    getJsonData.error(function() {
        $("body").html("Ekki n&aacute;&eth;ist samband vi&eth; gagnagrunn<br />Hinkri&eth; augnablik og reyni&eth; aftur");
    });
    getJsonData.success(function(data) {
        hengimann = new Game(new Word(data.string, data.length, data.letters)); 
    });
    // búið er að sækja orð, þá er hægt að hefja leikinn.
    getJsonData.complete(function(){
        hengimann.setup();
    });
}

// N: makeMenu()
// F: html er ready
// E: valmynd hefur verið sett upp og click eventar
//    hengdir við hluti í henni. 
makeMenu = function() {
    // #playAgain er falið því það á ekki að vera sýnilegt
    // í upphafsvalmynd, einungis þegar að leik er lokið.
    $("#playAgain").hide();
    $("#title").fadeIn("medium");
    $("#menu").fadeIn("medium");
    
    // F: leik er lokið
    // E: leikur hefur verið endurræstur.
    $("#playAgain").click(function() {
        $("#container").fadeOut("medium",function() {
            window.location.reload(true);
        });
    }); 
    // Click eventar fyrir upphafsvalmynd
    $('#easy').click(function() {
        startGame(5,8);
        $("#startMenu").remove()
    });
    $('#medium').click(function() {
        startGame(8,14);
        $("#startMenu").remove()

    });
    $('#hard').click(function() {
        startGame(13,19)
        $("#startMenu").remove()

    });
    $('#all').click(function() {
        startGame(0,19);
        $("#startMenu").remove()
    });
}

$(document).ready(function(mainevent) {
    //  Tek caching af til að fá alltaf nýjann JSON streng.
    $.ajaxSetup({
        cache: false
    });
    // Hefjum fjörið
    makeMenu();
});
