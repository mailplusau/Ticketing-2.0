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
        tracking_number = tracking_number.toUpperCase();

        var sender_or_receiver = context.request.parameters.sender_or_receiver;
        var first_name = context.request.parameters.first_name;
        var last_name = context.request.parameters.last_name;
        var email = context.request.parameters.email;
        var phone = context.request.parameters.phone_number;
        var brief_description = context.request.parameters.comments;
        var company_name = context.request.parameters.company_name;
        var issues = context.request.parameters.issues;
        


        //note for user note
        var note = '';

        
        
        //1. create ticket based on barcode (open ticket page should have it in cl)
        var ticketRecord = record.create({
            type: 'customrecord_mp_ticket',
        });

        var ticket_id = '';

        //Check Barcode Number is valid
        //if (checkBarcodeFormat(selector_number))


        //Check if ticket exists 
        var ticketIdIfExists = ticketLinkedToSelector(tracking_number);
        if (!isNullorEmpty(ticketIdIfExists)) {
            //TICKET EXISTS
            var ticketRecord2 = record.load({
                type: 'customrecord_mp_ticket',
                id: ticketIdIfExists,
            });
            var customer_id = ticketRecord2.getValue({fieldId: ''});
            var ticket_name = ticketRecord2.getValue({fieldId: 'name'});

            sendCustomerTicketEmail('MailPlus [' + ticket_name + '] - Status Update - ' + tracking_number, [email], 112, customer_id);
        } else {
            var activeBarcodeResults = getSelectorRecords(tracking_number);
            var barcodeRecordId = '';
            var owner_list = [112209]; // MailPlus Team
            var mp_issues_list = [];
            var toll_issues = [issues];
            // No active barcode record exists for the barcode number
            if ((isNullorEmpty(activeBarcodeResults))) {
                mp_issues_list = [1, 2, 3];
            } else if ((!zeeLinkedToBarcode(activeBarcodeResults))) {
                //No franchisee is associated to the barcode
                mp_issues_list = [1, 3];
            } else if ((!customerLinkedToBarcode(activeBarcodeResults))) {
                //No customer is associated to the barcode
                mp_issues_list = [1];
            } else {
                var activeSelectorResult;
                var selector_id;
                //Load Barcode Record
                activeBarcodeResults.run().each(function(search_val) {
                    selector_id = search_val.id;
                    activeSelectorResult = search_val;
                });
                barcodeRecordId = selector_id;
                var customer_name = activeSelectorResult.getText('custrecord_cust_prod_stock_customer');
                var customer_id = activeSelectorResult.getValue('custrecord_cust_prod_stock_customer');

                var zee_name = activeSelectorResult.getText('custrecord_cust_prshowAlod_stock_zee');
                var zee_id = activeSelectorResult.getValue('custrecord_cust_prod_stock_zee');

                var date_stock_used = activeSelectorResult.getValue('custrecord_cust_date_stock_used');
                var time_stock_used = activeSelectorResult.getValue('custrecord_cust_time_stock_used');
                var final_delivery_val = activeSelectorResult.getValue('custrecord_cust_prod_stock_final_del');
                var final_delivery = activeSelectorResult.getText('custrecord_cust_prod_stock_final_del');

                // Load customer record
                var customerRecord = record.load({ type: 'customer', id: customer_id });
                var zee_id = customerRecord.getValue({ fieldId: 'partner' });
                var daytodayphone = customerRecord.getValue({ fieldId: 'phone' });
                var daytodayemail = customerRecord.getValue({ fieldId: 'custentity_email_service' });
                var entityid = customerRecord.getValue({ fieldId: 'entityid' });

                // Load Franchisee record
                var zeeRecord = record.load({ type: 'partner', id: zee_id });
                var zee_name = zeeRecord.getValue({ fieldId: 'companyname' });
                var zee_main_contact_name = zeeRecord.getValue({ fieldId: 'custentity3' });
                var zee_email = zeeRecord.getValue({ fieldId: 'email' });
                var zee_main_contact_phone = zeeRecord.getValue({ fieldId: 'custentity2' });

                //Set Reminder Date
                var today = new Date();
                var today_day_in_month = today.getDate();
                var today_day_in_week = today.getDay();
                var today_month = today.getMonth();
                var today_year = today.getFullYear();
                var addNbDays = 1;
                if (today_day_in_week == 5) {
                    addNbDays += 2;
                }

                var reminder_date = new Date(today_year, today_month, today_day_in_month + addNbDays);
                reminder_date = format.parse({ value: reminder_date, type: format.Type.DATE });

                //Set Values
                ticketRecord.setValue({ fieldId: 'custrecord_email_sent', value: false });
                ticketRecord.setValue({ fieldId: 'custrecord_cust_number', value: entityid });
                ticketRecord.setValue({ fieldId: 'custrecord_zee', value: zee_id });
                ticketRecord.setValue({ fieldId: 'custrecord_reminder', value: reminder_date });
            }

            //Set Values

            if (mp_issues_list.length != 0) {
                // IT Issue
                owner_list = owner_list.concat([409635, 696992]); // Select Ankith Ravindran and Raine Giderson.
                ticketRecord.setValue({ fieldId: 'custrecord_ticket_status', value: 4 });

            } else {
                ticketRecord.setValue({ fieldId: 'custrecord_ticket_status', value: 1 });
            }

            if (sender_or_receiver == 1) {
                //Sender- Enquiry from Customer
                ticketRecord.setValue({ fieldId: 'custrecord_enquiry_status', value: 1 });

            } else {
                //Enquiry from Receiver
                ticketRecord.setValue({ fieldId: 'custrecord_enquiry_status', value: 4 });
            }

            var medium_list = [];
            medium_list.push("3");
            ticketRecord.setValue({ fieldId: 'custrecord_chat_enquiry_count', value: 1 });
            ticketRecord.setValue({ fieldId: 'custrecord_enquiry_count', value: 1 });
            ticketRecord.setValue({ fieldId: 'custrecord_enquiry_medium', value: medium_list });

            ticketRecord.setValue({ fieldId: 'custrecord_mp_ticket_customer_status', value: 1 });
            
            ticketRecord.setValue({ fieldId: 'custrecord_creator', value: 112209 });
            ticketRecord.setValue({ fieldId: 'altname', value: tracking_number });

            ticketRecord.setValue({ fieldId: 'custrecord_barcode_number', value: selector_id });

            ticketRecord.setValue({ fieldId: 'custrecord_toll_issues', value: toll_issues });
            if (mp_issues_list.length != 0 ) {
                ticketRecord.setValue({ fieldId: 'custrecord_mp_ticket_issue', value: mp_issues_list });
            }

            ticketRecord.setValue({ fieldId: 'custrecord_owner', value: owner_list });


            //Save Ticket
            ticket_id = ticketRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });

            if (!isNullorEmpty(barcodeRecordId)) {
                var barcodeRecord = record.load({ type: 'customrecord_customer_product_stock', id: barcodeRecordId });
                barcodeRecord.setValue({ fieldId: 'custrecord_mp_ticket', value: ticket_id} );
                barcodeRecord.setValue({ fieldId: 'custrecord_cust_prod_stock_toll_issues ', value: toll_issues });
                barcodeRecord.save({
                    enableSourcing: true,
                });
            }

            //2. send acknowledgement email to customer (var email from above)
            if (sender_or_receiver == 1) {
                //acknowledgement - sender template: 116
                sendCustomerTicketEmail('MailPlus [MPSD' + ticket_id + '] - Your enquiry has been received - ' + tracking_number, [email], 116, '');

            } else {
                // acknoledgement - receiver template: 117
                sendCustomerTicketEmail('MailPlus [MPSD' + ticket_id + '] - Your enquiry has been received - ' + tracking_number, [email], 117, '');
            }


            
            //Sender user note
            var ticketRecord = record.load({
                type: 'customrecord_mp_ticket',
                id: ticket_id,
            })
            
            issues = ticketRecord.getText({ fieldId: 'custrecord_toll_issues' });

            log.debug({
                title: 'issues',
                details: issues
            })

            if (sender_or_receiver == 1) {
                note = 'Tracking number: ' + tracking_number + '\n SenderOrReceiver: Sender\n Company Name: ' + company_name +  '\n First Name: ' + first_name + '\nLast Name: ' + last_name + '\nEmail: ' + email + '\nPhone: ' + phone + '\n Issues: ' + issues + '\n Brief Description: ' + brief_description + '\n';
            } else {
                //Receiver User NOte
                note = 'Tracking number: ' + tracking_number + '\n SenderOrReceiver: Sender\nFirst Name: ' + first_name + '\nLast Name: ' + last_name + '\nEmail: ' + email + '\nPhone: ' + phone + '\n Issues: ' + issues + '\n Brief Description: ' + brief_description + '\n';
            }

            log.debug({
                title: 'note',
                details: note
            })
            
            
            //3. send email to Gab and Jess and customerservice@mailplus.com.au with new ticket info
            // add ticket id in subject
            // email.send({
            //     author: 112209,
            //     body: note + "\nDate: " + new Date(),
            //     recipients: ['sruti.desai@mailplus.com.au'],
            //     subject: 'New Ticket Creation MPSD' + ticket_id,
            // })

            //4. If barcode is not allocated- send email to Rianne, Ankith, Raine
            // if (mp_issues_list.length != 0) {
            //     email.send({
            //         author: 112209,
            //         body: note + "\nDate: " + new Date(),
            //         recipients: ['sruti.desai@mailplus.com.au'],
            //         subject: 'Barcode not allocated - ' + tracking_number,
            //     })
            // }
            

            //5. add usernote of information user provides
            var userNote = record.create({
                type: record.Type.NOTE,
                isDynamic: true,
            });

            // Record Type i.e MP Ticket
            userNote.setValue({fieldId: 'recordtype', value: 1042});
            // Record ID
            userNote.setValue({fieldId: 'record', value: ticket_id});

            // Date

            //Time

            //Title
            userNote.setValue({fieldId: 'title', value: 'MailPlus Customer - New Ticket Information'});
            
            //Memo
            userNote.setValue({fieldId: 'note', value: note});
            userNote.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
            
        }
        

        

        

        log.debug({
            title: 'script finsihed',
        });

     }

 
    function customerLinkedToBarcode(activeBarcodeResults) {

        var customer_id;
        activeBarcodeResults.run().each(function(search_val) {
            customer_id = search_val.getValue({ name: 'custrecord_cust_prod_stock_customer' });
            if (isNullorEmpty(customer_id)) {
                return true;
            } else {
                return false;
            }
        });

        if (isNullorEmpty(customer_id)) {
            return false;
        } else {
            return true;
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

     /**
         * Searches for the active barcodes records with the name `barcode_number`,
         * or for the active invoice records with the name `invoice_number`,
         * There is normally only one such record.
         * @param   {String}                selector_number
         * @param   {String}                selector_type
         * @returns {nlobjSearchResult[]}   An array of nlobjSearchResult objects corresponding to the searched records.
         */
      function getSelectorRecords(selector_number) {
        var filterExpression = [
            ["name", "is", selector_number], 'AND', ["isinactive", "is", 'F']
        ];
        var activeBarcodeColumns = new Array();
        
        activeBarcodeColumns[0] = search.createColumn({ name: 'custrecord_cust_prod_stock_customer', join: null, summary: null });
        activeBarcodeColumns[1] = search.createColumn({ name: 'custrecord_cust_prod_stock_zee', join: null, summary: null });
        activeBarcodeColumns[2] = search.createColumn({ name: 'custrecord_cust_prod_stock_toll_issues', join: null, summary: null });
        activeBarcodeColumns[3] = search.createColumn({ name: 'custrecord_mp_ticket', join: null, summary: null });
        activeBarcodeColumns[4] = search.createColumn({ name: 'custrecord_cust_date_stock_used', join: null, summary: null });
        activeBarcodeColumns[5] = search.createColumn({ name: 'custrecord_cust_time_stock_used', join: null, summary: null });
        activeBarcodeColumns[6] = search.createColumn({ name: 'custrecord_cust_prod_stock_final_del', join: null, summary: null });
        var activeSelectorResults = search.create({ type: 'customrecord_customer_product_stock', filterExpression: filterExpression, columns: activeBarcodeColumns });
        activeSelectorResults.filters.push(search.createFilter({
            name: 'name',
            operator: search.Operator.IS,
            values: selector_number,
        }));

        activeSelectorResults.filters.push(search.createFilter({
            name: 'isinactive',
            operator: search.Operator.IS,
            values: false,
        }));
        
        if (!isNullorEmpty(activeSelectorResults)) {
            var selector_id;
            activeSelectorResults.run().each(function(search_res) {
                selector_id = search_res.id;

                return true;
            });
            
        }

        return activeSelectorResults;
    }

    /**
         * Verifies that the barcode record is associated to a franchisee
         * @param   {nlobjSearchResult[]}   activeBarcodeResults    Result of getSelectorRecords(selector_number, selector_type)
         * @returns {Boolean}
         */
     function zeeLinkedToBarcode(activeBarcodeResults) {
        //var activeBarcodeResult = activeBarcodeResults[0];
        var zee_id;
        activeBarcodeResults.run().each(function(search_val) {
            zee_id = search_val.getValue({name: 'custrecord_cust_prod_stock_zee' });
            if (isNullorEmpty(zee_id)) {
                return true;
            } else {
                return false;
            }
        });

        if (isNullorEmpty(zee_id)) {
            return false;
        } else {
            return true;
        }
        
    }

    /**
     * Searches for an opened ticket linked to this selector number.
     * The barcode record might not exist, but the ticket associated to the selector number can.
     * @param {String} selector_number
     * @returns {Boolean}
     */
      function ticketLinkedToSelector(selector_number) {
        var ticketIdIfExists = '';
        // checks all tickets
        var ticketSearch = search.load({
            id: 'customsearch_mp_ticket_2',
            type: 'customrecord_mp_ticket'
        });        
        ticketSearch.filters.push(search.createFilter({
            name: 'formulatext',
            operator: search.Operator.IS,
            values: selector_number,
            formula: '{custrecord_barcode_number}'
        }));

        var ticketsCnt = ticketSearch.runPaged().count;
        if (ticketsCnt > 0) {
            var ticketSearchResults = ticketSearch.run();
            ticketSearchResults.each(function(ticket) { 
                ticketIdIfExists = ticket.getValue('internalid');
            });
        }

        return ticketIdIfExists;
        
    }

     function isNullorEmpty(strVal) {
         return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
     }
     
     function checkBarcodeFormat(selector_number) {
        var barcodeFormat = /^MPE[BCDFNTG]\d{6}$/;
        return barcodeFormat.test(selector_number);
            
    }

     return {
         onRequest: onRequest
     };

    
 
 });