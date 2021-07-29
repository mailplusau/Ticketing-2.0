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
                        [6, 'desc']
                    ],
                    columns: [{
                        title: 'LINK'
                    }, {
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
                        [5, 'desc']
                    ],
                    columns: [{
                        title: 'LINK'
                    }, {
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

            overviewChart();
            customerChart();
            staffChart();
            sourceChart();

            $('#submit').click(function() {
                // Ajax request
                var fewSeconds = 10;
                var btn = $(this);
                btn.addClass('disabled');
                // btn.addClass('')
                setTimeout(function() {
                    btn.removeClass('disabled');
                }, fewSeconds * 1000);

                debtDataSet = [];
                debt_set = [];

                beforeSubmit();
                submitSearch();

                return true;
            });
        }

        function overviewChart() {
            var cnt_set_created = [];
            var date_set_created = [];
            var progress_data = {};
            var source_sender_data = {};
            var cnt_set_closed = [];
            var cnt_set_cust = [];
            var cnt_set_zee = [];


            var ticketCreatedRes = search.load({
                type: 'customrecord_mp_ticket',
                id: 'customsearch_ticket_created_report_week'
            });          

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

                cnt_set_created.push(parseInt(ticketsCount));
                if (!(date_set_created.includes(dateCreated))) {
                    date_set_created.push(dateCreated);
                }
                progress_data[dateCreated] = 0;
                source_sender_data[dateCreated] = 0;

                cnt_set_cust.push(parseInt(custCount));
                cnt_set_zee.push(parseInt(zeeCount));

                return true;
            
            });    
            
            var open_data = progress_data;
            // Tickets Closed
            var ticketClosedRes = search.load({
                type: 'customrecord_mp_ticket',
                id: 'customsearch_ticket_closed_report_week2'
            });

            
            ticketClosedRes.run().each(function(ticket) {
                var ticketsCount = ticket.getValue({
                    name: 'name',
                    summary: 'COUNT'
                });

                cnt_set_closed.push(parseInt(ticketsCount));

                return true;
            
            }); 

            // Tickets Progress
            var ticketProgressRes = search.load({
                type: 'customrecord_mp_ticket',
                id: 'customsearch_ticket_progres_report_week3'
            });

            
            ticketProgressRes.run().each(function(ticket) {
                var ticketsCount = ticket.getValue({
                    name: 'name',
                    summary: 'COUNT'
                });
                var ticketsDate = ticket.getValue({
                    name: "lastmodified",
                    summary: "GROUP",
                });
                if (ticketsDate in progress_data) {
                    progress_data[ticketsDate] += parseInt(ticketsCount); 

                } else {
                    progress_data[ticketsDate] = parseInt(ticketsCount); 
                }
                return true;
            
            }); 

            var cnt_set_progress = Object.values(progress_data);

            // Open Tickets
            var ticketOpenRes = search.load({
                type: 'customrecord_mp_ticket',
                id: 'customsearch_ticket_open_report_week'
            });

            
            ticketOpenRes.run().each(function(ticket) {
                var ticketsCount = ticket.getValue({
                    name: 'name',
                    summary: 'COUNT'
                });
                var ticketsDate = ticket.getValue({
                    name: "lastmodified",
                    summary: "GROUP",
                });
                if (ticketsDate in open_data) {
                    open_data[ticketsDate] += parseInt(ticketsCount); 
                } else {
                    open_data[ticketsDate] = parseInt(ticketsCount); 
                }

                return true;
            
            }); 

            var cnt_set_open = Object.values(open_data);

            var colors = Highcharts.getOptions().colors;
            console.log('cust', cnt_set_cust);
            console.log('cust', cnt_set_zee);

            Highcharts.chart('container', {
                chart: {
                    height: (9 / 16 * 100) + '%',
                    zoomType: 'xy'
                },
                legend: {
                    symbolWidth: 40
                },

                title: {
                    text: 'Ticketing Breakdown'
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
                        text: 'Last 12 months'
                    },
                    accessibility: {
                        description: 'Last 12 months'
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
                        data: cnt_set_progress,
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
            date_set_created.forEach(function(date, index) {
                tableDataSet.push(['Link', dateCreated2DateSelectedFormat(date), cnt_set_created[index], cnt_set_closed[index], cnt_set_progress[index], cnt_set_open[index], cnt_set_cust[index], cnt_set_zee[index]]);
            });
             
            dataTable.rows.add(tableDataSet);
            dataTable.draw();

        }

        function customerChart() {
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
                    text: 'Number of Tickets per Customer (' + getFirstDay() + ' - ' + getLastDay() + ')'
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

                tableDataSet.push(['Link', cust_link, cust_zee[index], open, progress, closed, total]);
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
                    text: 'Number of Tickets per Zee (' + getFirstDay() + ' - ' + getLastDay() + ')'
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

                tableDataSet2.push(['Link', zee_set_chart[key], open, progress, closed, total]);
            }
        
            dataTable2.rows.add(tableDataSet2);
            dataTable2.draw();


        }

        function staffChart() {
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
                id: 'customsearch_ticket_source_report_week_3'
            });  

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
                        if (firstCompare(date) && secondCompare(date)) {
                            jOpen += parseInt(cnt);
                        }
                         if (date in jOpenData) {
                            jOpenData[date] = jOpenData[date] + parseInt(cnt);
                        } else {
                            jOpenData[date] = parseInt(cnt);
                        }
                     } else if (status == 3 || status == 9) {   // Closed or Closed-Lost
                        if (firstCompare(date) && secondCompare(date)) {
                            jClo += parseInt(cnt);
                        }
                        if (date in jCloData) {
                            jCloData[date] = jCloData[date] + parseInt(cnt);
                        } else {
                            jCloData[date] = parseInt(cnt);
                        }
                     } else {
                        if (firstCompare(date) && secondCompare(date)) {
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
                        if (firstCompare(date) && secondCompare(date)) {
                            kOpen += parseInt(cnt);
                        }
                        if (date in kOpenData) {
                            kOpenData[date] = kOpenData[date] + parseInt(cnt);
                        } else {
                            kOpenData[date] = parseInt(cnt);
                        }
                    } else if (status == 3 || status == 9) {   // Closed or Closed-Lost
                        if (firstCompare(date) && secondCompare(date)) {
                            kClo += parseInt(cnt);
                        }
                        if (date in kCloData) {
                            kCloData[date] = kCloData[date] + parseInt(cnt);
                        } else {
                            kCloData[date] = parseInt(cnt);
                        }
                    } else {
                        if (firstCompare(date) && secondCompare(date)) {
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
                        if (firstCompare(date) && secondCompare(date)) {
                            gOpen += parseInt(cnt);
                        }
                        if (date in gOpenData) {
                            gOpenData[date] = gOpenData[date] + parseInt(cnt);
                        } else {
                            gOpenData[date] = parseInt(cnt);
                        }
                    } else if (status == 3 || status == 9) {   // Closed or Closed-Lost
                        if (firstCompare(date) && secondCompare(date)) {
                            gClo += parseInt(cnt);
                        }
                        if (date in gCloData) {
                            gCloData[date] = gCloData[date] + parseInt(cnt);
                        } else {
                            gCloData[date] = parseInt(cnt);
                        }
                    } else {
                        if (firstCompare(date) && secondCompare(date)) {
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
                        if (firstCompare(date) && secondCompare(date)) {
                            oOpen += parseInt(cnt);
                        }
                        if (date in oOpenData) {
                            oOpenData[date] = oOpenData[date] + parseInt(cnt);
                        } else {
                            oOpenData[date] = parseInt(cnt);
                        }
                    } else if (status == 3 || status == 9) {   // Closed or Closed-Lost
                        if (firstCompare(date) && secondCompare(date)) {
                            oClo += parseInt(cnt);
                        }
                        if (date in oCloData) {
                            oCloData[date] = oCloData[date] + parseInt(cnt);
                        } else {
                            oCloData[date] = parseInt(cnt);
                        }
                    } else {
                        if (firstCompare(date) && secondCompare(date)) {
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
                    text: 'Staff Breakdown (' + getFirstDay() + ' - ' + getLastDay() + ')'
                },
                xAxis: {
                    type: 'category'
                },
                tooltip: {
                    shared: true
                },
                legend: {
                    enabled: true
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

        function sourceChart() {
            var colors = Highcharts.getOptions().colors;
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
                    text: 'Sender vs Receiver Breakdown'
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

        function firstCompare(date) {
            //Get start of week
            var curr = new Date; // get current date
            var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
            var firstday = new Date(curr.setDate(first));
            var dd = String(firstday.getDate()).padStart(2, '0');
            var mm = String(firstday.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = firstday.getFullYear();

            var dateSplit = date.split('/');
            var firstDate = new Date(dateSplit[2], dateSplit[1], dateSplit[0]);
            var secondDate = new Date(yyyy, mm, dd);

            // 20/06
            //25/06
            //28/06
            return (firstDate >= secondDate);
        }

        function secondCompare(date) {
            //Get start of week
            var curr = new Date; // get current date
            var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
            var last = first + 6; // last day is the first day + 6
            var lastday = new Date(curr.setDate(last));
            var dd = String(lastday.getDate()).padStart(2, '0');
            var mm = String(lastday.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = lastday.getFullYear();

            var dateSplit = date.split('/');
            var firstDate = new Date(dateSplit[2], dateSplit[1], dateSplit[0]);
            var secondDate = new Date(yyyy, mm, dd);

            // 20/06
            //25/06
            //28/06
            return (firstDate <= secondDate);

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