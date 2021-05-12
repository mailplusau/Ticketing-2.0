 /**
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * 
 * Description: Separate page for escalating ticket
 * @Last Modified by: Sruti Desai
 * 
 */

  define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord', 'N/https'],
  function(error, runtime, search, url, record, format, email, currentRecord, https) {
      var baseURL = 'https://1048144.app.netsuite.com';
      if (runtime.envType == "SANDBOX") {
          baseURL = 'https://1048144-sb3.app.netsuite.com';
      }
      var role = runtime.getCurrentUser().role;
      var userId = runtime.getCurrentUser().id;

      var currRec = currentRecord.get();
      /**
       * On page initialisation
       */
      function pageInit() {
        var currRec = currentRecord.get();
        var selector_number = currRec.getValue({ fieldId: 'custpage_selector_number' });
        var selector_type = currRec.getValue({ fieldId: 'custpage_selector_type' });
        var ticket_id = currRec.getValue({ fieldId: 'custpage_ticket_id' });
        var status_value = currRec.getValue({ fieldId: 'custpage_ticket_status_value' });
        var customer_number = currRec.getValue({ fieldId: 'custpage_customer_number' });

        var ticketRecord = record.load({
            type: 'customrecord_mp_ticket',
            id: Math.floor(ticket_id),
            isDynamic: true,
        });

        var customerstatus = ticketRecord.getValue({fieldId: 'custrecord_mp_ticket_customer_status'});
        var ticketstatus = ticketRecord.getValue({fieldId: 'custrecord_ticket_status'});

        //background-colors
        $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
        $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
        $("#body").css("background-color", "#CFE0CE");

        $(document).ready(function() {
            $('#email_body').summernote();
            $('#owner, #toll_issues, #mp_issues, #invoice_issues, #enquiry_medium_status, #send_toll').selectpicker();
        });
       
        var inline_html_contact_table = '<table cellpadding="15" id="contacts" class="table table-responsive table-striped contacts tablesorter" cellspacing="0" style="width: 100%;border: 0"><thead style="color: white;background-color: #379E8F;"><tr><th style="vertical-align: middle;text-align: center;" id="col_name"><b>NAME</b></th><th style="vertical-align: middle;text-align: center;" id="col_phone"><b>PHONE</b></th><th style="vertical-align: middle;text-align: center;" id="col_email"><b>EMAIL</b></th><th style="vertical-align: middle;text-align: center;" id="col_role"><b>ROLE</b></th><th style="vertical-align: middle;text-align: center;" id="col_add_as_recipient"><b>ADD AS RECIPIENT</b></th></tr></thead><tbody></tbody></table>';
        $('div.col-xs-12.contacts_div').html(inline_html_contact_table);

        if (!isNullorEmpty(selector_number)) {
            console.log('!isNullorEmpty(selector_number) : ', !isNullorEmpty(selector_number));
            // If we updated the contacts, we have the parameter 'custpage_selector_number' and no parameter for 'custpage_ticket_id'.
            if (!isNullorEmpty(ticket_id)) {
                console.log('isNullorEmpty(ticket_id) : ', isNullorEmpty(ticket_id));
                createContactsRows();
                // If the ticket status is "Open, the acknoledgement template shall be selected.
                if (status_value != 3) {
                    $('#template option:selected').attr('selected', false);

                    if (customerstatus == 2) {
                        $('#template option[value="109"]').attr('selected', true); // Select the acknoledgement template

                        //$('#template option[value="304"]').attr('selected', true); // Select the acknoledgement template
                        console.log("a");
                    } else if (customerstatus == 3) {
                        $('#template option[value="110"]').attr('selected', true); // Select the acknoledgement template

                        //$('#template option[value="303"]').attr('selected', true); // Select the acknoledgement template
                        console.log("b");
                    } else if (customerstatus == 4) {
                        $('#template option[value="111"]').attr('selected', true); // Select the acknoledgement template

                        //$('#template option[value="302"]').attr('selected', true); // Select the acknoledgement template
                        console.log("c");
                    } else {
                        $('#template option[value="66"]').attr('selected', true); // Select the acknoledgement template
                        //$('#template option[value="237"]').attr('selected', true); // Select the under investigation template

                    }
                    loadTemplate();
                }

                if (selector_type == 'barcode_number') {
                    setReminderDate();
                }
            }
        }
        
       

        $('#acc_manager_button').click(function() {
            var account_manager_email = $('#acc_manager').data('email');
            var send_cc_field = $('#send_cc').val();
            if (isNullorEmpty(send_cc_field)) {
                $('#send_cc').val(account_manager_email);
            } else {
                $('#send_cc').val(send_cc_field + ', ' + account_manager_email);
            }
        });

        $('#template').change(function() {
            loadTemplate()
        });

        $('.add_as_recipient').click(function() {
            var email_address = $(this).data('email');
            if (!isNullorEmpty(email_address)) {
                $(this).toggleClass('btn-success');
                $(this).toggleClass('btn-danger');

                if ($(this).attr('data-original-title') == 'Add as recipient') {
                    $(this).attr('data-original-title', 'Remove recipient');
                } else {
                    $(this).attr('data-original-title', 'Add as recipient');
                }
                $('[data-toggle="tooltip"]').tooltip();

                // Convert "TO" text field to email adresses array
                console.log($('#send_to'));
                var send_to_values = $('#send_to').val().split(',');
                var send_to_array = [];
                send_to_values.forEach(function(email_address_in_send_to) {
                    email_address_in_send_to = email_address_in_send_to.trim();
                    if (!isNullorEmpty(email_address_in_send_to)) {
                        send_to_array.push(email_address_in_send_to);
                    }
                });

                // Add or remove selected email adress from array
                var firstname = $(this).data('firstname');
                var firstname_array = $('#send_to').data('firstname');
                if (!isNullorEmpty(firstname_array)) {
                    firstname_array = JSON.parse($('#send_to').data('firstname'));
                } else {
                    firstname_array = [];
                }

                var contact_id = $(this).data('contact-id');
                var contact_id_array = $('#send_to').data('contact-id');
                if (!isNullorEmpty(contact_id_array)) {
                    contact_id_array = JSON.parse(contact_id_array);
                } else {
                    contact_id_array = [];
                }

                var index_of_email_address = send_to_array.indexOf(email_address);
                if (index_of_email_address == -1 && $(this).hasClass('btn-danger') && !isNullorEmpty(email_address)) {
                    send_to_array.push(email_address);
                    if (!isNullorEmpty(firstname)) {
                        firstname_array.push(firstname);
                    }
                    if (!isNullorEmpty(contact_id) || contact_id == 0) {
                        contact_id_array.push(contact_id);
                    }
                } else if ($(this).hasClass('btn-success')) {
                    send_to_array.splice(index_of_email_address, 1);
                    if (!isNullorEmpty(firstname)) {
                        firstname_array.splice(firstname, 1);
                    }
                    if (!isNullorEmpty(contact_id)) {
                        contact_id_array.splice(contact_id, 1);
                    }
                }
                firstname_array = JSON.stringify(firstname_array);
                contact_id_array = JSON.stringify(contact_id_array);

                // Convert array to text field
                var send_to = '';
                send_to_array.forEach(function(email_address) {
                    send_to += email_address + ', ';
                });
                send_to = send_to.slice(0, -2);
                console.log('send_to : ', send_to);
                $('#send_to').val(send_to);
                $('#send_to').data('firstname', firstname_array);
                $('#send_to').data('contact-id', contact_id_array);
            }
        });

        $('#escalationbtn').click(function() {
            console.log("here");
            escalateTicket(ticket_id, selector_number, selector_type);
            
        });

        $('#removeescalationbtn').click(function() {
            console.log("here2");
            deEscalateTicket(ticket_id, selector_number, selector_type, customerstatus, ticketstatus);
        });

        $('#send_email').click(function() {
            sendEmail()
        });

        
      }


      function escalateTicket(ticket_id, selector_number, selector_type) {
        var answer = window.confirm("Are you sure you want to escalate this ticket?");
        if (answer) {
            //SET FIELDS IN RECORD

            //some code

            var ticketRecord = record.load({
                type: 'customrecord_mp_ticket',
                id: Math.floor(ticket_id),
                isDynamic: true,
            });

            var customerstatus = ticketRecord.getValue({fieldId: 'custrecord_mp_ticket_customer_status'});
            var ticketstatus = ticketRecord.getValue({fieldId: 'custrecord_ticket_status'});
            var customer_id = ticketRecord.getValue({fieldId: 'custrecord_customer1'});
            var customer_barcode_number = ticketRecord.getValue({ fieldId : 'custrecord_barcode_number'});
            var ticket_name = ticketRecord.getText({fieldId: 'name'});

            console.log('customerstatus', customerstatus);
            if (parseInt(customerstatus) < 4 ) {
                console.log(customerstatus);
                ticketRecord.setValue({fieldId: 'custrecord_mp_ticket_customer_status', value: parseInt(customerstatus) + 1});
            }

            if (parseInt(ticketstatus) < 11 ) {
                console.log(ticketstatus);
                ticketRecord.setValue({fieldId: 'custrecord_ticket_status', value: 11});
                
            } else if (parseInt(ticketstatus) < 14) {
                console.log(ticketstatus);
                ticketRecord.setValue({fieldId: 'custrecord_ticket_status', value: parseInt(ticketstatus) + 1});
                
            }

            ticketRecord.save({
                enableSourcing: true,
            })

            var barcodeRecord = record.load({
                type: 'customrecord_customer_product_stock',
                id: customer_barcode_number,
            });

            var receiveremail = barcodeRecord.getValue({fieldId: 'custrecord_receiver_email'});
            var barcodeName = barcodeRecord.getValue({fieldId: 'name'});
            var ticketRecord = record.load({
                type: 'customrecord_mp_ticket',
                id: Math.floor(ticket_id),
            })
            var ticketstatus = ticketRecord.getValue({fieldId: 'custrecord_ticket_status'});
            

            if (!isNullorEmpty(receiveremail)) {
                if (ticketstatus == 11) {
                    sendCustomerEscalateEmail('MailPlus [' + ticket_name + '] - Support enquiry | Stage 1 - ' + barcodeName, [receiveremail], 109, customer_id);
                } else if (ticketstatus == 12) {
                    sendCustomerEscalateEmail('MailPlus [' + ticket_name + '] - Support enquiry | Stage 2 - ' + barcodeName, [receiveremail], 110, customer_id);

                } else if (ticketstatus == 13) {
                    sendCustomerEscalateEmail('MailPlus [' + ticket_name + '] - Support enquiry | Stage 3 - ' + barcodeName, [receiveremail], 111, customer_id);
                }
                

            } 

            //Send email to TOLL
            var toll_issues = ticketRecord.getText({ fieldId: 'custrecord_toll_issues' });
            var mp_issues = ticketRecord.getText({ fieldId: 'custrecord_mp_ticket_issue' });

            var body = 'MP Ticket ID: MPSD' + ticket_id + '\n Barcode: ' + barcodeName + '\nToll Issues: ' + toll_issues + '\nMP Issues: ' + mp_issues;

            // if (ticketstatus == 11) {
            //     email.send({
            //         author: 112209,
            //         body: body,
            //         cc: ['jessica.roberts@mailplus.com.au', 'gabrielle.bathman@mailplus.com.au', 'customerservice@mailplus.com.au'],
            //         recipients: ['CorpGold.Escalations@tollgroup.com'],
            //         subject: 'Ticket Escalated: Escalation 1- MPSD' + ticket_id,
            //         relatedRecords: {record: ticket_id, recordtype: 1042}
            //     });
            // } else if (ticketstatus == 12) {
            //     email.send({
            //         author: 112209,
            //         body: body,
            //         cc: ['jessica.roberts@mailplus.com.au', 'gabrielle.bathman@mailplus.com.au', 'customerservice@mailplus.com.au'],
            //         recipients: ['Natalie.Yildirim@tollgroup.com', 'Bernadette.Uluinaceva@tollgroup.com', 'aaron.davis@tollgroup.com'],
            //         subject: 'Ticket Escalated: Escalation 2- MPSD' + ticket_id,
            //         relatedRecords: {record: ticket_id, recordtype: 1042},
            //     });
            // } else if (ticketstatus == 13) {
            //     email.send({
            //         author: 112209,
            //         body: body,
            //         cc: ['jessica.roberts@mailplus.com.au', 'gabrielle.bathman@mailplus.com.au', 'customerservice@mailplus.com.au'],
            //         recipients: ['dora.Venieris@tollgroup.com', 'marion.abada@tollgroup.com'],
            //         subject: 'Ticket Escalated: Escalation 3- MPSD' + ticket_id,
            //         relatedRecords: {record: ticket_id, recordtype: 1042},
            //     });
            // }

            // REDIRECT TO URL
            console.log("IN HERE");
            var params = {
                ticket_id: parseInt(ticket_id),
                selector_number: selector_number,
                selector_type: selector_type
            };
            params = JSON.stringify(params);
            var output = url.resolveScript({
                deploymentId: 'customdeploy_sl_ticketing_escalate',
                scriptId: 'customscript_sl_ticketing_escalate',
            });
            var upload_url = baseURL + output + '&custparam_params=' + params;
            
            window.open(upload_url, "_self");
        }
        else {
            //some code
        }
    }


    /**
     * Function to sent emails when a customer associated ticket is escalated
     */
     function sendCustomerEscalateEmail(subject, recipients, template, customer_id) {
        var sales_rep = encodeURIComponent(runtime.getCurrentUser().name);
        var userid = encodeURIComponent(runtime.getCurrentUser().id);
                
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_merge_email',
            deploymentId: 'customdeploy_merge_email',
            returnExternalUrl: true
        });

        suiteletUrl += '&rectype=customer&template=';
        suiteletUrl += template + '&recid=' + customer_id + '&salesrep=' + sales_rep + '&dear=' + '' + '&contactid=' + null + '&userid=' + userid;

        console.log(suiteletUrl);

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

      function deEscalateTicket(ticket_id, selector_number, selector_type, customerstatus, ticketstatus) {
        var answer = window.confirm("Are you sure you want to de-escalate this ticket?");
        if (answer) {
            //SET FIELDS IN RECORD

            //some code

            var ticketRecord = record.load({
                type: 'customrecord_mp_ticket',
                id: Math.floor(ticket_id),
                isDynamic: true,
            });

            // var customerstatus = ticketRecord.getValue({fieldId: 'custrecord_mp_ticket_customer_status'});
            // var ticketstatus = ticketRecord.getValue({fieldId: 'custrecord_ticket_status'});

            console.log('customerstatus', customerstatus);
            if (parseInt(ticketstatus) == 14) {
                ticketRecord.setValue({fieldId: 'custrecord_ticket_status', value: parseInt(ticketstatus) - 1});
            } else {
                if (parseInt(customerstatus) > 1 ) {
                    console.log(customerstatus);
                    ticketRecord.setValue({fieldId: 'custrecord_mp_ticket_customer_status', value: parseInt(customerstatus) - 1});
                    
                }
    
                if (parseInt(ticketstatus) > 11 ) {
                    console.log(ticketstatus);
                    ticketRecord.setValue({fieldId: 'custrecord_ticket_status', value: parseInt(ticketstatus) - 1});
                }
            }
            

            ticketRecord.save({
                enableSourcing: true,
            });




            // REDIRECT TO URL
            console.log("IN HERE");
            var params = {
                ticket_id: parseInt(ticket_id),
                selector_number: selector_number,
                selector_type: selector_type
            };
            params = JSON.stringify(params);
            var output = url.resolveScript({
                deploymentId: 'customdeploy_sl_ticketing_escalate',
                scriptId: 'customscript_sl_ticketing_escalate',
            });
            var upload_url = baseURL + output + '&custparam_params=' + params;
            
            window.open(upload_url, "_self");
        }
        else {
            //some code
        }

      }

      /**
         * Set record status to 'In Progress'.
         * @param {Number} ticket_id 
         */
       function setRecordStatusToInProgress(ticket_id) {
            try {
                var ticketRecord = record.load({ type: 'customrecord_mp_ticket', id: ticket_id });
                var status_value = ticketRecord.getValue({ fieldId: 'customrecord_mp_ticket' });
                var invoice_id = ticketRecord.getValue({ fieldId: 'custrecord_invoice_number' });

                if (isNullorEmpty(status_value) || status_value == 1) {
                    //Ticket is open 
                    var selector_number = currRec.getValue({ fieldId: 'custpage_selector_number' });
                    if (isFinanceRoleOnly(userRole) && !isNullorEmpty(invoice_id)) {
                        ticketRecord.setValue({ fieldId: 'custrecord_ticket_status', value: 6 });
                    } else if (!isNullorEmpty(selector_number) && selector_number == "Customer App") {
                        console.log('Setting ticket status to In progress - IT');
                        ticketRecord.setValue({ fieldId: 'custrecord_ticket_status', value: 4 }); //In progress - Developers
                    } else {
                        ticketRecord.setValue({ fieldId: 'custrecord_ticket_status', value: 2 });
                    }
                    
                    ticketRecord.setValue({ fieldId: 'custrecord_email_sent', value: 'T' });

                    ticketRecord.save({
                        enableSourcing: true,
                    })
                }
            } catch (e) {
                console.log("e", e);
                //if (e instanceof error.SuiteScriptError) {
                    if (e.name == "SSS_MISSING_REQD_ARGUMENT") {
                        console.log('Error to Set record status to In Progress with ticket_id : ' + ticket_id);
                    }
                //}
            }
      }
      /**
       * - Populates the Contacts table by adding contacts details at each row.
       * - If there is a ticket_id (which means we are in edit mode), 
       * adds the contact to the "To" field of the "Send Email" section.
       */
      function createContactsRows() {
        var contactsResultSet = loadContactsList();
        console.log(contactsResultSet);
        // Used for the Contacts Table.
        var inline_contacts_table_html = '';

        // If a ticket is opened for a barcode that is not allocated to a customer,
        // there will be no contacts.
        if (!isNullorEmpty(contactsResultSet)) {
            contactsResultSet.each(function(contactResult) {
                var contact_id = contactResult.getValue('internalid');
                var salutation = contactResult.getValue('salutation');
                var first_name = contactResult.getValue('firstname');
                var last_name = contactResult.getValue('lastname');
                var contact_name = salutation + ' ' + first_name + ' ' + last_name;
                var contact_email = contactResult.getValue('email');
                var contact_phone = contactResult.getValue('phone');
                var contact_role_value = contactResult.getValue('contactrole');
                var contact_role_text = contactResult.getText('contactrole');
                var add_as_recipient_btn = '<button style="background-color: #379E8F; border-color: #379E8F" class="btn btn-success add_as_recipient glyphicon glyphicon-envelope" type="button" data-email="' + contact_email + '" data-firstname="' + first_name + '" data-contact-id="' + contact_id + '" data-toggle="tooltip" data-placement="right" title="Add as recipient"></button>';

                inline_contacts_table_html += '<tr class="text-center">';
                inline_contacts_table_html += '<td headers="col_name">' + contact_name + '</td>';
                inline_contacts_table_html += '<td headers="col_phone">' + contact_phone + '</td>';
                inline_contacts_table_html += '<td headers="col_email">' + contact_email + '</td>';
                inline_contacts_table_html += '<td headers="col_role">';
                inline_contacts_table_html += '<span class="role_value" hidden>' + contact_role_value + '</span>';
                inline_contacts_table_html += '<span class="role_text">' + contact_role_text + '</span>';
                inline_contacts_table_html += '</td>';
                inline_contacts_table_html += '<td headers="col_add_as_recipient">' + add_as_recipient_btn + '</td>';
                inline_contacts_table_html += '</tr>';

                return true;
            });
        }

        $('#contacts tbody').html(inline_contacts_table_html);
      }

      /**
         * Loads the result set of all the contacts linked to a Customer.
         * @returns {nlobjSearchResultSet}  contactsResultSet
         */
      function loadContactsList() {
        var currRec = currentRecord.get();
        var customer_id = currRec.getValue({ fieldId: 'custpage_customer_id' });
        var contactsResultSet = [];
        // If a ticket is opened for a barcode that is not allocated to a customer,
        // there will be no customer_id.
        if (!isNullorEmpty(customer_id)) {
            var contactsSearch = search.load({ type: 'contact', id: 'customsearch_salesp_contacts' });
            var contactsFilterExpression = [
                ['company', 'is', customer_id], 'AND', ['isinactive', 'is', 'F']
            ];
            contactsSearch.filterExpression = contactsFilterExpression;
            contactsResultSet = contactsSearch.run();
        }
        return contactsResultSet;
      }

      /**
       * Calculates the reminder date based on the current date and the selector_type.
      */
      function setReminderDate() {
            var currRec = currentRecord.get();
            var ticket_id = currRec.getValue({ fieldId: 'custpage_ticket_id' });
            var status_value = currRec.getValue({ fieldId: 'custpage_ticket_status_value' });
            if (isNullorEmpty(ticket_id) || !isTicketNotClosed(status_value)) {
                var selector_type = currRec.getValue({ fieldId: 'custpage_selector_type' });

                var today = new Date();
                var today_day_in_month = today.getDate();
                var today_day_in_week = today.getDay();
                var today_month = today.getMonth();
                var today_year = today.getFullYear();

                switch (selector_type) {
                    case 'barcode_number':
                        var addNbDays = 1;
                        if (today_day_in_week == 5) {
                            addNbDays += 2;
                        }
                        break;

                    case 'invoice_number':
                        var addNbDays = 3;
                        if (today_day_in_week == 3 || today_day_in_week == 4 || today_day_in_week == 5) {
                            addNbDays += 2;
                        }
                        break;
                }

                var reminder_date = new Date(Date.UTC(today_year, today_month, today_day_in_month + addNbDays));
                reminder_date = reminder_date.toISOString().split('T')[0];
            } else {
                ticket_id = parseInt(ticket_id);
                var ticketRecord = record.load({ type: 'customrecord_mp_ticket', id: ticket_id });
                var ticket_reminder_date = ticketRecord.getValue({ fieldId: 'custrecord_reminder' });
                var reminder_date = '';
                if (!isNullorEmpty(ticket_reminder_date)) {
                    ticket_reminder_date = format.parse({ value: ticket_reminder_date, type: format.Type.DATE });
                    var reminder_date_day_in_month = ticket_reminder_date.getDate();
                    var reminder_date_month = ticket_reminder_date.getMonth();
                    var reminder_date_year = ticket_reminder_date.getFullYear();
                    reminder_date = new Date(Date.UTC(reminder_date_year, reminder_date_month, reminder_date_day_in_month));
                    reminder_date = reminder_date.toISOString().split('T')[0];
                    
                }
            }

            $('#reminder').val(reminder_date);
      }
    
       /**
         * Function triggered when the '#template' input field is blurred.
         * Load the subject of the email and the body of the template.
         */
       function loadTemplate() {
        var currRec = currentRecord.get();
        var template_id = $('#template option:selected').val();
        console.log('template_id : ', template_id);
        try {
            var templateRecord = record.load({ type: 'customrecord_camp_comm_template', id: template_id, isDynamic: true });
            var template_subject = templateRecord.getValue({ fieldId: 'custrecord_camp_comm_subject' });
            console.log("templateRecord", templateRecord);

            console.log("tempsubj", template_subject);
        } catch (e) {
            if (e.name == "SSS_MISSING_REQD_ARGUMENT") {
                console.log('Error to load the template with template_id : ' + template_id);
            }
        }

        var customer_id = currRec.getValue({ fieldId: 'custpage_customer_id' });
        var sales_rep = encodeURIComponent(runtime.getCurrentUser().name);
        console.log($('#send_to'))
        var first_name = $('#send_to').data("firstname");
        console.log(first_name)
        var dear = encodeURIComponent(first_name);

        var contact_id = '';
        var contact_id_array = $('#send_to').data('contact-id');
        if (!isNullorEmpty(contact_id_array)) {
            contact_id_array = JSON.parse(contact_id_array);
            if (!isNullorEmpty(contact_id_array)) {
                contact_id = contact_id_array[0].toString();
                if (contact_id == '0' && !isNullorEmpty(contact_id[1])) {
                    contact_id = '';
                }
            }
        }
        console.log('contact_id : ', contact_id);
        var userid = encodeURIComponent(runtime.getCurrentUser().id);

        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_merge_email',
            deploymentId: 'customdeploy_merge_email',
            returnExternalUrl: true
        });
        console.log('suiteletUrl', suiteletUrl);

        suiteletUrl += '&rectype=customer&template=';
    
        var emailAttach = new Object();
        emailAttach['entity'] = customer_id;

        suiteletUrl += template_id + '&recid=' + customer_id + '&salesrep=' + sales_rep + '&dear=' + dear + '&contactid=' + null + '&userid=' + userid;
        console.log('suiteletUrl', suiteletUrl);
            
        var response = https.get({
            url: suiteletUrl
        });

        console.log("response", response);

        var emailHtml = response.body;

        $('#email_body').summernote('code', emailHtml);

        var ticket_id = currRec.getValue({ fieldId: 'custpage_ticket_id' });
        ticket_id = parseInt(ticket_id);
        var selector_number = currRec.getValue({ fieldId: 'custpage_selector_number' });
        var subject = 'MailPlus [MPSD' + ticket_id + '] - ' + template_subject + ' - ' + selector_number;

        $('#subject').val(subject);
      }

    /**
     * Check that the fields "To", "Template" and "Subject" are non-empty.
     * @returns {Boolean}
     */
      function validateEmailFields() {
        var alertMessage = '';
        var return_value = true;

        var send_to_val = $('#send_to').val();
        var send_toll_val = $('#send_toll').val();
        if (isNullorEmpty(send_to_val) && isNullorEmpty(send_toll_val)) {
            return_value = false;
            alertMessage += 'Please select a recipient.<br>';
        }

        var template_val = $('#template option:selected').val();
        if (isNullorEmpty(template_val)) {
            return_value = false;
            alertMessage += 'Please select a template.<br>';
        } else {
            var subject_val = $('#subject').val();
            if (isNullorEmpty(subject_val)) {
                return_value = false;
                alertMessage += 'Please enter a subject.<br>';
            }
        }

        if (return_value == false) {
            showAlert(alertMessage);
        } else {
            $('#alert').parent().hide();
        }

        return return_value;
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
       * Triggered by a click on the button 'SEND EMAIL' ('#send_email')
       * Send the selected email to the selected contact, and reloads the page.
      */
      function sendEmail() {
        
          if (validateEmailFields()) {
            // Send Email
            // Convert "TO" text field to email adresses array
            var send_to_values = $('#send_to').val().split(',');
            var send_to = [];

            if (!isNullorEmpty(send_to_values)) {
                send_to_values.forEach(function(email_address) {
                    email_address = email_address.trim();
                    if (!isNullorEmpty(email_address)) {
                        send_to.push(email_address);
                    }
                });
            }

            var send_toll_values = $('#send_toll').val();
            var send_toll_to = [];
            if (!isNullorEmpty(send_toll_values)) {
                for (var i = 0; i < send_toll_values.length; i++) {
                    send_toll_to.push($('#send_toll option:selected').val(send_toll_values)[i].text);
                }
            }


            // CC Field
            var cc_values = $('#send_cc').val().split(',');
            var cc = [];
            cc_values.forEach(function(email_address) {
                cc.push(email_address.trim());
                return true;
            });
            if (isNullorEmpty(cc)) {
                cc = null;
            }

            // BCC Field
            var bcc_values = $('#send_bcc').val().split(',');
            var bcc = [];
            bcc_values.forEach(function(email_address) {
                bcc.push(email_address.trim());
                return true;
            });
            if (isNullorEmpty(bcc)) {
                bcc = null;
            }

            if (!isNullorEmpty(send_to)) {
                // Attach message to Customer / Franchisee record
                var emailAttach = new Object();
                var receiver_contact_id_array = $('#send_to').data('contact-id');
                if (!isNullorEmpty(receiver_contact_id_array)) {
                    receiver_contact_id_array = JSON.parse(receiver_contact_id_array);

                    receiver_contact_id_array.forEach(function(receiver_contact_id) {
                        if (receiver_contact_id == "0") {
                            // Partner
                            var zee_id = currRec.getValue({ fieldId: 'custpage_zee_id' });
                            emailAttach['entity'] = zee_id;
                        } else if (!isNullorEmpty(receiver_contact_id)) {
                            // Customer
                            var customer_id = currRec.getValue({ fieldId: 'custpage_customer_id' });
                            emailAttach['entity'] = customer_id;
                        }
                    });
                }
            }

            var email_subject = $('#subject').val();
            var email_body = $('#email_body').summernote('code');

            var ticket_id = currRec.getValue({ fieldId: 'custpage_ticket_id' });
            ticket_id = parseInt(ticket_id);

            var params_email = currRec.getValue({ fieldId: 'custpage_param_email' });
            params_email = JSON.parse(params_email);

            params_email.recipient = send_to;
            params_email.subject = email_subject;
            params_email.body = encodeURIComponent(email_body);
            params_email.cc = cc;
            params_email.bcc = bcc;
            params_email.records = emailAttach;
            var attachments_credit_memo_ids = params_email.attachments_credit_memo_ids;
            var attachments_usage_report_ids = params_email.attachments_usage_report_ids;
            var attachments_invoice_ids = params_email.attachments_invoice_ids;

            params_email = JSON.stringify(params_email);
            
            if (!isNullorEmpty(attachments_credit_memo_ids) ||
                !isNullorEmpty(attachments_usage_report_ids) ||
                !isNullorEmpty(attachments_invoice_ids)) {
                // Send email using the response part of this suitelet script.
                currRec.setValue({ fieldId: 'custpage_param_email', value: params_email });
                setRecordStatusToInProgress(ticket_id);

                // Trigger the submit function.
                $('#submitter').trigger('click');
            } else {

                send_to = send_to.concat(send_toll_to);
                console.log("Final send " + send_to);
                // If there are no attachments, it's faster to directly use nlapiSendEmail() from the client script.
                email.send({
                    author: userId,
                    body: email_body,
                    recipients: send_to,
                    subject: email_subject,
                    //attachments: emailAttach,
                    bcc: bcc,
                    cc: cc,
                })
                // 112209 is from MailPlus Team

                var selector_number = currRec.getValue({ fieldId: 'custpage_selector_number' });
                var selector_type = currRec.getValue({ fieldId: 'custpage_selector_type' });

                setRecordStatusToInProgress(ticket_id);

                // Reload the page
                var params = {
                    ticket_id: parseInt(ticket_id),
                    selector_number: selector_number,
                    selector_type: selector_type,
                };
                params = JSON.stringify(params);
                var output = url.resolveScript({
                    deploymentId: 'customdeploy_sl_ticketing_escalate',
                    scriptId: 'customscript_sl_ticketing_escalate',
                })
                var upload_url = baseURL + output + '&custparam_params=' + params;
                window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
            }
          } else {
            return false;
          }
      }

      function saveRecord(context) {

          return true;
      }
      function isNullorEmpty(strVal) {
          return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
      }

      return {
          pageInit: pageInit,
          saveRecord: saveRecord,
          
      };  
  }


);