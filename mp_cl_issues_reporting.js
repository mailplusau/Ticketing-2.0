/**
 *
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 *
 * Description:
 * @Last modified by:   ankithravindran
 *
 */


/*
              TOLL ISSUE NAMES                       ID

Address: Not Safe to Leave - Re-delivery Organised	 16
Address: Receiver No Longer at Address	             13
Address: Unserviced Remote Area	                     15
Alternative Delivery Point	                          7
Damaged Item	                                        5
Delayed >2 Days	                                     12
Delayed +1 Day	                                      8
Delayed +2 Days	                                      9
Delivered to Incorrect Address	                      3
Dispute of Delivery	                                 17
Incorrect Address: Incomplete	                       10
Incorrect Address: No Address	                       11
Incorrect Address: P.O. Box	                          1
Lost Item	                                            4
Missorted	                                           14
Other	                                               19
Out for delivery – ETA requested	                   18
Over weight	                                          6
Returned to Sender	                                  2

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
            deploymentId: 'customdeploy_sl_issues_reporting',
            scriptId: 'customscript_sl_issues_reporting',
          });
          var upload_url = baseURL + output + '&custparam_params=' +
            params;
          window.open(upload_url, "_self",
            "height=750,width=650,modal=yes,alwaysRaised=yes");
        }
      });
    }

    function manualChart(date_from, date_to) {

      var date_set_created = [];
      var manual_issues = []

      // MPEX - Tickets Barcode Manual Source - Last year to date (per week)
      var manualBarcodeIssues = search.load({
        type: 'customrecord_mp_ticket',
        id: 'customsearch_ticket_created_report_wee_3'
      });

      var title = 'Manual Barcodes Issues (' + getFirstDay() + ' - ' +
        getLastDay() +
        ')';

      if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
        title = 'Manual Barcodes Issues (' + date_from + ' - ' + date_to +
          ')';
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
        manual_issues.push({"name" : issuesCat,
          "y" : parseInt(ticketsCount)
        });

        return true;

      });

      console.log(manual_issues)

      var series_data = [];
      series_data.push(manual_issues);

      console.log(series_data)

      Highcharts.chart('container', {
        chart: {
           height: (4/ 16 * 100) + '%',
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

      var title = 'Shopify Barcodes Issues (' + getFirstDay() + ' - ' +
        getLastDay() +
        ')';

      if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
        title = 'Shopify Barcodes Issues (' + date_from + ' - ' + date_to +
          ')';
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
        manual_issues.push({"name" : issuesCat,
          "y" : parseInt(ticketsCount)
        });

        return true;

      });

      console.log(manual_issues)

      var series_data = [];
      series_data.push(manual_issues);

      console.log(series_data)

      Highcharts.chart('container2', {
        chart: {
           height: (4 / 16 * 100) + '%',
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

      var title = 'Customer Portal Barcodes Issues (' + getFirstDay() + ' - ' +
        getLastDay() +
        ')';

      if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
        title = 'Customer Portal Barcodes Issues (' + date_from + ' - ' + date_to +
          ')';
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
        manual_issues.push({"name" : issuesCat,
          "y" : parseInt(ticketsCount)
        });

        return true;

      });

      console.log(manual_issues)

      var series_data = [];
      series_data.push(manual_issues);

      console.log(series_data)

      Highcharts.chart('container3', {
        chart: {
           height: (4 / 16 * 100) + '%',
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

      var title = 'Bulk Barcodes Issues (' + getFirstDay() + ' - ' +
        getLastDay() +
        ')';

      if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
        title = 'Bulk Barcodes Issues (' + date_from + ' - ' + date_to +
          ')';
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
        manual_issues.push({"name" : issuesCat,
          "y" : parseInt(ticketsCount)
        });

        return true;

      });

      console.log(manual_issues)

      var series_data = [];
      series_data.push(manual_issues);

      console.log(series_data)

      Highcharts.chart('container5', {
        chart: {
           height: (4 / 16 * 100) + '%',
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
