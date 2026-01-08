-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Mag 25, 2025 alle 23:56
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `blackjack`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `games`
--

CREATE TABLE `games` (
  `IdGame` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `TotalMatch` int(11) NOT NULL,
  `Wins` int(11) NOT NULL,
  `Loses` int(11) NOT NULL,
  `Draw` int(11) NOT NULL,
  `Results` varchar(50) NOT NULL,
  `Date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `games`
--

INSERT INTO `games` (`IdGame`, `Username`, `TotalMatch`, `Wins`, `Loses`, `Draw`, `Results`, `Date`) VALUES
(17, 'Naiky', 1, 0, 1, 0, 'PERDITA: 100', '2025-05-22'),
(18, 'Naiky', 2, 1, 0, 1, 'VINCITA: 20698', '2025-05-23'),
(25, 'Naiky', 1, 1, 0, 0, 'VINCITA: 124188', '2025-05-23'),
(26, 'Naiky', 4, 1, 3, 0, 'PERDITA: 2', '2025-05-23'),
(27, 'Momo', 1, 0, 0, 1, 'VINCITA: 0', '2025-05-23'),
(28, 'Momo', 1, 1, 0, 0, 'VINCITA: 128', '2025-05-23'),
(29, 'Naiky', 3, 1, 1, 1, 'VINCITA: 40', '2025-05-23'),
(30, 'Naiky', 1, 0, 1, 0, 'PERDITA: 100', '2025-05-23'),
(31, 'Naiky', 1, 1, 0, 0, 'VINCITA: 100', '2025-05-23'),
(32, 'Naiky', 1, 1, 0, 0, 'VINCITA: 200', '2025-05-23'),
(33, 'Naiky', 1, 1, 0, 0, 'VINCITA: 200', '2025-05-23'),
(34, 'prova', 2, 1, 1, 0, 'VINCITA: 0', '2025-05-23'),
(35, 'Naiky', 1, 1, 0, 0, 'VINCITA: 200', '2025-05-23'),
(36, 'Naiky', 1, 0, 0, 1, 'VINCITA: 0', '2025-05-23'),
(37, 'Naiky', 1, 0, 1, 0, 'PERDITA: 64', '2025-05-23'),
(38, 'Naiky', 1, 0, 1, 0, 'PERDITA: 500', '2025-05-23'),
(39, 'Naiky', 4, 2, 1, 1, 'VINCITA: 2200', '2025-05-23'),
(40, 'vodafone', 5, 3, 1, 1, 'VINCITA: 0', '2025-05-24'),
(41, 'vodafone', 4, 1, 3, 0, 'VINCITA: 64', '2025-05-24'),
(42, 'vodafone', 1, 0, 1, 0, 'PERDITA: 10', '2025-05-24'),
(43, 'vodafone', 2, 1, 1, 0, 'PERDITA: 54', '2025-05-24'),
(44, 'Naiky', 1, 0, 1, 0, 'PERDITA: 50', '2025-05-24'),
(45, 'vodafone', 1, 1, 0, 0, 'VINCITA: 64', '2025-05-24'),
(46, 'vodafone', 1, 0, 1, 0, 'PERDITA: 50', '2025-05-24'),
(47, 'Naiky', 2, 1, 1, 0, 'VINCITA: 100', '2025-05-25'),
(48, 'Naiky', 1, 1, 0, 0, 'VINCITA: 1000', '2025-05-25'),
(49, 'vodafone', 1, 1, 0, 0, 'VINCITA: 28', '2025-05-25'),
(50, 'Naiky', 1, 0, 1, 0, 'PERDITA: 50', '2025-05-25'),
(51, 'Naiky', 4, 0, 3, 1, 'PERDITA: 1500', '2025-05-25'),
(52, 'Naiky', 3, 2, 1, 0, 'VINCITA: 150', '2025-05-25'),
(53, 'Naiky', 1, 1, 0, 0, 'VINCITA: 100', '2025-05-25'),
(54, 'Naiky', 1, 1, 0, 0, 'VINCITA: 200', '2025-05-25'),
(55, 'vodafone', 2, 1, 1, 0, 'PERDITA: 9999', '2025-05-25'),
(56, 'vodafone', 2, 1, 1, 0, 'VINCITA: 1100', '2025-05-25'),
(57, 'vodafone', 2, 1, 1, 0, 'PERDITA: 6198', '2025-05-25'),
(58, 'vodafone', 1, 1, 0, 0, 'VINCITA: 9802', '2025-05-25'),
(59, 'vodafone', 3, 2, 0, 1, 'VINCITA: 12406', '2025-05-25'),
(60, 'vodafone', 1, 0, 1, 0, 'PERDITA: 100', '2025-05-25'),
(61, 'Naiky', 1, 1, 0, 0, 'VINCITA: 100', '2025-05-25'),
(62, 'vodafone', 1, 0, 1, 0, 'PERDITA: 50', '2025-05-25'),
(63, 'vodafone', 1, 0, 1, 0, 'PERDITA: 50', '2025-05-25'),
(64, 'vodafone', 1, 0, 1, 0, 'PERDITA: 100', '2025-05-25'),
(65, 'vodafone', 1, 0, 1, 0, 'PERDITA: 50', '2025-05-25'),
(66, 'vodafone', 1, 0, 1, 0, 'PERDITA: 50', '2025-05-25'),
(67, 'vodafone', 1, 0, 0, 1, 'VINCITA: 0', '2025-05-25'),
(68, 'vodafone', 1, 0, 1, 0, 'PERDITA: 10', '2025-05-25'),
(69, 'vodafone', 1, 0, 1, 0, 'PERDITA: 20', '2025-05-25'),
(70, 'vodafone', 1, 0, 1, 0, 'PERDITA: 50', '2025-05-25'),
(71, 'Nuovo', 2, 1, 1, 0, 'VINCITA: 0', '2025-05-25'),
(72, 'Nuovo', 2, 1, 1, 0, 'VINCITA: 64', '2025-05-25'),
(73, 'Nuovo', 5, 1, 4, 0, 'PERDITA: 64', '2025-05-25'),
(74, 'Nuovo', 1, 1, 0, 0, 'VINCITA: 64', '2025-05-25'),
(75, 'Nuovo', 2, 1, 1, 0, 'VINCITA: 0', '2025-05-25'),
(76, 'Nuovo', 2, 0, 2, 0, 'VINCITA: 0', '2025-05-25'),
(77, 'Nuovo', 5, 3, 2, 0, 'VINCITA: 64', '2025-05-25'),
(78, 'Nuovo', 7, 3, 4, 0, 'VINCITA: 0', '2025-05-25'),
(79, 'Nuovo', 4, 1, 2, 1, 'VINCITA: 0', '2025-05-25'),
(80, 'Nuovo', 5, 2, 2, 1, 'VINCITA: 0', '2025-05-25'),
(81, 'Nuovo', 6, 1, 3, 2, 'VINCITA: 64', '2025-05-25'),
(82, 'Naiky', 1, 0, 1, 0, 'PERDITA: 100', '2025-05-25'),
(83, 'Naiky', 1, 1, 0, 0, 'VINCITA: 100', '2025-05-25'),
(84, 'Naiky', 1, 1, 0, 0, 'VINCITA: 158529', '2025-05-25'),
(88, 'Naiky', 1, 0, 1, 0, 'PERDITA: 50', '2025-05-25'),
(91, 'Naiky', 1, 1, 0, 0, 'VINCITA: 159589', '2025-05-25'),
(92, 'Naiky', 1, 0, 1, 0, 'PERDITA: 50', '2025-05-25'),
(93, 'Naiky', 1, 1, 0, 0, 'VINCITA: 200', '2025-05-25');

-- --------------------------------------------------------

--
-- Struttura della tabella `levels`
--

CREATE TABLE `levels` (
  `Lvl` int(11) NOT NULL,
  `Name` varchar(50) NOT NULL,
  `ImagePath` varchar(500) NOT NULL,
  `MinFiches` int(11) NOT NULL,
  `Desc` varchar(125) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `levels`
--

INSERT INTO `levels` (`Lvl`, `Name`, `ImagePath`, `MinFiches`, `Desc`) VALUES
(0, 'Tavolo del Bar di Quartiere', 'https://i.ibb.co/6ckRDb9Z/level0.png', 0, 'Il tavolo d\'ingresso'),
(1, 'Tavolo del Casinò di Las Vegas', 'https://i.ibb.co/L3h9yzb/lvl1.png', 10000, 'Solo per i più coraggiosi'),
(2, 'Tavolo del Casinò di Monte Carlo', 'https://i.ibb.co/VcQ3MVgP/levle2.png', 25000, 'Solo per i campioni'),
(3, 'Tavolo del Casinò di Macao', 'https://i.ibb.co/F4rqTFRY/lvl3.png', 50000, 'Solo per le leggende'),
(4, 'Tavolo del Casinò Privato di Elite', 'https://i.ibb.co/ymQvzFnL/lvl4.png', 100000, 'La sala leggendaria');

-- --------------------------------------------------------

--
-- Struttura della tabella `players`
--

CREATE TABLE `players` (
  `Username` varchar(50) NOT NULL,
  `Name` varchar(50) DEFAULT NULL,
  `Surname` varchar(50) DEFAULT NULL,
  `Fiches` int(11) NOT NULL DEFAULT 0,
  `Image` varchar(500) NOT NULL DEFAULT 'https://i.imgur.com/VCC4UDV.jpeg',
  `Lvl` int(11) NOT NULL DEFAULT 1,
  `TopLevel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `players`
--

INSERT INTO `players` (`Username`, `Name`, `Surname`, `Fiches`, `Image`, `Lvl`, `TopLevel`) VALUES
('Admin', NULL, NULL, 0, 'https://i.imgur.com/VCC4UDV.jpeg', 0, 0),
('casuale', NULL, NULL, 50000, 'https://i.imgur.com/VCC4UDV.jpeg', 3, 3),
('cavolo', NULL, NULL, 0, 'https://i.imgur.com/VCC4UDV.jpeg', 0, 0),
('ciao', NULL, NULL, 0, 'https://i.imgur.com/VCC4UDV.jpeg', 0, 0),
('King', NULL, NULL, 1000, 'https://i.imgur.com/VCC4UDV.jpeg', 0, 0),
('Marco', NULL, NULL, 700, 'https://i.imgur.com/VCC4UDV.jpeg', 1, 3),
('Momo', NULL, NULL, 128, 'https://i.imgur.com/VCC4UDV.jpeg', 1, 4),
('Naiky', 'Nicolas', 'Dominici', 159739, 'https://i.ibb.co/k2557kW3/ff5109726555.jpg', 4, 4),
('Nier', NULL, NULL, 4000, 'https://i.imgur.com/VCC4UDV.jpeg', 1, 2),
('Nuovo', NULL, NULL, 64, 'https://i.imgur.com/VCC4UDV.jpeg', 0, 0),
('portogallo', NULL, NULL, 0, 'https://i.imgur.com/VCC4UDV.jpeg', 0, 0),
('prova', NULL, NULL, 0, 'https://i.imgur.com/VCC4UDV.jpeg', 0, 0),
('qwerty', NULL, NULL, 0, 'https://i.imgur.com/VCC4UDV.jpeg', 0, 0),
('vodafone', NULL, NULL, 26449, 'https://i.ibb.co/3m4MPgQf/f3a52eb5a97f.jpg', 2, 2),
('zlatco', NULL, NULL, 0, 'https://i.imgur.com/VCC4UDV.jpeg', 0, 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `users`
--

CREATE TABLE `users` (
  `Username` varchar(30) NOT NULL,
  `SessionId` varchar(64) DEFAULT NULL,
  `Pwd` varchar(500) NOT NULL,
  `Email` varchar(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `users`
--

INSERT INTO `users` (`Username`, `SessionId`, `Pwd`, `Email`) VALUES
('Admin', NULL, '$2y$10$g3TqkUPEe25OMo8tlYGvwuYGlaw3hwgTGfT1znOejK9X.bb7xsbpi', 'admin@gmail.com'),
('casuale', NULL, '$2y$10$EmaK/wpPjuS.nz3n4ungxuajyMqjfWIGLd6Ab2mOwYYHQ/VrHPplG', 'casuale@casuale.com'),
('cavolo', NULL, '$2y$10$oXzjFpW93wwf6qn3Spm.1OYHWp.2mKNfbesBXCod4IDYxPhcghtu2', 'cavolo@cavolo.com'),
('ciao', NULL, '$2y$10$8S9fInB8whk7ss8uUduAOuPFDCCYo8HU..DcSrwkvXoxhaaIp2P7S', 'ciao@ciao.com'),
('King', NULL, '$2y$10$LQ5lso4X0oWOyigTB4Gay.9K5ze6ah.WGoM6la95SHBPHpcRYQh3G', 'dario.racca@gmail.com'),
('Marco', NULL, '$2y$10$sj0KQkGkwxjHBsoICjKTAud8yeeUMuQ7INRb8pMs6mCnNNPq6VJxu', 'marco.rossi@gmail.com'),
('Momo', NULL, '$2y$10$r.1HSPIWsFbHyItWLtbXveFxLsI/X7SxTWBiOwVpdZnxxk5tJWlcW', 'momo@momo.com'),
('Naiky', 'p6k3gu65bv5s36rqar0tj2gt1r', '$2y$10$PLN1z.dsHnkpC7CfVpq2R.ioqL6puiOdYjuhv8PSIr8a4zj9vxhkq', 'nicolasdominici123@gmail.com'),
('Nier', NULL, '$2y$10$F98XrOFNOzTiF/I6XlLc1eIR04LGiZ/6EjQNMLgoAxBjdnMQPkv12', 'HodimenticatoLaPassword@ghmail.com'),
('Nuovo', NULL, '$2y$10$ds9sNkFlSi4GLL296uteX.JVEMfCluAehwm8spCL6UjE1V1zY23Uy', 'nuovo@nuovo.com'),
('portogallo', NULL, '$2y$10$JjtxBOg/oKEJQgttbO4JceXSF7zUinYWw0p5.AYmMV.f6Psm02G5.', 'portogallo@gmail.com'),
('prova', NULL, '$2y$10$fIPCzGsM.jnJiZtgaxof1OZwFxXCyD.g9bM26p3QsX0lgoFEAH8Bm', 'prova@prova.com'),
('qwerty', NULL, '$2y$10$8IxCQmKQs3epioUk5GaFju92lYWEV/HbyVLUgc6dNNEgnznRBK/xq', 'qert@qewr.com'),
('vodafone', NULL, '$2y$10$6Zf1TZ7bTuHURvmauzYoAefzyXSWgg02Qz5pEsRfj/4pKQwg5o6d6', 'vodafone@vodafone.com'),
('zlatco', NULL, '$2y$10$ZdMB2cpX7TTBumktIHcvMeyiCBgZtWduXAG34kMt2IDukCLLgp2sy', 'zlatan@gmail.com');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`IdGame`),
  ADD KEY `User` (`Username`);

--
-- Indici per le tabelle `levels`
--
ALTER TABLE `levels`
  ADD PRIMARY KEY (`Lvl`);

--
-- Indici per le tabelle `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`Username`),
  ADD KEY `Level` (`Lvl`);

--
-- Indici per le tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`Username`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `games`
--
ALTER TABLE `games`
  MODIFY `IdGame` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT per la tabella `levels`
--
ALTER TABLE `levels`
  MODIFY `Lvl` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `games`
--
ALTER TABLE `games`
  ADD CONSTRAINT `User` FOREIGN KEY (`Username`) REFERENCES `users` (`Username`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limiti per la tabella `players`
--
ALTER TABLE `players`
  ADD CONSTRAINT `Level` FOREIGN KEY (`Lvl`) REFERENCES `levels` (`Lvl`),
  ADD CONSTRAINT `Username` FOREIGN KEY (`Username`) REFERENCES `users` (`Username`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
