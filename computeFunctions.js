

function computeWallInstanceLoss(wallInstance, spaces, wallElements, wallInstances) {

	const wall = wallElements.find(wall => wall.id === wallInstance.elementId);
	var heatLoss = 0

	// Find the temperatures of the connected spaces
	const spaceTemps = wallInstance.spaces.map(spaceId => {
		const space = spaces.find(s => s.id === spaceId);
		return space ? parseFloat(space.temperature) : null;
	});


	// Ensure we have two valid temperatures before computing the heat loss
	if (spaceTemps.length === 2 && spaceTemps[0] != null && spaceTemps[1] != null) {
		const deltaT = spaceTemps[0] - spaceTemps[1];
		heatLoss = wallInstance.Area*(wall.uValue + wall.thermalBridge) * deltaT;
	}
	wallInstance.transmissionLoss = heatLoss
		
}

function getQ50(){
	
	return otherData.airtightness.value*getTotalVolume()
	
}

function getTout(){
	return getSpace(0).temperature
}



function computeAllWallInstanceLosses(){

	wallInstances.forEach(wallInstance => {computeWallInstanceLoss(wallInstance,spaces,wallElements,wallInstances)});
}

function computeExtractMeanTemperature(){
	const {totalNaturalSupplyFlowrate,totalMechanicalSupplyFlowrate,totalMechanicalExtractFlowrate} = getTotalFlowRates()

	if (totalMechanicalExtractFlowrate==0){
		otherData.heatrecovery.meanExtractTemperature = null
		return
	}

	if (otherData.heatrecovery.checked==true){
		var meanT=0
		spaces.forEach(extracted_space =>{
			if (extracted_space.type == "heated" && extracted_space.ventilation.mechanical_extract_flowrate > 0){
				
					meanT += extracted_space.ventilation.mechanical_extract_flowrate/totalMechanicalExtractFlowrate*extracted_space.temperature
			}
		})
		otherData.heatrecovery.meanExtractTemperature = meanT
	}
	else{
		otherData.heatrecovery.meanExtractTemperature = null
	}
}


function computeSupplyTemperature(){
	
	if (otherData.heatrecovery.checked && otherData.heatrecovery.meanExtractTemperature != null ){

		eta = otherData.heatrecovery.efficiency/100.
		otherData.heatrecovery.supplyTemperature  = getTout()+eta*(otherData.heatrecovery.meanExtractTemperature-getTout())
	}
	else{
		otherData.heatrecovery.supplyTemperature = getTout()
	}

}	

function computeVentilationLoss(space,spaces,otherData){

	var Tout = getTout()

	var volumeRatio = space.volume/getTotalVolume()
	var spaceExtractSurplus = 0.5*getExtractSurplus()*volumeRatio
		

	Q50 = getQ50()
	LIR = 0.10

	
	//loop
	var mechSupplyLoss = 0.34*space.ventilation.mechanical_supply_flowrate*(space.temperature-otherData.heatrecovery.supplyTemperature)
	var naturalSupplyLoss = 0.34*space.ventilation.natural_supply_flowrate*(space.temperature-Tout)
	var transferSupplyLoss = 0.34*space.ventilation.transfer_flowrate*(space.temperature-space.ventilation.transfer_temperature)
	
	var infiltrationFlowRate = Q50*LIR*volumeRatio + spaceExtractSurplus
	var infiltrationLoss = 0.34*infiltrationFlowRate*(space.temperature-Tout)
	
	console.log(Q50)
	console.log(volumeRatio)
	console.log(infiltrationFlowRate)
	console.log(Q50*LIR*volumeRatio)
	
	var minimalFlowRate = 0.5*space.volume
	var totalFlowRateWithoutMinimum = space.ventilation.natural_supply_flowrate + space.ventilation.transfer_flowrate + space.ventilation.mechanical_supply_flowrate + infiltrationFlowRate

	if (totalFlowRateWithoutMinimum < minimalFlowRate){
		var extraLossForMinimalFlowRate = 0.34*(minimalFlowRate-totalFlowRateWithoutMinimum)*(space.temperature - Tout)
	}
	else{
        extraLossForMinimalFlowRate  = 0
	}

	var loss = mechSupplyLoss + naturalSupplyLoss + transferSupplyLoss + infiltrationLoss + extraLossForMinimalFlowRate

	space.ventilation.ventilation_loss = loss

}

function computeAllVentilationLosses(){
	
	spaces.forEach(space => {
		if (space.type == "heated"){
			computeVentilationLoss(space,spaces,otherData)
		}
	})
}


function getTotalVolume(){
	const totalVolume = spaces.reduce((acc, space) => {
		if ('volume' in space && !isNaN(parseFloat(space.volume))) {
			return acc + parseFloat(space.volume);
		}
		return acc;
	}, 0);	
	return totalVolume
	

}



