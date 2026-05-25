-- ================================================================
-- Camera Rent Embilipitiya — Database Seed
-- Generated 2026-05-25 18:35
-- Run this in the Supabase SQL Editor (Settings → SQL Editor)
-- ================================================================

-- Fix category constraint to include all real categories
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_category_check;
ALTER TABLE items ADD CONSTRAINT items_category_check
  CHECK (category IN ('camera','lens','accessory','lighting','drone','stabilizer','support','other'));

-- Clear any existing test data (safe to re-run)
TRUNCATE booking_items CASCADE;
TRUNCATE bookings   CASCADE;
TRUNCATE customers  CASCADE;
TRUNCATE items      CASCADE;

-- ── ITEMS (49 items) ──────────────────────────────
INSERT INTO items (id, sku, name, category, daily_rate, quantity) VALUES
  ('8314fc0f-7b04-435d-87ac-eaa14dd0406d','CAM-001','Sony a7iv Camera Body 84','camera',6000,1),
  ('77781ca4-b968-4324-8488-d9c75d303b2c','CAM-002','Sony a7iv Camera Body 72','camera',6000,1),
  ('639a7898-6e3f-425d-bb8b-5fc890b9976f','LNS-001','Sigma 70-200mm f/2.8 DG DN OS Sports Lens (Sony E)','lens',5000,1),
  ('3a17d004-ba52-4ee7-b1fb-70a43ed83e0c','LNS-002','Sony FE 24-70mm f/2.8 GM II Lens','lens',5000,1),
  ('e155c800-7075-438a-8ccb-8aae711f67a1','LNS-003','Sony FE 50mm f/1.4 GM Lens','lens',4000,1),
  ('26cc8450-6400-41a6-ba24-ad47f03468d0','LNS-004','Sigma 85 mm f/1.4 DG DN Art Lens for Sony E','lens',3500,1),
  ('7cf9fa9d-dcbf-468d-b5b6-5c87c2e31556','LNS-005','Sigma 20 mm f/1.4 DG DN Art Lens for Sony E','lens',3500,1),
  ('c9c1c021-c773-40e4-ba40-a6c24da4039a','LNS-006','Sigma 35 mm f/1.4 DG DN Art Lens for Sony E','lens',3500,1),
  ('34e262ca-47fd-46e5-9663-522aa5e45dc6','LNS-007','Sony FE 50mm f/1.8 Lens','lens',2000,1),
  ('925544a4-aa92-4003-89e8-a45c765b38c4','DRN-001','DJI Air 3S Drone with RC 2 Fly More Combo','drone',18000,1),
  ('1343dae7-1cd7-4ed6-865d-8b2a14162fb9','LGT-001','Godox AD600Pro Witstro All in one Outdoor Flash With Godox P90 Parabolic Softbox with Stand','lighting',6000,1),
  ('5a7e5f23-0c56-4c0e-bac0-90113df79bda','LGT-002','Godox AD600BM II Witstro Manual All-In-One Outdoor Flash with Godox P90 Parabolic Softbox and Stand','lighting',5500,1),
  ('a8bff44d-f205-4fd8-a444-443d55592f9e','LGT-003','Nanlite FC500B Bi-Color LED Spotlight with 90cm softbox and stand','lighting',5000,1),
  ('d7353e64-9e52-43b9-8e3b-15dc970d0742','LGT-004','Nanlite FS-300C RGBW Full Colour LED Monolight (Video Light) with stand','lighting',4000,1),
  ('6e8cb197-0ec4-479b-b81a-e6fe14a81ca5','LGT-005','Godox Litemons LA200Bi Bi-Color LED Light','lighting',3000,1),
  ('3f3c5a83-4baa-4454-83ec-cee11809c4a8','LGT-006','Godox BFP Flash Projection Attachment for Bowens','lighting',3500,1),
  ('5b1db5f9-6317-4010-b13e-1f61bcd1094d','LGT-007','Godox SK400II-V Studio Flash Monolight with softbox and stand','lighting',3000,1),
  ('01f92011-6486-47ad-983c-c4f88b859039','LGT-008','Godox LC500R RGB LED Light Stick','lighting',2500,1),
  ('443ad067-00b1-439c-a742-0f60ba70c473','LGT-009','Godox V1 Flash for Sony','lighting',2000,1),
  ('ad3b5414-e368-4778-94de-3b8f459c710c','LGT-010','Godox Ving V860m TTL Li-Ion Flash Kit for Sony Cameras','lighting',2000,1),
  ('f90b647b-659d-4996-bef6-6ea42847bc4d','STB-001','DJI RS 4 Gimbal Stabilizer','stabilizer',4500,1),
  ('ca4c8938-a6c1-41ad-9543-c4223dd88b3a','STB-002','DJI RS 3 Mini Stabilizer','stabilizer',3500,1),
  ('a4ffbe8c-4451-48df-8adf-5dd6d574a2df','SUP-001','Sirui SH25 Aluminum Video Tripod with Fluid Head','support',2000,1),
  ('15d49a25-e355-4e92-827b-d4988608346e','SUP-002','Sirui-C Standwith boom arm casters and sandbag chrome','support',1500,1),
  ('4eee89b3-0b97-4493-bc30-730e9b2e5f03','SUP-003','K&F Carbon Fiber Tripod','support',1000,1),
  ('353c5403-8278-49b9-805f-fe5d53a227dc','SUP-004','Nicefoto Light Stand','support',500,1),
  ('705de881-d445-48c5-8b77-0d81c757cadd','ACC-001','Godox X3 N Touchscreen TTL Wireless Flash Trigger for Nikon','accessory',1000,1),
  ('85ab5b47-4280-48ac-9f02-e7dd3edcc74c','ACC-002','Godox XPros TTL Wireless Flash Trigger for Sony Cameras','accessory',1000,1),
  ('5bac2082-7680-43c3-9d24-fe5354e1ca9b','ACC-003','Godox X3 TTL Wireless Flash Trigger For Canon','accessory',1000,1),
  ('53204ac8-da13-4399-912f-e486deb8f4b9','MEM-001','Sony 64GB SF G 300Mbps UHS II SDXC Memory Card','accessory',1000,2),
  ('fa252f69-97c2-4c82-a190-ffb0ad4e697d','MEM-002','SanDisk 64GB Extreme PRO UHS I SDXC 200MBps Memory Card','accessory',500,4),
  ('ae41a77b-9bdf-460d-ad5d-86591c01ffc4','MEM-003','SanDisk-64-GB-Extreme-Pro-MicroSDXC-Memory-Card','accessory',600,1),
  ('74acc657-e9f6-4779-8a14-b1bc3aed03be','MEM-004','SanDisk 32 GB Extreme PRO microSDXC 100mbps','accessory',500,1),
  ('e7593462-0c8c-491d-a29e-7ce239df9053','AUD-001','Focusrite Scarlett 2i2 Studio 4th Gen USB Audio Interface Bundle','other',5000,1),
  ('fd0ae55d-860d-4d8a-af54-86369e15bacd','AUD-002','DJI Mic 2-Person Compact Digital Wireless Microphone System/Recorder for Camera & Smartphone (2.4 GHz)','other',2800,1),
  ('529ce50f-0248-4794-b0af-5d77847d0cc2','PWR-001','Godox WB26 Rechargeable Lithium-Ion Battery Pack for AD600Pro Flash','accessory',900,1),
  ('2a48fd78-5fe1-4735-92da-bbdcb600a9b6','PWR-002','Panasonic Eneloop AA Rechargeable Ni-MH 4 Batteries','accessory',600,1),
  ('72c06307-8013-46d5-8644-6d9251e221be','PWR-003','Sony NP FZ100 Rechargeable Lithium Ion Battery','accessory',600,3),
  ('4f91cbd7-65a9-45a9-b3da-21f7133e323d','PWR-004','AXG K&F NP-FZ100 Battery for Sony','accessory',500,1),
  ('bec4a92e-dcbe-4bbb-b576-7d28f3f3e2ec','PWR-005','Nitecore NP-FZ100 Battery for Sony','accessory',500,1),
  ('e7364a64-a6b0-4b64-afce-868e7dbd773f','PWR-006','Godox VB26 Battery for Godox V1 & V860III (Replaces VB26A)','accessory',500,1),
  ('0120c046-52b5-40ec-8503-56c2636ddaa8','PWR-007','Godox VB26 Battery for V1 Flash Head','accessory',500,1),
  ('3237d1c1-0905-46ca-8ef0-27ff97f4de75','PWR-008','Sony Battery Charger','accessory',400,1),
  ('174e04a7-4727-48b1-8b1b-4a86e34cb111','ACC-004','Godox 100x150cm Reflector, 5-in-1 Oval','accessory',800,1),
  ('78d7c06b-3fd3-4691-9d2a-291d2e14feb7','CAM-003','GoPro HERO 8 Black','camera',2500,1),
  ('48714c5e-ffae-4882-ae46-f0183571429e','BAG-001','Side Bag','accessory',0,2),
  ('3eb18f9b-590a-4cb0-9c07-a034a6debd34','BAG-002','Lense Bag','accessory',0,4),
  ('baec3b96-4a5d-42a6-a743-c6c5fe5710bd','STB-003','Mobile gimble 7P','stabilizer',2500,1),
  ('544b66dc-909b-48f0-948a-2310f69c1820','BAG-003','K&F Camera Backpack','accessory',1000,1);

