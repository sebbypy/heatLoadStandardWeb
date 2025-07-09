
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

