<%@ Page language="C#" Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<WebPartPages:AllowFraming ID="AllowFraming" runat="server" />

<html>
<head>
    <title></title>

    <script type="text/javascript" src="/_layouts/15/MicrosoftAjax.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <script type="text/javascript" src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.2.min.js"></script>
	<script type="text/javascript" src="../Scripts/doT.min.js"></script>

    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <script id="persontemplate" type="text/x-dot-template">
		<div class="card-small" id="p{{=it.id}}">
			{{?it.image}}<div style="background-image: url({{=it.cvurl}}/media/{{=it.image}});" class="imgdiv"></div>{{?}}
			<h2>{{=it.name}}</h2>
			<h4>{{=it.title}}</h4>
            <p>
                {{=it.phone}} {{? it.country }} <img src="{{=it.cvurl}}/static/img/flags/{{=it.country}}.gif" width="16" height="11" alt="{{=it.country}}"/>{{?}}<br/>
                <a href="mailto:{{=it.mail}}">{{=it.mail}}</a>
            </p>
            <a id="toggle-button-{{=it.id}}" class="toggle-button" href="javascript:return false;" onClick="javascript:toggleCV({{=it.id}}, this);">Show CV &gt;&gt;</a>
            <div id="toggle-cv-{{=it.id}}" style="display:none">
                <hr>
                <p class="ldetail">Profile {{=it.completeness.percent}}% complete. Updated: {{=it.last_edited}}</p>
			    {{? it.completeness.comment }}<ul class="ldetail">{{~it.completeness.comment :value:index}}<li>{{=value}}</li>{{~}}</ul>{{?}}
			    <ul>
				    {{~it.cv :cv:index}}
					    {{? cv.status.percent > 10 }} 
						    <li><a href="{{=it.cvurl}}/cv/{{=cv.id}}/" target="_blank">{{=cv.tags}} {{=cv.last_edited}} {{=cv.status.percent}}%</a></li>
					    {{?}}
				    {{~}}
			    </ul>
            </div>		
		</div>
    </script> 

    <script type="text/javascript">
        'use strict';

        // Set the style of the client web part page to be consistent with the host web.
        (function () {
            var hostUrl = '';
            if (document.URL.indexOf('?') != -1) {
                var params = document.URL.split('?')[1].split('&');
                for (var i = 0; i < params.length; i++) {
                    var p = decodeURIComponent(params[i]);
                    if (/^SPHostUrl=/i.test(p)) {
                        hostUrl = p.split('=')[1];
                        document.write('<link rel="stylesheet" href="' + hostUrl + '/_layouts/15/defaultcss.ashx" />');
                        break;
                    }
                }
            }
            if (hostUrl == '') {
                document.write('<link rel="stylesheet" href="/_layouts/15/1033/styles/themable/corev15.css" />');
            }
        })();
    </script>
</head>
<body>
    <div id="CvFilterWebPartContent">
        <div class="search">
            <div class="search-text">Search</div>
            <input type="text" id="inputq">
        </div>
        <div class="filter">
            <a id="filter-button" href="javascript:return false;" onClick="javascript:toggleFilter();">Show filter &gt;&gt;</a>
            <div id="filter-text" style="display:none;"></div>
        </div>        
        <div id="message"></div>
        <div class="browse">
            <span id="browse_left"><a href="javascript:return false;" id="browse_prev" style="display:none">Previous</a></span>            
            <span id="browse-index"></span>
            <span id="browse_right"><a href="javascript:return false;" id="browse_next">Next</a></span>
        </div>
    </div>
    <script type="text/javascript" src="../Scripts/FilterApp.js"></script>
</body>
</html>
