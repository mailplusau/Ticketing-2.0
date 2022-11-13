/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description
 * 
 * @Last Modified by: Sruti Desai 
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format', 'N/email'],
    function (runtime, search, record, log, task, currentRecord, format, email) {
        var zee = 0;
        var role = 0;

        role = runtime.getCurrentUser().role;
        var user = runtime.getCurrentUser().id;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        function main() {


            var today = new Date();
            today.setHours(today.getHours() + 17);

            if (today.getHours() >= 9 && today.getHours() <= 17) {
                log.debug({
                    title: 'In business hours',
                    details: today.getHours()
                });
                var ticketsSearch = search.load({
                    id: 'customsearch_ss_customer_issue_emails',
                    type: 'customrecord_mp_ticket',
                });

                var count = ticketsSearch.runPaged().count;

                log.debug({
                    title: 'count',
                    details: count
                });
                sendEmails(ticketsSearch);
            } else {
                log.debug({
                    title: 'Not business hours',
                    details: today.getHours()
                });
            }



        }

        function sendEmails(ticketsSearch) {
            ticketsSearch.run().each(function (ticket) {

                var ticket_id = ticket.getValue('internalid');
                var selector_number = ticket.getValue('custrecord_customer_issue');
                var selector_type = "customer_issue";
                var customer_number = ticket.getValue('custrecord_cust_number');
                var login_email_used = ticket.getValue('custrecord_login_email');
                var browser = ticket.getValue('custrecord_browser');
                var sender_name = ticket.getValue('custrecord_sender_name');
                var sender_phone = ticket.getValue('custrecord_sender_phone');
                var issue = ticket.getText('custrecord_mp_ticket_issue');
                var comment = ticket.getText('custrecord_comment');

                var url = "https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1243&deploy=1&compid=1048144&";

                var custparam_params = new Object();
                custparam_params['ticket_id'] = parseInt(ticket_id);
                custparam_params['selector_number'] = selector_number;
                custparam_params['selector_type'] = selector_type;

                var body = '' + selector_number + '  Ticket Details <br>';
                body += 'Customer number : ' + customer_number + ' <br>';
                body += 'Login email used : ' + login_email_used + ' <br>';

                switch (selector_number) {
                    case 'Customer Portal':
                        body += 'Browser : ' + browser + ' <br>';
                        break;
                    case 'Update Label':
                        body += 'Sender name : ' + sender_name + ' <br>';
                        body += 'Sender phone : ' + sender_phone + ' <br>';
                        break;
                }



                body += 'MP Ticket Issue: ' + issue + ' <br>';
                if (!isNullorEmpty(comment)) {
                    body += 'Description: ' + comment + ' <br>';

                } else {
                    body += 'Description:  <br>';
                }
                var ticket_url = url + "&custparam_params=" + encodeURIComponent(JSON.stringify(custparam_params));

                body += '<a href="' + ticket_url + '"> Open ticket page </a><br>';
                body += 'Next reminder time: ' + getNextReminderTime() + ' <br>';

                var subject = 'MPSD' + ticket_id + ' - Customer Issue Ticket Reminder';

                // email.send({
                //     author: 112209,
                //     body: body,
                //     recipients: ['sruti.desai@mailplus.com.au'],
                //     subject: subject,
                // });
                // email.send({
                //     author: 112209,
                //     body: body,
                //     recipients: ['popie.popie@mailplus.com.au'],
                //     subject: subject,
                //     cc: ['ankith.ravindran@mailplus.com.au'],
                // });
                return true;
            });


            log.debug({
                title: 'Emails Sent Out',
            });
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }
        function getNextReminderTime() {
            var today = new Date();

            //Adding 19 hours to PST will give Australia/ Sydney timezone
            today.setHours(today.getHours() + 17);
            var currentHours = today.getHours();
            log.debug({ title: 'currentHours + 2', details: currentHours + 2 });
            if (currentHours + 2 > 16) {
                //Current hours + 2 hours is past 5. next reminder will be sent the next day at 9 am
                today.setDate(today.getDate() + 1);
                today.setHours(9);
                today.setMinutes(0);
                today.setSeconds(0);
            } else if (currentHours + 2 < 9) {
                //Current hours + 2 hours is before 9 am. Edge case but this is unlikely to happen since script does not run outside 9-5
                today.setHours(9);
                today.setMinutes(0);
                today.setSeconds(0);
            } else {
                // Set next reminder time to today + 2 hours
                today.setHours(today.getHours() + 2);
            }

            return today;
        }

        return {
            execute: main
        }
    }
);