/**
 * 
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Description: 
 * @Last Modified by: Sruti Desai
 * 
 */


 define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/https', 'N/log', 'N/redirect', 'N/format', 'N/url'], 
 function(ui, email, runtime, search, record, https, log, redirect, format, url) {
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
        var tracking_number = context.request.parameters.barcode;
        var sender_or_receiver = context.request.parameters.sender_or_receiver;
        var email = context.request.parameters.email;

        tracking_number = tracking_number.toUpperCase();
        var barcode = true;

        log.debug({
            title: 'tracking_number',
            details: tracking_number.toString()
        });

        if (tracking_number.indexOf("MPSD") === 0 ) {
            barcode = false;
        }

        // checks all tickets
        var openTicketSearch = search.load({
            id: 'customsearch_mp_ticket_2',
            type: 'customrecord_mp_ticket'
        });

        
        if (!barcode) {
            openTicketSearch.filters.push(search.createFilter({
                name: 'formulatext',
                operator: search.Operator.IS,
                values: tracking_number,
                formula: '{name}'
            }));
        } else {
            openTicketSearch.filters.push(search.createFilter({
                name: 'formulatext',
                operator: search.Operator.IS,
                values: tracking_number,
                formula: '{custrecord_barcode_number}'
            }));
        }

        // count of results for search
        var openTicketsCount = openTicketSearch.runPaged().count;

        if (openTicketsCount > 0) {
            // run search for open and in progress tickets
            var openTicketResults = openTicketSearch.run();
            var ticketStatus; 
            var ticket_id;
            var ticket_name;
            var barcode_number;
            var customer_id;
            openTicketResults.each(function(ticket) { 
                ticketStatus = ticket.getValue('custrecord_ticket_status');
                ticket_id = ticket.getValue('internalid');
                ticket_name = ticket.getValue('name');
                barcode_number = ticket.getValue('altname');
                customer_id = ticket.getValue('custrecord_customer1');
            });

            // send emails based on status

            log.debug({
                title: 'ticketStatus',
                details: ticketStatus
            })
            log.debug({
                title: 'ticket_name',
                details: ticket_name
            })
            log.debug({
                title: 'barcode_number',
                details: barcode_number
            })
            //if ticket is open or in progress
            if (ticketStatus == 1 || ticketStatus == 2 || ticketStatus == 4 || ticketStatus == 5 || ticketStatus == 6 || ticketStatus == 7) {
                log.debug({
                    title: 'status 1',
                });
                sendCustomerTicketEmail('MailPlus [' + ticket_name + '] - Status Update - ' + barcode_number, [email], 112, customer_id);
            } else if (ticketStatus == 11) {

                //Escalation 1
                log.debug({
                    title: 'status 2',
                });
                sendCustomerTicketEmail('MailPlus [' + ticket_name + '] - Support enquiry | Stage 1 - ' + barcode_number, [email], 109, customer_id);
            } else if (ticketStatus == 12) {
                //Escalation 2
                log.debug({
                    title: 'status 3',
                    details: customer_id
                });
                
                sendCustomerTicketEmail('MailPlus [' + ticket_name + '] - Support enquiry | Stage 2 - ' + barcode_number, [email], 110, customer_id);
            } else if (ticketStatus == 13 || ticketStatus == 14) {
                //Final Escalation
                log.debug({
                    title: 'status 4',
                });
                sendCustomerTicketEmail('MailPlus [' + ticket_name + '] - Support enquiry | Stage 3 - ' + barcode_number, [email], 111, customer_id);
            } else if (ticketStatus == 3 || ticketStatus == 8) {
                //Closed Ticket or Closed- Unallocated Ticket
                log.debug({
                    title: 'status 5',
                });
                sendCustomerTicketEmail('MailPlus [' + ticket_name + '] - Ticket Closed - ' + barcode_number, [email], 114, customer_id);
                

            } else if (ticketStatus == 9) {
                //Lost Ticket
                log.debug({
                    title: 'status 7',
                });

                if (sender_or_receiver == 1) {
                    sendCustomerTicketEmail('MailPlus [' + ticket_name + '] - Lost In Transit - ' + barcode_number, [email], 115, customer_id);

                } else {
                    sendCustomerTicketEmail('MailPlus [' + ticket_name + '] - Lost In Transit - ' + barcode_number, [email], 113, customer_id);

                }


            } else {
                log.debug({
                    title: 'Ticket Error',
                });
                sendCustomerTicketEmail('MailPlus [' + ticket_name + '] - Under Enquiry - ' + barcode_number, [email], 66, customer_id);

            }

        } else {
             //NO results found- send email to redirect to create ticket page

             log.debug({
                 title: 'status 8',
                 details: 'status 8'
             });
             sendCustomerTicketEmail('MailPlus - Create New Ticket - ' + tracking_number, [email], 118, ''); 
        }

        
     }

     /**
         * Function to sent emails when a customer associated ticket is opened
         */
      function sendCustomerTicketEmail(subject, recipients, template, customer_id) {
        var sales_rep = encodeURIComponent(runtime.getCurrentUser().name);
        var userid = encodeURIComponent(runtime.getCurrentUser().id);
                
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_merge_email',
            deploymentId: 'customdeploy_merge_email',
            returnExternalUrl: true
        });

        suiteletUrl += '&rectype=customer&template=';
        suiteletUrl += template + '&recid=' + customer_id + '&salesrep=' + sales_rep + '&dear=' + '' + '&contactid=' + null + '&userid=' + userid;

        log.debug({
            title: 'suiteletUrl',
            details: suiteletUrl
        });

        var response = https.get({
            url: suiteletUrl
        });

        var emailHtml = response.body;
        
        if (!isNullorEmpty(customer_id)) {
            email.send({
                author: 112209,
                body: emailHtml,
                recipients: recipients,
                subject: subject,
                relatedRecords: { entityId: customer_id}
            });
        } else {
            email.send({
                author: 112209,
                body: emailHtml,
                recipients: recipients,
                subject: subject,
            });
        }

        

        
        
    }

     function isNullorEmpty(strVal) {
         return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
     }
     
     return {
         onRequest: onRequest
     };
 
 });