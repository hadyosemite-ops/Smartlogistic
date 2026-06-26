-- ============================================================
-- Logistic App — Seed (données initiales depuis mock.ts)
-- Exécuter APRÈS schema.sql dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── DRIVERS ─────────────────────────────────────────────────

-- Insérer les drivers SANS vehicule_id (FK circulaire — mis à jour après les vehicles)
insert into drivers (id, nom, prenom, matricule, phone, status, score_global, score_vitesse, score_freinage, score_fatigue, score_distraction, km_total, missions_total, incidents_total, permis_expire, visite_expire, vehicule_id) values
('d1','BENALI','Karim','C-0012','+212 661 234 567','actif',91,94,89,93,88,142500,387,2,'2026-09-15','2025-12-10',null),
('d2','IDRISSI','Mourad','C-0024','+212 662 345 678','actif',84,82,86,81,87,98200,264,5,'2027-03-20','2026-02-28',null),
('d3','OUAZZANI','Hassan','C-0031','+212 663 456 789','actif',76,71,79,74,80,187300,512,11,'2025-11-05','2026-04-15',null),
('d4','TAZI','Abdellah','C-0044','+212 664 567 890','repos',88,90,87,85,90,65800,178,3,'2028-06-30','2026-08-20',null),
('d5','CHERKAOUI','Youssef','C-0057','+212 665 678 901','actif',62,58,65,60,65,231000,621,24,'2026-01-15','2025-09-30',null),
('d6','MANSOURI','Rachid','C-0063','+212 666 789 012','conge',79,80,76,82,78,54300,145,6,'2027-11-22','2026-06-10',null),
('d7','ALAMI','Nabil','C-0071','+212 667 890 123','actif',95,97,94,96,93,78900,210,0,'2029-04-18','2026-10-05',null),
('d8','BERRADA','Omar','C-0082','+212 668 901 234','actif',71,68,73,70,73,115600,308,14,'2026-07-09','2026-01-18',null);

-- ─── VEHICLES ────────────────────────────────────────────────

insert into vehicles (id, immatriculation, marque, modele, annee, type, chauffeur_id, status, km_actuel, prochaine_vidange, prochain_ct, carburant, gps_lat, gps_lng, score_etat) values
('v1','12345-A-7','Mercedes','Actros 1845',2021,'Semi-remorque','d1','actif',142500,145000,'2026-03-15',28.4,33.971600,-6.849800,88),
('v2','54321-B-3','Volvo','FH 500',2020,'Semi-remorque','d2','actif',98200,100000,'2026-06-20',31.2,33.573100,-7.589800,81),
('v3','67890-C-5','MAN','TGX 18.510',2019,'Semi-remorque','d3','actif',187300,190000,'2025-11-30',33.8,32.299400,-9.237200,65),
('v4','11223-D-9','Scania','R 450',2022,'Porteur','d4','actif',65800,70000,'2027-02-10',27.1,34.020900,-5.002600,94),
('v5','44556-E-2','DAF','XF 480',2018,'Semi-remorque','d5','actif',231000,235000,'2025-08-25',36.5,35.759500,-5.834000,54),
('v6','77889-F-1','Mercedes','Actros 1840',2023,'Semi-remorque','d7','actif',78900,80000,'2027-05-15',26.8,31.629500,-7.981100,97),
('v7','99001-G-4','Renault','T 460',2020,'Porteur','d8','actif',115600,120000,'2026-09-08',29.7,30.427800,-9.598100,76),
('v8','33445-H-6','Iveco','Stralis 460',2017,'Semi-remorque',null,'maintenance',298700,300000,'2025-10-12',38.2,33.971600,-6.849800,42);

-- Lier les drivers à leurs vehicules (résolution FK circulaire)
update drivers set vehicule_id = 'v1' where id = 'd1';
update drivers set vehicule_id = 'v2' where id = 'd2';
update drivers set vehicule_id = 'v3' where id = 'd3';
update drivers set vehicule_id = 'v4' where id = 'd4';
update drivers set vehicule_id = 'v5' where id = 'd5';
update drivers set vehicule_id = 'v6' where id = 'd7';
update drivers set vehicule_id = 'v7' where id = 'd8';

