/**
 * 
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Description: A ticketing system for the Customer Service.
 * @Last Modified by: Sruti Desai
 * 
 */


 define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format'], 
 function(ui, email, runtime, search, record, http, log, redirect, format) {
     var baseURL = 'https://1048144.app.netsuite.com';
     if (runtime.EnvType == "SANDBOX") {
         baseURL = 'https://1048144-sb3.app.netsuite.com';
     }
     var zee = 0;
     var role = runtime.getCurrentUser().role;
     if (role == 1000) {
         //Franchisee
         zee = runtime.getCurrentUser();
     } 
 
     function onRequest(context) {  
         
         if (context.request.method === 'GET') {
             var form = ui.createForm({
                 title: ' ',
             });
 
             // Load jQuery
             var inlineHtml = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';
             // Load Tooltip
             inlineHtml += '<script src="https://unpkg.com/@popperjs/core@2"></script>';
 
             // Load Bootstrap
             inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
             inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
             
             // Load DataTables
             inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
             inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';
 
             // Load Bootstrap-Select
             inlineHtml += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
             inlineHtml += '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';
 
             // Load Netsuite stylesheet and script
             inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
             inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
             inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
             inlineHtml += '<style>.mandatory{color:red;}</style>'; 
             
 
             // Load "FixedHeader" Datatable extension
             inlineHtml += '<link type="text/css" href="https://cdn.datatables.net/fixedheader/3.1.7/css/fixedHeader.dataTables.min.css" rel="stylesheet" />';
             inlineHtml += '<script type="text/javascript" src="https://cdn.datatables.net/fixedheader/3.1.7/js/dataTables.fixedHeader.min.js"></script>';
 
             //Load gyrocode extension for Datatbles
             inlineHtml += '<link type="text/css" href="//gyrocode.github.io/jquery-datatables-checkboxes/1.2.12/css/dataTables.checkboxes.css" rel="stylesheet" />';
             inlineHtml += '<script type="text/javascript" src="//gyrocode.github.io/jquery-datatables-checkboxes/1.2.12/js/dataTables.checkboxes.min.js"></script>';
 
             // Load Netsuite stylesheet and script
             inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
             inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
             inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
             inlineHtml += '<style>.mandatory{color:red;} </style>';
 
             // Define alert window.
             inlineHtml += '<div class="container" style="margin-top:14px;" hidden><div id="alert" class="alert alert-danger fade in"></div></div>';
 
             // Define information window.
             inlineHtml += '<div class="container" hidden><p id="info" class="alert alert-info"></p></div>';
 
             //inlineHtml += '<div style="background-color: #CFE0CE; min-height: 100vh; margin-top: -15px"><br/>';
             inlineHtml += '<div style="margin-top: -40px"><br/>';
             inlineHtml += '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #379E8F; font-weight: 700; border-color: #379E8F; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="opennewticket" onclick="">Open New Ticket</button>';
             inlineHtml += '<button style="margin-left: 5px; margin-right: 5px; background-color: #FBEA51; color: #379E8F; font-weight: 700; border-color: #379E8F; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="viewclosedtickets" onclick="">View Closed Tickets</button>';
             inlineHtml += '<button style="margin-left: 5px; margin-right: 5px; background-color: #FBEA51; color: #379E8F; font-weight: 700; border-color: #379E8F; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="viewlosttickets" onclick="">View Lost Tickets</button>';
             inlineHtml += '<button style="margin-left: 5px; margin-right: 5px; background-color: #FBEA51; color: #379E8F; font-weight: 700; border-color: #379E8F; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="sendbulkemails" onclick="">Send Bulk Emails</button>';

             
             //  form.addSubmitButton({
            //      label: 'Open New Ticket'
            //  });
 
 
            //  form.addButton({
            //      id: 'custpage_view_closed_tickets',
            //      label: 'View Closed Tickets',
            //      functionName: 'viewClosedTickets()'
            //  });
 
            //  form.addButton({
            //      id: 'custpage_view_lost_tickets',
            //      label: 'View Closed-Lost Tickets',
            //      functionName: 'viewLostTickets()'
            //  });
 
            //  form.addButton({
            //      id: 'custpage_bulk_email',
            //      label: 'Send Bulk Emails',
            //      functionName: 'onSendBulkEmails()'
            //  });

             inlineHtml += '<h1 style="font-size: 25px; font-weight: 700; color: #103D39; text-align: center">View MP Tickets</h1>'
             
             //inlineHtml += dataTablePreview('test');
             inlineHtml += dateCreatedSection();
             inlineHtml += tabsSection(parseInt(role));
             inlineHtml += '</div>'
             form.addField({
                 id: 'preview_table',
                 type: ui.FieldType.INLINEHTML,
                 label: 'preview_table'
             }).updateBreakType({
                 breakType: ui.FieldBreakType.STARTROW
             }).defaultValue = inlineHtml;
 
 
             form.addField({
                 id: 'custpage_selected_id',
                 type: ui.FieldType.TEXT,
                 label: 'Selected ID'
             }).updateDisplayType({
                 displayType: ui.FieldDisplayType.HIDDEN
             });
 
             form.addField({
                 id: 'custpage_selector_type',
                 type: ui.FieldType.TEXT,
                 label: 'Selector Type'
             }).updateDisplayType({
                 displayType: ui.FieldDisplayType.HIDDEN
             });
 
 
            //  form.addSubmitButton({
            //      label: 'Open New Ticket'
            //  });
 
 
            //  form.addButton({
            //      id: 'custpage_view_closed_tickets',
            //      label: 'View Closed Tickets',
            //      functionName: 'viewClosedTickets()'
            //  });
 
            //  form.addButton({
            //      id: 'custpage_view_lost_tickets',
            //      label: 'View Closed-Lost Tickets',
            //      functionName: 'viewLostTickets()'
            //  });
 
            //  form.addButton({
            //      id: 'custpage_bulk_email',
            //      label: 'Send Bulk Emails',
            //      functionName: 'onSendBulkEmails()'
            //  });
             
             form.clientScriptFileId = 4813449;//SB=4796342 PROD = 4813449
             context.response.writePage(form);
 
         } else {
 
             var param_selected_ticket_id = context.request.parameters.custpage_selected_id;
             log.debug({
                 title: 'param_selected_ticket_id',
                 details: param_selected_ticket_id
             });
 
             if (isNullorEmpty(param_selected_ticket_id)) {
                 
                 redirect.toSuitelet({
                     scriptId: 'customscript_sl_open_ticket_2',
                     deploymentId: 'customdeploy_sl_open_ticket_2',
                     isExternal: null,
                     parameters: null
                 });
 
             } else {
                 var params = {
                     custscript_selected_ticket_id: param_selected_ticket_id,
                 };
 
                 task.create({
                     taskType: task.TaskType.SCHEDULED_SCRIPT,
                     deploymentId: 'customdeploy_ss_ticket_under_investigati_2',
                     params: params,
                     scriptId: 'customscript_ss_ticket_under_investigati_2',
                 });
 
                 redirect.toSuitelet({
                     scriptId:'customscript_sl_edit_ticket_2',
                     deploymentId: 'customdeploy_sl_edit_ticket_2',
                 });
             }
 
         }
     }
 
     /**
      * The date input fields for the "Date Created" column filter.
      * @return  {String}    inlineQty
      */
     function dateCreatedSection() {
         var inlineQty = '<div class="form-group container date_filter_section" style="margin-top:40px; margin-bottom: 60px">';
         inlineQty += '<div class="row">';
         // Date from field
         inlineQty += '<div class="col-xs-6 date_from">';
         inlineQty += '<div class="input-group">';
         inlineQty += '<span class="input-group-addon" id="date_from_text">DATE CREATED FROM</span>';
         inlineQty += '<input id="date_from" class="form-control date_from" type="date"/>';
         inlineQty += '</div></div>';
         // Date to field
         inlineQty += '<div class="col-xs-6 date_to">';
         inlineQty += '<div class="input-group">';
         inlineQty += '<span class="input-group-addon" id="date_to_text">DATE CREATED TO</span>';
         inlineQty += '<input id="date_to" class="form-control date_to" type="date">';
         inlineQty += '</div></div></div></div>';
 
         return inlineQty;
     }
 
     
 
 
     function tabsSection(userRole) {
         var inlineQty = '<div >';
     
         // Tabs headers
         inlineQty += '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #379E8F; color: #fff }';
        inlineQty += '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #379E8F; color: #379E8F; }';
        inlineQty += '</style>';

         inlineQty += '<div style="width: 95%; margin:auto; margin-bottom: 30px"><ul class="nav nav-pills nav-justified" style="margin:0%; ">';
         if (isFinanceRole(userRole)) {
             //inlineQty += '<li role="presentation" class=""><a data-toggle="tab" href="#barcodes"><b>BARCODES</b></a></li>';
             //inlineQty += '<li role="presentation" class=""><a data-toggle="tab" href="#customers"><b>CUSTOMERS</b></a></li>';
             inlineQty += '<li role="presentation" class="active"><a data-toggle="tab" href="#invoices"><b>INVOICES</b></a></li>';
         } else if (isDataAdminRole(userRole)) {
            inlineQty += '<li role="presentation" class="active"><a data-toggle="tab" href="#barcodes"><b>BARCODES</b></a></li>';
            inlineQty += '<li role="presentation" class=""><a data-toggle="tab" href="#customers"><b>CUSTOMERS</b></a></li>';
            inlineQty += '<li role="presentation" class=""><a data-toggle="tab" href="#invoices"><b>INVOICES</b></a></li>';
         } else {
             inlineQty += '<li role="presentation" class="active"><a data-toggle="tab" href="#barcodes"><b>BARCODES</b></a></li>';
             inlineQty += '<li role="presentation" class=""><a data-toggle="tab" href="#customers"><b>CUSTOMERS</b></a></li>';
         }
         
         inlineQty += '</ul></div>';
         
         // Tabs content
         inlineQty += '<div class="tab-content">';
         if (!isFinanceRole(userRole)) {
            inlineQty += '<div role="tabpanel" class="tab-pane active" id="barcodes">';
            inlineQty += dataTablePreview('barcodes');
            inlineQty += '</div>';

            inlineQty += '<div role="tabpanel" class="tab-pane" id="customers">';
            inlineQty += dataTablePreview('customers');
            inlineQty += '</div>';
         }
     
         
     
         

         if (isFinanceRole(userRole)) {
             inlineQty += '<div role="tabpanel" class="tab-pane active" id="invoices">';
             inlineQty += dataTablePreview('invoices');
             inlineQty += '</div>';
         } else if (isDataAdminRole(userRole)) {
            inlineQty += '<div role="tabpanel" class="tab-pane" id="invoices">';
            inlineQty += dataTablePreview('invoices');
            inlineQty += '</div>';
         }
         
         inlineQty += '</div></div>';
     
         return inlineQty;
     }

//      <div class="tab-content">
//     <div role="tabpanel" class="tab-pane fade in active" id="Commentary">Commentary WP_Query goes here.</div>
//     <div role="tabpanel" class="tab-pane fade" id="Videos">Videos WP_Query goes here.</div>
//     <div role="tabpanel" class="tab-pane fade" id="Events">Events WP_Query goes here.</div>
//   </div>
 
     function tabs2() {
         var inlineQty = '<div class="tabs" style:"overflow: hidden">';
         inlineQty += '<ul class="nav nav-pills" style:"overflow: hidden">';
         inlineQty += '<li class="active"><a href="#barcodes">BARCODES</a></li>';
         inlineQty += '<li><a href="#invoices">INVOICES</a></li>';
         inlineQty += '<li><a href="#customers">CUSTOMERS</a></li>';
         inlineQty += '</ul>';
         inlineQty += '</div>';
 
         return inlineQty;
 
      }
      
     /**
      * The table that will display the tickets, based on their type.
      * @param   {String}    selector
      * @return  {String}    inlineQty
      */
      function dataTablePreview(selector) {
         var inlineQty = '<style>table#tickets-preview-' + selector + ' {font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px; }table#tickets-preview-' + selector + ' th{text-align: center;} .bolded{font-weight: bold;}</style>';
         inlineQty += '<div style="width: 95%; margin: auto">';
         inlineQty += '<table id="tickets-preview-' + selector + '" class="table table-responsive table-striped customer tablesorter" style="width: 100%; table-layout: fixed">';
         inlineQty += '<thead style="color: white;background-color: #379E8F;">';
         inlineQty += '<tr class="text-center">';
         inlineQty += '</tr>';
         inlineQty += '</thead>';
 
         inlineQty += '<tbody id="result_tickets_' + selector + '"></tbody>';
 
         inlineQty += '</table>';
         inlineQty += '</div>'
         return inlineQty;
     }
 
     /**
      * Whether the user is from the finance team, 
      * or a Data Systems Co-ordinator, MailPlus Administration or Administrator user.
      * @param   {Number} userRole
      * @returns {Boolean}
      */
     function isFinanceRole(userRole) {
         // 1001, 1031 and 1023 are finance roles
         // 1032 is the Data Systems Co-ordinator role (to be deleted in prod)
         // 1006 is the Mail Plus Administration role.
         // 3 is the Administrator role.
         return ((userRole == 1001 || userRole == 1031 || userRole == 1023));
     }
 
     /**
      * Whether the user is from the Data Systems Co-ordinator team,
      * or an administrator
      * @param   {Number} userRole
      * @returns {Boolean}
      */
     function isDataAdminRole(userRole){
         return ((userRole == 1032) || (userRole == 3) || (userRole == 1006));
     }
 
     function isNullorEmpty(strVal) {
         return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
     }
     
     return {
         onRequest: onRequest
     };
 
 });