-- ── CUSTOMERS (96 customers) ──────────────────────
INSERT INTO customers (id, customer_code, full_name, phone, phone_secondary, nic, address, id_photo_url) VALUES
  ('62b55fed-d0a5-4e8a-ac7b-db765ca874d9','CUS-001','Saranga','0768013158',NULL,NULL,NULL,NULL),
  ('f0915d01-1df4-436a-975b-58bfb22a4246','CUS-002','Shehara','0773062251',NULL,'200625500819',NULL,NULL),
  ('03cb9718-3ad9-4153-9769-61ea32b70c49','CUS-003','Hasitha Weerasinghe','0716498441',NULL,'200308810348',NULL,NULL),
  ('d2bc3f19-9a72-475f-a03c-53b9a2029887','CUS-004','Dinesh Vidanagamage','0765527705',NULL,'951603457V',NULL,NULL),
  ('e387adbc-a70b-4f61-b2e9-3ee856af4db1','CUS-005','Kasun Rangana','0715954620',NULL,'893544712V',NULL,NULL),
  ('290ce0c5-dbd8-4f88-8dd6-d5b9dc72f202','CUS-006','Gihan Pramudya','0771257034',NULL,'200209905584',NULL,NULL),
  ('4ad9322b-5464-4110-a942-f173684cb80c','CUS-007','Nadeera Ravindu Lakshan','0779786182',NULL,'980042545V',NULL,NULL),
  ('3695ce3b-e076-4eab-86ef-1096f45d1cc1','CUS-008','Wathukarage Ganindu Devmina','0701882956',NULL,'200414603134',NULL,NULL),
  ('8b02f768-5f39-4b1d-bf76-43b19c0cde9c','CUS-009','Buddhika Prasad','0767274680',NULL,'982790875V',NULL,NULL),
  ('5678a78a-9789-4f47-9c27-18f8f3ada4f8','CUS-010','Madduma Walpolage Sahan Viduranga','0719158032',NULL,'200414904170',NULL,NULL),
  ('056023ae-1666-49dc-ac68-d3ac08145673','CUS-011','Gangabadawaththage Namindu Vishal Sathsara','0724681955',NULL,'200422605000',NULL,NULL),
  ('cbc9429a-4869-44ec-9f6d-876cba5fd147','CUS-012','Abeweera Arachchige Pasindu Sandakelum','0704972883',NULL,'200211103447',NULL,NULL),
  ('a1a72c91-7896-4ad5-a5ba-9df9a794350e','CUS-013','Abesekara Kaushika Nimsara','0788854286',NULL,'200514700759',NULL,NULL),
  ('5dd5c5a0-edbd-4d1d-bbbe-2387060b6203','CUS-014','Hirusha Lakshika Rupasingha','0779338639','0782545233','200020601878',NULL,NULL),
  ('2c317bd6-7cfd-433f-9d88-684df264448b','CUS-015','Passaperuma Arachchige Pramod Chathuranga','0719134312',NULL,'951393916V',NULL,NULL),
  ('2d54c49c-fe24-48e4-a41b-d3ba25b1c4fa','CUS-016','Navaraja Prabhashan','0758789173','0778070220','199524000096',NULL,NULL),
  ('40e29bb0-2043-457b-afab-60a6e98695ab','CUS-017','Pullippu Vidana Maheema Yasaswi Weerasekara','0774413827',NULL,'200730700797',NULL,NULL),
  ('6423916a-a1b8-4e61-aa08-60549642fe03','CUS-018','Pramod Yasas Rangana','0767380337',NULL,'200530400336',NULL,NULL),
  ('db99a151-a683-44ed-a11b-f9a7643106e2','CUS-019','Batawalage Don Nethindu Ridmika Shakilan Harischandra','0741887055','0711468939','990751315V',NULL,NULL),
  ('0cac3539-eae9-46d1-a5d5-dfc6f68421b6','CUS-020','R.Danoj Sandaruwan','0771305961',NULL,'200134602424',NULL,NULL),
  ('788913df-ea63-422c-8bb4-acfe2f12af36','CUS-021','Ediri Arachchige Sachith Nimantha Madhumadhawa','0763568719',NULL,'200107502790',NULL,NULL),
  ('a806e24a-dd7c-41fc-b688-739a1fe346cf','CUS-022','Nathage Dhanushka Madushan','0743415806','0783253188','200501502800',NULL,NULL),
  ('fb42a307-8c8e-4cd2-ac2c-b1c2788daa9f','CUS-023','Sandul Sithmina Danthanarayana Rosairo','0740978184',NULL,'200623700470',NULL,NULL),
  ('79eebeb1-efc0-492a-8d80-01a2fef57389','CUS-024','Sivaneththige Sehan Lakshitha','0715428809',NULL,'200235801642',NULL,NULL),
  ('e2da30d7-595f-4256-a4c2-4df3a447dc19','CUS-025','Don Siman Patabendige Senith Ninduwara','0768498534',NULL,'200624400347',NULL,NULL),
  ('4d59bace-1415-49ac-95d8-8d1dfe596a71','CUS-026','Wikash Rahul De Silwa Weerakkodi','0711191463',NULL,'200532000368',NULL,NULL),
  ('919c20cb-aba8-43b9-965c-1aa9d0efa543','CUS-027','Ganege Don Chathuranda Randika Abhayasinghe(Retro Shan)','0779361743',NULL,'200332712802',NULL,NULL),
  ('6e737b40-c8e7-4d2f-91c8-829b740b93d1','CUS-028','Punchihewage Dilhan Lakshith','0770157410',NULL,'200004001868',NULL,NULL),
  ('b1c7be76-cfc9-4c8e-b8d9-ee5b26bbe441','CUS-029','Nimasha Hansani Abesekara & A.Sachini Kaushalya','0778551338',NULL,'200461401020',NULL,NULL),
  ('d880a0b7-f368-4662-b999-88a2ff137801','CUS-030','Kalubadanage Ravindu Sachintha Kalhara','0782090547',NULL,'200128203490',NULL,NULL),
  ('995385c2-7df0-4a38-967e-775d26c27318','CUS-031','Kodithuwakku Arachchige Chanaka Deshapriya','0765538144',NULL,'200330112770',NULL,NULL),
  ('a9ea3d97-7d05-43b9-b62f-b483845313f1','CUS-032','Isuru&Samitha','0766874429','0712650654','200002401011',NULL,NULL),
  ('e1dd5d60-36b7-49f3-bbcd-a64b195d31da','CUS-033','Gamage Narthana Jananjaya Samaranayake','0774451596',NULL,'199436504395',NULL,NULL),
  ('7ab61d71-4f3f-4466-aff2-3d0301a51105','CUS-034','Samaramannage Pathum Shanaka Ranasinghe','0717454424',NULL,'200019503520',NULL,NULL),
  ('0e99f36a-599f-467b-8e1b-db2055fff2a2','CUS-035','Yasiru Banuka Abhaya Senarath','0765926343',NULL,'200333112227',NULL,NULL),
  ('eb4befba-9806-457a-845b-c67045ae468d','CUS-036','Ranhoti Asurappuli Gamage Yasiru Nimesh','0705156467',NULL,'200027602477',NULL,NULL),
  ('fe7731ee-049a-4eff-844a-14d0ba8f38e2','CUS-037','Hadun Arachchige Ashen Kalpitha Liyanage','0704962539',NULL,'200519404424',NULL,NULL),
  ('b71e8b7f-c269-4cac-b12d-66f6cfda5f42','CUS-038','Marappuli Durage Dilshan Madhusanka Nipunajith','0764504189',NULL,'990702047V',NULL,NULL),
  ('6917fb5b-74ce-4deb-b09e-246da05fbf9a','CUS-039','Hewa Magallagodage Kamal Sanjeewa','0719647516',NULL,'199428601729',NULL,NULL),
  ('f2dad845-e146-4939-af56-ead893cff322','CUS-040','Dumindu Sachin Dilhara','0787177482',NULL,'200023102250',NULL,NULL),
  ('81071cb9-cc8d-424d-9140-0d77d6bc8838','CUS-041','Mahaliyanage Don Dilshan Pramodya Dewapriya','0763046398',NULL,'200008900761',NULL,NULL),
  ('a3df9c9d-8d01-4f71-aceb-f6dfb5a4fecf','CUS-042','Gode Kankanamge Don Nishantha Karunathilake','0702690881',NULL,'941710921V',NULL,NULL),
  ('d16932c9-73a5-4b1a-a35d-fe59631d5793','CUS-043','Singappulige Pasindu Dilshan Premathilake','0763248768',NULL,'200302201783',NULL,NULL),
  ('244dbffb-4635-4b04-9554-490a56900424','CUS-044','Hewa Geeganage Kaweesh Wijenayaka','0717498485',NULL,'200706800306',NULL,NULL),
  ('2be19d8d-319f-40cc-8639-c9f27c9c6bd6','CUS-045','Hewa Geeganage Nethsara Ashen Hewage','0702442962',NULL,'199806600699',NULL,NULL),
  ('6938b154-20e3-40a5-bf69-9cff800b362f','CUS-046','Amarasinghe Pathiranalage Timud Hirushan Mandinu','0765820645',NULL,'200235401837',NULL,NULL),
  ('e80a046d-76e2-47f3-aeb0-1d6ae2504f7a','CUS-047','Jayathunga Tharindu Lakshan Madhushanka','0764095938',NULL,'200016300453',NULL,NULL),
  ('63af34de-9f27-4536-9dfe-9c6ebe1fbf91','CUS-048','Kottawaththa Kankanam Manage Piyumi Madhushika','0703011897',NULL,'200173103741',NULL,NULL),
  ('ccdd52a0-4db6-4ddc-978a-320c680ced20','CUS-049','Nammuni Arachchige Prasad Dananjaya','0767455540',NULL,'200230700494',NULL,NULL),
  ('37ebe652-cd87-421a-86c0-ee76e0348c4c','CUS-050','Abewickrama Kavindu Nethruwan','0701054742',NULL,'962824277V',NULL,NULL),
  ('b38e1f73-aa41-423b-856a-b97b92d8693d','CUS-051','Weerakoon Gamage Harindu Nawya Savintha','0701969000',NULL,'199912200500',NULL,NULL),
  ('cce59889-05a2-4245-a0eb-e79f6b67869e','CUS-052','Godagamage Harsha Madushan','0740980441',NULL,'200422002199',NULL,NULL),
  ('9da53630-2087-4845-9132-eaed192cfafb','CUS-053','Rampatige Sujeewa Priyantha','0768774560',NULL,'990762058V',NULL,NULL),
  ('44cd6793-2dbb-4ccb-8943-6e19862c9b8a','CUS-054','Weerakkodi Arachchige Navindu Deshan','0760631215',NULL,'200512500392',NULL,NULL),
  ('ff2ded54-eb3a-4268-ab36-0f08a9f9841c','CUS-055','Hannagala Gamage Dilshan Shalitha (Dream Story)','0763654459',NULL,'200402110413',NULL,NULL),
  ('d659ca4f-c7a2-4688-ae7e-d54f3398d1b3','CUS-056','Tharaka','',NULL,NULL,NULL,NULL),
  ('3fda1d12-7186-4cd5-9d01-79a72835c5d1','CUS-057','Tharu Nimanka','0763580045',NULL,NULL,NULL,NULL),
  ('215c4028-e4e9-4a02-83d9-e810c2e2b45b','CUS-058','W.D.A.P.Anuradha(Ovira Stories)','0772473564',NULL,'200636602440',NULL,NULL),
  ('c09735c1-96a7-473f-95c6-7739819593fc','CUS-059','Dehiwala Liyanage Sachith Raviruwan','0705277406',NULL,'200226700862',NULL,NULL),
  ('a7841567-4cc6-4888-b669-9d9b770f0906','CUS-060','Abeynayaka Ravindra Lakshan','0713448239',NULL,'200126802684',NULL,NULL),
  ('ccc2ebfc-e26e-473f-961c-401c5ee5a6c0','CUS-061','Waidyarathna Gamage Nishan Sajinthaka','0712145155',NULL,'943181233V',NULL,NULL),
  ('3fdbe594-d07f-4b27-b524-5039de8a8a18','CUS-062','Werahara Weerasekarage Ishan Thamodya','0779593450',NULL,'200405810911',NULL,NULL),
  ('cf0edad4-22fe-4a89-afed-532b02813627','CUS-063','Samaranayaka Harshana Prasad','0712005488','0767207500','861630870V',NULL,NULL),
  ('226e67d4-09cc-421d-a6b4-24e735d0c877','CUS-064','Kuda Mannalage Keerthi Ranjith','0762566936',NULL,'199226604420',NULL,NULL),
  ('0d292e8b-6add-4b7c-94d8-8b5057d38ce0','CUS-065','Elle Kapuge Isuru Shamika Nayanajith','0789355948',NULL,'982950872V',NULL,NULL),
  ('4ad1182f-015c-4873-83e0-e509dc59a191','CUS-066','Nanayakkara Wewa kandambige Janith Lakshan','0701756782',NULL,'973421786V',NULL,NULL),
  ('d335b11e-172b-43cf-887b-16c83d29172c','CUS-067','Hewa Gamage Dinath Sri Bodhika','0704309258',NULL,'200513503922',NULL,NULL),
  ('dc1f537e-44b9-413a-8df7-9eedaa279cb0','CUS-068','Kodithuwakku Arachchige Ashen Eranda','0761292448',NULL,'200027702448',NULL,NULL),
  ('58dc8bde-ae32-4595-ac3f-5e341b01627b','CUS-069','Kapuru Pandithage Hasitha Gayan Wejesooriya','0715790570',NULL,'910574310V',NULL,NULL),
  ('2add22c9-6c50-4ea1-9d80-2287864d86e6','CUS-070','Nallaperuma Alahapperumage Don Ishan Udayanga','0781916982',NULL,'2003205126',NULL,NULL),
  ('80abd313-e327-4279-a93d-9ee73a56c916','CUS-071','Madduma Gamage Hasal Dulanjana','',NULL,'200430301517',NULL,NULL),
  ('d0d657a9-ff15-463e-9360-82dad43de07a','CUS-072','Widana Ralalage Sudeera sampath Kumara','0779228134',NULL,'200324812021',NULL,NULL),
  ('e100bc28-7f7a-4460-9d77-0fedcf7f9bf2','CUS-073','Marappulige Upul Priyantha','0777197600',NULL,'823593791v',NULL,NULL),
  ('313ef5ef-4854-4576-a4f0-42ba605a3872','CUS-074','Ambegoda Liyanage Sachith Madhawa','0766027651',NULL,'983422217v',NULL,NULL),
  ('8f98e199-81d4-43da-ad02-7d4ec83bc438','CUS-075','Hewa Thondilage Kasun Dilshan','0703786534',NULL,'200323411819',NULL,NULL),
  ('61bfdf85-1508-4ec8-9a48-664c556fa4a8','CUS-076','Oruthota Dewage Malith Harsha Sandeepa Abeysinghe','0775759103',NULL,'200500104245',NULL,NULL),
  ('6ca197f1-d27a-4e41-ae82-7aa10477857a','CUS-077','Wawwe sittachcharige roshan hemantha','0716563107',NULL,'199527102209',NULL,NULL),
  ('a10c56e0-0f78-4f93-a4b7-642b64c5ce0f','CUS-078','Jathungamage chanuka kaveera thathsara','0781162228',NULL,'200628600877',NULL,NULL),
  ('0414cf7d-2a5d-4a9f-8c68-714b41998b02','CUS-079','Theligoda palliyaguruge tharindu madushanka','0715133516',NULL,'199701901704',NULL,NULL),
  ('d54951d1-d390-4505-be31-42e677aba1af','CUS-080','Sangeeth madhawa senanayaka','',NULL,'200212804411',NULL,NULL),
  ('86d8c008-1c0d-47a0-b226-2ac3668a9acb','CUS-081','Muththuwela gedarage dhanushka nuwan amarasinghe','0717248179',NULL,'981840950',NULL,NULL),
  ('434e5b67-5881-48bf-95d5-e71e32a0ee19','CUS-082','Rathnavibhushana gamacharige suranga sampath','0715766526',NULL,'198122000470',NULL,NULL),
  ('0a9d14b4-6588-4336-83f2-a4d3e0a0134c','CUS-083','Wanni arachchige nadeera hansamali','0767548481','0717483099','200258001178',NULL,NULL),
  ('e58930cc-b18a-4e19-93bc-56e0a5a7ab2e','CUS-084','Mutha meregngha sanuda vthsara','0762879272',NULL,'200700301146',NULL,NULL),
  ('e7f6e642-81d8-4310-8377-62f4c4b9db4c','CUS-085','Jathunge sadeepa rithmal','0767235366',NULL,'200712001940',NULL,NULL),
  ('e0a1de4a-43e2-48b7-b289-f2b9cced3c84','CUS-086','Hitige miyuru heshan chathuranga','0775507008',NULL,'912511782V',NULL,NULL),
  ('6e9050d2-8619-4cb5-819b-3393c5809f07','CUS-087','Wijenayaka kankanamge lahiru sandaruwan','0789078455',NULL,'983193471V',NULL,NULL),
  ('40b12b05-6db8-4985-9d40-c358e71924ad','CUS-088','kalindu geeshal','0716942989',NULL,NULL,NULL,NULL),
  ('cd11b208-741f-4a48-9a43-102c4538c37d','CUS-089','Balasooriya lekamlage naveen tharusha','0705247003',NULL,'200823700060',NULL,NULL),
  ('9b8eb3b6-3007-4b48-bffd-6534d54306f5','CUS-091','Yahalewela vidanalage chamika sansaka siriwardana','0754368225',NULL,'990801550V',NULL,NULL),
  ('a671c964-b390-4cf4-838a-eacbf73eb097','CUS-092','Edirisinghe arachchige baggya devindi dunuwila','0767569833',NULL,'2000865051',NULL,NULL),
  ('e8750d57-c369-420e-95bf-f936fe467bea','CUS-093','weerasinghe hettiarachchige roshan weerasinghe','0772844681',NULL,'923410988V',NULL,NULL),
  ('20bb7d7f-f5f4-4ea1-bac0-4f6ad15466e5','CUS-094','Edirisinghe Kankanamge Thisara Roshitha','0763916576',NULL,'199909401114',NULL,NULL),
  ('ab3cb425-4b0a-4adb-9a99-b6d86e411de2','CUS-095','Prasad madusan witharana','0763010088',NULL,'940493617V',NULL,NULL),
  ('edf9fedd-4fe7-4914-b1a5-41cbc0a0dfe2','CUS-096','Chathuranga lakshan Wickramaarachchi','0786641216','0788558049','199728102153',NULL,NULL),
  ('c7437cf6-8f28-4ef9-93b0-1b947791c53c','CUS-097','Hatharasinha Arachchige Aruna Janaka','0702298375',NULL,'913521412v',NULL,NULL);

