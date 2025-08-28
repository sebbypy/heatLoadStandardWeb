class FloorHeatingModel {
    constructor() {
        this.spaces = {}; // Store spaces with ID as key
        this.loops = []; // List of loops
        this.numberOfLoops = 0;
		
		this.system = null
		this.designDeltaT = 5
		this.supplyWaterTemperature = null     // actual choice of the designer
		this.refSupplyWaterTemperature = null  // start temperature calculated from ref loop
		
		
		this.subscribers={}
		
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
	
	//subscribe function so that other classes can be notified when there is a change
	subscribe(event, callback) {
		if (!this.subscribers[event]) {
			this.subscribers[event] = [];
		}
		this.subscribers[event].push(callback);
	}

	notifySubscribers(event, value) {
		//console.log("notify value",value)
		if (this.subscribers[event]) {
			this.subscribers[event].forEach(callback => callback(value));
		}
	}


	getLoopById(loopid) {
	    let loop = this.loops.find(l => l.id === loopid);
		if (!loop) {console.error(`Loop ID ${loopid} not found.`); return null;}
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

	setSupplyWaterTemperature(value){
		this.supplyWaterTemperature = Number(value)
		this.computeAll()
		
		
	}

	getSupplyWaterTemperature(){
		console.log(this.supplyWaterTemperature)
		if (this.supplyWaterTemperature != null){
			return Number(this.supplyWaterTemperature)
			}
		else{
			return 0
			}
	}

	computeRefSupplyWaterTemperature(){

		var refLoop = this.getRefLoop()
	
		var theta_i = refLoop.stats.meanAirTemperature
		var sigma = this.designDeltaT
		
		//var delta_theta_H_des = Math.round(refLoop.stats.heatLoadPerSqMeter/this.getLoopKh(this.refLoopid))
		var delta_theta_H_des = parseFloat((refLoop.stats.heatLoadPerSqMeter/this.getLoopKh(this.refLoopid)).toFixed(1))
		
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

		//this.supplyWaterTemperature = Math.ceil(numerator / denominator)
		this.refSupplyWaterTemperature = numerator / denominator

		//console.log("supplyt T",theta_i,sigma,delta_theta_H_des)


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
	
	ensureValidRefLoopId() {
		// If refLoopid is not defined or is not in the list of loop IDs
		const validIds = this.loops.map(l => l.id);
		if (!this.refLoopid || !validIds.includes(this.refLoopid)) {
			if (this.loops.length > 0) {
				this.setRefLoop(this.loops[0].id); // default to first loop
			} else {
				this.refLoopid = null; // or leave undefined if no loops
			}
		}
	}

	getNumberOfLinkedSpaces(loopid){
		var loop = getLoopById(loopid)
		
		return loop.spaces.length
		
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
		spaceid = Number(spaceid)

        this.spaces[Number(spaceid)] = {
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
		spaceid = Number(spaceid)
        this.spaces[spaceid].floorArea = floorArea
		this.spaces[spaceid].temperature = spaceTemperature
		this.spaces[spaceid].heatLoad = heatLoad
		this.computeAll()
    }

	// to write
	deleteSpace(spaceid){
		spaceid = Number(spaceid)
		console.log("in delete")
		console.log(this.spaces[spaceid])
		this.spaces[spaceid].loops.forEach(loop => {
			this.unlinkLoopFromSpace(loop.loopid,spaceid)
		})
		
		delete this.spaces[spaceid]
		
		
		
		
		this.deleteUnusedLoops()
		this.computeAll()
		//console.log(this.spaces)

		
	}


    addLoop(name = null, tubeSpacing = null, Rb = 0) {
        this.numberOfLoops += 1;
        let loop = {
            id: this.numberOfLoops,
            name: name || "Loop " + String(this.numberOfLoops),
            spaces: [],
			Rb : Rb,
			tubeSpacing : tubeSpacing,
			Tu: 0
        };
        this.loops.push(loop);
		
	   loop.stats = {
			totalHeatedArea: null,
			totalHeatLoad: null,
			heatLoadPerSqMeter: null,
			meanAirTemperature: null
            };
 
		
		this.computeAll()
    }

    setHeatedFloorArea(spaceid, value) {
		spaceid = Number(spaceid)

        if (this.spaces[spaceid]) {
            this.spaces[spaceid].heatedFloorArea = value;
        } else {
            console.error("Space ID not found:", spaceid);
        }
		this.normalizeSpaceLoopWeights(spaceid,"proportional")
		this.computeAll()
    }

	setSpaceTemperature(spaceid,value)
	{
		spaceid = Number(spaceid)

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
		spaceid = Number(spaceid)

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

        space.loops.push({"loopid":Number(loopid),"weight":weight}); //add loop in space 
		
        if (!loop.spaces.includes(Number(spaceid))) {
            loop.spaces.push(Number(spaceid));  // add space in loop
        }
		
		if (weight == null){
			this.normalizeSpaceLoopWeights(spaceid,"equal")
		}
		else{
			this.normalizeSpaceLoopWeights(spaceid,"residual",{"fixedLoopId":loopid,"fixedWeight":weight})
		}
		
		
		this.computeAll()
    }

    unlinkLoopFromSpace(loopid, spaceid) {
		spaceid = Number(spaceid)

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

        space.loops.splice(loopIndex, 1); // Remove the loop from space

        // Remove space from loop's list if no other references exist
        loop.spaces = loop.spaces.filter(id => id != spaceid);

        // If no loops remain, error out (should not happen in normal usage)
        /*if (space.loops.length === 0) {
            console.error(`Cannot unlink Loop ${loopid} from Space ${spaceid}: At least one loop must remain.`);
            return;
        }*/

		this.normalizeSpaceLoopWeights(spaceid, "proportional");
		this.computeAll()
    }

	createLoopForNewSpace(spaceid){
		spaceid = Number(spaceid)

		this.addLoop("Loop "+this.spaces[spaceid].name); // Create a new loop
		let newLoopId = this.numberOfLoops; // Get the latest loop ID
		let initialWeight = this.spaces[spaceid].heatedFloorArea; // Assign full area at first
		// Instead of setting the full area, we use `linkLoopToSpace()`, which will balance automatically
		this.linkLoopToSpace(newLoopId, Number(spaceid), initialWeight);

		this.setTubeSpacing(newLoopId,10)
		this.setLoopFloorResistance(newLoopId,0.1)
		this.setLoopResistances(newLoopId,0.05,0.14)
		this.setLoopL0(newLoopId,5)

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
					loopAirTemperature += (space.temperature * weightedArea);
                }
            });

            loop.stats = {
                totalHeatedArea: totalHeatedArea,
                totalHeatLoad: totalHeatLoad,
                heatLoadPerSqMeter: totalHeatedArea > 0 ? totalHeatLoad / totalHeatedArea : 0,
				meanAirTemperature: loopAirTemperature/totalHeatedArea
            };
        });
    }

    updateLoopWeight(loopid, spaceid, newWeight) {
      	
		this.normalizeSpaceLoopWeights(spaceid,"residual",{"fixedLoopId":loopid,"fixedWeight":newWeight})
		
    }
	
	
	normalizeSpaceLoopWeights(spaceid, mode = "proportional", options = {}) {
		spaceid = Number(spaceid)
		let space = this.spaces[spaceid];
		if (!space) {
			console.error(`Space ID ${spaceid} not found.`);
			return;
		}

		let totalArea = space.heatedFloorArea;
		let loops = space.loops;
		if (loops.length === 0) {
			console.warn(`No loops to normalize in space ${spaceid}.`);
			return;
		}

		// --- Mode: "equal" --- (linking unlinking loops)
		if (mode === "equal") {
			let equalWeight = totalArea / loops.length;
			loops.forEach(l => {
				l.weight = equalWeight;
			});
			return;
		}

		// --- Mode: "proportional" --- (when changing heated area)
		if (mode === "proportional") {
			let totalWeight = loops.reduce((sum, l) => sum + l.weight, 0);
			if (totalWeight === 0) {
				let equalWeight = totalArea / loops.length;
				loops.forEach(l => {
					l.weight = equalWeight;
				});
				return;
			}

			let scaleFactor = totalArea / totalWeight;
			loops.forEach(l => {
				l.weight *= scaleFactor;
			});
			return;
		}

		// --- Mode: "residual" --- (explicitly changing loop weight)
		if (mode === "residual") {
			if (loops.length === 1) {
				loops[0].weight = totalArea;
			return;
			}

			
			const fixedLoopId = options.fixedLoopId;
			const fixedWeight = options.fixedWeight;

			let fixedLoop = loops.find(l => l.loopid === fixedLoopId);
			if (!fixedLoop) {
				console.error(`Fixed loop ID ${fixedLoopId} not found in space ${spaceid}.`);
				return;
			}

			// Assign fixed weight
			const oldWeight = fixedLoop.weight  //keep old weight in memory to cancel operation if needed
			fixedLoop.weight = fixedWeight;

			// Identify residual loop
			let otherLoops = loops.filter(l => l.loopid !== fixedLoopId);

			// Choose residual loop: if only one other loop, it is residual
			let residualLoop = null;
			if (otherLoops.length === 1) {
				residualLoop = otherLoops[0];
			} else if (options.residualLoopId) {
				// User explicitly defines which loop should be residual
				residualLoop = otherLoops.find(l => l.loopid === options.residualLoopId);
				if (!residualLoop) {
					console.error(`Residual loop ID ${options.residualLoopId} not found among other loops.`);
					return;
				}
			} else {
				// Default to the last loop in the list
				residualLoop = otherLoops[otherLoops.length - 1];
			}

			// Compute area used by all fixed loops
			let totalFixed = loops.reduce((sum, l) => (l.loopid !== residualLoop.loopid ? sum + l.weight : sum), 0);
			let residualArea = totalArea - totalFixed;

			if (residualArea < 1) {
				console.warn(`Weight of residual loop may become < 1, canceling`);
				fixedLoop.weight = oldWeight
			} else {
				residualLoop.weight = residualArea;
			}

			return;
		}

		console.error(`Unknown normalization mode: ${mode}`);
	}

	
	
	
	computeAllLoopsTemperatures(){
		
		if (this.supplyWaterTemperature == null){
			this.supplyWaterTemperature = this.refSupplyWaterTemperature
		}
		
		this.loops.forEach( loop =>{

			var Tj = loop.stats.meanAirTemperature
			//var deltaH = Math.round(loop.stats.heatLoadPerSqMeter/this.getLoopKh(loop.id),1)
			var deltaH = parseFloat((loop.stats.heatLoadPerSqMeter/this.getLoopKh(loop.id)).toFixed(1))
			
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
		if (loopid != null){
		let loop = this.getLoopById(loopid);
		loop.L0 = value
		}
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
		
		loop.stats.qu_abs = loop.stats.qu * loop.stats.totalHeatedArea // WATTS
		
		
	}
	
	getTotalLoss(){
		
		var total = 0
		this.loops.forEach(loop => {total += loop.stats.qu_abs})
		return total
		
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
		
		//console.log("Compute ALL FLOOR HEATING")
		
		 if (!this.isDataComplete()) {
			 console.log("incomplete data")
		 }
		
		try{
		
			this.computeAllLoopStats()
			this.computeRefSupplyWaterTemperature()
			this.computeAllLoopsTemperatures()
			
			this.loops.forEach(loop => {
				this.computeLoopsLength(loop.id)
				this.computeExtraLoss(loop.id)
			})
			
			this.notifySubscribers("floorheating_losses_updated")
			
		}
		catch (error) {
			console.error(error)
			console.log("issue in computing floormodel")
		}
		
	}	
		
	idExistsInThisModel(spaceid){
		spaceid = Number(spaceid)

		return (spaceid in this.spaces)
	}
	
		
	
	linkToModel(mainModel){
		//console.log("linking floor model to main")
		mainModel.subscribe("heatload_changed", (mainModel) => {this.syncWithMainModel(mainModel.spaces)});
		mainModel.subscribe("spaces", (mainModel) => {this.syncWithMainModel(mainModel.spaces)});
	}
	
	syncWithMainModel(hl_spaces){
		console.log("syncing floorheating")

		var hasFloorHeating = false
		
		hl_spaces.forEach( space => {

			console.log("Loop ",space.name)

			if (space.heating_type == "floorheating"){

				hasFloorHeating = true

				if (!this.system){
					this.setSystem(Object.keys(this.defaultSystems)[0])
				}


				if (this.idExistsInThisModel(space.id)){


					//console.log("space ",space.id,"exists in floor model")
				    //this.setSpaceName(space.id,space.name)
					//this.setSpaceHeatLoad(space.id,space.transmission_heat_loss + space.ventilation.ventilation_loss+space.reheat_power,space.temperature)			
					//this.setSpaceTemperature(space.id,space.temperature)
					console.log("EDIT in floor model",this.spaces[space.id])
					
					this.editSpace(space.id,space.floorarea,space.temperature,space.transmission_heat_loss + space.ventilation.ventilation_loss+space.reheat_power)
					
				}
				else{
					console.log("ADD Space in floor model",space.name)
					//this.addSpace(space.id,space.name,space.transmission_heat_loss + space.ventilation.ventilation_loss+space.reheat_power,space.temperature)  // rad
					this.addSpace(space.name,space.id, space.floorarea, space.temperature, space.transmission_heat_loss + space.ventilation.ventilation_loss+space.reheat_power)
					this.createLoopForNewSpace(space.id)


					}

					
			}
			else{
				//check it's an actual space and not a bc
				if (this.idExistsInThisModel(space.id)){
					console.log("DELETE space from floor model",space.name)
					this.deleteSpace(space.id)
				}
			}
		})
		
		//loop current space to delete them if not in main model
		Object.keys(spaces).forEach(id => {
			if (!this.idExistsInMainModel(id,hl_spaces)){
				console.log("DELETE space",id,"that does not exist anymore in mail model")
				this.deleteSpace(id)
			}
		})
		
		if (hasFloorHeating){
		
			this.ensureValidRefLoopId()
		
			this.deleteUnusedLoops()
			this.computeAll()
		}
	}

	
	deleteUnusedLoops(){
		var tmp = []
		var n = 0
		
		this.loops.forEach(loop => {
			
			if (loop.spaces.length > 0 ){
				tmp.push(loop)
				n += 1
			}
			this.loops = tmp
			//this.numberOfLoops = n
		})
	}
	
	
	
	
	
}
	

function createFloorHeatingTestModel(){
	var x = new FloorHeatingModel();

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
    var x = new FloorHeatingModel();

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

function test2() {
    var x = new FloorHeatingModel();

	x.addSpace("R1",1, 10, 25, 839);
	x.addSpace("R2",2, 10, 25, 839);
	x.addSpace("R3",3, 10, 25, 839);
	x.addSpace("R4",4, 10, 25, 839);

    x.createDefaultLoops(); 
	
	x.setSystem("Begetube 16/2")
	x.loops.forEach( loop => {
		x.setTubeSpacing(loop.id,5)
		x.setLoopFloorResistance(loop.id,0.05)
		
	})

	x.setRefLoop(1)
	x.setDesignTemperatureDifference(6)

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


	x.computeAll()

	console.log(x.loops)
}




// Run test
//test2();