-- ─── MISSIONS ────────────────────────────────────────────────

insert into missions (id, reference, client, chauffeur_id, vehicule_id, origine, destination, date_depart, date_livraison_prevue, date_livraison_reelle, status, distance, chargement, poids, prix_ht, cout_revient, progression, notes) values
('m1','OT-2025-0847','Marjane Distribution','d1','v1','Casablanca','Marrakech','2025-05-25 06:00','2025-05-25 14:00',null,'en_cours',238,'Produits alimentaires',18.5,4800,2950,65,'Livraison prioritaire - entrepôt fermé après 15h'),
('m2','OT-2025-0848','SONACOS','d2','v2','Casablanca','Agadir','2025-05-25 04:30','2025-05-25 13:00',null,'retard',462,'Matériaux de construction',24.0,8200,5100,45,'Retard dû à un contrôle routier à Tiznit'),
('m3','OT-2025-0849','Label''Vie','d7','v6','Rabat','Fès','2025-05-25 08:00','2025-05-25 11:30','2025-05-25 11:15','livree',189,'Produits frais',12.0,3600,2100,100,null),
('m4','OT-2025-0850','Ciment du Maroc','d3','v3','Safi','Casablanca','2025-05-25 05:00','2025-05-25 10:00',null,'incident',315,'Ciment en vrac',26.0,5900,3800,30,'Crevaison signalée à hauteur de Settat - assistance en route'),
('m5','OT-2025-0851','Coca-Cola Maroc','d8','v7','Meknès','Oujda','2025-05-25 07:00','2025-05-25 14:30',null,'en_cours',387,'Boissons',20.0,7100,4400,52,null),
('m6','OT-2025-0852','OCP Logistics','d4','v4','Khouribga','Jorf Lasfar','2025-05-26 06:00','2025-05-26 09:00',null,'planifiee',142,'Phosphates',28.0,3200,1900,0,null),
('m7','OT-2025-0845','Marjane Distribution','d1','v1','Marrakech','Casablanca','2025-05-24 16:00','2025-05-24 23:00','2025-05-24 22:45','livree',238,'Retour vide',0,2400,1200,100,null),
('m8','OT-2025-0846','INWI','d5','v5','Tanger','Casablanca','2025-05-24 22:00','2025-05-25 07:00','2025-05-25 07:22','livree',338,'Équipements télécoms',8.5,6800,3200,100,null);

-- ─── ALERTS ──────────────────────────────────────────────────

insert into alerts (id, type, level, message, vehicule_id, chauffeur_id, mission_id, timestamp, lu) values
('a1','INCIDENT','critique','Crevaison signalée — OT-2025-0850 immobilisé RN1 Settat','v3','d3','m4','2025-05-25 07:42',false),
('a2','RETARD','warning','Retard 45 min estimé — OT-2025-0848 (Agadir)','v2','d2','m2','2025-05-25 08:15',false),
('a3','VITESSE','warning','Excès de vitesse 112 km/h — Cherkaoui Youssef (N9)','v5','d5',null,'2025-05-25 06:58',false),
('a4','MAINTENANCE','warning','Vidange dans 1 500 km — V6 Mercedes Actros (v6)','v6',null,null,'2025-05-25 07:00',true),
('a5','DOCUMENT','warning','Visite technique expirée dans 8 jours — 67890-C-5','v3',null,null,'2025-05-25 07:00',false),
('a6','FATIGUE','critique','Détection somnolence — Cherkaoui Youssef (A5 Tanger)','v5','d5',null,'2025-05-25 07:31',false),
('a7','CARBURANT','info','Consommation anormale +18% — 44556-E-2 (DAF XF)','v5',null,null,'2025-05-25 06:00',true),
('a8','DOCUMENT','warning','Permis conducteur expire dans 3 mois — Cherkaoui Youssef',null,'d5',null,'2025-05-25 07:00',true);

-- ─── INTERVENTIONS ───────────────────────────────────────────

