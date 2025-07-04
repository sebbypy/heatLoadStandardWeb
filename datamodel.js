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
                'choice': "n50",
                'value': 6,
                'v50_refsurface': 0
            },
			'reheat':{
				'inertia':'light',
				'setback_period':'-'
			}
        };
        this.zipCode = 1000
		this.airTransfers = {
			'transferFlows' : [],
			'transferFlowCalculation':'detailled',
			'transferCounter': 0,
		}
		this.subscribers = {}

    }
    createNewSpace(name) {
        this.spaces.push({
            type: "heated",
            name: name,
            id: this.spaceIdCounter,
            temperature: 20,
            floorarea: 10,
            volume: 25,
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
                "ventilation_loss": 0,
				"balance":0
            },
			heat_up_time:null,
			reheat_power: 0
        });
        this.spaceIdCounter++;

		this.notifySubscribers('spaces',this)

    }


	deleteSpace(spaceId){
		const isReferenced = this.wallInstances.some(wall => wall.spaces.includes(spaceId));

		if (isReferenced) {
			alert("Cannot delete this space because it is referenced in wall instances.");
		} else {
			// Proceed with deletion: Remove the space from the array
			this.spaces = this.spaces.filter(space => space.id !== spaceId);
			this.computeAll()

		}
		this.notifySubscribers('spaces',this)

	}

	renameSpace(id,newName){
		const index = this.spaces.findIndex(space => space.id === id);
		if (index !== -1) {  // Check if the space was found
			model.spaces[index].name = newName;
		} else {
			console.error("Space not found with id:", id);
		}
	}

	changeSpaceProperty(spaceId, property, value){
		console.log("change space property")
	    const space = this.spaces.find(space => space.id === spaceId);
		if (space) {
			space[property] = isNaN(Number(value)) ? value : Number(value);
		}
		this.computeAll()
		this.notifySubscribers('spaces',this)

	}


    setZip(zip) {
        this.zipCode = zip

    }

    getBoundaryTemperatures() {
        return getWeather("temperature", this.zipCode)
    }

    createNewBoundary(name, type = 'unheated', bc_type = 'outside') {
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
        this.wallInstanceID += 1;
        const newWallInstance = {
            id: this.wallInstanceID,
            spaces: [spaceId], // Initially only include the current space
            elementId: "", // Initialize without a type
            Area: 0, // Initialize with zero area
            transmissionLoss: 0 // Initialize with zero transmission loss
        };
        this.wallInstances.push(newWallInstance);
        //console.log(this.wallInstances)
    }

    createNewWallElement(name, uvalue = 0, bridge = 0) {

        this.wallElementsIdCounter++;

        const newWallElement = {
            name: name,
            id: this.wallElementsIdCounter,
            uValue: uvalue, // Assuming default values or form inputs can populate these
            thermalBridge: bridge // Assuming default values or form inputs can populate these
        };

        this.wallElements.push(newWallElement);
    }

	renameWallElement(elementId,name){
	    const element = this.wallElements.find(element => element.id === elementId);
		if (element) {
			element.name = name;
		}
	}
	
	deleteWallElement(wallElementId){
		// Check if the wall element is referenced in any wall instances
		const isReferenced = this.wallInstances.some(wall => wall.elementId === wallElementId);

		if (isReferenced) {
			console.log("Cannot delete this wall element because it is referenced in wall instances.");
		} else {
			// Proceed with deletion: Remove the wall element from the array
			model.wallElements = model.wallElements.filter(wElement => wElement.id !== wallElementId);
		}

	}
	
	changeWallUvalue(wallElementId, newUValue) {
		const welement = this.wallElements.find(element => element.id === wallElementId);
		if (welement) {
			welement.uValue = parseFloat(newUValue);
		}
		this.computeAll()
	}

	changeWallBridgeValue(wallElementId, newThermalBridge) {
		const welement = this.wallElements.find(welement => welement.id === wallElementId);
		if (welement) {
			welement.thermalBridge = parseFloat(newThermalBridge);
		}
		this.computeAll()
	}

	changeWallInstancearea(wallId,newArea){
		const wallInstance = this.wallInstances.find(m => m.id === wallId);
		if (wallInstance) {
			wallInstance.Area = Number(newArea);
			this.computeAll()
		}
	}
	
	changeWallInstanceType(wallId,newTypeId){
		wallId = Number(wallId);  // Convert to number
		newTypeId = Number(newTypeId);
		const wallInstance = this.wallInstances.find(m => m.id === wallId);
		if (wallInstance) {
			wallInstance.elementId = newTypeId;
		} else {
			console.error('Mur not found with id:', wallId);
		}
		
		this.computeAll()
	}

	changeWallInstanceNeighbour(wallId, newSpaceId){
		wallId = Number(wallId);  // Convert to number
		newSpaceId = Number(newSpaceId);

		// Find the wall object in wallInstances array with the given id
		const wallInstance = this.wallInstances.find(m => m.id === wallId);
		if (wallInstance) {
			if (wallInstance.spaces.length === 1) {
				wallInstance.spaces.push(newSpaceId); // Add new linked space if only one was initially present
			} else {
				wallInstance.spaces[1] = newSpaceId; // Replace existing linked space
			}
			
		} else {
			console.error('Mur not found with id:', wallId);
		}

		this.computeAll()
	}

	deleteWallInstance(wallInstanceId){
		this.wallInstances = this.wallInstances.filter(wall => wall.id !== wallInstanceId);
		this.computeAll()
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
		
		this.spaces.forEach((space, index) => {
			var spaceTotalLoss = 0
			var spaceTotalSurface = 0
			if (space.type == "heated"){
				this.wallInstances
					.filter(wall => wall.spaces.includes(space.id))
					.forEach(wall => {
						const linkedSpaceId = wall.spaces.find(id => id !== space.id);
						const linkedSpace = model.spaces.find(e => e.id === linkedSpaceId);

						const multiplier = wall.spaces.indexOf(space.id) === 0 ? 1 : -1;
						spaceTotalLoss += multiplier * wall.transmissionLoss;
						spaceTotalSurface += wall.Area;
					})
				space.transmission_heat_loss = spaceTotalLoss
		
			}
			

		
    })
	}

	createTransferFlow(fromSpaceId,toSpaceId,flowrate){
		
		this.airTransfers.transferCounter += 1
		this.airTransfers.transferFlows.push({"id":this.airTransfers.transferCounter,"from":fromSpaceId,"to":toSpaceId,"flowrate":flowrate})
		this.computeTransferProperties()
		this.computeFlowBalance()

	}		

	deleteTransferFlow(transferFlowId){
		this.airTransfers.transferFlows = this.airTransfers.transferFlows.filter(transferFlow => transferFlow.id !== transferFlowId);
		this.computeTransferProperties()
		this.computeFlowBalance()		
		this.computeAll()
	}

	changeTransferFlow(transferFlowId,fromSpaceId,toSpaceId,flowrate){
		var transferFlow = this.airTransfers.transferFlows.find(e => e.id == transferFlowId)
		if (transferFlow){
			console.log("change transfer")
			transferFlow.from = fromSpaceId
			transferFlow.to = toSpaceId
			transferFlow.flowrate = flowrate
		}
		this.computeTransferProperties()
		this.computeFlowBalance()
		this.computeAll()
	}
	
	computeTransferProperties(){

		if (this.airTransfers.transferFlowCalculation != 'detailled'){
			return
		}

		//console.log("compute transfer properties")
		this.spaces.forEach((space, index) => {
			
			if (space.type == "heated"){

				var transferTemperature=0
				const incomingFlows = this.airTransfers.transferFlows.filter(flow => flow.to === space.id);
				const totalFlow = incomingFlows.reduce((sum, flow) => sum + flow.flowrate, 0);

				if (totalFlow === 0) transferTemperature=0; // Avoid division by zero

				const weightedSum = incomingFlows.reduce((sum, flow) => {
					const fromSpace = this.getSpace(flow.from);
					return sum + flow.flowrate * fromSpace.temperature;
				}, 0);

				transferTemperature = weightedSum / totalFlow;
				
				space.ventilation.transfer_flowrate = totalFlow
				space.ventilation.transfer_temperature = Number.isNaN(transferTemperature) ? space.temperature:transferTemperature
			}
		
		})
		
	}
		
	computeFlowBalance(){
		this.spaces.forEach((space,index) => {
			if (space.type == "heated"){

				//console.log(space)
				//console.log(this.airTransfers.transferFlows)
				const incomingTransferFlows = this.airTransfers.transferFlows.filter(flow => flow.to === space.id);
				const outgoingTransferFlows = this.airTransfers.transferFlows.filter(flow => flow.from === space.id);
				//console.log(incomingTransferFlows)
				var balance = incomingTransferFlows.reduce((accumulator, currentValue) => { return accumulator + currentValue.flowrate},0)
				//console.log(balance)
				balance += -1*outgoingTransferFlows.reduce((accumulator, currentValue) => { return accumulator + currentValue.flowrate},0)
				balance += space.ventilation.mechanical_supply_flowrate
				balance += -1*space.ventilation.mechanical_extract_flowrate
				balance += space.ventilation.natural_supply_flowrate
			
				space.ventilation.balance = balance
			}

		})
		
	}
	

	changeVentilationProperty(spaceId, property, value){
		var space = this.spaces.find(e => e.id === spaceId);
		if (space) {
			space.ventilation[property] = value;
			this.computeAll()
			this.computeFlowBalance()
		}
		
	}

	changeHeatRecoveryEnabled(value){
		this.otherData['heatrecovery']['checked']=value
		this.computeAll()
	}

	changeHeatRecoveryEfficiency(value){
		this.otherData['heatrecovery']['efficiency'] = value;
		this.computeAll()
	}

	changeAirThightnessInputs(choice,value,area){
		this.otherData['airtightness']['choice']=choice
		this.otherData['airtightness']['value'] = value;
		this.otherData['airtightness']['v50_refsurface'] = area;
		this.computeAll()
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

        if (this.otherData.airtightness.choice == 'n50') {
            return this.otherData.airtightness.value * this.getTotalVolume()
        } else if (this.otherData.airtightness.choice == 'v50') {
            return this.otherData.airtightness.value * this.otherData.airtightness.v50_refsurface
        }
    }

    getBoundaryConditionTypes() {
        return [{
                value: "outside",
                label: ""
            }, {
                value: "ground",
                label: ""
            }, {
                value: "other_heated",
                label: ""
            }, {
                value: "other_unheated",
                label: ""
            }
        ];
    }

    setDefaultBoundaryTemperatures() {
        const default_temps = this.getBoundaryTemperatures()

            this.spaces.forEach(space => {
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
                        space.temperature = default_temps[2]
                            break;
                    default:
                        space.temperature = default_temps[0]

                    }
                }
            });
		this.computeAll()

    }

    getTout() {
        return this.getSpace(0).temperature
    }

    getSpace(spaceid) {

		const space = this.spaces.find(s => s.id === spaceid);
    

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
            //console.log("total extract",totalMechanicalExtractFlowrate)
            if (totalMechanicalExtractFlowrate == 0) {
                this.otherData.heatrecovery.meanExtractTemperature = null
                    return
            }

            if (this.otherData.heatrecovery.checked == true) {
                var meanT = 0
                    this.spaces.forEach(extracted_space => {
                        if (extracted_space.type == "heated" && extracted_space.ventilation.mechanical_extract_flowrate > 0) {
                            //console.log(extracted_space.name,extracted_space.ventilation.mechanical_extract_flowrate,extracted_space.temperature)
                            meanT += extracted_space.ventilation.mechanical_extract_flowrate / totalMechanicalExtractFlowrate * extracted_space.temperature
                        }
                    })
                    this.otherData.heatrecovery.meanExtractTemperature = meanT
            } else {
                this.otherData.heatrecovery.meanExtractTemperature = null
            }
            //console.log("mean extract T",this.otherData.heatrecovery.meanExtractTemperature)
    }

    computeSupplyTemperature() {

        if (this.otherData.heatrecovery.checked && this.otherData.heatrecovery.meanExtractTemperature != null) {

            var eta = this.otherData.heatrecovery.efficiency / 100.
                this.otherData.heatrecovery.supplyTemperature = this.getTout() + eta * (this.otherData.heatrecovery.meanExtractTemperature - this.getTout())
        } else {
            this.otherData.heatrecovery.supplyTemperature = this.getTout()
        }
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

    getTotalFloorArea() {
        const totalFloorArea = this.spaces.reduce((acc, space) => {
            if ('floorarea' in space && !isNaN(parseFloat(space.floorarea))) {
                return acc + parseFloat(space.floorarea);
            }
            return acc;
        }, 0);
        return totalFloorArea

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

    getHeatedSpaces() {
        return this.spaces.filter(space => space.type === "heated");

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

        for (let we of this.wallElements) {
            if (we.id == elementid) {
                return we
            }
        }
        return null
    }

	setInertia(value) {
		console.log("in set inertia")
		if (value === "heavy" || value === "light") {
			this.otherData.reheat.inertia = value;
		} else {
			console.error("Invalid inertia value. Allowed values are 'heavy' or 'light'.");
		}
		this.computeReheat()
	}
	setSetbackPeriod(value) {
		const allowedValues = ['-', '8', '14', '62'];
		
		
		
		if (allowedValues.includes(value)) {
			this.otherData.reheat.setback_period = value;
		} else {
			console.error("Invalid setback period. Allowed values are null, 8, 14, or 62.");
		}
		this.computeReheat()
	}
	setSpaceHeatUpTime(spaceid,value){
		console.log("space id",spaceid)
		console.log("value",value)

		var space = this.getSpace(spaceid)
		space.heat_up_time = value
		this.computeReheat()
	}

	getInertia() {
		return this.otherData.reheat.inertia;
	}

	getSetbackPeriod() {
		return this.otherData.reheat.setback_period;
	}

	getSpaceHeatUpTime(spaceid) {
		let space = this.getSpace(spaceid);
		return space ? space.heat_up_time : null;
	}

	getReheatPower(spaceid){
			
		const preheatData = {
		8:
		 {light: {0.5:63,1:34,2:14,3:5,4:0,6:0,12:0},
		  heavy:{0.5:16,1:10,2:3,3:0,4:0,6:0,12:0}},
		 14:
		 {light:{0.5:88,1:50,2:28,3:17,4:11,6:3,12:0},
		  heavy:{0.5:38,1:29,2:18,3:12,4:7,6:1,12:0}},
		 62:
		 {light:{0.5:92,1:55,2:32,3:23,4:17,6:10,12:2},
		  heavy:{0.5:100,1:100,2:86,3:73,4:64,6:52,12:31}},
		 168:
		 {light: {0.5:92,1:55,2:32,3:23,4:17,6:10,12:2},
		  heavy:{0.5:100,1:100,2:100,3:100,4:95,6:81,12:57}}
		}
		  
	  	// Retrieve the relevant parameters
		const inertia = this.getInertia(); // 
		const setbackPeriod = this.getSetbackPeriod(); // 8, 14, 62, or 168
		const heatUpTime = this.getSpaceHeatUpTime(spaceid); // Numerical value
		
		//console.log("heatupTime",heatUpTime)

		// Validate retrieved values
		if (!preheatData[setbackPeriod]) {
			//console.error(`Invalid setback period: ${setbackPeriod}`);
			return null;
		}
		if (!preheatData[setbackPeriod][inertia]) {
			console.error(`Invalid inertia: ${inertia}`);
			return null;
		}
		if (!preheatData[setbackPeriod][inertia][heatUpTime]) {
			console.error(`Invalid heat-up time: ${heatUpTime}`);
			return null;
		}

		// Return the reheat power value
		return preheatData[setbackPeriod][inertia][heatUpTime];
	}
	  
	computeReheat(){
		this.spaces.forEach(space => {
			space.reheat_power = this.getReheatPower(space.id)*space.floorarea
		})
	}
	


    computeEquilibriumTemperatures() {
        // solve only for those who are not directly heated

        const {
            totalNaturalSupplyFlowrate,
            totalMechanicalSupplyFlowrate,
            totalMechanicalExtractFlowrate
        } = this.getTotalFlowRates()

            var Tout = this.getTout()

            var unheatedSpaces = this.getUnheatedSpaces()

            var nu = unheatedSpaces.length

            if (nu == 0) {
                return
            }

            var A = Array.from({
                length: nu
            }, () => Array(nu).fill(0));
        var b = Array(nu).fill(0);

        var i = 0

            // map space.id  with the row number in the matrix (i)
            var mapping = new Map()
            unheatedSpaces.forEach(uspace => {
                mapping.set(uspace.id, unheatedSpaces.indexOf(uspace))
            })

            unheatedSpaces.forEach(space => {

                var volumeRatio = space.volume / this.getTotalVolume()

                    //transmission losses

                    this.wallInstances.forEach(wallInstance => {

                        if (wallInstance.spaces.includes(space.id)) {

                            var wallElement = this.getWallElement(wallInstance.elementId)

                                var otherSpaceId = this.getOtherSpaceId(space.id, wallInstance.spaces)
                                var otherSpace = this.getSpace(otherSpaceId)
                                var j = mapping.get(otherSpaceId)

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

                    var eta = this.otherData.heatrecovery.efficiency / 100.

                        this.spaces.forEach(extracted_space => {

                            if (extracted_space.type == "heated" && extracted_space.ventilation.mechanical_extract_flowrate > 0) {

                                if (extracted_space.heating_type == "equilibrium") {
                                    var k = mapping.get(extracted_space.id)
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
                    var extraFlow = Math.max(0, minFlowRate - (space.ventilation.mechanical_supply_flowrate
                            +space.ventilation.natural_supply_flowrate
                            +space.ventilation.transfer_flowrate
                            +infiltration_flowrate))

                    A[i][i] += 0.34 * extraFlow
                    b[i] += 0.34 * extraFlow * (Tout)

                    i += 1

            });
        var x = solveLinearSystem(A, b)

            i = 0
            unheatedSpaces.forEach(space => {
                space.temperature = x[i]
                    i += 1
            });

    }

	computeAll(){
		console.log("compute all")
		this.computeEquilibriumTemperatures()
		this.computeExtractMeanTemperature()
		this.computeSupplyTemperature()
		this.computeTransferProperties()
		this.computeAllWallInstanceLosses()
		this.computeAllVentilationLosses()
		this.computeReheat()
		
		this.notifySubscribers("heaload_changed",this)	
		
	}
	
	getSpaceHeatLoss(spaceid) {
        space = this.getSpace(spaceid)
		if (!space) {
            console.error(`Space with ID ${spaceid} not found.`);
            return null;
        }
		

        // Sum of transmission and ventilation heat losses
        const totalHeatLoss = space.transmission_heat_loss + space.ventilation.ventilation_loss;
        return totalHeatLoss;
    }
		
	
	getAllSpacesLosses(){
		var losses = {}
		spaces.forEach(space=>{
			if (space.type == "heated"){
				losses[space.id] = this.getSpaceHeatLoss(space.id)
			}
		})
				

	
	}


	//subscribe function so that other classes can be notified when there is a change
	subscribe(event, callback) {
		if (!this.subscribers[event]) {
			this.subscribers[event] = [];
		}
		this.subscribers[event].push(callback);
	}

	notifySubscribers(event, value) {
		if (this.subscribers[event]) {
			this.subscribers[event].forEach(callback => callback(value));
		}
	}


}


class VentilationModel {
    constructor(mainModel) {
        this.projectType = null;
        this.systemType = null;
        this.spaces = {};

		this.spaceData = {
			residential: {
				living: { subtype: 'dry', min: 75, max: 150 },
				other_dry: { subtype: 'dry', min: 25, max: 72 },
				kitchen: { subtype: 'wet', min: 50, max: 75 },
				bathroom: { subtype: 'wet', min: 50, max: 75 },
				WC: { subtype: 'wet', min: 25, max: 25 }
			},
			non_residential : {
				"ventilation_nr_horeca": {
					"ventilation_nr_restaurants_cafeteria_buffet_fast_food_canteen_bars_cocktail_bar": { "people_density": 1.5 },
					"ventilation_nr_kitchens_kitchenettes": { "people_density": 10 }
				},
				"ventilation_nr_hotels_motels_holiday_centers": {
					"ventilation_nr_hotel_motel_holiday_center_bedrooms": { "people_density": 10 },
					"ventilation_nr_holiday_center_dormitories": { "people_density": 5 },
					"ventilation_nr_lobby_entrance_hall": { "people_density": 2 },
					"ventilation_nr_meeting_room_gathering_space_multipurpose_room": { "people_density": 2 }
				},
				"ventilation_nr_office_buildings": {
					"ventilation_nr_office": { "people_density": 15 },
					"ventilation_nr_reception_areas_meeting_rooms": { "people_density": 3.5 },
					"ventilation_nr_main_entrance": { "people_density": 10 }
				},
				"ventilation_nr_public_places": {
					"ventilation_nr_departure_hall_waiting_room": { "people_density": 1 },
					"ventilation_nr_library": { "people_density": 10 }
				},
				"ventilation_nr_public_gathering_places": {
					"ventilation_nr_church_religious_buildings_government_buildings_courtrooms_museums_galleries": { "people_density": 2.5 }
				},
				"ventilation_nr_retail_trade": {
					"ventilation_nr_sales_area_shop_except_shopping_centers": { "people_density": 7 },
					"ventilation_nr_shopping_center": { "people_density": 2.5 },
					"ventilation_nr_hair_salon_beauty_institute": { "people_density": 4 },
					"ventilation_nr_furniture_carpet_textile_stores": { "people_density": 20 },
					"ventilation_nr_supermarket_department_store_pet_store": { "people_density": 10 },
					"ventilation_nr_laundromat": { "people_density": 5 }
				},
				"ventilation_nr_sports_and_leisure": {
					"ventilation_nr_sports_hall_stadiums_gym": { "people_density": 3.5 },
					"ventilation_nr_changing_rooms": { "people_density": 2 },
					"ventilation_nr_spectator_area_stands": { "people_density": 1 },
					"ventilation_nr_nightclub_dancing": { "people_density": 1 },
					"ventilation_nr_sports_club_aerobics_fitness_bowling_club": { "people_density": 10 }
				},
				"ventilation_nr_workspaces": {
					"ventilation_nr_photography_studio_darkroom": { "people_density": 10 },
					"ventilation_nr_pharmacy_preparation_room": { "people_density": 10 },
					"ventilation_nr_bank_counters_vaults_public_access": { "people_density": 20 },
					"ventilation_nr_copying_room_printer_room": { "people_density": 10 },
					"ventilation_nr_computer_room_without_printer_room": { "people_density": 25 }
				},
				"ventilation_nr_educational_institutions": {
					"ventilation_nr_classrooms": { "people_density": 4 },
					"ventilation_nr_multipurpose_room": { "people_density": 1 }
				},
				"ventilation_nr_healthcare": {
					"ventilation_nr_common_room": { "people_density": 10 },
					"ventilation_nr_treatment_examination_rooms": { "people_density": 5 },
					"ventilation_nr_operating_delivery_rooms_recovery_intensive_care_physiotherapy_rooms": { "people_density": 5 }
				},
				"ventilation_nr_penitentiary_establishments": {
					"ventilation_nr_cells_common_room": { "people_density": 4 },
					"ventilation_nr_surveillance_posts": { "people_density": 7 },
					"ventilation_nr_registration_guard_room": { "people_density": 2 }
				},
				"ventilation_nr_other_spaces": {
					"ventilation_nr_storage_room": { "people_density": 100 },
					"ventilation_nr_other_spaces": { "people_density": 15 }
				}
			}



		};

        // Generate a lookup table for non-residential spaces
        this.nonResidentialLookup = {};
        Object.entries(this.spaceData.non_residential).forEach(([category, spaces]) => {
            Object.entries(spaces).forEach(([spaceType, data]) => {
                this.nonResidentialLookup[spaceType] = { category, ...data };
            });
        });

        mainModel.subscribe("spaces", (mainModel) => {
            this.setSpaces(mainModel.spaces);
            this.computeMinimumFlows(mainModel);
			//this.computeTransferProperties();
        });
    }

    setSystemType(type) {
        if (!["A","B","C","D"].includes(type)) {
            //console.log("not ok");
            return;
        }

        this.systemType = type;
    }
	


    getSpaceInfo(spaceType) {
        return this.spaceData.residential[spaceType] || this.nonResidentialLookup[spaceType] || null;
    }

    getPossibleSpaceTypes(type = 'all') {
        if (type === 'all') {
            return [
                ...Object.keys(this.spaceData.residential),
                ...Object.keys(this.nonResidentialLookup) // Extract space types directly
            ];
        } else if (type === 'residential') {
            return Object.keys(this.spaceData.residential);
        } else if (type === 'non_residential') {
            return Object.keys(this.nonResidentialLookup);
        } else {
            return [];
        }
    }
	
		
	
	getSpaceTypePeopleDensity(spaceType) {
    if (!spaceType) return null;  // Ensure spaceType is valid

    // Check if spaceType exists in the non-residential lookup table
    const info = this.nonResidentialLookup[spaceType];
    return info ? info.people_density : null;
}

	

	isSpaceUndefined(spaceid) {
		return this.spaces[spaceid].spaceType == null ? true : false;
	}


	isSpaceResidential(spaceid) {
		return spaceid in this.spaces && this.getPossibleSpaceTypes('residential').includes(this.spaces[spaceid].spaceType);
	}

	isSpaceNonResidential(spaceid) {
		return spaceid in this.spaces && this.getPossibleSpaceTypes('non_residential').includes(this.spaces[spaceid].spaceType);
	}

    setSpaces(mainModelSpaces) {
        const existingSpaceIds = new Set(mainModelSpaces.map(space => String(space.id)));

        // Remove old spaces
        Object.keys(this.spaces).forEach(id => {
            if (!existingSpaceIds.has(id)) {
                delete this.spaces[id];
            }
        });

        // Add new spaces
        mainModelSpaces.forEach(space => {
            if (!this.spaces[space.id]) {
                this.spaces[space.id] = {
                    minSupply: null,
                    minExtract: null,
                    spaceType: null
                };
            }
        });
    }

    setSpaceType(spaceid, spaceType) {
        if (!this.getPossibleSpaceTypes().includes(spaceType)) {
            //console.log("Invalid space type");
            return;
        }
        this.spaces[spaceid].spaceType = spaceType;
    }

    computeMinimumFlows(mainModel) {
        Object.keys(this.spaces).forEach(spaceid => {
            if (this.isSpaceResidential(spaceid)) {
                this.computeResidentialFlow(spaceid, mainModel);
            } else if (this.isSpaceNonResidential(spaceid)) {
                this.computeNonResidentialFlow(spaceid, mainModel);
            }
        });
    }

    computeResidentialFlow(spaceid, mainModel) {
        const spaceType = this.spaces[spaceid].spaceType;
        if (!spaceType) return;

        const info = this.getSpaceInfo(spaceType);
        if (!info) return;

        let flow = 3.6 * mainModel.getSpace(spaceid).floorarea;
        flow = Math.max(info.min, flow);
        flow = Math.min(info.max, flow);

        if (info.subtype === 'dry') {
            this.spaces[spaceid].minSupply = flow;
			this.spaces[spaceid].minExtrat = 0;
			
        } else if (info.subtype === 'wet') {
            this.spaces[spaceid].minExtract = flow;
            this.spaces[spaceid].minSupply = 0;
        }
    }

    computeNonResidentialFlow(spaceid, mainModel) {
        const spaceType = this.spaces[spaceid].spaceType;
        if (!spaceType) return;

        const info = this.nonResidentialLookup[spaceType];
        if (!info) return;

        const peopleDensity = info.people_density;
        const peopleCount = Math.ceil(peopleDensity / mainModel.getSpace(spaceid).floorarea);
        const flow = peopleCount * 22;  

        this.spaces[spaceid].minSupply = flow;
        this.spaces[spaceid].minExtract = 0;
    }

    applyMinimumFlows(mainModel) {
		//console.log("apply min flow")
		//console.log("main mode",mainModel)
        mainModel.spaces.forEach(space => {

            if (space.type == "heated") {
				const spaceid = space.id;
				if (this.systemType === 'C') {
					space.ventilation.natural_supply_flowrate = this.spaces[spaceid].minSupply;
					space.ventilation.mechanical_extract_flowrate = this.spaces[spaceid].minExtract;
				}
				if (this.systemType === 'D') {
					//console.log("in D")
					space.ventilation.mechanical_supply_flowrate = this.spaces[spaceid].minSupply;
					space.ventilation.mechanical_extract_flowrate = this.spaces[spaceid].minExtract;
				}
			}
        });
    }

    getNonResidentialCategories() {
        return Object.keys(this.spaceData.non_residential);
    }

    getNonResidentialTypes(category) {
        return this.spaceData.non_residential[category] ? Object.keys(this.spaceData.non_residential[category]) : [];
    }
}


function createTestModel() {

    var model = new DataModel();

    model.createNewWallElement("Mur ext", 0.24, 0.02)
    model.createNewWallElement("Toit", 0.24, 0.02)
    model.createNewWallElement("Menuiseries DV", 1.5, 0.0)

    model.createNewSpace("Séjour")
    model.createNewSpace("Cuisine")
    model.createNewSpace("Chambre")
	model.createNewSpace("Salle de bain")

	model.setInertia("light")
	model.setSetbackPeriod(8)
	model.setSpaceHeatUpTime(1,2)
	


    vModel = new VentilationModel(model)
	vModel.setSystemType("C")
	vModel.setSpaces(model.spaces)
	
	
	vModel.setSpaceType(0,'living')
	vModel.setSpaceType(1,'kitchen')
	vModel.setSpaceType(2,'other_dry')
	vModel.setSpaceType(3,'bathroom')

	vModel.computeMinimumFlows(model)
	vModel.applyMinimumFlows(model)
	
	model.changeSpaceProperty(3,'floorarea',30)


	model.changeSpaceProperty(0,'temperature',21)
	model.changeSpaceProperty(1,'temperature',22)
	model.changeSpaceProperty(2,'temperature',23)
	model.changeSpaceProperty(3,'temperature',24)
	

	model.createTransferFlow(0,1,55)
	model.createTransferFlow(1,2,56)
	model.createTransferFlow(0,2,44)
	model.createTransferFlow(2,0,57)

	model.changeTransferFlow(1,0,1,75)
	model.computeTransferProperties()

	//console.log(model.getReheatPower(1))
	
	//model.computeReheat()
	model.spaces.forEach(space => {console.log(space)})
	console.log(model.transferFlows)
	
	return model

}

createTestModel()
