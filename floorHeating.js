class FloorHeatingCalculator {
    constructor() {
        this.spaces = {}; // Store spaces with ID as key
        this.loops = []; // List of loops
        this.numberOfLoops = 0;
		
		this.system = null
		this.designDeltaT = 5
		this.supplyWaterTemperature = null
		
		
		this.defaultSystems = {
			"Vitoset 16x2 45 mm": {
				5: { 0.00: 7.52, 0.05: 5.35, 0.10: 4.13, 0.15: 3.38 },
				10: { 0.00: 6.45, 0.05: 4.69, 0.10: 3.73, 0.15: 3.11 },
				15: { 0.00: 5.52, 0.05: 4.15, 0.10: 3.33, 0.15: 2.83 },
				20: { 0.00: 4.81, 0.05: 3.69, 0.10: 3.05, 0.15: 2.60 },
				25: { 0.00: 4.12, 0.05: 3.27, 0.10: 2.79, 0.15: 2.38 },
				30: { 0.00: 3.61, 0.05: 2.91, 0.10: 2.49, 0.15: 2.17 }
			},
			"Begetube 16/2": {
				5: { 0.00: 7.50, 0.05: 5.37, 0.10: 4.13, 0.15: 3.40 },
				10: { 0.00: 6.43, 0.05: 4.73, 0.10: 3.74, 0.15: 3.11 },
				15: { 0.00: 5.53, 0.05: 4.17, 0.10: 3.37, 0.15: 2.83 },
				20: { 0.00: 4.78, 0.05: 3.72, 0.10: 3.05, 0.15: 2.60 },
				25: { 0.00: 4.17, 0.05: 3.27, 0.10: 2.77, 0.15: 2.40 },
				30: { 0.00: 3.63, 0.05: 2.90, 0.10: 2.47, 0.15: 2.17 }
			},
			"Rolljet & Clickjet": {
				5: { 0.00: 7.52, 0.05: 5.40, 0.10: 4.16, 0.15: 3.42 },
				10: { 0.00: 6.48, 0.05: 4.76, 0.10: 3.76, 0.15: 3.14 },
				15: { 0.00: 5.60, 0.05: 4.20, 0.10: 3.40, 0.15: 2.84 },
				20: { 0.00: 4.88, 0.05: 3.73, 0.10: 3.07, 0.15: 2.60 },
				25: { 0.00: 4.20, 0.05: 3.27, 0.10: 2.79, 0.15: 2.40 },
				30: { 0.00: 3.68, 0.05: 2.96, 0.10: 2.52, 0.15: 2.20 }
			}
		};	
    }

	getLoopById(loopid) {
	    let loop = this.loops.find(l => l.id === loopid);
		if (!loop) console.error(`Loop ID ${loopid} not found.`);
		return loop;
	}

	getCurrentSystemData() {
		if (!this.system) {
			console.error("No system selected.");
			return null;
		}
		return this.defaultSystems[this.system] || null;
	}



	getRefLoop(){
		return this.loops.find(l => l.id === this.refLoopid);
	}

	getKh(spacing,rvalue){
		return this.getCurrentSystemData()[spacing][rvalue]
	}
	
	
	
	getLoopKh(loopid){
		
		
		let loop = this.getLoopById(loopid);
		return this.getKh(loop.tubeSpacing,loop.Rb)

	}
	computeSupplyWaterTemperature(){

		var refLoop = this.getRefLoop()
	
		var theta_i = refLoop.stats.meanAirTemperature
		var sigma = this.designDeltaT
		var delta_theta_H_des = Math.round(refLoop.stats.heatLoadPerSqMeter/this.getLoopKh(this.refLoopid))
		
		if (delta_theta_H_des === 0) {
			console.error("Error: Δθ_H,des cannot be zero to avoid division by zero.");
			return NaN;
		}

		let exponent = sigma / delta_theta_H_des;
		let expValue = Math.exp(exponent);

		let numerator = theta_i - (sigma + theta_i) * expValue;
		let denominator = 1 - expValue;

		if (denominator === 0) {
			console.error("Error: Invalid computation, denominator cannot be zero.");
			return NaN;
		}

		this.supplyWaterTemperature = Math.ceil(numerator / denominator)

		return numerator / denominator;
	}


	setDesignTemperatureDifference(value){
		
		this.designDeltaT = value
		this.computeAll()
		
	}
	
	setRefLoop(loopid){
		this.refLoopid = loopid
		this.computeAll()

	}


	setSystem(systemName) {
		if (!this.defaultSystems.hasOwnProperty(systemName)) {
			console.error(`System "${systemName}" not found.`);
			return;
		}
		this.system = systemName;
		console.log(`System set to: ${systemName}`);
		this.computeAll()
	}
	
	addTubeSystem(systemName, tubeData) {
		if (this.defaultSystems.hasOwnProperty(systemName)) {
			console.error(`System "${systemName}" already exists.`);
			return;
		}

		if (typeof tubeData !== "object" || Array.isArray(tubeData) || Object.keys(tubeData).length === 0) {
			console.error("Tube data must be a non-empty object with tube spacing as keys.");
			return;
		}

		// Define the fixed R values
		const rValues = [0.00, 0.05, 0.10, 0.15];

		// Construct the new system data
		let newSystem = {};

		for (const [spacing, khValues] of Object.entries(tubeData)) {
			let spacingNum = Number(spacing);

			if (!Array.isArray(khValues) || khValues.length !== rValues.length) {
				console.error(`KH values for tube spacing ${spacing} must have exactly ${rValues.length} values.`);
				return;
			}

			newSystem[spacingNum] = {};
			rValues.forEach((r, index) => {
				newSystem[spacingNum][r] = khValues[index]; // Assign KH values
			});
		}

		// Add the new system to defaultSystems
		this.defaultSystems[systemName] = newSystem;
		console.log(`Tube system "${systemName}" added successfully.`);
	}

	
	
	setTubeSpacing(loopid, spacing) {
		let loop = this.getLoopById(loopid);
		
		if (!loop) {
			console.error(`Loop ID ${loopid} not found.`);
			return;
		}

		if (!this.system) {
			console.error("No system selected. Use setSystem() first.");
			return;
		}
		
		
		if (!this.getCurrentSystemData().hasOwnProperty(spacing)) {
			console.error(`Tube spacing "${spacing} cm" not found in the selected system.`);
			return;
		}
		
		loop.tubeSpacing = spacing;
		this.computeAll()
		
	}

	setLoopFloorResistance(loopid, resistance) {
		const validRValues = [0.00, 0.05, 0.10, 0.15]; // Allowed resistance values

		let loop = this.getLoopById(loopid);
		
		if (!loop) {
			console.error(`Loop ID ${loopid} not found.`);
			return;
		}

		if (!this.system) {
			console.error("No system selected. Use setSystem() first.");
			return;
		}

		if (!loop.tubeSpacing) {
			console.error(`Tube spacing not set for Loop ${loopid}. Use setTubeSpacing() first.`);
			return;
		}

		if (!validRValues.includes(resistance)) {
			console.error(`Invalid resistance value: ${resistance}. Allowed values are ${validRValues.join(", ")}.`);
			return;
		}

		loop.Rb = resistance;
		this.computeAll()
	}

		

	getPossibleTubeSpacings() {
		let systemData = this.getCurrentSystemData();
		return systemData ? Object.keys(systemData).map(Number).sort((a, b) => a - b) : [];
	}


    addSpace(name,spaceid, floorArea, spaceTemperature, heatLoad = 0) {
        this.spaces[spaceid] = {
			name: name,
            floorArea: floorArea,
            heatedFloorArea: floorArea,
			temperature: spaceTemperature,
            heatLoad: heatLoad,
			radiator: 0,
            loops: []// Stores { loopid, weight }
        };
    }

   editSpace(spaceid, floorArea, spaceTemperature, heatLoad) {
        this.spaces[spaceid].floorArea = floorArea
		this.spaces[spaceid].temperature = spaceTemperature
		this.spaces[spaceid].heatLoad = heatLoad
		this.computeAll()
    }
	

    addLoop(name = null) {
        this.numberOfLoops += 1;
        let loop = {
            id: this.numberOfLoops,
            name: name || "Loop " + String(this.numberOfLoops),
            spaces: [],
			Rb : 0,
			tubeSpacing : null
        };
        this.loops.push(loop);
		this.computeAll()
    }

    setHeatedFloorArea(spaceid, value) {
        if (this.spaces[spaceid]) {
            this.spaces[spaceid].heatedFloorArea = value;
        } else {
            console.error("Space ID not found:", spaceid);
        }
		this.computeAll()
    }

	setSpaceTemperature(spaceid,value)
	{
		if (this.spaces[spaceid]) {
            this.spaces[spaceid].temperature = value;
        } else {
            console.error("Space ID not found:", spaceid);
        }
		this.computeAll()
    }
	
	

    specificPower(spaceid) {
        if (this.spaces[spaceid]) {
            return (this.spaces[spaceid].heatLoad-this.spaces[spaceid].radiator) / this.spaces[spaceid].heatedFloorArea;
        }
        console.error("Space ID not found:", spaceid);
        return null;
    }

    importSpaces(spaces) {
        spaces.forEach(space => {
            this.addSpace(space.name,space.id, space.floorarea, space.transmission_heat_loss + space.ventilation.ventilation_loss);
        });
    }

    linkLoopToSpace(loopid, spaceid, weight = null) {
        let loop = this.getLoopById(loopid);
        let space = this.spaces[spaceid];

        if (!loop) {
            console.error("Loop ID not found:", loopid);
            return;
        }
        if (!space) {
            console.error("Space ID not found:", spaceid);
            return;
        }

        // Total area already assigned to loops
        let assignedArea = space.loops.reduce((sum, l) => sum + l.weight, 0);

        if (weight === null) {
            // If no weight provided, evenly distribute across all loops (including this one)
            let numLoops = space.loops.length + 1;
            weight = space.heatedFloorArea / numLoops;

            // Update all previous loops to share the space evenly
            space.loops.forEach(l => l.weight = weight);
        }

        // If space is fully assigned, rebalance existing loops
        if (assignedArea + weight > space.heatedFloorArea) {
            let numLoops = space.loops.length + 1; // Including this new one
            let newWeight = space.heatedFloorArea / numLoops;

            // Update existing loops
            space.loops.forEach(l => l.weight = newWeight);

            // Apply the same weight to the new loop
            weight = newWeight;
        }

        // Add the new loop assignment
        space.loops.push({
            loopid,
            weight
        });

        // Ensure loop knows the space is linked
        if (!loop.spaces.includes(spaceid)) {
            loop.spaces.push(spaceid);
        }
		this.computeAll()
    }

    unlinkLoopFromSpace(loopid, spaceid) {
        let loop = this.getLoopById(loopid);
        let space = this.spaces[spaceid];

        if (!loop) {
            console.error("Loop ID not found:", loopid);
            return;
        }
        if (!space) {
            console.error("Space ID not found:", spaceid);
            return;
        }

        // Find the loop entry in the space and get its weight before removal
        let loopIndex = space.loops.findIndex(l => l.loopid === loopid);
        if (loopIndex === -1) {
            console.warn(`Loop ${loopid} is not linked to space ${spaceid}.`);
            return;
        }

        let removedWeight = space.loops[loopIndex].weight;
        space.loops.splice(loopIndex, 1); // Remove the loop from space

        // Remove space from loop's list if no other references exist
        loop.spaces = loop.spaces.filter(id => id !== spaceid);

        // If no loops remain, error out (should not happen in normal usage)
        if (space.loops.length === 0) {
            console.error(`Cannot unlink Loop ${loopid} from Space ${spaceid}: At least one loop must remain.`);
            return;
        }

        // Redistribute the removed weight evenly among remaining loops
        let numRemainingLoops = space.loops.length;
        space.loops.forEach(l => l.weight += removedWeight / numRemainingLoops);
		this.computeAll()
    }

    createDefaultLoops() {
        Object.keys(this.spaces).forEach(spaceid => {
            this.addLoop(); // Create a new loop
            let newLoopId = this.numberOfLoops; // Get the latest loop ID
            let initialWeight = this.spaces[spaceid].heatedFloorArea; // Assign full area at first

            // Instead of setting the full area, we use `linkLoopToSpace()`, which will balance automatically
            this.linkLoopToSpace(newLoopId, Number(spaceid), initialWeight);
        });
		this.computeAll()
    }

    // Compute stats for all loops, considering weighted coverage
    computeAllLoopStats() {
        this.loops.forEach(loop => {
            let totalHeatedArea = 0;
            let totalHeatLoad = 0;
			let loopAirTemperature = 0;

            loop.spaces.forEach(spaceid => {
                let space = this.spaces[spaceid];
                let loopInfo = space.loops.find(l => l.loopid === loop.id);
                if (space && loopInfo) {
                    let weightedArea = loopInfo.weight;
                    totalHeatedArea += weightedArea;
                    totalHeatLoad += ((space.heatLoad-space.radiator) * (weightedArea / space.heatedFloorArea));
					loopAirTemperature += (space.temperature * (weightedArea/space.heatedFloorArea));
                }
            });

            loop.stats = {
                totalHeatedArea: totalHeatedArea,
                totalHeatLoad: totalHeatLoad,
                heatLoadPerSqMeter: totalHeatedArea > 0 ? totalHeatLoad / totalHeatedArea : 0,
				meanAirTemperature: loopAirTemperature
            };
        });
    }

    updateLoopWeight(loopid, spaceid, newWeight) {
       
        let space = this.spaces[spaceid];
        if (!space) {
            console.error(`Space ID ${spaceid} not found.`);
            return;
        }

        let loopEntryIndex = space.loops.findIndex(l => l.loopid === loopid);
        if (loopEntryIndex === -1) {
            console.error(`Loop ID ${loopid} is not linked to Space ${spaceid}.`);
            return;
        }

        let loopEntry = space.loops[loopEntryIndex];
        let totalAssignedArea = space.loops.reduce((sum, l) => sum + l.weight, 0);

        // If there is only one loop, directly set its weight to the full area
        if (space.loops.length === 1) {
            console.warn(`Loop ${loopid} is the only loop. Setting weight to full space area.`);
            loopEntry.weight = space.heatedFloorArea;
            return;
        }

        let lastLoopIndex = space.loops.length - 1;
        let lastLoop = space.loops[lastLoopIndex];

        // If the last loop is being modified, adjust the second-to-last loop instead
        let compensationLoopIndex = loopEntryIndex === lastLoopIndex ? lastLoopIndex - 1 : lastLoopIndex;
        let compensationLoop = space.loops[compensationLoopIndex];

        let weightDifference = newWeight - loopEntry.weight;
        let newCompensationWeight = compensationLoop.weight - weightDifference;

        if (newCompensationWeight < 0) {
            console.warn(`Adjustment exceeds available area. Adjusting ${loopid} to max possible weight.`);
            newWeight = loopEntry.weight + compensationLoop.weight;
            newCompensationWeight = 0;
        }

        // Apply weight changes
        loopEntry.weight = newWeight;
        compensationLoop.weight = newCompensationWeight;
    }
    
	
	
	
	computeAllLoopsTemperatures(){
		
		this.loops.forEach( loop =>{

			var Tj = loop.stats.meanAirTemperature
			var deltaH = Math.round(loop.stats.heatLoadPerSqMeter/this.getLoopKh(loop.id))
			
			let term1 = 2*Math.cbrt(deltaH); // Compute (2 * Δθ_H,j)^(1/3)
			let term2 = Math.cbrt(this.supplyWaterTemperature - Tj); // Compute (θ_V,des - θ_j)^(1/3)

			loop.stats.deltaH = deltaH
			loop.stats.returnTemperature =  Tj + Math.pow(term1 - term2, 3);
			loop.stats.sigma = this.supplyWaterTemperature - loop.stats.returnTemperature

			
		})
	}
	
	addRadiatorToSpace(roomid,power){
		this.spaces[roomid].radiator = power
		this.computeAll()
		
	}

	setLoopL0(loopid,value)
	{
		let loop = this.getLoopById(loopid);
		loop.L0 = value
	}

	computeLoopsLength(){
		
		this.loops.forEach(loop => {

			loop.length = loop.L0 + loop.stats.totalHeatedArea/(loop.tubeSpacing/100)
		})
		
	}
	
	setLoopResistances(loopid,R0,Ru){
		// R0 = resistance between the tubes and the top surface of the floor
		// Ru = resistance betteen the pipes and the below environement
		let loop = this.getLoopById(loopid);
		loop.R0 = R0
		loop.Ru = Ru
		this.computeAll()
	}
	
	setLoopBelowTemperature(loopid,Tbelow){
		// set the temperature of the neigbouring env, below the floor
		let loop = this.getLoopById(loopid);
		loop.Tu = Tbelow
		this.computeAll()
	}
		
	
	computeExtraLoss(loopid){
		let loop = this.getLoopById(loopid);
		loop.stats.qu = 1/loop.Ru*(loop.R0*loop.stats.heatLoadPerSqMeter + loop.stats.meanAirTemperature - loop.Tu) // W/m2
		loop.stats.qtot = loop.stats.heatLoadPerSqMeter + loop.stats.qu // W/m2
		loop.stats.mflow = loop.stats.totalHeatedArea/(loop.stats.sigma*4190)*loop.stats.qtot
	}
	
	 isDataComplete() {
        return (
            Object.keys(this.spaces).length > 0 &&
            this.loops.length > 0 &&
            this.loops.every(loop => loop.spaces.length > 0 && loop.tubeSpacing && loop.Rb !== undefined) &&
            this.system &&
            this.refLoopid &&
            this.getRefLoop() &&
            this.designDeltaT !== null &&
            Object.values(this.spaces).every(space => space.floorArea > 0 && space.temperature !== undefined && space.heatLoad !== undefined)
        );
    }
	
	isExtraLossDataComplete() {
        return this.loops.every(loop => loop.R0 !== undefined && loop.Ru !== undefined && loop.Tu !== undefined);
    }
	
	computeAll(){
		
		 if (!this.isDataComplete()) {
			 console.log("incomplete data")
			 return;
		 }
		
		this.computeAllLoopStats()
		this.computeSupplyWaterTemperature()
		this.computeAllLoopsTemperatures()
		
		this.loops.forEach(loop => {
			this.computeLoopsLength(loop.id)
			this.computeExtraLoss(loop.id)
		})
	}	
		
	
	subscribeToMainModel(mainModel){
		mainModel.subscribe("heatload_changed", (mainModel) => {
			
        });
	}
	
	
}
	

