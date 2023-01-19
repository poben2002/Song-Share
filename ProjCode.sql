-- Using sample database
USE INFO330_GROUP4MUS
GO 

GO
-- Create Store Procedure to add a new row into tblPlaylist 

CREATE OR ALTER PROCEDURE storePlaylist 
@PlaylistTypeName varchar(50),
@VisibilityName varchar(30), 
@PlaylistName varchar(100),
@PlaylistDuration INT,
@PlaylistDesc varchar(500),
@PlaylistLikes INT

AS 

DECLARE @Vis_ID INT, @PlayType_ID INT 

SET @PlayType_ID = (SELECT PlaylistTypeID FROM tblPlaylistType WHERE PlaylistTypeName = @PlaylistTypeName)

SET @Vis_ID = (SELECT VisibilityID FROM tblVisibility WHERE VisibilityName = @VisibilityName)

BEGIN TRANSACTION T1 

INSERT INTO tblPlaylist(VisibilityID, PlaylistName, PlaylistDuration, PlaylistDesc, PlaylistLikes, PlaylistTypeID)
VALUES(@Vis_ID, @PlaylistName, @PlaylistDuration, @PlaylistDesc, @PlaylistLikes, @PlayType_ID)
COMMIT TRANSACTION T1 


GO
EXEC storePlaylist 
@PlaylistTypeName = 'Private',
@VisibilityName = 'Only User', 
@PlaylistName = 'Guitar Playlist',
@PlaylistDuration = 5000,
@PlaylistDesc = 'Rock songs only',
@PlaylistLikes = 8

GO
EXEC storePlaylist 
@PlaylistTypeName = 'Private',
@VisibilityName = 'Only User', 
@PlaylistName = 'Chill Playlist',
@PlaylistDuration = 7000,
@PlaylistDesc = 'Chill songs only',
@PlaylistLikes = 5

GO
EXEC storePlaylist 
@PlaylistTypeName = 'Public',
@VisibilityName = 'All Users', 
@PlaylistName = 'Pop Playlist',
@PlaylistDuration = 1280,
@PlaylistDesc = 'Recent hit songs only',
@PlaylistLikes = 12

GO
EXEC storePlaylist 
@PlaylistTypeName = 'Private',
@VisibilityName = 'Only Friends', 
@PlaylistName = 'Kendrick Playlist',
@PlaylistDuration = 13000,
@PlaylistDesc = 'Only songs from GKMC',
@PlaylistLikes = 123
GO 

-- Create a store procedure to add a new row into tblSubscription

CREATE OR ALTER PROCEDURE storeNewSub 
@UserFname varchar(50),
@UserLname varchar(50),
@UserDOB DATE,
@SubTypeName varchar(50),
@SubName varchar(50),
@BeginDate DATE,
@EndDate DATE

AS 

DECLARE @User_ID INT, @SubType_ID INT

SET @SubType_ID = (SELECT SubscriptionTypeID FROM tblSubscriptionType WHERE SubscriptionTypeName = @SubTypeName)

SET @User_ID = (SELECT UserID FROM tblUser WHERE UserFname = @UserFname AND UserLname = @UserLname AND UserDOB = @UserDOB)

BEGIN TRANSACTION T2 

INSERT INTO tblSubscription(SubscriptionName, UserID, SubscriptionTypeID, BeginDate, EndDate)
VALUES(@SubName, @User_ID, @SubType_ID, @BeginDate, @EndDate)
COMMIT TRANSACTION T2 

SELECT * FROM tblUser

GO
EXEC storeNewSub
@UserFname = 'Hannah',
@UserLname = 'Elmwood',
@UserDOB = 'June 12, 2000',
@SubTypeName = 'Premium',
@SubName = 'Hannah Account',
@BeginDate = 'March 3, 2015',
@EndDate = 'April 15, 2020'

GO
EXEC storeNewSub
@UserFname = 'Ariana',
@UserLname = 'Grande',
@UserDOB = 'March 20, 1993',
@SubTypeName = 'Premium',
@SubName = 'Ariana Account',
@BeginDate = 'March 3, 2015',
@EndDate = 'April 15, 2020'

GO
EXEC storeNewSub
@UserFname = 'Justin',
@UserLname = 'Lim',
@UserDOB = 'September 25, 2002',
@SubTypeName = 'Free',
@SubName = 'Justin Account',
@BeginDate = 'March 28, 2015',
@EndDate = 'June 16, 2020'
GO

-- Create Business Rule where no users with Subscription Type 'Free' can have access type 'Download'

CREATE OR ALTER FUNCTION noFreeDownloads() 
RETURNS INT 
AS 
BEGIN 

DECLARE @Ret INT = 0
IF EXISTS (SELECT * 
FROM tblSubscription S
    JOIN tblSubscriptionType ST ON S.SubscriptionTypeID = ST.SubscriptionTypeID
    JOIN tblAccess A ON S.SubscriptionID = A.SubscriptionID
    JOIN tblAccessType ACT ON A.AccessTypeID = ACT.AccessTypeID
WHERE ST.SubscriptionTypeName = 'Free'
    AND ACT.AccessTypeName = 'Download')
BEGIN 
SET @Ret = 1
END 
RETURN @Ret
END 

GO 
ALTER TABLE tblAccess
ADD CONSTRAINT payfordownload
CHECK (dbo.noFreeDownloads() = 0)
GO 
-- Create Business Rule where users with Subscription Type 'Free' cannot stream playlist type 'Public'

CREATE OR ALTER FUNCTION noPublicDownloads() 
RETURNS INT 
AS 
BEGIN 

