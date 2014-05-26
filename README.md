Awesome-Competence-System-Sharepoint-App
========================================

This SharePoint 2013 App render an Iframe with competence profile cards fetched from an ACS Apache SOLR Index. 
It is possible to set number of cards to display as well as the filter in App settings when you add the app to your page.

In order to install this app on a site, it needs to be installed and approved in your sharepoint app server first.

ACS Filter WebPart properties
-----------------------------
Database URL:
Request URL to SOLR database

Filter:
Request filter. For example fq=location_exact:("Oslo")&fq=technology:("php")&rows=500

Number of columns:
How many columns the items will be split into

Number of items displayed:
Total number of items on each "page", 

Columns and items example:

Number of columns = 6
Number of items displayed = 12

X | X | X | X | X | X
X | X | X | X | X | X

Number of columns = 4
Number of items displayed = 16

X | X | X | X 
X | X | X | X
X | X | X | X
X | X | X | X

ACS Filter WebPart
------------------
![Blurred ScreenShot](https://raw.github.com/altran/Awesome-Competence-System-Sharepoint-App/master/acs_filter_webpart_blurred.jpg)