function createFloorHeatingTestModel(){
	var x = new FloorHeatingCalculator();

	x.addSpace("space x",1, 14.4, 20, 1029);
	x.addSpace("space x",2, 34.4, 20, 2147);
	x.addSpace("space x",3, 11.3, 20, 854);
	x.addSpace("space x",4, 11.6, 20, 351);
	x.addSpace("space x",5, 12.1, 20, 541);
	x.addSpace("space x",6, 15.3, 20, 905);
	x.addSpace("space x",7, 8.9, 20, 512);
	x.addSpace("space x",8, 14.4, 20, 822);
	x.addSpace("space x",9, 14.9, 20, 875);
	x.addSpace("space x",10, 11.0, 20, 364);
	x.addSpace("space x",11, 9.9, 24, 1047);

    x.createDefaultLoops(); 

	x.addRadiatorToSpace(11,300)
	
	x.setSystem("Begetube 16/2")
	x.loops.forEach( loop => {
		x.setTubeSpacing(loop.id,15)
		x.setLoopFloorResistance(loop.id,0.10)
		
	})


	x.setRefLoop(3)
	x.setDesignTemperatureDifference(5)

	x.setSpaceTemperature(4,16)
	x.setSpaceTemperature(5,16)
	x.setSpaceTemperature(6,18)
	x.setSpaceTemperature(7,18)
	x.setSpaceTemperature(8,18)
	x.setSpaceTemperature(9,18)
	x.setSpaceTemperature(11,24)
	

	x.setTubeSpacing(4,20)
	x.setTubeSpacing(5,20)
	x.setTubeSpacing(10,20)
	x.setTubeSpacing(11,10)
	

	x.computeAll()
	
	x.loops.forEach (loop => {
		x.setLoopL0(loop.id,5)
		x.computeLoopsLength(loop.id)
		x.setLoopResistances(loop.id,0.14,1.99)
		x.setLoopBelowTemperature(loop.id,-7)
		x.computeExtraLoss(loop.id)
	})

	x.computeAll()
	return x
}