DECLARE @Ret INT = 0
IF EXISTS (SELECT * 
FROM tblSubscription S
    JOIN tblSubscriptionType ST ON S.SubscriptionTypeID = ST.SubscriptionTypeID
    JOIN tblAccess A ON S.SubscriptionID = A.SubscriptionID
    JOIN tblAccessType ACT ON A.AccessTypeID = ACT.AccessTypeID
    JOIN tblRecording R ON A.RecordingID = R.RecordingID 
    JOIN tblPlaylist_Recording PR ON R.RecordingID = PR.RecordingID 
    JOIN tblPlaylist P on PR.PlaylistID = P.PlaylistID 
    JOIN tblPlaylistType PT ON P.PlaylistTypeID = PT.PlaylistTypeID 
WHERE ST.SubscriptionTypeName = 'Free'
    AND ACT.AccessTypeName = 'Stream'
    AND PT.PlaylistTypeName = 'Public')
BEGIN 
SET @Ret = 1
END 
RETURN @Ret
END 
GO 

ALTER TABLE tblAccess
ADD CONSTRAINT payforpublic
CHECK (dbo.noPublicDownloads() = 0)
GO

-- Create a computed column that calculates the number of downloaded recordings by 'Warner Music Group' Label with genre 'Pop' 
-- an user has listened to

CREATE FUNCTION warnerbroRecs(@PK INT)
RETURNS INT 
AS 
BEGIN 

DECLARE @Ret INT = (SELECT COUNT(R.RecordingID) 
FROM tblUser U 
    JOIN tblSubscription S ON U.UserID = S.UserID 
    JOIN tblAccess A ON S.SubscriptionID = A.SubscriptionID 
    JOIN tblAccessType ACT ON A.AccessTypeID = ACT.AccessTypeID
    JOIN tblRecording R ON A.RecordingID = R.RecordingID 
    JOIN tblGenre G ON R.GenreID = G.GenreID 
    JOIN tblRecording_Album RA ON R.RecordingID = RA.RecordingID 
    JOIN tblAlbum AL ON RA.AlbumID = AL.AlbumID 
    JOIN tblLabel L ON AL.LabelID = L.LabelID
WHERE G.GenreName = 'pop'
    AND ACT.AccessTypeName = 'Download'
    AND L.LabelName = 'Warner Music Group'
    AND U.UserID = @PK)

RETURN @Ret
END 

GO
ALTER TABLE tblUser 
ADD numRecs AS (dbo.warnerbroRecs(UserID))
GO 

-- Create a computed column that calculates the average rating a user gives of a streamed recordings by artists
-- with over 10000 ArtistFollowers and genre is 'jazz'

CREATE OR ALTER FUNCTION avgRating(@PK INT)
RETURNS NUMERIC(3,2)
AS 
BEGIN 

DECLARE @Ret NUMERIC(3,2) = (SELECT AVG(RatingStarNum)
FROM tblUser U 
    JOIN tblSubscription S ON U.UserID = S.UserID 
    JOIN tblAccess A ON S.SubscriptionID = A.SubscriptionID 
    JOIN tblAccessType ACT ON A.AccessTypeID = ACT.AccessTypeID
    JOIN tblReview RE ON A.AccessID = RE.AccessID 
    JOIN tblRating RA ON RE.RatingID = RA.RatingID
    JOIN tblRecording R ON A.RecordingID = R.RecordingID 
    JOIN tblGenre G ON R.GenreID = G.GenreID 
    JOIN tblArtist AR ON R.ArtistID = AR.ArtistID
WHERE AR.ArtistFollowers > 10000
    AND ACT.AccessTypeName = 'Stream'
    AND G.GenreName = 'jazz'
    AND U.UserID = @PK)
RETURN @Ret 
END 

GO
ALTER TABLE tblUser 
ADD avgRatingBigArtists AS (dbo.avgRating(UserID))
GO
-- Find the Users with over 500 downloaded recordings that started their 'Premium' after 'January 15, 2015' and also 
-- have less than 300 streamed recordings of songs with genre of 'country'

CREATE VIEW downloadsPremBP
AS 

SELECT A.*, NumStreams 
FROM

(SELECT U.UserID, COUNT(R.RecordingID) AS NumRecs
FROM tblUser U
    JOIN tblSubscription S ON U.UserID = S.UserID 
    JOIN tblSubscriptionType ST ON S.SubscriptionTypeID = ST.SubscriptionTypeID
    JOIN tblAccess A ON S.SubscriptionID = A.SubscriptionID
    JOIN tblAccessType AT ON A.AccessTypeID = AT.AccessTypeID 
    JOIN tblRecording R ON A.RecordingID = R.RecordingID 
    JOIN tblGenre G ON R.GenreID = G.GenreID 
    JOIN tblArtist AR ON R.ArtistID = AR.ArtistID
WHERE ST.SubscriptionTypeName = 'Premium'
    AND AT.AccessTypeName = 'Download'
    AND S.BeginDate > 'January 15, 2015'
GROUP BY U.UserID 
HAVING COUNT(RecordingName) > 500) A,

(SELECT U.UserID, Count(R.RecordingID) AS NumStreams
FROM tblUser U 
    JOIN tblSubscription S ON U.UserID = S.UserID 
    JOIN tblAccess A ON S.SubscriptionID = A.SubscriptionID
    JOIN tblAccessType AT ON A.AccessTypeID = AT.AccessTypeID 
    JOIN tblRecording R ON A.RecordingID = R.RecordingID 
    JOIN tblGenre G ON R.GenreID = G.GenreID 
WHERE G.GenreName = 'country'
    AND AT.AccessTypeName = 'Stream'
GROUP BY U.UserID 
HAVING COUNT(RecordingName) < 300) B

