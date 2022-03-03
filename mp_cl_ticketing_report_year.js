 /**
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * 
 * Description: 
 * @Last Modified by: Sruti Desai
 * 
 */

  define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
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
                      title: 'Year',
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
                  },{
                      title: 'Number of In Progress Tickets'
                  },{
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
          var date_from = currRec.getValue({ fieldId: 'custpage_date_from' });
          var date_to = currRec.getValue({ fieldId: 'custpage_date_to' });
          console.log('date', date_from);
          console.log('to', date_to);

          overviewChart(date_from, date_to);
          customerChart(date_from, date_to);
          staffChart(date_from, date_to);
          sourceChart(date_from, date_to);

          $('#submit').click(function() {
              console.log('submit clicked');
              var date_from = $('#date_from').val();
              var date_to = $('#date_to').val();
              date_from = dateISOToNetsuite(date_from);
              date_to = dateISOToNetsuite(date_to);

              if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
                  var params = {
                      date_from:date_from,
                      date_to: date_to
                  };
                  params = JSON.stringify(params);
                  var output = url.resolveScript({
                      deploymentId: 'customdeploy_sl_ticketing_report_year',
                      scriptId: 'customscript_sl_ticketing_report_year',
                  });
                  var upload_url = baseURL + output + '&custparam_params=' + params;
                  window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
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

        var created_obj = {};
        var closed_obj = {};
        var progress_obj = {};
        var open_obj = {};
        var cust_obj = {};
        var zee_obj = {};

        var source_sender_data = {};


          var ticketCreatedRes = search.load({
              type: 'customrecord_mp_ticket',
              id: 'customsearch_ticket_created_report_year'
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
                date_set_created.sort(function(a,b) {
                  var aComps = a.split("/");
                  var bComps = b.split("/");
                  var aDate = new Date(aComps[2], aComps[1], aComps[0]);
                  var bDate = new Date(bComps[2], bComps[1], bComps[0]);
                  return aDate.getTime() - bDate.getTime();
              });
              
              }
              cnt_set_created.push([date_set_created.indexOf(dateCreated), parseInt(ticketsCount)]);
              cnt_set_cust.push([date_set_created.indexOf(dateCreated), parseInt(custCount)]);
              cnt_set_zee.push([date_set_created.indexOf(dateCreated), parseInt(zeeCount)]);
              created_obj[dateCreated] = parseInt(ticketsCount);
              cust_obj[dateCreated] = parseInt(custCount);
              zee_obj[dateCreated] = parseInt(zeeCount);


              return true;
          
          });    
          

          // Tickets Closed
          var ticketClosedRes = search.load({
              type: 'customrecord_mp_ticket',
              id: 'customsearch_ticket_closed_report_year'
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
                date_set_created.sort(function(a,b) {
                    var aComps = a.split("/");
                    var bComps = b.split("/");
                    var aDate = new Date(aComps[2], aComps[1], aComps[0]);
                    var bDate = new Date(bComps[2], bComps[1], bComps[0]);
                    return aDate.getTime() - bDate.getTime();
                });
              }
              cnt_set_closed.push([date_set_created.indexOf(dateCreated), parseInt(ticketsCount)]);
              closed_obj[dateCreated] = parseInt(ticketsCount);


              return true;
          
          }); 

          // Tickets Progress
          var ticketProgressRes = search.load({
              type: 'customrecord_mp_ticket',
              id: 'customsearch_ticket_prog_report_year'
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
              cnt_set_prog.push([date_set_created.indexOf(dateCreated), parseInt(ticketsCount)]);

              progress_obj[dateCreated] = parseInt(ticketsCount);

              return true;
          
          }); 


          // Open Tickets
          var ticketOpenRes = search.load({
              type: 'customrecord_mp_ticket',
              id: 'customsearch_ticket_open_report_year'
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
              cnt_set_open.push([date_set_created.indexOf(dateCreated), parseInt(ticketsCount)]);

              open_obj[dateCreated] = parseInt(ticketsCount);


              return true;
          
          }); 

          var colors = Highcharts.getOptions().colors;
          var title = 'Ticketing Breakdown (' + date_set_created[0] + ' - ' + date_set_created[date_set_created.length - 1] + ')';

          Highcharts.chart('container', {
              chart: {
                  height: (9 / 16 * 100) + '%',
                  zoomType: 'xy'
              },
              legend: {
                align: 'right',
                x: -30,
                verticalAlign: 'top',
                y: 25,
                floating: true,
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || 'white',
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
                      text: 'Years'
                  },
                  accessibility: {
                      description: 'Years'
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

              
              series: [
                  {
                      name: 'Tickets Created',
                      data: cnt_set_created,
                      color: colors[2],
                      type: 'spline'
                  }, 
                  {
                      name: 'Closed Tickets',
                      data: cnt_set_closed,
                      dashStyle: 'Dash',
                      color: colors[4],
                      type: 'spline'
                  },
                  {
                      name: 'Number of Customers',
                      type: 'column',
                      data: cnt_set_cust,
                      color: colors[8],
                  },
                  {
                      name: 'Number of Zees',
                      type: 'column',
                      data: cnt_set_zee,
                      color: colors[7],
                  },
                  {
                      name: 'Open Tickets',
                      data: cnt_set_open,
                      dashStyle: 'ShortDashDot',
                      color: colors[9]
                  }, 
                  {
                      name: 'In Progress Tickets',
                      data: cnt_set_prog,
                      dashStyle: 'ShortDot',
                      color: colors[6],
                      type: 'spline'
                  }, 

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
          var tableDataSet = [];
          date_set_created.forEach(function(date) {
              var created = (isNullorEmpty(created_obj[date])) ? 0 : created_obj[date];
              var closed = (isNullorEmpty(closed_obj[date])) ? 0 : closed_obj[date];
              var progress = (isNullorEmpty(progress_obj[date])) ? 0 : progress_obj[date];
              var open = (isNullorEmpty(open_obj[date])) ? 0 : open_obj[date];
              var cust = (isNullorEmpty(cust_obj[date])) ? 0 : cust_obj[date];
              var zee = (isNullorEmpty(zee_obj[date])) ? 0 : zee_obj[date];
            
              var link1 = '<a href=\'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1306&deploy=1&compid=1048144&custparam_params={"date_from":"' + getYearStart(date) + '","date_to":"' + getYearEnd(date) + '"}\' target=_blank>VIEW (per day)</a> ';
              var link2 = '<a href=\'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1289&deploy=1&compid=1048144&custparam_params={"date_from":"' + getYearStart(date) + '","date_to":"' + getYearEnd(date) + '"}\' target=_blank>VIEW (per week)</a> ';
              var link3 = '<a href=\'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1301&deploy=1&compid=1048144&custparam_params={"date_from":"' + getYearStart(date) + '","date_to":"' + getYearEnd(date) + '"}\' target=_blank>VIEW (per month)</a> ';

              var link = link1 + link2 + link3;
              if (isNullorEmpty(date)) {

              } else {
                tableDataSet.push([link, dateCreated2DateSelectedFormat(date), created, closed, progress, open, cust, zee]);
              }
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
          var custSearch =  search.load({
              type: 'customrecord_mp_ticket',
              id: 'customsearch_ticket_customer_report_week'
          });

          // Status Code
          // Closed = 3
          // Closed-Lost = 9
          // Open = 1
          // In Progress = 2 CS, 4 IT 

          var title = 'Number of Tickets per Customer (' + getFirstDay() + ' - ' + getLastDay() + ')';
          var title2 = 'Number of Tickets per Zee (' + getFirstDay() + ' - ' + getLastDay() + ')';
          if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
              title = 'Number of Tickets per Customer (' + date_from + ' - ' + date_to + ')';
              title2 = 'Number of Tickets per Zee (' + date_from + ' - ' + date_to + ')';
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
          
              var count = ticket.getValue({ name: "name", summary: "COUNT"});
              var cust = ticket.getText({ name: "custrecord_customer1", summary: "GROUP"});
              var zee = ticket.getText({ name: "custrecord_zee", summary: "GROUP"});
              var status = ticket.getValue({ name: "custrecord_ticket_status", summary: "GROUP",});

              if (isNullorEmpty(cust)) {
                  cust = "No Customer Allocated";
              }

              if (isNullorEmpty(zee)) {
                  zee = 'No Zee Allocated';
              }

              //Array of unique custoemrs- no duplicates
              if (!customer_set_chart.includes(cust)) {
                  customer_set_chart.push(cust);
                  cust_ids.push (parseInt(ticket.getValue({ name: "custrecord_customer1", summary: "GROUP"})));
                  cust_zee.push(zee);
              }

              //Array of unique zees- no duplicates
              if (!zee_set_chart.includes(zee)) {
                  zee_set_chart.push(zee)
              }

              if (status == 1) {  //Open Tickets
                  //Chart Data
                  cust_count_open.push([customer_set_chart.indexOf(cust), parseInt(count)]);
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
              } else if (status == 3 || status == 9) {    //Closed Tickets
                  //Chart Data
                  cust_count_clo.push([customer_set_chart.indexOf(cust), parseInt(count)]);
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
              } else {    //In Progress Tickets
                  //Chart Data
                  cust_count_prog.push([customer_set_chart.indexOf(cust), parseInt(count)]);
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
                  height: (9 / 16 * 100) + '%',
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
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || 'white',
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
              series: [
              {
                  name: 'Open',
                  data: cust_count_open,
                  color: '#F2C80F'
              },
              {
                  name: 'In Progress',
                  data: cust_count_prog,
                  color: '#F15628'
              },
              {
                  name: 'Closed',
                  data: cust_count_clo,
                  color: '#108372'
              }
              ]
          });
          


          //Customer Datatable
          var dataTable = $('#tickets-customer').DataTable();
          dataTable.clear();
          var tableDataSet = [];
          customer_set_chart.forEach(function(cust, index) {
              var cust_link = '<a href="https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + cust_ids[index] + '">' + cust + '</a>';

              var open = (cust in cust_open_obj) ? cust_open_obj[cust] : 0;
              var progress = (cust in cust_prog_obj) ? cust_prog_obj[cust] : 0;
              var closed = (cust in cust_clo_obj) ? cust_clo_obj[cust] : 0;
              var total = open + progress + closed;

              tableDataSet.push([cust_link, cust_zee[index], open, progress, closed, total]);
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
                  height: (9 / 16 * 100) + '%',
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
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || 'white',
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
              series: [
              {
                  name: 'Open',
                  data: zee_count_open2,
                  color: '#F2C80F'
              },
              {
                  name: 'In Progress',
                  data: zee_count_prog2,
                  color: '#F15628'
              },
              {
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
              var open = (zee_set_chart[key] in zee_count_open) ? zee_count_open[zee_set_chart[key]] : 0;
              var progress = (zee_set_chart[key] in zee_count_prog) ? zee_count_prog[zee_set_chart[key]] : 0;
              var closed = (zee_set_chart[key] in zee_count_clo) ? zee_count_clo[zee_set_chart[key]] : 0;
              var total = open + progress + closed;

              tableDataSet2.push([zee_set_chart[key], open, progress, closed, total]);
          }
      
          dataTable2.rows.add(tableDataSet2);
          dataTable2.draw();


      }

      function staffChart(date_from, date_to) {
          var jOpen = 0;
          var jProg = 0;
          var jClo = 0;
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
          var gOpenData = [];
          var kOpenData = [];
          var oOpenData = [];
          var jProgData = {};
          var gProgData = {};
          var kProgData = {};
          var oProgData = {};
          var jCloData = {};
          var gCloData = {};
          var kCloData = {};
          var oCloData = {};

          // Closed = 3
          // Closed-Lost = 9
          // Open = 1
          // In Progress = 2 CS, 4 IT
          // Jess 386344 
          // Kaley 1565545 
          // Gab 1154991 
          var staffSearch = search.load({
              type: 'customrecord_mp_ticket',
              id: 'customsearch_ticket_source3_report_year'
          });  

          var title = 'Staff Breakdown (' + getFirstDay() + ' - ' + getLastDay() + ')';
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
                values: firstDate,
            }));

            staffSearch.filters.push(search.createFilter({
                name: "created",
                operator: search.Operator.ONORBEFORE,
                values: lastDate,
            }));

          }

          var dateSet = [];
          staffSearch.run().each(function(ticket) {
               var cnt = ticket.getValue({ name: "name", summary: "COUNT"});
               var date = ticket.getValue({ name: "created", summary: "GROUP" });
               var status = ticket.getValue({ name: "custrecord_ticket_status", summary: "GROUP" });
               var owner = ticket.getValue({ name: "owner", summary: "GROUP"});

               if (!(dateSet.includes(date))) {
                  dateSet.push(date);
               }
               if (owner == 386344) {     // Jess
                   if (status == 1) {     // Open
                      if (firstCompare(date, firstDate) && secondCompare(date, lastDate)) {
                          jOpen += parseInt(cnt);
                      }
                       if (date in jOpenData) {
                          jOpenData[date] = jOpenData[date] + parseInt(cnt);
                      } else {
                          jOpenData[date] = parseInt(cnt);
                      }
                   } else if (status == 3 || status == 9) {   // Closed or Closed-Lost
                      if (firstCompare(date, firstDate) && secondCompare(date, lastDate)) {
                          jClo += parseInt(cnt);
                      }
                      if (date in jCloData) {
                          jCloData[date] = jCloData[date] + parseInt(cnt);
                      } else {
                          jCloData[date] = parseInt(cnt);
                      }
                   } else {
                      if (firstCompare(date, firstDate) && secondCompare(date, lastDate)) {
                          jProg += parseInt(cnt);
                      }
                      if (date in jProgData) {
                          jProgData[date] = jProgData[date] + parseInt(cnt);
                      } else {
                          jProgData[date] = parseInt(cnt);
                      }
                   }
               } else if (owner == 1565545) {     // Kaley
                  if (status == 1) {     // Open
                      if (firstCompare(date, firstDate) && secondCompare(date, lastDate)) {
                          kOpen += parseInt(cnt);
                      }
                      if (date in kOpenData) {
                          kOpenData[date] = kOpenData[date] + parseInt(cnt);
                      } else {
                          kOpenData[date] = parseInt(cnt);
                      }
                  } else if (status == 3 || status == 9) {   // Closed or Closed-Lost
                      if (firstCompare(date, firstDate) && secondCompare(date, lastDate)) {
                          kClo += parseInt(cnt);
                      }
                      if (date in kCloData) {
                          kCloData[date] = kCloData[date] + parseInt(cnt);
                      } else {
                          kCloData[date] = parseInt(cnt);
                      }
                  } else {
                      if (firstCompare(date, firstDate) && secondCompare(date, lastDate)) {
                          kProg += parseInt(cnt);
                      }
                      if (date in kProgData) {
                          kProgData[date] = kProgData[date] + parseInt(cnt);
                      } else {
                          kProgData[date] = parseInt(cnt);
                      }
                  }
              }else if (owner == 1154991) {     // Gab
                  if (status == 1) {     // Open
                      if (firstCompare(date, firstDate) && secondCompare(date, lastDate)) {
                          gOpen += parseInt(cnt);
                      }
                      if (date in gOpenData) {
                          gOpenData[date] = gOpenData[date] + parseInt(cnt);
                      } else {
                          gOpenData[date] = parseInt(cnt);
                      }
                  } else if (status == 3 || status == 9) {   // Closed or Closed-Lost
                      if (firstCompare(date, firstDate) && secondCompare(date, lastDate)) {
                          gClo += parseInt(cnt);
                      }
                      if (date in gCloData) {
                          gCloData[date] = gCloData[date] + parseInt(cnt);
                      } else {
                          gCloData[date] = parseInt(cnt);
                      }
                  } else {
                      if (firstCompare(date, firstDate) && secondCompare(date, lastDate)) {
                          gProg += parseInt(cnt);
                      }
                      if (date in gProgData) {
                          gProgData[date] = gProgData[date] + parseInt(cnt);
                      } else {
                          gProgData[date] = parseInt(cnt);
                      }
                  }
              }else {     // Other
                  if (status == 1) {     // Open
                      if (firstCompare(date, firstDate) && secondCompare(date, lastDate)) {
                          oOpen += parseInt(cnt);
                      }
                      if (date in oOpenData) {
                          oOpenData[date] = oOpenData[date] + parseInt(cnt);
                      } else {
                          oOpenData[date] = parseInt(cnt);
                      }
                  } else if (status == 3 || status == 9) {   // Closed or Closed-Lost
                      if (firstCompare(date, firstDate) && secondCompare(date, lastDate)) {
                          oClo += parseInt(cnt);
                      }
                      if (date in oCloData) {
                          oCloData[date] = oCloData[date] + parseInt(cnt);
                      } else {
                          oCloData[date] = parseInt(cnt);
                      }
                  } else {
                      if (firstCompare(date, firstDate) && secondCompare(date, lastDate)) {
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
                  height: (9 / 16 * 100) + '%',
                  zoomType: 'xy',
                  type: 'column',
                  events: {
                      drilldown: function (e) {
                          if (!e.seriesOptions) {
      
                              var chart = this,
                                  drilldowns = {
                                      'Jess': {
                                          name: 'Open',
                                          color: '#F2C80F',
                                          data: convertArrObj(dateSet, jOpenData),
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
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || 'white',
                borderColor: '#CCC',
                borderWidth: 1,
                shadow: false
            },
              tooltip: {
                  shared: true
              },
              
      
              plotOptions: {
              column: {stacking: 'normal'},
                  series: {
                      borderWidth: 0,
                      dataLabels: {
                          enabled: true,
                          color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'black',
                          formatter: function(){
                          return (this.y!=0)?this.y:"";
                          }
                      }
                  }
                  
              },
      
              series: [{
                  name: 'Open',
                  color: '#F2C80F',
                  data: [{ name: 'Jess', y: jOpen, drilldown: true}, 
                  { name: 'Gab', y: gOpen, drilldown: true},
                  { name: 'Kaley', y: kOpen, drilldown: true},
                  { name: 'Other', y: oOpen, drilldown: true}]
              },{
                  name: 'In Progress',
                  color: '#F15628',
                  data: [{ name: 'Jess', y: jProg, drilldown: true}, 
                  { name: 'Gab', y: gProg, drilldown: true},
                  { name: 'Kaley', y: gProg, drilldown: true},
                  { name: 'Other', y: gProg, drilldown: true}]
              },{
                  name: 'Closed',
                  color: '#108372',
                  data: [{ name: 'Jess', y: jClo, drilldown: true}, 
                  { name: 'Gab', y: gClo, drilldown: true },
                  { name: 'Kaley', y: kClo, drilldown: true},
                  { name: 'Other', y: oClo, drilldown: true}],
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
              id: 'customsearch_ticket_source_report_year'
          });

          var title = 'Sender vs Receiver Breakdown (' + getFirstDay() + ' - ' + getLastDay() + ')';

          if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
            var title = 'Sender vs Receiver Breakdown (' + date_from + ' - ' + date_to + ')';
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
              
              if (ticketsStatus == 1) {   //Sender
                  if (owner == -4) {
                      web_send.push([date_set.indexOf(ticketsDate), parseInt(ticketsCount)]);                 
                  } else {
                      if (ticketsDate in nonweb_send_obj) {
                          nonweb_send_obj[ticketsDate] = nonweb_send_obj[ticketsDate] + parseInt(ticketsCount);
                      } else {
                          nonweb_send_obj[ticketsDate] = parseInt(ticketsCount);
                      }
                  }
                  
              } else if (ticketsStatus == 4) {    //Receiver
                  if (owner == -4) {
                      web_recv.push([date_set.indexOf(ticketsDate), parseInt(ticketsCount)]);  
                  } else {
                      if (ticketsDate in nonweb_recv_obj) {
                          nonweb_recv_obj[ticketsDate] = nonweb_recv_obj[ticketsDate] + parseInt(ticketsCount);
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
                  height: (9 / 16 * 100) + '%',
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
                  backgroundColor:
                      Highcharts.defaultOptions.legend.backgroundColor || 'white',
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
              },
              {
                  name: 'Non Website - Receiver',
                  data: nonweb_recv,
                  stack: 1,
                  color: '#F15628'
              }]
              
          });
           
      
      }

      function dateCreated2DateSelectedFormat(date_created) {
          // date_created = '4/6/2020'
        //   var date_array = date_created.split('-');
        //   // date_array = ["4", "6", "2020"]
        //   var year = date_array[0];
        //   var month = date_array[1];
        //   if (month < 10) {
        //       month = '0' + month;
        //   }
        //   var day = date_array[0];
        //   if (day < 10) {
        //       day = '0' + day;
        //   }
          return date_created;
      }

      function convertDate(date) {
          var dd = String(date.getDate()).padStart(2, '0');
          var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
          var yyyy = date.getFullYear();

          date = dd + '/' + mm + '/' + yyyy;
          return date;
      }

      function getFirstDay() {
          var currentDate = new Date();
          var firstDay = new Date(currentDate.getFullYear(), 0, 1);
          return convertDate(firstDay);
      }

      

      function getLastDay() {
          var currentDate = new Date();
          var lastDay = new Date(currentDate.getFullYear(), 11, 31);
          return convertDate(lastDay);
      }

      function firstCompare(search_date, first) {
          var firstSplit = first.split('/');
          var firstDate = new Date(search_date, 1, 1);
          var secondDate = new Date(firstSplit[2], firstSplit[1], firstSplit[0]);
          return (firstDate >= secondDate);
      }

      function secondCompare(date, last) {
          var lastSplit = last.split('/');
          var firstDate = new Date(date, 1, 1);
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

          var today_date = new Date(Date.UTC(today_year, today_month, today_day_in_month))

          switch (period_selected) {
              case "this_week":
                  // This method changes the variable "today" and sets it on the previous monday
                  if (today_day_in_week == 0) {
                      var monday = new Date(Date.UTC(today_year, today_month, today_day_in_month - 7));
                  } else {
                      var monday = new Date(Date.UTC(today_year, today_month, today_day_in_month - today_day_in_week));
                  }
                  today_date = new Date(Date.UTC(today_year, today_month, today_day_in_month + 1));
                  var date_from = monday.toISOString().split('T')[0];
                  var date_to = today_date.toISOString().split('T')[0];
                  break;

              case "last_week":
                  var today_day_in_month = today.getDate();
                  var today_day_in_week = today.getDay();
                  // This method changes the variable "today" and sets it on the previous monday
                  if (today_day_in_week == 0) {
                      var previous_sunday = new Date(Date.UTC(today_year, today_month, today_day_in_month - 7));
                  } else {
                      var previous_sunday = new Date(Date.UTC(today_year, today_month, today_day_in_month - today_day_in_week));
                  }

                  var previous_sunday_year = previous_sunday.getFullYear();
                  var previous_sunday_month = previous_sunday.getMonth();
                  var previous_sunday_day_in_month = previous_sunday.getDate();

                  var monday_before_sunday = new Date(Date.UTC(previous_sunday_year, previous_sunday_month, previous_sunday_day_in_month - 7));

                  var date_from = monday_before_sunday.toISOString().split('T')[0];
                  var date_to = previous_sunday.toISOString().split('T')[0];
                  break;

              case "this_month":
                  var first_day_month = new Date(Date.UTC(today_year, today_month));
                  var date_from = first_day_month.toISOString().split('T')[0];
                  var date_to = today_date.toISOString().split('T')[0];
                  break;

              case "last_month":
                  var first_day_previous_month = new Date(Date.UTC(today_year, today_month - 1));
                  var last_day_previous_month = new Date(Date.UTC(today_year, today_month, 0));
                  var date_from = first_day_previous_month.toISOString().split('T')[0];
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

      function getYearStart(date) {
        date = new Date(dateCreated2DateSelectedFormat(date)); // get current date
        return convertDate(new Date(date.getFullYear(), 0, 1));
    }

    function getYearEnd(date) {
        date = new Date(dateCreated2DateSelectedFormat(date)); // get current date
        return convertDate(new Date(date.getFullYear(), 11, 31));

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
          return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
      }

      return {
          pageInit: pageInit,
          saveRecord: saveRecord,
          
      };  
  }


);