insert into interventions (id, vehicule_id, type, libelle, date, km_intervention, cout_pieces, cout_main_oeuvre, garage, status, notes) values
('i1','v1','preventive','Vidange + filtre huile','2025-04-15',140000,850,400,'Garage Central Casablanca','terminee',null),
('i2','v1','pneus','Remplacement 2 pneus avant','2025-03-10',135000,3200,300,'Pneus Rapid Casablanca','terminee',null),
('i3','v2','corrective','Réparation système de freinage','2025-04-20',96000,2100,800,'Volvo Service Casablanca','terminee','Remplacement plaquettes et disques arrière'),
('i4','v3','ct','Contrôle technique','2025-02-28',180000,0,650,'Centre CT Safi','terminee',null),
('i5','v3','corrective','Réparation turbo','2025-01-15',172000,8500,2200,'MAN Truck Service','terminee','Turbocompresseur défaillant — remplacement complet'),
('i6','v4','preventive','Vidange + filtre air + filtre gasoil','2025-05-01',65000,1100,450,'Scania Service Rabat','terminee',null),
('i7','v5','corrective','Remplacement alternateur','2025-04-05',225000,4200,1100,'DAF Trucks Tanger','terminee',null),
('i8','v5','pneus','Remplacement 4 pneus + équilibrage','2025-03-20',220000,6400,600,'Pneus Rapid Tanger','terminee',null),
('i9','v6','preventive','Révision 80 000 km','2025-05-10',78000,2200,900,'Mercedes-Benz Trucks Marrakech','terminee',null),
('i10','v7','corrective','Réparation boîte de vitesses','2025-02-10',108000,12000,3500,'Renault Trucks Agadir','terminee','Synchroniseurs 3ème et 4ème rapports usés'),
('i11','v8','corrective','Révision moteur complète','2025-05-15',295000,28000,8000,'Iveco Service Casablanca','en_cours','Immobilisation estimée 12 jours'),
('i12','v2','preventive','Vidange planifiée','2025-06-01',100000,900,400,'Volvo Service Casablanca','planifiee',null),
('i13','v3','ct','Contrôle technique (renouvellement)','2025-05-30',187000,0,650,'Centre CT Safi','planifiee',null);

insert into maintenance_alerts (vehicule_id, type, message, echeance, urgence) values
('v1','Vidange','Prochaine vidange dans 2 500 km','145 000 km','warning'),
('v2','Vidange','Vidange dans 1 800 km','100 000 km','warning'),
('v3','CT','Contrôle technique expiré dans 5 jours','30/05/2025','critique'),
('v5','CT','Contrôle technique expiré depuis 3 mois','25/08/2025','critique'),
('v6','Vidange','Vidange dans 1 100 km','80 000 km','warning'),
('v8','Révision','Révision moteur en cours — immobilisé','En cours','critique');

insert into maintenance_cost_by_month (month, preventive, corrective, pneus, total) values
('Nov',4200,8500,3200,15900),
('Déc',3800,2100,0,5900),
('Jan',4500,10700,0,15200),
('Fév',3200,650,0,3850),
('Mar',4100,4200,9600,17900),
('Avr',5300,2900,3200,11400),
('Mai',4650,36000,0,40650);

-- ─── CONTRÔLE DE GESTION ─────────────────────────────────────

insert into voyage_costs (mission_id, carburant, salaire_chauffeur, peages, amortissement, assurance, divers, total) values
('m1',1320,680,180,520,150,100,2950),
('m2',2560,820,380,920,280,140,5100),
('m3',1050,620,120,180,90,40,2100),
('m4',1750,750,220,720,220,140,3800),
('m5',2140,780,310,840,230,100,4400),
('m6',790,580,80,320,90,40,1900),
('m7',660,280,90,120,30,20,1200),
('m8',1870,620,240,340,90,40,3200);

insert into client_revenue (client, ca, cout_revient, marge, marge_pct, missions, km) values
('Marjane Distribution',72000,42000,30000,42,18,8920),
('OCP Logistics',95000,58000,37000,39,24,12400),
('Coca-Cola Maroc',68000,43000,25000,37,16,9800),
('Ciment du Maroc',118000,82000,36000,31,31,19200),
('Label''Vie',54000,31000,23000,43,14,6300),
('SONACOS',82000,58000,24000,29,20,14700),
('INWI',41000,22000,19000,46,8,4200);

