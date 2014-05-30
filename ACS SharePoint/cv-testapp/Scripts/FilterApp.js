'use strict';

window.ACS = window.ACS || {};

var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();

ACS.Common = {
    filter: '',
    num: 0,
    senderId: '',
    seachIndexUrl: '',
    cols: 0,
    acsAppUrl: '',
    startPager: 0,
    numHits: 0,
    template: null,
    renderer: null,
    ajaxSearch: null,

    init: function() {
        this.getParams();
        this.template = $('#persontemplate').text().replace('XXXcvidXXX', '<%=cv.id%>').replace('XXXpidXXX', '<%=p.id%>').replace('999999', '<%=cv.id%>');
        this.renderer = doT.template(this.template);
    },

    search: function(q) {
        if (q == '' || q == null) {
            q = '*';
        }

        if (this.ajaxSearch !== null) {
            this.ajaxSearch.abort();
        }

        this.ajaxSearch = $.ajax({
            url: this.seachIndexUrl + this.filter,
            data: { 'wt': 'json', 'q': q },
            success: function (data) {
                ACS.Common.renderResults(data);
                ACS.AppPart.adjustSize();
            },
            dataType: 'jsonp',
            jsonp: 'json.wrf'
        });
    },

    renderResults: function(data) {
        var html = "";
        var numItems = 0;

        if (data.response.numFound > 0) {
            var ppl = data.response.docs;

            this.numHits = ppl.length;
            this.updatePagerIndex();

            for (var i = this.startPager; i < ppl.length; i++) {
                if (numItems == this.num)
                    break;

                if (ppl.length < this.num) {
                    $('#browse_next').hide();
                    $('#browse_prev').hide();
                }
                else {
                    $('#browse_next').show();
                }

                if (this.startPager + this.num >= ppl.length)
                    $("#browse_next").hide();

                var person = $.parseJSON(data.response.docs[i].rendered);
                person.image = person.image.replace(/(.jpg|.png)/gi, '_scale_110x110.jpg');
                person.cvurl = this.acsAppUrl;
                html += this.renderer(person);
                numItems++;
            }
        } else {
            html = "No people found for search " + data.responseHeader.params.q;
        }
        $('#message').html(html);
    },

    getParams: function() {
        var params = document.URL.split("?")[1].split("&");
        for (var i = 0; i < params.length; i = i + 1) {
            var param = params[i].split("=");

            if (param[0] == "filter") {
                this.filter = '?' + decodeURIComponent(param[1]);
            }
            else if (param[0] == "num") {
                this.num = parseInt(param[1]);
            }
            else if (param[0].toLowerCase() == "senderid") {
                this.senderId = decodeURIComponent(param[1]);
            }
            else if (param[0].toLowerCase() == "searchindex") {
                this.seachIndexUrl = decodeURIComponent(param[1]);
            }
            else if (param[0].toLowerCase() == "cols") {
                this.cols = parseInt(param[1]);
            }
            else if (param[0].toLowerCase() == "acsapp") {
                this.acsAppUrl = decodeURIComponent(param[1]);
            }
        }
    },

    changePagerPositiv: function () {
        this.startPager += this.num;
    },

    changePagerNegativ: function () {
        this.startPager -= this.num;
        if (this.startPager < 0) {
            this.startPager = 0;
        }
    },

    changePagerReset: function() {
        this.startPager = 0;
    },

    updatePagerIndex: function () {
        var startIndex = this.startPager + 1;
        var endIndex = (startIndex + this.num < this.numHits) ? this.startPager + this.num : this.numHits;
        $('#browse-index').text(startIndex + ' - ' + endIndex + ' ... ' + this.numHits);
    }
};

ACS.AppPart = {
    firstResize: true,
    previousHeight: 0,
    previousWidth: 0,
    minHeight: 100,
    minWidth: 270,
    minCardHeight: 125,

    adjustSize: function () {
        var step = 30,
            width = $("body").width(),
            height = $("body").height(),
            newHeight,
            newWidth,
            contentHeight = 0,
            resizeMessage = '<message senderId={Sender_ID}>resize({Width}, {Height})</message>';
        
        newWidth = this.minWidth * ACS.Common.cols;

        //Calculating height of content, when page is loaded first time, based on number of columns
        if (this.firstResize === true && ACS.Common.numHits > 0 && ACS.Common.cols > 1) {
            var displayNumItems = (ACS.Common.num >= ACS.Common.numHits) ? ACS.Common.numHits : ACS.Common.num;
            //Finding number of rows used to display content
            var contentRows = (displayNumItems % ACS.Common.cols == 0) ? displayNumItems / ACS.Common.cols : Math.floor(displayNumItems / ACS.Common.cols) + 1;
            //Calculating height needed for displaying content
            contentHeight = ($('#CvFilterWebPartContent').outerHeight(true) - ($(".card-small").length * this.minCardHeight)) + (contentRows * this.minCardHeight);
        }
        else {
            contentHeight = $('#CvFilterWebPartContent').outerHeight(true);
        }
        //If content is not high as the 'body'
        if (contentHeight < height - step && contentHeight >= this.minHeight) {
            height = contentHeight;
        }

        //Setting height and width
        if (this.previousHeight !== height || this.previousWidth !== newWidth || this.firstResize === true) {
            newHeight = Math.floor(height / step) * step + step * Math.ceil((height / step) - Math.floor(height / step));

            resizeMessage = resizeMessage.replace("{Sender_ID}", ACS.Common.senderId);
            resizeMessage = resizeMessage.replace("{Height}", newHeight);
            resizeMessage = resizeMessage.replace("{Width}", newWidth);
            window.parent.postMessage(resizeMessage, "*");

            this.previousHeight = newHeight;
            this.previousWidth = newWidth;
            this.firstResize = false;
        }
    }
};

(function () {  
    ACS.Common.init();
    ACS.Common.search();

    //Setting filter text
    var filters = ACS.Common.filter.split('&');
    var filterText = '';
    for (var i = 0; i < filters.length; i++) {
        if (i == 0) {
            filterText += ('- ' + filters[i].split('?')[1] + "</br>");
        }
        else {
            filterText += ('- ' + filters[i] + "</br>");
        }
    }
    $('#filter-text').html(filterText);
})();

function toggleCV(id) {
    $("#toggle-cv-" + id).toggle("fast", function () { ACS.AppPart.adjustSize(); });
    if ($("#toggle-button-" + id).text().indexOf("Show") > -1)
        $("#toggle-button-" + id).text("Hide CV <<");
    else
        $("#toggle-button-" + id).text("Show CV >>");
}

function toggleFilter() {
    $("#filter-text").toggle("fast", function () { ACS.AppPart.adjustSize(); });
    if ($("#filter-button").text().indexOf("Show") > -1)
        $("#filter-button").text("Hide filter <<");
    else
        $("#filter-button").text("Show filter >>");
}


$("#browse_next").click(function () {
    ACS.Common.changePagerPositiv();
    ACS.Common.search();
    $("#browse_prev").show();
});

$("#browse_prev").click(function () {
    ACS.Common.changePagerNegativ();
    if (ACS.Common.startPager <= 0) {
        $(this).hide();
    }
    ACS.Common.search();
    $("#browse_next").show();
});


$('#inputq').keyup(function () {
    var q = $(this).val() || '*';
    ACS.Common.changePagerReset();
    ACS.Common.search(q);
});