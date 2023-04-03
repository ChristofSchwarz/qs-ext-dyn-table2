// JavaScript
define(["jquery", "./tableProps"], function
	($, tableProps) {

	// =================================================================================================
	// Internal Functions
	// =================================================================================================

	const fn = {

		updateTotalFields: function (ownId, count, totalCount) {

			$(`#selected-fields-${ownId}`).text($(`#tbody-${ownId} tr:visible input:checked`).length);
			$(`#count-fields-${ownId}`).text(count);

			$(`#totalselected-fields-${ownId}`).text($(`#tbody-${ownId} tr input:checked`).length);
			$(`#totalcount-fields-${ownId}`).text(totalCount);

			// cache selected fields to localStorage
			// get a list of all selected fields
			var checkedCache = [];
			$(`#tbody-${ownId} tr`)
			.filter((i, e) => { return $(e).find('input').prop('checked') })
			.each((i, e) => { checkedCache.push(atob($(e).data('field'))) });
			localStorage.setItem(`dyntable-cache-${ownId}`, JSON.stringify(checkedCache));
		},

		addDraggableRow: function (target, dyntGlob) {

			dyntGlob.dragElem = target.cloneNode(true);
			dyntGlob.dragElem.classList.add('draggable-table__drag');
			dyntGlob.dragElem.style.height = fn.getStyle(target, 'height');  // <--
			dyntGlob.dragElem.style.background = fn.getStyle(target, 'backgroundColor');
			for (var i = 0; i < target.children.length; i++) {
				const oldTD = target.children[i];
				const newTD = dyntGlob.dragElem.children[i];
				newTD.style.width = fn.getStyle(oldTD, 'width'); // <--
				newTD.style.height = fn.getStyle(oldTD, 'height'); // <--
				newTD.style.padding = fn.getStyle(oldTD, 'padding'); // <--
				newTD.style.margin = fn.getStyle(oldTD, 'margin'); // <--
			}

			dyntGlob.tbody.appendChild(dyntGlob.dragElem);


			const tPos = target.getBoundingClientRect();
			const dPos = dyntGlob.dragElem.getBoundingClientRect();
			console.log('bottom', ((dPos.y - tPos.y) - tPos.height) + "px");
			dyntGlob.dragElem.style.top = ($(dyntGlob.tbody).position().top + $(target).position().top) + "px";
			// dyntGlob.dragElem.style.bottom = ((dPos.y - tPos.y) - tPos.height) + "px";
			dyntGlob.dragElem.style.left = "-1px";

			document.dispatchEvent(new MouseEvent('mousemove',
				{ view: window, cancelable: true, bubbles: true }
			));
		},

		getMouseCoords: function (event) {
			return {
				x: event.clientX,
				y: event.clientY
			};
		},

		moveRow: function (x, y, ownId, dyntGlob) {

			dyntGlob.dragElem.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";

			const dPos = dyntGlob.dragElem.getBoundingClientRect();
			const currStartY = dPos.y, currEndY = currStartY + dPos.height;
			const rows = fn.getRows(ownId, dyntGlob);  // <--

			for (var i = 0; i < rows.length; i++) {
				const rowElem = rows[i];
				const rowSize = rowElem.getBoundingClientRect();
				const rowStartY = rowSize.y, rowEndY = rowStartY + rowSize.height;

				if (dyntGlob.currRow !== rowElem
					&& fn.isIntersecting(currStartY, currEndY, rowStartY, rowEndY)) { // <--
					if (Math.abs(currStartY - rowStartY) < rowSize.height / 2)
						fn.swapRow(rowElem, i, dyntGlob);  // <--
				}
			}
		},

		isIntersecting: function (min0, max0, min1, max1) {
			return Math.max(min0, max0) >= Math.min(min1, max1) &&
				Math.min(min0, max0) <= Math.max(min1, max1);
		},

		swapRow: function (row, index, dyntGlob) {
			let currIndex = Array.from(dyntGlob.tbody.children).indexOf(dyntGlob.currRow),
				row1 = currIndex > index ? dyntGlob.currRow : row,
				row2 = currIndex > index ? row : dyntGlob.currRow;

			dyntGlob.tbody.insertBefore(row1, row2);
		},

		getRows: function (ownId, dyntGlob) {
			return dyntGlob.table.querySelectorAll(`#tbody-${ownId} tr`);
		},

		getTargetRow: function (target) {
			// returns the closest tr (table-row) from where the user clicked.
			// Here we only check for the a-tag to the left
			const elemName = target.tagName.toLowerCase();
			if (elemName == 'a') return target.closest('tr');
			// if (elemName == 'tr') {
			// 	return target;
			// } else {
			// 	return target.closest('tr');
			// }
		},

		drawTable: function (simpleObj, app, ownId, dyntGlob) {

			console.log('fn.DrawTable', simpleObj);
			// simple object is like this {dims: [], reverseSort: [], interColumnSortOrder: [], columnWidths: []};
			var props = tableProps.newTable();

			if (simpleObj.dims) {
				simpleObj.dims.forEach((dim, i) => {
					const label = $(`[data-field="${btoa(dim)}"] .dynt-tablecol-label`).text();
					//const label = dyntGlob.lookup[dim] || dim;
					props.qHyperCubeDef.qDimensions.push(tableProps.newDimension(dim, label));
					if (simpleObj.dimsReverseSort) {
						props.qHyperCubeDef.qDimensions[i].qDef.qReverseSort = simpleObj.dimsReverseSort[i] || false
					}
				})
			}
			if (simpleObj.measures) {
				simpleObj.measures.forEach((measure, i) => {
					const label = $(`[data-field="${btoa(measure)}"] .dynt-tablecol-label`).text();
					// const label = dyntGlob.lookup[measure] || measure;
					props.qHyperCubeDef.qMeasures.push(tableProps.newMeasure(
						(measure.indexOf('--') == 0) ? ('$(' + measure.substr(2) + ')') : measure
						, label)
					);
					if (simpleObj.measuresReverseSort) {
						props.qHyperCubeDef.qMeasures[i].qDef.qReverseSort = simpleObj.measuresReverseSort[i] || false
					}
				})
			}
			// hardcoded adding one measure
			//props.qHyperCubeDef.qMeasures.push(tableProps.newMeasure('Count(_DocVersNr)', 'Counter'));

			if (simpleObj.qColumnOrder) props.qHyperCubeDef.columnOrder = simpleObj.qColumnOrder;
			if (simpleObj.qColumnOrder) props.qHyperCubeDef.qColumnOrder = simpleObj.qColumnOrder;
			//if (simpleObj.interColumnSortOrder) props.qHyperCubeDef.qEffectiveInterColumnSortOrder = simpleObj.interColumnSortOrder;
			if (simpleObj.interColumnSortOrder) props.qHyperCubeDef.qInterColumnSortOrder = simpleObj.interColumnSortOrder;
			if (simpleObj.columnWidths) props.qHyperCubeDef.columnWidths = simpleObj.columnWidths;

			app.visualization.create('table', null, props).then((chart) => {
				if (dyntGlob.chart) {
					dyntGlob.chart.close();
					console.log('removed previous chart object');
				}
				dyntGlob.chart = chart;
				fn.showChartAndButtons(chart, ownId);

			})
				.catch((err) => {
					console.error(err);
				})

		},

		getStyle: function (target, styleName) {
			let compStyle = getComputedStyle(target),
				style = compStyle[styleName];

			return style ? style : null;
		},

		showChartAndButtons: function (chart, ownId) {
			chart.show(`table-${ownId}`);
			$(`#btn-export-${ownId}`).show();
			$(`#btn-save-${ownId}`).show();
		},

		getDim_qFieldDefs: function (dimArray) {
			var ret = [];
			dimArray.forEach((dimension) => {
				ret.push(dimension.qDef.qFieldDefs[0]);
			});
			return ret;
		},

		// getDim_qGroupFieldDefs: function (dimArray) {
		// 	var ret = [];
		// 	dimArray.forEach((dimension) => {
		// 		ret.push(dimension.qGroupFieldDefs[0]);
		// 	});
		// 	return ret;
		// },

		getMeasure_qDef: function (measureArray) {
			var ret = [];
			measureArray.forEach((measure) => {
				var measureName = measure.qDef.qDef;
				if (measureName.match(/^\$\(.*\)$/)) {
					// if measure is like "$(*)" then remove "$(" and ")"
					measureName = '--' + measureName.substr(2, measureName.length - 3);
				}
				ret.push(measureName);
			});
			return ret;
		},

		// getMeasure_qFallbackTitle: function (measureArray) {
		// 	var ret = [];
		// 	measureArray.forEach((measure) => {
		// 		ret.push(measure.qFallbackTitle);
		// 	});
		// 	return ret;
		// },

		getDim_qReverseSort: function (dimArray) {
			var ret = [];
			dimArray.forEach((dimension) => {
				ret.push(dimension.qReverseSort ? true : false);
			});
			return ret;
		},

		// getMeasure_qReverseSort: function (measureArray) {
		// 	var ret = [];
		// 	measureArray.forEach((measure) => {
		// 		ret.push(measure.qReverseSort ? true : false);
		// 	});
		// 	return ret;
		// },

		clickCol2ClickCol1: function (rowSelector, ownId, layout) {
			$(`${rowSelector} .dynt-table-body-col2`).click(elem => {
				$(elem.target).closest('tr').find('input').prop('checked',
					!$(elem.target).closest('tr').find('input').prop('checked'));
				fn.updateTotalFields(ownId, layout.pFieldsCount, layout.pFieldsTotalCount);
			})
		},

		addTableRowHtml: function (layout, ownId, field, label, isMeasure, visible, unknown = false, checked = false) {
			$(`#tbody-${ownId}`).append(
				`<tr class="${visible ? 'dynt-qlik-yes' : 'dynt-qlik-no'}${unknown ? ' dynt-unknown-field' : ''}" 
					data-field="${btoa(field)}" 
					data-measure="${isMeasure}" 
					${visible ? '' : 'style="display:none;"'}">
					<!-- ${field} -->
					<td>
						<a class="lui-icon  lui-icon--small  lui-icon--draggable"></a>
						<input type="checkbox"${checked ? ' checked' : ''}/>
					</td>
					<td class="dynt-table-body-col2">
						<span class="dynt-tablecol-label">${label}</span>
						${isMeasure ? '<span class="dynt-measure-tag">Measure</span>' : ''}
					</td>
				</tr>`);
			fn.clickCol2ClickCol1(`[data-field="${btoa(field)}"]`, ownId, layout);
		},

		dragDivider: function (ownId) {

			var drag = {};
			$(`#resizer-${ownId}`).on('mousedown', (e) => {
				//drag.ownId = ownId;
				drag.startX = e.clientX;
				drag.startWidth = $(`#left-${ownId}`).width();
				document.documentElement.addEventListener('mousemove', doDrag, false);
				document.documentElement.addEventListener('mouseup', stopDrag, false);
			});

			function doDrag(e) {
				$(`#left-${ownId}`).width(
					(drag.startWidth + e.clientX - drag.startX) + 'px');
				$(`#right-${ownId}`).width(
					($(`#parent-${ownId}`).width()
						- $(`#left-${ownId}`).width()) + 'px');
			}

			function stopDrag(e) {
				document.documentElement.removeEventListener('mousemove', doDrag, false);
				document.documentElement.removeEventListener('mouseup', stopDrag, false);
			}
		},
	}

	// =================================================================================================
	// Exported Functions
	// =================================================================================================

	return {

		fn: fn,  // expose all functions under fn object 

		buttonGetTable: function (app, layout, ownId, dyntGlob) {

			// Handle Get-Table button
			$(`#btn-get-${ownId}`).click(() => {
				var tmpSimpleObj = {
					dims: [],
					measures: [],
					qColumnOrder: []
				};

				// first add all dims
				$(`#tbody-${ownId} tr`)
					.filter((i, e) => { return $(e).find('input').prop('checked') })
					.each((i, e) => {
						if ($(e).data('measure') == 0) {
							// this row is a dimension
							tmpSimpleObj.dims.push(atob($(e).data('field')))
						};
					});

				var measurePos = tmpSimpleObj.dims.length;
				var dimPos = 0;
				// then add all measures, also build the qColumnOrder now;

				$(`#tbody-${ownId} tr`)
					.filter((i, e) => { return $(e).find('input').prop('checked') })
					.each((i, e) => {
						if ($(e).data('measure') != 0) {
							// this row is a measure
							tmpSimpleObj.measures.push(atob($(e).data('field')))
							tmpSimpleObj.qColumnOrder.push(measurePos);
							measurePos++;
						} else {
							tmpSimpleObj.qColumnOrder.push(dimPos);
							dimPos++;
						};
					});

				// trigger select "*" in category field
				// $(`#categories-${ownId} select`).val('*').change();

				// trigger click on total-select counter so that only those will show
				$(`#totalselected-fields-${ownId}`).click();

				fn.drawTable(tmpSimpleObj, app, ownId, dyntGlob);

			})
		},


		buttonExportTable: function (app, layout, ownId, dyntGlob) {

			// handle "Export table" button
			$(`#btn-export-${ownId}`).click(() => {
				// https://help.qlik.com/en-US/sense-developer/August2022/Subsystems/EngineJSONAPI/Content/service-genericobject-exportdata.htm

				dyntGlob.chart.exportData({ qFileType: 'OOXML' }).then((url) => {
					var link = document.createElement('a');
					link.href = url;
					//link.download = "file_" + new Date() + ".pdf";
					link.click();
					link.remove();
				})
					.catch((err) => {
						console.error('Error with chart.exportData method');
						console.error(err);
					})
			});

		},

		buttonSaveTable: function (app, layout, ownId, dyntGlob) {

			// handle "Save table" button
			$(`#btn-save-${ownId}`).click(() => {
				$(`#msgbox-save-${ownId}`).show();

				var saveObj = {
					dims: [],
					dimsReverseSort: [],
					measures: [],
					measuresReverseSort: [],
					qColumnOrder: [],
					interColumnSortOrder: [],
					columnWidths: []
				}

				// console.log(dyntGlob.chart.model.layout);
				const layoutHyperCube = dyntGlob.chart.model.layout.qHyperCube;

				saveObj.dimsReverseSort = fn.getDim_qReverseSort(layoutHyperCube.qDimensionInfo);
				saveObj.measuresReverseSort = fn.getDim_qReverseSort(layoutHyperCube.qMeasureInfo);

				dyntGlob.chart.model.getEffectiveProperties().then(props => {

					saveObj.qColumnOrder = JSON.parse(JSON.stringify(props.qHyperCubeDef.qColumnOrder));
					saveObj.interColumnSortOrder = JSON.parse(JSON.stringify(props.qHyperCubeDef.qInterColumnSortOrder));
					saveObj.dims = fn.getDim_qFieldDefs(props.qHyperCubeDef.qDimensions);
					saveObj.measures = fn.getMeasure_qDef(props.qHyperCubeDef.qMeasures);

					console.log('saveObj', saveObj);
					dyntGlob.save = saveObj;
				})
			});
		},

		msgboxSave_btnOk: function (app, layout, ownId, dyntGlob) {
			$(`#msgbox-save-btn-ok-${ownId}`).click(() => {
				const name = $(`#save-name-${ownId}`).val();
				if (name) {
					localStorage.setItem(`dyn-table-${name}`, JSON.stringify(dyntGlob.save));
					$(`#msgbox-save-${ownId}`).hide();
				}
			});
		},

		msgboxSave_btnCancel: function (ownId) {
			$(`#msgbox-save-btn-cancel-${ownId}`).click(() => {
				$(`#msgbox-save-${ownId}`).hide();
			});
		},

		clearFilter1: function (app, layout, ownId, dyntGlob) {
			$(`#clear-filter1-${ownId}`).click(() => {
				app.field(dyntGlob.friendlyFieldName).clear();
			})
		},

		clearSelection: function (app, layout, ownId, dyntGlob) {
			$(`#clear-sel-${ownId}`).click(() => {
				$(`#tbody-${ownId} tr:visible input`).prop('checked', false);
				// dyntGlob.sel = [];
				fn.updateTotalFields(ownId, layout.pFieldsCount, layout.pFieldsTotalCount);
				// $(`#selected-fields-${ownId}`).text(dyntGlob.sel.length);
			})
		},

		clearAllSelection: function (app, layout, ownId, dyntGlob) {
			$(`#clearall-sel-${ownId}`).click(() => {
				$(`#tbody-${ownId} input`).prop('checked', false);
				// dyntGlob.sel = [];
				fn.updateTotalFields(ownId, layout.pFieldsCount, layout.pFieldsTotalCount);
				// $(`#selected-fields-${ownId}`).text(dyntGlob.sel.length);
			})
		},

		selectAll: function (app, layout, ownId, dyntGlob) {
			$(`#sel-all-${ownId}`).click(() => {
				// only the visible checkboxes are clicked
				$(`#tbody-${ownId} tr:visible input`).prop('checked', true); 
				//trigger('click');
				fn.updateTotalFields(ownId, layout.pFieldsCount, layout.pFieldsTotalCount);
			});
		},

		categoryChange: function (app, layout, ownId, dyntGlob) {
			$(`#categories-${ownId} select`).change((e) => {
				const selVal = $(e.target).find(":selected").val();
				if (layout.pConsoleLog) console.log(`Filter [${dyntGlob.categoryFieldName}] to "${selVal}"`);
				app.field(dyntGlob.categoryFieldName).selectValues([selVal], false, true);
			})
		},

		chkboxClick: function (app, layout, ownId, dyntGlob) {
			$(`#tbody-${ownId} input`).click(() => {
				fn.updateTotalFields(ownId, layout.pFieldsCount, layout.pFieldsTotalCount);
			});
		},

		clickTotalCounters: function (ownId) {
			$(`#selected-fields-${ownId}`).click(() => {
				//$(`#tbody-${ownId} tr.dynt-qlik-yes input:checked`).length
				if ($(`#tbody-${ownId} tr.dynt-qlik-yes input:checked`).length > 0) {
					$(`#tbody-${ownId} tr.dynt-qlik-yes input:checked`).closest('tr').addClass('dynt-remember');
					$(`#tbody-${ownId} tr`).not('.dynt-remember').hide();
					$(`#tbody-${ownId} tr.dynt-remember`).show().removeClass('dynt-remember');
				}
			})
			$(`#count-fields-${ownId}`).click(() => {
				$(`#tbody-${ownId} tr.dynt-qlik-no`).hide();
				$(`#tbody-${ownId} tr.dynt-qlik-yes`).show();
			})
			$(`#totalselected-fields-${ownId}`).click(() => {
				if ($(`#tbody-${ownId} tr input:checked`).length > 0) {
					$(`#tbody-${ownId} tr input:checked`).closest('tr').addClass('dynt-remember');
					$(`#tbody-${ownId} tr`).not('.dynt-remember').hide();
					$(`#tbody-${ownId} tr.dynt-remember`).show().removeClass('dynt-remember');
				}
			})
			$(`#totalcount-fields-${ownId}`).click(() => {
				$(`#tbody-${ownId} tr`).show();
			})
		},


		buttonLoadTable: function (app, layout, ownId, dyntGlob) {

			// handle "Load table" button
			$(`#btn-load-${ownId}`).click(() => {
				$(`#saved-list-${ownId}`).empty();
				$(`#msgbox-load-${ownId}`).show();
				for (const obj in localStorage) {
					if (obj.indexOf('dyn-table-') == 0) {
						const name = obj.substr(10);
						$(`#saved-list-${ownId}`).append(`
								<option>${name}</option>`);
					}
				}
			});
			$(`#icon-delete-${ownId}`).click(() => {
				//console.warn('deleting');
				$(`#msgbox-load-${ownId}`).hide();
				const name = $(`#saved-list-${ownId} :selected`).text();
				$(`#txt-delete-${ownId}`).text(name);
				$(`#msgbox-delete-${ownId}`).show();
			});
		},

		msgboxDelete_btnOk: function (ownId) {
			$(`#msgbox-delete-btn-ok-${ownId}`).click(() => {
				$(`#msgbox-delete-${ownId}`).hide();
				const name = $(`#saved-list-${ownId} :selected`).text();
				$(`#saved-list-${ownId} :selected`).remove();
				localStorage.removeItem(`dyn-table-${name}`);
				$(`#msgbox-load-${ownId}`).show();
			});
		},

		msgboxDelete_btnCancel: function (ownId) {
			$(`#msgbox-delete-btn-cancel-${ownId}`).click(() => {
				$(`#msgbox-delete-${ownId}`).hide();
				$(`#msgbox-load-${ownId}`).show();
			});
		},

		msgboxLoad_btnOk: function (app, layout, ownId, dyntGlob) {
			// OK Button in the pop-up dialog of loading a previously saved object definition
			$(`#msgbox-load-btn-ok-${ownId}`).click(() => {
				const name = $(`#saved-list-${ownId} :selected`).text();
				$(`#save-name-${ownId}`).val(name);
				const simpleObj = JSON.parse(localStorage.getItem(`dyn-table-${name}`));
				console.log('Loading this table', simpleObj);

				fn.drawTable(simpleObj, app, ownId, dyntGlob);
				$(`#msgbox-load-${ownId}`).hide();

				// deselect all checkboxes in the left panel 
				$(`#tbody-${ownId} input`).prop('checked', false);
				//dyntGlob.sel = simpleObj.dims.concat(simpleObj.measures);
				dyntGlob.sel = [];
				const measuresStartAtCol = simpleObj.dims.length;
				// add the dims and measures to .sel object in the right sequence and select the corresponding checkbox

				var jqHandles = [];
				for (const colId of simpleObj.qColumnOrder) {
					var jqRowHandle;
					var info = {};
					if (colId < measuresStartAtCol) {
						info.type = 'dim';
						info.name = simpleObj.dims[colId];
					} else {
						info.type = 'measure';
						info.name = simpleObj.measures[colId - measuresStartAtCol];
					}

					jqRowHandle = $(`#tbody-${ownId} [data-field="${btoa(info.name)}"]`);
					if (jqRowHandle.length) {
						// the saved dim or measure is found in the DOM
						jqRowHandle.find('input').prop('checked', true);
						jqRowHandle.show();
						jqHandles.push(jqRowHandle);
					} else {
						// the saved dim or measure is not in the list anymore.
						console.warn(`This ${info.type} from saved definition is not found anymore: ${info.name}`);
						// add the row to the html table
						fn.addTableRowHtml(layout, ownId, info.name, info.name, info.type == 'measure', true, true, true);
						jqRowHandle = $(`#tbody-${ownId} [data-field="${btoa(info.name)}"]`);
						jqHandles.push(jqRowHandle);
					}
				}
				// sort the selected rows to top of tbody
				for (var i = jqHandles.length; i > 0; i--) {
					jqHandles[i - 1].prependTo(`#tbody-${ownId}`);
				}
				// trigger click on total-select counter so that only those will show
				$(`#totalselected-fields-${ownId}`).click();
				fn.updateTotalFields(ownId, layout.pFieldsCount, layout.pFieldsTotalCount);

			});
		},

		msgboxLoad_btnCancel: function (ownId) {
			$(`#msgbox-load-btn-cancel-${ownId}`).click(() => {
				$(`#msgbox-load-${ownId}`).hide();
			});
		},

		// showChartAndButtons: function (chart, ownId) {
		// 	fn.showChartAndButtons(chart, ownId)
		// },

		showBusy: function (ownId) {
			$(`#parent-${ownId} .dynt-busy`).show();
			// while(!$(`#parent-${ownId} .dynt-busy`).is(':visible')) {}
		},

		hideBusy: function (ownId) {
			$(`#parent-${ownId} .dynt-busy`).hide();
		},

		changeSortOrder: function (app, layout, ownId, dyntGlob) {

			var alphabeticallyOrderedDivs;

			$(`#sort-1-${ownId} .lui-icon`).click((e) => {
				$(".dynt-sorticon .lui-icon").css('background-color', '');
				const alphabeticallyOrderedDivs = $('[data-field]').sort(function (a, b) {
					return String.prototype.localeCompare.call(
						$(b).find('input').is(':checked')
						, $(a).find('input').is(':checked')
					);

				});
				$(`#tbody-${ownId}`).empty().append(alphabeticallyOrderedDivs);
				$(`#tbody-${ownId}`).get(0).scrollIntoView();
			});

			$(`#sort-2-${ownId} .lui-icon`).click((e) => {
				alphabeticallyOrderedDivs = $('[data-field]').sort(function (a, b) {
					return String.prototype.localeCompare.call(
						$(b).find('.dynt-tablecol-label').text()
						, $(a).find('.dynt-tablecol-label').text()
					);
				});

				$(`#tbody-${ownId}`).empty().append(alphabeticallyOrderedDivs);
			});
			$(`#sort-3-${ownId} .lui-icon`).click((e) => {
				alphabeticallyOrderedDivs = $('[data-field]').sort(function (a, b) {
					return String.prototype.localeCompare.call(
						$(a).find('.dynt-tablecol-label').text()
						, $(b).find('.dynt-tablecol-label').text()
					);
				});

				$(`#tbody-${ownId}`).empty().append(alphabeticallyOrderedDivs);
			});
		},

		emptyCategories: function (dyntGlob, ownId) {
			$(`#categories-${ownId} select`).empty();
		},

		addCategories: function (dyntGlob, ownId) {
			dyntGlob.categories.forEach((category, i) => {
				//console.log(i, category);
				// check if entry is already in the options list before appending 
				if ($(`#categories-${ownId} select [value="${category.replaceAll('\\', '\\\\')}"]`).length == 0) {
					$(`#categories-${ownId} select`).append(`
						<option value="${category}" class="fieldvalue" >${category}</option>`);
				}
			});
			$(`#categories-${ownId} option`)
			// sort categories
			const sorted1 = $(`#categories-${ownId} option`).sort(function (a, b) {
				return String.prototype.localeCompare.call(
					$(a).text(),
					$(b).text()
				);
			});
			$(`#categories-${ownId} select`).empty()
			.append('<option value="*">*</option>')
			.append(sorted1);
		},

		highlightCategory: function (dyntGlob, ownId, enigma) {
			// select the right option (if any)
			enigma.evaluate(`Replace(GetFieldSelections([${dyntGlob.categoryFieldName}], '","', 100), '\\', '\\\\')`)
				.then(res => {
					var currVal;
					if (res == '-') {
						currVal = ['*'];
					} else {
						currVal = JSON.parse('["' + res + '"]');
					}
					//console.log('selected category is:', currVal);
					$(`#categories-${ownId} [value="${currVal[0].replaceAll('\\', '\\\\')}"]`).prop('selected', true);
				});
		},

		// updateTotalFields: function (ownId, count, totalCount) {
		// 	updateTotalFields(ownId, count, totalCount)
		// },

		bindMouse: function (dyntGlob, ownId) {

			document.addEventListener('mousedown', (event) => {
				if (event.button != 0) return true;

				const target = fn.getTargetRow(event.target); // <--
				if (target) {
					dyntGlob.currRow = target;
					fn.addDraggableRow(target, dyntGlob); // <--
					dyntGlob.currRow.classList.add('is-dragging');


					const coords = fn.getMouseCoords(event); // <--
					dyntGlob.mouseDownX = coords.x;
					dyntGlob.mouseDownY = coords.y;
					// because of vertical scrollbar add some offset
					//const offset1 = $($(`#dynt-table-${ownId} [data-field]:visible`)[0]).offset(); 
					const offset1 = $(`#left-${ownId}`).offset();
					// position of first visible row, this can be 
					const offset2 = $(`#dynt-table-${ownId} thead tr`).offset()  // position of tablehead
					dyntGlob.mouseDownY += offset1.top - offset2.top + 20;
					// console.log('offsets', offset1.top, offset2.top);
					// console.log('mousedownXY', dyntGlob.mouseDownX, dyntGlob.mouseDownY);
					dyntGlob.mouseDrag = true;
				}
			});

			document.addEventListener('mousemove', (event) => {
				if (!dyntGlob.mouseDrag) return;

				const coords = fn.getMouseCoords(event); // <--
				dyntGlob.mouseX = 0; //coords.x - dyntGlob.mouseDownX;
				dyntGlob.mouseY = coords.y - dyntGlob.mouseDownY;

				fn.moveRow(dyntGlob.mouseX, dyntGlob.mouseY, ownId, dyntGlob); // <--
			});

			document.addEventListener('mouseup', (event) => {
				if (!dyntGlob.mouseDrag) return;

				dyntGlob.currRow.classList.remove('is-dragging');
				$(`#dynt-table-${ownId} .draggable-table__drag`).remove();
				// dyntGlob.tbody.removeChild(dyntGlob.dragElem);

				dyntGlob.dragElem = null;
				dyntGlob.mouseDrag = false;
			});
		},

		minimizeLeft: function (ownId) {
			// hide the left panel and disable the drag divider 
			$(`#minimize-${ownId}`).click(()=>{
				$(`#left-${ownId}`).fadeOut();
				$(`#minimize-${ownId}`).hide();
				$(`#restore-${ownId}`).show();	
				$(`#right-${ownId}`).css('width', '100%');
				$(`#resizer-${ownId}`).off('mousedown');
			});
		},

		restoreLeft: function(ownId) {
			$(`#restore-${ownId}`).click(()=>{
				$(`#restore-${ownId}`).hide();
				$(`#minimize-${ownId}`).show();
				$(`#right-${ownId}`).css('width', `calc(100% - ${$('#left-' + ownId).css('width')})`);
				$(`#left-${ownId}`).fadeIn();
				fn.dragDivider(ownId); 
			});
		}

	}

})