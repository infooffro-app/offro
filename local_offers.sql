-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 10.202.21.47    Database: local_offers
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(500) NOT NULL,
  `badge_color` varchar(7) DEFAULT '#003DA5',
  `action_type` varchar(50) DEFAULT 'category',
  `action_value` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (1,'Special Offers','Get exclusive deals this week','/uploads/banners/banner1.jpg','#003DA5','category','1',1,1,'2026-05-12 06:44:39','2026-05-12 06:44:39'),(2,'Shop Now','Browse trending products','/uploads/banners/banner2.jpg','#16A34A','search','trending',2,1,'2026-05-12 06:44:39','2026-05-12 06:44:39'),(3,'Flash Sale','Limited time only - 50% OFF','/uploads/banners/banner3.jpg','#DC2626','url','/flash-sale',3,1,'2026-05-12 06:44:39','2026-05-12 06:44:39');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `status` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Food',NULL,1,'2026-05-12 07:16:34'),(2,'Hotel',NULL,1,'2026-05-12 07:16:34'),(3,'Salon',NULL,1,'2026-05-12 07:16:34'),(4,'Fashion',NULL,1,'2026-05-12 07:16:34'),(5,'Electronics',NULL,1,'2026-05-12 07:16:34'),(6,'Grocery',NULL,1,'2026-05-12 07:16:34'),(7,'Pharmacy',NULL,1,'2026-05-12 07:16:34'),(8,'Gym',NULL,1,'2026-05-12 07:16:34'),(9,'Cafe',NULL,1,'2026-05-12 07:16:34'),(10,'Beauty',NULL,1,'2026-05-12 07:16:34'),(11,'Mobile',NULL,1,'2026-05-12 07:16:34'),(12,'Furniture',NULL,1,'2026-05-12 07:16:34'),(13,'Auto',NULL,1,'2026-05-12 07:16:34'),(14,'Education',NULL,1,'2026-05-12 07:16:34'),(15,'Entertainment',NULL,1,'2026-05-12 07:16:34');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `district_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `district_id` (`district_id`),
  CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=416 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Ariyalur',1),(2,'Jayankondam',1),(3,'Sendurai',1),(4,'Andimadam',1),(5,'T.Palur',1),(6,'Udayarpalayam',1),(7,'Thirumanur',1),(8,'Kilperungarai',1),(9,'Chengalpattu',2),(10,'Tambaram',2),(11,'Maraimalai Nagar',2),(12,'Thiruporur',2),(13,'Tirukalukundram',2),(14,'Cheyyur',2),(15,'Maduranthakam',2),(16,'Uthiramerur',2),(17,'Vandalur',2),(18,'Pallavaram',2),(19,'Chromepet',2),(20,'Chennai',3),(21,'Egmore',3),(22,'Mylapore',3),(23,'Perambur',3),(24,'Ambattur',3),(25,'Sholinganallur',3),(26,'Alandur',3),(27,'Tondiarpet',3),(28,'Royapuram',3),(29,'Adyar',3),(30,'Anna Nagar',3),(31,'T. Nagar',3),(32,'Kodambakkam',3),(33,'Velachery',3),(34,'Villivakkam',3),(35,'Kolathur',3),(36,'Maduravoyal',3),(37,'Coimbatore North',4),(38,'Coimbatore South',4),(39,'Mettupalayam',4),(40,'Pollachi',4),(41,'Annur',4),(42,'Kinathukadavu',4),(43,'Sulur',4),(44,'Valparai',4),(45,'Perur',4),(46,'Karamadai',4),(47,'Madukkarai',4),(48,'Cuddalore',5),(49,'Chidambaram',5),(50,'Kattumannarkoil',5),(51,'Kurinjipadi',5),(52,'Panruti',5),(53,'Virudhachalam',5),(54,'Bhuvanagiri',5),(55,'Mangalur',5),(56,'Neyveli',5),(57,'Porto Novo',5),(58,'Srimushnam',5),(59,'Dharmapuri',6),(60,'Pennagaram',6),(61,'Palakkodu',6),(62,'Harur',6),(63,'Palacode',6),(64,'Karimangalam',6),(65,'Nallampalli',6),(66,'Morappur',6),(67,'Pappireddipatti',6),(68,'Marandahalli',6),(69,'Hogenakkal',6),(70,'Dindigul',7),(71,'Palani',7),(72,'Natham',7),(73,'Nilakottai',7),(74,'Vedasandur',7),(75,'Athoor',7),(76,'Oddanchatram',7),(77,'Kodaikanal',7),(78,'Batlagundu',7),(79,'Guziliamparai',7),(80,'Chinnalapatti',7),(81,'Reddiyarchatram',7),(82,'Erode',8),(83,'Gobichettipalayam',8),(84,'Bhavani',8),(85,'Perundurai',8),(86,'Sathyamangalam',8),(87,'Anthiyur',8),(88,'Kodumudi',8),(89,'Nambiyur',8),(90,'Modakurichi',8),(91,'Kavindapadi',8),(92,'Kangayam',8),(93,'Kallakurichi',9),(94,'Chinnasalem',9),(95,'Sankarapuram',9),(96,'Ulundurpettai',9),(97,'Tirukoilur',9),(98,'Rishivandiyam',9),(99,'Kalvarayan Hills',9),(100,'Valavanur',9),(101,'Kanchipuram',10),(102,'Sriperumbudur',10),(103,'Walajabad',10),(104,'Uthiramerur',10),(105,'Kundrathur',10),(106,'Cheyyar',10),(107,'Kattankulathur',10),(108,'Uchiyur',10),(109,'Nagercoil',11),(110,'Thuckalay',11),(111,'Vilavancode',11),(112,'Killiyoor',11),(113,'Agastheeswaramtaluk',11),(114,'Kalkulam',11),(115,'Padmanabhapuram',11),(116,'Colachel',11),(117,'Marthandam',11),(118,'Kuzhithurai',11),(119,'Eraniel',11),(120,'Karur',12),(121,'Krishnarayapuram',12),(122,'Kulithalai',12),(123,'Manmangalam',12),(124,'Aravakurichi',12),(125,'Pugalur',12),(126,'Kadavur',12),(127,'Thanthoni',12),(128,'Krishnagiri',13),(129,'Hosur',13),(130,'Bargur',13),(131,'Pochampalli',13),(132,'Veppanahalli',13),(133,'Shoolagiri',13),(134,'Kaveripattinam',13),(135,'Uthangarai',13),(136,'Kelamangalam',13),(137,'Mathur',13),(138,'Denkanikottai',13),(139,'Thally',13),(140,'Anchetty',13),(141,'Madurai North',14),(142,'Madurai South',14),(143,'Melur',14),(144,'Peraiyur',14),(145,'Tirumangalam',14),(146,'Usilampatti',14),(147,'Vadipatti',14),(148,'Koodal Nagar',14),(149,'Sholavandan',14),(150,'Thirparankundram',14),(151,'Alanganallur',14),(152,'Kallikudi',14),(153,'Mayiladuthurai',15),(154,'Sirkali',15),(155,'Tharangambadi',15),(156,'Kuthalam',15),(157,'Sembanarkoil',15),(158,'Kollidam',15),(159,'Poompuhar',15),(160,'Nagapattinam',16),(161,'Kilvelur',16),(162,'Vedaranyam',16),(163,'Thirukkuvalai',16),(164,'Thalainayar',16),(165,'Velankanni',16),(166,'Namakkal',17),(167,'Rasipuram',17),(168,'Tiruchengode',17),(169,'Paramathi-Velur',17),(170,'Sendamangalam',17),(171,'Kolli Hills',17),(172,'Erumapatty',17),(173,'Mohanur',17),(174,'Kumarapalayam',17),(175,'Elachipalayam',17),(176,'Udhagamandalam',18),(177,'Coonoor',18),(178,'Kotagiri',18),(179,'Gudalur',18),(180,'Kundah',18),(181,'Panthalur',18),(182,'Wellington',18),(183,'Lovedale',18),(184,'Perambalur',19),(185,'Arumbavur',19),(186,'Veppanthattai',19),(187,'Kunnam',19),(188,'Alathur',19),(189,'Kurumbalur',19),(190,'Esanai',19),(191,'Pudukkottai',20),(192,'Aranthangi',20),(193,'Alangudi',20),(194,'Tirumayam',20),(195,'Viralimalai',20),(196,'Iluppur',20),(197,'Gandarvakottai',20),(198,'Kulathur',20),(199,'Manamelkudi',20),(200,'Karambakudi',20),(201,'Avudaiyarkoil',20),(202,'Ramanathapuram',21),(203,'Paramakudi',21),(204,'Rameswaram',21),(205,'Tiruvadanai',21),(206,'Mudukulathur',21),(207,'Kamuthi',21),(208,'Kadaladi',21),(209,'Mandapam',21),(210,'Sayalgudi',21),(211,'Thiruvochiyam',21),(212,'Ranipet',22),(213,'Arcot',22),(214,'Walajapet',22),(215,'Arakkonam',22),(216,'Nemili',22),(217,'Sholinghur',22),(218,'Timiri',22),(219,'Kaveripakkam',22),(220,'Panapakkam',22),(221,'Salem',23),(222,'Attur',23),(223,'Mettur',23),(224,'Omalur',23),(225,'Sankari',23),(226,'Edappadi',23),(227,'Gangavalli',23),(228,'Valapady',23),(229,'Yercaud',23),(230,'Thalaivasal',23),(231,'Magudanchavadi',23),(232,'Suramangalam',23),(233,'Narasingapuram',23),(234,'Sivagangai',24),(235,'Devakottai',24),(236,'Karaikudi',24),(237,'Tiruppattur',24),(238,'Ilayankudi',24),(239,'Kallal',24),(240,'Manamadurai',24),(241,'Sakkottai',24),(242,'Singampunari',24),(243,'Thiruppuvanam',24),(244,'Tenkasi',25),(245,'Sankarankoil',25),(246,'Kadayanallur',25),(247,'Shenkottai',25),(248,'Alangulam',25),(249,'Sivagiri',25),(250,'Veerakeralampudur',25),(251,'Courtallam',25),(252,'Puliyangudi',25),(253,'Pavoorchatram',25),(254,'Thanjavur',26),(255,'Kumbakonam',26),(256,'Papanasam',26),(257,'Pattukkottai',26),(258,'Peravurani',26),(259,'Thiruvidaimarudhur',26),(260,'Orathanadu',26),(261,'Thiruvaiyaru',26),(262,'Budalur',26),(263,'Sethiyathope',26),(264,'Tiruvonam',26),(265,'Theni',27),(266,'Periyakulam',27),(267,'Uthamapalayam',27),(268,'Andipatti',27),(269,'Bodinayakanur',27),(270,'Chinnamanur',27),(271,'Cumbum',27),(272,'Gudalur',27),(273,'Kambam',27),(274,'Thevaram',27),(275,'Thoothukudi',28),(276,'Tiruchendur',28),(277,'Srivaikuntam',28),(278,'Eral',28),(279,'Kovilpatti',28),(280,'Ottapidaram',28),(281,'Vilathikulam',28),(282,'Kayalpattinam',28),(283,'Sathankulam',28),(284,'Kadambur',28),(285,'Tiruchirappalli',29),(286,'Lalgudi',29),(287,'Manachanallur',29),(288,'Musiri',29),(289,'Srirangam',29),(290,'Thottiyam',29),(291,'Tiruverumbur',29),(292,'Manapparai',29),(293,'Thuraiyur',29),(294,'Pullambadi',29),(295,'Uppiliyapuram',29),(296,'Andanallur',29),(297,'Tirunelveli',30),(298,'Palayamkottai',30),(299,'Ambasamudram',30),(300,'Nanguneri',30),(301,'Cheranmahadevi',30),(302,'Radhapuram',30),(303,'Manur',30),(304,'Valliyur',30),(305,'Pettai',30),(306,'Seevalaperi',30),(307,'Alangulam',30),(308,'Tirupathur',31),(309,'Ambur',31),(310,'Vaniyambadi',31),(311,'Natrampalli',31),(312,'Jolarpet',31),(313,'Gudiyatham',31),(314,'Alangayam',31),(315,'Kandili',31),(316,'Tiruppur',32),(317,'Dharapuram',32),(318,'Kangeyam',32),(319,'Udumalaipettai',32),(320,'Palladam',32),(321,'Avinashi',32),(322,'Madathukulam',32),(323,'Gudimangalam',32),(324,'Mulanur',32),(325,'Kundadam',32),(326,'Vellakovil',32),(327,'Tiruvallur',33),(328,'Ponneri',33),(329,'Gummidipoondi',33),(330,'Poonamallee',33),(331,'Avadi',33),(332,'Ambattur',33),(333,'Sholavaram',33),(334,'Minjur',33),(335,'Uthukottai',33),(336,'Pallipattu',33),(337,'Tiruttani',33),(338,'Kadambattur',33),(339,'Tiruvannamalai',34),(340,'Arani',34),(341,'Chengam',34),(342,'Polur',34),(343,'Kalasapakkam',34),(344,'Vembakkam',34),(345,'Thandrampet',34),(346,'Cheyyar',34),(347,'Vandavasi',34),(348,'Kilpennathur',34),(349,'Jamunamarathur',34),(350,'Tiruvarur',35),(351,'Nannilam',35),(352,'Papanasam',35),(353,'Koradacherry',35),(354,'Mannargudi',35),(355,'Thiruthuraipoondi',35),(356,'Needamangalam',35),(357,'Valangaiman',35),(358,'Kudavasal',35),(359,'Muthupettai',35),(360,'Vellore',36),(361,'Gudiyatham',36),(362,'Katpadi',36),(363,'Walajah',36),(364,'Anaicut',36),(365,'Pernambut',36),(366,'Kaniyambadi',36),(367,'Virinchipuram',36),(368,'Sankaranpalayam',36),(369,'Viluppuram',37),(370,'Tindivanam',37),(371,'Gingee',37),(372,'Vanur',37),(373,'Vikravandi',37),(374,'Thirunavalur',37),(375,'Marakkanam',37),(376,'Melmalaiyanur',37),(377,'Mugaiyur',37),(378,'Koliyanur',37),(379,'Kandamangalam',37),(380,'Virudhunagar',38),(381,'Sivakasi',38),(382,'Srivilliputhur',38),(383,'Rajapalayam',38),(384,'Sattur',38),(385,'Aruppukkottai',38),(386,'Tiruchuli',38),(387,'Vembakottai',38),(388,'Kariapatti',38),(389,'Watrap',38),(390,'Krishnankoil',38),(391,'Puducherry',39),(392,'Oulgaret',39),(393,'Ariyankuppam',39),(394,'Nettapakkam',39),(395,'Bahour',39),(396,'Mannadipet',39),(397,'Villiyanur',39),(398,'Thirubuvanai',39),(399,'Mudaliarpet',39),(400,'Lawspet',39),(401,'Karaikal',40),(402,'Thirunallar',40),(403,'Neravy',40),(404,'Kottucherry',40),(405,'Ambagarathur',40),(406,'Nedungadu',40),(407,'Tirumalairayanpattinam',40),(408,'Mahe',41),(409,'Palloor',41),(410,'Chaliyam',41),(411,'Pandakkal',41),(412,'Cherupuzha',41),(413,'Yanam',42),(414,'Coringa',42),(415,'Tondangi',42);
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `districts`
--

