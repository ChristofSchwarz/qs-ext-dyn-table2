// JavaScript
define(["jquery"], function ($) {

    const formulas = {
        pCategoryDropdown: "=Concat(DISTINCT {1} [$Table], CHR(10))",
        pFieldsCount: "=Count(DISTINCT [$Field])",
        pFieldsTotalCount: "=Count({1} DISTINCT [$Field])",
        measure1: "=Only(If(Index([$Field], '.'), Mid([$Field], 1+ Index([$Field], '.')), [$Field]))",
        measure2: "=false() // formula that resolves to true if this is a measure, false if a dimension",
        measure3: "=Count({1<[$Field]={*}>} [$Field]) * Len([$Field])"
    }

    const section1 = {
        label: 'Extension settings',
        type: 'items',
        items: [
            {
                label: "Labels for Search Box",
                type: "string",
                expression: 'optional',
                ref: "pSearchText",
                defaultValue: `Search`
            }, {
                type: "boolean",
                defaultValue: true,
                ref: "pUseCategory",
                label: "Use a Category dropdown"
            }, {
                label: "Field for Category Dropdown",
                type: "string",
                expression: 'optional',
                ref: "pCategoryField",
                defaultValue: "$Table",
                show: (arg) => { return arg.pUseCategory }
            }, {
                label: "Values for Category Dropdown (LF separated)",
                type: "string",
                expression: 'optional',
                ref: "pCategoryDropdown",
                defaultValue: formulas.pCategoryDropdown,
                show: (arg) => { return arg.pUseCategory }
            }, {
                label: "Counter of visible fields",
                type: "string",
                expression: 'optional',
                ref: "pFieldsCount",
                defaultValue: formulas.pFieldsCount
            }, {
                label: "Counter of total fields",
                type: "string",
                expression: 'optional',
                ref: "pFieldsTotalCount",
                defaultValue: formulas.pFieldsTotalCount
            }, {
                label: "Background-color Header",
                type: "string",
                expression: 'optional',
                ref: "pColorHeaderBg",
                defaultValue: `#e0e0e0`
            }, {
                type: "boolean",
                defaultValue: false,
                ref: "pConsoleLog",
                label: "console.log debugging info"
            }
        ]

    }

    const about = function (qext) {
        return {
            label: 'About this extension',
            type: 'items',
            items: [
                {
                    label: function (arg) { return 'Installed extension version ' + qext.version },
                    component: "link",
                    url: '../extensions/qs-ext-dyn-table2/qs-ext-dyn-table2.qext'
                }, {
                    label: "This extension is free of charge by data/\\bridge, Qlik OEM partner and specialist for Mashup integrations.",
                    component: "text"
                }, {
                    label: "About Us",
                    component: "link",
                    url: 'https://www.databridge.ch'
                }, {
                    label: "It uses 1 dimension and 3 measures",
                    component: "text"
                }, {
                    label: "dim.1: Technical field Name",
                    component: "text"
                }, {
                    label: "meas.1: Business field name",
                    component: "text"
                }, {
                    label: "meas.2: Is Measure flag",
                    component: "text"
                }, {
                    label: "meas.3: Is visible flag",
                    component: "text"
                }, {
                    label: "Open Documentation",
                    component: "button",
                    action: function (arg) {
                        window.open('https://github.com/ChristofSchwarz/qs-ext-dyn-table2/blob/main/README.md', '_blank');
                    }
                }
            ]
        }
    }

    return {

        initialProperties: {
            showTitles: false,
            disableNavMenu: false,
            qHyperCubeDef: {
                qDimensions: [
                    {
                        qDef: {
                            //qGrouping: "N",
                            qFieldDefs: ["$Field"]
                        }
                    }
                ],
                qMeasures: [
                    {
                        qDef: {
                            qLabel: "$Field",
                            qDef: formulas.measure1
                        }
                    }, {
                        qDef: {
                            qLabel: "Is Measure",
                            qDef: formulas.measure2
                        }
                    }, {
                        qDef: {
                            qLabel: "Is Selected",
                            qDef: formulas.measure3
                        }
                    }
                ],
                qInitialDataFetch: [{
                    qWidth: 4,
                    qHeight: Math.floor(10000 / 4) // divide 10000 by qWidth
                }]
            },
            /*
            pCategoryField: {
                qStringExpression: {
                    qExpr: "='$Table'"
                }
            },*/
            pCategoryDropdown: {
                qStringExpression: {
                    qExpr: formulas.pCategoryDropdown
                }
            },
            pFieldsCount: {
                qStringExpression: {
                    qExpr: formulas.pFieldsCount
                }
            },
            pFieldsTotalCount: {
                qStringExpression: {
                    qExpr: formulas.pFieldsTotalCount
                }
            }
        },

        definition: function (qext) {
            return {
                type: "items",
                component: "accordion",
                items: {
                    dimensions: {
                        uses: "dimensions",
                        min: 1,
                        max: 1
                    },
                    measures: {
                        uses: "measures",
                        min: 3,
                        max: 4
                    },
                    sorting: {
                        uses: "sorting"
                    },
                    addons: {
                        uses: "addons",
                        items: {
                            dataHandling: {
                                uses: "dataHandling",
                                items: {
                                    calcCond: { uses: "calcCond" }
                                }
                            }
                        }
                    },
                    settings: {
                        uses: "settings"
                    },
                    section1: section1,
                    about: about(qext)
                }
            }
        },

        support: {
			snapshot: false,
			export: true,
			exportData: false
		}
    }

    /*
    function subSection(labelText, itemsArray, argKey, argVal) {
        var ret = {
            component: 'expandable-items',
            items: {}
        };
        var hash = 0;
        for (var j = 0; j < labelText.length; j++) {
            hash = ((hash << 5) - hash) + labelText.charCodeAt(j)
            hash |= 0;
        }
        ret.items[hash] = {
            label: labelText,
            type: 'items',
            show: function (arg) { return (argKey && argVal) ? (arg[argKey] == argVal) : true },
            items: itemsArray
        };
        return ret;
    }
    */
});