function getTotalFlowRates(){
	const totalNaturalSupplyFlowrate = spaces.reduce((acc, space) => {
		if (space.ventilation && 'natural_supply_flowrate' in space.ventilation && !isNaN(parseFloat(space.ventilation.natural_supply_flowrate))) {
			return acc + parseFloat(space.ventilation.natural_supply_flowrate);
		}
		return acc;
		}, 0);

	const totalMechanicalSupplyFlowrate = spaces.reduce((acc, space) => {
		if (space.ventilation && 'mechanical_supply_flowrate' in space.ventilation && !isNaN(parseFloat(space.ventilation.mechanical_supply_flowrate))) {
			return acc + parseFloat(space.ventilation.mechanical_supply_flowrate);
		}
		return acc;
	}, 0);

	const totalMechanicalExtractFlowrate = spaces.reduce((acc, space) => {
			if (space.ventilation && 'mechanical_extract_flowrate' in space.ventilation && !isNaN(parseFloat(space.ventilation.mechanical_extract_flowrate))) {
				return acc + parseFloat(space.ventilation.mechanical_extract_flowrate);
			}
			return acc;
		}, 0);

	return {totalNaturalSupplyFlowrate,totalMechanicalSupplyFlowrate,totalMechanicalExtractFlowrate}

}

function getExtractSurplus(){

	const {totalNaturalSupplyFlowrate,totalMechanicalSupplyFlowrate,totalMechanicalExtractFlowrate} = getTotalFlowRates()

	var totalExtractSurplus = totalMechanicalExtractFlowrate - totalMechanicalSupplyFlowrate - totalNaturalSupplyFlowrate
	
	if (totalExtractSurplus < 0 ){
		totalExtractSurplus = 0
	}

	return totalExtractSurplus

	
}

function getUnheatedSpaces(){
	
	return spaces.filter(space => space.heating_type === "equilibrium");
	
}

function getOtherSpaceId(spaceid,spaceslist){
	
	const copiedList = Array.from(spaceslist);

	if (copiedList.includes(spaceid)){
		copiedList.splice(copiedList.indexOf(spaceid), 1)
		return copiedList[0]
	}
	else{
		return  null
	}
}

function getWallElement(elementid){
	
	for (let we of wallElements){
		if (we.id==elementid)
		{
			return we
		}
	}
	return null
}

function getSpace(spaceid){
	
	for (let space of spaces){
		if (space.id == spaceid)
		{
			return space
		}
	}
	return null
}


function computeEquilibriumTemperatures(){
	// solve only for those who are not directly heated

	const {totalNaturalSupplyFlowrate,totalMechanicalSupplyFlowrate,totalMechanicalExtractFlowrate} = getTotalFlowRates()


	var Tout = getTout()

	unheatedSpaces = getUnheatedSpaces()
	nu = unheatedSpaces.length

	if (nu==0){
		return 
	}

    A = Array.from({ length: nu }, () => Array(nu).fill(0));
    b = Array(nu).fill(0);

	
	
	var i = 0

	// map space.id  with the row number in the matrix (i)
	mapping = new Map()
	unheatedSpaces.forEach(uspace =>{mapping.set(uspace.id,unheatedSpaces.indexOf(uspace))})

	
	unheatedSpaces.forEach(space =>{
	
		var volumeRatio = space.volume/getTotalVolume()
		
		//transmission losses
		
		wallInstances.forEach(wallInstance =>{
			
			if (wallInstance.spaces.includes(space.id)){
				
				wallElement = getWallElement(wallInstance.elementId)
				
				var otherSpaceId = getOtherSpaceId(space.id,wallInstance.spaces)
				otherSpace = getSpace(otherSpaceId)
				j = mapping.get(otherSpaceId)
	
				A[i][i] += (wallElement.uValue+wallElement.thermalBridge)*wallInstance.Area
				
				if (otherSpace.heating_type == 'equilibrium'){
					A[i][j] += -(wallElement.uValue+wallElement.thermalBridge)*wallInstance.Area
				}
				else{
					b[i] += (wallElement.uValue+wallElement.thermalBridge)*wallInstance.Area*otherSpace.temperature
		
				}
			}
		
			});
		
		A[i][i] += 0.34*space.ventilation.mechanical_supply_flowrate
		
		if (otherData.heatrecovery.checked){

			eta = otherData.heatrecovery.efficiency/100.

			spaces.forEach(extracted_space =>{
				
				if (extracted_space.type == "heated" && extracted_space.ventilation.mechanical_extract_flowrate > 0){
					
					if (extracted_space.heating_type == "equilibrium"){
						k = mapping.get(extracted_space.id)
						A[i][k] +=  -0.34*eta*space.ventilation.mechanical_supply_flowrate*extracted_space.ventilation.mechanical_extract_flowrate/totalMechanicalExtractFlowrate
					}
					else{
						b[i] += 0.34*eta*space.ventilation.mechanical_supply_flowrate*extracted_space.ventilation.mechanical_extract_flowrate/totalMechanicalExtractFlowrate*extracted_space.temperature
					}
				}
			})
		
			b[i] += 0.34*(1-eta)*space.ventilation.mechanical_supply_flowrate*(Tout)
		}
		else{
			b[i] += 0.34*space.ventilation.mechanical_supply_flowrate*(Tout)
		}
		
		A[i][i] += 0.34*space.ventilation.natural_supply_flowrate
		b[i] += 0.34*space.ventilation.natural_supply_flowrate*(Tout)
		
		A[i][i] += 0.34*space.ventilation.transfer_flowrate
		b[i] += 0.34*space.ventilation.transfer_flowrate*space.ventilation.transfer_temperature


		var LIR = 0.1
		var Q50 = getQ50()
		

		var volumeRatio = space.volume/getTotalVolume()
		var infiltration_flowrate = LIR*Q50*volumeRatio + getExtractSurplus()*0.5*volumeRatio
		
		A[i][i] += 0.34*infiltration_flowrate
		b[i] += 0.34*infiltration_flowrate*(Tout)
	
		var minFlowRate = 0.5*space.volume
		extraFlow = Math.max(0,minFlowRate-( space.ventilation.mechanical_supply_flowrate
											+space.ventilation.natural_supply_flowrate
											+space.ventilation.transfer_flowrate
											+infiltration_flowrate))

	
		A[i][i] += 0.34*extraFlow
		b[i] += 0.34*extraFlow*(Tout)
		
	
		i += 1
		
	});
	x = solveLinearSystem(A,b)
	
	i=0
	unheatedSpaces.forEach(space => {
		space.temperature = x[i]
		i+=1
	});
	
	
}