WHERE A.UserID = B.UserID
GO
-- Find the Artists 
-- with over 20 recordings of genre 'classical' and Label 'Sony Music Group'
-- less than 5 recordings of a song named 'Psycho'
-- Have over 10 recordings of genre 'RnB' 

CREATE VIEW NumDownloadsBP
AS

SELECT A.*, NumPsycho, NumRnB 
FROM

(SELECT A.ArtistID, COUNT(R.RecordingID) AS NumClassical 
FROM tblArtist A 
    JOIN tblRecording R ON A.ArtistID = R.ArtistID 
    JOIN tblGenre G ON R.GenreID = G.GenreID 
    JOIN tblRecording_Album RA ON R.RecordingID = RA.RecordingID 
    JOIN tblAlbum AL ON RA.AlbumID = AL.AlbumID 
    JOIN tblLabel L ON AL.LabelID = L.LabelID 
WHERE G.GenreName = 'classical'
    AND L.LabelName = 'Sony Music Group'
GROUP BY A.ArtistID 
HAVING COUNT(RecordingName) > 20) A,

(SELECT A.ArtistID, COUNT(R.RecordingID) AS NumPsycho
FROM tblArtist A 
    JOIN tblRecording R ON A.ArtistID = R.ArtistID 
    JOIN tblGenre G ON R.GenreID = G.GenreID 
WHERE G.GenreName = 'RnB'
GROUP BY A.ArtistID 
HAVING COUNT(RecordingName) > 10) B,

(SELECT A.ArtistID, COUNT(R.RecordingID) AS NumRnB
FROM tblArtist A 
    JOIN tblRecording R ON A.ArtistID = R.ArtistID 
    JOIN tblSong S ON R.SongID = S.SongID
WHERE S.SongName = 'Psycho'
GROUP BY A.ArtistID 
HAVING COUNT(RecordingName) < 5) C

WHERE A.ArtistID = B.ArtistID 
AND A.ArtistID = C.ArtistID 
GO
--Stored Procedure 1 - cerate a new recording with a new song, artist, and genre

CREATE PROCEDURE TS_New_Recording_3

@A_N varchar(50),
@A_DESC varchar(500),
@A_F INT,
@A_ML INT,
@G_N varchar(50),
@G_DESC varchar(500),
@S_N varchar(50),
@S_ORD DATE,
@R_N varchar(50)

AS

DECLARE @A_ID INT, @G_ID INT, @S_ID INT

BEGIN TRANSACTION T2222

INSERT INTO [dbo].[tblArtist] ([ArtistName],[ArtistDesc],[ArtistFollowers],[MonthlyListeners])
VALUES (@A_N, @A_DESC, @A_F, @A_ML)

SET @A_ID = (SELECT SCOPE_IDENTITY())


INSERT INTO [dbo].[tblGenre] ([GenreName],[GenreDesc])
VALUES (@G_N, @G_DESC)

SET @G_ID = (SELECT SCOPE_IDENTITY())


INSERT INTO [dbo].[tblSong] ([SongName],[OriginalReleaseDate])
VALUES (@S_N, @S_ORD)

SET @S_ID = (SELECT SCOPE_IDENTITY())


INSERT INTO tblRecording (RecordingName, ArtistID, GenreID, SongID)
VALUES(@R_N, @A_ID, @G_ID, @S_ID)

COMMIT TRANSACTION T2222

GO


-- Execution 1

EXEC TS_New_Recording_3

@A_N = 'Emawk',
@A_DESC = 'Artist from New York',
@A_F = 42787,
@A_ML = 427048,
@G_N = 'R&B',
@G_DESC = 'a music genre combining jazz, gospel, and blues influences',
@S_N = 'terms',
@S_ORD = 'September 13, 2018',
@R_N = 'Emawk terms Christmas Version (Explicit)'

GO

-- Execution 2

EXEC TS_New_Recording_3

@A_N = 'Bon Iver',
@A_DESC = 'Experimental folk artist Justin Vernon',
@A_F = 3313871,
@A_ML = 12943969,
@G_N = 'Experimental-Folk',
@G_DESC = 'a music genre combining folk and electronic influences',
@S_N = '33 "GOD"',
@S_ORD = 'September 30, 2016',
@R_N = '33 "GOD" by Bon Iver'

GO


-- Stored Procedure 2 - create a new playlist with a new playlist type

CREATE PROCEDURE New_Playlist_

@V_N varchar(50),
@PT_N varchar(50),
@P_N varchar(50),
@P_DUR INT,
@P_DESC varchar(500),
@P_L INT


AS

DECLARE @V_ID INT, @PT_ID INT

SET @V_ID = (SELECT VisibilityID FROM tblVisibility WHERE VisibilityName = @V_N)

BEGIN TRANSACTION T3

INSERT INTO [dbo].[tblPlaylistType] ([PlaylistTypeName])
VALUES (@PT_N)

SET @PT_ID = (SELECT SCOPE_IDENTITY())



INSERT INTO tblPlaylist (VisibilityID, PlaylistTypeID, PlaylistName, PlaylistDuration, PlaylistDesc, PlaylistLikes)
VALUES(@V_ID, @PT_ID, @P_N, @P_DUR, @P_DESC, @P_L)

COMMIT TRANSACTION T3

GO

-- Execution 1

EXEC New_Playlist_

@V_N = 'All Users',
@PT_N = 'Editorial',
@P_N = 'Top Songs 2022',
@P_DUR = 2268,
@P_DESC = 'The best songs I heard in 2022',
@P_L = 222

GO

-- BONUS PROCEDURE - Insert a recording into a Playlist, assume uniqueness of playlist names

CREATE PROCEDURE song_into_playlist4

@P_N varchar(50),
@A_N varchar(50),
@S_N varchar(50),
@S_ORD DATE,
@R_N varchar(50)

