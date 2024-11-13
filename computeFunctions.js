/*const spaces = [{
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
            "mechanical_extract_flowrate": 0
        }
    }, {
        "type": "heated",
        "name": "Espace Z",
        "id": 2,
        "temperature": "18",
        "floorarea": "10",
        "volume": "30",
        "heating_type": "radiateurs",
        "ventilation": {
            "natural_supply_flowrate": 0,
            "mechanical_supply_flowrate": "20",
            "transfer_flowrate": 0,
            "transfer_temperature": "18",
            "mechanical_extract_flowrate": 0
        }
    }, {
        "type": "heated",
        "name": "Espace X",
        "id": 5,
        "temperature": "14",
        "floorarea": "10",
        "volume": "30",
        "heating_type": "",
        "ventilation": {
            "natural_supply_flowrate": 0,
            "mechanical_supply_flowrate": 0,
            "transfer_flowrate": "40",
            "transfer_temperature": "15",
            "mechanical_extract_flowrate": "40"
        }
    }, {
        "type": "outside",
        "name": "Environnement 7",
        "id": 7,
        "temperature": -7
    }, {
        "type": "unheated",
        "name": "Environnement 8",
        "id": 8,
        "temperature": -7
    }, {
        "type": "heated",
        "name": "Espace 9",
        "id": 9,
        "temperature": 20,
        "floorarea": "7",
        "volume": "11",
        "heating_type": "",
        "ventilation": {
            "natural_supply_flowrate": 0,
            "mechanical_supply_flowrate": 0,
            "transfer_flowrate": "12",
            "transfer_temperature": "17",
            "mechanical_extract_flowrate": "30"
        }
    }
]
const wallElements = [{
        "name": "Mur 1",
        "id": 1,
        "uValue": 1,
        "thermalBridge": 0
    }, {
        "name": "Mur 2",
        "id": 2,
        "uValue": 1,
        "thermalBridge": 0
    }
]
const wallwallInstances = [{
        "id": 0,
        "spaces": [
            1,
            2
        ],
        "elementId": 1,
        "Area": 2
    }, {
        "id": 1,
        "spaces": [
            5,
            7
        ],
        "elementId": 1,
        "Area": 3
    }, {
        "id": 2,
        "spaces": [
            9,
            5
        ],
        "elementId": 2,
        "Area": 11
    }, {
        "id": 3,
        "spaces": [
            2,
            8
        ],
        "elementId": 2,
        "Area": 13
    }
]
const otherData = {
    "heatrecovery": {
        "checked": true,
        "efficiency": "75"
    },
    "airtightness": {
        "choice": "n50",
        "value": "10"
    }
}
*/
function computeWallInstanceHeatLoss(wallInstance, spaces, wallElements, wallwallInstances) {

	const wall = wallElements.find(wall => wall.id === wallInstance.elementId);


	// Find the temperatures of the connected spaces
	const spaceTemps = wallInstance.spaces.map(spaceId => {
		const space = spaces.find(s => s.id === spaceId);
		return space ? parseFloat(space.temperature) : null;
	});

	// Ensure we have two valid temperatures before computing the heat loss
	if (spaceTemps.length === 2 && spaceTemps[0] != null && spaceTemps[1] != null) {
		const deltaT = spaceTemps[0] - spaceTemps[1];
		const heatLoss = wallInstance.Area*(wall.uValue + wall.thermalBridge) * deltaT;
		return heatLoss;
        } else {
            // Handle the case where one or both temperatures might be undefined
            return 0;
        }
}



