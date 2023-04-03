define(["qlik", "jquery", "./props", "./handler", "text!./qListObjectDef.json"
	, "text!./main.html", "text!./dyn-table.css"], function
	(qlik, $, props, handler, qListObjectDef, mainHtml, cssContent) {

	/*const fixHeight = function(ownId) {
		$(`#table-${ownId}`).height('calc(100% - ' + ($(`#btn-get-${ownId}`).height() - 3) + 'px)')
	}*/
	$('<style>').html(cssContent).appendTo('head');

	var qext;

	var dyntGlob = {  // Global object for this extension
		chart: null,
		categories: [], // array for category entries for dropdown 
		storage: [],
		friendlyFieldName: '',
		categoryFieldName: '',
		clickCheckboxEvents: false // flag if click events have already been registerd (1st paint vs following paints)
	};

	$.ajax({
		url: '../extensions/qs-ext-dyn-table2/qs-ext-dyn-table2.qext',
		dataType: 'json',
		async: false,  // wait for this call to finish.
		success: function (data) { qext = data; console.log('qext', qext); }
	});

	return {
		initialProperties: props.initialProperties,
		definition: props.definition(qext),
		support: props.support,

		resize: function ($element, layout) {
			const ownId = this.options.id;
			if (layout.pConsoleLog) console.log('resize method ', ownId, layout);
			//fixHeight(ownId);
			return qlik.Promise.resolve();
		},

		paint: function ($element, layout) {

			//add your rendering code here
			const ownId = this.options.id;
			if (layout.pConsoleLog) console.log('paint method ', ownId, layout);

			const app = qlik.currApp(this);
			const thisSheetId = qlik.navigation.getCurrentSheetId().sheetId;
			const enigma = app.model.enigmaModel;

			// dyntGlob.techFieldName = layout.qHyperCube.qDimensionInfo[0].qFallbackTitle;
			dyntGlob.friendlyFieldName = layout.qHyperCube.qMeasureInfo[0].qFallbackTitle;
			dyntGlob.categoryFieldName = layout.pCategoryField;

			html = mainHtml
				.replaceAll('{{ownId}}', ownId);

			dyntGlob.categories = [];
			layout.pCategoryDropdown.split('\n').forEach(e => dyntGlob.categories.push(e));
			if (layout.pConsoleLog) console.log('dyntGlob', dyntGlob);

			// draw the main html structure the first time 'paint' is called.
			if ($(`#parent-${ownId}`).length == 0) {
				$element.html(html);
				handler.showBusy(ownId);
				dyntGlob.table = document.getElementById(`dynt-table-${ownId}`);
				dyntGlob.tbody = dyntGlob.table.querySelector('tbody');

				dyntGlob.currRow = null;
				dyntGlob.dragElem = null;
				dyntGlob.mouseDownX = 0;
				dyntGlob.mouseDownY = 0;
				dyntGlob.mouseX = 0;
				dyntGlob.mouseY = 0;
				dyntGlob.mouseDrag = false;

				handler.bindMouse(dyntGlob, ownId);  // Drag+drop for Table Rows sorting

				handler.buttonGetTable(app, layout, ownId, dyntGlob);
				handler.buttonExportTable(app, layout, ownId, dyntGlob);
				handler.buttonSaveTable(app, layout, ownId, dyntGlob);
				handler.msgboxSave_btnOk(app, layout, ownId, dyntGlob);
				handler.msgboxSave_btnCancel(ownId);
				handler.buttonLoadTable(app, layout, ownId, dyntGlob);
				handler.msgboxLoad_btnOk(app, layout, ownId, dyntGlob);
				handler.msgboxLoad_btnCancel(ownId);
				handler.msgboxDelete_btnOk(ownId);
				handler.msgboxDelete_btnCancel(ownId);
				handler.clearFilter1(app, layout, ownId, dyntGlob);
				handler.clearSelection(app, layout, ownId, dyntGlob);
				handler.clearAllSelection(app, layout, ownId, dyntGlob);
				handler.selectAll(app, layout, ownId, dyntGlob);
				handler.categoryChange(app, layout, ownId, dyntGlob);
				handler.fn.dragDivider(ownId);
				handler.changeSortOrder(app, layout, ownId, dyntGlob);
				// handler.fn.updateTotalFields(ownId, layout.pFieldsCount, layout.pFieldsTotalCount);
				handler.clickTotalCounters(ownId);
				handler.minimizeLeft(ownId);
				handler.restoreLeft(ownId);

			} else {
				// object is already rendered, update only parts of it
				handler.showBusy(ownId);
				handler.fn.updateTotalFields(ownId, layout.pFieldsCount, layout.pFieldsTotalCount);
			}

			if (layout.pUseCategory) {
				$(`#categories-${ownId}`).show();
				handler.emptyCategories(dyntGlob, ownId);
				handler.addCategories(dyntGlob, ownId);
				handler.highlightCategory(dyntGlob, ownId, enigma);
			} else {
				$(`#categories-${ownId}`).hide();
			}

			$('.dynt-table th').css('background-color', layout.pColorHeaderBg);
			$(`#right-header-${ownId}`).css('background-color', layout.pColorHeaderBg);
			$('.dynt-left-footer').css('background-color', layout.pColorHeaderBg);

			if (dyntGlob.chart) {
				if ($(`#table-${ownId}`).html() == '') {
					handler.fn.showChartAndButtons(dyntGlob.chart, ownId);
				}
			}

			enigma.evaluate(`GetSelectedCount([${dyntGlob.friendlyFieldName}])`).then((res) => {
				if (res > 0) {
					$(`#clear-filter1-${ownId} span`).show();
				} else {
					$(`#clear-filter1-${ownId} span`).hide();
				}
			})

			// (re-)paint the checkboxes
			if (layout.qHyperCube.qDataPages) {
				//console.log('Hypercube', layout.qHyperCube);
				// $(`#tbody-${ownId}`).empty();

				// if a cached selection is found in localStorage
				var checkedCache = [];
				if (localStorage.getItem(`dyntable-cache-${ownId}`)) {
					checkedCache = JSON.parse(localStorage.getItem(`dyntable-cache-${ownId}`));
				}

				layout.qHyperCube.qDataPages[0].qMatrix.forEach((row) => {
					const field = row[0].qText;
					const label = row[1].qText;
					const isMeasure = row[2].qNum;
					const visible = row[3].qNum;
					const jqHandle = $(`[data-field="${btoa(field)}"]`);
					if (jqHandle.length > 0) {
						// Update label text
						jqHandle.find('.dynt-tablecol-label').text(label == '-' ? field : label)
						// Row is aready there, just update visibility
						if (visible) { jqHandle.show().removeClass('dynt-qlik-no').addClass('dynt-qlik-yes'); }
						if (!visible) { jqHandle.hide().removeClass('dynt-qlik-yes').addClass('dynt-qlik-no'); }
					} else {
						// add row to the table
						handler.fn.addTableRowHtml(layout, ownId, field, label == '-' ? field : label, isMeasure
							, visible, false, checkedCache.indexOf(field) > -1);
					}
				});
				handler.fn.updateTotalFields(ownId, layout.pFieldsCount, layout.pFieldsTotalCount);


				if (!dyntGlob.clickCheckboxEvents) {
					handler.chkboxClick(app, layout, ownId, dyntGlob);
					dyntGlob.clickCheckboxEvents = true;
				}
				// handler.hideBusy(ownId);
			}


			// draw filterbox if not yet there
			if ($(`#filter1-${ownId} .qv-object`).length == 0) {
				const field = dyntGlob.friendlyFieldName;
				const props = JSON.parse(qListObjectDef
					.replace('{{field}}', field)
					.replace('{{title}}',
						`=If(Len(GetFieldSelections([${field}])), GetFieldSelections([${field}]), '${layout.pSearchText}')`)
				);

				app.visualization.create('filterpane', [field], null).then((filterpane) => {
					filterpane.model.createChild(props).then(function () {
						filterpane.show(`filter1-${ownId}`);
					})
				});
			} else {
				// $(`#filter1-${ownId} .title-wrapper .title`).html(layout.pSearchText);
			}

			// load saved objects to list
			for (const obj in localStorage) {
				if (obj.indexOf('dyn-table-') == 0) {
					$(`#btn-load-${ownId}`).show();
				}
			}

			handler.hideBusy(ownId);
			//needed for export
			return qlik.Promise.resolve();
		}
	};

});