AS

DECLARE @P_ID INT, @A_ID INT, @S_ID INT, @R_ID INT 

SET @P_ID = (SELECT PlaylistID FROM tblPlaylist WHERE PlaylistName = @P_N)
SET @A_ID = (SELECT ArtistID FROM tblArtist WHERE ArtistName = @A_N)
SET @S_ID = (SELECT SongID FROM tblSong WHERE SongName = @S_N AND OriginalReleaseDate = @S_ORD)
SET @R_ID = (SELECT RecordingID FROM tblRecording WHERE RecordingName = @R_N AND ArtistID = @A_ID AND SongID = @S_ID)


BEGIN TRANSACTION T4

INSERT INTO tblPlaylist_Recording (PlaylistID, RecordingID)
VALUES(@P_ID, @R_ID)

COMMIT TRANSACTION T4

GO

-- Execution 1

EXEC song_into_playlist4

@P_N = 'Top Songs 2022',
@A_N = 'Emawk',
@S_N = 'terms',
@S_ORD = 'September 13, 2018',
@R_N = 'Emawk terms Christmas Version (Explicit)'

GO

-- Execution 2

EXEC song_into_playlist4

@P_N = 'Top Songs 2022',
@A_N = 'Bon Iver',
@S_N = '33 "GOD"',
@S_ORD = 'September 30, 2016',
@R_N = '33 "GOD" by Bon Iver'

GO

-- Computed column 1 - calculate total rnb songs per playlist

CREATE FUNCTION fn_tot_rnb_songs(@PK INT)

RETURNS INT

AS 

BEGIN 

DECLARE @RET INT = (SELECT COUNT(*)
FROM tblPlaylist P
JOIN tblPlaylist_Recording PR ON P.PlaylistID = PR.PlaylistID
JOIN tblRECORDING R ON PR.RecordingID = R.RecordingID
JOIN tblGENRE G ON R.GenreID = G.GenreID

WHERE G.GenreName = 'R&B'
AND P.PlaylistID = @PK
)

RETURN @RET

END

GO

ALTER TABLE tblPlaylist
ADD tot_rnb_recordings AS (dbo.fn_tot_rnb_songs(PlaylistID))

GO

-- Computed Clumn 2 - calculate number of recordings in the genre of R&B which were liked after December 12 2022 per user

CREATE FUNCTION fn_tot_rnb_likes_per_user(@PK INT)

RETURNS INT

AS 

BEGIN 

DECLARE @RET INT = (SELECT COUNT(*)
FROM tblUser U
JOIN tblSubscription S ON U.UserID = S.UserID
JOIN tblAccess A ON S.SubscriptionID = A.SubscriptionID
JOIN tblAccessType ACT ON A.AccessTypeID = ACT.AccessTypeID
JOIN tblRecording R ON A.RecordingID = R.RecordingID
JOIN tblGenre G ON R.GenreID = G.GenreID

WHERE U.UserID = @PK
AND G.GenreName = 'R&B'
AND A.AccessDateTime > 'December 12 2022'
AND ACT.AccessTypeName = 'Liked'
)

RETURN @RET

END

GO


ALTER TABLE tblUser
ADD tot_rnb_likes_per_user AS (dbo.fn_tot_rnb_likes_per_user(UserID))

GO


-- Business Rule 1 - Only users from Belgium with a super-premium subscription type can download music by Artist Stromae

CREATE FUNCTION fn_no_downloads ()
RETURNS INT
AS
BEGIN 
DECLARE @RET INT = 0
IF
EXISTS(SELECT * FROM tblUser U
JOIN tblCountry C ON U.CountryID = C.CountryID
JOIN tblSubscription S ON U.UserID = S.UserID
JOIN tblSubscriptionType ST ON S.SubscriptionTypeID = ST.SubscriptionTypeID
JOIN tblAccess A ON S.SubscriptionID = A.SubscriptionID
JOIN tblAccessType ACT ON A.AccessID = ACT.AccessTypeID
JOIN tblRecording R ON A.RecordingID = R.RecordingID
JOIN tblArtist AR ON R.ArtistID = AR.ArtistID


WHERE 

ACT.AccessTypeName = 'Download'
AND AR.ArtistName = 'Stromae'

AND (C.Country != 'Belgium' OR ST.SubscriptionTypeName != 'Super Premium')
 
)

BEGIN

SET @RET = 1

END

RETURN @RET

END

GO


ALTER TABLE tblAccess
ADD CONSTRAINT no_downloads_for_noa 
CHECK (dbo.fn_no_downloads () = 0)

GO



--  Business Rule 2 - No Users younger than 18 from the united states can stream music that has the word 'Explicit' in the title


CREATE FUNCTION fn_no_explicit_for_kids ()
RETURNS INT
AS
BEGIN 
DECLARE @RET INT = 0
IF
EXISTS(SELECT * FROM tblUser U
JOIN tblCountry C ON U.CountryID = C.CountryID
JOIN tblSubscription S ON U.UserID = S.UserID
JOIN tblSubscriptionType ST ON S.SubscriptionTypeID = ST.SubscriptionTypeID
JOIN tblAccess A ON S.SubscriptionID = A.SubscriptionID
JOIN tblAccessType ACT ON A.AccessID = ACT.AccessTypeID
JOIN tblRecording R ON A.RecordingID = R.RecordingID

WHERE ACT.AccessTypeName = 'Stream'
AND R.RecordingName = '%(Explicit)%'
AND U.UserDOB > DATEADD(YEAR, -18, GETDATE())
AND C.Country = 'United States' 
)

BEGIN

SET @RET = 1

END

RETURN @RET

END

GO


ALTER TABLE tblAccess
ADD CONSTRAINT no_explicit_for_kids_2 CHECK (dbo.fn_no_explicit_for_kids () = 0)