// Test function
function test() {
    var x = new FloorHeatingCalculator();

	x.addSpace("space x",1, 14.4, 20, 1029);
	x.addSpace("space x",2, 34.4, 20, 2147);
	x.addSpace("space x",3, 11.3, 20, 854);
	x.addSpace("space x",4, 11.6, 20, 351);
	x.addSpace("space x",5, 12.1, 20, 541);
	x.addSpace("space x",6, 15.3, 20, 905);
	x.addSpace("space x",7, 8.9, 20, 512);
	x.addSpace("space x",8, 14.4, 20, 822);
	x.addSpace("space x",9, 14.9, 20, 875);
	x.addSpace("space x",10, 11.0, 20, 364);
	x.addSpace("space x",11, 9.9, 24, 1047);

    x.createDefaultLoops(); 

	x.addRadiatorToSpace(11,300)
	
	

	x.setSystem("Begetube 16/2")
	x.loops.forEach( loop => {
		x.setTubeSpacing(loop.id,15)
		x.setLoopFloorResistance(loop.id,0.10)
		
	})


	x.setRefLoop(3)
	x.setDesignTemperatureDifference(5)

	x.setSpaceTemperature(4,16)
	x.setSpaceTemperature(5,16)
	x.setSpaceTemperature(6,18)
	x.setSpaceTemperature(7,18)
	x.setSpaceTemperature(8,18)
	x.setSpaceTemperature(9,18)
	x.setSpaceTemperature(11,24)
	

	x.setTubeSpacing(4,20)
	x.setTubeSpacing(5,20)
	x.setTubeSpacing(10,20)
	x.setTubeSpacing(11,10)
	

	x.computeAll()
	console.log(x.loops)
	
	console.log(x.isExtraLossDataComplete())
	
	x.loops.forEach (loop => {
		x.setLoopL0(loop.id,5)
		x.computeLoopsLength(loop.id)
		x.setLoopResistances(loop.id,0.14,1.99)
		x.setLoopBelowTemperature(loop.id,-7)
		
		x.computeExtraLoss(loop.id)
	})

	console.log(x.isExtraLossDataComplete())

	x.computeAll()

	console.log(x.loops)
	
}

// Run test
test();
