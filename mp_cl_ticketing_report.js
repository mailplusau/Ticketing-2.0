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
            //background-colors
            // $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
            // $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
            // $("#body").css("background-color", "#CFE0CE");

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
                        title: 'Tickets Source - Website'
                    }, {
                        title: 'Tickets Source - Non-Website'
                    }]
    
                });
                var dataTable2 = $('#tickets-customer').DataTable({
                    destroy: true,
                    data: tableDataSet,
                    pageLength: 100,
                    order: [
                        [3, 'desc']
                    ],
                    columns: [{
                        title: 'LINK'
                    }, {
                        title: 'Customer Name',
                    }, {
                        title: 'Franchisee'
                    }, {
                        title: 'Number of Tickets'
                    }]
    
                });
                var dataTable3 = $('#tickets-zee').DataTable({
                    destroy: true,
                    data: tableDataSet,
                    pageLength: 100,
                    order: [
                        [2, 'desc']
                    ],
                    columns: [{
                        title: 'LINK'
                    }, {
                        title: 'Franchisee',
                    }, {
                        title: 'Number of Tickets'
                    }]
    
                });
            });
            

            var cnt_set_created = [];
            var date_set_created = [];
            var progress_data = {};
            var source_sender_data = {};
            var cnt_set_closed = [];
            var cnt_set_source_system2 = [];

            var ticketCreatedRes = search.load({
                type: 'customrecord_mp_ticket',
                id: 'customsearch_ticket_created_report_week'
            });          

            var i = 0;
            console.log('prog1', progress_data);
            ticketCreatedRes.run().each(function(ticket) {
                var dateCreated = ticket.getValue({
                    name: 'created',
                    summary: 'GROUP'
                });
                var ticketsCount = ticket.getValue({
                    name: 'name',
                    summary: 'COUNT'
                });

                cnt_set_created.push(parseInt(ticketsCount));
                date_set_created.push(dateCreated);
                progress_data[dateCreated] = 0;
                source_sender_data[dateCreated] = 0;
                return true;
            
            });    
            
            var source_data = progress_data;
            console.log('sourcesend print', source_sender_data);
            var source_recv_data = progress_data;
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
                // var ticketsStatus2 = ticket.getText({
                //     name: "custrecord_enquiry_status",
                //     summary: "GROUP",
                // });

                //console.log(ticketsStatus2 + " " + ticketsStatus);
                if (ticketsDate in source_data) {
                    source_data[ticketsDate] = source_data[ticketsDate] + parseInt(ticketsCount);                 
                } else {
                    source_data[ticketsDate] = parseInt(ticketsCount);                 

                }
                console.log('ticketsstatus', ticketsStatus);
                if (ticketsStatus == 1) {   //Sender
                    if (ticketsDate in source_sender_data) {
                        source_sender_data[ticketsDate] = source_sender_data[ticketsDate] + parseInt(ticketsCount);                 
                    } else {
                        source_sender_data[ticketsDate] = parseInt(ticketsCount);                 
    
                    }
                } else if (ticketsStatus == 4) {    //Receiver
                    if (ticketsDate in source_recv_data) {
                        source_recv_data[ticketsDate] = source_recv_data[ticketsDate] + parseInt(ticketsCount);                 
                    } else {
                        source_recv_data[ticketsDate] = parseInt(ticketsCount);                 
    
                    }
                }

                console.log('send', source_sender_data);
                console.log('recv', source_recv_data);
                return true;
            
            }); 

            var cnt_set_source_system = Object.values(source_data);
            var cnt_source1_send = Object.entries(source_sender_data);
            var cnt_source1_recv = Object.entries(source_recv_data);
            var source1_sendTotal = Object.values(source_sender_data).reduce(function(a, b){
                return a + b;
            }, 0);
            var source1_recvTotal = Object.values(source_recv_data).reduce(function(a, b){
                return a + b;
            }, 0);

            //Source 2
            var ticketSourceRes2 = search.load({
                type: 'customrecord_mp_ticket',
                id: 'customsearch_ticket_source_report_week_2'
            });

            ticketSourceRes2.run().each(function(ticket) {
                var ticketsCount = ticket.getValue({
                    name: 'name',
                    summary: 'COUNT'
                });
                cnt_set_source_system2.push(parseInt(ticketsCount));                
                return true;
            
            }); 


            overviewChart(date_set_created, cnt_set_created, cnt_set_source_system, cnt_set_source_system2, cnt_set_open, cnt_set_progress, cnt_set_closed);
            customerChart();
            staffChart(cnt_source1_recv, cnt_source1_send, source1_sendTotal, source1_recvTotal);
            sourceChart();
        }

        function overviewChart(date_set_created, cnt_set_created, cnt_set_source_system, cnt_set_source_system2, cnt_set_open, cnt_set_progress, cnt_set_closed ) {
            

            var colors = Highcharts.getOptions().colors;
            console.log("dates", date_set_created);
            Highcharts.chart('container', {
                chart: {
                    height: (6 / 16 * 100) + '%',
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
                        // point: {
                        //     events: {
                        //         click: function () {
                        //             window.location.href = this.series.options.website;
                        //         }
                        //     }
                        // },
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            align: 'right',
                            color: 'black',
                            x: -10
                        }
                    },
                    column: {
                        stacking: 'normal',
                        colorByPoint: false
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
                        name: 'Tickets Source- Website',
                        data: cnt_set_source_system,
                        color: colors[3],
                        type: 'column',
                        stack: 1,
                    },
                    {
                        name: 'Tickets Source- Non Website',
                        data: cnt_set_source_system2,
                        color: '#379E8F',
                        type: 'column',
                        stack: 1,
                    }, 
                    {
                        name: 'Open Tickets',
                        data: cnt_set_open,
                        //website: 'https://www.freedomscientific.com/Products/Blindness/JAWS',
                        dashStyle: 'ShortDashDot',
                        color: colors[4]
                    }, 
                    {
                        name: 'In Progress Tickets',
                        data: cnt_set_progress,
                        dashStyle: 'ShortDot',
                        color: colors[1],
                        type: 'spline'
                    }, 
                    {
                        name: 'Closed Tickets',
                        data: cnt_set_closed,
                        dashStyle: 'Dash',
                        color: colors[9],
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
            date_set_created.forEach(function(date, index) {
                tableDataSet.push(['Link', dateCreated2DateSelectedFormat(date), cnt_set_created[index], cnt_set_closed[index], cnt_set_progress[index], cnt_set_open[index], cnt_set_source_system[index], cnt_set_source_system2[index]]);
            });
             
            dataTable.rows.add(tableDataSet);
            dataTable.draw();

        }

        function customerChart() {
            var customer_set = [];
            var cust_count = [];
            var cust_zee = [];
            var cust_ids = [];
            var zee_set = {};
            var custSearch =  search.load({
                type: 'customrecord_mp_ticket',
                id: 'customsearch_ticket_customer_report_week'
            });


            custSearch.run().each(function(ticket) {
            
                var count = ticket.getValue({
                    name: "name",
                    summary: "COUNT",
                 });

                 var cust = ticket.getText({
                    name: "custrecord_customer1",
                    summary: "GROUP",
                 });
                 var zee = ticket.getText({
                    name: "custrecord_zee",
                    summary: "GROUP",
                 });
                 cust_ids.push (parseInt(ticket.getValue({ name: "custrecord_customer1", summary: "GROUP"})));
                 cust_zee.push(zee);
                 customer_set.push(cust);
                 cust_count.push(parseInt(count));
                 if (zee in zee_set) {
                     zee_set[zee] = zee_set[zee] + parseInt(count);
                 } else {
                    zee_set[zee] = parseInt(count);
                 }
                 return true;
            });

            Highcharts.chart('container2', {

                chart: {
                    type: 'bar',
                    height: (6 / 16 * 100) + '%',
                    zoomType: 'xy'
                },
                title: {
                    text: 'Number of Tickets per Customer'
                },
                xAxis: {
                    categories: customer_set,
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
                    valueSuffix: ' tickets'
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: [{
                    name: 'Total',
                    data: cust_count,
                    color: '#108372'
                }]
            });
            
            var dataTable = $('#tickets-customer').DataTable();
            dataTable.clear();
            var tableDataSet = [];
            customer_set.forEach(function(cust, index) {
                var cust_link = '<a href="https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + cust_ids[index] + '">' + cust + '</a>';

                tableDataSet.push(['Link', cust_link, cust_zee[index], cust_count[index]]);
            });
             
            dataTable.rows.add(tableDataSet);
            dataTable.draw();

            Highcharts.chart('container3', {

                chart: {
                    type: 'bar',
                    height: (6 / 16 * 100) + '%',
                    zoomType: 'xy'
                },
                title: {
                    text: 'Number of Tickets per Zee'
                },
                xAxis: {
                    categories: Object.keys(zee_set),
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
                    valueSuffix: ' tickets'
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: [{
                    name: 'Total',
                    data: cust_count,
                    color: '#108372'
                }]
            });
            
            var dataTable2 = $('#tickets-zee').DataTable();
            dataTable2.clear();
            var tableDataSet2 = [];
            for (var key in zee_set) {
                tableDataSet2.push(['Link', key, zee_set[key]]);
            }
        
            dataTable2.rows.add(tableDataSet2);
            dataTable2.draw();


        }

        function staffChart(cnt_source1_recv, cnt_source1_send, source1_sendTotal, source1_recvTotal) {
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
            staffSearch.run().each(function(ticket) {
                 var cnt = ticket.getValue({ name: "name", summary: "COUNT"});
                 var date = ticket.getValue({ name: "created", summary: "GROUP" });
                 var status = ticket.getValue({ name: "custrecord_ticket_status", summary: "GROUP" });
                 var owner = ticket.getValue({ name: "owner", summary: "GROUP"});

                 if (owner == 386344) {     // Jess
                     if (status == 1) {     // Open
                         jOpen += parseInt(cnt);
                         jOpenData.push([date, parseInt(cnt)]);
                     } else if (status == 3 || status == 9) {   // Closed or Closed-Lost
                        jClo += parseInt(cnt);
                        if (date in jCloData) {
                            jCloData[date] = jCloData[date] + parseInt(cnt);
                        } else {
                            jCloData[date] = parseInt(cnt);
                        }
                     } else {
                        jProg += parseInt(cnt);
                        if (date in jProgData) {
                            jProgData[date] = jProgData[date] + parseInt(cnt);
                        } else {
                            jProgData[date] = parseInt(cnt);
                        }
                     }
                 } else if (owner == 1565545) {     // Kaley
                    if (status == 1) {     // Open
                        kOpen += parseInt(cnt);
                        kOpenData.push([date, parseInt(cnt)]);
                    } else if (status == 3 || status == 9) {   // Closed or Closed-Lost
                        kClo += parseInt(cnt);
                        if (date in kCloData) {
                            kCloData[date] = kCloData[date] + parseInt(cnt);
                        } else {
                            kCloData[date] = parseInt(cnt);
                        }
                    } else {
                        kProg += parseInt(cnt);
                        if (date in kProgData) {
                            kProgData[date] = kProgData[date] + parseInt(cnt);
                        } else {
                            kProgData[date] = parseInt(cnt);
                        }
                    }
                }else if (owner == 1154991) {     // Gab
                    if (status == 1) {     // Open
                        gOpen += parseInt(cnt);
                        gOpenData.push([date, parseInt(cnt)]);
                    } else if (status == 3 || status == 9) {   // Closed or Closed-Lost
                        gClo += parseInt(cnt);
                        if (date in gCloData) {
                            gCloData[date] = gCloData[date] + parseInt(cnt);
                        } else {
                            gCloData[date] = parseInt(cnt);
                        }
                    } else {
                        gProg += parseInt(cnt);
                        if (date in gProgData) {
                            gProgData[date] = gProgData[date] + parseInt(cnt);
                        } else {
                            gProgData[date] = parseInt(cnt);
                        }
                    }
                }else {     // Other
                    if (status == 1) {     // Open
                        oOpen += parseInt(cnt);
                        oOpenData.push([date, parseInt(cnt)]);
                    } else if (status == 3 || status == 9) {   // Closed or Closed-Lost
                        oClo += parseInt(cnt);
                        if (date in oCloData) {
                            oCloData[date] = oCloData[date] + parseInt(cnt);
                        } else {
                            oCloData[date] = parseInt(cnt);
                        }
                    } else {
                        oProg += parseInt(cnt);
                        if (date in oProgData) {
                            oProgData[date] = oProgData[date] + parseInt(cnt);
                        } else {
                            oProgData[date] = parseInt(cnt);
                        }
                    }
                }
                return true;
            
            }); 

            console.log('jOpendata', jOpenData)

            var colors = Highcharts.getOptions().colors;
            $('#container4').highcharts({
                chart: {
                    height: (6 / 16 * 100) + '%',
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
                                            data: jOpenData
                                        },
                                        'Gab': {
                                            name: 'Open',
                                            color: '#F2C80F',
                                            data: gOpenData
                                        },
                                        'Kaley': {
                                            name: 'Open',
                                            color: '#F2C80F',
                                            data: kOpenData
                                        },
                                        'Other': {
                                            name: 'Open',
                                            color: '#F2C80F',
                                            data: oOpenData
                                        }
                                    },
                                    drilldowns2 = {
                                        'Jess': {
                                            name: 'Closed',
                                            color: '#108372',
                                            data: Object.entries(jCloData)
                                        },
                                        'Gab': {
                                            name: 'Closed',
                                            color: '#108372',
                                            data: Object.entries(gCloData)
                                        },
                                        'Kaley': {
                                            name: 'Closed',
                                            color: '#108372',
                                            data: Object.entries(kCloData)
                                        },
                                        'Other': {
                                            name: 'Closed',
                                            color: '#108372',
                                            data: Object.entries(oCloData)
                                        }
                                    },
                                    drilldowns3 = {
                                        'Jess': {
                                            name: 'In Progress',
                                            color: '#F15628',
                                            data: Object.entries(jProgData)
                                        },
                                        'Gab': {
                                            name: 'In Progress',
                                            color: '#F15628',
                                            data: Object.entries(gProgData)
                                        },
                                        'Kaley': {
                                            name: 'In Progress',
                                            color: '#F15628',
                                            data: Object.entries(kProgData)
                                        },
                                        'Other': {
                                            name: 'In Progress',
                                            color: '#F15628',
                                            data: Object.entries(oProgData)
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
                    text: 'Staff Breakdown'
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
                            style: { textShadow: false, fontWeight: 'bold' }
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
                    { name: 'Other', y: oClo, drilldown: true}]
                }],
        
                drilldown: {
                    series: []
                }
            });
             
            $('#container5').highcharts({
                chart: {
                    height: (6 / 16 * 100) + '%',
                    zoomType: 'xy',
                    type: 'column',
                    events: {
                        drilldown: function (e) {
                            if (!e.seriesOptions) {
        
                                var chart = this,
                                    drilldowns = {
                                        'Jess': {
                                            name: 'Sender',
                                            color: '#F2C80F',
                                            data: jOpenData
                                        },
                                        'Gab': {
                                            name: 'Sender',
                                            color: '#F2C80F',
                                            data: gOpenData
                                        },
                                        'Kaley': {
                                            name: 'Sender',
                                            color: '#F2C80F',
                                            data: kOpenData
                                        },
                                        'Other': {
                                            name: 'Sender',
                                            color: '#F2C80F',
                                            data: oOpenData
                                        },
                                        'Website': {
                                            name: 'Sender',
                                            color: '#F2C80F',
                                            data: cnt_source1_send
                                        }
                                        
                                    },
                                    drilldowns2 = {
                                        'Jess': {
                                            name: 'Receiver',
                                            color: '#108372',
                                            data: Object.entries(jCloData)
                                        },
                                        'Gab': {
                                            name: 'Receiver',
                                            color: '#108372',
                                            data: Object.entries(gCloData)
                                        },
                                        'Kaley': {
                                            name: 'Receiver',
                                            color: '#108372',
                                            data: Object.entries(kCloData)
                                        },
                                        'Other': {
                                            name: 'Receiver',
                                            color: '#108372',
                                            data: Object.entries(oCloData)
                                        },
                                        'Website': {
                                            name: 'Receiver',
                                            color: '#108372',
                                            data: cnt_source1_recv
                                        }
                                    },
                                    
                                    series = drilldowns[e.point.name],
                                    series2 = drilldowns2[e.point.name];
                                    chart.addSingleSeriesAsDrilldown(e.point, series); 
                                    chart.addSingleSeriesAsDrilldown(e.point, series2);
                                    chart.applyDrilldown();
        
                            }
        
                        }
                    }
                },
                title: {
                    text: 'Sender vs Receiver Breakdown'
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
                            style: { textShadow: false, fontWeight: 'bold' }
                        }
                    }
                },
        
                series: [{
                    name: 'Sender',
                    color: '#F2C80F',
                    data: [{ name: 'Jess', y: jOpen, drilldown: true}, 
                    { name: 'Gab', y: gOpen, drilldown: true},
                    { name: 'Kaley', y: kOpen, drilldown: true},
                    { name: 'Other', y: oOpen, drilldown: true},
                    { name: 'Website', y: source1_sendTotal, drilldown: true}]
                },{
                    name: 'Receiver',
                    color: '#108372',
                    data: [{ name: 'Jess', y: jClo, drilldown: true}, 
                    { name: 'Gab', y: gClo, drilldown: true },
                    { name: 'Kaley', y: kClo, drilldown: true},
                    { name: 'Other', y: oClo, drilldown: true},
                    { name: 'Website', y: source1_recvTotal, drilldown: true}]
                }],
        
                drilldown: {
                    series: []
                }
            });



        }

        function sourceChart() {
            var colors = Highcharts.getOptions().colors;
            var colors = Highcharts.getOptions().colors;
            
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