GO


--View 1

-- Get all of the users who:
-- 1. streamed more than 100 reocrdings by artist Kanye west in the last 3 years
-- 2. who streamed more than 5 albums by artist Taylor Swift in the past 2.5 years
-- 3. the average of the followers of the artists they streamed in the past 2 years is > 30,000,000


CREATE VIEW Taylor_Kanye_30m_followers
AS

SELECT A.*, TS_albums, streamed_genres

FROM 


(SELECT U.UserID, COUNT(*) AS Num_Ye_Songs
FROM tblUser U

JOIN tblSubscription S ON U.UserID = S.UserID
JOIN tblAccess A ON S.SubscriptionID = A.SubscriptionID
JOIN tblAccessType ACT ON A.AccessID = ACT.AccessTypeID
JOIN tblRecording R ON A.RecordingID = R.RecordingID
JOIN tblArtist AR ON R.ArtistID = AR.ArtistID


WHERE A.AccessDateTime > DATEADD(YEAR, -3, GETDATE())
AND AR.ArtistName = 'Kanye West'
AND ACT.AccessTypeName = 'Stream'

GROUP BY U.UserID
HAVING COUNT(*) > 100)A,


(SELECT U.UserID, COUNT(distinct AlbumID) AS TS_albums
FROM tblUser U

JOIN tblSubscription S ON U.UserID = S.UserID
JOIN tblAccess A ON S.SubscriptionID = A.SubscriptionID
JOIN tblAccessType ACT ON A.AccessID = ACT.AccessTypeID
JOIN tblRecording R ON A.RecordingID = R.RecordingID
JOIN tblArtist AR ON R.ArtistID = AR.ArtistID
JOIN tblRecording_Album RA ON R.RecordingID = RA.RecordingID


WHERE ACT.AccessTypeName = 'Stream'
AND AR.ArtistName = 'Taylor Swift'
AND A.AccessDateTime > DATEADD(MONTH, -(2.5*12), GETDATE())

GROUP BY U.UserID
HAVING COUNT(distinct AlbumID) > 5)B,




(SELECT TOP 10 WITH TIES U.UserID, COUNT(distinct R.GenreID)  AS streamed_genres 
FROM tblUser U

JOIN tblSubscription S ON U.UserID = S.UserID
JOIN tblAccess A ON S.SubscriptionID = A.SubscriptionID
JOIN tblAccessType ACT ON A.AccessID = ACT.AccessTypeID
JOIN tblRecording R ON A.RecordingID = R.RecordingID

WHERE ACT.AccessTypeName = 'Stream'
AND A.AccessDateTime > DATEADD(YEAR, -3, GETDATE())

GROUP BY U.UserID
HAVING COUNT(distinct R.GenreID) > 20
ORDER BY streamed_genres DESC
)C

WHERE A.UserID = B.UserID
AND A.UserID = C.UserID

GO




-- get all of the playlists that:
--1. have an average of more than 3/5 star rating for its songs
-- 2. Include songs from 2 albums by Billie Eilish
--3. Are from type public and the overall duration is at least 10 hours


CREATE VIEW rnbsongs_billieeilish_10hourslong
AS

SELECT A.*,BE_albums

FROM

(SELECT P.PlaylistID, AVG(RatingStarNum) AS high_rating
FROM tblPlaylist P

JOIN tblPlaylist_Recording PR ON P.PlaylistID = PR.PlaylistID
JOIN tblRecording R ON PR.RecordingID = R.RecordingID
JOIN tblAccess A ON R.RecordingID = A.RecordingID
JOIN tblAccessType ACT ON A.AccessTypeID = ACT.AccessTypeID
JOIN tblReview RE ON A.AccessID = RE.AccessID
JOIN tblRating RA ON RE.RatingID = RA.RatingID

WHERE ACT.AccessTypeName = 'Playlist Add'

GROUP BY P.PlaylistID

HAVING AVG(RatingStarNum) > 3)A,




(SELECT P.PlaylistID, COUNT(distinct AlbumID) AS BE_albums
FROM tblPlaylist P
JOIN tblPlaylist_Recording PR ON P.PlaylistID = PR.PlaylistID
JOIN tblRecording R ON PR.RecordingID = R.RecordingID
JOIN tblArtist A ON R.ArtistID = A.ArtistID
JOIN tblRecording_Album RA ON R.RecordingID = RA.RecordingID

WHERE A.ArtistName = 'Billie Eilish'

GROUP BY P.PlaylistID
HAVING COUNT(distinct AlbumID) >= 2)B,



(SELECT TOP 10 P.PlaylistID
FROM tblPlaylist P
JOIN tblPlaylist_Recording PR ON P.PlaylistID = PR.PlaylistID
JOIN tblPlaylistType PT ON P.PlaylistTypeID = PT.PlaylistTypeID

WHERE PT.PlaylistTypeName = 'User'
AND P.PlaylistDuration > (10*60*60)
ORDER BY P.PlaylistDuration
)C

WHERE 
A.PlaylistID = B.PlaylistID
AND A.PlaylistID = C.PlaylistID

GO

-- Create a stored procedure to create a new row to tblUser
CREATE OR ALTER PROCEDURE new_User1
@Fname varchar(30),
@Lname varchar(30),
@DOB Date,
@GenderN varchar(10),
@CountryN varchar(20),
@RegionN varchar(30)

AS 
DECLARE @G_ID INT, @C_ID INT, @R_ID INT

SET @G_ID = (SELECT GenderID FROM tblGender WHERE GenderName = @GenderN)

SET @R_ID = (SELECT RegionID FROM tblRegion WHERE RegionName = @RegionN)

