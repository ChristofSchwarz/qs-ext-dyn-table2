
// this require function is able to return an empty hypercube of type table
// and it offers methods to add dimensions and measures

define([], function () {
    return {
        newTable: function () {
            return {
                "qInfo": { "qType": "table" },
                "visualization": "table",
                "qMetaDef": {},
                "qStateName": "",
                "qHyperCubeDef": {
                    "qStateName": "",
                    "qDimensions": [],
                    "qMeasures": [],
                    "qInterColumnSortOrder": [],
                    "qSuppressZero": false,
                    "qSuppressMissing": true,
                    "qInitialDataFetch": [
                        {
                            "qLeft": 0,
                            "qTop": 0,
                            "qWidth": 0,
                            "qHeight": 0
                        }
                    ],
                    "qReductionMode": "N",
                    "qMode": "S",
                    "qPseudoDimPos": -1,
                    "qNoOfLeftDims": -1,
                    "qAlwaysFullyExpanded": false,
                    "qMaxStackedCells": 5000,
                    "qPopulateMissing": false,
                    "qShowTotalsAbove": false,
                    "qIndentMode": false,
                    "qCalcCond": { "qv": "" },
                    "qSortbyYValue": 0,
                    "qTitle": { "qv": "" },
                    "qCalcCondition": {
                        "qCond": { "qv": "" },
                        "qMsg": { "qv": "" }
                    },
                    "qColumnOrder": [],
                    "qExpansionState": [],
                    "qDynamicScript": [],
                    "qContextSetExpression": "",
                    "columnOrder": [],
                    "columnWidths": [],
                },
                "search": {
                    "sorting": "auto"
                },
                "showTitles": false,
                "title": "",
                "subtitle": "",
                "footnote": {
                    // "qStringExpression": {
                    //     "qExpr": "=[#Contracts] & ' row(s) ' & if(Len(GetCurrentSelections()), ' - filtered')"
                    // }
                },
                "disableNavMenu": false,
                "showDetails": false,
                "components": [
                    {
                        "key": "theme",
                        "content": {
                            "hoverEffect": true
                        },
                        "scrollbar": {
                            "size": "medium"
                        }
                    }
                ],
                "totals": {
                    "show": true,
                    "position": "noTotals",
                    "label": "Totals"
                },
                "scrolling": {
                    "horizontal": true,
                    "keepFirstColumnInView": false,
                    "keepFirstColumnInViewTouch": false
                },
                "multiline": {
                    "wrapTextInHeaders": true,
                    "wrapTextInCells": false
                }
            };
        },

        newDimension: function (expression, label) {
            return {
                // "qLibraryId": "",
                "qDef": {
                    "qGrouping": "N",
                    "qFieldDefs": [expression],
                    "qFieldLabels": [label],
                    "qSortCriterias": [
                        {
                            "qSortByState": 0,
                            "qSortByFrequency": 0,
                            "qSortByNumeric": 1,
                            "qSortByAscii": 1,
                            "qSortByLoadOrder": 1,
                            "qSortByExpression": 0,
                            "qExpression": { "qv": "" },
                            "qSortByGreyness": 0
                        }
                    ],
                    "qNumberPresentations": [],
                    "qReverseSort": false,
                    "qActiveField": 0,
                    "qLabelExpression": "",
                    "autoSort": true,
                    "cId": "ESzXpeN",
                    "othersLabel": "Others",
                    "textAlign": {
                        "auto": true,
                        "align": "left"
                    },
                    "representation": {
                        "type": "text",
                        "urlPosition": "dimension",
                        "urlLabel": "",
                        "linkUrl": ""
                    }
                },
                "qNullSuppression": false,
                "qIncludeElemValue": false,
                "qOtherTotalSpec": {
                    "qOtherMode": "OTHER_OFF",
                    "qOtherCounted": { "qv": "10" },
                    "qOtherLimit": { "qv": "0" },
                    "qOtherLimitMode": "OTHER_GE_LIMIT",
                    "qSuppressOther": false,
                    "qForceBadValueKeeping": true,
                    "qApplyEvenWhenPossiblyWrongResult": true,
                    "qGlobalOtherGrouping": false,
                    "qOtherCollapseInnerDimensions": false,
                    "qOtherSortMode": "OTHER_SORT_DESCENDING",
                    "qTotalMode": "TOTAL_OFF",
                    "qReferencedExpression": { "qv": "" }
                },
                "qShowTotal": false,
                "qShowAll": false,
                "qOtherLabel": { "qv": "Others" },
                "qTotalLabel": { "qv": "" },
                "qCalcCond": { "qv": "" },
                "qAttributeExpressions": [],
                "qAttributeDimensions": [],
                "qCalcCondition": {
                    "qCond": { "qv": "" },
                    "qMsg": { "qv": "" }
                },
                "othersLabel": "Others"
            };
        },

        newMeasure: function (expression, label) {
            return {
                // "qLibraryId": "",
                "qDef": {
                    "qLabel": label,
                    "qDescription": "",
                    "qTags": [],
                    "qGrouping": "N",
                    "qDef": expression,
                    "qNumFormat": {
                        "qType": "U",
                        "qnDec": 10,
                        "qUseThou": 0,
                        "qFmt": "",
                        "qDec": "",
                        "qThou": ""
                    },
                    "qRelative": false,
                    "qBrutalSum": false,
                    "qAggrFunc": "Expr",
                    "qAccumulate": 0,
                    "qReverseSort": false,
                    "qActiveExpression": 0,
                    "qExpressions": [],
                    "qLabelExpression": "",
                    "autoSort": true,
                    // "cId": "CYbDEk",
                    "numFormatFromTemplate": true,
                    "textAlign": {
                        "auto": true,
                        "align": "left"
                    },
                    "representation": {
                        "type": "text",
                        "indicator": {
                            "showTextValues": true,
                            "applySegmentColors": false,
                            "position": "right"
                        },
                        // "miniChart": { }
                    },
                    "conditionalColoring": {
                        "segments": {
                            "limits": [],
                            "paletteColors": [
                                {
                                    "index": 6,
                                    "icon": "dot"
                                }
                            ]
                        }
                    }
                },
                "qSortBy": {
                    "qSortByState": 0,
                    "qSortByFrequency": 0,
                    "qSortByNumeric": -1,
                    "qSortByAscii": 0,
                    "qSortByLoadOrder": 1,
                    "qSortByExpression": 0,
                    "qExpression": { "qv": "" },
                    "qSortByGreyness": 0
                },
                "qAttributeExpressions": [],
                "qAttributeDimensions": [],
                "qCalcCond": { "qv": "" },
                "qCalcCondition": {
                    "qCond": { "qv": "" },
                    "qMsg": { "qv": "" }
                },
                "qTrendLines": [],
                "qMiniChartDef": {
                    "qDef": "",
                    "qLibraryId": "",
                    "qSortBy": {
                        "qSortByState": 0,
                        "qSortByFrequency": 0,
                        "qSortByNumeric": 0,
                        "qSortByAscii": 0,
                        "qSortByLoadOrder": 0,
                        "qSortByExpression": 0,
                        "qExpression": { "qv": "" },
                        "qSortByGreyness": 0
                    },
                    "qOtherTotalSpec": {
                        "qOtherMode": "OTHER_OFF",
                        "qOtherCounted": { "qv": "" },
                        "qOtherLimit": { "qv": "" },
                        "qOtherLimitMode": "OTHER_GT_LIMIT",
                        "qSuppressOther": true,
                        "qForceBadValueKeeping": true,
                        "qApplyEvenWhenPossiblyWrongResult": true,
                        "qGlobalOtherGrouping": false,
                        "qOtherCollapseInnerDimensions": false,
                        "qOtherSortMode": "OTHER_SORT_DESCENDING",
                        "qTotalMode": "TOTAL_OFF",
                        "qReferencedExpression": { "qv": "" }
                    },
                    "qMaxNumberPoints": -1,
                    "qAttributeExpressions": [],
                    "qNullSuppression": true
                }
            };
        }
    }
})