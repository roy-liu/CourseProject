
// let submitButton = document.getElementById("que");
// submitButton.addEventListener("click", async () => {
//     console.log("WTFFFFFFff");
//     console.log(document.getElementById("author").value);

// });

document.addEventListener('DOMContentLoaded', function () {
    console.log("the doc loaded")
    var form = document.getElementById("queryForData")
    console.log(form)
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        let data = document.getElementById("author").value;
        callArxivApi(data);
        let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ['pdf.worker.js','pdf.js', 'content.js']
        });
    })
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