BEGIN TRANSACTION G1 
INSERT INTO tblCountry (Country, RegionID)
VALUES(@CountryN, @R_ID)
SET @C_ID = (SELECT SCOPE_IDENTITY())

INSERT INTO tblUser(UserFname, UserLname, GenderID, UserDOB, CountryID)
VALUES(@Fname, @Lname, @G_ID, @DOB, @C_ID)
COMMIT TRANSACTION G1
GO

EXEC new_User1
@Fname = 'Hannah',
@Lname = 'Elmwood',
@DOB = 'June 12, 2000',
@GenderN = 'Female',
@CountryN = 'United States',
@RegionN = 'North America'
GO

EXEC new_User1
@Fname = 'Justin',
@Lname = 'Lim',
@DOB = 'September 25, 2002',
@GenderN = 'Male',
@CountryN = 'United States',
@RegionN = 'North America'
GO

EXEC new_User1
@Fname = 'Ariana',
@Lname = 'Grande',
@DOB = 'March 20, 1993',
@GenderN = 'Female',
@CountryN = 'United States',
@RegionN = 'North America'
GO

-- Create a stored procedure to add a new album
CREATE OR ALTER PROCEDURE newAlbum 
@AlbumN varchar(30),
@AlbumReleaseD Date,
@LabelN varchar(30)

AS 
DECLARE @L_ID INT


BEGIN TRANSACTION G2 
INSERT INTO tblLabel(LabelName)
VALUES(@LabelN)
SET @L_ID = (SELECT SCOPE_IDENTITY())

INSERT INTO tblAlbum(AlbumName, AlbumReleaseDate, LabelID)
VALUES(@AlbumN, @AlbumReleaseD, @L_ID)
COMMIT TRANSACTION G2
GO

EXEC newAlbum
@AlbumN = 'Take Caare',
@AlbumReleaseD = '2020-12-01',
@LabelN = 'Columbia'
GO

EXEC newAlbum
@AlbumN = '22, A Million',
@AlbumReleaseD = '2016-09-30',
@LabelN = 'Columbia'
GO

EXEC newAlbum
@AlbumN = 'Scorpion',
@AlbumReleaseD = '2018-07-01',
@LabelN = 'Recordcog'
GO

EXEC newAlbum
@AlbumN = 'Honestly, Nevermind',
@AlbumReleaseD = '2022-05-11',
@LabelN = 'OVO Sound'
GO

-- Create a computed column that displays the total number of songs for each artist in the last ten years
CREATE FUNCTION fn_totalSongsArtists1(@PK INT)
RETURNS INT
AS 
BEGIN 
DECLARE @RET INT = (SELECT COUNT(DISTINCT R.SongID)
                    FROM tblRECORDING R 
                        JOIN tblARTIST ARTST ON R.ArtistID = ARTST.ArtistID
                        JOIN tblSONG S ON R.SongID = S.SongID
                    WHERE S.OriginalReleaseDate > DATEADD(YEAR, -10, GETDATE())
                        AND @PK = ARTST.ArtistID
)

RETURN @RET 
END 
GO

ALTER TABLE tblArtist
ADD CalcSongsArtists1 
AS (dbo.fn_totalSongsArtists1(ArtistID))
GO

-- Create a computed column that reflects the total time of playlist duration time
-- for each recording between January 1, 2015 and December 31, 2020
CREATE OR ALTER FUNCTION fn_TotalTime(@PK INT)
RETURNS INT
AS 
BEGIN 
DECLARE @RET INT = (SELECT SUM(PlaylistDuration)
                    FROM tblRECORDING R
                        JOIN tblRECORDING_ALBUM RA ON R.RecordingID = RA.RecordingID
                        JOIN tblALBUM A ON RA.AlbumID = A.AlbumID
                        JOIN tblPLAYLIST_RECORDING PR ON R.RecordingID = PR.RecordingID
                        JOIN tblPLAYLIST P ON PR.PlaylistID = P.PlaylistID
                    WHERE A.AlbumReleaseDate > 'January 1, 2015'
                        AND A.AlbumReleaseDate < 'December 31, 2020'
                        AND @PK = R.RecordingID

)

RETURN @RET 
END 
GO

ALTER TABLE tblRECORDING
ADD Calc_TotalTime
AS (dbo.fn_TotalTime(RecordingID))
GO


-- Create a business rule that no Artists can have recordings with LabelName 'Columbia'
CREATE OR ALTER FUNCTION fn_noArtist()
RETURNS INT 
AS 
BEGIN 

DECLARE @RET INT = 0
IF 
EXISTS(SELECT *
        FROM tblArtist A
            JOIN tblRecording R ON A.ArtistID = R.ArtistID
            JOIN tblRecording_Album RA ON R.RecordingID = RA.RecordingID 
            JOIN tblAlbum AL ON RA.AlbumID = AL.AlbumID 
            JOIN tblLabel L ON AL.LabelID = L.LabelID
        WHERE L.LabelName = 'Columbia')
SET @RET = 1

RETURN @RET 
END 
GO

ALTER TABLE tblArtist
ADD CONSTRAINT ck_noArtist
CHECK (dbo.fn_noArtist()=0)
GO

-- Create a business rule that no Artists can have recordings with Genre 'Pop'
CREATE OR ALTER FUNCTION fn_noArtistGenre()
RETURNS INT 
AS 
BEGIN 

DECLARE @RET INT = 0
IF 
EXISTS(SELECT *
        FROM tblArtist A
            JOIN tblRecording R ON A.ArtistID = R.ArtistID
            JOIN tblGenre G ON R.GenreID = G.GenreID
        WHERE G.GenreName = 'Pop')
SET @RET = 1

RETURN @RET
END 
GO 

