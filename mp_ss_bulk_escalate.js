/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description
 * 
 * @Last Modified by:   Sruti Desai
 * 
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format', 'N/https', 'N/email', 'N/url'],
    function(runtime, search, record, log, task, currentRecord, format, https, email, url) {
        var zee = 0;
        var role = runtime.getCurrentUser().role;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.envType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        function main() {
            log.debug({
                title: 'start',
                details: 'start'
            });
            var data_set = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_ticket_id_set' }));
            var ticketsThatAreLeft = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_ticket_id_set' }));

            log.debug({
                title: 'data_set',
                details: data_set
            });

            data_set.forEach(function (ticket_id, index) {

                log.debug({
                    title: 'ticket_id',
                    details: ticket_id
                })

                var usageLimit = runtime.getCurrentScript().getRemainingUsage();
                log.debug({
                    title: 'usageLimit',
                    details: usageLimit
                })
                if (usageLimit < 100) {
                    params = {
                        custscript_ticket_id_set: JSON.stringify(ticketsThatAreLeft)
                    };

                    var reschedule = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_ss_bulk_escalate_2',
                        deploymentId: 'customdeploy_ss_bulk_escalate_2',
                        params: params
                    });

                    log.debug({ title: 'Attempting: Rescheduling Script', details: reschedule });
                    var reschedule_id = reschedule.submit();
                    //return false;

                } else {
                    var ticketRecord = record.load({
                        type: 'customrecord_mp_ticket',
                        id: ticket_id,
                    })
                    
                    var customerstatus = ticketRecord.getValue({fieldId: 'custrecord_mp_ticket_customer_status'});
                    var ticketstatus = ticketRecord.getValue({fieldId: 'custrecord_ticket_status'});
                    var customer_id = ticketRecord.getValue({fieldId: 'custrecord_customer1'});
                    var customer_barcode_number = ticketRecord.getValue({ fieldId : 'custrecord_barcode_number'});
                    var ticket_name = ticketRecord.getText({fieldId: 'name'});
                    
                    if (parseInt(customerstatus) < 4 ) {
                        // log.debug({
                        //     title: 'customerstatus',
                        //     details: customerstatus
                        // })
                        ticketRecord.setValue({fieldId: 'custrecord_mp_ticket_customer_status', value: parseInt(customerstatus) + 1});
                    }
    
                    if (parseInt(ticketstatus) < 11 ) {
                        // log.debug({ title: 'ticketstatus', details: ticketstatus });
                        ticketRecord.setValue({fieldId: 'custrecord_ticket_status', value: 11});
                        
                    } else if (parseInt(ticketstatus) < 14) {
                        // log.debug({ title: 'ticketstatus', details: ticketstatus });
                        ticketRecord.setValue({fieldId: 'custrecord_ticket_status', value: parseInt(ticketstatus) + 1});
                        
                    }
    
    
                    ticketRecord.save({
                        enableSourcing: true,
                    })
    
                    //Send email to Receiver
                    var barcodeRecord = record.load({
                        type: 'customrecord_customer_product_stock',
                        id: customer_barcode_number,
                    });
    
                    var receiveremail = barcodeRecord.getValue({fieldId: 'custrecord_receiver_email'});
                    // log.debug({
                    //     title: 'receiveremail',
                    //     details: receiveremail
                    // })
                    var barcodeName = barcodeRecord.getValue({fieldId: 'name'});
                    var ticketRecord = record.load({
                        type: 'customrecord_mp_ticket',
                        id: ticket_id,
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

                    log.debug({
                        title: 'index',
                        details: index
                    });
                    log.debug({
                        title: 'before splice',
                        details: ticketsThatAreLeft
                    });
                    ticketsThatAreLeft.splice(index, 1);
    
                    log.debug({
                        title: 'after: ticketsThatAreLeft',
                        details: ticketsThatAreLeft
                    });
                    

                    
                }
                
                
                
            });


            log.debug({
                title: 'finished',
                details: 'finished'
            })
        }

         /**
         * Function to sent emails when a customer associated ticket is opened
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
            execute: main
        }
    }
);