-- ── BOOKINGS (30 bookings) ──────────────────────────
INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('18957fe6-2a6f-4b92-9fdc-a94aa7a5d1d3','BK-275','5dd5c5a0-edbd-4d1d-bbbe-2387060b6203','2026-01-29','2026-01-30',11000,'completed','paid','cash',0,'2026-01-29');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('ba5b3c13-80c3-4b8e-bf19-43b638c20372','18957fe6-2a6f-4b92-9fdc-a94aa7a5d1d3','c9c1c021-c773-40e4-ba40-a6c24da4039a',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('1bd75c95-2ac7-4210-aa02-379af8ab6ff0','18957fe6-2a6f-4b92-9fdc-a94aa7a5d1d3','443ad067-00b1-439c-a742-0f60ba70c473',NULL,1,2000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('00dbcd63-897d-4d82-b2eb-b2e0e2a0a257','18957fe6-2a6f-4b92-9fdc-a94aa7a5d1d3','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('bd2fee66-b266-4b03-bd8d-a673211f1f11','BK-310','226e67d4-09cc-421d-a6b4-24e735d0c877','2026-01-29','2026-01-29',3500,'completed','paid','cash',0,'2026-01-29');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('9ff4e60b-3a53-4507-9742-a7eab3b29cea','bd2fee66-b266-4b03-bd8d-a673211f1f11','26cc8450-6400-41a6-ba24-ad47f03468d0',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('a741f783-8592-4bd3-a73c-8b69a3ce5066','bd2fee66-b266-4b03-bd8d-a673211f1f11','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('08e311fc-630e-4330-a965-37a1e41f43ed','BK-312','6917fb5b-74ce-4deb-b09e-246da05fbf9a','2026-01-28','2026-01-28',3500,'completed','paid','cash',0,'2026-01-28');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('95e24aaf-42d6-4116-bf5c-92c5c893fa02','08e311fc-630e-4330-a965-37a1e41f43ed','26cc8450-6400-41a6-ba24-ad47f03468d0',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('c74a5d39-b424-46c2-b52e-a727686bfa84','08e311fc-630e-4330-a965-37a1e41f43ed','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('2a1efbe3-b15c-4e7f-8536-8497123684ac','BK-320','226e67d4-09cc-421d-a6b4-24e735d0c877','2026-01-28','2026-01-28',4000,'completed','paid','cash',0,'2026-01-28');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('588d8b16-fab6-442f-9a18-f65211aec7b5','2a1efbe3-b15c-4e7f-8536-8497123684ac','e155c800-7075-438a-8ccb-8aae711f67a1',NULL,1,4000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('cbe66647-9d66-4ddd-a3f7-7867dac51a17','2a1efbe3-b15c-4e7f-8536-8497123684ac','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('08f19d4f-9be8-4ca3-a0a8-22b86cc45c29','BK-330','4ad1182f-015c-4873-83e0-e509dc59a191','2026-01-29','2026-01-29',5000,'completed','paid','cash',0,'2026-01-29');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('47e651bc-79d2-4c6b-9857-a1b97c8aa4c9','08f19d4f-9be8-4ca3-a0a8-22b86cc45c29','3a17d004-ba52-4ee7-b1fb-70a43ed83e0c',NULL,1,5000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('af865547-5ecf-4987-8ae4-b6bd376b4c27','08f19d4f-9be8-4ca3-a0a8-22b86cc45c29','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('9965e906-aa01-4809-b8b2-81cdb78f86de','BK-336','fb42a307-8c8e-4cd2-ac2c-b1c2788daa9f','2026-02-02','2026-02-02',3500,'completed','paid','cash',0,'2026-02-02');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('ba2911af-8b7f-4544-8d27-3cf18bc5185d','9965e906-aa01-4809-b8b2-81cdb78f86de','ca4c8938-a6c1-41ad-9543-c4223dd88b3a',NULL,1,3500,false);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('12dc1700-6f50-43dc-931b-5e07ca51f6ff','BK-342','8b02f768-5f39-4b1d-bf76-43b19c0cde9c','2026-01-29','2026-01-29',3500,'completed','paid','cash',0,'2026-01-29');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('5266a6d8-a7f3-43a8-bacb-ffbb52947c53','12dc1700-6f50-43dc-931b-5e07ca51f6ff','7cf9fa9d-dcbf-468d-b5b6-5c87c2e31556',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('5b02a61d-5fdf-41c8-8716-6bf274ef7f9f','12dc1700-6f50-43dc-931b-5e07ca51f6ff','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('262d7211-79fa-43ef-8963-834d5791457f','BK-344','03cb9718-3ad9-4153-9769-61ea32b70c49','2026-02-05','2026-02-05',4000,'completed','paid','cash',0,'2026-02-05');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('55682c5f-0666-4a8e-8aa4-42405779daa0','262d7211-79fa-43ef-8963-834d5791457f','e155c800-7075-438a-8ccb-8aae711f67a1',NULL,1,4000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('cc8500f6-ad8b-442e-8ed1-1db4838ae9b3','262d7211-79fa-43ef-8963-834d5791457f','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('3315aa59-6992-43c7-b6e5-2bcfebff67cc','BK-353','4ad1182f-015c-4873-83e0-e509dc59a191','2026-01-28','2026-01-28',13000,'completed','paid','cash',0,'2026-01-28');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('f51d08cb-b3a7-4235-be3d-8b34fdacc424','3315aa59-6992-43c7-b6e5-2bcfebff67cc','77781ca4-b968-4324-8488-d9c75d303b2c',NULL,1,6000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('7685c701-b306-4fed-b1ec-5d7705db8489','3315aa59-6992-43c7-b6e5-2bcfebff67cc','72c06307-8013-46d5-8644-6d9251e221be',NULL,1,600,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('69d8a59c-7d8a-4bee-bff4-8d3a09e1550f','3315aa59-6992-43c7-b6e5-2bcfebff67cc','bec4a92e-dcbe-4bbb-b576-7d28f3f3e2ec',NULL,1,500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('72ab3651-aa2e-4de4-9a17-b30679d81f17','3315aa59-6992-43c7-b6e5-2bcfebff67cc','3237d1c1-0905-46ca-8ef0-27ff97f4de75',NULL,1,400,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('ef8b665d-da6d-4d58-bc4e-ba213323da4e','3315aa59-6992-43c7-b6e5-2bcfebff67cc','fa252f69-97c2-4c82-a190-ffb0ad4e697d',NULL,1,500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('252a2ea0-cb3a-47d9-bb06-c0668d68f09e','3315aa59-6992-43c7-b6e5-2bcfebff67cc','3a17d004-ba52-4ee7-b1fb-70a43ed83e0c',NULL,1,5000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('697128f8-21fa-4931-92b8-8d4e324293bf','3315aa59-6992-43c7-b6e5-2bcfebff67cc','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('c484178b-4a54-4760-b96c-8ff36e946d9b','BK-354','4ad1182f-015c-4873-83e0-e509dc59a191','2026-01-29','2026-01-29',8000,'completed','paid','cash',0,'2026-01-29');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('d0128f11-db4c-4680-83bb-8bfaa2612922','c484178b-4a54-4760-b96c-8ff36e946d9b','77781ca4-b968-4324-8488-d9c75d303b2c',NULL,1,6000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('33b4b888-c80c-4884-989d-dfeb4016e0a8','c484178b-4a54-4760-b96c-8ff36e946d9b','3237d1c1-0905-46ca-8ef0-27ff97f4de75',NULL,1,400,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('e5b85c1c-1691-468f-a550-da32853dd5a5','c484178b-4a54-4760-b96c-8ff36e946d9b','72c06307-8013-46d5-8644-6d9251e221be',NULL,1,600,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('785db043-174f-4f46-acee-998dc61e5d39','c484178b-4a54-4760-b96c-8ff36e946d9b','bec4a92e-dcbe-4bbb-b576-7d28f3f3e2ec',NULL,1,500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('b25eab5a-ce5c-4736-b085-bfbc2c1feb84','c484178b-4a54-4760-b96c-8ff36e946d9b','fa252f69-97c2-4c82-a190-ffb0ad4e697d',NULL,1,500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('c312a2e8-7463-4522-b450-a758318d0d4f','c484178b-4a54-4760-b96c-8ff36e946d9b','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('178c90e7-5eb0-40ca-b275-caf31fc99384','BK-358','226e67d4-09cc-421d-a6b4-24e735d0c877','2026-05-14','2026-05-14',3500,'completed','paid','cash',0,'2026-05-14');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('2c1c5f1e-722f-4e83-b0ad-44733bfca4cf','178c90e7-5eb0-40ca-b275-caf31fc99384','26cc8450-6400-41a6-ba24-ad47f03468d0',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('bd4278a3-9fa8-4e5e-b76f-66ca90889b56','178c90e7-5eb0-40ca-b275-caf31fc99384','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('d9b77a6a-297b-418e-b177-04175f8e773d','BK-360','4d59bace-1415-49ac-95d8-8d1dfe596a71','2026-01-31','2026-01-31',7000,'completed','paid','cash',0,'2026-01-31');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('53e404d3-41c3-489c-9113-7ddd8b030667','d9b77a6a-297b-418e-b177-04175f8e773d','3a17d004-ba52-4ee7-b1fb-70a43ed83e0c',NULL,1,5000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('3b52ca56-0a07-473b-bdd2-f52255156b5b','d9b77a6a-297b-418e-b177-04175f8e773d','443ad067-00b1-439c-a742-0f60ba70c473',NULL,1,2000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('e0629a28-06b0-4ac5-9cd8-317b29ee411c','d9b77a6a-297b-418e-b177-04175f8e773d','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('ba0702f9-a1ab-4326-8550-a01abf9a6f40','BK-392','226e67d4-09cc-421d-a6b4-24e735d0c877','2026-05-06','2026-05-07',7000,'completed','paid','cash',0,'2026-05-06');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('6dd82e7e-1809-47e9-a647-b19e7504099d','ba0702f9-a1ab-4326-8550-a01abf9a6f40','26cc8450-6400-41a6-ba24-ad47f03468d0',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('360c469e-b8c4-4a00-8e5c-6aaabb9ef833','ba0702f9-a1ab-4326-8550-a01abf9a6f40','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('d56dcce6-598e-41c1-8c71-5b00f7e17132','BK-406','4ad9322b-5464-4110-a942-f173684cb80c','2026-05-18','2026-05-18',13500,'completed','paid','cash',0,'2026-05-18');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('fc3af646-7c73-4cc9-98cb-3ce8edb19fca','d56dcce6-598e-41c1-8c71-5b00f7e17132','77781ca4-b968-4324-8488-d9c75d303b2c',NULL,1,6000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('e51f9152-d26e-493c-8bc4-1e004f91ad7d','d56dcce6-598e-41c1-8c71-5b00f7e17132','26cc8450-6400-41a6-ba24-ad47f03468d0',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('55b496d6-7ab3-487c-b65e-7e4daa65e720','d56dcce6-598e-41c1-8c71-5b00f7e17132','c9c1c021-c773-40e4-ba40-a6c24da4039a',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('c9fa255d-4bbe-40e5-9985-3f009eb236d1','d56dcce6-598e-41c1-8c71-5b00f7e17132','72c06307-8013-46d5-8644-6d9251e221be',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('a4cc9fc2-5dd7-48b2-ac2d-ac82fd7b374a','d56dcce6-598e-41c1-8c71-5b00f7e17132','bec4a92e-dcbe-4bbb-b576-7d28f3f3e2ec',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('0c45c400-eb8c-4a80-839f-7a15d433dc45','d56dcce6-598e-41c1-8c71-5b00f7e17132',NULL,'Free-camera charger cable',1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('14184943-7a60-42fa-829c-48f6af26aa85','d56dcce6-598e-41c1-8c71-5b00f7e17132','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('c2523ab7-d379-4a25-9f69-58e003ff86eb','d56dcce6-598e-41c1-8c71-5b00f7e17132','fa252f69-97c2-4c82-a190-ffb0ad4e697d',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('83c704cc-6906-4734-a6c7-b232516c8859','d56dcce6-598e-41c1-8c71-5b00f7e17132','fa252f69-97c2-4c82-a190-ffb0ad4e697d',NULL,1,500,false);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('cb55dc38-6c0e-4fb6-9fdb-c9914dcadcce','BK-425','4ad1182f-015c-4873-83e0-e509dc59a191','2026-05-25','2026-05-25',18500,'active','pending',NULL,0,'2026-05-25');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('f8c349b4-4530-451f-a91f-4b29bf3c7815','cb55dc38-6c0e-4fb6-9fdb-c9914dcadcce','77781ca4-b968-4324-8488-d9c75d303b2c',NULL,1,6000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('415fa1a7-0cd7-4ec5-90fe-11463f23ced7','cb55dc38-6c0e-4fb6-9fdb-c9914dcadcce','72c06307-8013-46d5-8644-6d9251e221be',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('5a317830-d07b-4bb5-a561-cfa564cd79ba','cb55dc38-6c0e-4fb6-9fdb-c9914dcadcce','bec4a92e-dcbe-4bbb-b576-7d28f3f3e2ec',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('e91cda81-1f94-4d1f-ab8d-1df717ac9bfa','cb55dc38-6c0e-4fb6-9fdb-c9914dcadcce','e155c800-7075-438a-8ccb-8aae711f67a1',NULL,1,4000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('dcc8781b-9ab0-464d-b9a6-678a253fe96f','cb55dc38-6c0e-4fb6-9fdb-c9914dcadcce','3a17d004-ba52-4ee7-b1fb-70a43ed83e0c',NULL,1,5000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('57ebc8b6-ca27-4799-bda9-66a7ab7569e3','cb55dc38-6c0e-4fb6-9fdb-c9914dcadcce','fa252f69-97c2-4c82-a190-ffb0ad4e697d',NULL,1,500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('4c796551-6f62-49b2-9ca4-f65d01e74f3e','cb55dc38-6c0e-4fb6-9fdb-c9914dcadcce','fa252f69-97c2-4c82-a190-ffb0ad4e697d',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('408a44d5-d177-42d8-826b-1780b8b1cf39','cb55dc38-6c0e-4fb6-9fdb-c9914dcadcce','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('e717945d-7039-44c6-85a6-634fa20b6ad8','cb55dc38-6c0e-4fb6-9fdb-c9914dcadcce','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('2d75ac4c-48ce-46cf-8656-86c1d9807d9f','cb55dc38-6c0e-4fb6-9fdb-c9914dcadcce','443ad067-00b1-439c-a742-0f60ba70c473',NULL,1,2000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('07137b1f-a286-4d8a-90b8-0f5152166b2e','cb55dc38-6c0e-4fb6-9fdb-c9914dcadcce','85ab5b47-4280-48ac-9f02-e7dd3edcc74c',NULL,1,1000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('2b180223-5c29-4437-bd05-93ea61755b8e','cb55dc38-6c0e-4fb6-9fdb-c9914dcadcce','3237d1c1-0905-46ca-8ef0-27ff97f4de75',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('0a523823-e709-4013-ac64-b23664cfa720','BK-426','4ad1182f-015c-4873-83e0-e509dc59a191','2026-05-27','2026-05-27',18500,'upcoming','pending',NULL,0,'2026-05-25');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('f599dcac-9500-48af-8713-7c0bbd2b205a','0a523823-e709-4013-ac64-b23664cfa720','77781ca4-b968-4324-8488-d9c75d303b2c',NULL,1,6000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('e6fcf14f-589b-4bb8-adc4-2cb8cc7b6b25','0a523823-e709-4013-ac64-b23664cfa720','72c06307-8013-46d5-8644-6d9251e221be',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('347f07e6-dbda-4914-9d18-1a6786ac6a35','0a523823-e709-4013-ac64-b23664cfa720','bec4a92e-dcbe-4bbb-b576-7d28f3f3e2ec',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('b7c044f7-c071-497c-98c2-3b06d3ea43aa','0a523823-e709-4013-ac64-b23664cfa720','e155c800-7075-438a-8ccb-8aae711f67a1',NULL,1,4000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('1e7fa2fc-65fd-4c50-ba4b-7bf5a746c7a2','0a523823-e709-4013-ac64-b23664cfa720','3a17d004-ba52-4ee7-b1fb-70a43ed83e0c',NULL,1,5000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('cfe68c41-1543-4891-a00d-108d075b6be9','0a523823-e709-4013-ac64-b23664cfa720','fa252f69-97c2-4c82-a190-ffb0ad4e697d',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('6739d920-bef2-4a2c-8bce-5d9f72188b56','0a523823-e709-4013-ac64-b23664cfa720','fa252f69-97c2-4c82-a190-ffb0ad4e697d',NULL,1,500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('a524cf50-7ed0-406c-b88e-8518d1477244','0a523823-e709-4013-ac64-b23664cfa720','443ad067-00b1-439c-a742-0f60ba70c473',NULL,1,2000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('ba0a32ec-0edf-4113-a1dc-27b83967ddd7','0a523823-e709-4013-ac64-b23664cfa720','85ab5b47-4280-48ac-9f02-e7dd3edcc74c',NULL,1,1000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('408626bc-c8cd-4fb3-9dbd-0960c3acd06d','0a523823-e709-4013-ac64-b23664cfa720','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('718f750e-b47b-4ea3-8b0d-ceec709d17e3','0a523823-e709-4013-ac64-b23664cfa720','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('0c523567-9e6e-4a2b-bf6b-a1d73becb9a6','0a523823-e709-4013-ac64-b23664cfa720','3237d1c1-0905-46ca-8ef0-27ff97f4de75',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('6f282286-3665-48ec-8844-9d37973d7036','BK-455','8b02f768-5f39-4b1d-bf76-43b19c0cde9c','2026-05-14','2026-05-14',9500,'completed','paid','cash',0,'2026-05-14');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('e10fb49e-1a05-4dd2-853e-5456df0d94a8','6f282286-3665-48ec-8844-9d37973d7036','77781ca4-b968-4324-8488-d9c75d303b2c',NULL,1,6000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('1edd0cb0-849f-49b0-b2c5-f057a517bf12','6f282286-3665-48ec-8844-9d37973d7036','72c06307-8013-46d5-8644-6d9251e221be',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('a51574d3-6a97-42f5-baaf-6282e7206ac8','6f282286-3665-48ec-8844-9d37973d7036',NULL,'Free_AXG NP-FZ100 Battery for Sony',1,0,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('6048dd75-7df3-47b4-b1ed-8419f0ba92fa','6f282286-3665-48ec-8844-9d37973d7036',NULL,'Free-camera charger cable',1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('732ef70d-1d9f-46c8-87c5-b2c9b520ee19','6f282286-3665-48ec-8844-9d37973d7036','fa252f69-97c2-4c82-a190-ffb0ad4e697d',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('94d8f9b6-9850-40d5-af6e-1ceb4871f9c4','6f282286-3665-48ec-8844-9d37973d7036','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('b4c4135b-e282-497e-aac4-e74314072a4e','6f282286-3665-48ec-8844-9d37973d7036','c9c1c021-c773-40e4-ba40-a6c24da4039a',NULL,1,3500,false);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('3e68614b-9495-4dfa-9e1f-929485552bd0','BK-466','03cb9718-3ad9-4153-9769-61ea32b70c49','2026-05-08','2026-05-08',4000,'completed','paid','cash',0,'2026-05-08');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('37ac2b79-2022-43e9-b0da-2d4b269e01a0','3e68614b-9495-4dfa-9e1f-929485552bd0','e155c800-7075-438a-8ccb-8aae711f67a1',NULL,1,4000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('ba1f63c9-5489-4328-aa07-58724e59d18c','3e68614b-9495-4dfa-9e1f-929485552bd0','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('21afc3b8-3443-4b1b-9346-596c7a192b99','BK-474','6917fb5b-74ce-4deb-b09e-246da05fbf9a','2026-05-21','2026-05-21',3500,'completed','paid','cash',0,'2026-05-21');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('7910f5b1-21c1-409b-8fce-0635a6ea41d9','21afc3b8-3443-4b1b-9346-596c7a192b99','26cc8450-6400-41a6-ba24-ad47f03468d0',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('a86ed486-92b3-46f2-baf3-889f7cf145ec','21afc3b8-3443-4b1b-9346-596c7a192b99','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('a961b31c-9ec8-42be-80b8-05e3159c5477','BK-480','03cb9718-3ad9-4153-9769-61ea32b70c49','2026-05-14','2026-05-14',6000,'completed','paid','cash',0,'2026-05-14');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('c41059bd-2349-4f42-abbd-1a55dd9b6369','a961b31c-9ec8-42be-80b8-05e3159c5477','e155c800-7075-438a-8ccb-8aae711f67a1',NULL,1,4000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('e469380a-8277-49be-8042-3d8e7f1e3a6a','a961b31c-9ec8-42be-80b8-05e3159c5477','ad3b5414-e368-4778-94de-3b8f459c710c',NULL,1,2000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('ca5c5da9-bbfc-439f-a226-dd4203c55055','a961b31c-9ec8-42be-80b8-05e3159c5477','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('f692e1b7-ccb0-4cd1-9dae-d40bc2e65f34','BK-482','9da53630-2087-4845-9132-eaed192cfafb','2026-05-28','2026-05-28',7000,'upcoming','pending',NULL,0,'2026-05-25');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('39d0b21c-850f-45c3-881f-c24f15c40d7d','f692e1b7-ccb0-4cd1-9dae-d40bc2e65f34','f90b647b-659d-4996-bef6-6ea42847bc4d',NULL,1,4500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('7876e2e7-7829-4344-8784-dc9696a9d314','f692e1b7-ccb0-4cd1-9dae-d40bc2e65f34','01f92011-6486-47ad-983c-c4f88b859039',NULL,1,2500,false);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('e9054b7c-ea91-47e8-a03d-f9847d8cdec1','BK-504','20bb7d7f-f5f4-4ea1-bac0-4f6ad15466e5','2026-05-05','2026-05-05',14000,'completed','paid','cash',0,'2026-05-05');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('d362395c-697d-47ab-97a3-f87c208aacc0','e9054b7c-ea91-47e8-a03d-f9847d8cdec1','77781ca4-b968-4324-8488-d9c75d303b2c',NULL,1,6000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('b1e8aa68-620e-42ab-9f4e-244024a0ea91','e9054b7c-ea91-47e8-a03d-f9847d8cdec1','72c06307-8013-46d5-8644-6d9251e221be',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('ded8b384-5d7d-484e-a550-06f837f7da07','e9054b7c-ea91-47e8-a03d-f9847d8cdec1','bec4a92e-dcbe-4bbb-b576-7d28f3f3e2ec',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('b276e545-f771-4e4c-9db7-92990bdc5e7e','e9054b7c-ea91-47e8-a03d-f9847d8cdec1','01f92011-6486-47ad-983c-c4f88b859039',NULL,1,2500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('ea0698da-1973-4090-8c25-d13bf4047ef0','e9054b7c-ea91-47e8-a03d-f9847d8cdec1','443ad067-00b1-439c-a742-0f60ba70c473',NULL,1,2000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('a70f11ad-961a-4416-894f-5810c793366e','e9054b7c-ea91-47e8-a03d-f9847d8cdec1','26cc8450-6400-41a6-ba24-ad47f03468d0',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('a6f9777c-c730-44e2-aaf0-21e7d96da97a','e9054b7c-ea91-47e8-a03d-f9847d8cdec1','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('79681189-0ce7-444f-90f1-b6a7314f167e','BK-506','4d59bace-1415-49ac-95d8-8d1dfe596a71','2026-05-06','2026-05-06',7000,'completed','paid','cash',0,'2026-05-06');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('736ebbd3-21be-4f33-a686-422ef4280c8e','79681189-0ce7-444f-90f1-b6a7314f167e','3a17d004-ba52-4ee7-b1fb-70a43ed83e0c',NULL,1,5000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('83e1b36f-5826-4650-b3b1-a6185291941e','79681189-0ce7-444f-90f1-b6a7314f167e','443ad067-00b1-439c-a742-0f60ba70c473',NULL,1,2000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('8830ee3b-6dff-4744-8803-73d282965ff6','79681189-0ce7-444f-90f1-b6a7314f167e','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('692df178-e929-4f03-b331-46fd64128bbf','BK-507','03cb9718-3ad9-4153-9769-61ea32b70c49','2026-06-04','2026-06-04',4000,'upcoming','pending',NULL,0,'2026-05-25');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('030d7802-e341-423d-b415-c8f8a9c5be28','692df178-e929-4f03-b331-46fd64128bbf','e155c800-7075-438a-8ccb-8aae711f67a1',NULL,1,4000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('54289b10-083e-43a7-b7db-b502f990b117','692df178-e929-4f03-b331-46fd64128bbf','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('b45b08e2-6d17-41f5-b71d-f2db1266cab9','BK-514','03cb9718-3ad9-4153-9769-61ea32b70c49','2026-05-07','2026-05-07',4000,'completed','paid','cash',0,'2026-05-07');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('28e84ee3-fb7b-4f24-b650-e08d5acd29b5','b45b08e2-6d17-41f5-b71d-f2db1266cab9','e155c800-7075-438a-8ccb-8aae711f67a1',NULL,1,4000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('30820ed8-0d3a-4230-b1cb-ac9a683703ab','b45b08e2-6d17-41f5-b71d-f2db1266cab9','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('29b5e634-8368-4947-b3c7-dbf7f0942227','BK-515','a1a72c91-7896-4ad5-a5ba-9df9a794350e','2026-05-28','2026-05-28',4000,'upcoming','pending',NULL,0,'2026-05-25');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('16e99ea5-b52f-42fe-a5ea-d8a5e375ad1b','29b5e634-8368-4947-b3c7-dbf7f0942227','e155c800-7075-438a-8ccb-8aae711f67a1',NULL,1,4000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('e96abb00-471d-447c-b079-8171b9c2917d','29b5e634-8368-4947-b3c7-dbf7f0942227','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('bdf993c8-66ce-44cf-aa3f-5d23bdcf4c2d','BK-518','056023ae-1666-49dc-ac68-d3ac08145673','2026-05-04','2026-05-04',4500,'completed','paid','cash',0,'2026-05-04');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('27be70e1-c26f-4afc-a1bc-d873a6a9461a','bdf993c8-66ce-44cf-aa3f-5d23bdcf4c2d','7cf9fa9d-dcbf-468d-b5b6-5c87c2e31556',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('13b12c24-6904-4882-94ea-686a11f4c598','bdf993c8-66ce-44cf-aa3f-5d23bdcf4c2d','85ab5b47-4280-48ac-9f02-e7dd3edcc74c',NULL,1,1000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('93a7916f-fcd3-454a-9190-1554ec482bfa','bdf993c8-66ce-44cf-aa3f-5d23bdcf4c2d','48714c5e-ffae-4882-ae46-f0183571429e',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('b57f48b8-7f30-4fbf-b091-c4e61e136de4','BK-523','9b8eb3b6-3007-4b48-bffd-6534d54306f5','2026-05-06','2026-05-06',4000,'completed','paid','cash',0,'2026-05-06');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('4b76d7a7-3736-408f-b9b0-f05e221cab8e','b57f48b8-7f30-4fbf-b091-c4e61e136de4','e155c800-7075-438a-8ccb-8aae711f67a1',NULL,1,4000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('08a1351e-40d1-4823-ab0a-38a00177bc34','b57f48b8-7f30-4fbf-b091-c4e61e136de4','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('d169f19b-be84-4491-840d-bd958df8da04','BK-525','c7437cf6-8f28-4ef9-93b0-1b947791c53c','2026-05-06','2026-05-07',7000,'completed','paid','cash',0,'2026-05-06');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('4d8d596f-ca52-4bef-b6cf-45b4ab8882f9','d169f19b-be84-4491-840d-bd958df8da04','c9c1c021-c773-40e4-ba40-a6c24da4039a',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('81c8f0d2-0787-4bb0-bd22-6e1bbc922f45','d169f19b-be84-4491-840d-bd958df8da04','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);

INSERT INTO bookings (id, booking_code, customer_id, start_date, end_date, total_price, status, payment_status, payment_method, advance_amount, created_at)
  VALUES ('498acc83-5f56-473e-94c0-981b1ccc6e65','BK-526','3fda1d12-7186-4cd5-9d01-79a72835c5d1','2026-05-06','2026-05-06',6000,'completed','paid','cash',0,'2026-05-06');
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('bab8e383-61ee-45f2-a071-2522f23e69de','498acc83-5f56-473e-94c0-981b1ccc6e65','7cf9fa9d-dcbf-468d-b5b6-5c87c2e31556',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('194afd3c-b415-4524-a163-6c9393328e9b','498acc83-5f56-473e-94c0-981b1ccc6e65','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('b4aea1a7-9931-4ae6-9b7c-c3f3a9a7372a','498acc83-5f56-473e-94c0-981b1ccc6e65','01f92011-6486-47ad-983c-c4f88b859039',NULL,1,2500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('967d2b4a-670c-4a10-b254-39e9c4d3324c','498acc83-5f56-473e-94c0-981b1ccc6e65','fd0ae55d-860d-4d8a-af54-86369e15bacd',NULL,1,2800,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('b01c2754-4ed0-4e0d-af31-8495d948d4bb','498acc83-5f56-473e-94c0-981b1ccc6e65','fd0ae55d-860d-4d8a-af54-86369e15bacd',NULL,1,2800,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('9bf3ff2b-19ef-45ea-a9b5-2cebab4fa81e','498acc83-5f56-473e-94c0-981b1ccc6e65','26cc8450-6400-41a6-ba24-ad47f03468d0',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('b5e08b29-1320-48cb-9ed7-b0f7631e57ed','498acc83-5f56-473e-94c0-981b1ccc6e65','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('a76e9380-7c85-443c-986a-c324b7465fc2','498acc83-5f56-473e-94c0-981b1ccc6e65','26cc8450-6400-41a6-ba24-ad47f03468d0',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('028043ec-70b4-4c93-89b6-c9d6935ddace','498acc83-5f56-473e-94c0-981b1ccc6e65','3eb18f9b-590a-4cb0-9c07-a034a6debd34',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('7c41d6b1-d637-40e8-a413-39d55d4c8cab','498acc83-5f56-473e-94c0-981b1ccc6e65','8314fc0f-7b04-435d-87ac-eaa14dd0406d',NULL,1,6000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('fe4c613a-e625-4cd6-9a0f-aeb448635177','498acc83-5f56-473e-94c0-981b1ccc6e65','77781ca4-b968-4324-8488-d9c75d303b2c',NULL,1,6000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('fce99d2f-7279-4f7e-a57b-dab68220b2f8','498acc83-5f56-473e-94c0-981b1ccc6e65','639a7898-6e3f-425d-bb8b-5fc890b9976f',NULL,1,5000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('baa818b2-de49-44b0-b190-10b4e471e9dc','498acc83-5f56-473e-94c0-981b1ccc6e65','26cc8450-6400-41a6-ba24-ad47f03468d0',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('e0bcf469-4fcf-48ad-9b9c-04ed93c8125e','498acc83-5f56-473e-94c0-981b1ccc6e65','c9c1c021-c773-40e4-ba40-a6c24da4039a',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('f78057dd-13e2-4577-8773-99e85f0f1ecc','498acc83-5f56-473e-94c0-981b1ccc6e65','3a17d004-ba52-4ee7-b1fb-70a43ed83e0c',NULL,1,5000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('6742ec2f-82d4-4e4f-b9f1-9f35f4509e8f','498acc83-5f56-473e-94c0-981b1ccc6e65','7cf9fa9d-dcbf-468d-b5b6-5c87c2e31556',NULL,1,3500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('1b5d9adb-f33b-4bd6-8ea8-e1f70e245bb8','498acc83-5f56-473e-94c0-981b1ccc6e65','443ad067-00b1-439c-a742-0f60ba70c473',NULL,1,2000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('8fddcacb-1db7-48a4-b8da-a3a2769dabd9','498acc83-5f56-473e-94c0-981b1ccc6e65','01f92011-6486-47ad-983c-c4f88b859039',NULL,1,2500,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('bcacce2a-d125-4fac-8c66-be3c3a6da998','498acc83-5f56-473e-94c0-981b1ccc6e65','72c06307-8013-46d5-8644-6d9251e221be',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('831a1e35-0ed5-4621-b0c0-0adcba835234','498acc83-5f56-473e-94c0-981b1ccc6e65','72c06307-8013-46d5-8644-6d9251e221be',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('3d8f2936-de45-4187-adc7-375b5e5ab320','498acc83-5f56-473e-94c0-981b1ccc6e65','72c06307-8013-46d5-8644-6d9251e221be',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('d6c5d951-2ed2-42df-8e91-a2948d1147d9','498acc83-5f56-473e-94c0-981b1ccc6e65','4f91cbd7-65a9-45a9-b3da-21f7133e323d',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('abd0485c-b6bb-4563-a9f6-8df2ae6fd646','498acc83-5f56-473e-94c0-981b1ccc6e65','bec4a92e-dcbe-4bbb-b576-7d28f3f3e2ec',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('d3ef55b8-1063-4b01-a4ce-b934abc7345e','498acc83-5f56-473e-94c0-981b1ccc6e65','ad3b5414-e368-4778-94de-3b8f459c710c',NULL,1,2000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('c5b22fb1-11ee-4e3d-a803-257f5c175c2e','498acc83-5f56-473e-94c0-981b1ccc6e65','174e04a7-4727-48b1-8b1b-4a86e34cb111',NULL,1,800,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('979980dd-a23f-4d09-9fe6-5ec17311e8ec','498acc83-5f56-473e-94c0-981b1ccc6e65','3237d1c1-0905-46ca-8ef0-27ff97f4de75',NULL,1,400,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('f570ea40-c364-4d0d-880a-7159ed678e4e','498acc83-5f56-473e-94c0-981b1ccc6e65',NULL,'Free-camera charger cable',1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('5bec9128-7da9-4a2f-a07f-3e735d7b571b','498acc83-5f56-473e-94c0-981b1ccc6e65','fa252f69-97c2-4c82-a190-ffb0ad4e697d',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('6ff159a1-f03e-455d-b6a8-5056359860d7','498acc83-5f56-473e-94c0-981b1ccc6e65','fa252f69-97c2-4c82-a190-ffb0ad4e697d',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('f88e040f-aa03-434f-a9fa-b82302292ad6','498acc83-5f56-473e-94c0-981b1ccc6e65','fa252f69-97c2-4c82-a190-ffb0ad4e697d',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('8c50c15b-fe51-48d1-929d-b21182f7fd4e','498acc83-5f56-473e-94c0-981b1ccc6e65','fa252f69-97c2-4c82-a190-ffb0ad4e697d',NULL,1,0,true);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('2c90e7be-1bbf-4233-8d97-3032b401a37b','498acc83-5f56-473e-94c0-981b1ccc6e65','53204ac8-da13-4399-912f-e486deb8f4b9',NULL,1,1000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('4c63dfee-0943-4f52-845f-81924e9dc994','498acc83-5f56-473e-94c0-981b1ccc6e65','53204ac8-da13-4399-912f-e486deb8f4b9',NULL,1,1000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('5443ca8e-f7a3-4ad5-9cd8-eff1530ae5b4','498acc83-5f56-473e-94c0-981b1ccc6e65','544b66dc-909b-48f0-948a-2310f69c1820',NULL,1,1000,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('4dd97960-959a-4f35-90b8-bb7ccd20987d','498acc83-5f56-473e-94c0-981b1ccc6e65','174e04a7-4727-48b1-8b1b-4a86e34cb111',NULL,1,800,false);
INSERT INTO booking_items (id, booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  VALUES ('e39916f6-fa5f-4eee-b272-9895de438373','498acc83-5f56-473e-94c0-981b1ccc6e65','443ad067-00b1-439c-a742-0f60ba70c473',NULL,1,2000,false);

