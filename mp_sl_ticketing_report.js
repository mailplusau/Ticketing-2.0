/**
 * 
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Description: 
 * @Last Modified by: Sruti Desai
 * 
 */


 define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format'], 
 function(ui, email, runtime, search, record, http, log, redirect, format) {
     var baseURL = 'https://1048144.app.netsuite.com';
     if (runtime.envType == "SANDBOX") {
         baseURL = 'https://1048144-sb3.app.netsuite.com';
     }
     var zee = 0;
     var role = runtime.getCurrentUser().role;
     if (role == 1000) {
         //Franchisee
         zee = runtime.getCurrentUser().id;
     } 
 
     function onRequest(context) {  
         
         if (context.request.method === 'GET') {
            var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.16/css/jquery.dataTables.css"><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.16/js/jquery.dataTables.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://system.na2.netsuite.com/core/media/media.nl?id=2060797&c=1048';
            inlineHtml += '144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><script src="https://cdn.datatables.net/searchpanes/1.2.1/js/dataTables.searchPanes.min.js"><script src="https://cdn.datatables.net/select/1.3.3/js/dataTables.select.min.js"></script><script src="https://code.highcharts.com/highcharts.js"></script><script src="https://code.highcharts.com/modules/data.js"></script><script src="https://code.highcharts.com/modules/exporting.js"></script><script src="https://code.highcharts.com/modules/accessibility.js"></script></script><script src="https://code.highcharts.com/highcharts.js"></script><script src="https://code.highcharts.com/modules/data.js"></script><script src="https://code.highcharts.com/modules/drilldown.js"></script><script src="https://code.highcharts.com/modules/exporting.js">';
            inlineHtml += '</script><script src="https://code.highcharts.com/modules/export-data.js"></script><script src="https://code.highcharts.com/modules/accessibility.js"></script><style>.mandatory{color:red;} .body{background-color: #CFE0CE !important;}</style>';

            var form = ui.createForm({
                title: 'MP Ticketing - Reporting'
            });

            inlineHtml += tabsSection();
            
            form.addField({
                id: 'preview_table',
                label: 'inlinehtml',
                type: 'inlinehtml'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.STARTROW
            }).defaultValue = inlineHtml;

            form.clientScriptFileId = 4989483;

            context.response.writePage(form);

         } else {
 
         }
     }
 
     function tabsSection() {
        var inlineQty = '<div >';
    
        // Tabs headers
        inlineQty += '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #379E8F; color: #fff }';
       inlineQty += '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #379E8F; color: #379E8F; }';
       inlineQty += '</style>';

        inlineQty += '<div style="width: 95%; margin:auto; margin-bottom: 30px"><ul class="nav nav-pills nav-justified" style="margin:0%; ">';
        
        inlineQty += '<li role="presentation" class="active"><a data-toggle="tab" href="#overview"><b>OVERVIEW</b></a></li>';
        inlineQty += '<li role="presentation" class=""><a data-toggle="tab" href="#customer"><b>CUSTOMER</b></a></li>';
        inlineQty += '<li role="presentation" class=""><a data-toggle="tab" href="#zee"><b>ZEE</b></a></li>';
        inlineQty += '<li role="presentation" class=""><a data-toggle="tab" href="#mpstaff"><b>STAFF BREAKDOWN</b></a></li>';
        inlineQty += '<li role="presentation" class=""><a data-toggle="tab" href="#sourcebreakdown"><b>SOURCE BREAKDOWN</b></a></li>';

    
        inlineQty += '</ul></div>';
        
        // Tabs content
        inlineQty += '<div class="tab-content">';
        inlineQty += '<div role="tabpanel" class="tab-pane active" id="overview">';
        inlineQty += '<figure class="highcharts-figure">';
        inlineQty += '<div id="container"></div>';
        //inlineQty += '<p class="highcharts-description">Line chart demonstrating some accessibility features of Highcharts. The chart displays the most commonly used screen readers in surveys taken by WebAIM from December 2010 to September 2019. JAWS was the most used screen reader until 2019, when NVDA took over. VoiceOver is the third most used screen reader, followed by Narrator. ZoomText/Fusion had a surge in 2015, but usage is otherwise low. The overall use of other screen readers has declined drastically the past few years.</p>';
        inlineQty += '</figure><br></br>';
        inlineQty += dataTable('preview');
        inlineQty += '</div>';

        inlineQty += '<div role="tabpanel" class="tab-pane" id="customer">';
        inlineQty += '<figure class="highcharts-figure">';
        inlineQty += '<div id="container2"></div>';
        inlineQty += '</figure><br></br>';
        inlineQty += dataTable('customer');
        inlineQty += '</div>';

        inlineQty += '<div role="tabpanel" class="tab-pane" id="zee">';
        inlineQty += '<figure class="highcharts-figure">';
        inlineQty += '<div id="container3"></div>';
        inlineQty += '</figure><br></br>';
        inlineQty += dataTable('zee');
        inlineQty += '</div>';

        inlineQty += '<div role="tabpanel" class="tab-pane" id="mpstaff">';
        inlineQty += '<figure class="highcharts-figure">';
        inlineQty += '<div id="container4"></div>';
        inlineQty += '</figure><br></br>';
        //inlineQty += dataTablePreview('customer_zee');
        inlineQty += '</div>';

        inlineQty += '<div role="tabpanel" class="tab-pane" id="sourcebreakdown">';
        inlineQty += '<figure class="highcharts-figure">';
        inlineQty += '<div id="container5"></div>';
        inlineQty += '</figure><br></br>';
        //inlineQty += dataTablePreview('customer_zee');
        inlineQty += '</div>';
        
    
        
        inlineQty += '</div></div>';
    
        return inlineQty;
    }
     function dataTable(name) {
        var inlineQty = '<style>table#tickets-' + name + ' {font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px; }table#tickets-' + name + ' th{text-align: center;} .bolded{font-weight: bold;}</style>';
        inlineQty += '<div style="width: 95%; margin: auto">';
        inlineQty += '<table id="tickets-' + name + '" class="table table-responsive table-striped customer tablesorter" style="width: 100%; table-layout: fixed">';
        inlineQty += '<thead style="color: white;background-color: #379E8F;">';
        inlineQty += '<tr class="text-center">';
        inlineQty += '</tr>';
        inlineQty += '</thead>';

        inlineQty += '<tbody id="result_tickets_' + name + '"></tbody>';

        inlineQty += '</table>';
        inlineQty += '</div>'
        return inlineQty;
    }

     function isNullorEmpty(strVal) {
         return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
     }
     
     return {
         onRequest: onRequest
     };
 
 });