class DataModel {

    constructor() {
        this.spaces = [];
        this.spaceIdCounter = 0;
        this.wallElements = [];
        this.wallElementsIdCounter = 0;
        this.wallInstances = [];
        this.wallInstanceID = 0;
        this.otherData = {
            'heatrecovery': {
                'checked': false,
                'efficiency': 0,
                'meanExtractTemperature': null,
                'supplyTemperature': -7
            },
            'airtightness': {
                'choice': "v50",
                'value': 0
            }
        };
		this.zipCode = 1000

    }
    createNewSpace(name) {
        this.spaces.push({
            type: "heated",
            name: name,
            id: this.spaceIdCounter,
            temperature: 20,
            floorarea: 0,
            volume: 0,
            heating_type: "radiators",
			bc_type: null,
            transmission_heat_loss: 0,
            ventilation: {
                "natural_supply_flowrate": 0,
                "mechanical_supply_flowrate": 0,
                "transfer_flowrate": 0,
                "transfer_temperature": 0,
                "mechanical_extract_flowrate": 0,
                "infiltration_flowrate": 0,
                "extra_infiltration_flowrate": 0,
                "ventilation_loss": 0
            }
        });
        this.spaceIdCounter++;

    }

	setZip(zip){
		this.zipCode = zip
		
	}

	getBoundaryTemperatures(){
		return getWeather("temperature",this.zipCode)
	}
	

    createNewBoundary(name, type = 'unheated',bc_type='outside') {
		console.log("create boundary")
        const newBoundary = {
            type: type,
            name: name,
            id: this.spaceIdCounter,
            temperature: -7,
			bc_type: bc_type
        };
        this.spaceIdCounter++;
        this.spaces.push(newBoundary);
    }

    createNewWallInstance(spaceId) {
        this.wallInstanceID++;
        const newWallInstance = {
            id: this.wallInstanceID,
            spaces: [spaceId], // Initially only include the current space
            elementId: "", // Initialize without a type
            Area: 0, // Initialize with zero area
            transmissionLoss: 0 // Initialize with zero transmission loss
        };
        this.wallInstances.push(newWallInstance);
    }

    createNewWallElement(name) {

        this.wallElementsIdCounter++;

        const newWallElement = {
            name: name,
            id: this.wallElementsIdCounter,
            uValue: '', // Assuming default values or form inputs can populate these
            thermalBridge: '' // Assuming default values or form inputs can populate these
        };

        this.wallElements.push(newWallElement);
    }

    computeWallInstanceLoss(wallInstance) {

        const wall = this.wallElements.find(wall => wall.id === wallInstance.elementId);
        var heatLoss = 0

            // Find the temperatures of the connected this.spaces
            const spaceTemps = wallInstance.spaces.map(spaceId => {
                const space = this.spaces.find(s => s.id === spaceId);
                return space ? parseFloat(space.temperature) : null;
            });

        // Ensure we have two valid temperatures before computing the heat loss
        if (spaceTemps.length === 2 && spaceTemps[0] != null && spaceTemps[1] != null) {
            const deltaT = spaceTemps[0] - spaceTemps[1];
            heatLoss = wallInstance.Area * (wall.uValue + wall.thermalBridge) * deltaT;
        }
        wallInstance.transmissionLoss = heatLoss

    }

    computeAllWallInstanceLosses() {

        this.wallInstances.forEach(wallInstance => {
            this.computeWallInstanceLoss(wallInstance)
        });
    }

    computeVentilationLoss(space) {

        var Tout = this.getTout()

            var volumeRatio = space.volume / this.getTotalVolume()
            var spaceExtractSurplus = 0.5 * this.getExtractSurplus() * volumeRatio

            var Q50 = this.getQ50()
            var LIR = 0.10

            //loop
            var mechSupplyLoss = 0.34 * space.ventilation.mechanical_supply_flowrate * (space.temperature - this.otherData.heatrecovery.supplyTemperature)
            var naturalSupplyLoss = 0.34 * space.ventilation.natural_supply_flowrate * (space.temperature - Tout)
            var transferSupplyLoss = 0.34 * space.ventilation.transfer_flowrate * (space.temperature - space.ventilation.transfer_temperature)

            var infiltrationFlowRate = Q50 * LIR * volumeRatio + spaceExtractSurplus
            var infiltrationLoss = 0.34 * infiltrationFlowRate * (space.temperature - Tout)


            var minimalFlowRate = 0.5 * space.volume
            var totalFlowRateWithoutMinimum = space.ventilation.natural_supply_flowrate + space.ventilation.transfer_flowrate + space.ventilation.mechanical_supply_flowrate + infiltrationFlowRate

            if (totalFlowRateWithoutMinimum < minimalFlowRate) {
                var extraLossForMinimalFlowRate = 0.34 * (minimalFlowRate - totalFlowRateWithoutMinimum) * (space.temperature - Tout)
            } else {
                extraLossForMinimalFlowRate = 0
            }

            var loss = mechSupplyLoss + naturalSupplyLoss + transferSupplyLoss + infiltrationLoss + extraLossForMinimalFlowRate

            space.ventilation.ventilation_loss = loss

    }

