/**
 *
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 *
 * Description:
 * @Last modified by:   ankithravindran
 *
 */


define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record',
    'N/http', 'N/log', 'N/redirect', 'N/format'
  ],
  function(ui, email, runtime, search, record, http, log, redirect, format) {
    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.envType == "SANDBOX") {
      baseURL = 'https://1048144-sb3.app.netsuite.com';
    }
    var zee = 0;
    var role = runtime.getCurrentUser().role;
    if (role == 1000) {
      //Franchisee
      zee = runtime.getCurrentUser().id;
    }

    function onRequest(context) {

      if (context.request.method === 'GET') {
        var inlineHtml =
          '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.16/css/jquery.dataTables.css"><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.16/js/jquery.dataTables.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://system.na2.netsuite.com/core/media/media.nl?id=2060797&c=1048';
        inlineHtml +=
          '144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><script src="https://cdn.datatables.net/searchpanes/1.2.1/js/dataTables.searchPanes.min.js"><script src="https://cdn.datatables.net/select/1.3.3/js/dataTables.select.min.js"></script><script src="https://code.highcharts.com/highcharts.js"></script><script src="https://code.highcharts.com/modules/data.js"></script><script src="https://code.highcharts.com/modules/exporting.js"></script><script src="https://code.highcharts.com/modules/accessibility.js"></script></script><script src="https://code.highcharts.com/highcharts.js"></script><script src="https://code.highcharts.com/modules/data.js"></script><script src="https://code.highcharts.com/modules/drilldown.js"></script><script src="https://code.highcharts.com/modules/exporting.js">';
        inlineHtml +=
          '</script><script src="https://code.highcharts.com/modules/export-data.js"></script><script src="https://code.highcharts.com/modules/accessibility.js"></script><style>.mandatory{color:red;} .body{background-color: #CFE0CE !important;}</style>';

        var form = ui.createForm({
          title: 'MP Ticketing - Weekly Reporting'
        });

        inlineHtml += dateFilterSection();
        inlineHtml += '<br></br><br></br>';
        inlineHtml += tabsSection();
        inlineHtml += '<div class="loader"></div>';
        inlineHtml +=
          '<style> .loader { border: 14px solid #f3f3f3; border-radius: 50%; border-top: 14px solid #379E8F; width: 90px; height: 90px; -webkit-animation: spin 2s linear infinite; /* Safari */ animation: spin 2s linear infinite;';
        inlineHtml += 'position: fixed; z-index: 1000; left: 50%; }'
          /* Safari */
        inlineHtml +=
          '@-webkit-keyframes spin {0% { -webkit-transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); } }';

        inlineHtml +=
          '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        inlineHtml += '</style>';

        form.addButton({
          id: 'submit',
          label: 'Submit Search'
        });

        var params = context.request.parameters.custparam_params;
        log.debug({
          title: 'Params',
          details: params
        });

        if (!isNullorEmpty(params)) {
          params = JSON.parse(params);
          log.debug({
            title: 'params.date_from',
            details: params.date_from
          });
          log.debug({
            title: 'params.date_to',
            details: params.date_to
          });
          if (!isNullorEmpty(params.date_from) && !isNullorEmpty(params.date_to)) {
            form.addField({
              id: 'custpage_date_from',
              type: ui.FieldType.TEXT,
              label: 'Selected ID'
            }).updateDisplayType({
              displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = params.date_from;
            form.addField({
              id: 'custpage_date_to',
              type: ui.FieldType.TEXT,
              label: 'Selected ID'
            }).updateDisplayType({
              displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = params.date_to;
          } else {
            form.addField({
              id: 'custpage_date_from',
              type: ui.FieldType.TEXT,
              label: 'Selected ID'
            }).updateDisplayType({
              displayType: ui.FieldDisplayType.HIDDEN
            });
            form.addField({
              id: 'custpage_date_to',
              type: ui.FieldType.TEXT,
              label: 'Selected ID'
            }).updateDisplayType({
              displayType: ui.FieldDisplayType.HIDDEN
            });
          }
        } else {
          form.addField({
            id: 'custpage_date_from',
            type: ui.FieldType.TEXT,
            label: 'Selected ID'
          }).updateDisplayType({
            displayType: ui.FieldDisplayType.HIDDEN
          });
          form.addField({
            id: 'custpage_date_to',
            type: ui.FieldType.TEXT,
            label: 'Selected ID'
          }).updateDisplayType({
            displayType: ui.FieldDisplayType.HIDDEN
          });
        }

        form.addField({
          id: 'preview_table',
          label: 'inlinehtml',
          type: 'inlinehtml'
        }).updateLayoutType({
          layoutType: ui.FieldLayoutType.STARTROW
        }).defaultValue = inlineHtml;

        form.clientScriptFileId = 4989483;

        context.response.writePage(form);

      } else {

      }
    }

    function line() {
      var inlineHtml =
        '<hr style="height:5px; width:100%; border-width:0; color:red; background-color:#fff">'

      return inlineHtml
    }

    function tabsSection() {
      var inlineQty = '<div >';

      // Tabs headers
      inlineQty +=
        '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #379E8F; color: #fff }';
      inlineQty +=
        '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #379E8F; color: #379E8F; }';
      inlineQty += '</style>';

      inlineQty +=
        '<div style="width: 95%; margin:auto; margin-bottom: 30px"><ul class="nav nav-pills nav-justified" style="margin:0%; ">';

      inlineQty +=
        '<li role="presentation" class="active"><a data-toggle="tab" href="#overview"><b>OVERVIEW</b></a></li>';
      inlineQty +=
        '<li role="presentation" class=""><a data-toggle="tab" href="#customer"><b>CUSTOMER</b></a></li>';
      inlineQty +=
        '<li role="presentation" class=""><a data-toggle="tab" href="#zee"><b>ZEE</b></a></li>';
      inlineQty +=
        '<li role="presentation" class=""><a data-toggle="tab" href="#barcodesourcebreakdown"><b>BARCODE SOURCE</b></a></li>';
      inlineQty +=
        '<li role="presentation" class=""><a data-toggle="tab" href="#issues"><b>ISSUES - BY BARCODE SOURCE</b></a></li>';
      inlineQty +=
        '<li role="presentation" class=""><a data-toggle="tab" href="#sourcebreakdown"><b>TICKET SOURCE </b></a></li>';



      inlineQty += '</ul></div>';

      // Tabs content
      inlineQty += '<div class="tab-content">';
      inlineQty +=
        '<div role="tabpanel" class="tab-pane active" id="overview">';
      inlineQty += '<figure class="highcharts-figure">';
      inlineQty += '<div id="container"></div>';
      //inlineQty += '<p class="highcharts-description">Line chart demonstrating some accessibility features of Highcharts. The chart displays the most commonly used screen readers in surveys taken by WebAIM from December 2010 to September 2019. JAWS was the most used screen reader until 2019, when NVDA took over. VoiceOver is the third most used screen reader, followed by Narrator. ZoomText/Fusion had a surge in 2015, but usage is otherwise low. The overall use of other screen readers has declined drastically the past few years.</p>';
      inlineQty += '</figure><br></br>';
      inlineQty += dataTable('preview');
      inlineQty += '</div>';

      inlineQty += '<div role="tabpanel" class="tab-pane" id="customer">';
      inlineQty += '<figure class="highcharts-figure">';
      inlineQty += '<div id="container2"></div>';
      inlineQty += '</figure><br></br>';
      inlineQty += dataTable('customer');
      inlineQty += '</div>';

      inlineQty += '<div role="tabpanel" class="tab-pane" id="zee">';
      inlineQty += '<figure class="highcharts-figure">';
      inlineQty += '<div id="container3"></div>';
      inlineQty += '</figure><br></br>';
      inlineQty += dataTable('zee');
      inlineQty += '</div>';

      inlineQty += '<div role="tabpanel" class="tab-pane" id="issues">';
      inlineQty += '<div >';
      inlineQty += line();
      // Tabs headers
      inlineQty +=
        '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #379E8F; color: #fff }';
      inlineQty +=
        '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #379E8F; color: #379E8F; }';
      inlineQty += '</style>';

      inlineQty +=
        '<div style="width: 95%; margin:auto; margin-bottom: 30px"><ul class="nav nav-pills nav-justified" style="margin:0%; ">';

      inlineQty +=
        '<li role="presentation" class="active"><a data-toggle="tab" href="#manual"><b>MANUAL BARCODES</b></a></li>';
      inlineQty +=
        '<li role="presentation" class=""><a data-toggle="tab" href="#shopify"><b>SHOPIFY BARCODES</b></a></li>';
      inlineQty +=
        '<li role="presentation" class=""><a data-toggle="tab" href="#portal"><b>CUSTOMER PORTAL BARCODES</b></a></li>';
      inlineQty +=
        '<li role="presentation" class=""><a data-toggle="tab" href="#bulk"><b>BULK BARCODES</b></a></li>';


      inlineQty += '</ul></div>';
      // Tabs content
      inlineQty += '<div class="tab-content">';
      inlineQty +=
        '<div role="tabpanel" class="tab-pane active" id="manual">';
      inlineQty += '<figure class="highcharts-figure">';
      inlineQty += '<div id="containerM"></div>';
      inlineQty += '</figure><br></br>';
      inlineQty += '</div>';

      inlineQty += '<div role="tabpanel" class="tab-pane" id="shopify">';
      inlineQty += '<figure class="highcharts-figure">';
      inlineQty += '<div id="containerS"></div>';
      inlineQty += '</figure><br></br>';
      inlineQty += '</div>';

      inlineQty += '<div role="tabpanel" class="tab-pane" id="portal">';
      inlineQty += '<figure class="highcharts-figure">';
      inlineQty += '<div id="containerP"></div>';
      inlineQty += '</figure><br></br>';
      inlineQty += '</div>';

      inlineQty +=
        '<div role="tabpanel" class="tab-pane" id="bulk">';
      inlineQty += '<figure class="highcharts-figure">';
      inlineQty += '<div id="containerB"></div>';
      inlineQty += '</figure><br></br>';
      inlineQty += '</div>';


      inlineQty += '</div></div>';
      inlineQty += '</div>';

      inlineQty +=
        '<div role="tabpanel" class="tab-pane" id="sourcebreakdown">';
      inlineQty += '<figure class="highcharts-figure">';
      inlineQty += '<div id="container5"></div>';
      inlineQty += '</figure><br></br>';
      //inlineQty += dataTablePreview('customer_zee');
      inlineQty += '</div>';

      inlineQty +=
        '<div role="tabpanel" class="tab-pane" id="barcodesourcebreakdown">';
      inlineQty += '<figure class="highcharts-figure">';
      // inlineQty += '<div id="button_issues_page"></div>'
      inlineQty += '<div id="container6"></div>';
      inlineQty += '</figure><br></br>';
      //inlineQty += dataTablePreview('customer_zee');
      inlineQty += '</div>';

      inlineQty += '</div></div>';

      return inlineQty;
    }

    function dataTable(name) {
      var inlineQty = '<style>table#tickets-' + name +
        ' {font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px; }table#tickets-' +
        name + ' th{text-align: center;} .bolded{font-weight: bold;}</style>';
      inlineQty += '<div style="width: 95%; margin: auto">';
      inlineQty += '<table id="tickets-' + name +
        '" class="table table-responsive table-striped customer tablesorter" style="width: 100%; table-layout: fixed">';
      inlineQty += '<thead style="color: white;background-color: #379E8F;">';
      inlineQty += '<tr class="text-center">';
      inlineQty += '</tr>';
      inlineQty += '</thead>';

      inlineQty += '<tbody id="result_tickets_' + name + '"></tbody>';

      inlineQty += '</table>';
      inlineQty += '</div>'
      return inlineQty;
    }

    /**
     * The date input fields to filter the invoices.
     * Even if the parameters `date_from` and `date_to` are defined, they can't be initiated in the HTML code.
     * They are initiated with jQuery in the `pageInit()` function.
     * @return  {String} `inlineHtml`
     */
    function dateFilterSection(start_date, last_date) {
      var inlineHtml =
        '<div class="form-group container date_filter_section">';
      inlineHtml += '<div class="row">';
      inlineHtml +=
        '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12" style="background-color: #103D39;">DATE FILTER</span></h4></div>';
      inlineHtml += '</div>';
      inlineHtml += '</div>';


      inlineHtml += periodDropdownSection(start_date, last_date);

      inlineHtml += '<div class="form-group container date_filter_section">';
      inlineHtml += '<div class="row">';
      // Date from field
      inlineHtml += '<div class="col-xs-6 date_from">';
      inlineHtml += '<div class="input-group">';
      inlineHtml +=
        '<span class="input-group-addon" id="date_from_text">From</span>';
      if (isNullorEmpty(start_date)) {
        inlineHtml +=
          '<input id="date_from" class="form-control date_from" type="date" />';
      } else {
        inlineHtml +=
          '<input id="date_from" class="form-control date_from" type="date" value="' +
          start_date + '"/>';
      }

      inlineHtml += '</div></div>';
      // Date to field
      inlineHtml += '<div class="col-xs-6 date_to">';
      inlineHtml += '<div class="input-group">';
      inlineHtml +=
        '<span class="input-group-addon" id="date_to_text">To</span>';
      if (isNullorEmpty(last_date)) {
        inlineHtml +=
          '<input id="date_to" class="form-control date_to" type="date">';
      } else {
        inlineHtml +=
          '<input id="date_to" class="form-control date_to" type="date" value="' +
          last_date + '">';
      }

      inlineHtml += '</div></div></div></div>';

      return inlineHtml;
    }

    /**
     * The period dropdown field.
     * @param   {String}    date_from
     * @param   {String}    date_to
     * @return  {String}    `inlineHtml`
     */
    function periodDropdownSection(date_from, date_to) {
      var selected_option = (isNullorEmpty(date_from) && isNullorEmpty(
        date_to)) ? 'selected' : '';
      var inlineHtml =
        '<div class="form-group container period_dropdown_section">';
      inlineHtml += '<div class="row">';
      // Period dropdown field
      inlineHtml += '<div class="col-xs-12 period_dropdown_div">';
      inlineHtml += '<div class="input-group">';
      inlineHtml +=
        '<span class="input-group-addon" id="period_dropdown_text">Period</span>';
      inlineHtml += '<select id="period_dropdown" class="form-control">';
      if (selected_option == '') {
        inlineHtml += '<option selected></option>';
        inlineHtml += '<option value="this_week">This Week</option>';
        inlineHtml += '<option value="last_week">Last Week</option>';
        inlineHtml += '<option value="this_month" >This Month</option>';
        inlineHtml += '<option value="last_month" >Last Month</option>';
      } else {
        inlineHtml += '<option selected></option>';
        inlineHtml += '<option value="this_week">This Week</option>';
        inlineHtml += '<option value="last_week">Last Week</option>';
        inlineHtml += '<option value="this_month">This Month</option>';
        inlineHtml += '<option value="last_month" >Last Month</option>';
      }

      inlineHtml += '<option value="full_year">Full Year (1 Jan -)</option>';
      inlineHtml +=
        '<option value="financial_year">Financial Year (1 Jul -)</option>';
      inlineHtml += '</select>';
      inlineHtml += '</div></div></div></div>';

      return inlineHtml;
    }

    function isNullorEmpty(strVal) {
      return (strVal == null || strVal == '' || strVal == 'null' || strVal ==
        undefined || strVal == 'undefined' || strVal == '- None -');
    }

    return {
      onRequest: onRequest
    };

  });
