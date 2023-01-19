
CREATE DATABASE INFO330_GROUP4MUS
GO
USE INFO330_GROUP4MUS
GO

CREATE TABLE tblArtist 
(ArtistID INT IDENTITY(1,1) primary key,
ArtistName varchar(50) not null,
ArtistDesc varchar(500) not null,
ArtistFollowers INT not null,
MonthlyListeners INT not null)

CREATE TABLE tblRegion 
(RegionID INT IDENTITY(1,1) primary key, 
RegionName varchar(50) NOT NULL)
GO 

CREATE TABLE tblCountry
(CountryID INT IDENTITY(1,1) primary key,
Country varchar(50) NOT NULL,
RegionID INT FOREIGN KEY REFERENCES tblRegion (RegionID) not null)
GO

CREATE TABLE tblGender
(GenderID INT IDENTITY(1,1) primary key, 
GenderName varchar(30) NOT NULL)
GO 

CREATE TABLE tblUser
(UserID INT IDENTITY(1,1) primary key,
UserFname varchar(30) NOT NULL,
UserLname varchar(30) NOT NULL,
GenderID INT FOREIGN KEY REFERENCES tblGender (GenderID) not null,
UserDOB Date NOT NULL,
CountryID INT FOREIGN KEY REFERENCES tblCountry (CountryID) not null)
GO

CREATE TABLE tblSubscriptionType
(SubscriptionTypeID INT IDENTITY(1,1) primary key,
SubscriptionTypeName varchar(50) NOT NULL)

CREATE TABLE tblSubscription
(SubscriptionID INT IDENTITY(1,1) primary key,
SubscriptionName varchar(30) NOT NULL,
UserID INT not null,
SubscriptionTypeID INT not null,
BeginDate Date NOT NULL,
EndDate DATE NOT NULL)
GO 
ALTER TABLE tblSubscription
ADD CONSTRAINT FK_Subscription_UserID
FOREIGN KEY (UserID)
REFERENCES tblUser (UserID)
GO 
ALTER TABLE tblSubscription 
ADD CONSTRAINT FK_Subscription_SubscriptionTypeID
FOREIGN KEY (SubscriptionTypeID)
REFERENCES tblSubscriptionType (SubscriptionTypeID)

CREATE TABLE tblGenre
(GenreID INT IDENTITY(1,1) primary key,
GenreName varchar(50) not Null,
GenreDesc varchar(500) not Null)
GO

CREATE TABLE tblLabel
(LabelID INT IDENTITY(1,1) primary key,
LabelName varchar(50) not Null,)
GO

CREATE TABLE tblAlbum 
(AlbumID INT IDENTITY(1,1) primary key,
AlbumName varchar(50) not null, 
AlbumReleaseDate DATE not null, 
LabelID INT FOREIGN KEY REFERENCES tblLabel (LabelID) not null)
GO 

CREATE TABLE tblRecording
(RecordingID INT IDENTITY(1,1) primary key,
RecordingName varchar(50) not null, 
GenreID INT not null,
SongID INT not null,
ArtistID INT not null)
GO 
ALTER TABLE tblRecording 
ADD CONSTRAINT FK_Recording_GenreID
FOREIGN KEY (GenreID)
REFERENCES tblGenre (GenreID)
GO 
ALTER TABLE tblRecording 
ADD CONSTRAINT FK_Recording_SongID
FOREIGN KEY (SongID)
REFERENCES tblSong (SongID)
GO 
ALTER TABLE tblRecording 
ADD CONSTRAINT FK_Recording_ArtistID
FOREIGN KEY (ArtistID)
REFERENCES tblArtist (ArtistID)

CREATE TABLE tblRecording_Album
(AlbumRecordingID INT IDENTITY(1,1) primary key,
RecordingID INT FOREIGN KEY REFERENCES tblRecording (RecordingID) not null,
AlbumID INT FOREIGN KEY REFERENCES tblAlbum (AlbumID) not null)
GO 

CREATE TABLE tblSong
(SongID INT IDENTITY(1,1) primary key, 
SongName varchar(50) not null, 
OriginalReleaseDate DATE not null)
GO 

CREATE TABLE tblRating
(RatingID INT IDENTITY(1,1) primary key, 
RatingStarNum INT not null)
GO 

CREATE TABLE tblAccessType
(AccessTypeID INT IDENTITY(1,1) primary key,
AccessTypeName varchar(50) not null)
GO 

