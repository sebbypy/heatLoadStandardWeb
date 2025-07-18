var translations = {
    'fr': {
        "heat_loss_calculation": "Calcul des déperditions thermiques suivant NBN EN 128311 - ANB 2020",
        "spaces": "Espaces",
        "add_space": "Ajouter un espace",
        "space_name": "Nom de l'espace",
        "space_temperature": "Température (°C)",
        "floor_area": "Surface au sol (m²)",
        "interior_volume": "Volume intérieur (m³)",
        "heating_type": "Type de chauffage",
        "walls": "Murs",
        "add_wall": "Ajouter un mur",
        "wall_name": "Nom du mur",
        "u_value": "Valeur U",
        "thermal_bridge_coefficient": "Coefficient de pont thermique",
        "ventilation": "Ventilation",
		"wall_elements":"Parois et isolation",
		"natural_supply_flowrate": "Débit d'alimentation naturelle [m³/h]",
		"mechanical_supply_flowrate": "Débit d'alimentation mécanique [m³/h]",
		"transfer_flowrate": "Débit de transfert [m³/h]",
		"transfer_temperature": "Température de l'air transféré [°C]",
		"mechanical_extract_flowrate": "Débit d'extraction mécanique [m³/h]",
		"air_tightness":"Etanchéité à l'air",
		"enable_hr": "Récupération de chaleur ?",
		"heat_recovery":"Récupération de chaleur",
		"boundaryconditions":"Température extérieure et environnements voisins",
		"ventilation_loss":"Perte par ventilation",
		"results":"Résultats",
		"results_header":"Résultats",
		"inner_volume":"Volume intérieur (m³)",
		"add_bc": "Ajouter environnement voisin",
		"bc_name": "Nom",
		"bc_type": "Type d'environnement",
		"bc_temperature": "Température",
		"transmission_heat_loss":"Perte par transmission",
		"ventilation_heat_loss":"Perte par ventilation et infiltrations",
		"heatup_loss":"Surpuissance de relance",
		"outside":"Extérieur",
		"total_heat_loss":"Puissance totale",
		"mean_extract_t":"Température moyenne de l'air extrait: ",
		"supply_t":"Température après récupération de chaleur: ",
		"null_extract_flow":"Débit d'extraction total nul, pas de calcul possible",
		"total":"Total",
		"equilibrium":"Pas chauffé directement",
		"wall":"Paroi",
		"neighbour_space":"Espace voisin",
		"wall_area":"Surface (m²)",
		"actions":"",
		"per_m2":"[W/m²]",
		"select_municipality": "Localité",
		"base_external_temperature":"Température extérieure de base :",
		"month_external_temperature":"Température moyenne du mois le plus froid :",
		"year_external_temperature":"Température moyenne saison de chauffe :",
		"outside":"Extérieur",
		"ground":"Sol",
		"other_heated":"Mitoyen chauffé",
		"other_unheated":"Espace ou mitoyen non chauffé",
		"apply_default_temperatures":"Appliquer les températures par défaut",
		"radiators":"Radiateurs",
		"floorheating":"Chauffage sol",
		"space":"Espace",
		"environment":"Environnement",
		"at_ref_surface":"Surface de référence pour l'essai d'infiltrations  ",
		"thermal_bridge_tooltip":"0.02 si très soigné<br> 0.05 pour bâtiment neuf 'standard' <br> 0.15 si isolé par l'intérieur <br> 0.10 dans les autres cas",
		"natural_supply_tooltip":"Débit via grilles (système C)",
		"transfer_flow_tooltip":"Débit entrant provenant d'une autre pièce",
		"ventilation_nr_horeca": "Horeca",
		"ventilation_nr_restaurants_cafeteria_buffet_fast_food_canteen_bars_cocktail_bar": "Restaurants, cafétéria, buffet rapide, cantine, bars, cocktail-bar",
		"ventilation_nr_kitchens_kitchenettes": "Cuisines, kitchenettes",
		"ventilation_nr_hotels_motels_holiday_centers": "Hôtels, motels, centres de vacances",
		"ventilation_nr_hotel_motel_holiday_center_bedrooms": "Chambres à coucher d’hôtel, de motel, de centre de vacances",
		"ventilation_nr_holiday_center_dormitories": "Dortoirs de centres de vacances",
		"ventilation_nr_lobby_entrance_hall": "Lobby, hall d’entrée",
		"ventilation_nr_meeting_room_gathering_space_multipurpose_room": "Salle de réunion, espace de rencontre, salle polyvalente",
		"ventilation_nr_office_buildings": "Immeubles de bureaux",
		"ventilation_nr_office": "Bureau",
		"ventilation_nr_reception_areas_meeting_rooms": "Locaux de réception, réception, salles de réunions",
		"ventilation_nr_main_entrance": "Entrée principale",
		"ventilation_nr_public_places": "Lieux publics",
		"ventilation_nr_departure_hall_waiting_room": "Hall des départs, salle d’attente",
		"ventilation_nr_library": "Bibliothèque",
		"ventilation_nr_public_gathering_places": "Lieux de rassemblement publics",
		"ventilation_nr_church_religious_buildings_government_buildings_courtrooms_museums_galleries": "Église et autres bâtiments religieux, bâtiments gouvernementaux, salles d’audience, musées et galeries",
		"ventilation_nr_retail_trade": "Commerce de détail",
		"ventilation_nr_sales_area_shop_except_shopping_centers": "Local de vente, magasin (sauf centres commerciaux)",
		"ventilation_nr_shopping_center": "Centre commercial",
		"ventilation_nr_hair_salon_beauty_institute": "Salon de coiffure, institut de beauté",
		"ventilation_nr_furniture_carpet_textile_stores": "Magasins de meubles, tapis, textiles",
		"ventilation_nr_supermarket_department_store_pet_store": "Supermarché, grand magasin, magasin spécialisé pour animaux",
		"ventilation_nr_laundromat": "Laverie automatique",
		"ventilation_nr_sports_and_leisure": "Sports et loisirs",
		"ventilation_nr_sports_hall_stadiums_gym": "Hall de sport, stades (salle de jeu), salle de gymnastique",
		"ventilation_nr_changing_rooms": "Vestiaires",
		"ventilation_nr_spectator_area_stands": "Espace de spectateurs, tribunes",
		"ventilation_nr_nightclub_dancing": "Discothèque/dancing",
		"ventilation_nr_sports_club_aerobics_fitness_bowling_club": "Club sportif : salles d’aérobic, salle de fitness, club de bowling",
		"ventilation_nr_workspaces": "Locaux de travail",
		"ventilation_nr_photography_studio_darkroom": "Studio de photographie, chambre noire",
		"ventilation_nr_pharmacy_preparation_room": "Pharmacie (local de préparation)",
		"ventilation_nr_bank_counters_vaults_public_access": "Salle des guichets dans les banques / salle des coffres destinée au public",
		"ventilation_nr_copying_room_printer_room": "Local de photocopie / local des imprimantes",
		"ventilation_nr_computer_room_without_printer_room": "Local informatique (sans local des imprimantes)",
		"ventilation_nr_educational_institutions": "Établissements d’enseignement",
		"ventilation_nr_classrooms": "Salles de cours",
		"ventilation_nr_multipurpose_room": "Salle polyvalente",
		"ventilation_nr_healthcare": "Soins de santé",
		"ventilation_nr_common_room": "Salle commune",
		"ventilation_nr_treatment_examination_rooms": "Salles de traitement et d’examen",
		"ventilation_nr_operating_delivery_rooms_recovery_intensive_care_physiotherapy_rooms": "Salles d’opération et d’accouchement, salle de réveil et soins intensifs, salle de kinésithérapie, de physiothérapie",
		"ventilation_nr_penitentiary_establishments": "Établissements pénitentiaires",
		"ventilation_nr_cells_common_room": "Cellules, salle commune",
		"ventilation_nr_surveillance_posts": "Postes de surveillance",
		"ventilation_nr_registration_guard_room": "Inscription / enregistrement / salle de garde",
		"ventilation_nr_other_spaces": "Autres espaces",
		"ventilation_nr_storage_room": "Magasin de stockage",
		"ventilation_table_unassigned": "Espaces non définis",
		"ventilation_table_Residential": "Espaces résidentiels",
		"ventilation_table_NonResidentialForPersons": "Espaces non-résidentiels destinés à l'occupation humaine",
		"ventilation_table_NonResidentialService": "Autres espaces non-résidentiels",
		"ventilation_assistant":"Assistant de calcul des débits de ventilation",
		"select_system":"Séléctionner un type de système de ventilation",
		"applyMinFlows":"Appliquer les débits minimum",
		"system_type":"Type de système de ventilation",
		"choose_system_type":"Choisir un système",
		"define_space_ventilation_type":"Choisir un type pour chaque espace",
		"apply_min_flowrates":"Appliquer les débits minimum",
		"optional_adjust_flowrates_manually":"(optionnel) Ajuster les débits manuellement",
		"ok_to_save_or_cancel":"Ok pour sauver et revenir au calcul thermique ou Annuler",
		"living":"Séjour",
		"other_dry":"Bureau, salle de jeu, chambre",
		"kitchen":"Cuisine",
		"bathroom":"Salle de bain",
		"WC":"Toilettes",
		"residential":"Résidentiel",
		"non_residential":"Non résidentiel",
		"open_ventilation_assistant":"Assistant pour le calcul des débits de ventilation",
		"min_supply":"Alimentation min [m³/h]",
		"min_extract":"Extraction min [m³/h]",
		"space_type":"Type d'espace",
		"people_density":"m²/personne",
		"ventilation_assistant_intro":"Cet assistant vous aide à calculer les débits minimum requis suivant la réglementation PEB. Il s'agit du minimum, mais le débit réel peut différer (par exemple: équilibre des débits pour un système D)",
		"wall_elements_header":"Définition des parois espace par espace",
		"spacesContainer":"Description des espaces paroi par paroi",
		"reheatdiv":"Surpuissance de relance",
		"light":"Léger",
		"heavy":"Lourd",
		"inertia":"Inertie du bâtiment",
		"setback_time":"Temps d'abaissement de la température",
		"reheat_time":"Temps de préchauffage (heures)",
		"reheat_factor":"Puissance par m²",
		"reheat_power":"Puissance de relance (W)",
		"reheat_table_title":"Calcul de la puissance de relance par espace",
		"import":"Charger fichier",
		"export":"Sauvegarder",
		"yes":"Oui",
		"no":"Non",
		"extracttemperature_warning":" Pas d'air extrait - impossible de calculer cette température",
		"flowrates":"Débits de ventilation",
		"save_as_pdf":"Exporter en PDF",
		"transfer_flows":"Débits de transfert",
		"detailled_transfer_input":"Introduire les transferts d'air de manière détaillée",
		"from_space":"Depuis",
		"to_space":"Vers",
		"flowrate":"Débit (m³/h)",
		"flow_balance":"Déséquilibre (m³/h)",
		"confirm_reset":"Les données actuellement seront perdues si vous n'avez pas sauvegardé. Poursuivre?",
		"reset":"Supprimer tout",
		"is_floor_heating":"Plancher/mur chauffant?",
		"load":"Ouvrir"
    },
	'nl': {
        "heat_loss_calculation": "Warmteverlies berekening volgens NBN EN 128311 - ANB 2020",
        "spaces": "Ruimtes",
        "add_space": "Ruimte toevoegen",
        "space_name": "Naam",
        "space_temperature": "Binnentemperatuur (°C)",
        "floor_area": "Vloeroppervlakte (m²)",
        "interior_volume": "Binnenvolume (m³)",
        "heating_type": "Type verwarming",
        "walls": "Constructief elementen",
        "add_wall": "Wand toevoegen",
        "wall_name": "Naam",
        "u_value": "U-waarde",
        "thermal_bridge_coefficient": "Koudebrug coefficient",
        "ventilation": "Ventilatie",
		"wall_elements":"Constructief elementen",
		"natural_supply_flowrate": "Natuurlijk toevoer [m³/h]",
		"mechanical_supply_flowrate": "Mecanische toevoer [m³/h]",
		"transfer_flowrate": "Doorvoer [m³/h]",
		"transfer_temperature": "Doorvoerlucht temperatuur [°C]",
		"mechanical_extract_flowrate": "Mecanische afvoer [m³/h]",
		"air_tightness":"Luchtdicththeid",
		"enable_hr": "Warmterecuperatie ?",
		"heat_recovery":"Warmterecuperatie",
		"boundaryconditions":"Randvoorwarden",
		"ventilation_loss":"Ventilatieverlies",
		"results":"Resultaten",
		"results_header":"Resultaten",
		"inner_volume":"Binnenvolume (m³)",
		"add_bc": "Add buiten of buuromgeving",
		"bc_name": "Naam",
		"bc_type": "Omgeving type",
		"bc_temperature": "Temperatuur",
		"transmission_heat_loss":"Transmissieverlies",
		"ventilation_heat_loss":"Ventilatieverlies",
		"heatup_loss":"Opwarmvermogen",
		"outside":"Buiten",
		"total_heat_loss":"Totaal vermogen",
		"mean_extract_t":"Afgezogen lucht gemmidelde temperatuur: ",
		"supply_t":"Toevoer luchttemperatuur: ",
		"null_extract_flow":"Nul totaal afvoerdebiet, geen berekening mogelijk",
		"total":"Totaal",
		"equilibrium":"Niet direct verwarmd",
		"wall":"Wand",
		"neighbour_space":"Buurruimte",
		"wall_area":"Oppervlakte (m²)",
		"actions":"",
		"per_m2":"[W/m²]",
		"select_municipality": "Gemeente",
		"base_external_temperature":"Buitentemperatuur :",
		"month_external_temperature":"Koudste maand gemmidelde temperatuur :",
		"year_external_temperature":"Stookseizeon gemmidelde temperatuur :",
		"outside":"Buiten",
		"ground":"Grond",
		"other_heated":"Verwarmde buurgebouw",
		"other_unheated":"Onverwarmde buurgebouw of ruimte",
		"apply_default_temperatures":"Default waarden toepassen",
		"radiators":"Radiatoren",
		"floorheating":"Vloerverwarming",
		"space":"Ruimte",
		"environment":"Omgeving",
		"at_ref_surface":"Referentieoppervlakte voor de luchtdicthheidstest  ",
	"thermal_bridge_tooltip":"0,02 indien zeer zorgvuldig<br> 0,05 voor standaard nieuwbouw <br> 0,15 bij binnenisolatie <br> 0,10 in andere gevallen",
	"natural_supply_tooltip":"Debiet via roosters (systeem C)",
	"transfer_flow_tooltip":"Binnenkomend debiet afkomstig uit een andere ruimte",
	"ventilation_nr_horeca": "Horeca",
	"ventilation_nr_restaurants_cafeteria_buffet_fast_food_canteen_bars_cocktail_bar": "Restaurants, cafetaria, snelbuffet, kantine, bars, cocktailbar",
	"ventilation_nr_kitchens_kitchenettes": "Keukens, kitchenettes",
	"ventilation_nr_hotels_motels_holiday_centers": "Hotels, motels, vakantiecentra",
	"ventilation_nr_hotel_motel_holiday_center_bedrooms": "Slaapkamers van hotel, motel, vakantiecentrum",
	"ventilation_nr_holiday_center_dormitories": "Slaapzalen van vakantiecentra",
	"ventilation_nr_lobby_entrance_hall": "Lobby, inkomhal",
	"ventilation_nr_meeting_room_gathering_space_multipurpose_room": "Vergaderzaal, ontmoetingsruimte, polyvalente zaal",
	"ventilation_nr_office_buildings": "Kantoorgebouwen",
	"ventilation_nr_office": "Kantoor",
	"ventilation_nr_reception_areas_meeting_rooms": "Ontvangstruimtes, receptie, vergaderzalen",
	"ventilation_nr_main_entrance": "Hoofdingang",
	"ventilation_nr_public_places": "Publieke ruimtes",
	"ventilation_nr_departure_hall_waiting_room": "Vertrekhal, wachtzaal",
	"ventilation_nr_library": "Bibliotheek",
	"ventilation_nr_public_gathering_places": "Publieke verzamelplaatsen",
	"ventilation_nr_church_religious_buildings_government_buildings_courtrooms_museums_galleries": "Kerk en andere religieuze gebouwen, overheidsgebouwen, rechtszalen, musea en galerijen",
	"ventilation_nr_retail_trade": "Detailhandel",
	"ventilation_nr_sales_area_shop_except_shopping_centers": "Verkoopruimte, winkel (behalve shoppingcentra)",
	"ventilation_nr_shopping_center": "Shoppingcentrum",
	"ventilation_nr_hair_salon_beauty_institute": "Kapsalon, schoonheidsinstituut",
	"ventilation_nr_furniture_carpet_textile_stores": "Meubel-, tapijt- en textielwinkels",
	"ventilation_nr_supermarket_department_store_pet_store": "Supermarkt, warenhuis, dierenwinkel",
	"ventilation_nr_laundromat": "Zelfbedieningswasserette",
	"ventilation_nr_sports_and_leisure": "Sport en vrije tijd",
	"ventilation_nr_sports_hall_stadiums_gym": "Sporthal, stadions (speelzaal), fitnesszaal",
	"ventilation_nr_changing_rooms": "Kleedkamers",
	"ventilation_nr_spectator_area_stands": "Publieksruimte, tribunes",
	"ventilation_nr_nightclub_dancing": "Discotheek/dancing",
	"ventilation_nr_sports_club_aerobics_fitness_bowling_club": "Sportclub: aerobicszaal, fitnesszaal, bowlingclub",
	"ventilation_nr_workspaces": "Werkruimtes",
	"ventilation_nr_photography_studio_darkroom": "Fotostudio, donkere kamer",
	"ventilation_nr_pharmacy_preparation_room": "Apotheek (bereidingsruimte)",
	"ventilation_nr_bank_counters_vaults_public_access": "Lokettenzaal in banken / publiek toegankelijke kluizenruimte",
	"ventilation_nr_copying_room_printer_room": "Kopieerlokaal / printerruimte",
	"ventilation_nr_computer_room_without_printer_room": "Computerlokaal (zonder printerruimte)",
	"ventilation_nr_educational_institutions": "Onderwijsinstellingen",
	"ventilation_nr_classrooms": "Klaslokalen",
	"ventilation_nr_multipurpose_room": "Polyvalente zaal",
	"ventilation_nr_healthcare": "Gezondheidszorg",
	"ventilation_nr_common_room": "Gemeenschappelijke ruimte",
	"ventilation_nr_treatment_examination_rooms": "Behandel- en onderzoeksruimtes",
	"ventilation_nr_operating_delivery_rooms_recovery_intensive_care_physiotherapy_rooms": "Operatie- en verloskamers, ontwaak- en intensievezalen, kinesitherapie- en fysiotherapieruimtes",
	"ventilation_nr_penitentiary_establishments": "Gevangenissen",
	"ventilation_nr_cells_common_room": "Cellen, gemeenschappelijke ruimte",
	"ventilation_nr_surveillance_posts": "Bewakingsposten",
	"ventilation_nr_registration_guard_room": "Inschrijving / registratie / wachtlokaal",
	"ventilation_nr_other_spaces": "Andere ruimtes",
	"ventilation_nr_storage_room": "Opslagruimte",
	"ventilation_table_unassigned": "Niet-geclassificeerde ruimtes",
	"ventilation_table_Residential": "Residentiële ruimtes",
	"ventilation_table_NonResidentialForPersons": "Niet-residentiële ruimtes voor menselijke bezetting",
	"ventilation_table_NonResidentialService": "Andere niet-residentiële ruimtes",
	"ventilation_assistant":"Ventilatiedebieten assistent",
	"select_system":"Selecteer een type ventilatiesysteem",
	"applyMinFlows":"Minimale debieten toepassen",
	"system_type":"Type ventilatiesysteem",
	"choose_system_type":"Kies een systeem",
	"define_space_ventilation_type":"Kies een type voor elke ruimte",
	"apply_min_flowrates":"Minimale debieten toepassen",
	"optional_adjust_flowrates_manually":"(optioneel) Debieten handmatig aanpassen",
	"ok_to_save_or_cancel":"Ok om op te slaan en terug naar thermische berekening of Annuleren",
	"living":"Woonkamer",
	"other_dry":"Kantoor, speelkamer, slaapkamer",
	"kitchen":"Keuken",
	"bathroom":"Badkamer",
	"WC":"Toilet",
	"residential":"Residentieel",
	"non_residential":"Niet-residentieel",
	"open_ventilation_assistant":"Assistent voor berekening van ventilatiedebieten openen",
	"min_supply":"Min toevoer [m³/h]",
	"min_extract":"Min afvoer [m³/h]",
	"space_type":"Ruimtetypen",
	"people_density":"m²/persoon",
	"ventilation_assistant_intro":"Deze assistent helpt u om de minimale vereiste debieten te berekenen volgens de EPB-regelgeving. Dit is het minimum; het werkelijke debiet kan verschillen (bijvoorbeeld: debietbalans voor een D-systeem)",
	"wall_elements_header":"Definitie van de wanden per ruimte",
	"spacesContainer":"Beschrijving van de ruimtes per wand",
	"reheatdiv":"Opstart vermogen",
	"light":"Licht",
	"heavy":"Zwaar",
	"inertia":"Thermische inertie van het gebouw",
	"setback_time":"Verlagingstijd",
	"reheat_time":"Opwarmtijd (uren)",
	"reheat_factor":"Vermogen per m²",
	"reheat_power":"Opwarmvermogen (W)",
	"reheat_table_title":"Opwarmvermogen per ruimte",
	"import":"Bestand laden",
	"export":"Opslaan",
	"yes":"Ja",
	"no":"Nee",
	"extracttemperature_warning":" Geen afvoerlucht - temperatuur kan niet berekend worden",
	"flowrates":"Ventilatiedebieten",
	"save_as_pdf":"Exporteren als PDF",
	"transfer_flows":"Doorvoer debieten",
	"detailled_transfer_input":"Gedetailleerde luchtdoorvoer invoeren",
	"from_space":"Van",
	"to_space":"Naar",
	"flowrate":"Debiet (m³/h)",
	"flow_balance":"Onbalans (m³/h)",
	"confirm_reset":"Huidige data zal verdwijnen als uw werk niet opgeslagen is. Ga verder? ",
	"reset":"Alles verwijderen",
	"is_floor_heating":"Vloer of wand verwarming?",
	"load":"Open"
    },

    // Add additional languages here
};
