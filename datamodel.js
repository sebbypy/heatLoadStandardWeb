class DataModel {
	constructor(){
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
                'supplyTemperature': null
            },
            'airtightness': {
                'choice': "v50",
                'value': 0
            }
        };
		
		
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
	
	createNewBoundary(name) {
        const newBoundary = {
            type: "unheated",
            name: name,
            id: this.spaceIdCounter,
            temperature: -7
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
	
	createNewWallElement(name){

	    this.wallElementsIdCounter++;

		const newWallElement = {
			name: name,
			id: wallElementsIdCounter,
			uValue: '',  // Assuming default values or form inputs can populate these
			thermalBridge: ''  // Assuming default values or form inputs can populate these
		};

		this.wallElements.push(newWallElement);
	}
}