ALTER TABLE tblArtist
ADD CONSTRAINT ck_noArtistGenre
CHECK (dbo.fn_noArtistGenre()=0)
GO


-- Find artists who have 'hip-pop' recordings of an original song was released after Dec 1, 2010
-- having more than 100 of monthlylisteners
-- and having more than 2 genres for their recordings

CREATE VIEW view_artists AS
SELECT A.*, NumGenre
FROM
(SELECT A.ArtistID, A.ArtistName, SUM(MonthlyListeners) AS MonthlyL
FROM tblArtist A 
    JOIN tblRecording R ON A.ArtistID = R.ArtistID
    JOIN tblGenre G ON R.GenreID = G.GenreID
    JOIN tblSONG S ON R.SongID = S.SongID
WHERE G.GenreName = 'hip-pop'
    AND S.OriginalReleaseDate > 'Dec 1, 2010'
GROUP BY A.ArtistID, A.ArtistName
HAVING SUM(MonthlyListeners) > 100) A,

(SELECT A.ArtistID, A.ArtistName, COUNT(R.GenreID) AS NumGenre
FROM tblArtist A 
    JOIN tblRecording R ON A.ArtistID = R.ArtistID
    JOIN tblGenre G ON R.GenreID = G.GenreID
GROUP BY A.ArtistID, A.ArtistName
HAVING COUNT(R.GenreID) > 2
) B

WHERE A.ArtistID = B.ArtistID
GO


-- Find top 5 artists with over 3 recordings with Genre name 'pop' 
-- who also are in the Label 'Columbia' and have ArtistFollowers more than 250
CREATE VIEW view_fiveArtists AS
SELECT A.*, TotalFollowers
FROM
(SELECT TOP 5 WITH TIES A.ArtistID, A.ArtistName, COUNT(RecordingID) AS TotalRec
FROM tblArtist A
    JOIN tblRecording R ON A.ArtistID = R.ArtistID
    JOIN tblGenre G ON R.GenreID = G.GenreID
WHERE G.GenreName = 'pop'
GROUP BY A.ArtistID, A.ArtistName
HAVING COUNT(RecordingID) > 3
ORDER BY TotalRec DESC) A, 

(SELECT A.ArtistID, A.ArtistName, COUNT(ArtistFollowers) AS TotalFollowers
FROM tblArtist A 
    JOIN tblRecording R ON A.ArtistID = R.ArtistID
    JOIN tblRecording_Album RA ON R.RecordingID = RA.RecordingID 
    JOIN tblAlbum AL ON RA.AlbumID = AL.AlbumID 
    JOIN tblLabel L ON AL.LabelID = L.LabelID
WHERE L.LabelName = 'Columbia'
GROUP BY A.ArtistID, A.ArtistName
HAVING COUNT(ArtistFollowers) > 250) B

WHERE A.ArtistID = B.ArtistID
GO

-- Stored Procedure One
CREATE PROCEDURE stevYRecording1
@RecName VARCHAR(50),
@GName VARCHAR(50),
@GDesc VARCHAR(100),
@SName VARCHAR(50),
@SDate Date,
@AName VARCHAR(50),
@ADesc VARCHAR(100),
@AFollowers INT,
@AMonListeners INT
AS
DECLARE @G_ID INT, @S_ID INT, @A_ID INT

BEGIN TRANSACTION S1
INSERT INTO tblGenre(GenreName, GenreDesc)
VALUES(@GName, @GDesc)
SET @G_ID = (SELECT SCOPE_IDENTITY())

INSERT INTO tblSong(SongName, OriginalReleaseDate)
VALUES(@SName, @SDate)
SET @S_ID = (SELECT SCOPE_IDENTITY())

INSERT INTO tblArtist(ArtistName, ArtistDesc, ArtistFollowers, MonthlyListeners)
VALUES(@AName, @ADesc, @AFollowers, @AMonListeners)
SET @A_ID = (SELECT SCOPE_IDENTITY())

INSERT INTO tblRecording(RecordingName, GenreID, SongID, ArtistID)
VALUES(@RecName, @G_ID, @S_ID, @A_ID)

COMMIT TRANSACTION S1
GO

-- Stored Procedure One Execution One 
EXEC stevYRecording1
@RecName = 'Jump Then Fall(Taylor''s Version)',
@GName = 'Country',
@GDesc = 'Country is a genre of popular music that originated with blues, church music',
@SName = 'Jump Then Fall',
@SDate = 'April 9, 2021' ,
@AName = 'Taylor Swift',
@ADesc = 'SHE IS THE MUSIC INDUSTRY',
@AFollowers = 62872493,
@AMonListeners = 82000000

GO

-- Stored Procedure Two
CREATE PROCEDURE stevSong1
@SName VARCHAR(50),
@SDate Date
AS 

BEGIN TRANSACTION S2
INSERT INTO tblSong(SongName, OriginalReleaseDate)
VALUES(@SName, @SDate)
COMMIT TRANSACTION S2
GO

--Stored Procedure Two Execution One
EXEC stevSong1
@SName = 'Lover',
@SDate = 'August 23, 2019'
GO

-- Stored Procedure Two Execution Two
EXEC stevSong1
@SName = 'Cornelia Street',
@SDate = 'August 23, 2019'
GO