function test(){

    global.spaces= [
        {
            "type": "heated",
            "name": "Espace 1",
            "id": 1,
            "temperature": "20",
            "floorarea": "10",
            "volume": "30",
            "heating_type": "equilibrium",
            "ventilation": {
                "natural_supply_flowrate": "0",
                "mechanical_supply_flowrate": "20",
                "transfer_flowrate": 0,
                "transfer_temperature": "18",
                "mechanical_extract_flowrate": 0,
                "ventilation_loss": 306.30297029702973
            },
            "transmission_heat_loss": 1
        },
        {
            "type": "heated",
            "name": "Espace Z",
            "id": 2,
            "temperature": "18",
            "floorarea": "10",
            "volume": "30",
            "heating_type": "equilibrium",
            "ventilation": {
                "natural_supply_flowrate": 0,
                "mechanical_supply_flowrate": "20",
                "transfer_flowrate": 0,
                "transfer_temperature": "18",
                "mechanical_extract_flowrate": 0,
                "ventilation_loss": 283.61386138613864
            },
            "transmission_heat_loss": 93
        },
        {
            "type": "heated",
            "name": "Espace X",
            "id": 5,
            "temperature": "14",
            "floorarea": "10",
            "volume": "30",
            "heating_type": "radiators",
            "ventilation": {
                "natural_supply_flowrate": 0,
                "mechanical_supply_flowrate": 0,
                "transfer_flowrate": "40",
                "transfer_temperature": "15",
                "mechanical_extract_flowrate": "40",
                "ventilation_loss": 81.83564356435645
            },
            "transmission_heat_loss": -4
        },
        {
            "type": "outside",
            "name": "Environnement 7",
            "id": 7,
            "temperature": -7,
            "transmission_heat_loss": -15
        },
        {
            "type": "unheated",
            "name": "Environnement 8",
            "id": 8,
            "temperature": -3.2,
            "transmission_heat_loss": -94
        },
        {
            "type": "heated",
            "name": "Espace 9",
            "id": 9,
            "temperature": 20,
            "floorarea": "7",
            "volume": "11",
            "heating_type": "radiators",
            "ventilation": {
                "natural_supply_flowrate": 0,
                "mechanical_supply_flowrate": 0,
                "transfer_flowrate": "12",
                "transfer_temperature": "17",
                "mechanical_extract_flowrate": "30",
                "ventilation_loss": 38.23485148514852
            },
            "transmission_heat_loss": 19
        }
    ]
    global.wallElements = [
        {
            "name": "Mur 1",
            "id": 1,
            "uValue": 0.24,
            "thermalBridge": 0
        },
        {
            "name": "Mur 2",
            "id": 2,
            "uValue": 0.24,
            "thermalBridge": 0.05
        }
    ]
    global.wallInstances = [
        {
            "id": 0,
            "spaces": [
                1,
                2
            ],
            "elementId": 2,
            "Area": 2,
            "transmissionLoss": "1"
        },
        {
            "id": 1,
            "spaces": [
                5,
                7
            ],
            "elementId": 1,
            "Area": 3,
            "transmissionLoss": "15"
        },
        {
            "id": 2,
            "spaces": [
                9,
                5
            ],
            "elementId": 2,
            "Area": 11,
            "transmissionLoss": "19"
        },
        {
            "id": 3,
            "spaces": [
                2,
                8
            ],
            "elementId": 2,
            "Area": 13,
            "transmissionLoss": "94"
        }
    ]
    global.otherData = {
        "heatrecovery": {
            "checked": true,
            "efficiency": "75"
        },
        "airtightness": {
            "choice": "n50",
            "value": "10"
        }
    }

//loading linear solver
const fs = require('fs');
const path = './solveLinearSystem.js'
const fileContent = fs.readFileSync(path, 'utf-8');
// Execute the content of the file
eval(fileContent);

global.solveLinearSystem = solveLinearSystem

computeEquilibriumTemperatures()
}

//test()