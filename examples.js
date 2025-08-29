const hl_examples = {}

hl_examples['example1'] =  {
    "heatload": {
        "spaces": [
            {
                "type": "unheated",
                "name": "Ext",
                "id": 0,
                "temperature": -7,
                "bc_type": "outside",
                "averageHeight": null,
                "reheat_power": null
            },
            {
                "type": "heated",
                "name": "Séjour/Woonkmaker",
                "id": 1,
                "temperature": 21,
                "gradient": 0,
                "delta_rad": 0,
                "floorarea": 13.5,
                "volume": 34,
                "averageHeight": 2.5185185185185186,
                "heating_type": "radiators",
                "bc_type": null,
                "transmission_heat_loss": 472.4277209929237,
                "ventilation": {
                    "natural_supply_flowrate": 0,
                    "mechanical_supply_flowrate": 75,
                    "transfer_flowrate": 0,
                    "transfer_temperature": 21,
                    "mechanical_extract_flowrate": 0,
                    "infiltration_flowrate": 0,
                    "extra_infiltration_flowrate": 0,
                    "ventilation_loss": 179.16060050566756,
                    "balance": 0
                },
                "heat_up_time": null,
                "reheat_power": 0
            },
            {
                "type": "heated",
                "name": "Cuisine/Keuken",
                "id": 2,
                "temperature": 21,
                "gradient": 0,
                "delta_rad": 0,
                "floorarea": 10.5,
                "volume": 26,
                "averageHeight": 2.4761904761904763,
                "heating_type": "radiators",
                "bc_type": null,
                "transmission_heat_loss": 352.07772099292373,
                "ventilation": {
                    "natural_supply_flowrate": 0,
                    "mechanical_supply_flowrate": 0,
                    "transfer_flowrate": 50,
                    "transfer_temperature": 20.114455801415254,
                    "mechanical_extract_flowrate": 50,
                    "infiltration_flowrate": 0,
                    "extra_infiltration_flowrate": 0,
                    "ventilation_loss": 89.31025137594071,
                    "balance": 0
                },
                "heat_up_time": null,
                "reheat_power": 0
            },
            {
                "type": "heated",
                "name": "Salle de bain/Badkamer",
                "id": 3,
                "temperature": 24,
                "gradient": 0,
                "delta_rad": 0,
                "floorarea": 6,
                "volume": 15,
                "averageHeight": 2.5,
                "heating_type": "radiators",
                "bc_type": null,
                "transmission_heat_loss": 396.82576344766676,
                "ventilation": {
                    "natural_supply_flowrate": 0,
                    "mechanical_supply_flowrate": 0,
                    "transfer_flowrate": 50,
                    "transfer_temperature": 20.114455801415254,
                    "mechanical_extract_flowrate": 50,
                    "infiltration_flowrate": 0,
                    "extra_infiltration_flowrate": 0,
                    "ventilation_loss": 113.48425137594069,
                    "balance": 0
                },
                "heat_up_time": null,
                "reheat_power": 0
            },
            {
                "type": "heated",
                "name": "Chambre/Slaapkamer",
                "id": 4,
                "temperature": 18,
                "gradient": 0,
                "delta_rad": 0,
                "floorarea": 10.5,
                "volume": 26,
                "averageHeight": 2.4761904761904763,
                "heating_type": "radiators",
                "bc_type": null,
                "transmission_heat_loss": 203.7831629787712,
                "ventilation": {
                    "natural_supply_flowrate": 0,
                    "mechanical_supply_flowrate": 50,
                    "transfer_flowrate": 0,
                    "transfer_temperature": 18,
                    "mechanical_extract_flowrate": 0,
                    "infiltration_flowrate": 0,
                    "extra_infiltration_flowrate": 0,
                    "ventilation_loss": 70.00440033711172,
                    "balance": 0
                },
                "heat_up_time": null,
                "reheat_power": 0
            },
            {
                "type": "heated",
                "name": "WC",
                "id": 5,
                "temperature": 20.777024104805633,
                "gradient": 0,
                "delta_rad": 0,
                "floorarea": 1.5,
                "volume": 3.7,
                "averageHeight": 2.466666666666667,
                "heating_type": "equilibrium",
                "bc_type": null,
                "transmission_heat_loss": -16.114879475971833,
                "ventilation": {
                    "natural_supply_flowrate": 0,
                    "mechanical_supply_flowrate": 0,
                    "transfer_flowrate": 25,
                    "transfer_temperature": 20.114455801415254,
                    "mechanical_extract_flowrate": 25,
                    "infiltration_flowrate": 0,
                    "extra_infiltration_flowrate": 0,
                    "ventilation_loss": 16.114879475971875,
                    "balance": 0
                },
                "heat_up_time": null,
                "reheat_power": 0
            },
            {
                "type": "heated",
                "name": "Couloir/gang",
                "id": 6,
                "temperature": 20.114455801415254,
                "gradient": 0,
                "delta_rad": 0,
                "floorarea": 6,
                "volume": 15,
                "averageHeight": 2.5,
                "heating_type": "equilibrium",
                "bc_type": null,
                "transmission_heat_loss": -54.849488936313584,
                "ventilation": {
                    "natural_supply_flowrate": 0,
                    "mechanical_supply_flowrate": 0,
                    "transfer_flowrate": 125,
                    "transfer_temperature": 19.8,
                    "mechanical_extract_flowrate": 0,
                    "infiltration_flowrate": 0,
                    "extra_infiltration_flowrate": 0,
                    "ventilation_loss": 54.84948893631359,
                    "balance": 0
                },
                "heat_up_time": null,
                "reheat_power": 0
            },
            {
                "type": "unheated",
                "name": "Voisins/neighbours",
                "id": 7,
                "temperature": 10,
                "bc_type": "other_heated",
                "reheat_power": null
            }
        ],
        "spaceIdCounter": 8,
        "wallElements": [
            {
                "name": "Mur ext",
                "id": 1,
                "uValue": 0.24,
                "thermalBridge": 0,
                "isHeatingElement": false
            },
            {
                "name": "Toit",
                "id": 2,
                "uValue": 0.24,
                "thermalBridge": 0,
                "isHeatingElement": false
            },
            {
                "name": "Menuiseries DV",
                "id": 3,
                "uValue": 1.5,
                "thermalBridge": 0,
                "isHeatingElement": false
            },
            {
                "name": "Mitoyens",
                "id": 5,
                "uValue": 1,
                "thermalBridge": 0,
                "isHeatingElement": false
            },
            {
                "name": "Mur int",
                "id": 6,
                "uValue": 2,
                "thermalBridge": 0,
                "isHeatingElement": false
            },
            {
                "name": "Sol/plafond",
                "id": 8,
                "uValue": 1,
                "thermalBridge": 0,
                "isHeatingElement": false
            }
        ],
        "wallElementsIdCounter": 8,
        "wallInstances": [
            {
                "id": 2,
                "spaces": [
                    1,
                    0
                ],
                "elementId": 1,
                "Area": 11.25,
                "transmissionLoss": 75.6,
                "wallHeights": {
                    "0": 0,
                    "1": 1.2592592592592593
                }
            },
            {
                "id": 3,
                "spaces": [
                    1,
                    0
                ],
                "elementId": 1,
                "Area": 7.5,
                "transmissionLoss": 50.39999999999999,
                "wallHeights": {
                    "0": 0,
                    "1": 1.2592592592592593
                }
            },
            {
                "id": 4,
                "spaces": [
                    1,
                    2
                ],
                "elementId": 6,
                "Area": 8.75,
                "transmissionLoss": 0,
                "wallHeights": {
                    "1": 1.2592592592592593,
                    "2": 1.2380952380952381
                }
            },
            {
                "id": 5,
                "spaces": [
                    1,
                    4
                ],
                "elementId": 6,
                "Area": 7.5,
                "transmissionLoss": 45,
                "wallHeights": {
                    "1": 1.2592592592592593,
                    "4": 1.2380952380952381
                }
            },
            {
                "id": 6,
                "spaces": [
                    1,
                    6
                ],
                "elementId": 6,
                "Area": 2.5,
                "transmissionLoss": 4.427720992923732,
                "wallHeights": {
                    "1": 1.2592592592592593,
                    "6": 1.25
                }
            },
            {
                "id": 7,
                "spaces": [
                    2,
                    3
                ],
                "elementId": 6,
                "Area": 5,
                "transmissionLoss": -30,
                "wallHeights": {
                    "2": 1.2380952380952381,
                    "3": 1.25
                }
            },
            {
                "id": 8,
                "spaces": [
                    2,
                    6
                ],
                "elementId": 6,
                "Area": 2.5,
                "transmissionLoss": 4.427720992923732,
                "wallHeights": {
                    "2": 1.2380952380952381,
                    "6": 1.25
                }
            },
            {
                "id": 9,
                "spaces": [
                    2,
                    7
                ],
                "elementId": 5,
                "Area": 8.75,
                "transmissionLoss": 96.25,
                "wallHeights": {
                    "2": 1.2380952380952381,
                    "7": 0
                }
            },
            {
                "id": 10,
                "spaces": [
                    2,
                    0
                ],
                "elementId": 1,
                "Area": 7.5,
                "transmissionLoss": 50.39999999999999,
                "wallHeights": {
                    "0": 0,
                    "2": 1.2380952380952381
                }
            },
            {
                "id": 11,
                "spaces": [
                    1,
                    7
                ],
                "elementId": 8,
                "Area": 13.5,
                "transmissionLoss": 148.5,
                "wallHeights": {
                    "1": 1.2592592592592593,
                    "7": 0
                }
            },
            {
                "id": 12,
                "spaces": [
                    1,
                    7
                ],
                "elementId": 8,
                "Area": 13.5,
                "transmissionLoss": 148.5,
                "wallHeights": {
                    "1": 1.2592592592592593,
                    "7": 0
                }
            },
            {
                "id": 13,
                "spaces": [
                    2,
                    7
                ],
                "elementId": 8,
                "Area": 10.5,
                "transmissionLoss": 115.5,
                "wallHeights": {
                    "2": 1.2380952380952381,
                    "7": 0
                }
            },
            {
                "id": 14,
                "spaces": [
                    2,
                    7
                ],
                "elementId": 8,
                "Area": 10.5,
                "transmissionLoss": 115.5,
                "wallHeights": {
                    "2": 1.2380952380952381,
                    "7": 0
                }
            },
            {
                "id": 15,
                "spaces": [
                    3,
                    7
                ],
                "elementId": 8,
                "Area": 6,
                "transmissionLoss": 84,
                "wallHeights": {
                    "3": 1.25,
                    "7": 0
                }
            },
            {
                "id": 16,
                "spaces": [
                    3,
                    7
                ],
                "elementId": 8,
                "Area": 6,
                "transmissionLoss": 84,
                "wallHeights": {
                    "3": 1.25,
                    "7": 0
                }
            },
            {
                "id": 17,
                "spaces": [
                    3,
                    5
                ],
                "elementId": 6,
                "Area": 2.5,
                "transmissionLoss": 16.114879475971833,
                "wallHeights": {
                    "3": 1.25,
                    "5": 1.2333333333333334
                }
            },
            {
                "id": 18,
                "spaces": [
                    3,
                    6
                ],
                "elementId": 6,
                "Area": 10,
                "transmissionLoss": 77.71088397169493,
                "wallHeights": {
                    "3": 1.25,
                    "6": 1.25
                }
            },
            {
                "id": 19,
                "spaces": [
                    3,
                    7
                ],
                "elementId": 5,
                "Area": 7.5,
                "transmissionLoss": 105,
                "wallHeights": {
                    "3": 1.25,
                    "7": 0
                }
            },
            {
                "id": 20,
                "spaces": [
                    4,
                    0
                ],
                "elementId": 1,
                "Area": 8.75,
                "transmissionLoss": 52.5,
                "wallHeights": {
                    "0": 0,
                    "4": 1.2380952380952381
                }
            },
            {
                "id": 21,
                "spaces": [
                    4,
                    7
                ],
                "elementId": 5,
                "Area": 7.5,
                "transmissionLoss": 60,
                "wallHeights": {
                    "4": 1.2380952380952381,
                    "7": 0
                }
            },
            {
                "id": 22,
                "spaces": [
                    4,
                    6
                ],
                "elementId": 6,
                "Area": 7.5,
                "transmissionLoss": -31.716837021228805,
                "wallHeights": {
                    "4": 1.2380952380952381,
                    "6": 1.25
                }
            },
            {
                "id": 23,
                "spaces": [
                    4,
                    7
                ],
                "elementId": 8,
                "Area": 10.5,
                "transmissionLoss": 84,
                "wallHeights": {
                    "4": 1.2380952380952381,
                    "7": 0
                }
            },
            {
                "id": 24,
                "spaces": [
                    4,
                    7
                ],
                "elementId": 8,
                "Area": 10.5,
                "transmissionLoss": 84,
                "wallHeights": {
                    "4": 1.2380952380952381,
                    "7": 0
                }
            }
        ],
        "wallInstanceID": 24,
        "otherData": {
            "heatrecovery": {
                "checked": true,
                "efficiency": "85",
                "meanExtractTemperature": 22.155404820961127,
                "supplyTemperature": 17.78209409781696
            },
            "airtightness": {
                "choice": "n50",
                "value": "3",
                "v50_refsurface": "0"
            },
            "reheat": {
                "inertia": "light",
                "setback_period": "-"
            }
        },
        "zipCode": 1000,
        "airTransfers": {
            "transferFlows": [
                {
                    "id": 1,
                    "from": 1,
                    "to": 6,
                    "flowrate": 75
                },
                {
                    "id": 2,
                    "from": 4,
                    "to": 6,
                    "flowrate": 50
                },
                {
                    "id": 3,
                    "from": 6,
                    "to": 2,
                    "flowrate": 50
                },
                {
                    "id": 4,
                    "from": 6,
                    "to": 3,
                    "flowrate": 50
                },
                {
                    "id": 5,
                    "from": 6,
                    "to": 5,
                    "flowrate": 25
                }
            ],
            "transferFlowCalculation": "detailled",
            "transferCounter": 5
        },
        "subscribers": {
            "heatload_changed": [
                null,
                null
            ],
            "spaces": [
                null,
                null
            ]
        },
        "heatingOptions": [
            "radiators",
            "floorheating",
            "equilibrium",
            "air_without_destratification",
            "air_with_destratification",
            "radiant_ceiling",
            "radiant_tubes",
            "infrared_radiant"
        ]
    },
    "radiators": {
        "spaces": [
            {
                "id": 1,
                "name": "Séjour/Woonkmaker",
                "heatLoad": 651.5883214985913,
                "temperature": 21,
                "exponent": 1.3,
                "correctionFactor": 1,
                "refPower": 1954.7941101171382,
                "mh_kg_s": 0.03117647471285126
            },
            {
                "id": 2,
                "name": "Cuisine/Keuken",
                "heatLoad": 441.38797236886444,
                "temperature": 21,
                "exponent": 1.3,
                "correctionFactor": 1,
                "refPower": 1324.1836604419063,
                "mh_kg_s": 0.021119041740137054
            },
            {
                "id": 3,
                "name": "Salle de bain/Badkamer",
                "heatLoad": 510.31001482360745,
                "temperature": 24,
                "exponent": 1.3,
                "correctionFactor": 1,
                "refPower": 1865.1476297022368,
                "mh_kg_s": 0.02441674712074677
            },
            {
                "id": 4,
                "name": "Chambre/Slaapkamer",
                "heatLoad": 273.78756331588295,
                "temperature": 18,
                "exponent": 1.3,
                "correctionFactor": 1,
                "refPower": 692.1566552927983,
                "mh_kg_s": 0.013099883412243203
            }
        ],
        "startTemperature": 45,
        "returnTemperature": 40,
        "refT": 20
    },
    "floor": {
        "spaces": {},
        "loops": [],
        "numberOfLoops": 0,
        "system": null,
        "designDeltaT": 5,
        "supplyWaterTemperature": null,
        "refSupplyWaterTemperature": null,
        "subscribers": {
            "floorheating_losses_updated": [
                null
            ]
        },
        "defaultSystems": {
            "Vitoset 16x2 45 mm": {
                "5": {
                    "0": 7.52,
                    "0.05": 5.35,
                    "0.1": 4.13,
                    "0.15": 3.38
                },
                "10": {
                    "0": 6.45,
                    "0.05": 4.69,
                    "0.1": 3.73,
                    "0.15": 3.11
                },
                "15": {
                    "0": 5.52,
                    "0.05": 4.15,
                    "0.1": 3.33,
                    "0.15": 2.83
                },
                "20": {
                    "0": 4.81,
                    "0.05": 3.69,
                    "0.1": 3.05,
                    "0.15": 2.6
                },
                "25": {
                    "0": 4.12,
                    "0.05": 3.27,
                    "0.1": 2.79,
                    "0.15": 2.38
                },
                "30": {
                    "0": 3.61,
                    "0.05": 2.91,
                    "0.1": 2.49,
                    "0.15": 2.17
                }
            },
            "Begetube 16/2": {
                "5": {
                    "0": 7.5,
                    "0.05": 5.37,
                    "0.1": 4.13,
                    "0.15": 3.4
                },
                "10": {
                    "0": 6.43,
                    "0.05": 4.73,
                    "0.1": 3.74,
                    "0.15": 3.11
                },
                "15": {
                    "0": 5.53,
                    "0.05": 4.17,
                    "0.1": 3.37,
                    "0.15": 2.83
                },
                "20": {
                    "0": 4.78,
                    "0.05": 3.72,
                    "0.1": 3.05,
                    "0.15": 2.6
                },
                "25": {
                    "0": 4.17,
                    "0.05": 3.27,
                    "0.1": 2.77,
                    "0.15": 2.4
                },
                "30": {
                    "0": 3.63,
                    "0.05": 2.9,
                    "0.1": 2.47,
                    "0.15": 2.17
                }
            },
            "Rolljet & Clickjet": {
                "5": {
                    "0": 7.52,
                    "0.05": 5.4,
                    "0.1": 4.16,
                    "0.15": 3.42
                },
                "10": {
                    "0": 6.48,
                    "0.05": 4.76,
                    "0.1": 3.76,
                    "0.15": 3.14
                },
                "15": {
                    "0": 5.6,
                    "0.05": 4.2,
                    "0.1": 3.4,
                    "0.15": 2.84
                },
                "20": {
                    "0": 4.88,
                    "0.05": 3.73,
                    "0.1": 3.07,
                    "0.15": 2.6
                },
                "25": {
                    "0": 4.2,
                    "0.05": 3.27,
                    "0.1": 2.79,
                    "0.15": 2.4
                },
                "30": {
                    "0": 3.68,
                    "0.05": 2.96,
                    "0.1": 2.52,
                    "0.15": 2.2
                }
            }
        }
    }
}