DROP TABLE IF EXISTS `districts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `districts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `state_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `state_id` (`state_id`),
  CONSTRAINT `districts_ibfk_1` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `districts`
--

LOCK TABLES `districts` WRITE;
/*!40000 ALTER TABLE `districts` DISABLE KEYS */;
INSERT INTO `districts` VALUES (1,'Ariyalur',1),(2,'Chengalpattu',1),(3,'Chennai',1),(4,'Coimbatore',1),(5,'Cuddalore',1),(6,'Dharmapuri',1),(7,'Dindigul',1),(8,'Erode',1),(9,'Kallakurichi',1),(10,'Kanchipuram',1),(11,'Kanyakumari',1),(12,'Karur',1),(13,'Krishnagiri',1),(14,'Madurai',1),(15,'Mayiladuthurai',1),(16,'Nagapattinam',1),(17,'Namakkal',1),(18,'Nilgiris',1),(19,'Perambalur',1),(20,'Pudukkottai',1),(21,'Ramanathapuram',1),(22,'Ranipet',1),(23,'Salem',1),(24,'Sivagangai',1),(25,'Tenkasi',1),(26,'Thanjavur',1),(27,'Theni',1),(28,'Thoothukudi',1),(29,'Tiruchirappalli',1),(30,'Tirunelveli',1),(31,'Tirupathur',1),(32,'Tiruppur',1),(33,'Tiruvallur',1),(34,'Tiruvannamalai',1),(35,'Tiruvarur',1),(36,'Vellore',1),(37,'Viluppuram',1),(38,'Virudhunagar',1),(39,'Puducherry',2),(40,'Karaikal',2),(41,'Mahe',2),(42,'Yanam',2);
/*!40000 ALTER TABLE `districts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offer_clicks`
--

DROP TABLE IF EXISTS `offer_clicks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offer_clicks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `offer_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `clicked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `offer_id` (`offer_id`),
  CONSTRAINT `offer_clicks_ibfk_1` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offer_clicks`
--

LOCK TABLES `offer_clicks` WRITE;
/*!40000 ALTER TABLE `offer_clicks` DISABLE KEYS */;
/*!40000 ALTER TABLE `offer_clicks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offers`
--

DROP TABLE IF EXISTS `offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `shop_id` int DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `description` text,
  `discount_percentage` int DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total_clicks` int DEFAULT '0',
  `is_verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `shop_id` (`shop_id`),
  CONSTRAINT `offers_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offers`
