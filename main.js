var debugHeader = $("#test"),
  sortType = $("select[name='sortType']"),
  subreddit = $('input[name="subreddit"]'),
  time = $('select[name="time"]')
  table = $("#table"),
  updateTimeout = null,
  updaters = $('.update');
$(document).ready(function() {
  displayWords('https://www.reddit.com/r/' + subreddit.val().toLowerCase() + '/' + sortType.val() + '/.json?limit=100');
});

updaters.change(function(event) {
  update();
});

updaters.keyup(function(event) {
  update();
});

function update() {
  if (sortType.val() == 'top') {
    $('#topOnly').css('display', 'block');
  }else {
    $('#topOnly').css('display', 'none');
  }
  if(typeof updateTimeout !== "undefined"){
    clearTimeout(updateTimeout);
  }
  if (subreddit.val() == '' || subreddit.val() == ' ') {
    console.log(subreddit.val());
    return;
  }
  updateTimeout = setTimeout(function () {
    displayWords('https://www.reddit.com/r/' + subreddit.val().toLowerCase() + '/' + sortType.val() + '/.json?limit=100&t=' + time.val());
  }, 1000);
}

function displayWords(url){
  debugHeader.text('Loading..');
  table.html('<tr>\
    <th>Word</th>\
    <th>Times used</th>\
    <th>Procent of total words</th>\
  </tr>');
  getJsonFromUrl(url).then(function(json) {
    if (json.error) {
      debugHeader.text('Subreddit not found');
      return;
    }
    json = json.data.children;
    var text = debugHeader.text();
    json.map(function(index, elem) {
      text += index.data.title + ' ';
    });
    var words = collectWords(json);
    words.map(function(index, elem) {
      var row = table[0].insertRow(table[0].rows.length);
      // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      // Add some text to the new cells:
      cell1.innerHTML = index[0];
      cell2.innerHTML = index[1].value;
      cell3.innerHTML = index[1].procent;
      row.classList.add("scrollReveal");
    });
    debugHeader.text('');
  });
}

function collectWords(json) {
  var words = [],
  wordCount = 0;

  json.map(function(index, elem) {
    var wordsInTitle = index.data.title.split(' ');
    for (var i = 0; i < wordsInTitle.length; i++) {
      wordCount++;
      var word = wordsInTitle[i].toLowerCase() + ' '; //Added ' ' to avoid words being run as functions in array
      if (words[word] == null) {
        words[word] = {value:1};
      }else if (words[word]['value'] == null) {
        words[word] = {value:1};
      }else {
        words[word]['value']++;
      }
    }
  });
  wordCount = wordCount/100;
  words = sortArray(words);
  for (var i = 0; i < words.length; i++) {
    console.log("ds");
    words[i][1].procent = (words[i][1].value/wordCount).toFixed(2) + "%";
  }
  console.log(words);
  return words;
}

function sortArray(array) {
  var sortable = [];
  for (var item in array) {
      sortable.push([item, array[item]]);
  }

  sortable.sort(function(a, b) {
      return b[1].value - a[1].value;
  });
  return sortable;
}

async function getJsonFromUrl(url) {
    console.log("Getting");
		return fetch(url).then(function(response) {
			console.log("Got");
			// Convert to JSON
			return response.json();
		}, function() {
			console.log("Failed getting json");
		});
  }
