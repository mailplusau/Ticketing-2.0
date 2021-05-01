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
         zee = runtime.getCurrentUser();
     } 
 
     function onRequest(context) {  
         
        log.debug({
            title: "context.request.method",
            details: context.request.method
        });
        log.debug({
            title: "context.request",
            details: context.request
        });
        log.debug({
            title: "context.request.parameters",
            details: context.request.parameters
        });

        // website- tracking/barcode
        var tracking_number = context.request.parameters.tracking_number;
        tracking_number = tracking_number.toUpperCase();
        var barcode = true;

        if (tracking_number.startsWith("MPSD")) {
            barcode = false;
        }

        var ticketSearch = search.load({
            id: 'customsearch_mp_ticket',
            type: 'customrecord_mp_ticket'
        });

        
        if (!barcode) {
            ticketSearch.filters.push(search.createFilter({
                name: 'name',
                values: tracking_number,
            }));
        } else {
            ticketSearch.filters.push(search.createFilter({
                name: 'altname',
                values: tracking_number,
            }));
        }


        var searchResultCount = ticketSearch.runPaged().count;

        if (searchResultCount > 0) {
            // send email based on status
            // send email to customer and CS team?
            var ticketResults = ticketSearch.run();
            var ticketStatus; 
            var ticket_id;
            //ADD LIST TO MP TICKET RECORD
            ticketResults.each(function(ticket) { 
                ticketStatus = ticket.getValue('custrecord_mp_ticket_customer_status');
                ticket_id = ticket.getValue('internalid');
            });

            // send emails!!
            if (ticketStatus == 1) {
                sendCustomerTicketEmail();
            } else if (ticketStatus == 2) {

            } else if (ticketStatus == 3) {

            } else if (ticketStatus == 4) {

            } else if (ticketStatus == 5) {

            } else {

            }

        } else {
            // No results found- send email to customer directing to new ticket page
            sendCustomerTicketEmail();
        }


        

        
        

        //  if (context.request.method === 'GET') {
        //      //barcode number or ticket number
        //      // if it's on 1st escalation- send 1st escalation email to customer- check which email
        //      // if it hasn't been escalated- under investigation? check which email template to send
        //      // if no active ticket for barcode- there'll be another email sent with a link to create that ticket

        //      // create new ticket suitelet
        //      // 2 types: receiver & sender (in the ticket record, add a notes field andstore what's coming from the webform)
        //      // create another field for whether if it's coming from sender or receiver
        //      // send another email with customer service
        //      // send an acknowledgement email to whatever email address has been selected (66)
        //  } else {
 
        //  }
     }
 
     /**
         * Function to sent emails when a customer associated ticket is opened
         */
      function sendCustomerTicketEmail(ticket_id, customer_number, selector_type, selector_number, browser, os, login_email_used, sender_name, sender_phone, send_to) {
        if (isNullorEmpty(browser)) {
            browser = " - "
        };
        if (isNullorEmpty(os)) {
            os = " - "
        };
        if (isNullorEmpty(login_email_used)) {
            login_email_used = " - "
        };
        if (isNullorEmpty(sender_name)) {
            sender_name = " - "
        };
        if (isNullorEmpty(sender_phone)) {
            sender_phone = " - "
        };

        var url = "https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=974&deploy=1&compid=1048144&";

        if (runtime.envType == "SANDBOX") {
            var url = "https://1048144-sb3.app.netsuite.com/app/site/hosting/scriptlet.nl?script=974&deploy=1&compid=1048144_SB3";
        }

        var contactEmail = ["sruti.desai@mailplus.com.au"];

        var custparam_params = new Object();
        custparam_params['ticket_id'] = parseInt(ticket_id);
        custparam_params['selector_number'] = selector_number;
        custparam_params['selector_type'] = selector_type;

        var ticket_url = url + "&custparam_params=" + encodeURIComponent(JSON.stringify(custparam_params));

        var subject = 'MPSD' + ticket_id + ' - New Customer Ticket Opened';
        var body = '' + selector_number + '  Ticket Details <br>';
        body += 'Customer number : ' + customer_number + ' <br>';
        body += 'Login email used : ' + login_email_used + ' <br>';

        switch (selector_number) {
            case 'Customer App':
                body += 'Browser : ' + browser + ' <br>';
                body += 'Operating system : ' + os + ' <br>';
                break;
            case 'Customer Portal':
                body += 'Browser : ' + browser + ' <br>';
                break;
            case 'Update Label':
                body += 'Sender name : ' + sender_name + ' <br>';
                body += 'Sender phone : ' + sender_phone + ' <br>';
                break;
        }

        body += '<a href="' + ticket_url + '"> Open ticket page </a><br>';
        body += 'Next reminder time: ' + getNextReminderTime() + ' <br>';

        var file = $('#screenshot_image')[0];
        if (file && (typeof file.files[0] != 'undefined')) {
            file = file.files[0];
            if ((file.type == "image/jpeg" || file.type == "image/png") && (file.name)) {
                var fr = new FileReader();
                fr.onload = function(e) {
                    body += '<img src=" ' + e.target.result + '">';
                    if (!isNullorEmpty(send_to)) {
                        email.send({
                            author: userId,
                            body: body,
                            recipients: send_to,
                            subject: subject,
                            cc: contactEmail,
                        })
                    }
                }
                fr.readAsDataURL(file);
            }
        } else {
            if (!isNullorEmpty(send_to)) {
                email.send({
                    author: userId,
                    body: body,
                    recipients: send_to,
                    subject: subject,
                    cc: contactEmail,
                })
            }
        }
    }

     function isNullorEmpty(strVal) {
         return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
     }
     
     return {
         onRequest: onRequest
     };
 
 });