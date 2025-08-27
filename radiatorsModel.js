
class RadiatorsModel{
	
	constructor() {
        this.spaces = [];
		this.startTemperature = 75;
		this.returnTemperature = 65;
		this.refT = 20;
	}
	
	addSpace(id,name,heatload,temperature, exponent=1.3, correctionFactor=1.0){
		
		this.spaces.push({
			id:id,
			name: name,
			heatLoad: heatload,
			temperature: temperature,
			exponent: exponent,
			correctionFactor: correctionFactor,
			refPower:null,
			mh_kg_s: null
		 })
	}	
	


	
	setStartTemperature(temperature){
		this.startTemperature = temperature
		
		if (this.returnTemperature > temperature){
			this.returnTemperature = temperature -1
		}
		
	}
	
	setReturnTemperature(temperature){
		
		if (temperature > this.startTemperature-1){
			return
		}
		
		this.returnTemperature = temperature
	}
	
	
	setExponent(spaceid,value){
		this.spaces.forEach(space => {
			if (space.id == spaceid){
				space.exponent = value
			}
		
		})
		this.computeAll()
	}

	setFactor(spaceid,value){
		this.spaces.forEach(space => {
			if (space.id == spaceid){
				space.factor = value
			}
		
		})
		this.computeAll()
	}

	computeAll(){
		this.spaces.forEach(space => {
			var thetaM = (this.startTemperature-this.returnTemperature)/Math.log((this.startTemperature-space.temperature)/(this.returnTemperature-space.temperature))
			var ratio =  Math.pow(thetaM/49.83,space.exponent)
			space.refPower = space.heatLoad/ratio/space.correctionFactor
			space.mh_kg_s = space.heatLoad/(4180*(this.startTemperature-this.returnTemperature))

		})
	}
	
	deleteSpace(id){
		this.spaces = this.spaces.filter(item => item.id !== id);
	}
	
	
	importFromMainModel(hl_spaces){
		
		this.spaces = []
		hl_spaces.forEach( space => {
			if (space.type == "heated"){
				this.addSpace(space.id,space.name,space.transmission_heat_loss + space.ventilation.ventilation_loss+space.reheat_power,space.temperature)
			}
		})
		this.computeAll()
	}


	idExistsInMainModel(id,hl_spaces){
		return hl_spaces.some(space => space.id === id);
	}

	
	idExistsInRadModel(id) {
		return this.spaces.some(space => space.id === id);
	}
	
	setSpaceName(spaceid,name){
		this.spaces.forEach(space => {
			if (space.id == spaceid){
				space.name = name
			}
		})
	}
	
	setSpaceHeatLoad(spaceid,value){
		this.spaces.forEach(space => {
			if (space.id == spaceid){
				space.heatLoad = value
			}
		})
	}

	setSpaceTemperature(spaceid,value){
		this.spaces.forEach(space => {
			if (space.id == spaceid){
				space.temperature = value
			}
		})
	}


	syncWithMainModel(hl_spaces){
		console.log("syncing radiators")
		hl_spaces.forEach( space => {

			if (space.heating_type == "radiators"){

				if (this.idExistsInRadModel(space.id)){
					console.log("space ",space.id,"exists")
				    this.setSpaceName(space.id,space.name)
					this.setSpaceHeatLoad(space.id,space.transmission_heat_loss + space.ventilation.ventilation_loss+space.reheat_power,space.temperature)
					this.setSpaceTemperature(space.id,space.temperature)
				}
				else{
					this.addSpace(space.id,space.name,space.transmission_heat_loss + space.ventilation.ventilation_loss+space.reheat_power,space.temperature)
					}
			}
			else{
				this.deleteSpace(space.id)
			}
		})
		
		//loop current space to delete them if not in main model
		this.spaces.forEach( space =>{
			if (!this.idExistsInMainModel(space.id,hl_spaces)){
				this.deleteSpace(space.id)
			}
		})
		
		this.computeAll()
	}


	linkToModel(mainModel){
		//console.log("linking model")
        mainModel.subscribe("heatload_changed", (mainModel) => {this.syncWithMainModel(mainModel.spaces)});
        mainModel.subscribe("spaces", (mainModel) => {this.syncWithMainModel(mainModel.spaces)});

	}
	
	
	
}
