 /**
  *
  * @NApiVersion 2.0
  * @NScriptType ClientScript
  *
  * Description:
  * @Last modified by:   ankithravindran
  *
  */

 define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format',
     'N/email', 'N/currentRecord'
   ],
   function(error, runtime, search, url, record, format, email, currentRecord) {
     var baseURL = 'https://1048144.app.netsuite.com';
     if (runtime.envType == "SANDBOX") {
       baseURL = 'https://1048144-sb3.app.netsuite.com';
     }
     var role = runtime.getCurrentUser().role;

     /**
      * On page initialisation
      */
     function pageInit() {

       //Background color of page to #CFE0CE
       $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
       $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
       $("#body").css("background-color", "#CFE0CE");


       // Tickets Created
       $(document).ready(function() {
         var tableDataSet = [];
         var dataTable = $('#tickets-preview').DataTable({
           destroy: true,
           data: tableDataSet,
           pageLength: 1000,
           order: [
             [1, 'desc']
           ],
           columns: [{
             title: 'LINK'
           }, {
             title: 'Week',
             type: "date"
           }, {
             title: 'Tickets Created'
           }, {
             title: 'Tickets Closed'
           }, {
             title: 'Tickets in Progress'
           }, {
             title: 'Tickets Open'
           }, {
             title: 'LIT Tickets'
           }, {
             title: 'ADP Tickets'
           }, {
             title: 'Number of Customers'
           }, {
             title: 'Number of Zees'
           }]

         });

         var dataTable2 = $('#tickets-customer').DataTable({
           destroy: true,
           data: tableDataSet,
           pageLength: 100,
           order: [
             [5, 'desc']
           ],
           columns: [{
             title: 'Customer Name',
           }, {
             title: 'Franchisee'
           }, {
             title: 'Number of Open Tickets'
           }, {
             title: 'Number of In Progress Tickets'
           }, {
             title: 'Number of Closed Tickets'
           }, {
             title: 'Total Number of Tickets'
           }]

         });
         var dataTable3 = $('#tickets-zee').DataTable({
           destroy: true,
           data: tableDataSet,
           pageLength: 100,
           order: [
             [4, 'desc']
           ],
           columns: [{
             title: 'Franchisee',
           }, {
             title: 'Number of Open Tickets'
           }, {
             title: 'Number of In Progress Tickets'
           }, {
             title: 'Number of Closed Tickets'
           }, {
             title: 'Total Number of Tickets'
           }]

         });
       });

       if (!isNullorEmpty($('#period_dropdown option:selected').val())) {
         selectDate();
       }
       $('#period_dropdown').change(function() {
         selectDate();
       });

       var currRec = currentRecord.get();
       var date_from = currRec.getValue({
         fieldId: 'custpage_date_from'
       });
       var date_to = currRec.getValue({
         fieldId: 'custpage_date_to'
       });
       console.log('date', date_from);
       console.log('to', date_to);

       overviewChart(date_from, date_to);
       customerChart(date_from, date_to);
       // staffChart(date_from, date_to);
       sourceChart(date_from, date_to);
       barcodeSourceChart(date_from, date_to);

       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         manualChart(date_from, date_to)
         shopifyChart(date_from, date_to)
         portalChart(date_from, date_to)
         bulkChart(date_from, date_to)
       } else {
         manualChart(getFirstDay(), getLastDay())
         shopifyChart(getFirstDay(), getLastDay())
         portalChart(getFirstDay(), getLastDay())
         bulkChart(getFirstDay(), getLastDay())
       }

       $(".loader").css("display", "none");

       $('#submit').click(function() {
         console.log('submit clicked');
         var date_from = $('#date_from').val();
         var date_to = $('#date_to').val();
         date_from = dateISOToNetsuite(date_from);
         date_to = dateISOToNetsuite(date_to);

         if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
           var params = {
             date_from: date_from,
             date_to: date_to
           };
           params = JSON.stringify(params);
           var output = url.resolveScript({
             deploymentId: 'customdeploy_sl_ticketing_report',
             scriptId: 'customscript_sl_ticketing_report',
           });
           var upload_url = baseURL + output + '&custparam_params=' +
             params;
           window.open(upload_url, "_self",
             "height=750,width=650,modal=yes,alwaysRaised=yes");
         }
       });
     }

     function overviewChart(date_from, date_to) {
       var date_set_created = [];

       var cnt_set_created = [];
       var cnt_set_prog = [];
       var cnt_set_open = [];
       var cnt_set_closed = [];
       var cnt_set_cust = [];
       var cnt_set_zee = [];
       var cnt_set_lit = [];
       var cnt_set_adp = [];

       var created_obj = {};
       var closed_obj = {};
       var progress_obj = {};
       var open_obj = {};
       var cust_obj = {};
       var zee_obj = {};
       var lit_obj = {};
       var adp_obj = {};

       var source_sender_data = {};

       var ticketCreatedRes = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_created_report_week'
       });

       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         ticketCreatedRes.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         ticketCreatedRes.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       }


       ticketCreatedRes.run().each(function(ticket) {
         var dateCreated = ticket.getValue({
           name: 'created',
           summary: 'GROUP'
         });
         var ticketsCount = ticket.getValue({
           name: 'name',
           summary: 'COUNT'
         });

         var custCount = ticket.getValue({
           name: "internalid",
           join: "CUSTRECORD_CUSTOMER1",
           summary: "COUNT",
         });
         var zeeCount = ticket.getValue({
           name: "internalid",
           join: "CUSTRECORD_ZEE",
           summary: "COUNT",
         });

         if (!(date_set_created.includes(dateCreated))) {
           date_set_created.push(dateCreated);
           date_set_created.sort(function(a, b) {
             var aComps = a.split("/");
             var bComps = b.split("/");
             var aDate = new Date(aComps[2], aComps[1], aComps[0]);
             var bDate = new Date(bComps[2], bComps[1], bComps[0]);
             return aDate.getTime() - bDate.getTime();
           });

         }
         cnt_set_created.push([date_set_created.indexOf(dateCreated),
           parseInt(ticketsCount)
         ]);
         cnt_set_cust.push([date_set_created.indexOf(dateCreated),
           parseInt(custCount)
         ]);
         cnt_set_zee.push([date_set_created.indexOf(dateCreated),
           parseInt(zeeCount)
         ]);
         created_obj[dateCreated] = parseInt(ticketsCount);
         cust_obj[dateCreated] = parseInt(custCount);
         zee_obj[dateCreated] = parseInt(zeeCount);

         return true;

       });
       console.log('date_set_created 1', date_set_created);

       // Tickets Closed
       var ticketClosedRes = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_closed_report_week'
       });

       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         ticketClosedRes.filters.push(search.createFilter({
           name: "custrecord_date_closed",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         ticketClosedRes.filters.push(search.createFilter({
           name: "custrecord_date_closed",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       }
       ticketClosedRes.run().each(function(ticket) {
         var ticketsCount = ticket.getValue({
           name: 'name',
           summary: 'COUNT'
         });
         var dateCreated = ticket.getValue({
           name: 'custrecord_date_closed',
           summary: 'GROUP'
         });
         if (!(date_set_created.includes(dateCreated))) {
           date_set_created.push(dateCreated);
           date_set_created.sort(function(a, b) {
             var aComps = a.split("/");
             var bComps = b.split("/");
             var aDate = new Date(aComps[2], aComps[1], aComps[0]);
             var bDate = new Date(bComps[2], bComps[1], bComps[0]);
             return aDate.getTime() - bDate.getTime();
           });
         }
         cnt_set_closed.push([date_set_created.indexOf(dateCreated),
           parseInt(ticketsCount)
         ]);
         closed_obj[dateCreated] = parseInt(ticketsCount);

         return true;

       });

       // Tickets Progress
       var ticketProgressRes = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_prog_report_week'
       });

       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         ticketProgressRes.filters.push(search.createFilter({
           name: "lastmodified",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         ticketProgressRes.filters.push(search.createFilter({
           name: "lastmodified",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       }
       ticketProgressRes.run().each(function(ticket) {
         var ticketsCount = ticket.getValue({
           name: 'name',
           summary: 'COUNT'
         });
         var dateCreated = ticket.getValue({
           name: "lastmodified",
           summary: "GROUP",
         });
         if (!(date_set_created.includes(dateCreated))) {
           date_set_created.push(dateCreated);
         }
         cnt_set_prog.push([date_set_created.indexOf(dateCreated),
           parseInt(ticketsCount)
         ]);

         progress_obj[dateCreated] = parseInt(ticketsCount);

         return true;

       });

       // Open Tickets
       var ticketOpenRes = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_open_report_week'
       });

       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         ticketOpenRes.filters.push(search.createFilter({
           name: "lastmodified",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         ticketOpenRes.filters.push(search.createFilter({
           name: "lastmodified",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       }

       ticketOpenRes.run().each(function(ticket) {
         var ticketsCount = ticket.getValue({
           name: 'name',
           summary: 'COUNT'
         });
         var dateCreated = ticket.getValue({
           name: "lastmodified",
           summary: "GROUP",
         });
         if (!(date_set_created.includes(dateCreated))) {
           date_set_created.push(dateCreated);
         }
         cnt_set_open.push([date_set_created.indexOf(dateCreated),
           parseInt(ticketsCount)
         ]);

         open_obj[dateCreated] = parseInt(ticketsCount);


         return true;

       });

       // LIT Tickets
       var ticketLITRes = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_source_report_week_2'
       });

       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         ticketLITRes.filters.push(search.createFilter({
           name: "custrecord_date_closed",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         ticketLITRes.filters.push(search.createFilter({
           name: "custrecord_date_closed",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       }

       ticketLITRes.run().each(function(ticket) {
         var ticketsCount = ticket.getValue({
           name: 'name',
           summary: 'COUNT'
         });
         var dateCreated = ticket.getValue({
           name: "custrecord_date_closed",
           summary: "GROUP",
         });
         if (!(date_set_created.includes(dateCreated))) {
           date_set_created.push(dateCreated);
         }
         cnt_set_lit.push([date_set_created.indexOf(dateCreated),
           parseInt(ticketsCount)
         ]);

         lit_obj[dateCreated] = parseInt(ticketsCount);


         return true;

       });

       // ADP Tickets
       var ticketADPRes = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_source_report_week_3'
       });

       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         ticketADPRes.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         ticketADPRes.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       }

       ticketADPRes.run().each(function(ticket) {
         var ticketsCount = ticket.getValue({
           name: 'name',
           summary: 'COUNT'
         });
         var dateCreated = ticket.getValue({
           name: "created",
           summary: "GROUP",
         });
         if (!(date_set_created.includes(dateCreated))) {
           date_set_created.push(dateCreated);
         }
         cnt_set_adp.push([date_set_created.indexOf(dateCreated),
           parseInt(ticketsCount)
         ]);

         adp_obj[dateCreated] = parseInt(ticketsCount);


         return true;

       });

       var colors = Highcharts.getOptions().colors;
       var title = '<b>Ticketing Breakdown (' + date_set_created[0] + ' - ' +
         date_set_created[date_set_created.length - 1] + ')</b>';

       Highcharts.chart('container', {
         chart: {
           height: (6 / 16 * 100) + '%',
           zoomType: 'xy'
         },
         legend: {
           align: 'right',
           x: -30,
           verticalAlign: 'top',
           y: 25,
           floating: true,
           backgroundColor: Highcharts.defaultOptions.legend.backgroundColor ||
             'white',
           borderColor: '#CCC',
           borderWidth: 1,
           shadow: false
         },

         title: {
           text: title
         },

         yAxis: {
           title: {
             text: 'Tickets Count'
           },
           accessibility: {
             description: 'Tickets Count'
           }
         },

         xAxis: {
           title: {
             text: 'Weeks'
           },
           accessibility: {
             description: 'Weeks'
           },
           style: {
             fontWeight: 'bold',
           },
           categories: date_set_created
         },
         tooltip: {
           shared: true
         },

         plotOptions: {
           series: {
             cursor: 'pointer',
             dataLabels: {
               enabled: true,
               align: 'right',
               color: 'black',
               x: -10
             }
           },
           pointPadding: 0.1,
         },


         series: [{
             name: 'Tickets Created',
             data: cnt_set_created,
             color: colors[2],
             type: 'spline'
           }, {
             name: 'Closed Tickets',
             data: cnt_set_closed,
             dashStyle: 'Dash',
             color: colors[4],
             type: 'spline'
           }, {
             name: 'Number of Customers',
             type: 'column',
             data: cnt_set_cust,
             color: colors[8],
           }, {
             name: 'Number of Zees',
             type: 'column',
             data: cnt_set_zee,
             color: colors[7],
           }, {
             name: 'Open Tickets',
             data: cnt_set_open,
             dashStyle: 'ShortDashDot',
             color: colors[9]
           }, {
             name: 'In Progress Tickets',
             data: cnt_set_prog,
             dashStyle: 'ShortDot',
             color: colors[6],
             type: 'spline'
           }, {
             name: 'LIT Tickets',
             data: cnt_set_lit,
             dashStyle: 'LongDash',
             color: colors[3],
             type: 'spline'
           }, {
             name: 'ADP Tickets',
             data: cnt_set_adp,
             dashStyle: 'LongDashDot',
             color: colors[1],
             type: 'spline'
           }

         ],

         responsive: {
           rules: [{
             condition: {
               maxWidth: 550
             },
             chartOptions: {

               legend: {
                 itemWidth: 150
               },
               xAxis: {
                 categories: date_set_created,
                 title: ''
               },
               yAxis: {
                 visible: false
               }
             }
           }]
         }
       });
       var dataTable = $('#tickets-preview').DataTable();
       dataTable.clear();
       var tableDataSet = [];
       date_set_created.forEach(function(date) {
         var created = (isNullorEmpty(created_obj[date])) ? 0 :
           created_obj[date];
         var closed = (isNullorEmpty(closed_obj[date])) ? 0 : closed_obj[
           date];
         var progress = (isNullorEmpty(progress_obj[date])) ? 0 :
           progress_obj[date];
         var open = (isNullorEmpty(open_obj[date])) ? 0 : open_obj[date];
         var cust = (isNullorEmpty(cust_obj[date])) ? 0 : cust_obj[date];
         var zee = (isNullorEmpty(zee_obj[date])) ? 0 : zee_obj[date];
         var lit = (isNullorEmpty(lit_obj[date])) ? 0 : lit_obj[date];
         var adp = (isNullorEmpty(adp_obj[date])) ? 0 : adp_obj[date];

         var link1 =
           '<a href=\'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1306&deploy=1&compid=1048144&custparam_params={"date_from":"' +
           getWeekStart(date) + '","date_to":"' + getWeekEnd(date) +
           '"}\' target=_blank>VIEW (per day)</a> ';
         var link2 =
           '<a href=\'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1301&deploy=1&compid=1048144&custparam_params={"date_from":"' +
           getMonthStart(date) + '","date_to":"' + getMonthEnd(date) +
           '"}\' target=_blank>VIEW (per month)</a> ';
         var link3 =
           '<a href=\'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1304&deploy=1&compid=1048144&custparam_params={"date_from":"' +
           getYearStart(date) + '","date_to":"' + getYearEnd(date) +
           '"}\' target=_blank>VIEW (per year)</a> ';

         var link = link1 + link2 + link3;
         tableDataSet.push([link, dateCreated2DateSelectedFormat(date),
           created, closed, progress, open, lit, adp, cust, zee
         ]);
       });

       dataTable.rows.add(tableDataSet);
       dataTable.draw();

     }


     function customerChart(date_from, date_to) {
       // For Customer Chart
       var customer_set_chart = [];
       var cust_count_open = [];
       var cust_count_prog = [];
       var cust_count_clo = [];

       // For Cust Datatable
       var cust_open_obj = {};
       var cust_prog_obj = {};
       var cust_clo_obj = {};
       var cust_zee = [];
       var cust_ids = [];

       // For Zee Chart
       var zee_set_chart = [];
       var zee_count_open = {};
       var zee_count_prog = {};
       var zee_count_clo = {};

       //For Zee Datatable
       var zee_open_obj = {};
       var zee_prog_obj = {};
       var zee_clo_obj = {};

       // Search
       var custSearch = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_customer_report_week'
       });

       // Status Code
       // Closed = 3
       // Closed-Lost = 9
       // Open = 1
       // In Progress = 2 CS, 4 IT

       var title = '<b>Number of Tickets per Customer (' + getFirstDay() +
         ' - ' +
         getLastDay() + ')</b>';
       var title2 = '<b>Number of Tickets per Zee (' + getFirstDay() + ' - ' +
         getLastDay() + ')</b>';
       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         title = '<b>Number of Tickets per Customer (' + date_from + ' - ' +
           date_to + ')</b>';
         title2 = '<b>Number of Tickets per Zee (' + date_from + ' - ' +
           date_to +
           ')</b>';
         custSearch.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         custSearch.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       } else {
         custSearch.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: getFirstDay(),
         }));

         custSearch.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: getLastDay(),
         }));

       }
       custSearch.run().each(function(ticket) {

         var count = ticket.getValue({
           name: "name",
           summary: "COUNT"
         });
         var cust = ticket.getText({
           name: "custrecord_customer1",
           summary: "GROUP"
         });
         var zee = ticket.getText({
           name: "custrecord_zee",
           summary: "GROUP"
         });
         var status = ticket.getValue({
           name: "custrecord_ticket_status",
           summary: "GROUP",
         });

         if (isNullorEmpty(cust)) {
           cust = "No Customer Allocated";
         }

         if (isNullorEmpty(zee)) {
           zee = 'No Zee Allocated';
         }

         //Array of unique custoemrs- no duplicates
         if (!customer_set_chart.includes(cust)) {
           customer_set_chart.push(cust);
           cust_ids.push(parseInt(ticket.getValue({
             name: "custrecord_customer1",
             summary: "GROUP"
           })));
           cust_zee.push(zee);
         }

         //Array of unique zees- no duplicates
         if (!zee_set_chart.includes(zee)) {
           zee_set_chart.push(zee)
         }

         if (status == 1) { //Open Tickets
           //Chart Data
           cust_count_open.push([customer_set_chart.indexOf(cust),
             parseInt(count)
           ]);
           if (zee in zee_count_open) {
             zee_count_open[zee] = zee_count_open[zee] + parseInt(count);
           } else {
             zee_count_open[zee] = parseInt(count);
           }

           //Datatable Data
           if (cust in cust_open_obj) {
             cust_open_obj[cust] = cust_open_obj[cust] + parseInt(count);
           } else {
             cust_open_obj[cust] = parseInt(count);
           }
         } else if (status == 3 || status == 9) { //Closed Tickets
           //Chart Data
           cust_count_clo.push([customer_set_chart.indexOf(cust),
             parseInt(count)
           ]);
           if (zee in zee_count_clo) {
             zee_count_clo[zee] = zee_count_clo[zee] + parseInt(count);
           } else {
             zee_count_clo[zee] = parseInt(count);
           }

           //Datatable Data
           if (cust in cust_clo_obj) {
             cust_clo_obj[cust] = cust_clo_obj[cust] + parseInt(count);
           } else {
             cust_clo_obj[cust] = parseInt(count);
           }
         } else { //In Progress Tickets
           //Chart Data
           cust_count_prog.push([customer_set_chart.indexOf(cust),
             parseInt(count)
           ]);
           if (zee in zee_count_prog) {
             zee_count_prog[zee] = zee_count_prog[zee] + parseInt(count);
           } else {
             zee_count_prog[zee] = parseInt(count);
           }

           //Datatable Data
           if (cust in cust_prog_obj) {
             cust_prog_obj[cust] = cust_prog_obj[cust] + parseInt(count);
           } else {
             cust_prog_obj[cust] = parseInt(count);
           }
         }


         return true;
       });



       //Customer Chart
       Highcharts.chart('container2', {

         chart: {
           type: 'bar',
           height: (6 / 16 * 100) + '%',
           zoomType: 'xy'
         },
         title: {
           text: title
         },
         xAxis: {
           categories: customer_set_chart,
           title: {
             text: 'Customer'
           }
         },
         yAxis: {
           title: {
             text: 'Tickets',
           },
           labels: {
             overflow: 'justify'
           }
         },
         legend: {
           align: 'right',
           x: -30,
           verticalAlign: 'top',
           y: 25,
           floating: true,
           backgroundColor: Highcharts.defaultOptions.legend.backgroundColor ||
             'white',
           borderColor: '#CCC',
           borderWidth: 1,
           shadow: false
         },
         tooltip: {
           valueSuffix: ' tickets',
           shared: true
         },
         plotOptions: {
           bar: {
             dataLabels: {
               enabled: true
             },
             stacking: 'normal',
             states: {
               inactive: {
                 enabled: false
               }
             }
           },

         },
         series: [{
           name: 'Open',
           data: cust_count_open,
           color: '#F2C80F'
         }, {
           name: 'In Progress',
           data: cust_count_prog,
           color: '#F15628'
         }, {
           name: 'Closed',
           data: cust_count_clo,
           color: '#108372'
         }]
       });



       //Customer Datatable
       var dataTable = $('#tickets-customer').DataTable();
       dataTable.clear();
       var tableDataSet = [];
       customer_set_chart.forEach(function(cust, index) {
         var cust_link =
           '<a href="https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' +
           cust_ids[index] + '">' + cust + '</a>';

         var open = (cust in cust_open_obj) ? cust_open_obj[cust] : 0;
         var progress = (cust in cust_prog_obj) ? cust_prog_obj[cust] : 0;
         var closed = (cust in cust_clo_obj) ? cust_clo_obj[cust] : 0;
         var total = open + progress + closed;

         tableDataSet.push([cust_link, cust_zee[index], open, progress,
           closed, total
         ]);
       });

       dataTable.rows.add(tableDataSet);
       dataTable.draw();


       var zee_count_open2 = [];
       var zee_count_prog2 = [];
       var zee_count_clo2 = [];

       for (var key in zee_count_open) {
         zee_count_open2.push([zee_set_chart.indexOf(key), zee_count_open[key]]);
       }
       for (var key in zee_count_prog) {
         zee_count_prog2.push([zee_set_chart.indexOf(key), zee_count_prog[key]]);
       }
       for (var key in zee_count_clo) {
         zee_count_clo2.push([zee_set_chart.indexOf(key), zee_count_clo[key]]);
       }

       console.log('aa', zee_count_open2);
       console.log('bb', zee_count_prog2);
       console.log('cc', zee_count_clo2);

       //Zee Chart
       Highcharts.chart('container3', {

         chart: {
           type: 'bar',
           height: (6 / 16 * 100) + '%',
           zoomType: 'xy'
         },
         title: {
           text: title2
         },
         xAxis: {
           categories: zee_set_chart,
           title: {
             text: 'Zee'
           }
         },
         yAxis: {
           title: {
             text: 'Tickets',
           },
           labels: {
             overflow: 'justify'
           }
         },
         legend: {
           align: 'right',
           x: -30,
           verticalAlign: 'top',
           y: 25,
           floating: true,
           backgroundColor: Highcharts.defaultOptions.legend.backgroundColor ||
             'white',
           borderColor: '#CCC',
           borderWidth: 1,
           shadow: false
         },
         tooltip: {
           valueSuffix: ' tickets',
           shared: true
         },
         plotOptions: {
           bar: {
             dataLabels: {
               enabled: true
             },
             stacking: 'normal',
             states: {
               inactive: {
                 enabled: false
               }
             }
           },
           //stacking: 'normal'
         },
         series: [{
             name: 'Open',
             data: zee_count_open2,
             color: '#F2C80F'
           }, {
             name: 'In Progress',
             data: zee_count_prog2,
             color: '#F15628'
           }, {
             name: 'Closed',
             data: zee_count_clo2,
             color: '#108372'
           },

         ]
       });


       console.log('zeesds', zee_count_open);
       //Zee Datatable
       var dataTable2 = $('#tickets-zee').DataTable();
       dataTable2.clear();
       var tableDataSet2 = [];

       for (var key in zee_set_chart) {
         var open = (zee_set_chart[key] in zee_count_open) ? zee_count_open[
           zee_set_chart[key]] : 0;
         var progress = (zee_set_chart[key] in zee_count_prog) ?
           zee_count_prog[zee_set_chart[key]] : 0;
         var closed = (zee_set_chart[key] in zee_count_clo) ? zee_count_clo[
           zee_set_chart[key]] : 0;
         var total = open + progress + closed;

         tableDataSet2.push([zee_set_chart[key], open, progress, closed,
           total
         ]);
       }

       dataTable2.rows.add(tableDataSet2);
       dataTable2.draw();


     }

     function staffChart(date_from, date_to) {
       var jOpen = 0;
       var aOpen = 0;
       var jProg = 0;
       var aProg = 0;
       var jClo = 0;
       var aClo = 0;
       var gOpen = 0;
       var gProg = 0;
       var gClo = 0;
       var kOpen = 0;
       var kProg = 0;
       var kClo = 0;
       var oOpen = 0;
       var oProg = 0;
       var oClo = 0;
       var jOpenData = [];
       var aOpenData = [];
       var gOpenData = [];
       var kOpenData = [];
       var oOpenData = [];
       var jProgData = {};
       var aProgData = {};
       var gProgData = {};
       var kProgData = {};
       var oProgData = {};
       var jCloData = {};
       var aCloData = {};
       var gCloData = {};
       var kCloData = {};
       var oCloData = {};

       // Closed = 3
       // Closed-Lost = 9
       // Open = 1
       // In Progress = 2 CS, 4 IT
       // Jess 386344
       // Aleyna 1623053
       // Kaley 1565545
       // Gab 1154991
       var staffSearch = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_source3_report_week'
       });

       var title = 'Staff Breakdown (' + getFirstDay() + ' - ' + getLastDay() +
         ')';
       var firstDate = getFirstDay();
       var lastDate = getLastDay();
       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         title = 'Staff Breakdown (' + date_from + ' - ' + date_to + ')';
         firstDate = date_from;
         lastDate = date_to;
         staffSearch.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         staffSearch.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       } else {
         staffSearch.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: getFirstDay(),
         }));

         staffSearch.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: getLastDay(),
         }));

       }

       var dateSet = [];
       staffSearch.run().each(function(ticket) {
         var cnt = ticket.getValue({
           name: "name",
           summary: "COUNT"
         });
         var date = ticket.getValue({
           name: "created",
           summary: "GROUP"
         });
         var status = ticket.getValue({
           name: "custrecord_ticket_status",
           summary: "GROUP"
         });
         var owner = ticket.getValue({
           name: "owner",
           summary: "GROUP"
         });

         if (!(dateSet.includes(date))) {
           dateSet.push(date);
         }
         if (owner == 386344) { // Jess
           if (status == 1) { // Open
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               jOpen += parseInt(cnt);
             }
             if (date in jOpenData) {
               jOpenData[date] = jOpenData[date] + parseInt(cnt);
             } else {
               jOpenData[date] = parseInt(cnt);
             }
           } else if (status == 3 || status == 9) { // Closed or Closed-Lost
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               jClo += parseInt(cnt);
             }
             if (date in jCloData) {
               jCloData[date] = jCloData[date] + parseInt(cnt);
             } else {
               jCloData[date] = parseInt(cnt);
             }
           } else {
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               jProg += parseInt(cnt);
             }
             if (date in jProgData) {
               jProgData[date] = jProgData[date] + parseInt(cnt);
             } else {
               jProgData[date] = parseInt(cnt);
             }
           }
         } else if (owner == 1623053) { // Aleyna
           if (status == 1) { // Open
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               aOpen += parseInt(cnt);
             }
             if (date in jOpenData) {
               aOpenData[date] = aOpenData[date] + parseInt(cnt);
             } else {
               aOpenData[date] = parseInt(cnt);
             }
           } else if (status == 3 || status == 9) { // Closed or Closed-Lost
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               aClo += parseInt(cnt);
             }
             if (date in jCloData) {
               aCloData[date] = aCloData[date] + parseInt(cnt);
             } else {
               aCloData[date] = parseInt(cnt);
             }
           } else {
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               aProg += parseInt(cnt);
             }
             if (date in jProgData) {
               aProgData[date] = aProgData[date] + parseInt(cnt);
             } else {
               aProgData[date] = parseInt(cnt);
             }
           }
         } else if (owner == 1565545) { // Kaley
           if (status == 1) { // Open
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               kOpen += parseInt(cnt);
             }
             if (date in kOpenData) {
               kOpenData[date] = kOpenData[date] + parseInt(cnt);
             } else {
               kOpenData[date] = parseInt(cnt);
             }
           } else if (status == 3 || status == 9) { // Closed or Closed-Lost
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               kClo += parseInt(cnt);
             }
             if (date in kCloData) {
               kCloData[date] = kCloData[date] + parseInt(cnt);
             } else {
               kCloData[date] = parseInt(cnt);
             }
           } else {
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               kProg += parseInt(cnt);
             }
             if (date in kProgData) {
               kProgData[date] = kProgData[date] + parseInt(cnt);
             } else {
               kProgData[date] = parseInt(cnt);
             }
           }
         } else if (owner == 1154991) { // Gab
           if (status == 1) { // Open
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               gOpen += parseInt(cnt);
             }
             if (date in gOpenData) {
               gOpenData[date] = gOpenData[date] + parseInt(cnt);
             } else {
               gOpenData[date] = parseInt(cnt);
             }
           } else if (status == 3 || status == 9) { // Closed or Closed-Lost
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               gClo += parseInt(cnt);
             }
             if (date in gCloData) {
               gCloData[date] = gCloData[date] + parseInt(cnt);
             } else {
               gCloData[date] = parseInt(cnt);
             }
           } else {
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               gProg += parseInt(cnt);
             }
             if (date in gProgData) {
               gProgData[date] = gProgData[date] + parseInt(cnt);
             } else {
               gProgData[date] = parseInt(cnt);
             }
           }
         } else { // Other
           if (status == 1) { // Open
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               oOpen += parseInt(cnt);
             }
             if (date in oOpenData) {
               oOpenData[date] = oOpenData[date] + parseInt(cnt);
             } else {
               oOpenData[date] = parseInt(cnt);
             }
           } else if (status == 3 || status == 9) { // Closed or Closed-Lost
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               oClo += parseInt(cnt);
             }
             if (date in oCloData) {
               oCloData[date] = oCloData[date] + parseInt(cnt);
             } else {
               oCloData[date] = parseInt(cnt);
             }
           } else {
             if (firstCompare(date, firstDate) && secondCompare(date,
                 lastDate)) {
               oProg += parseInt(cnt);
             }
             if (date in oProgData) {
               oProgData[date] = oProgData[date] + parseInt(cnt);
             } else {
               oProgData[date] = parseInt(cnt);
             }
           }
         }
         return true;

       });



       console.log('jOpendata', jOpenData);

       var colors = Highcharts.getOptions().colors;
       $('#container4').highcharts({
         chart: {
           height: (6 / 16 * 100) + '%',
           zoomType: 'xy',
           type: 'column',
           events: {
             drilldown: function(e) {
               if (!e.seriesOptions) {

                 var chart = this,
                   drilldowns = {
                     'Jess': {
                       name: 'Open',
                       color: '#F2C80F',
                       data: convertArrObj(dateSet, jOpenData),
                       //drilldowns: true
                     },
                     'Aleyna': {
                       name: 'Open',
                       color: '#F2C80F',
                       data: convertArrObj(dateSet, aOpenData),
                       //drilldowns: true
                     },
                     'Gab': {
                       name: 'Open',
                       color: '#F2C80F',
                       data: convertArrObj(dateSet, gOpenData),
                       //drilldown: true
                     },
                     'Kaley': {
                       name: 'Open',
                       color: '#F2C80F',
                       data: convertArrObj(dateSet, kOpenData)
                     },
                     'Other': {
                       name: 'Open',
                       color: '#F2C80F',
                       data: convertArrObj(dateSet, oOpenData)
                     }
                   },
                   drilldowns2 = {
                     'Jess': {
                       name: 'Closed',
                       color: '#108372',
                       data: convertArrObj(dateSet, jCloData)
                     },
                     'Aleyna': {
                       name: 'Closed',
                       color: '#108372',
                       data: convertArrObj(dateSet, aCloData)
                     },
                     'Gab': {
                       name: 'Closed',
                       color: '#108372',
                       data: convertArrObj(dateSet, gCloData)
                     },
                     'Kaley': {
                       name: 'Closed',
                       color: '#108372',
                       data: convertArrObj(dateSet, kCloData)
                     },
                     'Other': {
                       name: 'Closed',
                       color: '#108372',
                       data: convertArrObj(dateSet, oCloData)
                     }
                   },
                   drilldowns3 = {
                     'Jess': {
                       name: 'In Progress',
                       color: '#F15628',
                       data: convertArrObj(dateSet, jProgData)
                     },
                     'Aleyna': {
                       name: 'In Progress',
                       color: '#F15628',
                       data: convertArrObj(dateSet, aProgData)
                     },
                     'Gab': {
                       name: 'In Progress',
                       color: '#F15628',
                       data: convertArrObj(dateSet, gProgData)
                     },
                     'Kaley': {
                       name: 'In Progress',
                       color: '#F15628',
                       data: convertArrObj(dateSet, kProgData)
                     },
                     'Other': {
                       name: 'In Progress',
                       color: '#F15628',
                       data: convertArrObj(dateSet, oProgData)
                     }
                   },
                   series = drilldowns[e.point.name],
                   series2 = drilldowns2[e.point.name];
                 series3 = drilldowns3[e.point.name];
                 chart.addSingleSeriesAsDrilldown(e.point, series);
                 chart.addSingleSeriesAsDrilldown(e.point, series2);
                 chart.addSingleSeriesAsDrilldown(e.point, series3);
                 chart.applyDrilldown();

               }

             }
           }
         },
         title: {
           text: title
         },
         xAxis: {
           type: 'category'
         },
         yAxis: {
           min: 0,
           title: {
             text: 'Number of Tickets'
           }
         },
         legend: {
           align: 'right',
           x: -30,
           verticalAlign: 'top',
           y: 25,
           floating: true,
           backgroundColor: Highcharts.defaultOptions.legend.backgroundColor ||
             'white',
           borderColor: '#CCC',
           borderWidth: 1,
           shadow: false
         },
         tooltip: {
           shared: true
         },


         plotOptions: {
           column: {
             stacking: 'normal'
           },
           series: {
             borderWidth: 0,
             dataLabels: {
               enabled: true,
               color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) ||
                 'black',
               formatter: function() {
                 return (this.y != 0) ? this.y : "";
               }
             }
           }

         },

         series: [{
           name: 'Open',
           color: '#F2C80F',
           data: [{
             name: 'Jess',
             y: jOpen,
             drilldown: true
           }, {
             name: 'Aleyna',
             y: aOpen,
             drilldown: true
           }, {
             name: 'Gab',
             y: gOpen,
             drilldown: true
           }, {
             name: 'Kaley',
             y: kOpen,
             drilldown: true
           }, {
             name: 'Other',
             y: oOpen,
             drilldown: true
           }]
         }, {
           name: 'In Progress',
           color: '#F15628',
           data: [{
             name: 'Jess',
             y: jProg,
             drilldown: true
           }, {
             name: 'Aleyna',
             y: aProg,
             drilldown: true
           }, {
             name: 'Gab',
             y: gProg,
             drilldown: true
           }, {
             name: 'Kaley',
             y: gProg,
             drilldown: true
           }, {
             name: 'Other',
             y: gProg,
             drilldown: true
           }]
         }, {
           name: 'Closed',
           color: '#108372',
           data: [{
             name: 'Jess',
             y: jClo,
             drilldown: true
           }, {
             name: 'Aleyna',
             y: aClo,
             drilldown: true
           }, {
             name: 'Gab',
             y: gClo,
             drilldown: true
           }, {
             name: 'Kaley',
             y: kClo,
             drilldown: true
           }, {
             name: 'Other',
             y: oClo,
             drilldown: true
           }],
           visible: false
         }],

         drilldown: {
           series: []
         }
       });

     }

     function sourceChart(date_from, date_to) {
       var colors = Highcharts.getOptions().colors;
       var web_send = [];
       var web_recv = [];
       var nonweb_send = [];
       var nonweb_recv = [];
       var date_set = [];
       var nonweb_send_obj = {};
       var nonweb_recv_obj = {};
       //Source
       var ticketSourceRes = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_source_report_week'
       });

       var title = '<b>Sender vs Receiver Breakdown (' + getFirstDay() +
         ' - ' +
         getLastDay() + ')</b>';
       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         title = '<b>Sender vs Receiver Breakdown (' + date_from + ' - ' +
           date_to + ')</b>';
         ticketSourceRes.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         ticketSourceRes.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       } else {
         ticketSourceRes.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: getFirstDay(),
         }));

         ticketSourceRes.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: getLastDay(),
         }));

       }

       ticketSourceRes.run().each(function(ticket) {
         var ticketsCount = ticket.getValue({
           name: 'name',
           summary: 'COUNT'
         });
         var ticketsDate = ticket.getValue({
           name: 'created',
           summary: 'GROUP'
         });
         var ticketsStatus = ticket.getValue({
           name: "custrecord_enquiry_status",
           summary: "GROUP",
         });

         var owner = ticket.getValue({
           name: "owner",
           summary: "GROUP",
         });

         if (ticketsStatus == 1 || ticketsStatus == 4) {
           if (!(date_set.includes(ticketsDate))) {
             date_set.push(ticketsDate);
           }
         }

         if (ticketsStatus == 1) { //Sender
           if (owner == -4) {
             web_send.push([date_set.indexOf(ticketsDate), parseInt(
               ticketsCount)]);
           } else {
             if (ticketsDate in nonweb_send_obj) {
               nonweb_send_obj[ticketsDate] = nonweb_send_obj[ticketsDate] +
                 parseInt(ticketsCount);
             } else {
               nonweb_send_obj[ticketsDate] = parseInt(ticketsCount);
             }
           }

         } else if (ticketsStatus == 4) { //Receiver
           if (owner == -4) {
             web_recv.push([date_set.indexOf(ticketsDate), parseInt(
               ticketsCount)]);
           } else {
             if (ticketsDate in nonweb_recv_obj) {
               nonweb_recv_obj[ticketsDate] = nonweb_recv_obj[ticketsDate] +
                 parseInt(ticketsCount);
             } else {
               nonweb_recv_obj[ticketsDate] = parseInt(ticketsCount);
             }
           }
         }

         return true;

       });

       for (var key in nonweb_recv_obj) {
         nonweb_recv.push([date_set.indexOf(key), nonweb_recv_obj[key]]);
       }

       for (var key in nonweb_send_obj) {
         nonweb_send.push([date_set.indexOf(key), nonweb_send_obj[key]]);
       }

       Highcharts.chart('container5', {
         chart: {
           type: 'column',
           height: (6 / 16 * 100) + '%',
           zoomType: 'xy'
         },
         title: {
           text: title
         },
         xAxis: {
           categories: date_set
         },
         yAxis: {
           min: 0,
           title: {
             text: 'Number of Tickets'
           },
           stackLabels: {
             enabled: true,
             style: {
               fontWeight: 'bold',
               color: ( // theme
                 Highcharts.defaultOptions.title.style &&
                 Highcharts.defaultOptions.title.style.color
               ) || 'gray'
             }
           }
         },
         legend: {
           align: 'right',
           x: -30,
           verticalAlign: 'top',
           y: 25,
           floating: true,
           backgroundColor: Highcharts.defaultOptions.legend.backgroundColor ||
             'white',
           borderColor: '#CCC',
           borderWidth: 1,
           shadow: false
         },
         tooltip: {
           shared: true
         },
         plotOptions: {
           column: {
             stacking: 'normal',
             dataLabels: {
               enabled: true
             }
           }
         },
         series: [{
           name: 'Website- Sender',
           data: web_send,
           stack: 1,
           color: '#F2C80F'
         }, {
           name: 'Website- Receiver',
           data: web_recv,
           stack: 1,
           color: colors[3]
         }, {
           name: 'Non Website- Sender',
           data: nonweb_send,
           stack: 1,
           color: '#108372'
         }, {
           name: 'Non Website - Receiver',
           data: nonweb_recv,
           stack: 1,
           color: '#F15628'
         }]

       });


     }

     function barcodeSourceChart(date_from, date_to) {
       var colors = Highcharts.getOptions().colors;
       var manual_source_tickets = [];
       var portal_source_tickets = [];
       var shopify_source_tickets = [];
       var bulk_source_tickets = [];
       var date_set = [];
       var nonweb_send_obj = {};
       var nonweb_recv_obj = {};

       var mpex_manual_source = [];
       var mpex_portal_source = [];
       var mpex_shopify_source = [];
       var mpex_bulk_source = [];
       var mpex_date_set = [];
       var mpex_date_set = [];

       // Barcode Source Tickets
       var ticketBarcodeSourceSearch = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_created_report_wee_2'
       });

       var old_date = null;
       var temp_manual_count = 0;
       var count = 0;

       var title = '<b>Tickets based on Barcode Source (' +
         getLastWeekFirstDay() +
         ' - ' +
         getLastWeekLastDay() + ')</b></br>';
       var params = {
         date_from: getFirstDay(),
         date_to: getLastDay()
       };
       params = JSON.stringify(params);
       var output = url.resolveScript({
         deploymentId: 'customdeploy_sl_issues_reporting',
         scriptId: 'customscript_sl_issues_reporting',
       });

       var upload_url = baseURL + output + '&custparam_params=' +
         params;
       // $("#button_issues_page").append("<a href='" + upload_url +
       //   "' target='_blank'><input type='button' value='REPORTING BY ISSUES' class='form-control btn btn-primary'></a>"
       // );
       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         title = '<b>Barcode Source Breakdown (' + date_from + ' - ' +
           date_to + ')</b>';
         var params = {
           date_from: date_from,
           date_to: date_to
         };
         params = JSON.stringify(params);

         var upload_url = baseURL + output + '&custparam_params=' +
           params;
         // $("#button_issues_page").append("<a href='" + upload_url +
         //   "' target='_blank'><input type='button' value='REPORTING BY ISSUES' class='form-control btn btn-primary'></a>"
         // );
         ticketBarcodeSourceSearch.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         ticketBarcodeSourceSearch.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       } else {
         ticketBarcodeSourceSearch.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: getLastWeekFirstDay()
         }));

         ticketBarcodeSourceSearch.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: getLastWeekLastDay()
         }));

       }

       ticketBarcodeSourceSearch.run().each(function(ticketBarcodeSource) {
         var ticketsCount = ticketBarcodeSource.getValue({
           name: 'name',
           summary: 'COUNT'
         });
         var dateCreated = ticketBarcodeSource.getValue({
           name: "created",
           summary: "GROUP",
         });
         var barcodeSource = ticketBarcodeSource.getValue({
           name: "custrecord_barcode_source",
           join: "CUSTRECORD_BARCODE_NUMBER",
           summary: "GROUP",
         });

         if (count == 0 && isNullorEmpty(old_date)) {
           if (!(date_set.includes(dateCreated))) {
             date_set.push(dateCreated);
           }
         } else if (!isNullorEmpty(old_date) && old_date != dateCreated) {
           manual_source_tickets.push([date_set.indexOf(old_date),
             parseInt(temp_manual_count)
           ]);
           temp_manual_count = 0;

           if (!(date_set.includes(dateCreated))) {
             date_set.push(dateCreated);
           }
         }


         if (isNullorEmpty(barcodeSource) || barcodeSource == 1) {
           temp_manual_count = temp_manual_count + parseInt(ticketsCount);
         } else
         if (barcodeSource == 2) {
           portal_source_tickets.push([date_set.indexOf(dateCreated),
             parseInt(ticketsCount)
           ]);
         } else if (barcodeSource == 3) {
           shopify_source_tickets.push([date_set.indexOf(dateCreated),
             parseInt(ticketsCount)
           ]);
         } else if (barcodeSource == 4) {
           bulk_source_tickets.push([date_set.indexOf(dateCreated),
             parseInt(ticketsCount)
           ]);
         }

         old_date = dateCreated;
         count++;
         return true;

       });


       if (count > 0) {
         manual_source_tickets.push([date_set.indexOf(old_date),
           parseInt(temp_manual_count)
         ]);
       }

       console.log('manual_source_tickets')
       console.log(manual_source_tickets)
       console.log('portal_source_tickets')
       console.log(portal_source_tickets)
       console.log('shopify_source_tickets')
       console.log(shopify_source_tickets)
       console.log('bulk_source_tickets')
       console.log(bulk_source_tickets)

       // MPEX - Usage Report - Source/Week
       var ticketMPEXBarcodeSourceSearch = search.load({
         type: 'customrecord_customer_product_stock',
         id: 'customsearch_prod_stock_usage_report_6_9'
       });

       var mpex_old_date = null;
       var mpex_temp_manual_count = 0;
       var mpex_count = 0;

       var params = {
         date_from: getFirstDay(),
         date_to: getLastDay()
       };
       params = JSON.stringify(params);
       var output = url.resolveScript({
         deploymentId: 'customdeploy_sl_issues_reporting',
         scriptId: 'customscript_sl_issues_reporting',
       });

       var upload_url = baseURL + output + '&custparam_params=' +
         params;

       console.log('date_from')
       console.log(date_from)
       console.log('date_to')
       console.log(date_to)

       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {

         var params = {
           date_from: date_from,
           date_to: date_to
         };
         params = JSON.stringify(params);

         var upload_url = baseURL + output + '&custparam_params=' +
           params;

         ticketMPEXBarcodeSourceSearch.filters.push(search.createFilter({
           name: 'custrecord_cust_date_stock_used',
           join: null,
           operator: search.Operator.ONORAFTER,
           values: date_from
         }));

         ticketMPEXBarcodeSourceSearch.filters.push(search.createFilter({
           name: 'custrecord_cust_date_stock_used',
           join: null,
           operator: search.Operator.ONORBEFORE,
           values: date_to
         }));
       } else {
         ticketMPEXBarcodeSourceSearch.filters.push(search.createFilter({
           name: 'custrecord_cust_date_stock_used',
           join: null,
           operator: search.Operator.ONORAFTER,
           values: getLastWeekFirstDay()
         }));

         ticketMPEXBarcodeSourceSearch.filters.push(search.createFilter({
           name: 'custrecord_cust_date_stock_used',
           join: null,
           operator: search.Operator.ONORBEFORE,
           values: getLastWeekLastDay()
         }));
       }

       ticketMPEXBarcodeSourceSearch.run().each(function(
         ticketMPEXBarcodeSource) {
         var dateUsed = ticketMPEXBarcodeSource.getValue({
           name: 'custrecord_cust_date_stock_used',
           summary: 'GROUP'
         });

         var sourceId = parseInt(ticketMPEXBarcodeSource.getValue({
           name: 'custrecord_barcode_source',
           summary: 'GROUP'
         }));

         var sourceText = ticketMPEXBarcodeSource.getText({
           name: 'custrecord_barcode_source',
           summary: 'GROUP'
         });


         var mpexUsage = parseInt(ticketMPEXBarcodeSource.getValue({
           name: 'name',
           summary: 'COUNT'
         }));


         if (mpex_count == 0 && isNullorEmpty(mpex_old_date)) {
           if (!(date_set.includes(dateUsed))) {
             date_set.push(dateUsed);
           }
         } else if (!isNullorEmpty(mpex_old_date) && mpex_old_date !=
           dateUsed) {
           mpex_manual_source.push([date_set.indexOf(mpex_old_date),
             parseInt(mpex_temp_manual_count)
           ]);
           mpex_temp_manual_count = 0;

           if (!(date_set.includes(dateUsed))) {
             date_set.push(dateUsed);
           }
         }


         if (isNullorEmpty(sourceId) || sourceId == 1) {
           mpex_temp_manual_count = mpex_temp_manual_count + parseInt(
             mpexUsage);
         } else
         if (sourceId == 2) {
           mpex_portal_source.push([date_set.indexOf(dateUsed),
             parseInt(mpexUsage)
           ]);
         } else if (sourceId == 3) {
           mpex_shopify_source.push([date_set.indexOf(dateUsed),
             parseInt(mpexUsage)
           ]);
         } else if (sourceId == 4) {
           mpex_bulk_source.push([date_set.indexOf(dateUsed),
             parseInt(mpexUsage)
           ]);
         }

         mpex_old_date = dateUsed;
         mpex_count++;
         return true;

       });


       if (mpex_count > 0) {
         mpex_manual_source.push([date_set.indexOf(mpex_old_date),
           parseInt(mpex_temp_manual_count)
         ]);
       }

       console.log('Date Set')
       console.log(date_set)
       console.log(date_set.length)
       console.log('MPEX Manual Source')
       console.log(mpex_manual_source)
       console.log('Manual Source Tickets')
       console.log(manual_source_tickets)

       var mpex_manual_perc = [];
       var mpex_portal_perc = [];
       var mpex_shopify_perc = [];
       var mpex_bulk_perc = [];

       // var total_tickets = 0;
       // var total_scans = 0;
       var total_tickets_vs_scans = [];
       var total_scans_array = [];
       var total_tickets_array = [];

       for (var z = 0; z < date_set.length; z++) {

         var total_tickets = 0;
         var total_scans = 0;

         console.log('date_set: ' + date_set[z]);

         mpex_manual_perc.push([z, parseFloat(((parseFloat(
             manual_source_tickets[z][1]) /
           parseInt(mpex_manual_source[z][1])) * 100).toFixed(2))]);
         mpex_portal_perc.push([z, parseFloat(((parseFloat(
             portal_source_tickets[z][1]) /
           parseInt(mpex_portal_source[z][1])) * 100).toFixed(2))]);
         mpex_shopify_perc.push([z, parseFloat(((parseFloat(
             shopify_source_tickets[z][1]) /
           parseInt(mpex_shopify_source[z][1])) * 100).toFixed(2))]);
         mpex_bulk_perc.push([z, parseFloat(((parseFloat(bulk_source_tickets[
             z][1]) /
           parseInt(mpex_bulk_source[z][1])) * 100).toFixed(2))]);

         total_tickets = total_tickets + (parseFloat(manual_source_tickets[z]
           [1]) + parseFloat(portal_source_tickets[z][1]) + parseFloat(
           shopify_source_tickets[z][1]) + parseFloat(bulk_source_tickets[
           z][1]));

         total_tickets_array.push([z, total_tickets]);

         console.log('total_tickets: ' + total_tickets)

         total_scans = total_scans + (parseInt(mpex_manual_source[z][1]) +
           parseInt(mpex_portal_source[z][1]) + parseInt(
             mpex_shopify_source[z][1]) + parseInt(mpex_bulk_source[z][1]));
         total_scans_array.push([z, total_scans])

         console.log('total_scans: ' + total_scans);

         total_tickets_vs_scans.push([z, parseFloat(((total_tickets /
           total_scans) * 100).toFixed(2))]);

       }
       //
       console.log('mpex_manual_perc')
       console.log(mpex_manual_perc)
       console.log('mpex_portal_perc')
       console.log(mpex_portal_perc)
       console.log('mpex_shopify_perc')
       console.log(mpex_shopify_perc)
       console.log('mpex_bulk_perc')
       console.log(mpex_bulk_perc)
       console.log('total_tickets_vs_scans')
       console.log(total_tickets_vs_scans)

       Highcharts.chart('container6', {
         chart: {
           height: (8 / 16 * 100) + '%',
           zoomType: 'xy'
         },
         title: {
           text: title
         },
         xAxis: {
           categories: date_set
         },
         yAxis: [{ // Primary yAxis
           title: {
             text: 'Total Tickets - By Source',
           },
           opposite: true
         }, { // Secondary yAxis
           gridLineWidth: 0,
           title: {
             text: 'Total Scans - By Source',
           },
           labels: {}
         }, { // Tertiary yAxis
           gridLineWidth: 0,
           title: {
             text: 'Total Tickets vs Scans - By Source',
           },
           labels: {}
         }],
         // legend: {
         //   layout: 'vertical',
         //   align: 'center',
         //   x: -100,
         //   verticalAlign: 'bottom',
         //   y: 25,
         //   floating: true,
         //   backgroundColor: Highcharts.defaultOptions.legend.backgroundColor ||
         //     'white',
         //   borderColor: '#CCC',
         //   borderWidth: 1,
         //   shadow: false
         // },
         legend: {
           enabled: false
         },
         tooltip: {
           shared: true
         },
         plotOptions: {
           column: {
             stacking: 'normal',
             dataLabels: {
               enabled: true
             }
           }
         },
         series: [{
           name: 'Manual Barcode Tickets',
           type: 'column',
           data: manual_source_tickets,
           stack: 1,
           color: '#F2C80F'
         }, {
           name: 'Customer Portal Barcode Tickets',
           type: 'column',
           data: portal_source_tickets,
           stack: 1,
           color: colors[3]
         }, {
           name: 'Shopify Barcode Tickets',
           type: 'column',
           data: shopify_source_tickets,
           stack: 1,
           color: '#108372'
         }, {
           name: 'Bulk Barcode Tickets',
           type: 'column',
           data: bulk_source_tickets,
           stack: 1,
           color: '#F15628'
         }, {
           name: 'Manual Barcodes Scanned',
           type: 'column',
           yAxis: 1,
           data: mpex_manual_source,
           stack: 2,
           color: '#F2C80F'
         }, {
           name: 'Portal Barcodes Scanned',
           type: 'column',
           yAxis: 1,
           data: mpex_portal_source,
           stack: 2,
           color: colors[3]
         }, {
           name: 'Shopify Barcodes Scanned',
           type: 'column',
           yAxis: 1,
           data: mpex_shopify_source,
           stack: 2,
           color: '#108372'
         }, {
           name: ' Bulk Barcodes Scanned',
           type: 'column',
           yAxis: 1,
           data: mpex_bulk_source,
           stack: 2,
           color: '#F15628'
         }, {
           name: 'Manual - Tickets vs Scanned %',
           type: 'column',
           data: mpex_manual_perc,
           stack: 3,
           yAxis: 2,
           color: '#F2C80F'
         }, {
           name: 'Portal - Tickets vs Scanned %',
           type: 'column',
           data: mpex_portal_perc,
           stack: 3,
           yAxis: 2,
           color: colors[3]
         }, {
           name: 'Shopify - Tickets vs Scanned %',
           type: 'column',
           data: mpex_shopify_perc,
           stack: 3,
           yAxis: 2,
           color: '#108372'
         }, {
           name: ' Bulk - Tickets vs Scanned %',
           type: 'column',
           data: mpex_bulk_perc,
           stack: 3,
           yAxis: 2,
           color: '#F15628'
         }]

       });

       Highcharts.chart('container7', {
         chart: {
           height: (6 / 16 * 100) + '%',
           zoomType: 'xy'
         },
         title: {
           text: title
         },
         xAxis: {
           categories: date_set
         },
         yAxis: {
           min: 0,
           title: {
             text: 'Ticket Barcodes vs Scanned Barcodes Source'
           },
           stackLabels: {
             enabled: true,
             style: {
               fontWeight: 'bold',
               color: ( // theme
                 Highcharts.defaultOptions.title.style &&
                 Highcharts.defaultOptions.title.style.color
               ) || 'gray'
             }
           }
         },
         legend: {
           align: 'right',
           x: -30,
           verticalAlign: 'top',
           y: 25,
           floating: true,
           backgroundColor: Highcharts.defaultOptions.legend.backgroundColor ||
             'white',
           borderColor: '#CCC',
           borderWidth: 1,
           shadow: false
         },
         tooltip: {
           shared: true
         },
         plotOptions: {
           column: {
             stacking: 'normal',
             dataLabels: {
               enabled: true
             }
           }
         },
         series: [{
           name: 'Manual - Tickets vs Scanned %',
           type: 'column',
           data: mpex_manual_perc,
           stack: 2,
           color: '#F2C80F'
         }, {
           name: 'Portal - Tickets vs Scanned %',
           type: 'column',
           data: mpex_portal_perc,
           stack: 2,
           color: colors[3]
         }, {
           name: 'Shopify - Tickets vs Scanned %',
           type: 'column',
           data: mpex_shopify_perc,
           stack: 2,
           color: '#108372'
         }, {
           name: ' Bulk - Tickets vs Scanned %',
           type: 'column',
           data: mpex_bulk_perc,
           stack: 2,
           color: '#F15628'
         }]

       });

       Highcharts.chart('container8', {
         chart: {
           height: (6 / 16 * 100) + '%',
           zoomType: 'xy'
         },
         title: {
           text: ''
         },
         xAxis: {
           categories: date_set
         },
         yAxis: [{ // Primary yAxis
           labels: {
             format: '{value}%',
           },
           title: {
             text: 'Total Tickets vs Total Scans',
           },
           opposite: true

         }, { // Secondary yAxis
           gridLineWidth: 0,
           title: {
             text: 'Total Tickets',
           },
           labels: {}
         }, { // Tertiary yAxis
           gridLineWidth: 0,
           title: {
             text: 'Total Scans',
           },
           labels: {},
           opposite: true
         }],
         tooltip: {
           shared: true
         },
         legend: {
           align: 'right',
           x: -30,
           verticalAlign: 'top',
           y: 25,
           floating: true,
           backgroundColor: Highcharts.defaultOptions.legend.backgroundColor ||
             'white',
           borderColor: '#CCC',
           borderWidth: 1,
           shadow: false
         },
         tooltip: {
           shared: true
         },
         plotOptions: {
           column: {
             stacking: 'normal',
             dataLabels: {
               enabled: true
             }
           }
         },
         series: [{
           name: 'Total Tickets vs Scanned',
           type: 'spline',
           tooltip: {
             valueSuffix: ' %'
           },
           data: total_tickets_vs_scans,
           color: '#F2C80F'
         }, {
           name: 'Total Tickets',
           type: 'column',
           yAxis: 1,
           data: total_tickets_array,
           stack: 1,
           color: '#F15628'
         }, {
           name: 'Total Scanned',
           type: 'column',
           yAxis: 2,
           data: total_scans_array,
           stack: 2,
           color: '#108372'
         }]

       });


     }


     // function mpexbarcodeSourceChart(date_from, date_to) {
     //   var colors = Highcharts.getOptions().colors;
     //   var mpex_manual_source = [];
     //   var mpex_portal_source = [];
     //   var mpex_shopify_source = [];
     //   var mpex_bulk_source = [];
     //   var mpex_date_set = [];
     //   var nonweb_send_obj = {};
     //   var nonweb_recv_obj = {};
     //
     //   // Barcode Source Tickets
     //   var ticketMPEXBarcodeSourceSearch = search.load({
     //     type: 'customrecord_customer_product_stock',
     //     id: 'customsearch_prod_stock_usage_report_6_9'
     //   });
     //
     //   var mpex_old_date = null;
     //   var mpex_temp_manual_count = 0;
     //   var mpex_count = 0;
     //
     //   var title = '<b>Sender vs Receiver Breakdown (' + getFirstDay() +
     //     ' - ' +
     //     getLastDay() + ')</b></br>';
     //   var params = {
     //     date_from: getFirstDay(),
     //     date_to: getLastDay()
     //   };
     //   params = JSON.stringify(params);
     //   var output = url.resolveScript({
     //     deploymentId: 'customdeploy_sl_issues_reporting',
     //     scriptId: 'customscript_sl_issues_reporting',
     //   });
     //
     //   var upload_url = baseURL + output + '&custparam_params=' +
     //     params;
     //
     //   if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
     //     title = '<b>Barcode Source Breakdown (' + date_from + ' - ' +
     //       date_to + ')</b>';
     //     var params = {
     //       date_from: date_from,
     //       date_to: date_to
     //     };
     //     params = JSON.stringify(params);
     //
     //     var upload_url = baseURL + output + '&custparam_params=' +
     //       params;
     //
     //     ticketMPEXBarcodeSourceSearch.filters.push(search.createFilter({
     //       name: 'custrecord_cust_date_stock_used',
     //       join: null,
     //       operator: search.Operator.ONORAFTER,
     //       values: date_from
     //     }));
     //
     //     ticketMPEXBarcodeSourceSearch.filters.push(search.createFilter({
     //       name: 'custrecord_cust_date_stock_used',
     //       join: null,
     //       operator: search.Operator.ONORBEFORE,
     //       values: date_to
     //     }));
     //   }
     //
     //   ticketMPEXBarcodeSourceSearch.run().each(function(
     //     ticketMPEXBarcodeSource) {
     //     var dateUsed = ticketMPEXBarcodeSource.getValue({
     //       name: 'custrecord_cust_date_stock_used',
     //       summary: 'GROUP'
     //     });
     //
     //     var sourceId = parseInt(ticketMPEXBarcodeSource.getValue({
     //       name: 'custrecord_barcode_source',
     //       summary: 'GROUP'
     //     }));
     //
     //     var sourceText = ticketMPEXBarcodeSource.getText({
     //       name: 'custrecord_barcode_source',
     //       summary: 'GROUP'
     //     });
     //
     //
     //     var mpexUsage = parseInt(ticketMPEXBarcodeSource.getValue({
     //       name: 'name',
     //       summary: 'COUNT'
     //     }));
     //
     //
     //     if (mpex_count == 0 && isNullorEmpty(mpex_old_date)) {
     //       if (!(mpex_date_set.includes(dateUsed))) {
     //         mpex_date_set.push(dateUsed);
     //       }
     //     } else if (!isNullorEmpty(mpex_old_date) && old_date != dateUsed) {
     //       manual_source.push([mpex_date_set.indexOf(mpex_old_date),
     //         parseInt(mpex_temp_manual_count)
     //       ]);
     //       mpex_temp_manual_count = 0;
     //
     //       if (!(mpex_date_set.includes(dateUsed))) {
     //         mpex_date_set.push(dateUsed);
     //       }
     //     }
     //
     //
     //     if (isNullorEmpty(sourceId) || sourceId == 1) {
     //       mpex_temp_manual_count = mpex_temp_manual_count + parseInt(mpexUsage);
     //     } else
     //     if (sourceId == 2) {
     //       mpex_portal_source.push([date_set.indexOf(dateUsed),
     //         parseInt(mpexUsage)
     //       ]);
     //     } else if (sourceId == 3) {
     //       mpex_shopify_source.push([date_set.indexOf(dateUsed),
     //         parseInt(mpexUsage)
     //       ]);
     //     } else if (sourceId == 4) {
     //       mpex_bulk_source.push([date_set.indexOf(dateUsed),
     //         parseInt(mpexUsage)
     //       ]);
     //     }
     //
     //     mpex_old_date = dateUsed;
     //     mpex_count++;
     //     return true;
     //
     //   });
     //
     //
     //   if (mpex_count > 0) {
     //     manual_source.push([date_set.indexOf(mpex_old_date),
     //       parseInt(mpex_temp_manual_count)
     //     ]);
     //   }
     //
     //   Highcharts.chart('container7', {
     //     chart: {
     //       type: 'column',
     //       height: (6 / 16 * 100) + '%',
     //       zoomType: 'xy'
     //     },
     //     title: {
     //       text: title
     //     },
     //     xAxis: {
     //       categories: mpex_date_set
     //     },
     //     yAxis: {
     //       min: 0,
     //       title: {
     //         text: 'Number of Tickets'
     //       },
     //       stackLabels: {
     //         enabled: true,
     //         style: {
     //           fontWeight: 'bold',
     //           color: ( // theme
     //             Highcharts.defaultOptions.title.style &&
     //             Highcharts.defaultOptions.title.style.color
     //           ) || 'gray'
     //         }
     //       }
     //     },
     //     legend: {
     //       align: 'right',
     //       x: -30,
     //       verticalAlign: 'top',
     //       y: 25,
     //       floating: true,
     //       backgroundColor: Highcharts.defaultOptions.legend.backgroundColor ||
     //         'white',
     //       borderColor: '#CCC',
     //       borderWidth: 1,
     //       shadow: false
     //     },
     //     tooltip: {
     //       shared: true
     //     },
     //     plotOptions: {
     //       column: {
     //         stacking: 'normal',
     //         dataLabels: {
     //           enabled: true
     //         }
     //       }
     //     },
     //     series: [{
     //       name: 'Manual',
     //       data: mpex_manual_source,
     //       stack: 1,
     //       color: '#F2C80F'
     //     }, {
     //       name: 'Customer Portal',
     //       data: mpex_portal_source,
     //       stack: 1,
     //       color: colors[3]
     //     }, {
     //       name: 'Shopify',
     //       data: mpex_shopify_source,
     //       stack: 1,
     //       color: '#108372'
     //     }, {
     //       name: 'Bulk',
     //       data: mpex_bulk_source,
     //       stack: 1,
     //       color: '#F15628'
     //     }]
     //
     //   });
     //
     //
     // }

     function manualChart(date_from, date_to) {

       var date_set_created = [];
       var manual_issues = []

       // MPEX - Tickets Barcode Manual Source - Last year to date (per week)
       var manualBarcodeIssues = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_created_report_wee_3'
       });

       var title = '<b>Manual Barcodes Issues (' + getFirstDay() + ' - ' +
         getLastDay() +
         ')</b>';

       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         title = '<b>Manual Barcodes Issues (' + date_from + ' - ' + date_to +
           ')</b>';
         manualBarcodeIssues.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         manualBarcodeIssues.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       }

       manualBarcodeIssues.run().each(function(ticket) {
         var ticketsCount = ticket.getValue({
           name: 'name',
           summary: 'COUNT'
         });
         var dateCreated = ticket.getValue({
           name: "created",
           summary: "GROUP",
         });
         var issuesCat = ticket.getValue({
           name: "formulatext",
           summary: "GROUP",
           formula: "CONCAT({custrecord_toll_issues},CONCAT('_',{custrecord_resolved_toll_issues}))",
         });

         if (!(date_set_created.includes(dateCreated))) {
           date_set_created.push(dateCreated);
         }
         manual_issues.push({
           "name": issuesCat,
           "y": parseInt(ticketsCount)
         });

         return true;

       });

       console.log(manual_issues)

       var series_data = [];
       series_data.push(manual_issues);

       console.log(series_data)

       Highcharts.chart('containerM', {
         chart: {
           height: (6 / 16 * 100) + '%',
           plotBackgroundColor: null,
           plotBorderWidth: null,
           plotShadow: false,
           type: 'pie'
         },
         title: {
           text: title
         },
         tooltip: {
           pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
         },
         accessibility: {
           point: {
             valueSuffix: '%'
           }
         },
         plotOptions: {
           pie: {
             allowPointSelect: true,
             cursor: 'pointer',
             dataLabels: {
               enabled: true,
               format: '<b>{point.name}</b>: {point.percentage:.1f} %'
             }
           }
         },
         series: [{
           name: 'Issues',
           colorByPoint: true,
           data: manual_issues,
         }],

       });

     }

     function shopifyChart(date_from, date_to) {

       var date_set_created = [];
       var manual_issues = []

       // MPEX - Tickets Barcode Manual Source - Last year to date (per week)
       var manualBarcodeIssues = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_created_report_wee_4'
       });

       var title = '<b>Shopify Barcodes Issues (' + getFirstDay() + ' - ' +
         getLastDay() +
         ')</b>';

       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         title = '<b>Shopify Barcodes Issues (' + date_from + ' - ' + date_to +
           ')</b>';
         manualBarcodeIssues.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         manualBarcodeIssues.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       }

       manualBarcodeIssues.run().each(function(ticket) {
         var ticketsCount = ticket.getValue({
           name: 'name',
           summary: 'COUNT'
         });
         var dateCreated = ticket.getValue({
           name: "created",
           summary: "GROUP",
         });
         var issuesCat = ticket.getValue({
           name: "formulatext",
           summary: "GROUP",
           formula: "CONCAT({custrecord_toll_issues},CONCAT('_',{custrecord_resolved_toll_issues}))",
         });

         if (!(date_set_created.includes(dateCreated))) {
           date_set_created.push(dateCreated);
         }
         manual_issues.push({
           "name": issuesCat,
           "y": parseInt(ticketsCount)
         });

         return true;

       });

       console.log(manual_issues)

       var series_data = [];
       series_data.push(manual_issues);

       console.log(series_data)

       Highcharts.chart('containerS', {
         chart: {
           height: (6 / 16 * 100) + '%',
           plotBackgroundColor: null,
           plotBorderWidth: null,
           plotShadow: false,
           type: 'pie'
         },
         title: {
           text: title
         },
         tooltip: {
           pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
         },
         accessibility: {
           point: {
             valueSuffix: '%'
           }
         },
         plotOptions: {
           pie: {
             allowPointSelect: true,
             cursor: 'pointer',
             dataLabels: {
               enabled: true,
               format: '<b>{point.name}</b>: {point.percentage:.1f} %'
             }
           }
         },
         series: [{
           name: 'Issues',
           colorByPoint: true,
           data: manual_issues,
         }],

       });

     }

     function portalChart(date_from, date_to) {

       var date_set_created = [];
       var manual_issues = []

       // MPEX - Tickets Barcode Manual Source - Last year to date (per week)
       var manualBarcodeIssues = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_created_report_wee_5'
       });

       var title = '<b>Customer Portal Barcodes Issues (' + getFirstDay() +
         ' - ' +
         getLastDay() +
         ')</b>';

       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         title = '<b>Customer Portal Barcodes Issues (' + date_from + ' - ' +
           date_to +
           ')</b>';
         manualBarcodeIssues.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         manualBarcodeIssues.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       }

       manualBarcodeIssues.run().each(function(ticket) {
         var ticketsCount = ticket.getValue({
           name: 'name',
           summary: 'COUNT'
         });
         var dateCreated = ticket.getValue({
           name: "created",
           summary: "GROUP",
         });
         var issuesCat = ticket.getValue({
           name: "formulatext",
           summary: "GROUP",
           formula: "CONCAT({custrecord_toll_issues},CONCAT('_',{custrecord_resolved_toll_issues}))",
         });

         if (!(date_set_created.includes(dateCreated))) {
           date_set_created.push(dateCreated);
         }
         manual_issues.push({
           "name": issuesCat,
           "y": parseInt(ticketsCount)
         });

         return true;

       });

       console.log(manual_issues)

       var series_data = [];
       series_data.push(manual_issues);

       console.log(series_data)

       Highcharts.chart('containerP', {
         chart: {
           height: (6 / 16 * 100) + '%',
           plotBackgroundColor: null,
           plotBorderWidth: null,
           plotShadow: false,
           type: 'pie'
         },
         title: {
           text: title
         },
         tooltip: {
           pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
         },
         accessibility: {
           point: {
             valueSuffix: '%'
           }
         },
         plotOptions: {
           pie: {
             allowPointSelect: true,
             cursor: 'pointer',
             dataLabels: {
               enabled: true,
               format: '<b>{point.name}</b>: {point.percentage:.1f} %'
             }
           }
         },
         series: [{
           name: 'Issues',
           colorByPoint: true,
           data: manual_issues,
         }],

       });

     }

     function bulkChart(date_from, date_to) {

       var date_set_created = [];
       var manual_issues = []

       // MPEX - Tickets Barcode Manual Source - Last year to date (per week)
       var manualBarcodeIssues = search.load({
         type: 'customrecord_mp_ticket',
         id: 'customsearch_ticket_created_report_wee_6'
       });

       var title = '<b>Bulk Barcodes Issues (' + getFirstDay() + ' - ' +
         getLastDay() +
         ')</b>';

       if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
         title = '<b>Bulk Barcodes Issues (' + date_from + ' - ' + date_to +
           ')</b>';
         manualBarcodeIssues.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORAFTER,
           values: date_from,
         }));

         manualBarcodeIssues.filters.push(search.createFilter({
           name: "created",
           operator: search.Operator.ONORBEFORE,
           values: date_to,
         }));
       }

       manualBarcodeIssues.run().each(function(ticket) {
         var ticketsCount = ticket.getValue({
           name: 'name',
           summary: 'COUNT'
         });
         var dateCreated = ticket.getValue({
           name: "created",
           summary: "GROUP",
         });
         var issuesCat = ticket.getValue({
           name: "formulatext",
           summary: "GROUP",
           formula: "CONCAT({custrecord_toll_issues},CONCAT('_',{custrecord_resolved_toll_issues}))",
         });

         if (!(date_set_created.includes(dateCreated))) {
           date_set_created.push(dateCreated);
         }
         manual_issues.push({
           "name": issuesCat,
           "y": parseInt(ticketsCount)
         });

         return true;

       });

       console.log(manual_issues)

       var series_data = [];
       series_data.push(manual_issues);

       console.log(series_data)

       Highcharts.chart('containerB', {
         chart: {
           height: (6 / 16 * 100) + '%',
           plotBackgroundColor: null,
           plotBorderWidth: null,
           plotShadow: false,
           type: 'pie'
         },
         title: {
           text: title
         },
         tooltip: {
           pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
         },
         accessibility: {
           point: {
             valueSuffix: '%'
           }
         },
         plotOptions: {
           pie: {
             allowPointSelect: true,
             cursor: 'pointer',
             dataLabels: {
               enabled: true,
               format: '<b>{point.name}</b>: {point.percentage:.1f} %'
             }
           }
         },
         series: [{
           name: 'Issues',
           colorByPoint: true,
           data: manual_issues,
         }],

       });

     }

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

     function convertDate(date) {
       var dd = String(date.getDate()).padStart(2, '0');
       var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
       var yyyy = date.getFullYear();

       date = dd + '/' + mm + '/' + yyyy;
       return date;
     }

     function getFirstDay() {
       var curr = new Date; // get current date
       var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week

       var firstday = new Date(curr.setDate(first));
       return convertDate(firstday);
     }

     function getLastDay() {
       var curr = new Date; // get current date
       var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
       var last = first + 6; // last day is the first day + 6

       var lastday = new Date(curr.setDate(last));
       return convertDate(lastday);

     }


     function getLastWeeksDate() {
       const now = new Date();
       return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
     }

     function getLastWeekFirstDay() {
       var curr = getLastWeeksDate(); // get current date
       var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week

       var firstday = new Date(curr.setDate(first));
       console.log('last Weeks First Date');
       console.log(firstday);
       return convertDate(firstday);
     }

     function getLastWeekLastDay() {
       var curr = getLastWeeksDate(); // get current date
       var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
       var last = first + 6; // last day is the first day + 6

       var lastday = new Date(curr.setDate(last));
       console.log('last Weeks last Date');
       console.log(lastday);
       return convertDate(lastday);

     }



     function getWeekStart(date) {
       //return convertDate(new Date(date.setDate(date.getDate() - date.getDay())));
       console.log('date', date);

       date = new Date(dateCreated2DateSelectedFormat(date));
       var first = date.getDate() - date.getDay(); // First day is the day of the month - the day of the week

       var firstday = new Date(date.setDate(first));
       console.log('first', first);
       console.log('date1', date);
       console.log('firstday', firstday);
       console.log('convertDate(firstday)', convertDate(firstday));

       return convertDate(firstday);
     }

     function getWeekEnd(date) {
       var curr = new Date(dateCreated2DateSelectedFormat(date)); // get current date
       var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
       var last = first + 6; // last day is the first day + 6

       var lastday = new Date(curr.setDate(last));
       return convertDate(lastday);


     }

     function getMonthStart(date) {
       date = new Date(dateCreated2DateSelectedFormat(date)); // get current date

       return convertDate(new Date(date.getFullYear(), date.getMonth(), 1));
     }

     function getMonthEnd(date) {
       date = new Date(dateCreated2DateSelectedFormat(date)); // get current date
       return convertDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));

     }

     function getYearStart(date) {
       date = new Date(dateCreated2DateSelectedFormat(date)); // get current date
       return convertDate(new Date(date.getFullYear(), 0, 1));
     }

     function getYearEnd(date) {
       date = new Date(dateCreated2DateSelectedFormat(date)); // get current date
       return convertDate(new Date(date.getFullYear(), 11, 31));

     }

     function firstCompare(date, first) {
       var dateSplit = date.split('/');
       var firstSplit = first.split('/');
       var firstDate = new Date(dateSplit[2], dateSplit[1], dateSplit[0]);
       var secondDate = new Date(firstSplit[2], firstSplit[1], firstSplit[0]);
       return (firstDate >= secondDate);
     }

     function secondCompare(date, last) {
       var dateSplit = date.split('/');
       var lastSplit = last.split('/');
       var firstDate = new Date(dateSplit[2], dateSplit[1], dateSplit[0]);
       var secondDate = new Date(lastSplit[2], lastSplit[1], lastSplit[0]);
       return (firstDate <= secondDate);
     }

     function selectDate() {
       var period_selected = $('#period_dropdown option:selected').val();
       var today = new Date();
       var today_day_in_month = today.getDate();
       var today_day_in_week = today.getDay();
       var today_month = today.getMonth();
       var today_year = today.getFullYear();

       var today_date = new Date(Date.UTC(today_year, today_month,
         today_day_in_month))

       switch (period_selected) {
         case "this_week":
           // This method changes the variable "today" and sets it on the previous monday
           if (today_day_in_week == 0) {
             var monday = new Date(Date.UTC(today_year, today_month,
               today_day_in_month - 7));
           } else {
             var monday = new Date(Date.UTC(today_year, today_month,
               today_day_in_month - today_day_in_week));
           }
           today_date = new Date(Date.UTC(today_year, today_month,
             today_day_in_month + 1));
           var date_from = monday.toISOString().split('T')[0];
           var date_to = today_date.toISOString().split('T')[0];
           break;

         case "last_week":
           var today_day_in_month = today.getDate();
           var today_day_in_week = today.getDay();
           // This method changes the variable "today" and sets it on the previous monday
           if (today_day_in_week == 0) {
             var previous_sunday = new Date(Date.UTC(today_year, today_month,
               today_day_in_month - 7));
           } else {
             var previous_sunday = new Date(Date.UTC(today_year, today_month,
               today_day_in_month - today_day_in_week));
           }

           var previous_sunday_year = previous_sunday.getFullYear();
           var previous_sunday_month = previous_sunday.getMonth();
           var previous_sunday_day_in_month = previous_sunday.getDate();

           var monday_before_sunday = new Date(Date.UTC(previous_sunday_year,
             previous_sunday_month, previous_sunday_day_in_month - 7));

           var date_from = monday_before_sunday.toISOString().split('T')[0];
           var date_to = previous_sunday.toISOString().split('T')[0];
           break;

         case "this_month":
           var first_day_month = new Date(Date.UTC(today_year, today_month));
           var date_from = first_day_month.toISOString().split('T')[0];
           var date_to = today_date.toISOString().split('T')[0];
           break;

         case "last_month":
           var first_day_previous_month = new Date(Date.UTC(today_year,
             today_month - 1));
           var last_day_previous_month = new Date(Date.UTC(today_year,
             today_month, 0));
           var date_from = first_day_previous_month.toISOString().split('T')[
             0];
           var date_to = last_day_previous_month.toISOString().split('T')[0];
           break;

         case "full_year":
           var first_day_in_year = new Date(Date.UTC(today_year, 0));
           var date_from = first_day_in_year.toISOString().split('T')[0];
           var date_to = today_date.toISOString().split('T')[0];
           break;

         case "financial_year":
           if (today_month >= 6) {
             var first_july = new Date(Date.UTC(today_year, 6));
           } else {
             var first_july = new Date(Date.UTC(today_year - 1, 6));
           }
           var date_from = first_july.toISOString().split('T')[0];
           var date_to = today_date.toISOString().split('T')[0];
           break;

         default:
           var date_from = '';
           var date_to = '';
           break;
       }
       $('#date_from').val(date_from);
       $('#date_to').val(date_to);
     }

     function convertArrObj(dateSet, origData) {
       var arr = [];

       dateSet.forEach(function(date, index) {
         if (date in origData) {
           arr.push([date, origData[date]]);
         } else {
           arr.push([date, 0]);
         }
       });

       return arr;

     }

     /**
      * Used to pass the values of `date_from` and `date_to` between the scripts and to Netsuite for the records and the search.
      * @param   {String} date_iso       "2020-06-01"
      * @returns {String} date_netsuite  "1/6/2020"
      */
     function dateISOToNetsuite(date_iso) {
       var date_netsuite = '';
       if (!isNullorEmpty(date_iso)) {
         var date_utc = new Date(date_iso);
         // var date_netsuite = nlapiDateToString(date_utc);
         var date_netsuite = format.format({
           value: date_utc,
           type: format.Type.DATE
         });
       }
       return date_netsuite;
     }

     function saveRecord(context) {

       return true;
     }

     function isNullorEmpty(strVal) {
       return (strVal == null || strVal == '' || strVal == 'null' || strVal ==
         undefined || strVal == 'undefined' || strVal == '- None -');
     }

     return {
       pageInit: pageInit,
       saveRecord: saveRecord,

     };
   }


 );