insert into route_perf (route, ca, cout_km, marge_pct, missions) values
('Casa → Marrakech',48000,8.2,42,12),
('Casa → Agadir',65000,11.1,30,9),
('Casa → Fès',38000,7.8,44,11),
('Safi → Casa',42000,9.4,32,8),
('Meknès → Oujda',57000,10.2,35,10),
('Tanger → Casa',73000,9.1,38,14),
('Khouribga → Jorf',29000,6.8,45,16);

insert into financial_by_month (month, ca, couts, marge, carburant, maintenance, salaires) values
('Nov',182000,118000,64000,41400,15900,38000),
('Déc',168000,108000,60000,38200,5900,38000),
('Jan',195000,128000,67000,43200,15200,40000),
('Fév',172000,106000,66000,38000,3850,38000),
('Mar',211000,138000,73000,45200,17900,42000),
('Avr',228000,145000,83000,47900,11400,44000),
('Mai',243000,162000,81000,44600,40650,44000);

-- ─── RH ──────────────────────────────────────────────────────

insert into contrats_conducteurs (chauffeur_id, type, date_embauche, date_fin_contrat, salaire_base, prime_km, prime_rendement, mutuelle, anciennete) values
('d1','CDI','2018-03-01',null,5800,0.18,1200,true,7),
('d2','CDI','2020-07-15',null,5200,0.16,1000,true,4),
('d3','CDI','2015-11-10',null,6100,0.18,1200,true,9),
('d4','CDI','2022-02-01',null,5000,0.15,900,true,3),
('d5','CDI','2013-06-20',null,6400,0.18,800,false,11),
('d6','CDD','2024-01-01','2025-12-31',4800,0.14,800,false,1),
('d7','CDI','2021-09-01',null,5500,0.17,1100,true,3),
('d8','CDI','2019-04-12',null,5600,0.17,1000,true,6);

insert into conges (id, chauffeur_id, type, date_debut, date_fin, jours, statut, motif) values
('c1','d6','conge_annuel','2025-05-15','2025-06-14',30,'approuve','Congé annuel'),
('c2','d4','conge_annuel','2025-05-25','2025-05-31',7,'approuve','Congé semaine'),
('c3','d2','maladie','2025-05-10','2025-05-12',3,'approuve','Arrêt médical'),
('c4','d5','formation','2025-06-02','2025-06-03',2,'en_attente','Formation conduite défensive'),
('c5','d8','conge_annuel','2025-07-01','2025-07-21',21,'en_attente','Congé été'),
('c6','d3','sans_solde','2025-04-01','2025-04-05',5,'refuse','Raisons personnelles'),
('c7','d1','conge_annuel','2025-08-10','2025-08-30',21,'en_attente','Congé annuel');

insert into formations (id, chauffeur_id, intitule, organisme, date, duree_jours, certificat, expiration) values
('f1','d1','Conduite économique & éco-conduite','OFPPT Casablanca','2024-09-15',2,true,'2027-09-15'),
('f2','d1','Transport matières dangereuses ADR','Centre ADR Maroc','2023-03-10',5,true,'2026-03-10'),
('f3','d2','Conduite défensive','Auto-École Pro','2024-11-20',1,false,null),
('f4','d3','Premiers secours SST','Croix-Rouge Maroc','2024-06-01',2,true,'2026-06-01'),
('f5','d5','Conduite défensive','Auto-École Pro','2025-06-02',2,false,null),
('f6','d7','Transport frigorifique ATP','OFPPT Marrakech','2024-02-14',3,true,'2027-02-14'),
('f7','d4','Réglementation transport routier','DRETIT Rabat','2024-10-05',1,true,'2027-10-05'),
('f8','d8','Gestion du temps de conduite (AETR)','DRETIT Casablanca','2025-01-18',1,true,'2028-01-18');

insert into paie_mensuelle (chauffeur_id, mois, salaire_base, prime_km, prime_rendement, heures_supp, retenues, net_a_payer) values
('d1','Mai 2025',5800,1144,1100,420,1280,7184),
('d2','Mai 2025',5200,880,900,260,1050,6190),
('d3','Mai 2025',6100,1500,800,380,1320,7460),
('d4','Mai 2025',5000,540,850,0,980,5410),
('d5','Mai 2025',6400,1848,400,620,1400,7868),
('d6','Mai 2025',4800,0,0,0,840,3960),
('d7','Mai 2025',5500,712,1050,300,1120,6442),
('d8','Mai 2025',5600,924,950,350,1150,6674);

