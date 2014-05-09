'use strict';

window.ACS = window.ACS || {};

var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();

ACS.Common = {
    filter: '',
    num: 0,
    senderId: '',
    db: '',
    rows: 0,
    startPager: 0,
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
            url: this.db + this.filter,
            data: { 'wt': 'json', 'q': q },
            success: function (data) {
                ACS.Common.renderResults(data);
                ACS.AppPart.adjustHeight();
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
            else if (param[0].toLowerCase() == "db") {
                this.db = decodeURIComponent(param[1]);
                if (this.db === '') {
                    this.db = "https://cv.altran.se/solr/collection1/select";
                }
            }
            else if (param[0].toLowerCase() == "rows") {
                this.rows = parseInt(param[1]);
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
    }
};

ACS.AppPart = {
    firstResize: false,
    previousHeight: 0,
    previousWidth: 0,
    minHeight: 100,
    minWidth: 270,

    adjustHeight: function () {
        var step = 30,
            width = $("body").width(),
            height = $("body").height(),
            newHeight,
            newWidth,
            contentHeight = 0,
            resizeMessage = '<message senderId={Sender_ID}>resize({Width}, {Height})</message>';

        contentHeight += $('#CvFilterWebPartContent').outerHeight(true);
        newWidth = this.minWidth * ACS.Common.rows;

        //If content is not high as the 'body'
        if (contentHeight < height - step && contentHeight >= this.minHeight) {
            height = contentHeight;
        }

        //Setting height
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
    $("#toggle-cv-" + id).toggle("fast", function () { ACS.AppPart.adjustHeight(); });
    if ($("#toggle-button-" + id).text().indexOf("Show") > -1)
        $("#toggle-button-" + id).text("Hide CV <<");
    else
        $("#toggle-button-" + id).text("Show CV >>");
}

function toggleFilter() {
    $("#filter-text").toggle("fast", function () { ACS.AppPart.adjustHeight(); });
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