-- Business Rule One 
-- No Users who have subscriptionType 'Free' can 'Download' the song 'Lover'.
CREATE FUNCTION Fn_freeUsersNoLovers()
RETURNS INT
AS 
BEGIN
DECLARE @RET INT = 0
IF EXISTS (SELECT * FROM tblUser U
JOIN tblSubscription SUB ON U.UserID = SUB.UserID
JOIN tblSubscriptionType SUBT ON SUB.SubscriptionTypeID = SUBT.SubscriptionTypeID
JOIN tblAccess AC ON SUB.SubscriptionID = AC.SubscriptionID
JOIN tblAccessType ACT ON AC.AccessTypeID = ACT.AccessTypeID
JOIN tblRecording RE ON AC.RecordingID = RE.RecordingID
JOIN tblSong SO ON RE.SongID = SO.SongID
WHERE SUBT.SubscriptionTypeName = 'Free'
AND ACT.AccessTypeName = 'Download'
AND SO.SongName = 'Lover')
BEGIN 
SET @RET = 1
END 
RETURN @RET 
END
GO

ALTER TABLE tblUser
ADD CONSTRAINT check_freeUsersNoLovers
CHECK(dbo.Fn_freeUsersNoLovers() = 0)
GO

-- Business Rule Two
-- No Playlist of type 'Private' can have 'All Users' visibility
CREATE FUNCTION Fn_noPrivateAllUsers()
RETURNS INT
AS
BEGIN
DECLARE @RET INT = 0
IF EXISTS (SELECT * FROM tblPlaylist PL
JOIN tblPlaylistType PT ON PL.PlaylistTypeID = PT.PlaylistTypeID
JOIN tblVisibility VI ON PL.VisibilityID = VI.VisibilityID
WHERE PT.PlaylistTypeName = 'Private'
AND VI.VisibilityName = 'All Users')
BEGIN 
SET @RET = 1
END
RETURN @RET
END
GO

ALTER TABLE tblPlaylist
ADD CONSTRAINT check_noPrivateAllUsers
CHECK(dbo.Fn_noPrivateAllUsers() = 0)
GO

-- Computed Columns One
-- Write the code to create a computed column to measure the total number of songs for each label
CREATE FUNCTION Fn_totalNumSongForLabel(@PK INT)
RETURNS INT
AS
BEGIN
DECLARE @RET INT = (SELECT COUNT(*) FROM tblLabel L
JOIN tblAlbum AL ON L.LabelID = AL.LabelID
JOIN tblRecording_Album RA ON AL.AlbumID = RA.AlbumID
JOIN tblRecording RE ON RA.RecordingID = RE.RecordingID
JOIN tblSong SO ON RE.SongID = SO.SongID
WHERE L.LabelID = @PK)
RETURN @RET
END 
GO

ALTER TABLE tblLabel
ADD TotalSong AS (dbo.Fn_totalNumSongForLabel(LabelID))
GO

-- Computed Columns Two
-- Write the code to create a computed column to measure the total number of 'Male' users each country has
CREATE FUNCTION Fn_totalMaleUsersCountry(@PK INT)
RETURNS INT
AS
BEGIN
DECLARE @RET INT = (SELECT COUNT(*) FROM tblCountry C 
JOIN tblUser U ON C.CountryID = U.CountryID
JOIN tblGender G ON U.GenderID = G.GenderID
WHERE C.CountryID = @PK
AND G.GenderName = 'Male')
RETURN @RET
END
GO

ALTER TABLE tblCountry
ADD totalMaleUsers AS (dbo.Fn_totalMaleUsersCountry(CountryID))
GO

-- View One
-- Which artists
-- 1)Have over 100000 MonthlyListers with a over 12 recordings 
-- 2)Have more than 13 recordings of genre 'Pop'

SELECT A.*, NumPopRecs
FROM

(SELECT A.ArtistID, COUNT(*) AS NumRecs
FROM tblArtist A
    JOIN tblRecording R ON A.ArtistID = R.ArtistID
WHERE A.MonthlyListeners > 100000
GROUP BY A.ArtistID 
HAVING COUNT(*) > 12) A, 

(SELECT A.ArtistID, COUNT(*) AS NumPopRecs
FROM tblArtist A 
    JOIN tblRecording R ON A.ArtistID = R.ArtistID 
    JOIN tblGenre G ON R.GenreID = G.GenreID 
WHERE G.GenreName = 'Pop'
GROUP BY A.ArtistID 
HAVING COUNT(*) > 13) B

WHERE A.ArtistID = B.ArtistID
GO 

--View Two
-- Which playlists
-- 1)Contains less than 5 recordings of genre 'k-pop' from label 'Warner Music Group'
-- 2)Contains more than 13 recordings of genre 'Country'

SELECT A.*, NumCountryRecs
FROM

(SELECT P.PlaylistID, P.PlaylistName, COUNT(*) AS NumRecs
FROM tblPlaylist P 
    JOIN tblPlaylist_Recording PR ON P.PlaylistID = PR.PlaylistID 
    JOIN tblRecording R ON PR.RecordingID = R.RecordingID
    JOIN tblGenre G ON R.GenreID = G.GenreID
    JOIN tblRecording_Album RA ON R.RecordingID = RA.RecordingID
    JOIN tblAlbum A ON RA.AlbumID = A.AlbumID
    JOIN tblLabel L ON A.LabelID = L.LabelID
WHERE G.GenreName = 'k-pop'
    AND L.LabelName = 'Warner Music Group'
    GROUP BY P.PlaylistID, P.PlaylistName
HAVING COUNT(*) < 5) A, 

(SELECT P.PlaylistID, P.PlaylistName, COUNT(*) AS NumCountryRecs
FROM tblPlaylist P 
    JOIN tblPlaylist_Recording PR ON P.PlaylistID = PR.PlaylistID 
    JOIN tblRecording R ON PR.RecordingID = R.RecordingID
    JOIN tblGenre G ON R.GenreID = G.GenreID
WHERE G.GenreName = 'Country'
    GROUP BY P.PlaylistID, P.PlaylistName
HAVING COUNT(*) > 13) B

WHERE A.PlaylistID = B.PlaylistID 
