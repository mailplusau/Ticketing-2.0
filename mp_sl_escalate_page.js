/**
 * 
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Description: Separate page for escalating ticket
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
     var userRole = runtime.getCurrentUser().role;

     if (role == 1000) {
         //Franchisee
         zee = runtime.getCurrentUser();
     } 
 
     function onRequest(context) {  
         
         if (context.request.method === 'GET') {
            var ticket_id = null;
            var customer_id = null;
            var customer_number = null;
            var selector_id = null;
            var selector_number = '';
            var selector_type = 'barcode_number';
            var date_created = '';
            var creator_name = '';
            var creator_id = null;
            var status_value = null;
            var status = '';
            var customer_name = '';
            var daytodayphone = '';
            var daytodayemail = '';
            var accountsphone = '';
            var accountsemail = '';
            var zee_id = null;
            var franchisee_name = '';
            var zee_main_contact_name = '';
            var zee_email = '';
            var zee_main_contact_phone = '';
            var zee_abn = '';
            var date_stock_used = '';
            var time_stock_used = '';
            var final_delivery_text = '';
            var selected_enquiry_status_id = null;
            var attachments_hyperlink = '';
            var maap_bank_account_number = null;
            var maap_parent_bank_account_number = null;
            var selected_invoice_method_id = null;
            var accounts_cc_email = '';
            var mpex_po_number = '';
            var customer_po_number = '';
            var terms = null;
            var customer_terms = '';
            var account_manager = {};
            var selected_invoice_cycle_id = null;
            var usage_report_id_1 = '';
            var usage_report_id_2 = '';
            var usage_report_id_3 = '';
            var usage_report_id_4 = '';
            var usage_report_array = [];
            var list_toll_issues = '';
            var list_resolved_toll_issues = '';
            var list_mp_ticket_issues = '';
            var list_resolved_mp_ticket_issues = '';
            var list_invoice_issues = '';
            var list_resolved_invoice_issues = '';
            var owner_list = '';
            var comment = '';
            var selected_label_id = null;
            var list_enquiry_mediums = '';
            var total_enquiry_count = 0;
            var chat_enquiry_count = 0;
            var phone_enquiry_count = 0;
            var email_enquiry_count = 0;
            var list_toll_emails = '';
            var params_email = {
                recipient: '',
                subject: '',
                body: '',
                cc: '',
                bcc: '',
                records: {},
                attachments_credit_memo_ids: [],
                attachments_usage_report_ids: [],
                attachments_invoice_ids: []
            };
            var customer_issue = '';
            var screenshot_file = '';
            var browser = '';
            var login_email_used = '';
            var operating_system = '';
            var phone_used = '';
            var old_sender_name = '';
            var old_sender_phone = '';
            var customer_number_email_sent = 'F';
            var customer_status_value = '';
            var customer_ticket_status = '';
            var customer_barcode_number = '';

            // Load params
            var params = context.request.parameters.custparam_params;

            log.debug({
                title: 'Params',
                details: params
            })

            if (!isNullorEmpty(params)) {
                params = JSON.parse(params);
                log.debug({
                    title: 'Params not empty',
                    details: params
                });

                // Coming from the ticket_contact page or the edit_ticket page
                if (!isNullorEmpty(params.selector_number) && !isNullorEmpty(params.selector_type)) {
                    selector_number = params.selector_number;
                    selector_type = params.selector_type;

                    //Coming from the ticket_contact page
                    if (!isNullorEmpty(params.custid)) {
                        customer_id = params.custid;
                    }

                    log.debug({
                        title: 'customer_id after ticket_contact_page : ',
                        details: customer_id
                    });
                        
                    // Coming from the edit_ticket page
                    if (!isNullorEmpty(params.ticket_id)) {
                        ticket_id = parseInt(params.ticket_id);
                        log.debug({
                            title: 'ticket id ISS',
                            details: ticket_id
                        });

                        // Load ticket data
                        var ticketRecord = record.load({ type: 'customrecord_mp_ticket', id: ticket_id });
                        date_created = ticketRecord.getValue({ fieldId: 'created' });
                        creator_name = ticketRecord.getText({ fieldId: 'custrecord_creator' });
                        creator_id = ticketRecord.getValue({ fieldId: 'custrecord_creator' });
                        status_value = ticketRecord.getValue({ fieldId: 'custrecord_ticket_status' });
                        status = ticketRecord.getText({ fieldId: 'custrecord_ticket_status' });
                        customer_id = ticketRecord.getValue({ fieldId: 'custrecord_customer1' });
                        customer_name = ticketRecord.getText({ fieldId: 'custrecord_customer1' });
                        zee_id = ticketRecord.getValue({ fieldId: 'custrecord_zee' });
                        selected_enquiry_status_id = ticketRecord.getValue({ fieldId: 'custrecord_enquiry_status' });
                        attachments_hyperlink = ticketRecord.getValue({ fieldId: 'custrecord_mp_ticket_attachments' });
                        selected_label_id = ticketRecord.getValue({ fieldId: 'custrecord_ticket_label' });
                        list_enquiry_mediums = ticketRecord.getValue({ fieldId: 'custrecord_enquiry_medium' });
                        list_enquiry_mediums = java2jsArray(list_enquiry_mediums);
                        total_enquiry_count = ticketRecord.getValue({ fieldId: 'custrecord_enquiry_count' });
                        chat_enquiry_count = ticketRecord.getValue({ fieldId: 'custrecord_chat_enquiry_count' });
                        phone_enquiry_count = ticketRecord.getValue({ fieldId: 'custrecord_phone_enquiry_count' });
                        email_enquiry_count = ticketRecord.getValue({ fieldId: 'custrecord_email_enquiry_count' });
                        customer_issue = ticketRecord.getValue({ fieldId: 'custrecord_customer_issue' });
                        screenshot_file = ticketRecord.getValue({ fieldId: 'custrecord_screenshot' });
                        browser = ticketRecord.getValue({ fieldId: 'custrecord_browser' });
                        login_email_used = ticketRecord.getValue({ fieldId: 'custrecord_login_email' });
                        operating_system = ticketRecord.getValue({ fieldId: 'custrecord_operating_system' });
                        phone_used = ticketRecord.getValue({ fieldId: 'custrecord_phone_used' });
                        customer_number = ticketRecord.getValue({ fieldId: 'custrecord_cust_number' });
                        old_sender_name = ticketRecord.getValue({ fieldId: 'custrecord_sender_name' });
                        old_sender_phone = ticketRecord.getValue({ fieldId: 'custrecord_sender_phone' });
                        customer_number_email_sent =  ticketRecord.getValue({ fieldId: 'custrecord_customer_number_email_sent' });
                        customer_status_value = ticketRecord.getValue({fieldId: 'custrecord_mp_ticket_customer_status'});
                        customer_ticket_status = ticketRecord.getText({fieldId: 'custrecord_mp_ticket_customer_status'});
                        customer_barcode_number = ticketRecord.getValue({ fieldId : 'custrecord_barcode_number'});
                        
                        if(isNullorEmpty(customer_id) && !isNullorEmpty(customer_number)){
                            var customer_search = search.load({ type: 'customer', id: 'customsearch_customer_name_2' });
                            customer_search.filters.push(search.createFilter({
                                name: 'entityid',
                                operator: 'haskeywords',
                                values: customer_number,
                            }));
                            customer_id = customer_search.run().getRange({ start: 0,end:1 })[0].getId();
                        }

                        if (!isNullorEmpty(customer_id)) {
                            //Load customer record and franchisee information
                            var customerRecord = record.load({ type: 'customer', id: customer_id });
                            customer_number = customerRecord.getValue({ fieldId: 'entityid' });
                            daytodayphone = customerRecord.getValue({ fieldId: 'phone' });
                            daytodayemail = customerRecord.getValue({ fieldId: 'custentity_email_service' });
                            terms = customerRecord.getValue({ fieldId: 'terms' });
                            customer_terms = customerRecord.getValue({ fieldId: 'custentity_finance_terms' }); 
                            // Account manager
                            var accountManagerSearch = search.load({ type: 'customer', id: 'customsearch3413' });
                            accountManagerSearch.filters.push(search.createFilter({
                                name: 'internalid',
                                join: null,
                                operator: search.Operator.ANYOF,
                                values: customer_id,
                            }))


                            var accountManagerResultSet = accountManagerSearch.run();
                            var accountManagerResult = accountManagerResultSet.getRange({ start: 0, end: 1 });
                            accountManagerResult = accountManagerResult[0];

                            if (!isNullorEmpty(accountManagerResult)) {
                                var account_manager_value = accountManagerResult.getValue({ name: "custrecord_sales_assigned", join: "CUSTRECORD_SALES_CUSTOMER", summary: null });
                                var account_manager_text = accountManagerResult.getText({ name: "custrecord_sales_assigned", join: "CUSTRECORD_SALES_CUSTOMER", summary: null });
                                if (!isNullorEmpty(account_manager_value)) {
                                    var account_manager_email = search.lookupFields({
                                        type: 'employee',
                                        id: account_manager_value,
                                        columns: 'email'
                                    });

                                    account_manager = {
                                        name: account_manager_text,
                                        email: account_manager_email
                                    };
                                }
                            }

                            // The Franchisee informations are imported from the customer record if possible.
                            zee_id = customerRecord.getValue({ fieldId: 'partner' });
                        }

                        if (!isNullorEmpty(zee_id)) {
                            var zeeRecord = record.load({ type: 'partner', id: zee_id });
                            franchisee_name = zeeRecord.getValue({ fieldId: 'companyname' });
                            zee_main_contact_name = zeeRecord.getValue({ fieldId: 'custentity3' });
                            zee_email = zeeRecord.getValue({ fieldId: 'email' });
                            zee_main_contact_phone = zeeRecord.getValue({ fieldId: 'custentity2' });
                            zee_abn = zeeRecord.getValue({ fieldId: 'custentity_abn_franchiserecord' });
                        } else {
                            franchisee_name = ticketRecord.getText({ fieldId: 'custrecord_zee' });
                        }

                        switch (selector_type) {

                            case 'barcode_number':
                                selector_id = ticketRecord.getValue({ fieldId: 'custrecord_barcode_number' });
                                var stock_used = '';
                                if(!isNullorEmpty(selector_id)){
                                    //Come in here only if selector_id is not null
                                    stock_used = search.lookupFields({ type: 'customrecord_customer_product_stock', id: selector_id, columns: ['custrecord_cust_date_stock_used', 'custrecord_cust_time_stock_used'] });
                                    final_delivery_text = search.lookupFields({ type: 'customrecord_customer_product_stock', id: selector_id, columns: 'custrecord_cust_prod_stock_final_del' })["custrecord_cust_prod_stock_final_del"][0]["text"];
                                   
                                    date_stock_used = stock_used.custrecord_cust_date_stock_used;
                                    time_stock_used = stock_used.custrecord_cust_time_stock_used;
                                }

                                list_toll_issues = ticketRecord.getValue({ fieldId: 'custrecord_toll_issues' });
                                list_toll_issues = java2jsArray(list_toll_issues);

                                list_resolved_toll_issues = ticketRecord.getValue({ fieldId: 'custrecord_resolved_toll_issues' });
                                list_resolved_toll_issues = java2jsArray(list_resolved_toll_issues);

                                list_toll_emails = ticketRecord.getValue({ fieldId: 'custrecord_toll_emails' });
                                list_toll_emails = java2jsArray(list_toll_emails);
                                break;

                            case 'invoice_number':
                                selector_id = ticketRecord.getValue({ fieldId: 'custrecord_invoice_number' });
                                var invoiceRecord = record.load({ type: 'invoice', id: selector_id });

                                accountsphone = customerRecord.getValue({ fieldId: 'altphone' });
                                accountsemail = customerRecord.getValue({ fieldId: 'email' });

                                maap_bank_account_number = customerRecord.getValue({ fieldId: 'custentity_maap_bankacctno' });
                                maap_parent_bank_account_number = customerRecord.getValue({ fieldId: 'custentity_maap_bankacctno_parent' });

                                selected_invoice_method_id = customerRecord.getValue({ fieldId: 'custentity_invoice_method' });
                                accounts_cc_email = customerRecord.getValue({ fieldId: 'custentity_accounts_cc_email' });
                                mpex_po_number = customerRecord.getValue({ fieldId: 'custentity_mpex_po' });
                                customer_po_number = customerRecord.getValue({ fieldId: 'custentity11' });
                                selected_invoice_cycle_id = customerRecord.getValue({ fieldId: 'custentity_mpex_invoicing_cycle' });

                                usage_report_id_1 = invoiceRecord.getValue({ fieldId: 'custbody_mpex_usage_report' });
                                usage_report_id_2 = invoiceRecord.getValue({ fieldId: 'custbody_mpex_usage_report_2' });
                                usage_report_id_3 = invoiceRecord.getValue({ fieldId: 'custbody_mpex_usage_report_3' });
                                usage_report_id_4 = invoiceRecord.getValue({ fieldId: 'custbody_mpex_usage_report_4' });
                                var usage_report_id_array = [usage_report_id_1, usage_report_id_2, usage_report_id_3, usage_report_id_4];

                                usage_report_id_array.forEach(function (usage_report_id) {
                                    if (!isNullorEmpty(usage_report_id)) {
                                        var usage_report_file = file.load({
                                            id: usage_report_id
                                        });

                                        usage_report_name = usage_report_file.name;
                                        usage_report_link = usage_report_file.url;

                                        usage_report_array.push({
                                            id: usage_report_id,
                                            name: usage_report_name,
                                            url: usage_report_link
                                        });
                                    }
                                });

                                list_invoice_issues = ticketRecord.getValue({ fieldId: 'custrecord_invoice_issues' });
                                list_invoice_issues = java2jsArray(list_invoice_issues);

                                list_resolved_invoice_issues = ticketRecord.getValue({ fieldId: 'custrecord_resolved_invoice_issues'  });
                                list_resolved_invoice_issues = java2jsArray(list_resolved_invoice_issues);
                                break;
                        }

                        list_mp_ticket_issues = ticketRecord.getValue({ fieldId: 'custrecord_mp_ticket_issue'  });
                        list_mp_ticket_issues = java2jsArray(list_mp_ticket_issues);

                        list_resolved_mp_ticket_issues = ticketRecord.getValue({ fieldId: 'custrecord_resolved_mp_ticket_issue'  });
                        list_resolved_mp_ticket_issues = java2jsArray(list_resolved_mp_ticket_issues);

                        owner_list = ticketRecord.getValue({ fieldId: 'custrecord_owner'  });
                        owner_list = java2jsArray(owner_list);

                        comment = ticketRecord.getValue({ fieldId: 'custrecord_comment' });
                    }
                }
            }

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
    
            // Load Summernote css/js
            inlineHtml += '<link href="https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.9/summernote.css" rel="stylesheet">';
            inlineHtml += '<script src="https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.9/summernote.js"></script>';
    
            // Load bootstrap-select
            inlineHtml += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
            inlineHtml += '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';
    
            // Load Netsuite stylesheet and script
            inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
            inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
            inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
            inlineHtml += '<style>.mandatory{color:red;}</style>';

            // Define alert window.
            inlineHtml += '<div class="container" style="margin-top:14px;" hidden><div id="alert" class="alert alert-danger fade in"></div></div>';

            // Define information window.
            inlineHtml += '<div class="container" hidden><p id="info" class="alert alert-info"></p></div>';

            //inlineHtml += '<div style="background-color: #CFE0CE; min-height: 100vh; margin-top: -15px; padding-bottom: 50px"><br/>';
            inlineHtml += '<div style="margin-top: -40px"><br/>';

            inlineHtml += escalateButton(status_value);

            inlineHtml += '<h1 style="font-size: 25px; font-weight: 700; color: #103D39; text-align: center">Escalate Ticket - MPSD' + ticket_id + '</h1>';
            //Tabs
            inlineHtml += tabsSection(customer_number, ticket_id, selector_number, selector_id, selector_type, status_value, date_created, creator_id, creator_name, status, customer_id, customer_name, daytodayphone, daytodayemail, accountsphone, accountsemail, maap_bank_account_number, maap_parent_bank_account_number, zee_id, franchisee_name, zee_main_contact_name, zee_email, zee_main_contact_phone, zee_abn, date_stock_used, time_stock_used, final_delivery_text, selected_enquiry_status_id,attachments_hyperlink, list_enquiry_mediums, selected_enquiry_status_id, total_enquiry_count, chat_enquiry_count, phone_enquiry_count, email_enquiry_count, owner_list, list_toll_issues, list_resolved_toll_issues, comment, account_manager, list_toll_emails, customer_ticket_status, customer_barcode_number);
            inlineHtml += '</div>';

            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview_table'
            }).updateBreakType({
                breakType: ui.FieldBreakType.STARTROW
            }).defaultValue = inlineHtml;

            form.addField({
                id: 'custpage_selector_number',
                type: ui.FieldType.TEXT,
                label: 'Selector Number'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = selector_number;

            form.addField({
                id: 'custpage_selector_type',
                type: ui.FieldType.TEXT,
                label: 'Selector Type'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = selector_type;

            if (!isNullorEmpty(ticket_id)) {
                form.addField({
                    id: 'custpage_ticket_id',
                    type: ui.FieldType.TEXT,
                    label: 'Ticket ID'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = ticket_id;

            } else {
                form.addField({
                    id: 'custpage_ticket_id',
                    type: ui.FieldType.TEXT,
                    label: 'Ticket ID'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
            }

            form.addField({ id: 'custpage_selector_id', type: ui.FieldType.TEXT, label: 'Selector ID' }).updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN }).defaultValue = selector_id;
            form.addField({ id: 'custpage_selector_issue', type: ui.FieldType.TEXT, label: 'Barcode issue' }).updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN }).defaultValue = 'F';
            form.addField({ id: 'custpage_customer_id', type: ui.FieldType.TEXT, label: 'Customer ID' }).updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN }).defaultValue = customer_id;
            form.addField({ id: 'custpage_customer_number', type: ui.FieldType.TEXT, label: 'Customer Number' }).updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN }).defaultValue = customer_number;
            form.addField({ id: 'custpage_zee_id', type: ui.FieldType.TEXT, label: 'Franchisee ID' }).updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN }).defaultValue = zee_id;
            form.addField({ id: 'custpage_ticket_status_value', type: ui.FieldType.TEXT, label: 'Status Value' }).updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN }).defaultValue = status_value;
            form.addField({ id: 'custpage_created_ticket', type: ui.FieldType.TEXT, label: 'Created Ticket' }).updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN }).defaultValue = 'F';
            form.addField({ id: 'custpage_usage_report_array', type: ui.FieldType.TEXT, label: 'Usage Reports' }).updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN }).defaultValue = JSON.stringify(usage_report_array);
            form.addField({ id: 'custpage_param_email', type: ui.FieldType.TEXT, label: 'Email parameters' }).updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN }).defaultValue = JSON.stringify(params_email);
            form.addField({ id: 'custpage_ss_image', type: ui.FieldType.TEXT, label: 'Screenshot Image' }).updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN }).defaultValue = screenshot_file;
            form.addField({ id: 'custpage_customer_number_email_sent', type: ui.FieldType.TEXT, label: 'Customer Email Sent' }).updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN }).defaultValue = customer_number_email_sent;


            form.clientScriptFileId = 4813457;//SB=4797047 PROD = 4813457
            context.response.writePage(form);
         } else {
 
         }
     }
 
     /**
     * The output of .getFieldValues is a java String Array.
     * We want to convert it to a javaScript Array in order to read its values.
     * @param   {Ljava.lang.String}     javaArray
     * @return  {Array}                 jsArray
     */
    function java2jsArray(javaArray) {
        var jsArray = new Array;
        if (!isNullorEmpty(javaArray)) {
            javaArray.forEach(function(javaValue) {
                var jsValue = javaValue.toString();
                jsArray.push(jsValue);
            })
        }
        return jsArray;
    }


    /**
     * The "Customer number" input field. If there is a Ticket ID, then we are on the Edit Ticket page and
     * this field is pre-filled.
     * @param {*} customer_number 
     */
    function customerNumberSection(customer_number, ticket_id){
        if(isNullorEmpty(customer_number)){
            customer_number = '';
        }

        // var disable = isNullorEmpty(ticket_id) ? '': 'disabled';

        // Ticket details header
        var inlineQty = '<div class="form-group container tickets_details_header_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 heading2"  >';
        inlineQty += '<h4><span style="background-color: #379E8F" class="label label-default col-xs-12">TICKET DETAILS</span></h4>';
        inlineQty += '</div></div></div>';

        // Customer number section
        inlineQty += '<div class="form-group container customer_number_section">';
        inlineQty += '<div class="row">';

        //Customer number field
        inlineQty += '<div class="col-xs-12 customer_number">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="customer_number_text">CUSTOMER NUMBER</span>';

        if(customer_number == '' && isNullorEmpty(ticket_id)){
            inlineQty += '<input id="customer_number_value" value=" '+ customer_number +' " class="form-control customer_number">';
        }else{
            inlineQty += '<input id="customer_number_value" value=" '+ customer_number +' " class="form-control customer_number" disabled>';
        }
        inlineQty += '</div></div></div></div>';
        //Datatable for all tickets asscoiated to current customer number
        // inlineQty += '<div class="row">';
        // inlineQty += '<div class="form-group container customer_number_tickets">';
        // inlineQty += '<style> table {font-size: 12px;text-align: center;border: none;} {font-size: 14px;} table th{text-align: center;} .dataTables_wrapper{width:78%; margin-bottom:40px; margin-left: auto; margin-right: auto; margin-top: auto;} </style>';
        // inlineQty += '<table cellpadding="15" id="customer_number_tickets_preview" class="table table-responsive table-striped customer tablesorter" cellspacing="0" style="width: 100%;">';
        // inlineQty += '<thead style="color: white;background-color: #607799;">';
        // inlineQty += '<tr class="text-center">';
        // inlineQty += '</tr>';
        // inlineQty += '</thead></table>';
        // inlineQty += '</div></div>';

        return inlineQty;
    }

    function escalateButton(status) {
        if (status < 11) {
            return '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #379E8F; font-weight: 700; border-color: #379E8F; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="escalationbtn" onclick="">Escalate to 1st Escalation</button>';
        } else if (status == 11) {
            return '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #379E8F; font-weight: 700; border-color: #379E8F; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="escalationbtn" onclick="">Escalate to 2nd Escalation</button>'; 
        }else if (status == 12) {
            var html =  '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #379E8F; font-weight: 700; border-color: #379E8F; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="escalationbtn" onclick="">Escalate to 3rd Escalation</button>';
            html += '<button style="margin-left: 5px; margin-right: 5px; background-color: #FBEA51; color: #379E8F; font-weight: 700; border-color: #379E8F; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="removeescalationbtn" onclick="">Remove Escalation</button>';
            return html;
        } else if (status == 13) {
            var html = '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #379E8F; font-weight: 700; border-color: #379E8F; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="escalationbtn" onclick="">Escalate to Final Escalation</button>';
            html += '<button style="margin-left: 5px; margin-right: 5px; background-color: #FBEA51; color: #379E8F; font-weight: 700; border-color: #379E8F; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="removeescalationbtn" onclick="">Remove Escalation</button>';
            return html;
        } else {
            return '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #379E8F; font-weight: 700; border-color: #379E8F; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="removeescalationbtn" onclick="">Remove Escalation</button>';

        }
    }
    /**
     * The "Barcode number" OR "Invoice Number" input field.
     * If there is a TICKET ID, we are in the "Edit Ticket", so we display the Ticket ID field and the selector field is disabled.
     * @param   {Number}    ticket_id
     * @param   {String}    selector_number
     * @param   {Number}    selector_id
     * @param   {String}    selector_type
     * @param   {Number}    status_value
     * @return  {String}    inlineQty
     */
     function selectorSection(ticket_id, selector_number, selector_id, selector_type, status_value) {
        if (isNullorEmpty(selector_number)) {
            selector_number = '';
        }

        var inlineQty = '<div class="form-group container selector_section">';
        inlineQty += '<div class="row">';

        if (!isNullorEmpty(ticket_id)) {
            // Ticket ID field
            inlineQty += '<div class="col-xs-6 ticket_id">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="ticket_id_text">TICKET ID</span>';
            inlineQty += '<input id="ticket_id" value="MPSD' + ticket_id + '" class="form-control ticket_id" disabled />';
            inlineQty += '</div></div>';

            // Selector Number field
            inlineQty += '<div class="col-xs-6 selector_number">';
            inlineQty += '<div class="input-group">';
            switch (selector_type) {
                case 'barcode_number':
                    inlineQty += '<span class="input-group-addon" id="selector_text">BARCODE NUMBER</span>';
                    break;
                case 'invoice_number':
                    inlineQty += '<span class="input-group-addon" id="selector_text">INVOICE NUMBER</span>';
                    break;
            }
            inlineQty += '<input id="selector_value" value="' + selector_number + '" class="form-control selector_value" disabled>';
            if (selector_type == 'invoice_number') {
                // Open Invoice record
                inlineQty += '<div class="input-group-btn">';
                inlineQty += '<button id="open_inv" type="button" class="btn btn-default link_inv" data-inv-id="' + selector_id + '" data-toggle="tooltip" data-placement="top" title="Open Invoice">';
                inlineQty += '<span class="glyphicon glyphicon-link"></span>';
                inlineQty += '</button>';
                inlineQty += '</div>';

                // Attach Invoice to email
                if (isTicketNotClosed(status_value)) {
                    inlineQty += '<div class="input-group-btn"><button style="background-color: #379E8F" id="add_inv" type="button" class="btn btn-success add_inv" data-inv-id="' + selector_id + '" data-toggle="tooltip" data-placement="right" title="Attach to email">';
                    inlineQty += '<span class="glyphicon glyphicon-plus"></span>';
                    inlineQty += '</button></div>';
                }
            }
            inlineQty += '</div></div></div></div>';

        } else {
            inlineQty += '<div class="col-xs-12 selector_number">';
            inlineQty += '<div class="input-group">';
            //Input group addon text
            switch (selector_type) {
                case 'barcode_number':
                    inlineQty += '<span class="input-group-addon" id="selector_text">BARCODE NUMBER</span>';
                    break;
                case 'invoice_number':
                    inlineQty += '<span class="input-group-addon" id="selector_text">INVOICE NUMBER</span>';
                    break;
                case 'customer_issue':
                    inlineQty += '<span class="input-group-addon" id="selector_text">CUSTOMER ISSUE</span>';
                    break;
            }
            inlineQty += '<div class="input-group-btn">';
            inlineQty += '<button tabindex="-1" data-toggle="dropdown" class="btn btn-default dropdown-toggle" type="button">';
            inlineQty += '<span class="caret"></span>';
            inlineQty += '<span class="sr-only">Toggle Dropdown</span>';
            inlineQty += '</button>';
            inlineQty += '<ul class="dropdown-menu hide" style="list-style:none;margin: 2px 0 0;">';
            inlineQty += '<li><a href="#">BARCODE NUMBER</a></li>';
            inlineQty += '<li><a href="#">INVOICE NUMBER</a></li>';
            inlineQty += '<li><a href="#">CUSTOMER APP</a></li>';
            inlineQty += '<li><a href="#">CUSTOMER PORTAL</a></li>';
            inlineQty += '<li><a href="#">UPDATE LABEL</a></li>';
            inlineQty += '</ul>';
            inlineQty += '</div>';
            //Input text
            switch (selector_type) {

                case 'barcode_number':
                    inlineQty += '<input id="selector_value" class="form-control selector_value" placeholder="MPEN123456">';
                    break;
                case 'invoice_number':
                    inlineQty += '<input id="selector_value" class="form-control selector_value" placeholder="INV123456">';
                    break;
                case 'customer_app':
                    inlineQty += '<input id="selector_value" class="form-control selector_value" placeholder="Customer App" disabled value="Customer App">';
                    break;
                case 'customer_portal':
                    inlineQty += '<input id="selector_value" class="form-control selector_value" placeholder="Customer Portal" disabled value="Customer Portal">';
                    break;
                case 'update_label':
                    inlineQty += '<input id="selector_value" class="form-control selector_value" placeholder="Update Label" disabled value="Update Label">';
                    break;
            }
            inlineQty += '</div></div></div></div>';
        }

        return inlineQty;
    }

    /**
     * Used to pass the values of `date_from` and `date_to` between the scripts and to Netsuite for the records and the search.
     * @param   {String} date_iso       "2020-06-01"
     * @returns {String} date_netsuite  "1/6/2020"
     */
     function dateISOToNetsuite(date_iso) {
        var date_netsuite = '';
        if (!isNullorEmpty(date_iso)) {
            var date_netsuite = format.format({
                value: date_iso,
                type: format.Type.DATETIME
            });

        }
        return date_netsuite;
    }

    /**
         * The informations regarding the ticket being edited.
         * @param   {String}    date_created
         * @param   {Number}    creator_id
         * @param   {String}    creator_name
         * @param   {String}    status
         * @return  {String}    inlineQty
         */
    function ticketSection(date_created, creator_id, creator_name, status, customer_ticket_status) {
        if (isNullorEmpty(date_created)) {
            date_created = '';
        }
        if (isNullorEmpty(creator_name)) {
            creator_name = '';
        }
        if (isNullorEmpty(status)) {
            status = '';
        }

        var inlineQty = '<div class="form-group container created_status_section">';
        inlineQty += '<div class="row">';

        // Date created field
        inlineQty += '<div class="col-xs-6 date_created">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="date_created_text">DATE CREATED</span>';
        inlineQty += '<input id="date_created" value="' + date_created + '" class="form-control date_created" disabled />';
        inlineQty += '</div></div>';

        // Creator field
        inlineQty += '<div class="col-xs-6 creator">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="creator_text">CREATOR</span>';
        inlineQty += '<input id="creator" value="' + creator_name + '" data-creator-id="' + creator_id + '" class="form-control creator" disabled />';
        inlineQty += '</div></div></div></div>';

        // Status Section
        inlineQty += '<div class="form-group container status_section">';
        inlineQty += '<div class="row">';
        
        // Status field
        inlineQty += '<div class="col-xs-6 status">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="status_text">STATUS</span>';
        inlineQty += '<input id="status" value="' + status + '" class="form-control status" disabled />';
        inlineQty += '</div></div>';
        
        // Customer Status field
        inlineQty += '<div class="col-xs-6 status">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="status_text">CUSTOMER STATUS</span>';
        inlineQty += '<input id="status" value="' + customer_ticket_status + '" class="form-control status" disabled />';
        
        inlineQty += '</div></div></div></div>';

        return inlineQty;
    }

    /**
     * The Customer name field.
     * The customer name field should be automatically filled based on the Selector number value.
     * @param   {String}    customer_name
     * @return  {String}    inlineQty
     */
     function customerSection(customer_name) {
        if (isNullorEmpty(customer_name)) {
            customer_name = '';
        }

        // Customer Section
        var inlineQty = '<div class="form-group container customer_section">';
        inlineQty += '<div class="row">';
        // Customer name field
        inlineQty += '<div class="col-xs-12 customer_name">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="customer_name_text">CUSTOMER NAME</span>';
        inlineQty += '<input id="customer_name" value="' + customer_name + '" class="form-control customer_name" disabled>';
        inlineQty += '</div></div></div></div>';

        return inlineQty;
    }

    /**
     * The day to day phone and email fields of the customer.
     * These fields should be automatically filled based on the Selector number value.
     
    * @param   {String}    daytodayphone
    * @param   {String}    daytodayemail
    * @param   {Number}    status_value
    * @param   {String}    selector_type
    * @return  {String}    inlineQty
    */
     function daytodayContactSection(daytodayphone, daytodayemail, status_value, selector_type) {
        if (isNullorEmpty(daytodayphone)) {
            daytodayphone = '';
        }
        if (isNullorEmpty(daytodayemail)) {
            daytodayemail = '';
        }

        var disabled = 'disabled';
        if ((isFinanceRole(userRole)) && isTicketNotClosed(status_value) && selector_type == 'invoice_number') {
            disabled = '';
        }

        var inlineQty = '<div class="form-group container daytodaycontact_section">';
        inlineQty += '<div class="row">';

        // Day to day email field
        inlineQty += '<div class="col-xs-6 daytodayemail_div">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="daytodayemail_text">DAY-TO-DAY EMAIL</span>';
        inlineQty += '<input id="daytodayemail" type="email" value="' + daytodayemail + '" class="form-control daytodayemail" ' + disabled + ' />';
        inlineQty += '<div class="input-group-btn">';
        inlineQty += '<button type="button" style="background-color: #379E8F" class="btn btn-success add_as_recipient" data-email="' + daytodayemail + '" data-contact-id="" data-firstname="" data-toggle="tooltip" data-placement="right" title="Add as recipient">';
        inlineQty += '<span class="glyphicon glyphicon-envelope"></span>';
        inlineQty += '</button>';
        inlineQty += '</div>';
        inlineQty += '</div></div>';

        // Day to day phone field
        inlineQty += '<div class="col-xs-6 daytodayphone_div">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="daytodayphone_text">DAY-TO-DAY PHONE</span>';
        inlineQty += '<input id="daytodayphone" type="tel" value="' + daytodayphone + '" class="form-control daytodayphone" ' + disabled + ' />';
        inlineQty += '<div class="input-group-btn"><button type="button" style="background-color: #379E8F" class="btn btn-success" id="call_daytoday_phone"><span class="glyphicon glyphicon-earphone"></span></button></div>';
        inlineQty += '</div></div></div></div>';

        return inlineQty;
    }

    /**
     * The accounts phone and email fields of the customer.
     * These fields should be automatically filled based on the Invoice number value.
     * @param   {String}    accountsphone
     * @param   {String}    accountsemail
     * @param   {Number}    status_value
     * @param   {String}    selector_type
     * @return  {String}    inlineQty
     */
    function accountsContactSection(accountsphone, accountsemail, status_value, selector_type) {
        if (isNullorEmpty(accountsphone)) {
            accountsphone = '';
        }
        if (isNullorEmpty(accountsemail)) {
            accountsemail = '';
        }

        if (selector_type == 'invoice_number') {
            var inlineQty = '<div class="form-group container accountscontact_section">';

            if (isFinanceRole(userRole) && isTicketNotClosed(status_value)) {
                var disabled = '';
            } else {
                var disabled = 'disabled';
            }

        } else {
            var inlineQty = '<div class="form-group container accountscontact_section hide">';
            var disabled = 'disabled';
        }
        inlineQty += '<div class="row">';

        // Accounts email field
        inlineQty += '<div class="col-xs-6 accountsemail_div">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="accountsemail_text">ACCOUNTS EMAIL</span>';
        inlineQty += '<input id="accountsemail" type="email" value="' + accountsemail + '" class="form-control accountsemail" ' + disabled + ' />';
        inlineQty += '<div class="input-group-btn">';
        inlineQty += '<button type="button" class="btn btn-success add_as_recipient" data-email="' + accountsemail + '" data-contact-id="" data-firstname="" data-toggle="tooltip" data-placement="right" title="Add as recipient">';
        inlineQty += '<span class="glyphicon glyphicon-envelope"></span>';
        inlineQty += '</button>';
        inlineQty += '</div>';
        inlineQty += '</div></div>';

        // Accounts phone field
        inlineQty += '<div class="col-xs-6 accountsphone_div">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="accountsphone_text">ACCOUNTS PHONE</span>';
        inlineQty += '<input id="accountsphone" type="tel" value="' + accountsphone + '" class="form-control accountsphone" ' + disabled + ' />';
        inlineQty += '<div class="input-group-btn"><button type="button" style="background-color: #379E8F" class="btn btn-success" id="call_accounts_phone"><span class="glyphicon glyphicon-earphone"></span></button></div>';
        inlineQty += '</div></div></div></div>';

        return inlineQty;
    }

    /**
     * 
     * @param   {Number} maap_bank_account_number 
     * @param   {Number} maap_parent_bank_account_number 
     * @param   {String} selector_type
     * @returns {String} inlineQty
     */
     function maapBankAccountSection(maap_bank_account_number, maap_parent_bank_account_number, selector_type) {

        switch (selector_type) {
            case 'barcode_number':
                var inlineQty = '<div class="form-group container accounts_number_section hide">';
                break;

            case 'invoice_number':
                var inlineQty = '<div class="form-group container accounts_number_section">';
                break;
        }

        inlineQty += '<div class="row">';
        // MAAP Bank Account # field
        inlineQty += '<div class="col-xs-6 account_number_div">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="account_number_text">MAAP BANK ACCOUNT #</span>';
        inlineQty += '<input id="account_number" type="number" value="' + maap_bank_account_number + '" class="form-control account_number" disabled />';
        inlineQty += '</div></div>';

        // MAAP Parent Bank Account # field
        inlineQty += '<div class="col-xs-6 parent_account_number_div">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="parent_account_number_text">MAAP PARENT BANK ACCOUNT #</span>';
        inlineQty += '<input id="parent_account_number" type="number" value="' + maap_parent_bank_account_number + '" class="form-control parent_account_number" disabled />';
        inlineQty += '</div></div></div></div>';

        return inlineQty;
    }

    /**
     * The Franchisee name, and its main contact name and phone number fields.
     * These fields should be automatically filled based on the Selector number value.
     * @param   {String}    franchisee_name
     * @param   {String}    zee_main_contact_name
     * @param   {String}    zee_email
     * @param   {String}    zee_main_contact_phone
     * @param   {String}    zee_abn
     * @return  {String}    inlineQty
     */
     function franchiseeMainContactSection(franchisee_name, zee_main_contact_name, zee_email, zee_main_contact_phone, zee_abn) {
        if (isNullorEmpty(franchisee_name)) {
            franchisee_name = '';
        }
        if (isNullorEmpty(zee_main_contact_name)) {
            zee_main_contact_name = '';
        }
        if (isNullorEmpty(zee_email)) {
            zee_email = '';
        }
        if (isNullorEmpty(zee_main_contact_phone)) {
            zee_main_contact_phone = '';
        }
        if (isNullorEmpty(zee_abn)) {
            zee_abn = '';
        }

        var inlineQty = '<div class="form-group container zee_main_contact_section">';
        inlineQty += '<div class="row">';

        // Franchisee name field
        inlineQty += '<div class="col-xs-6 franchisee_name">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="franchisee_name_text">FRANCHISEE NAME</span>';
        inlineQty += '<input id="franchisee_name" value="' + franchisee_name + '" class="form-control franchisee_name" disabled>';
        inlineQty += '</div></div>';

        // Franchisee main contact name field
        inlineQty += '<div class="col-xs-6 zee_main_contact_name">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="zee_main_contact_name_text">MAIN CONTACT</span>';
        inlineQty += '<input id="zee_main_contact_name" value="' + zee_main_contact_name + '" class="form-control zee_main_contact_name" disabled>';
        inlineQty += '</div></div></div></div>';

        // Franchisee contact details
        inlineQty += '<div class="form-group container zee_main_contact_section">';
        inlineQty += '<div class="row">';
        // Franchisee email field
        inlineQty += '<div class="col-xs-12 zee_email">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="zee_email_text">FRANCHISEE EMAIL</span>';
        inlineQty += '<input id="zee_email" type="email" value="' + zee_email + '" class="form-control accountsemail" disabled />';
        inlineQty += '<div class="input-group-btn">';
        var zee_contact_id = '0';
        inlineQty += '<button type="button" style="background-color: #379E8F" class="btn btn-success add_as_recipient" data-email="' + zee_email + '" data-contact-id="' + zee_contact_id + '" data-firstname="' + franchisee_name + '" data-toggle="tooltip" data-placement="right" title="Add as recipient">';
        inlineQty += '<span class="glyphicon glyphicon-envelope"></span>';
        inlineQty += '</button>';
        inlineQty += '</div>';
        inlineQty += '</div></div></div></div>';

        // Franchisee phone and ABN details
        inlineQty += '<div class="form-group container zee_main_contact_section">';
        inlineQty += '<div class="row">';
        // Franchisee main contact phone field
        inlineQty += '<div class="col-xs-6 zee_main_contact_phone">'
        inlineQty += '<div class="input-group">'
        inlineQty += '<span class="input-group-addon" id="zee_main_contact_phone_text">FRANCHISEE PHONE</span>';
        inlineQty += '<input id="zee_main_contact_phone" type="tel" value="' + zee_main_contact_phone + '" class="form-control zee_main_contact_phone" disabled />';
        inlineQty += '<div class="input-group-btn"><button style="background-color: #379E8F" type="button" class="btn btn-success" id="call_zee_main_contact_phone"><span class="glyphicon glyphicon-earphone"></span></button>';
        inlineQty += '</div>';
        inlineQty += '</div></div>';

        // Franchisee ABN number
        inlineQty += '<div class="col-xs-6 zee_abn">'
        inlineQty += '<div class="input-group">'
        inlineQty += '<span class="input-group-addon" id="zee_abn_text">FRANCHISEE ABN</span>'
        inlineQty += '<input id="zee_abn" class="form-control zee_abn" value="' + zee_abn + '" disabled>'
        inlineQty += '</div></div></div></div>';

        return inlineQty;
    }

    /**
     * The MPEX Date and Time Stock used fields.
     * Visible only for the barcode records.
     * @param   {String} selector_type 
     * @param   {String} date_stock_used 
     * @param   {String} time_stock_used
     * @return  {String} inlineQty
     */
     function mpexStockUsedSection(selector_type, date_stock_used, time_stock_used) {
        if (isNullorEmpty(date_stock_used)) {
            date_stock_used = ''
        }
        if (isNullorEmpty(time_stock_used)) {
            time_stock_used = ''
        }

        var hide_class = (selector_type == 'barcode_number') ? '' : 'hide';

        // MPEX Stock Used Section
        var inlineQty = '<div class="form-group container mpex_stock_used_section ' + hide_class + '">';
        inlineQty += '<div class="row">';
        // Date Stock Used
        inlineQty += ' <div class="col-xs-6 date_stock_used">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="date_stock_used_text">DATE STOCK USED</span>';
        inlineQty += '<input id="date_stock_used" class="form-control date_stock_used" value="' + date_stock_used + '" disabled>';
        inlineQty += '</div></div>';
        // Time Stock Used
        inlineQty += '<div class="col-xs-6 time_stock_used">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="time_stock_used_text">TIME STOCK USED</span>';
        inlineQty += '<input id="time_stock_used" class="form-control time_stock_used" value="' + time_stock_used + '" disabled>';
        inlineQty += '</div></div></div></div>';

        return inlineQty;
    }

    /**
     * The MPEX Final Delivery field is visible only for the barcode records.
     * The Enquiry Status field is not disabled only for the ticket that have not yet been opened.
     * @param   {Number} status_value
     * @param   {String} selector_type 
     * @param   {String} final_delivery_text 
     * @param   {Number} selected_enquiry_status_id
     * @return  {String} inlineQty
     */
    function finalDeliveryEnquirySection(status_value, selector_type, final_delivery_text, selected_enquiry_status_id) {
        if (isNullorEmpty(final_delivery_text)) {
            final_delivery_text = ''
        }
        if (isNullorEmpty(selected_enquiry_status_id)) {
            selected_enquiry_status_id = ''
        }

        var barcode_hide_class = (selector_type == 'barcode_number') ? '' : 'hide';
        var nb_col_enquiry_section = (selector_type == 'barcode_number') ? '6' : '12';
        var enquiry_disabled = (isTicketNotClosed(status_value)) ? '' : 'disabled';

        // Final Delivery + Enquiry Status Section
        var inlineQty = '<div class="form-group container final_delivery_enquiry_status_section">';
        inlineQty += '<div class="row">';
        // Final Delivery
        inlineQty += '<div class="col-xs-6 final_delivery ' + barcode_hide_class + '">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="final_delivery_text">FINAL DELIVERY</span>';
        inlineQty += '<input id="final_delivery" class="form-control final_delivery" value="' + final_delivery_text + '" disabled>';
        inlineQty += '</div></div>';

        inlineQty += '</div></div>';

        return inlineQty;
    }

    /**
     * The Attachments field (an editable hyperlink)
     * @param   {String}    attachments_hyperlink 
     * @param   {Number}    status_value
     * @returns {String}    inlineQty
     */
     function attachmentsSection(attachments_hyperlink, status_value) {
        var inlineQty = '';
        if (!isNullorEmpty(attachments_hyperlink)) {
            var disabled = (isTicketNotClosed(status_value)) ? '' : 'disabled';
            inlineQty += '<div class="form-group container attachments_section">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 attachments_div">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="attachments_text">ATTACHMENTS</span>'
            inlineQty += '<input id="attachments" class="form-control attachments" type="url" value="' + attachments_hyperlink + '" ' + 'disabled' + '/>';
            inlineQty += '</div></div></div></div>';
        }

        

        return inlineQty;
    }

    /**
     * Section containing enquiry medium type and the enquiry status of the ticket enquiry
     * @param list_enquiry_mediums {String}atus and
     * @param total_enquiry_count {Number}
     * @param selector_type {String}
     * @param status_value {Number}
     * @returns {string}
     */
     function enquiryMediumSection(list_enquiry_mediums, selected_enquiry_status_id, selector_type){

        //Search for enquiry mediums
        var hasEnquiryMediums = (!isNullorEmpty(list_enquiry_mediums));
        var enquiryMediumColumns = new Array();
        enquiryMediumColumns[0] = search.createColumn({ name: 'name' });
        enquiryMediumColumns[1] = search.createColumn({ name: 'internalId' });
        var enquiryMediumResultSet = search.create({
            type: 'customlist_ticket_enquiry_mediums',
            columns: enquiryMediumColumns,
        });


        //Ticket Enquiry Header
        // var inlineQty = '<div class="form-group container ticket_enquiry_header_section">';
        // inlineQty += '<div class="row">';
        // inlineQty += '<div class="col-xs-12 heading2">';
        // inlineQty += '<h4><span style="background-color: #379E8F" class="label label-default col-xs-12">TICKET ENQUIRY DETAILS</span></h4>';
        // inlineQty += '</div></div></div>';

        //Enquiry Medium HTML
        var inlineQty = '<div class="form-group container enquiry_medium_section">';
        inlineQty += '<div class="row">';

        inlineQty += '<div class="col-xs-6 enquiry_medium_div">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="enquiry_medium_text">ENQUIRY MEDIUM</span>';
        inlineQty += '<select multiple id="enquiry_medium_status" class="form-control enquiry_medium_status" size="'+ enquiryMediumResultSet.length + '" disabled>';

        enquiryMediumResultSet.run().each(function (enquiryMediumResult) {
            var enquiryMediumName = enquiryMediumResult.getValue('name');
            var enquiryMediumId = enquiryMediumResult.getValue('internalId');
            var selected = false;
            if(hasEnquiryMediums){
                selected = (list_enquiry_mediums.indexOf(enquiryMediumId) !== -1);
            }

            if(selected) {
                inlineQty += '<option value="' + enquiryMediumId + '"selected>' + enquiryMediumName + '</option>';
            }else{
                inlineQty += '<option value="' + enquiryMediumId + '">' + enquiryMediumName + '</option>';
            }
            return true;
        });

        inlineQty += '</select>';
        inlineQty += '</div></div>';


        // Enquiry Status
        var enquiry_status_columns = new Array();
        enquiry_status_columns[0] = search.createColumn({ name: 'name' });
        enquiry_status_columns[1] = search.createColumn({ name: 'internalId' });
        var enquiryStatusResultSet = search.create({
            type: 'customlist_mp_ticket_enquiry',
            columns: enquiry_status_columns,
        });

        inlineQty += '<div class="col-xs-6 enquiry_status_div">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="enquiry_status_text">ENQUIRY STATUS</span>';
        inlineQty += '<select id="enquiry_status" class="form-control enquiry_status">';
        inlineQty += '<option></option>';

        enquiryStatusResultSet.run().each(function (enquiryStatusResult) {
            var enquiry_status_name = enquiryStatusResult.getValue('name');
            var enquiry_status_id = enquiryStatusResult.getValue('internalId');

            if (enquiry_status_id == selected_enquiry_status_id) {
                inlineQty += '<option value="' + enquiry_status_id + '" selected>' + enquiry_status_name + '</option>';
            } else {
                inlineQty += '<option value="' + enquiry_status_id + '">' + enquiry_status_name + '</option>';
            }
            return true;
        });
        inlineQty += '</select>';
        inlineQty += '</div></div></div></div>';

        return inlineQty;
    }

    /**
     * Section containing the total enquiry count and its breakdwn counts of chat, phone and email
     * @param total_enquiry_count
     * @param chat_enquiry_count
     * @param phone_enquiry_count
     * @param email_enquiry_count
     * @param selector_type
     * @returns {string}
     */
     function enquiryCountSection( total_enquiry_count, chat_enquiry_count, phone_enquiry_count, email_enquiry_count, selector_type){
        if (isNullorEmpty(total_enquiry_count)) { total_enquiry_count = 0;}
        if (isNullorEmpty(chat_enquiry_count)) { chat_enquiry_count = 0;}
        if (isNullorEmpty(phone_enquiry_count)) { phone_enquiry_count = 0;}
        if (isNullorEmpty(email_enquiry_count)) { email_enquiry_count = 0;}

        //Total Enquiry Count HTML
        var inlineQty = '<div class="form-group container enquiry_count_section">';
        inlineQty += '<div class="row">';

        inlineQty += '<div class="col-xs-12 total_enquiry_count_div">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="total_enquiry_count_text">ENQUIRY COUNT</span>';
        inlineQty += '<input id="total_enquiry_count" class="form-control enquiry_count" value="' + total_enquiry_count + '" disabled />';
        inlineQty += '</div></div></div></div>';

        //Enquiries by chat count
        inlineQty += '<div class="form-group container enquiry_count_breakdown_section">';
        inlineQty += '<div class="row">';

        inlineQty += '<div class="col-xs-4 enquiry_count_by_chat">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="enquiry_count_by_chat_text"> CHAT ENQUIRY </span>';
        inlineQty += '<input id="enquiry_count_by_chat" value="' + chat_enquiry_count + '" class="form-control enquiry_count_by_chat" disabled>';
        inlineQty += '<div class="input-group-btn">';
        inlineQty += '<button type="button" style="background-color: #379E8F" class="btn btn-success increment_enquiry_count_by_chat" data-firstname="" data-toggle="tooltip" data-placement="right" title="Increment Chat Enquiry Count">';
        inlineQty += '<span class="glyphicon glyphicon-plus"></span>';
        inlineQty += '</button>';
        inlineQty += '<button type="button" class="btn btn-danger decrement_enquiry_count_by_chat" data-firstname="" data-toggle="tooltip" data-placement="right" title="Decrement Chat Enquiry Count">';
        inlineQty += '<span class="glyphicon glyphicon-minus"></span>';
        inlineQty += '</button>';
        inlineQty += '</div></div></div>';

        inlineQty += '<div class="col-xs-4 enquiry_count_by_phone">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="enquiry_count_by_phone_text"> PHONE ENQUIRY </span>';
        inlineQty += '<input id="enquiry_count_by_phone" value="' + phone_enquiry_count + '" class="form-control enquiry_count_by_phone" disabled>';
        inlineQty += '<div class="input-group-btn">';
        inlineQty += '<button type="button" style="background-color: #379E8F" class="btn btn-success increment_enquiry_count_by_phone" data-firstname="" data-toggle="tooltip" data-placement="right" title="Increment Phone Enquiry Count">';
        inlineQty += '<span class="glyphicon glyphicon-plus"></span>';
        inlineQty += '</button>';
        inlineQty += '<button type="button" class="btn btn-danger decrement_enquiry_count_by_phone" data-firstname="" data-toggle="tooltip" data-placement="right" title="Decrement Phone Enquiry Count">';
        inlineQty += '<span class="glyphicon glyphicon-minus"></span>';
        inlineQty += '</button>';
        inlineQty += '</div></div></div>';

        inlineQty += '<div class="col-xs-4 enquiry_count_by_email">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="enquiry_count_by_email_text"> EMAIL ENQUIRY </span>';
        inlineQty += '<input id="enquiry_count_by_email" value="' + email_enquiry_count + '" class="form-control enquiry_count_by_email" disabled>';
        inlineQty += '<div class="input-group-btn">';
        inlineQty += '<button type="button" style="background-color: #379E8F" class="btn btn-success increment_enquiry_count_by_email" data-firstname="" data-toggle="tooltip" data-placement="right" title="Increment Email Enquiry Count">';
        inlineQty += '<span class="glyphicon glyphicon-plus"></span>';
        inlineQty += '</button>';
        inlineQty += '<button type="button" class="btn btn-danger decrement_enquiry_count_by_email" data-firstname="" data-toggle="tooltip" data-placement="right" title="Decrement Email Enquiry Count">';
        inlineQty += '<span class="glyphicon glyphicon-minus"></span>';
        inlineQty += '</button>';
        inlineQty += '</div></div></div></div></div>';

        return inlineQty;

    }

    /**
     * @return  {String}    inlineQty
     */
     function issuesHeader() {
        var inlineQty = '<div class="form-group container toll_issues_header_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 heading1">';
        inlineQty += '<h4><span style="background-color: #379E8F" class="form-group label label-default col-xs-12">ISSUES</span></h4>';
        inlineQty += '</div></div></div>';
        return inlineQty;
    }

    /**
     * @param   {Number}    status_value
     * @return  {String}    inlineQty
     */
     function reminderSection(status_value) {
        var hide_class = (!isTicketNotClosed(status_value)) ? 'hide' : '';

        var inlineQty = '<div class="form-group container reminder_section ' + hide_class + '">';
        inlineQty += '<div class="row">';
        // Reminder field
        inlineQty += '<div class="col-xs-12 reminder">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="reminder_text">REMINDER</span>';
        inlineQty += '<input id="reminder" class="form-control reminder" type="date" disabled />';
        inlineQty += '</div></div></div></div>';
        return inlineQty;
    }

    /**
     * Based on the selected MP Issue, an Owner is allocated to the ticket.
     * IT issues have priority over the other issues.
     * Populated with selectOwner() in the pageInit function on the client script.
     * @param   {Number}    ticket_id
     * @param   {Array}     owner_list
     * @param   {Number}    status_value
     * @return  {String}    inlineQty
     */
     function ownerSection(ticket_id, owner_list, status_value) {
        if (isNullorEmpty(ticket_id)) {
            // If ticket_id is null, owner_list as well.
            // In that case, only the creator of the ticket is pre-selected as the owner.
            var userId = runtime.getCurrentUser().toString();
            owner_list = [userId];
        }

        var disabled = (!isTicketNotClosed(status_value)) ? 'disabled' : '';

        var inlineQty = '<div class="form-group container owner_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 owner">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="owner_text">OWNER<span class="mandatory">*</span></span>';
        inlineQty += '<select multiple id="owner" class="form-control owner" ' + 'disabled' + '>';

        var employeeSearch = search.load({ type: 'employee', id: 'customsearch_active_employees' });
        var employeeResultSet = employeeSearch.run();
        employeeResultSet.each(function(employeeResult) {
            var employee_id = employeeResult.searchId;
            var employee_firstname = employeeResult.getValue('firstname');
            var employee_lastname = employeeResult.getValue('lastname');
            var employee_email = employeeResult.getValue('email');

            if (owner_list.indexOf(employee_id) != -1) {
                inlineQty += '<option value="' + employee_id + '" data-email="' + employee_email + '" selected>' + employee_firstname + ' ' + employee_lastname + '</option>';
            } else {
                inlineQty += '<option value="' + employee_id + '" data-email="' + employee_email + '">' + employee_firstname + ' ' + employee_lastname + '</option>';
            }
            return true;
        });

        inlineQty += '</select>';
        inlineQty += '</div></div></div></div>';

        return inlineQty;
    }

    /**
     * The multiselect TOLL issues dropdown
     * @param   {Array}     list_toll_issues
     * @param   {Array}     list_resolved_toll_issues
     * @param   {Number}    status_value
     * @param   {String}    selector_type
     * @return  {String}    inlineQty
     */
     function tollIssuesSection(list_toll_issues, list_resolved_toll_issues, status_value, selector_type) {
        // TOLL Issues
        var has_toll_issues = (!isNullorEmpty(list_toll_issues));
        var toll_issues_columns = new Array();
        toll_issues_columns[0] = search.createColumn({ name: 'name' });
        toll_issues_columns[1] = search.createColumn({ name: 'internalId' });
        var tollIssuesResultSet = search.create({ type: 'customlist_cust_prod_stock_toll_issues', columns: toll_issues_columns });

        if (!isTicketNotClosed(status_value) || selector_type != 'barcode_number') {
            var inlineQty = '<div class="form-group container toll_issues_section hide">';
        } else {
            var inlineQty = '<div class="form-group container toll_issues_section">';
        }
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 toll_issues">';
        inlineQty += '<div class="input-group"><span class="input-group-addon" id="toll_issues_text">TOLL ISSUES<span class="mandatory">*</span></span>';
        inlineQty += '<select multiple id="toll_issues" class="form-control toll_issues" disabled size="' + tollIssuesResultSet.length + '">';

        tollIssuesResultSet.run().each(function(tollIssueResult) {
            var issue_name = tollIssueResult.getValue('name');
            var issue_id = tollIssueResult.getValue('internalId');
            var selected = false;
            if (has_toll_issues) {
                selected = (list_toll_issues.indexOf(issue_id) !== -1);
            }

            if (selected) {
                inlineQty += '<option value="' + issue_id + '" selected>' + issue_name + '</option>';
            } else {
                inlineQty += '<option value="' + issue_id + '">' + issue_name + '</option>';
            }
            return true;
        });

        inlineQty += '</select>';
        inlineQty += '</div></div></div></div>';

        // Resolved TOLL Issues
        log.debug({ title: 'list_resolved_toll_issues : ', details: list_resolved_toll_issues });
        var has_resolved_toll_issues = (!isNullorEmpty(list_resolved_toll_issues));
        if (has_resolved_toll_issues) {
            var text_resolved_toll_issues = '';
            tollIssuesResultSet.run().each(function(tollIssueResult) {
                var issue_name = tollIssueResult.getValue('name');
                var issue_id = tollIssueResult.getValue('internalId');
                if (list_resolved_toll_issues.indexOf(issue_id) !== -1) {
                    text_resolved_toll_issues += issue_name + '\n';
                }
            });
            log.debug({ title: 'text_resolved_toll_issues : ', details: text_resolved_toll_issues });
            inlineQty += '<div class="form-group container resolved_toll_issues_section">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 resolved_toll_issues">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="resolved_toll_issues_text">RESOLVED TOLL ISSUES</span>';
            inlineQty += '<textarea id="resolved_toll_issues" class="form-control resolved_toll_issues" rows="' + list_resolved_toll_issues.length + '" disabled>' + text_resolved_toll_issues.trim() + '</textarea>';
            inlineQty += '</div></div></div></div>';
        }

        return inlineQty;
    };

     /**
     * The free-from text area for comments.
     * @param   {String}    comment
     * @param   {String}    selector_type
     * @param   {Number}    status_value
     * @return  {String}    inlineQty
     */
      function commentSection(comment, selector_type, status_value) {
        if (isNullorEmpty(comment)) {
            comment = '';
        } else {
            comment += '\n';
        }

        switch (selector_type) {
            case 'barcode_number':
                var inlineQty = '<div class="form-group container comment_section">';
                break;
            case 'invoice_number':
                var inlineQty = '<div class="form-group container comment_section hide">';
                break;
            case 'customer_issue':
                var inlineQty = '<div class="form-group container comment_section">';
                break;

        }
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 comment">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="comment_text">COMMENT<span class="mandatory hide">*</span></span>';
        if (isTicketNotClosed(status_value)) {
            inlineQty += '<textarea id="comment" class="form-control comment" rows="3" disabled>' + comment + '</textarea>';
        } else {
            inlineQty += '<textarea id="comment" class="form-control comment" rows="3" disabled readonly>' + comment + '</textarea>';
        }
        inlineQty += '</div></div></div></div>';

        return inlineQty;
    }


    /**
     * The customer contact details section.
     * Possibility for the user to add / edit the contacts.
     * @return  {String}    inlineQty
     */
     function mpexContactSection() {

        // Contact details header
        var inlineQty = '<div class="form-group container mpex_contact_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 heading2">';
        inlineQty += '<h4><span style="background-color: #379E8F" class="label label-default col-xs-12">CONTACT DETAILS</span></h4>';
        inlineQty += '</div>';
        inlineQty += '</div></div>';

        // Contact table
        inlineQty += '<div class="form-group container contacts_section" style="font-size: small;">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 contacts_div">';
        // Since the table is not displayed correctly when added through suitelet, 
        // It is added with jQuery in the pageInit() function in the client script 'mp_cl_open_ticket.js'.
        inlineQty += '</div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        // Add/edit contacts button
        inlineQty += '<div class="form-group container reviewcontacts_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-4 col-xs-offset-4 reviewcontacts">';
        inlineQty += '<input type="button" style="background-color: #379E8F; border-color: #379E8F; font-weight: 700" value="ADD/EDIT CONTACTS" class="form-control btn btn-primary" id="reviewcontacts" />';
        inlineQty += '</div></div></div>';

        return inlineQty;
    };

    /*
    * @param   {String}    daytodayphone
    * @param   {String}    daytodayemail
    * @param   {Number}    status_value
    * @param   {String}    selector_type
    * @return  {String}    inlineQty
    */
    function receiverEmailPhone(customer_barcode_number, status_value, selector_type) {

        var disabled = 'disabled';
        var inlineQty = '';
        // if (isTicketNotClosed(status_value) && selector_type == 'barcode_number') {
        //     disabled = '';
        // }

        if (selector_type == 'barcode_number') { 
            var rec = record.load({
                type: 'customrecord_customer_product_stock',
                id: customer_barcode_number,
            });
            
            var receiveremail = rec.getValue({fieldId: 'custrecord_receiver_email'});
            var receiverphone = rec.getValue({fieldId: 'custrecord_receiver_phone'});
    
            inlineQty += '<div class="form-group container receivercontact_section">';
            inlineQty += '<div class="row">';
    
            // Day to day email field
            inlineQty += '<div class="col-xs-6 receiveremail_div">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="receiveremail_text">RECEIVER EMAIL</span>';
            inlineQty += '<input id="receiveremail" type="email" value="' + receiveremail + '" class="form-control receiveremail" ' + disabled + ' />';
            inlineQty += '<div class="input-group-btn">';
            inlineQty += '<button type="button" style="background-color: #379E8F" class="btn btn-success add_as_recipient" data-email="' + receiveremail + '" data-contact-id="" data-firstname="" data-toggle="tooltip" data-placement="right" title="Add as recipient">';
            inlineQty += '<span class="glyphicon glyphicon-envelope"></span>';
            inlineQty += '</button>';
            inlineQty += '</div>';
            inlineQty += '</div></div>';
    
            // Day to day phone field
            inlineQty += '<div class="col-xs-6 receiverphone_div">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="receiverphone_text">RECEIVER PHONE</span>';
            inlineQty += '<input id="receiverphone" type="tel" value="' + receiverphone + '" class="form-control receiverphone" ' + disabled + ' />';
            inlineQty += '<div class="input-group-btn"><button type="button" style="background-color: #379E8F" class="btn btn-success" id="call_receiver_phone"><span class="glyphicon glyphicon-earphone"></span></button></div>';
            inlineQty += '</div></div></div></div>';
        }
        

        return inlineQty;
    }

    /**
     * The "Send Email" section.
     * Possibility for the user to send an email to the customer, based on selected templates.
     * @param   {Number}    ticket_id 
     * @param   {Number}    status_value
     * @param   {Object}    account_manager
     * @returns {String}    inlineQty
     */
     function sendEmailSection(ticket_id, status_value, account_manager, list_toll_emails) {
        var has_toll_emails = (!isNullorEmpty(list_toll_emails));
        if (isNullorEmpty(ticket_id) || !isTicketNotClosed(status_value)) {
            // The section is hidden here rather than in the openTicket function,
            // because we use the section to send an acknoledgement email when a ticket is opened.
            var inlineQty = '<div id="send_email_container" class="send_email hide">';
        } else {
            var inlineQty = '<div id="send_email_container" class="send_email">';
        }
        inlineQty += '<div class="form-group container send_email header_section">';

        // Send email header
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 heading2">';
        inlineQty += '<h4><span style="background-color: #379E8F" class="label label-default col-xs-12">SEND EMAILS</span></h4>';
        inlineQty += '</div></div></div>';

        inlineQty += '<br></br>'
        // Row addressees
        inlineQty += '<div class="form-group container send_email adressees_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 to_section">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon">TO<span class="mandatory">*</span></span>';
        inlineQty += '<input id="send_to" class="form-control" data-contact-id="" data-firstname=""/>';
        inlineQty += '</div></div></div></div>';

        // Toll addresses
        var toll_emails_columns = new Array();
        toll_emails_columns[0] = search.createColumn({ name: 'name' });
        toll_emails_columns[1] = search.createColumn({ name: 'internalId' });
        var tollEmailsResultSet = search.create({
            type: 'customlist_toll_emails',
            columns: toll_emails_columns,
        })

        inlineQty += '<div class="form-group container send_email toll_adressees_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 toll_section">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon">TOLL EMAILS</span>';
        inlineQty += '<select multiple id="send_toll" class="form-control" size="' + tollEmailsResultSet.length + '"/>';

        tollEmailsResultSet.run().each(function (tollEmailsResultSet){
            var tollEmailName = tollEmailsResultSet.getValue('name');
            var tollEmailId = tollEmailsResultSet.getValue('internalId');
            var selected = false;

            if(has_toll_emails) {
                selected = (list_toll_emails.indexOf(tollEmailId) !== -1);
            }

            if (selected) {
                inlineQty += '<option value="' + tollEmailId + '" selected>' + tollEmailName + '</option>';
            } else {
                inlineQty += '<option value="' + tollEmailId + '">' + tollEmailName + '</option>';
            }
            return true;
        });

        inlineQty += '</select>';
        inlineQty += '</div></div></div></div>';


        // Row ccs addresses
        inlineQty += '<div class="form-group container send_email cc_adressees_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-6 cc_section">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon">CC</span>';
        inlineQty += '<input id="send_cc" class="form-control"/>';
        inlineQty += '</div></div>';
        inlineQty += '<div class="col-xs-6 bcc_section">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon">BCC</span>';
        inlineQty += '<input id="send_bcc" class="form-control"/>';
        inlineQty += '</div></div></div></div>';


        // Row account manager
        if (isNullorEmpty(account_manager.name)) {
            account_manager.name = ''
        }
        if (isNullorEmpty(account_manager.email)) {
            account_manager.email = ''
        }

        if (!isNullorEmpty(account_manager.email.email)) {
            inlineQty += '<div class="form-group container send_email acc_manager_section">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-10 acc_manager_name_section">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon">ACCOUNT MANAGER</span>';
            inlineQty += '<input id="acc_manager" class="form-control" data-email="' + account_manager.email.email + '" value="' + account_manager.name + ' - ' + account_manager.email.email + '" disabled/>';
            inlineQty += '</div></div>';
            inlineQty += '<div class="col-xs-2 acc_manager_button_section">';
            inlineQty += '<button id="acc_manager_button" style="background-color: #379E8F; border-color: #379E8F" type="button" class="btn btn-success btn-block">ADD TO CC</button>';
            inlineQty += '</div></div></div>';
        }

        // Row Template
        inlineQty += '<div class="form-group container send_email template_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 template_section">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon">TEMPLATE<span class="mandatory">*</span></span>';
        inlineQty += '<select id="template" class="form-control">';
        inlineQty += '<option></option>';

        // Load the template options
        var templatesSearch = search.load({
            id: 'customsearch_cctemplate_mp_ticket',
            type: 'customrecord_camp_comm_template'
        });

        var templatesSearchResults = templatesSearch.run();
        templatesSearchResults.each(function(templatesSearchResult) {
            // var tempId = templatesSearchResult.getValue('internalid');
            
            var tempId = templatesSearchResult["id"];
            var tempName = templatesSearchResult.getValue('name');
            inlineQty += '<option value="' + tempId + '">' + tempName + '</option>';
            return true;
        });

        inlineQty += '</select>';
        inlineQty += '</div></div></div></div>';

        // Row Subject
        inlineQty += '<div class="form-group container send_email subject_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 subject_section">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon">SUBJECT<span class="mandatory">*</span></span>';
        inlineQty += '<input id="subject" class="form-control" />';
        inlineQty += '</div></div></div></div>';

        // Row Body
        inlineQty += '<div class="form-group container send_email body_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 body_section">';
        inlineQty += '<div id="email_body"></div>';
        inlineQty += '</div></div></div>';

        // SEND EMAIL button
        inlineQty += '<div class="form-group container send_email button_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-4 col-xs-offset-4 send_email_btn">';
        inlineQty += '<input type="button" style="background-color: #379E8F; border-color: #379E8F; font-weight: 700" value="SEND EMAIL" class="form-control btn btn-primary" id="send_email" />';
        inlineQty += '</div></div></div></div>';

        return inlineQty;
    };

    function tabsSection(customer_number, ticket_id, selector_number, selector_id, selector_type, status_value, date_created, creator_id, creator_name, status, customer_id, customer_name, daytodayphone, daytodayemail, accountsphone, accountsemail, maap_bank_account_number, maap_parent_bank_account_number, zee_id, franchisee_name, zee_main_contact_name, zee_email, zee_main_contact_phone, zee_abn, date_stock_used, time_stock_used, final_delivery_text, selected_enquiry_status_id,attachments_hyperlink, list_enquiry_mediums, selected_enquiry_status_id, total_enquiry_count, chat_enquiry_count, phone_enquiry_count, email_enquiry_count, owner_list, list_toll_issues, list_resolved_toll_issues, comment, account_manager, list_toll_emails, customer_ticket_status, customer_barcode_number) {
        var inlineQty = '<br/><div >';

        // Tabs headers
        inlineQty += '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #379E8F; color: #fff }';
        inlineQty += '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #379E8F; color: #379E8F; }';
        inlineQty += '</style>';
        
        // Ticket details header
        inlineQty += '<div class="form-group container tickets_details_header_section" style="margin-top: 10px">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12"  >';
        inlineQty += '<span">';
        inlineQty += '<ul class="nav nav-pills nav-justified" style="margin:0%; ">';


        inlineQty += '<li role="presentation" class="active"><a data-toggle="tab" href="#ticketdetails"><b>TICKET DETAILS</b></a></li>';
        inlineQty += '<li role="presentation" class=""><a data-toggle="tab" href="#sendemails"><b>SEND EMAILS</b></a></li>';
        
    
        inlineQty += '</ul>';
        inlineQty += '</span>';
        inlineQty += '</div></div></div>';

        // Tabs content
        inlineQty += '<div class="tab-content">';
        // TICKET DETAILS TAB
        inlineQty += '<div role="tabpanel" class="tab-pane active" id="ticketdetails">';
        inlineQty += customerNumberSection(customer_number, ticket_id);
        inlineQty += selectorSection(ticket_id, selector_number, selector_id, selector_type, status_value);
        if (!isNullorEmpty(ticket_id)) {
            inlineQty += receiverEmailPhone(customer_barcode_number, status_value, selector_type);
            inlineQty += ticketSection(dateISOToNetsuite(date_created), creator_id, creator_name, status, customer_ticket_status);
        }
        if (isNullorEmpty(ticket_id) || (!isNullorEmpty(ticket_id) && !isNullorEmpty(customer_id)) || !isNullorEmpty(customer_number)) {
            inlineQty += customerSection(customer_name);
            inlineQty += daytodayContactSection(daytodayphone, daytodayemail, status_value, selector_type);
            inlineQty += accountsContactSection(accountsphone, accountsemail, status_value, selector_type);
        }

        if(isNullorEmpty(ticket_id) || (!isNullorEmpty(ticket_id) && (selector_type == 'invoice_section'))) {
            inlineQty += maapBankAccountSection(maap_bank_account_number, maap_parent_bank_account_number, selector_type);
        }

        if (isNullorEmpty(ticket_id) || (!isNullorEmpty(ticket_id) && !isNullorEmpty(zee_id)) || !isNullorEmpty(customer_number)) {
            inlineQty += franchiseeMainContactSection(franchisee_name, zee_main_contact_name, zee_email, zee_main_contact_phone, zee_abn);
        }

        inlineQty += mpexStockUsedSection(selector_type, date_stock_used, time_stock_used);
        inlineQty += finalDeliveryEnquirySection(status_value, selector_type, final_delivery_text, selected_enquiry_status_id);
        inlineQty += attachmentsSection(attachments_hyperlink, status_value);
        
        // ENQUIRY SECTION
        //inlineQty += enquiryMediumSection(list_enquiry_mediums, selected_enquiry_status_id, selector_type)
        //inlineQty += enquiryCountSection( total_enquiry_count, chat_enquiry_count, phone_enquiry_count, email_enquiry_count, selector_type);
        //TICKET LABEL DROPDOWN
        //inlineQty += labelSection(selected_label_id, selector_type, status_value);
        //inlineQty += closeReopenSubmitTicketButton(ticket_id, status_value);

        inlineQty += issuesHeader();
        inlineQty += reminderSection(status_value);
        inlineQty += ownerSection(ticket_id, owner_list, status_value);
        inlineQty += tollIssuesSection(list_toll_issues, list_resolved_toll_issues, status_value, selector_type);
        inlineQty += commentSection(comment, selector_type, status_value);
        inlineQty += '</div>';

        // CONTACT / EMAILS
        if (!isNullorEmpty(ticket_id)) {
            inlineQty += '<div role="tabpanel" class="tab-pane" id="sendemails">';
            inlineQty += mpexContactSection();
            inlineQty += sendEmailSection(ticket_id, status_value, account_manager, list_toll_emails);
            //inlineQty += closeReopenSubmitTicketButton(ticket_id, status_value);

            inlineQty += '</div>';
        }
        inlineQty += '</div></div>';

        return inlineQty;
    }

    /**
     * Returns whether a ticket is closed or not based on its status value.
     * @param   {Number}    status_value
     * @returns {Boolean}   is_ticket_closed
     */
     function isTicketNotClosed(status_value) {
        var is_ticket_not_closed = ((status_value != 3) && (status_value != 8)) ? true : false;
        return is_ticket_not_closed;
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
        return ((userRole == 1001 || userRole == 1031 || userRole == 1023) || ((userRole == 1032) || (userRole == 1006) || (userRole == 3)));
    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }
     
    return {
        onRequest: onRequest
    };
 
});