function computeVentilationLoss(space,spaces,otherData){

	n50 = otherData.airtightness.value

	const totalVolume = spaces.reduce((acc, space) => {
		if ('volume' in space && !isNaN(parseFloat(space.volume))) {
			return acc + parseFloat(space.volume);
		}
		return acc;
	}, 0);	

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

	var volumeRatio = space.volume/totalVolume

	var totalExtractSurplus = totalMechanicalExtractFlowrate - totalMechanicalSupplyFlowrate - totalNaturalSupplyFlowrate
	if (totalExtractSurplus > 0 ){
		spaceExtractSurplus = 0.5*volumeRatio*totalExtractSurplus
	}
	else{
	spaceExtractSurplus = 0 
	}
		

	Q50 = n50*totalVolume*volumeRatio
	console.log("Q50",Q50)
	LIR = 0.10

	var outdoorTemperature = -7
	
	//loop
	var mechSupplyLoss = 0.34*space.ventilation.mechanical_supply_flowrate*(space.temperature-outdoorTemperature)
	var naturalSupplyLoss = 0.34*space.ventilation.natural_supply_flowrate*(space.temperature-outdoorTemperature)
	var transferSupplyLoss = 0.34*space.ventilation.transfer_flowrate*(space.temperature-space.ventilation.transfer_temperature)
	
	var infiltrationFlowRate = Q50*LIR*volumeRatio + spaceExtractSurplus
	console.log(infiltrationFlowRate)
	var infiltrationLoss = 0.34*infiltrationFlowRate*(space.temperature-outdoorTemperature)
	
	var minimalFlowRate = 0.5*space.volume
	var totalFlowRateWithoutMinimum = space.ventilation.natural_supply_flowrate + space.ventilation.transfer_flowrate + space.ventilation.mechanical_supply_flowrate

	if (totalFlowRateWithoutMinimum < minimalFlowRate){
		var extraLossForMinimalFlowRate = 0.34*(minimalFlowRate-totalFlowRateWithoutMinimum)*(space.temperature - outdoorTemperature)
	}
	else{
        extraLossForMinimalFlowRate  = 0
	}

	var loss = mechSupplyLoss + naturalSupplyLoss + transferSupplyLoss + infiltrationLoss + extraLossForMinimalFlowRate

	return loss

}

/*var space = {
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
            "mechanical_extract_flowrate": 0
        }
    }

computeVentilationLoss(space,spaces)
*/
/*def computeVentilationHeatLosses(rooms,bcs,ventilation,Q50,LIR,outdoorKey,returnDetail=False):    
    
    totalSurplus = ventilation.loc['Extract air (mechanical)','total'] - ventilation.loc['Supply air (mechanical)','total'] - ventilation.loc['Supply air (natural)','total']
    
    for c in ventilation.columns:
            
        
        if c=='total':
            continue
       
        roomid = rooms[rooms['Name of the room']==c].index[0]   
        roomT = bcs.loc[c,'Design temperature']
    
        volumeRatio = rooms.loc[roomid,'Internal volume']/rooms['Internal volume'].sum()   
        
        if (totalSurplus>0):
            ventilation.loc['Surplus',c] = (volumeRatio * totalSurplus)/2
        else:
            ventilation.loc['Surplus',c] = 0
            
            
        mechSupplyLoss =  0.34*ventilation.loc['Supply air (mechanical)',c]*(roomT-ventilation.loc['Temperature of supply air',c])
        naturalSupplyLoss = 0.34*ventilation.loc['Supply air (natural)',c]*(roomT-bcs.loc[outdoorKey,'Design temperature'])
        transferSupplyLoss = 0.34*ventilation.loc['Transferred air (incoming)',c]*(roomT-ventilation.loc['Temperature of transferred air',c])

        #ok till here
        infiltrationFlowRate = Q50*LIR*volumeRatio + ventilation.loc['Surplus',c]   
        infiltrationLoss = 0.34*infiltrationFlowRate*(roomT-bcs.loc[outdoorKey,'Design temperature'])

        minimalFlowRate = 0.5*rooms.loc[roomid,'Internal volume']      
        totalFlowRateWithoutMinimum = ventilation.loc['Supply air (natural)',c] + ventilation.loc['Supply air (mechanical)',c] + infiltrationFlowRate + ventilation.loc['Transferred air (incoming)',c]
        extraLossForMinimalFlowRate  = 0
        
        if minimalFlowRate > totalFlowRateWithoutMinimum:
           
            extraLossForMinimalFlowRate = 0.34*(minimalFlowRate-totalFlowRateWithoutMinimum)*(roomT-bcs.loc[outdoorKey,'Design temperature'])
        
        rooms.loc[roomid,'Ventilation loss'] = mechSupplyLoss + naturalSupplyLoss + transferSupplyLoss + infiltrationLoss + extraLossForMinimalFlowRate

        if returnDetail:
            #details_df = pd.DataFrame()
            #details_df.loc[c,]
            ventilation.loc["minimumFlow",c]  = minimalFlowRate
            ventilation.loc["infiltrationFlow",c] = infiltrationFlowRate

            ventilation.loc["ventilationloss",c] = rooms.loc[roomid,'Ventilation loss'] 




*/