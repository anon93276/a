// ==UserScript==
// @name         Антискрытодауны
// @version      1.0
// @description  Скрипт, помечающий слова попадающие под автоскрытие
// @author       a
// @include      *://2ch.*
// @grant   GM_getValue
// @grant   GM_setValue
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    buildTags();
})();

const tagregex = /\[\/?b\]|\[\/?i\]|\[\/?u\]|\[\/?o\]|\[\/?spoiler\]|\[\/?s\]|\[\/?sup\]|\[\/?sub\]/g;
var resultBoxes;

function buildTags() {
    resultBoxes = [];

    var postform = document.getElementById("postform");
    var qrpostform = document.getElementById("qr-postform");
    var commentBox = document.getElementById("shampoo");
    var qrCommentBox = document.getElementById("qr-shampoo");

    var div = document.createElement("div");
    var qrdiv = div.cloneNode(true);
    div.classList.add("postform__raw_flex");

    var pattsInp = document.createElement("input");
    pattsInp.placeholder = "Паттерны скрытодаунов";
    pattsInp.classList.add("input");
    pattsInp.classList.add("postform__input");
    pattsInp.id = "pattern_box";
    pattsInp.value = GM_getValue("patterns") || "";
    var qrPattsInp = pattsInp.cloneNode(true);

    sync(pattsInp, qrPattsInp, function() {GM_setValue("patterns", pattsInp.value);})

    commentBox.addEventListener("input", function(e) {matchAll(commentBox);});
    qrCommentBox.addEventListener("input", function(e) {matchAll(qrCommentBox);});

    var resultBox = document.createElement("pre");
    var qrResultBox = resultBox.cloneNode(true);

    div.appendChild(pattsInp);
    qrdiv.appendChild(qrPattsInp);

    resultBoxes.push(resultBox);
    resultBoxes.push(qrResultBox);

    postform.appendChild(div);
    qrpostform.appendChild(qrdiv);
    postform.appendChild(resultBox);
    qrpostform.appendChild(qrResultBox);
}

function matchAll(box) {
    var patternBox = document.getElementById("pattern_box");
    if (patternBox.value != "") {
        try {
            matchBoxes(box, patternBox);
        }
        catch (e) {
            setResult("Неверный формат: " + e);
        }
    }
}

function matchBoxes(cbox, pbox) {
    var patts = JSON.parse(pbox.value);
    var comm = removeTags(cbox.value).toLowerCase();
    var allMatches = [];

    for (var patt of patts) {
        var name = patt[0];
        var topicre = (patt.length > 6 ? patt[6].toLowerCase() : "");
        var commentre = (patt.length > 7 ? patt[7].toLowerCase() : "");

        var topicmatch = (topicre == "" ? [] : comm.match(topicre));
        var commentmatch = (commentre == "" ? [] : comm.match(commentre));
        var matches = (topicmatch || []).concat(commentmatch || []);

        if (matches.length > 0) {
            allMatches.push([name, matches]);
        }

    }

    printMatches(allMatches);
}

function printMatches(arr) {
    var result = "";

    for (var match of arr) {
        result += match[0] + ": " + match[1].join(", ") + "\n";
    }

    setResult(result);
}

function setResult(text) {
    for (var rb of resultBoxes) {
        rb.textContent = text;
    }
}

function removeTags(str) {
    return str.replaceAll(tagregex, "");
}

function sync(a, b, func) {
    a.addEventListener("input", function(e) {
        b.value = a.value;
        func();
    });

    b.addEventListener("input", function(e) {
        a.value = b.value;
        func();
    });
}
