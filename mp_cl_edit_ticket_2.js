/**
* 
* @NApiVersion 2.0
* @NScriptType ClientScript
* 
* Description: A ticketing system for the Customer Service
* @Last Modified by: Sruti Desai
* 
*/

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
	function (error, runtime, search, url, record, format, email, currentRecord) {
		var baseURL = 'https://1048144.app.netsuite.com';
		if (runtime.envType == "SANDBOX") {
			baseURL = 'https://1048144-sb3.app.netsuite.com';
		}
		var role = runtime.getCurrentUser().role;
		var userRole = runtime.getCurrentUser().role;

		var selector_list = ['barcodes', 'invoices', 'customers', 'operations'];

		/**
		 * On page initialisation
		 */
		function pageInit() {
			//background-colors
			$("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
			$("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
			$("#body").css("background-color", "#CFE0CE");

			var ticketsDataSet = [];
			var tableSet = [];
			$(document).ready(function () {
				selector_list.forEach(function (selector) {

					var table_id = '#tickets-preview-' + selector;
					console.log('Selector = ' + selector);
					switch (selector) {
						case 'barcodes':
							var columns = [{
								title: 'Bulk Escalate'
							}, {
								title: ''
							}, {
								title: "Ticket ID",
								type: "num-fmt"
							}, {
								title: "Date created",
								type: "date"
							}, {
								title: "Barcode"
							}, {
								title: "Connote Number"
							}, {
								title: "Customer"
							}, {
								title: "Franchise"
							}, {
								title: "Owner"
							}, {
								title: "Status"
							}, {
								title: "TOLL Issues"
							}, {
								title: "MP Ticket Issues"
							}, {
								title: "Has MPEX Contact"
							}, {
								title: "Action"
							},

							];



							var columnDefs = [{
								targets: 0,
								render: function (data, type, row, meta) {
									var status = row[9];
									var has_mpex_contact = row[12];

									data = '<input type="checkbox" class="dt-checkboxes">'
									if (status === "Closed") {
										data = '';
									}
									return data;
								},
								orderable: false,
								checkboxes: {
									selectRow: true,
									selectAllCallback: function (nodes, flag, inderminate) {
										console.log("Select all callback");
										var table_barcodes = $('#tickets-preview-barcodes').DataTable();
										var rows = table_barcodes.rows().nodes().to$();
										// $.each(rows, function(index){
										//     if($(rows[index]).hasClass('ignoreme')){
										//         $(rows[index]).removeClass('selected');                                }
										// });

									},
									selectCallback: function (nodes, flag) {
										console.log('flag', flag)
										if (flag) {
											$(nodes).closest('tr').addClass('selected');
										} else {
											$(nodes).closest('tr').removeClass('selected');
										}
									}
								}
							}, {
								targets: 1,
								render: function (data, type, row, meta) {
									var status = row[9];
									var has_mpex_contact = row[12];

									data = '<input type="checkbox" class="dt-checkboxes">'
									if (status === "Closed" || status === "In progress - IT" || !has_mpex_contact) {
										data = '';
									}
									return data;
								},
								orderable: false,
								checkboxes: {
									selectRow: true,
									selectAllCallback: function (nodes, flag, inderminate) {
										console.log("Select all callback");
										console.log(nodes);
										var table_barcodes = $('#tickets-preview-barcodes').DataTable();
										var rows = table_barcodes.rows().nodes().to$();
										$.each(rows, function (index) {
											if ($(rows[index]).hasClass('ignoreme')) {
												$(rows[index]).removeClass('selected');
											}
										});

									},
									selectCallback: function (nodes, flag) {
										if (flag) {
											$(nodes).closest('tr').addClass('selected');
										} else {
											$(nodes).closest('tr').removeClass('selected');
										}
									}
								}
							}, {
								targets: -2,
								visible: false,
								searchable: false
							}, {
								targets: -1,
								data: null,
								render: function (data, type, row, meta) {
									var icon = 'glyphicon-pencil';
									var title = 'Edit';
									if (data[9] == "Open") {
										var button_style = 'btn-primary';
									} else if (data[9] == "In Progress - Customer Service") {
										var button_style = 'btn-warning';
									} else {
										var button_style = 'btn-danger';
									}
									return '<button class="btn ' + button_style + ' edit_class glyphicon ' + icon + '" type="button" data-toggle="tooltip" data-placement="right" title="' + title + '"></button>';
								}
							}];

							var order = [[3, "desc"]];
							var select = {
								style: 'multi',
							};

							break;

						case 'operations':
							var columns = [{
								title: "Ticket ID",
								type: "num-fmt"
							}, {
								title: "Date created",
								type: "date"
							}, {
								title: "Customer"
							}, {
								title: "Franchise"
							}, {
								title: "Owner"
							}, {
								title: "Status"
							}, {
								title: "Operation Issues"
							}, {
								title: "Action"
							},

							];
							var columnDefs = [{
								targets: -1,
								data: null,
								render: function (data, type, row, meta) {
									var icon = 'glyphicon-pencil';
									var title = 'Edit';
									if (data[5] == "Open") {
										var button_style = 'btn-primary';
									} else if (data[5] == "In Progress - Customer Service") {
										var button_style = 'btn-warning';
									} else {
										var button_style = 'btn-danger';
									}
									return '<button class="btn ' + button_style + ' btn - sm edit_class glyphicon ' + icon + '" type="button" data-toggle="tooltip" data-placement="right" title="' + title + '"></button>';
								}
							}];
							var order = [[1, "desc"]];
							break;

						case 'invoices':
							var columns = [{
								title: "Ticket ID",
								type: "num-fmt"
							}, {
								title: "Date created",
								type: "date"
							}, {
								title: "Invoice"
							}, {
								title: "Customer"
							}, {
								title: "Franchise"
							}, {
								title: "Owner"
							}, {
								title: "Status"
							}, {
								title: "Invoice Issues"
							}, {
								title: "MP Ticket Issues"
							}, {
								title: "Action"
							},

							];

							var columnDefs = [{
								targets: -1,
								data: null,
								render: function (data, type, row, meta) {
									var icon = 'glyphicon-pencil';
									var title = 'Edit';
									if (data[7] == "Open") {
										var button_style = 'btn-primary';
									} else if (data[6] == "In Progress - Developers") {
										var button_style = 'btn-warning';
									} else {
										var button_style = 'btn-danger';
									}
									return '<button class="btn ' + button_style + ' btn - sm edit_class glyphicon ' + icon + '" type="button" data-toggle="tooltip" data-placement="right" title="' + title + '"></button>';
								}
							}];

							var order = [[1, "desc"]];
							break;

						case 'customers':
							var columns = [{
								title: "Ticket ID",
								type: "num-fmt"
							}, {
								title: "Date created",
								type: "date"
							}, {
								title: "Customer Issue"
							}, {
								title: "Customer Name"
							}, {
								title: "Franchise"
							}, {
								title: "Owner"
							}, {
								title: "Status"
							}, {
								title: "MP Issues"
							}, {
								title: "Action"
							},

							];

							var columnDefs = [{
								targets: -1,
								data: null,
								render: function (data, type, row, meta) {
									var icon = 'glyphicon-pencil';
									var title = 'Edit';
									if (data[6] == "Open") {
										var button_style = 'btn-primary';
									} else if (data[6] == "In Progress - Customer Service") {
										var button_style = 'btn-warning';
									} else {
										var button_style = 'btn-danger';
									}
									return '<button class="btn ' + button_style + ' btn - sm edit_class glyphicon ' + icon + '" type="button" data-toggle="tooltip" data-placement="right" title="' + title + '"></button>';
								}
							}];
							var order = [[1, "desc"]];
							break;

					}

					var table = $(table_id).DataTable({
						data: ticketsDataSet,
						orderCellsTop: true,
						fixedHeader: true,
						columns: columns,
						order: order,
						columnDefs: columnDefs,
						select: select,
						pageLength: 100,
					});

					$(table_id + ' thead tr').addClass('text-center');

					// Adapted from https://datatables.net/extensions/fixedheader/examples/options/columnFiltering.html
					// Adds a row to the table head row, and adds search filters to each column.
					$(table_id + ' thead tr').clone(true).appendTo(table_id + ' thead');
					$(table_id + ' thead tr:eq(3) th').each(function (i) {
						var title = $(this).text();
						if (title == '') {
							//$(this).html('');
							if (i == 0) {
								$(this).html('Bulk Escalate');
							} else {
								$(this).html('Bulk Emails');
							}

						} else {
							$(this).html('<input style="width: 90%" type="text" placeholder="Search ' + title + '" />');
							$('input', this).on('keyup change', function () {
								if (table.column(i).search() !== this.value) {
									table
										.column(i)
										.search(this.value)
										.draw();
								}
							});
						}

					});



				});



				console.log('Datatables created');

				// Event listener to the two date filtering inputs to redraw on input
				$('#date_from, #date_to').blur(function () {
					$('.table').each(function () {
						var table = $(this).DataTable();
						table.draw();
					});
				});
			});

			$(".loader").css("display", "none");

			// For the moment, the search "customsearch_customer_mpex_contacts" doesn't exist on Sandbox
			// because the field "Contact : MPEX Contact (Custom)" doesn't exist on the contact records.
			var customer_has_mpex_contact_set = new Set;
			if (runtime.EnvType != "SANDBOX") {
				var customer_has_mpex_contact_set = loadMpexContactSet();
			}
			loadTicketsTable(selector_list, customer_has_mpex_contact_set);

			// Initialize all tooltips : https://getbootstrap.com/docs/4.0/components/tooltips/
			$('[data-toggle="tooltip"]').tooltip();


			var table_barcodes = $('#tickets-preview-barcodes').DataTable();
			console.log("table2", table_barcodes)
			var rows = table_barcodes.rows().nodes().to$();
			var status = table_barcodes.column(9).data().toArray();;
			var has_mpex_contact = table_barcodes.column(12).data().toArray()

			//Mark all tickets that are Closed with class 'ignoreme'
			$.each(rows, function (index) {
				if (status[index] == "Closed" || status[index] == "In progress - IT" || !has_mpex_contact[index]) {
					$(this).addClass('ignoreme');
				};
			});

			$('.table').each(function () {
				var table = $(this).DataTable();

				table.on('draw.dt', function () {
					// Each time the table is redrawn, we trigger tooltip for the new cells.
					$('[data-toggle="tooltip"]').tooltip();
				});

				table.on('click', '.edit_class', function () {
					var selector = $('div.tab-pane.active').attr('id');
					switch (selector) {
						case 'barcodes':
							var ticket_id = $(this).parent().siblings().eq(2).text().split('MPSD')[1];
							var selector_number = $(this).parent().siblings().eq(4).text();
							var selector_type = 'barcode_number';
							break;

						case 'operations':
							var ticket_id = $(this).parent().siblings().eq(0).text().split('MPSD')[1];
							var selector_number = $(this).parent().siblings().eq(2).text();
							var selector_type = 'operations_issue';
							console.log(ticket_id + "," + selector_number + "," + selector_type);
							break;

						case 'invoices':
							var ticket_id = $(this).parent().siblings().eq(0).text().split('MPSD')[1];
							var selector_number = $(this).parent().siblings().eq(2).text();
							var selector_type = 'invoice_number';
							break;
						case 'customers':
							var ticket_id = $(this).parent().siblings().eq(0).text().split('MPSD')[1];
							var selector_number = $(this).parent().siblings().eq(2).text();
							var selector_type = 'customer_issue';
							console.log(ticket_id + "," + selector_number + "," + selector_type);
							break;
					}

					var ticketRecord = record.load({
						type: 'customrecord_mp_ticket',
						id: ticket_id
					});

					if (isNullorEmpty(selector_number.trim())) {

						selector_number = ticketRecord.getValue({ fieldId: 'altname' });

					}
					var customerInternal = ticketRecord.getValue({ fieldId: 'custrecord_customer1' });

					if (selector == 'operations' && !isNullorEmpty(customerInternal)) {
						editTicket(ticket_id, customerInternal, selector_type);
					} else {
						editTicket(ticket_id, selector_number, selector_type);
					}

				});
			});

			// Date filtering
			/* Custom filtering function which will search data in column two between two values */
			$.fn.dataTable.ext.search.push(
				function (settings, data, dataIndex) {

					// Get value of the "Date created from" field
					var date_from_val = $('#date_from').val();
					if (isNullorEmpty(date_from_val)) {
						// The minimum date value is set to the 1st January 1970
						var date_from = new Date(0);
					} else {
						var date_from = new Date(dateSelected2Date(date_from_val));
					}

					// Get value of the "Date created to" field
					var date_to_val = $('#date_to').val();
					if (isNullorEmpty(date_to_val)) {
						// The maximum value is set to the 1st January 3000
						var date_to = new Date(3000, 0);
					} else {
						var date_to = new Date(dateSelected2Date(date_to_val));
					}

					// select the index of the date_created column
					switch (settings.nTable.id) {
						case 'tickets-preview-barcodes':
							var date_created_column_nb = 3;
							break;
						case 'tickets-preview-operations':
							var date_created_column_nb = 1;
							break;
						case 'tickets-preview-invoices':
							var date_created_column_nb = 1;
							break;
						case 'tickets-preview-customers':
							var date_created_column_nb = 1;
							break;

					}
					var date_created = dateSelected2Date(data[date_created_column_nb]);

					return (date_from <= date_created && date_created <= date_to);
				}
			);

			$('#opennewticket').click(function () {
				openTicket();
			});
			$('#viewclosedtickets').click(function () {
				viewClosedTickets();
			});
			$('#viewlosttickets').click(function () {
				viewLostTickets();
			});
			$('#sendbulkemails').click(function () {
				onSendBulkEmails();
			});
			$('#bulkescalatebtn').click(function () {

				onBulkEscalate();
			});



		}

		function onBulkEscalate() {
			console.log('hello');
			var table = $('#tickets-preview-barcodes').DataTable();
			var selected_tickets_id = table.cells('.selected', 2).data().toArray();
			console.log('sel tic id', selected_tickets_id);
			selected_tickets_id = selected_tickets_id.map(
				function (ticket_number) {
					return ticket_number.split('MPSD')[1];
				});
			var param_selected_ticket_id = JSON.stringify(selected_tickets_id);
			console.log("start bulk escalate = " + param_selected_ticket_id);

			var currRec = currentRecord.get();
			currRec.setValue({ fieldId: 'custpage_bulk_escalate', value: param_selected_ticket_id });

			var params = {
				custpage_bulk_escalate: param_selected_ticket_id,
			};
			params = JSON.stringify(params);
			var output = url.resolveScript({
				deploymentId: 'customdeploy_sl_edit_ticket_2',
				scriptId: 'customscript_sl_edit_ticket_2',
			});

			var upload_url = baseURL + output + '&custparam_params=' + params;
			window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");


		}
		function saveRecord(context) {
			var selector = $('div.tab-pane.active').attr('id');
			switch (selector) {
				case 'barcodes':
					var selector_type = 'barcode_number';
					break;

				case 'invoices':
					var selector_type = 'invoice_number';
					break;
			}
			var currRec = currentRecord.get();
			currRec.setValue({ fieldId: 'custpage_selector_type', value: selector_type });
			return true;
		}

		/**
		 * Open the "Edit Ticket" page corresponding to the selected ticket
		 * @param   {Number}    ticket_id
		 * @param   {String}    selector_number
		 * @param   {String}    selector_type
		 */
		function editTicket(ticket_id, selector_number, selector_type) {
			console.log("IN HERE", parseInt(ticket_id));
			var params = {
				ticket_id: parseInt(ticket_id),
				selector_number: selector_number,
				selector_type: selector_type
			};
			params = JSON.stringify(params);
			var output = url.resolveScript({
				deploymentId: 'customdeploy_sl_open_ticket_2',
				scriptId: 'customscript_sl_open_ticket_2',
			});
			var upload_url = baseURL + output + '&custparam_params=' + params;

			//window.open(upload_url, '_blank');
			window.open(upload_url, '_self');
		}

		function openTicket() {
			//https://1048144-sb3.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1228&deploy=1
			var upload_url = url.resolveScript({
				deploymentId: 'customdeploy_sl_open_ticket_2',
				scriptId: 'customscript_sl_open_ticket_2',
			});
			//window.open(upload_url, '_blank');
			window.open(upload_url, '_self');
		}
		/**
		 * Redirect to the "View Closed Tickets" page.
		 */
		function viewClosedTickets() {
			var upload_url = url.resolveScript({
				deploymentId: 'customdeploy_sl_edit_closed_ticket_2',
				scriptId: 'customscript_sl_edit_closed_ticket_2',
			});
			//window.open(upload_url, '_blank');
			window.open(upload_url, '_self');
		}

		/**
		 * Redirect to the "View Closed-Lost Tickets" page.
		 */
		function viewLostTickets() {
			var upload_url = url.resolveScript({
				deploymentId: 'customdeploy_sl_edit_lost_ticket_2',
				scriptId: 'customscript_sl_edit_lost_ticket_2',
			});
			var upload_url = baseURL + upload_url;
			//window.open(upload_url, '_blank');
			window.open(upload_url, '_self');
		}

		/**
		 * Triggers the Scheduled script to send the "Under Investigation" email to the MPEX Contacts of the selected tickets.
		 */
		function onSendBulkEmails() {
			var table = $('#tickets-preview-barcodes').DataTable();
			var selected_tickets_id = table.cells('.selected', 2).data().toArray();
			selected_tickets_id = selected_tickets_id.map(
				function (ticket_number) {
					return ticket_number.split('MPSD')[1];
				});
			var param_selected_ticket_id = JSON.stringify(selected_tickets_id);
			console.log("Send bulk emails = " + param_selected_ticket_id);
			var currRec = currentRecord.get();
			currRec.setValue({ fieldId: 'custpage_selected_id', value: param_selected_ticket_id });

			var params = {
				custpage_selected_id: param_selected_ticket_id,
			};
			params = JSON.stringify(params);
			var output = url.resolveScript({
				deploymentId: 'customdeploy_sl_edit_ticket_2',
				scriptId: 'customscript_sl_edit_ticket_2',
			});

			var upload_url = baseURL + output + '&custparam_params=' + params;
			window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");

			//$('#submitter').trigger('click');
			return true;
		}

		/**
		 * Loads the set of customer ids who have an MPEX contact
		 * @returns {Set} customer_has_mpex_contact_set
		 */
		function loadMpexContactSet() {
			var tickets_customer_id_set = new Set;

			// Load the Barcodes MP Tickets
			var ticketSearch = search.load({
				id: 'customsearch_mp_ticket_4',
				type: 'customrecord_mp_ticket'
			})

			var ticketFilterExpression = ticketSearch.filterExpression;
			ticketFilterExpression.push('AND', [
				["custrecord_barcode_number", "noneof", "@NONE@"], "OR", ["name", "startswith", "MPE"]
			]);
			ticketSearch.filterExpression = ticketFilterExpression;
			var ticketResultSet = ticketSearch.run();

			// For each ticket, add the customer_id to the set 'tickets_customer_id_set'
			var slice_index = 0;
			var resultTicketSlice = ticketResultSet.getRange({
				start: slice_index * 1000,
				end: (slice_index + 1) * 1000
			})
			if (!isNullorEmpty(resultTicketSlice)) {
				do {
					resultTicketSlice = ticketResultSet.getRange({ start: slice_index * 1000, end: (slice_index + 1) * 1000 });
					resultTicketSlice.forEach(function (ticketResult) {
						var customer_id = ticketResult.getValue('custrecord_customer1');
						tickets_customer_id_set.add(customer_id);
					});

					slice_index += 1;
				} while (resultTicketSlice.length == 1000)
			}
			// tickets_customer_id_array contains the customer ids of all the customers linked to Open / In Progress Barcodes MP Tickets.
			var tickets_customer_id_array = Array.from(tickets_customer_id_set);

			// Load the Search : Customer - MPEX Contacts
			var mpexCustomersSearch = search.load({ type: 'customer', id: 'customsearch_customer_mpex_contacts' });

			mpexCustomersSearch.filters.push(search.createFilter({
				name: 'internalid',
				join: null,
				operator: 'anyof',
				values: tickets_customer_id_array,
			}));

			var mpexCustomersResultSet = mpexCustomersSearch.run();

			// Iterate through the Customers that have MPEX contacts and add the customer_id to the set 'customer_has_mpex_contact_set'
			var customer_has_mpex_contact_set = new Set;
			if (!isNullorEmpty(mpexCustomersResultSet)) {
				mpexCustomersResultSet.each(function (customerResult) {
					var cust_has_mpex_cont_cust_id = customerResult.getValue("internalid");
					customer_has_mpex_contact_set.add(cust_has_mpex_cont_cust_id);

					return true;
				});
			}

			console.log(customer_has_mpex_contact_set)
			return customer_has_mpex_contact_set;
		}

		/**
		 * Load all the open tickets and displays them in the datatable.
		 * @param   {String[]}  selector_list
		 * @param   {Set}       customer_has_mpex_contact_set
		 */
		function loadTicketsTable(selector_list, customer_has_mpex_contact_set) {
			var ticketSearch = search.load({ type: 'customrecord_mp_ticket', id: 'customsearch_mp_ticket_4' });
			var ticketResultSet = ticketSearch.run();

			var ticketsDataSetArrays = [];
			selector_list.forEach(function (selector) {
				var tbody_id = '#result_tickets_' + selector;
				$(tbody_id).empty();

				ticketsDataSetArrays.push([]);
			});

			var slice_index = 0;

			var resultTicketSlice = ticketResultSet.getRange({ start: slice_index * 1000, end: (slice_index + 1) * 1000 });
			if (!isNullorEmpty(resultTicketSlice)) {
				do {
					resultTicketSlice = ticketResultSet.getRange({ start: slice_index * 1000, end: (slice_index + 1) * 1000 });
					resultTicketSlice.forEach(function (ticketResult) {
						var ticket_id = ticketResult.getValue('internalid');
						ticket_id = 'MPSD' + ticket_id;

						var date_created = ticketResult.getValue('created');
						date_created = date_created.split(' ')[0];
						date_created = dateCreated2DateSelectedFormat(date_created);

						var owners = ticketResult.getText('custrecord_owner');
						owners = owners.split(',').join('<br>');

						var status_val = ticketResult.getValue('custrecord_ticket_status');

						var ticket_type = getTicketType(ticketResult);

						switch (ticket_type) {
							case 'barcode':
								var barcode_number = ticketResult.getText('custrecord_barcode_number');
								if (isNullorEmpty(barcode_number)) {
									barcode_number = ticketResult.getValue('altname');
								}
								barcode_number = '<b>' + barcode_number + '</b>';

								// TOLL Issues
								var toll_issues = ticketResult.getText('custrecord_toll_issues');
								toll_issues = toll_issues.split(',').join('<br>');
								var connote_number = ticketResult.getValue({ name: "custrecord_connote_number", join: "CUSTRECORD_BARCODE_NUMBER" });
								// Resolved TOLL Issues
								var resolved_toll_issues = ticketResult.getText('custrecord_resolved_toll_issues');
								if (!isNullorEmpty(resolved_toll_issues)) {
									resolved_toll_issues = 'Resolved : <br>' + resolved_toll_issues.split(',').join('<br>');
								}

								if (status_val == 3) {
									toll_issues = resolved_toll_issues;
								}

								// Has MPEX Contact
								var has_mpex_contact = false;
								var customer_id = ticketResult.getValue('custrecord_customer1');
								if (customer_has_mpex_contact_set.has(customer_id)) {
									console.log(customer_id)
									has_mpex_contact = true;
								}
								break;

							case 'operations':
								var issue_type = ticketResult.getValue('altname');
								issue_type = '<b>' + issue_type + '</b>';

								// TOLL Issues
								var operation_issues = ticketResult.getText('custrecord_mp_ticket_mp_ops_issue');
								operation_issues = operation_issues.split(',').join('<br>');

								// Resolved TOLL Issues
								var resolved_operation_issues = ticketResult.getText('custrecord_resolved_mp_ops_issues');
								if (!isNullorEmpty(resolved_operation_issues)) {
									resolved_operation_issues = 'Resolved : <br>' + resolved_operation_issues.split(',').join('<br>');
								}

								if (status_val == 3) {
									operation_issues = resolved_operation_issues;
								}

								// Has MPEX Contact
								var has_mpex_contact = false;
								var customer_id = ticketResult.getValue('custrecord_customer1');
								if (customer_has_mpex_contact_set.has(customer_id)) {
									console.log(customer_id)
									has_mpex_contact = true;
								}
								break;

							case 'invoice':
								// Invoice number
								var re = /Invoice #([\w]+)/;
								var invoice_number = ticketResult.getText('custrecord_invoice_number');
								if (isNullorEmpty(invoice_number)) {
									invoice_number = ticketResult.getValue('altname');
								}
								invoice_number = invoice_number.replace(re, '$1');
								invoice_number = '<b>' + invoice_number + '</b>';

								// Invoice Issues
								var invoice_issues = ticketResult.getText('custrecord_invoice_issues');
								invoice_issues = invoice_issues.split(',').join('<br>');

								// Resolved Invoice Issues
								var resolved_invoice_issues = ticketResult.getText('custrecord_resolved_invoice_issues');
								if (!isNullorEmpty(resolved_invoice_issues)) {
									resolved_invoice_issues = 'Resolved : <br>' + resolved_invoice_issues.split(',').join('<br>');
								}

								if (status_val == 3) {
									invoice_issues = resolved_invoice_issues;
								}
								break;
							case 'customer':
								// var customer_number = ticketResult.getText('custrecord_cust_number');
								// console.log(customer_number);

								var issue_type = ticketResult.getValue('altname');
								issue_type = '<b>' + issue_type + '</b>';
								break;
						}

						// MP Ticket Issues
						var mp_ticket_issues = ticketResult.getText('custrecord_mp_ticket_issue');
						mp_ticket_issues = mp_ticket_issues.split(',').join('<br>');

						// Resolved MP Ticket Issues
						var resolved_mp_ticket_issues = ticketResult.getText('custrecord_resolved_mp_ticket_issue');
						if (!isNullorEmpty(resolved_mp_ticket_issues)) {
							resolved_mp_ticket_issues = 'Resolved : <br>' + resolved_mp_ticket_issues.split(',').join('<br>');
						}

						if (status_val == 3) {
							mp_ticket_issues = resolved_mp_ticket_issues;
						}

						var customer_name = ticketResult.getText('custrecord_customer1');
						var franchise_name = ticketResult.getText('custrecord_zee');
						var status = ticketResult.getText('custrecord_ticket_status');

						switch (ticket_type) {
							case 'barcode':
								if (status_val != 9) {
									//Push tickets that do not have status Closed-Lost

									ticketsDataSetArrays[0].push(['', '', ticket_id, date_created, barcode_number, connote_number, customer_name, franchise_name, owners, status, toll_issues, mp_ticket_issues, has_mpex_contact]);
								}
								break;

							case 'operations':
								if (ticketsDataSetArrays[3] != undefined) {
									//Push tickets that do not have status Closed-Lost
									ticketsDataSetArrays[3].push([ticket_id, date_created, customer_name, franchise_name, owners, status, operation_issues]);
								}
								break;

							case 'invoice':
								if (ticketsDataSetArrays[1] != undefined) {
									ticketsDataSetArrays[1].push([ticket_id, date_created, invoice_number, customer_name, franchise_name, owners, status, invoice_issues, mp_ticket_issues]);
								}
								break;

							case 'customer':
								if (ticketsDataSetArrays[2] != undefined) {
									ticketsDataSetArrays[2].push([ticket_id, date_created, issue_type, customer_name, franchise_name, owners, status, mp_ticket_issues]);
								}
								break;
						}

						return true;
					});

					slice_index += 1;

				} while (resultTicketSlice.length == 1000)
			}

			console.log('ticketsDataSet : ', ticketsDataSetArrays);
			// Update datatable rows.
			selector_list.forEach(function (selector, index) {
				var table_id = '#tickets-preview-' + selector;
				var datatable = $(table_id).DataTable();
				datatable.clear();
				datatable.rows.add(ticketsDataSetArrays[index]);
				datatable.draw();
			});

		}

		/**
		  * The table that will display the tickets, based on their type.
		  * @param   {String}    selector
		  * @return  {String}    inlineQty
		  */
		function dataTablePreview(selector) {
			var inlineQty = '<style>table#tickets-preview-' + selector + ' {font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px;}table#tickets-preview-' + selector + ' th{text-align: center;} .bolded{font-weight: bold;}</style>';
			inlineQty += '<table id="tickets-preview-' + selector + '" class="table table-responsive table-striped customer tablesorter" style="width: 100%; table-layout: fixed">';
			inlineQty += '<thead style="color: white;background-color: #607799;">';
			inlineQty += '<tr class="text-center">';
			inlineQty += '</tr>';
			inlineQty += '</thead>';

			inlineQty += '<tbody id="result_tickets_' + selector + '"></tbody>';

			inlineQty += '</table>';
			return inlineQty;
		}



		/**
		 * Converts the date string in the "date_to" and "date_from" fields to Javascript Date objects.
		 * @param   {String}    date_selected   ex: "2020-06-04"
		 * @returns {Date}      date            ex: Thu Jun 04 2020 00:00:00 GMT+1000 (Australian Eastern Standard Time)
		 */
		function dateSelected2Date(date_selected) {
			// date_selected = "2020-06-04"
			var date_array = date_selected.split('-');
			// date_array = ["2020", "06", "04"]
			var year = date_array[0];
			var month = date_array[1] - 1;
			var day = date_array[2];
			var date = new Date(year, month, day);
			return date;
		}

		/**
		 * Converts the date string in the "date_created" table to the format of "date_selected".
		 * @param   {String}    date_created    ex: '4/6/2020'
		 * @returns {String}    date            ex: '2020-06-04'
		 */
		function dateCreated2DateSelectedFormat(date_created) {
			// date_created = '4/6/2020'
			var date_array = date_created.split('/');
			// date_array = ["4", "6", "2020"]
			var year = date_array[2];
			var month = date_array[1];
			if (month < 10) {
				month = '0' + month;
			}
			var day = date_array[0];
			if (day < 10) {
				day = '0' + day;
			}
			return year + '-' + month + '-' + day;
		}

		/**
		 * Returns the type of record of the selected ticket.
		 * @param   {nlobjSearchResult} ticketResult
		 * @returns {String}            type of the ticket
		 */
		function getTicketType(ticketResult) {
			var barcode_number = ticketResult.getText('custrecord_barcode_number');
			if (!isNullorEmpty(barcode_number)) {
				barcode_number = barcode_number.trim();
			}

			var invoice_number = ticketResult.getText('custrecord_invoice_number');
			if (!isNullorEmpty(invoice_number)) {
				invoice_number = invoice_number.trim();
			}


			if (!isNullorEmpty(barcode_number)) {
				return 'barcode';
			} else if (!isNullorEmpty(invoice_number)) {
				return 'invoice';
			} else {
				var re_barcode = /^MP/;
				var re_invoice = /^INV/;
				var ticket_name = ticketResult.getValue('altname');
				// if (ticket_name.match(re_barcode)) {
				//     return 'barcode';
				// } else 
				if (ticket_name.match(re_invoice)) {
					return 'invoice';
				} else if (ticket_name == "Customer App" || ticket_name == "Customer Portal" || ticket_name == "Update Label") {
					return 'customer';
				} else if (ticket_name == "Operations") {
					return 'operations';
				} else {
					return 'barcode';
				}
			}
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
			pageInit: pageInit,
			saveRecord: saveRecord,
			viewClosedTickets: viewClosedTickets,
			viewLostTickets: viewLostTickets,
			onSendBulkEmails: onSendBulkEmails


		};
	}


);