-- ─── ADMINISTRATIF ───────────────────────────────────────────

insert into documents_vehicules (id, vehicule_id, type, libelle, organisme, date_emission, date_expiration, statut, montant, reference) values
('dv1','v1','assurance','Assurance RC + tous risques','Wafa Assurance','2025-01-01','2026-01-01','valide',12400,'WA-2025-001'),
('dv2','v1','vignette','Vignette automobile 2025','Trésor Public Maroc','2025-01-01','2025-12-31','valide',2800,null),
('dv3','v2','assurance','Assurance RC + tous risques','AXA Assurance','2025-02-01','2026-02-01','valide',11800,'AXA-2025-054'),
('dv4','v3','controle_technique','Contrôle technique annuel','Centre CT Safi','2025-02-28','2025-06-05','expire_bientot',650,null),
('dv5','v3','assurance','Assurance RC','RMA Assurance','2024-10-01','2025-09-30','valide',9200,'RMA-2024-312'),
('dv6','v4','assurance','Assurance RC + tous risques','Wafa Assurance','2025-03-01','2026-03-01','valide',13100,'WA-2025-088'),
('dv7','v5','controle_technique','Contrôle technique (expiré)','Centre CT Tanger','2024-08-25','2025-02-25','expire',650,null),
('dv8','v5','assurance','Assurance RC','Atlanta Assurance','2025-01-15','2026-01-15','valide',8900,'ATL-2025-041'),
('dv9','v6','assurance','Assurance RC + tous risques','AXA Assurance','2025-04-01','2026-04-01','valide',14200,'AXA-2025-198'),
('dv10','v7','assurance','Assurance RC + tous risques','Wafa Assurance','2025-01-01','2025-07-01','expire_bientot',10600,'WA-2025-022'),
('dv11','v8','assurance','Assurance RC','RMA Assurance','2024-12-01','2025-11-30','valide',7800,'RMA-2024-489'),
('dv12','v8','controle_technique','Contrôle technique (expiré)','Centre CT Casablanca','2024-10-12','2025-04-12','expire',650,null),
('dv13','v1','autorisation','Autorisation transport marchandises','DRETIT','2024-01-01','2026-12-31','valide',1200,null),
('dv14','v2','carte_grise','Carte grise (titre de propriété)','Préfecture Casa','2020-07-01','2030-07-01','valide',null,null);

insert into contrats_clients (id, client, type, date_debut, date_fin, tarif_km, volume_mensuel, ca_annuel_estime, statut, contact, conditions) values
('cc1','Marjane Distribution','cadre','2024-01-01','2025-12-31',14.2,18,860000,'actif','M. Bennani — 0661 112 233','Facturation hebdomadaire, délai 30 jours'),
('cc2','OCP Logistics','exclusif','2023-07-01','2026-06-30',16.8,24,1140000,'actif','Mme Alaoui — 0662 334 455','Facturation mensuelle, délai 45 jours'),
('cc3','Coca-Cola Maroc','cadre','2024-06-01','2026-05-31',13.5,16,816000,'actif','M. Ouali — 0663 556 677','Livraisons programmées 48h à l''avance'),
('cc4','Ciment du Maroc','cadre','2023-01-01','2025-06-30',12.1,31,1416000,'en_negociation','M. Tahiri — 0664 778 899','Renouvellement en cours — tarif à renégocier'),
('cc5','Label''Vie','spot','2025-01-01','2025-12-31',15.8,14,648000,'actif','Mme Chraibi — 0665 990 011',null),
('cc6','SONACOS','cadre','2024-09-01','2026-08-31',11.8,20,984000,'actif','M. Brahim — 0666 122 233',null),
('cc7','INWI','spot','2025-03-01','2025-08-31',17.2,8,492000,'actif','M. Saidi — 0667 344 455',null);

