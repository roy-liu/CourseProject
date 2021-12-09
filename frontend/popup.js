pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.js';

document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById("queryForData")
    console.log(form)
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ['pdf.worker.js','pdf.js', 'content.js']
        });
    })
});

chrome.runtime.onMessage.addListener((msg, sender) => {
	// First, validate the message's structure.
	if ((msg.from === 'content')) {
	  // Enable the page-action for the requesting tab.
	  console.log(msg.subject);
	  let author =document.getElementById("author").value;

	  const data = {
		  'pdf': msg.subject,
		  'author': author
	  }
	  console.log(data);
	  fetch('http://127.0.0.1:5000/api/requestSimilarities',{
		  method: 'POST',
		  headers: {
			  'Content-Type': 'application/json'
		  },
		  body: JSON.stringify(data)
		}
	  ).then( res => res.json()).then (data => console.log(data));
	}
  });
  

async function callArxivApi (authorname) {
    const resp = await fetch(
        'http://export.arxiv.org/api/query?search_query=au:'+authorname, {
            method: 'GET',
        }
    ).then(res => res.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => console.log(xmlToJson(data)));
}

function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};