--

LOCK TABLES `offers` WRITE;
/*!40000 ALTER TABLE `offers` DISABLE KEYS */;
/*!40000 ALTER TABLE `offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shops`
--

DROP TABLE IF EXISTS `shops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `shop_name` varchar(150) NOT NULL,
  `description` text,
  `address` text,
  `state` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `latitude` varchar(50) DEFAULT NULL,
  `longitude` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `category_id` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `active` tinyint(1) DEFAULT '1',
  `state_id` int DEFAULT NULL,
  `district_id` int DEFAULT NULL,
  `city_id` int DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_category` (`category_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shops`
--

LOCK TABLES `shops` WRITE;
/*!40000 ALTER TABLE `shops` DISABLE KEYS */;
/*!40000 ALTER TABLE `shops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `states`
--

DROP TABLE IF EXISTS `states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `states` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `states`
--

LOCK TABLES `states` WRITE;
/*!40000 ALTER TABLE `states` DISABLE KEYS */;
INSERT INTO `states` VALUES (1,'Tamil Nadu'),(2,'Puducherry');
/*!40000 ALTER TABLE `states` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `otp` varchar(6) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `mobile` (`mobile`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'raj','8973452608','rajtamil02@gmail.com','$2b$10$XpfFXtWi6IBEwI6ttQYoQe67cMzkY13HgW6gyb.lTCeWZIhd9P99q','2026-05-12 07:18:01',NULL,NULL,'2026-05-12 07:18:08',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-12 12:53:46
