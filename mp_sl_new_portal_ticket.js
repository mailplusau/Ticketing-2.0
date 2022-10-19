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
    function (ui, email, runtime, search, record, https, log, redirect, format, url) {
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

            var first_name = context.request.parameters.first_name;
            var last_name = context.request.parameters.last_name;
            var form_email = context.request.parameters.email;
            var phone = context.request.parameters.phone_number;
            var company_name = context.request.parameters.company_name;
            var comments = context.request.parameters.comments;

            var ticketRecord = record.create({
                type: 'customrecord_mp_ticket',
            });
            //Mandatory Fields
            ticketRecord.setValue({ fieldId: 'custrecord_login_email', value: form_email });

            //Enquiry Medium
            var medium_list = [];
            medium_list.push("3");
            ticketRecord.setValue({ fieldId: 'custrecord_chat_enquiry_count', value: 1 });
            ticketRecord.setValue({ fieldId: 'custrecord_enquiry_count', value: 1 });
            ticketRecord.setValue({ fieldId: 'custrecord_enquiry_medium', value: medium_list });
            ticketRecord.setValue({ fieldId: 'custrecord_enquiry_status', value: 1 });

            //Status
            ticketRecord.setValue({ fieldId: 'custrecord_ticket_status', value: 1 });

            //Owner
            ticketRecord.setValue({ fieldId: 'custrecord_creator', value: 112209 });
            ticketRecord.setValue({ fieldId: 'custrecord_owner', value: [772595] });

            //Other fields
            ticketRecord.setValue({ fieldId: 'custrecord_email_sent', value: false });
            ticketRecord.setValue({ fieldId: 'custrecord_date_escalated_it', value: new Date() });
            ticketRecord.setValue({ fieldId: 'altname', value: 'Customer Portal' });
            ticketRecord.setValue({ fieldId: 'custrecord_mp_ticket_issue', value: 9 });
            ticketRecord.setValue({ fieldId: 'custrecord_customer_issue', value: "Customer Portal" });

            //Comments
            if (!isNullorEmpty(comments)) {
                ticketRecord.setValue({ fieldId: 'custrecord_comment', value: comments });
            }

            //Save Ticket
            var ticket_id = ticketRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });

            log.debug({
                title: 'ticket_id',
                details: ticket_id
            });

            //User Note
            var ticketRecord = record.load({
                type: 'customrecord_mp_ticket',
                id: ticket_id,
            });

            //Usernote of information user provides
            var userNote = record.create({
                type: record.Type.NOTE,
                isDynamic: true,
            });
            var custparam_params = new Object();
            custparam_params['ticket_id'] = parseInt(ticket_id);
            custparam_params['selector_number'] = 'Customer Portal';
            custparam_params['selector_type'] = "customer_issue";
            var url = "https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1243&deploy=1&compid=1048144&";

            var ticket_url = url + "&custparam_params=" + encodeURIComponent(JSON.stringify(custparam_params));

            var note = 'Ticket number: MPSD' + ticket_id;
            note += '\nCompany Name: ' + company_name;
            note += '\nFirst Name: ' + first_name;
            note += '\nLast Name: ' + last_name;
            note += '\nLogin Email: ' + form_email;
            note += '\nPhone: ' + phone;
            note += '\nDescription: ' + comments;

            // Record Type i.e MP Ticket
            userNote.setValue({ fieldId: 'recordtype', value: 1042 });
            // Record ID
            userNote.setValue({ fieldId: 'record', value: ticket_id });

            //Title
            userNote.setValue({ fieldId: 'title', value: 'MailPlus Customer - New Portal Ticket Information' });

            //Memo
            userNote.setValue({ fieldId: 'note', value: note });
            userNote.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });

            log.debug({
                title: 'User note created',
            })

            //Send Acknowledgement Email
            sendCustomerTicketEmail('MailPlus [MPSD' + ticket_id + '] - Thank you for your IT request - Customer Portal', [form_email], 119, '');

            //Send Email to Rianne/Ankith
            // email.send({
            //     author: 112209,
            //     body: note,
            //     recipients: ["rianne.mansell@mailplus.com.au"],
            //     subject: 'MPSD' + ticket_id + ' - New Customer Issue Ticket',
            //     cc: ["ankith.ravindran@mailplus.com.au"],
            // });
            var body = 'Ticket number: ' + '<a href="' + ticket_url + '"> MPSD' + ticket_id + '</a><br>';
            body += 'Company Name: ' + company_name + '<br>';
            body += 'First Name: ' + first_name + '<br>';
            body += 'Last Name: ' + last_name + '<br>';
            body += 'Login Email: ' + form_email + '<br>';
            body += 'Phone: ' + phone + '<br>';
            body += 'Description: ' + comments + '<br>';

            // email.send({
            //     author: 112209,
            //     body: body,
            //     recipients: ["rianne.mansell@mailplus.com.au", "ankith.ravindran@mailplus.com.au", "sruti.desai@mailplus.com.au"],
            //     subject: 'MPSD' + ticket_id + ' - New Customer Issue Ticket',
            // });
            // 
            // Send Email to Rianne/Ankith
            email.send({
                author: 112209,
                body: note,
                recipients: ["popie.popie@mailplus.com.au"],
                subject: 'MPSD' + ticket_id + ' - New Customer Issue Ticket',
                cc: ["ankith.ravindran@mailplus.com.au"]
            });
            log.debug({
                title: 'Sent acknowledgement email && email to IT'
            });



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
                    relatedRecords: { entityId: customer_id }
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