insert into factures (id, reference, client, mission_ids, date_emission, date_echeance, montant_ht, tva, montant_ttc, statut) values
('fac1','F-2025-0142','Marjane Distribution','{m1,m7}','2025-05-25','2025-06-24',7200,1440,8640,'en_attente'),
('fac2','F-2025-0141','OCP Logistics','{m6}','2025-05-26','2025-07-10',3200,640,3840,'en_attente'),
('fac3','F-2025-0140','Label''Vie','{m3}','2025-05-25','2025-06-24',3600,720,4320,'payee'),
('fac4','F-2025-0139','INWI','{m8}','2025-05-25','2025-06-10',6800,1360,8160,'en_attente'),
('fac5','F-2025-0138','Ciment du Maroc','{m4}','2025-05-20','2025-06-19',5900,1180,7080,'retard'),
('fac6','F-2025-0135','SONACOS','{m2}','2025-05-12','2025-06-11',8200,1640,9840,'en_attente'),
('fac7','F-2025-0130','Coca-Cola Maroc','{m5}','2025-05-08','2025-06-07',7100,1420,8520,'payee'),
('fac8','F-2025-0121','Marjane Distribution','{}','2025-04-30','2025-05-30',18400,3680,22080,'retard');

-- ─── CHECKLIST ITEMS ─────────────────────────────────────────

insert into checklist_items (id, categorie, categorie_num, point, critique) values
('cl01','Documents réglementaires',1,'Carte grise valide',true),
('cl02','Documents réglementaires',1,'Assurance véhicule valide',true),
('cl03','Documents réglementaires',1,'Contrôle technique valide',true),
('cl04','Documents réglementaires',1,'Vignette valide',false),
('cl05','Documents réglementaires',1,'Carte verte / autorisation transport',true),
('cl06','Documents réglementaires',1,'Permis conducteur valide',true),
('cl07','Documents réglementaires',1,'Visite médicale valide',true),
('cl08','Documents réglementaires',1,'Carte professionnelle disponible',false),
('cl09','Conducteur & sécurité',2,'Port de la ceinture obligatoire',true),
('cl10','Conducteur & sécurité',2,'Téléphone interdit (même kit mains-libres)',true),
('cl11','Conducteur & sécurité',2,'Aucun passager non autorisé',true),
('cl12','Conducteur & sécurité',2,'Respect des temps de conduite et de repos',true),
('cl13','Conducteur & sécurité',2,'Aucune conduite sous alcool / stupéfiants',true),
('cl14','Conducteur & sécurité',2,'Connaissance des règles HSE site client',false),
('cl15','EPI obligatoires',3,'Chaussures de sécurité',true),
('cl16','EPI obligatoires',3,'Casque EN397',true),
('cl17','EPI obligatoires',3,'Gilet haute visibilité',true),
('cl18','EPI obligatoires',3,'Lunettes de protection EN166',false),
('cl19','EPI obligatoires',3,'Gants de protection',false),
('cl20','EPI obligatoires',3,'Masque respiratoire (si nécessaire)',false),
('cl21','Tracteur',4,'Ralentisseur hydraulique fonctionnel',true),
('cl22','Tracteur',4,'Boîte automatique opérationnelle',false),
('cl23','Tracteur',4,'Éclairage complet (phares, feux AR, clignotants, réfléchissants)',true),
('cl24','Tracteur',4,'Klaxon de recul fonctionnel',false),
('cl25','Tracteur',4,'Pare-brise sans fissure',true),
('cl26','Tracteur',4,'Rétroviseurs conformes',true),
('cl27','Tracteur',4,'Extincteur 2 kg valide',true),
('cl28','Tracteur',4,'Trousse de secours disponible',false),
('cl29','Tracteur',4,'Âge < 10 ans, norme EURO VI, puissance ≥ 400 ch',false),
('cl30','Tracteur',4,'Boîtier IVMS (GPS) fonctionnel + clé conducteur',true),
('cl31','Tracteur',4,'Freinage ABS, ESP, ASR, ESC et ralentisseur opérationnels',true),
('cl32','Tracteur',4,'Régulateur de vitesse adaptatif fonctionnel',false),
('cl33','Benne / Remorque',5,'Structure sans fissure',true),
('cl34','Benne / Remorque',5,'Système de bâchage fonctionnel (bâchage obligatoire)',true),
('cl35','Benne / Remorque',5,'Bandes réfléchissantes présentes',false),
('cl36','Benne / Remorque',5,'Protections anti-encastrement (latérale & arrière)',true),
('cl37','Benne / Remorque',5,'Cales de roues disponibles',false),
('cl38','Benne / Remorque',5,'Dispositif d''attache et verrouillage tracteur-attelage sécurisé',true),
('cl39','Benne / Remorque',5,'Âge < 15 ans, alliages légers, structure intègre',false),
('cl40','Benne / Remorque',5,'Ouverture automatique porte arrière opérationnelle',false),
('cl41','Benne / Remorque',5,'Vérins et dispositif de levage contrôlés',true),
('cl42','Benne / Remorque',5,'Garde-boue et bavettes présents',false),
('cl43','Benne / Remorque',5,'Étanchéité : réservoirs sans fuites, bouchons installés',true),
('cl44','Benne / Remorque',5,'Autocollants angles morts & avertissement présents',false),
('cl45','Pneumatiques',6,'Pression conforme aux préconisations',true),
('cl46','Pneumatiques',6,'Aucune coupure critique (> 25 mm)',true),
('cl47','Pneumatiques',6,'Aucune hernie visible',true),
('cl48','Pneumatiques',6,'Sculpture conforme (> seuil légal)',true),
('cl49','Pneumatiques',6,'Aucun pneu rechapé',false),
('cl50','Pneumatiques',6,'Indicateurs de desserrage d''écrous présents',false),
('cl51','Pneumatiques',6,'Ceintures 3 points + pochette réfléchissante (port obligatoire)',true),
('cl52','Pneumatiques',6,'Pare-brise feuilleté sans fissure ni obstruction',true),
('cl53','Pneumatiques',6,'Rétroviseurs en bon état (grand angle, antéviseur, portière)',true),
('cl54','Pneumatiques',6,'Patins de pédales antidérapants, appuie-têtes ajustables',false),
('cl55','Environnement & urgence',7,'Kit antipollution disponible',true),
('cl56','Environnement & urgence',7,'Absence de fuite hydraulique / carburant',true),
('cl57','Environnement & urgence',7,'Plan d''urgence disponible dans la cabine',false),
('cl58','Environnement & urgence',7,'Numéros d''urgence affichés',false),
('cl59','Environnement & urgence',7,'Cônes et triangles de pré-signalisation (×2)',true),
('cl60','Environnement & urgence',7,'Trousse premiers secours + lampe torche + HV',false),
('cl61','Environnement & urgence',7,'Trousse à outils de bord complète',false);