    computeAllVentilationLosses() {

        this.spaces.forEach(space => {
            if (space.type == "heated") {
                this.computeVentilationLoss(space)
            }
        })
    }

    getQ50() {

        return this.otherData.airtightness.value * this.getTotalVolume()

    }
	
	getBoundaryConditionTypes(){
		return [
		{ value: "outside", label: "" },
		{ value: "ground", label: "" },
		{ value: "other_heated", label: "" },
		{ value: "other_unheated", label: "" } ];	
	}
	
	setDefaultBoundaryTemperatures() {
	    console.log("set default bcs")
	    const default_temps = this.getBoundaryTemperatures()
		
		this.spaces.forEach(space => {
			console.log(space)
			if (space.type == 'unheated') {
				switch (space.bc_type) {
				case 'outside':
					space.temperature = default_temps[0]
					break;
				case 'other_unheated':
					space.temperature = default_temps[1]
					break;
				case 'other_heated':
					space.temperature = default_temps[2]
					break;
				case 'ground':
					console.log("this is a ground")
					space.temperature = default_temps[2]
					break;
				default:
					space.temperature = default_temps[0]

				}
			}
			console.log(space)
		});

	}


    getTout() {
        return this.getSpace(0).temperature
    }

    getSpace(spaceid) {

        for (let space of this.spaces) {
            if (space.id == spaceid) {
                return space
            }
        }
        return null
    }

    getExtractSurplus() {

        const {
            totalNaturalSupplyFlowrate,
            totalMechanicalSupplyFlowrate,
            totalMechanicalExtractFlowrate
        } = this.getTotalFlowRates()

            var totalExtractSurplus = totalMechanicalExtractFlowrate - totalMechanicalSupplyFlowrate - totalNaturalSupplyFlowrate

            if (totalExtractSurplus < 0) {
                totalExtractSurplus = 0
            }

            return totalExtractSurplus

    }

    computeExtractMeanTemperature() {
        const {
            totalNaturalSupplyFlowrate,
            totalMechanicalSupplyFlowrate,
            totalMechanicalExtractFlowrate
        } = this.getTotalFlowRates()

            if (totalMechanicalExtractFlowrate == 0) {
                this.otherData.heatrecovery.meanExtractTemperature = null
                    return
            }

            if (this.otherData.heatrecovery.checked == true) {
                var meanT = 0
                    this.spaces.forEach(extracted_space => {
                        if (extracted_space.type == "heated" && extracted_space.ventilation.mechanical_extract_flowrate > 0) {

                            meanT += extracted_space.ventilation.mechanical_extract_flowrate / totalMechanicalExtractFlowrate * extracted_space.temperature
                        }
                    })
                    this.otherData.heatrecovery.meanExtractTemperature = meanT
            } else {
                this.otherData.heatrecovery.meanExtractTemperature = null
            }
    }

    computeSupplyTemperature() {

        if (this.otherData.heatrecovery.checked && this.otherData.heatrecovery.meanExtractTemperature != null) {

            var eta = this.otherData.heatrecovery.efficiency / 100.
			console.log(eta,typeof(eta))
			console.log(this.otherData.heatrecovery.meanExtractTemperature,typeof(this.otherData.heatrecovery.meanExtractTemperature))
			console.log(this.getTout(),typeof(this.getTout()))
			this.otherData.heatrecovery.supplyTemperature = this.getTout() + eta * (this.otherData.heatrecovery.meanExtractTemperature - this.getTout())
        } 
		else {
            this.otherData.heatrecovery.supplyTemperature = this.getTout()
        }
		console.log("Supply T",this.otherData.heatrecovery.supplyTemperature)
		console.log(typeof(this.otherData.heatrecovery.supplyTemperature))
    }

    getTotalVolume() {
        const totalVolume = this.spaces.reduce((acc, space) => {
            if ('volume' in space && !isNaN(parseFloat(space.volume))) {
                return acc + parseFloat(space.volume);
            }
            return acc;
        }, 0);
        return totalVolume

    }

    getTotalFlowRates() {
        const totalNaturalSupplyFlowrate = this.spaces.reduce((acc, space) => {
            if (space.ventilation && 'natural_supply_flowrate' in space.ventilation && !isNaN(parseFloat(space.ventilation.natural_supply_flowrate))) {
                return acc + parseFloat(space.ventilation.natural_supply_flowrate);
            }
            return acc;
        }, 0);

        const totalMechanicalSupplyFlowrate = this.spaces.reduce((acc, space) => {
            if (space.ventilation && 'mechanical_supply_flowrate' in space.ventilation && !isNaN(parseFloat(space.ventilation.mechanical_supply_flowrate))) {
                return acc + parseFloat(space.ventilation.mechanical_supply_flowrate);
            }
            return acc;
        }, 0);

        const totalMechanicalExtractFlowrate = this.spaces.reduce((acc, space) => {
            if (space.ventilation && 'mechanical_extract_flowrate' in space.ventilation && !isNaN(parseFloat(space.ventilation.mechanical_extract_flowrate))) {
                return acc + parseFloat(space.ventilation.mechanical_extract_flowrate);
            }
            return acc;
        }, 0);

        return {
            totalNaturalSupplyFlowrate,
            totalMechanicalSupplyFlowrate,
            totalMechanicalExtractFlowrate
        }

    }