CREATE TABLE tblAccess
(AccessID INT IDENTITY(1,1) primary key,
TimesPlayed INT not null,
RecordingID INT FOREIGN KEY REFERENCES tblRecording (RecordingID) not null,
SubscriptionID INT FOREIGN KEY REFERENCES tblSubscription (SubscriptionID) not null,
AccessTypeID INT FOREIGN KEY REFERENCES tblAccessType (AccessTypeID) not null)

CREATE TABLE tblReview
(ReviewID INT IDENTITY(1,1) primary key, 
ReviewDesr varchar(500) not null, 
AccessID INT FOREIGN KEY REFERENCES tblAccess (AccessID) not null,
RatingID INT FOREIGN KEY REFERENCES tblRating (RatingID) not null)
GO 

CREATE TABLE tblVisibility
(VisibilityID INT IDENTITY(1,1) PRIMARY KEY,
VisibilityName varchar(50) not null)
GO

CREATE TABLE tblPlaylistType
(PlaylistTypeID INT IDENTITY(1,1) PRIMARY KEY, 
PlaylistTypeName varchar(50) not null)
GO

CREATE TABLE tblPlaylist
(PlaylistID INT IDENTITY(1,1) PRIMARY KEY,
VisibilityID INT not null,
PlaylistName varchar(50) not null,
PlaylistDuration INT not null,
PlaylistDesc varchar(500) not null,
PlaylistLikes INT not null,
PlaylistTypeID INT not null
)
GO 

ALTER TABLE tblPlaylist
ADD CONSTRAINT FK_Playlist_VisibilityID
FOREIGN KEY (VisibilityID)
REFERENCES tblVisibility (VisibilityID)
GO 
ALTER TABLE tblPlaylist
ADD CONSTRAINT FK_Playlist_PlaylistTypeID
FOREIGN KEY (PlaylistTypeID)
REFERENCES tblPlaylistType (PlaylistTypeID)

CREATE TABLE tblPlaylist_Recording
(PlaylistRecordingID INT IDENTITY(1,1) PRIMARY KEY,
PlaylistID INT FOREIGN KEY REFERENCES tblPlaylist (PlaylistID) not null,
RecordingID INT FOREIGN KEY REFERENCES tblRecording (RecordingID) not null
)

ALTER TABLE tblAccess 
ADD AccessDateTime DATETIME

INSERT INTO tblPlaylistType 
VALUES('Public'), ('Private')

INSERT INTO tblAccessType 
VALUES('Download'), ('Stream'), ('Recording Likes'), ('Playlist Likes')

INSERT INTO tblSubscriptionType
VALUES('Free'), ('Premium'), ('Super Premium')

INSERT INTO tblVisibility
VALUES('Only User'), ('All Users'), ('Only Friends')

INSERT INTO tblUser
VALUES('Only User'), ('All Users'), ('Only Friends')

INSERT INTO tblLabel 
VALUES('Warner Music Group')

INSERT INTO tblRegion 
VALUES('Africa')

INSERT INTO tblGenre 
VALUES('jazz', 'American music developed from ragtime and blues.')

INSERT INTO tblSong 
VALUES('Whiskey Glasses', 'December 12, 2015'), ('Psycho', 'January 13, 2019'), ('Psycho', 'June 6, 1995'), ('Money Trees', 'April 10, 2016'), ('Die For You', 'November 17, 2022')

INSERT INTO tblRating
VALUES(0.0), (0.5), (1.0), (1.5), (2.0), (2.5), (3.0), (3.5), (4.0), (4.5), (5.0)

INSERT INTO tblArtist
VALUES('Kendrick Lamar', 'Rapper from Compton, CA', '100000', '12000'), ('YOASOBI', 'Japanese Music', '300000', '14000'),
('Red Velvet', 'K-Pop group from South Korea', '150000', '3000'), ('blackbear', 'Depressing music mood', '40000', '300'), 
('Coldplay', 'Indie Rock Band', '1300000', '24000'), ('IU', 'K-Pop singer from South Korea', '290000', '14500')

INSERT INTO tblGender 
VALUES('Female'), ('Male'), ('Nonbinary')

SELECT * FROM tblRecording 
FOR JSON PATH, INCLUDE_NULL_VALUES 
GO

SELECT * FROM tblUser 
FOR JSON PATH, INCLUDE_NULL_VALUES 
GO 

SELECT * FROM tblRegion 
FOR JSON PATH, INCLUDE_NULL_VALUES 
GO 

SELECT * FROM tblArtist
FOR JSON PATH, INCLUDE_NULL_VALUES 
GO 

SELECT * FROM tblGenre
FOR JSON PATH, INCLUDE_NULL_VALUES 
GO 