-- ─── INSPECTIONS ─────────────────────────────────────────────

insert into inspections (id, vehicule_id, chauffeur_id, date, inspecteur, resultats, commentaires, statut, taux_conformite) values
('insp01','v1','d1','2025-05-20 06:30','Chef de Parc','{}','{}','conforme',100),
('insp02','v3','d3','2025-05-18 05:45','Chef de Parc',
  '{"cl03":"non_conforme","cl47":"non_conforme","cl20":"non_conforme","cl58":"non_conforme"}',
  '{"cl03":"CT expiré — renouvellement en cours","cl47":"Hernie pneu AR gauche détectée"}',
  'non_conforme',94),
('insp03','v5','d5','2025-05-15 04:00','Responsable HSE',
  '{"cl03":"non_conforme","cl07":"non_conforme","cl46":"non_conforme","cl30":"non_conforme","cl55":"non_conforme","cl19":"non_conforme","cl58":"non_conforme"}',
  '{"cl03":"CT expiré depuis 3 mois","cl07":"Visite médicale expirée","cl46":"Coupure 30mm pneu AV droit","cl30":"GPS hors service"}',
  'non_conforme',89),
('insp04','v2','d2','2025-05-10 07:00','Chef de Parc',
  '{"cl24":"non_conforme","cl44":"non_conforme"}',
  '{"cl24":"Klaxon recul faible"}',
  'non_conforme',97),