    getUnheatedSpaces() {

        return this.spaces.filter(space => space.heating_type === "equilibrium");

    }

    getOtherSpaceId(spaceid, spaceslist) {

        const copiedList = Array.from(spaceslist);

        if (copiedList.includes(spaceid)) {
            copiedList.splice(copiedList.indexOf(spaceid), 1)
            return copiedList[0]
        } else {
            return null
        }
    }

    getWallElement(elementid) {

        for (let we of wallElements) {
            if (we.id == elementid) {
                return we
            }
        }
        return null
    }

    computeEquilibriumTemperatures() {
        // solve only for those who are not directly heated

        const {
            totalNaturalSupplyFlowrate,
            totalMechanicalSupplyFlowrate,
            totalMechanicalExtractFlowrate
        } = this.getTotalFlowRates()

            var Tout = this.getTout()

            unheatedSpaces = this.getUnheatedSpaces()
            nu = unheatedSpaces.length

            if (nu == 0) {
                return
            }

            A = Array.from({
                length: nu
            }, () => Array(nu).fill(0));
        b = Array(nu).fill(0);

        var i = 0

            // map space.id  with the row number in the matrix (i)
            mapping = new Map()
            unheatedSpaces.forEach(uspace => {
                mapping.set(uspace.id, unheatedSpaces.indexOf(uspace))
            })

            unheatedSpaces.forEach(space => {

                var volumeRatio = space.volume / this.getTotalVolume()

                    //transmission losses

                    wallInstances.forEach(wallInstance => {

                        if (wallInstance.spaces.includes(space.id)) {

                            wallElement = this.getWallElement(wallInstance.elementId)

                                var otherSpaceId = this.getOtherSpaceId(space.id, wallInstance.spaces)
                                otherSpace = this.getSpace(otherSpaceId)
                                j = mapping.get(otherSpaceId)

                                A[i][i] += (wallElement.uValue + wallElement.thermalBridge) * wallInstance.Area

                                if (otherSpace.heating_type == 'equilibrium') {
                                    A[i][j] +=  - (wallElement.uValue + wallElement.thermalBridge) * wallInstance.Area
                                } else {
                                    b[i] += (wallElement.uValue + wallElement.thermalBridge) * wallInstance.Area * otherSpace.temperature

                                }
                        }

                    });

                A[i][i] += 0.34 * space.ventilation.mechanical_supply_flowrate

                if (this.otherData.heatrecovery.checked) {

                    eta = this.otherData.heatrecovery.efficiency / 100.

                        this.spaces.forEach(extracted_space => {

                            if (extracted_space.type == "heated" && extracted_space.ventilation.mechanical_extract_flowrate > 0) {

                                if (extracted_space.heating_type == "equilibrium") {
                                    k = mapping.get(extracted_space.id)
                                        A[i][k] += -0.34 * eta * space.ventilation.mechanical_supply_flowrate * extracted_space.ventilation.mechanical_extract_flowrate / totalMechanicalExtractFlowrate
                                } else {
                                    b[i] += 0.34 * eta * space.ventilation.mechanical_supply_flowrate * extracted_space.ventilation.mechanical_extract_flowrate / totalMechanicalExtractFlowrate * extracted_space.temperature
                                }
                            }
                        })

                        b[i] += 0.34 * (1 - eta) * space.ventilation.mechanical_supply_flowrate * (Tout)
                } else {
                    b[i] += 0.34 * space.ventilation.mechanical_supply_flowrate * (Tout)
                }

                A[i][i] += 0.34 * space.ventilation.natural_supply_flowrate
                b[i] += 0.34 * space.ventilation.natural_supply_flowrate * (Tout)

                A[i][i] += 0.34 * space.ventilation.transfer_flowrate
                b[i] += 0.34 * space.ventilation.transfer_flowrate * space.ventilation.transfer_temperature

                var LIR = 0.1
                    var Q50 = this.getQ50()

                    var volumeRatio = space.volume / this.getTotalVolume()
                    var infiltration_flowrate = LIR * Q50 * volumeRatio + this.getExtractSurplus() * 0.5 * volumeRatio

                    A[i][i] += 0.34 * infiltration_flowrate
                    b[i] += 0.34 * infiltration_flowrate * (Tout)

                    var minFlowRate = 0.5 * space.volume
                    extraFlow = Math.max(0, minFlowRate - (space.ventilation.mechanical_supply_flowrate
                            +space.ventilation.natural_supply_flowrate
                            +space.ventilation.transfer_flowrate
                            +infiltration_flowrate))

                    A[i][i] += 0.34 * extraFlow
                    b[i] += 0.34 * extraFlow * (Tout)

                    i += 1

            });
        x = solveLinearSystem(A, b)

            i = 0
            unheatedSpaces.forEach(space => {
                space.temperature = x[i]
                    i += 1
            });

    }

}
