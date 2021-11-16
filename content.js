this.pdfToText = (data) => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.js';
    return pdfjsLib.getDocument(data).promise.then(function(pdf) {
        var pages = [];
        for (var i = 0; i < pdf.numPages; i++) {
            pages.push(i);
        }
        return Promise.all(pages.map(function(pageNumber) {
            return pdf.getPage(pageNumber + 1).then(function(page) {
                return page.getTextContent().then(function(textContent) {
                    return textContent.items.map(function(item) {
                        return item.str;
                    }).join(' ');
                });
            });
        })).then(function(pages) {
            return pages.join("\r\n");
        });
    });
}
if (window.location.toString().endsWith('.pdf')) {
    console.log("here");
    let author = document.getElementById("author");
    console.log();
    self.pdfToText(window.location.toString()).then(function(result) {
        console.log(result);
    });
}