('insp05','v6','d7','2025-05-08 06:15','Chef de Parc','{}','{}','conforme',100),
('insp06','v4','d4','2025-04-28 05:30','Responsable HSE',
  '{"cl20":"non_conforme","cl44":"non_conforme","cl37":"non_conforme"}',
  '{}',
  'non_conforme',95);

-- ─── ACTIONS CORRECTRICES ────────────────────────────────────

insert into actions_correctrices (id, inspection_id, vehicule_id, chauffeur_id, point, categorie, priorite, responsable, date_echeance, statut, commentaire) values
('ac01','insp02','v3','d3','Contrôle technique valide','Documents réglementaires','critique','Responsable Administratif','2025-05-30','en_cours','Rendez-vous pris au Centre CT Safi le 30/05'),
('ac02','insp02','v3','d3','Aucune hernie visible','Pneumatiques','critique','Chef de Parc','2025-05-22','cloturee','Pneu AR gauche remplacé le 22/05'),
('ac03','insp03','v5','d5','Contrôle technique valide','Documents réglementaires','critique','Responsable Administratif','2025-05-20','en_cours','CT expiré depuis 3 mois — véhicule à immobiliser'),
('ac04','insp03','v5','d5','Visite médicale valide','Documents réglementaires','critique','RH','2025-05-18','en_cours','Rendez-vous médecin du travail programmé'),
('ac05','insp03','v5','d5','Aucune coupure critique (> 25 mm)','Pneumatiques','critique','Chef de Parc','2025-05-16','cloturee','Pneu AV droit remplacé'),
('ac06','insp03','v5','d5','Boîtier IVMS (GPS) fonctionnel + clé conducteur','Tracteur','haute','Responsable Informatique','2025-05-25','ouverte','Boîtier envoyé en réparation'),
('ac07','insp03','v5','d5','Kit antipollution disponible','Environnement & urgence','haute','Chef de Parc','2025-05-20','cloturee','Kit reconstitué'),
('ac08','insp04','v2','d2','Klaxon de recul fonctionnel','Tracteur','normale','Chef de Parc','2025-05-15','cloturee','Buzzer de recul remplacé');

-- ─── QSE ─────────────────────────────────────────────────────

insert into qse_data (mois, accident_site, accident_trajet, accident_client, incident_env_site, incident_env_trajet, incident_env_client, jours_arret, reclamations_clients, remontees_chauffeurs, taux_traitement_remontees, taux_traitement_pas) values
('Jan',0,1,0,1,2,0,0,2,5,80,75),
('Fév',0,0,1,0,1,1,0,1,4,85,80),
('Mar',1,1,0,1,0,0,3,3,7,86,82),
('Avr',0,0,0,0,1,0,0,1,6,90,88),
('Mai',0,1,0,1,0,1,0,2,8,92,90),
('Juin',0,0,0,0,0,0,0,0,5,95,92),
('Juil',0,0,0,0,0,0,0,0,0,0,0),
('Août',0,0,0,0,0,0,0,0,0,0,0),
('Sep',0,0,0,0,0,0,0,0,0,0,0),
('Oct',0,0,0,0,0,0,0,0,0,0,0),
('Nov',0,0,0,0,0,0,0,0,0,0,0),
('Déc',0,0,0,0,0,0,0,0,0,0,0);

-- ─── CHART DATA ───────────────────────────────────────────────

insert into activity_data (day, missions, livrees, km) values
('Lun',12,11,3840),('Mar',14,13,4210),('Mer',11,10,3560),
('Jeu',16,14,4980),('Ven',15,15,4650),('Sam',9,9,2870),('Dim',6,5,1920);

insert into fuel_data (month, litres, cout) values
('Nov',18420,27630),('Déc',17850,26775),('Jan',19200,28800),
('Fév',16900,25350),('Mar',20100,30150),('Avr',21300,31950),('Mai',19800,29700);

insert into incident_data (month, accidents, infractions, pannes) values
('Nov',1,4,3),('Déc',0,6,2),('Jan',2,3,5),
('Fév',0,2,1),('Mar',1,5,4),('Avr',0,3,2),('Mai',0,2,1);

insert into conformite_trend (mois, taux, inspections) values
('Déc',88,6),('Jan',91,8),('Fév',89,7),('Mar',93,9),('Avr',95,11),('Mai',96,6);
