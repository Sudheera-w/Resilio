/* ============================================
   CREATE DATABASE
============================================ */
IF DB_ID('resilio-db') IS NULL
BEGIN
    CREATE DATABASE [resilio-db];
END
GO

USE [resilio-db];
GO


/* ============================================
   1) USERS TABLE
============================================ */
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        UserId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
        Role NVARCHAR(20) NOT NULL,
        Tier INT NOT NULL CONSTRAINT DF_Users_Tier DEFAULT (1),
        FirstName NVARCHAR(60) NULL,
        FullName NVARCHAR(120) NULL,
        Phone NVARCHAR(20) NULL,
        Email NVARCHAR(255) NULL,
        Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Status DEFAULT ('Active'),
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSUTCDATETIME())
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Users_Phone')
BEGIN
    CREATE UNIQUE INDEX UX_Users_Phone 
    ON dbo.Users(Phone) 
    WHERE Phone IS NOT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Users_Email')
BEGIN
    CREATE UNIQUE INDEX UX_Users_Email 
    ON dbo.Users(Email) 
    WHERE Email IS NOT NULL;
END
GO


/* ============================================
   2) OTP REQUESTS TABLE
============================================ */
IF OBJECT_ID('dbo.OtpRequests', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.OtpRequests (
        OtpId BIGINT IDENTITY(1,1) CONSTRAINT PK_OtpRequests PRIMARY KEY,
        Identifier NVARCHAR(255) NOT NULL,
        Channel NVARCHAR(10) NOT NULL,
        CodeHash NVARCHAR(255) NOT NULL,
        ExpiresAt DATETIME2 NOT NULL,
        Attempts INT NOT NULL CONSTRAINT DF_OtpRequests_Attempts DEFAULT (0),
        SentCount INT NOT NULL CONSTRAINT DF_OtpRequests_SentCount DEFAULT (1),
        LastSentAt DATETIME2 NOT NULL CONSTRAINT DF_OtpRequests_LastSentAt DEFAULT (SYSUTCDATETIME()),
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_OtpRequests_CreatedAt DEFAULT (SYSUTCDATETIME())
    );
END
GO

CREATE INDEX IF NOT EXISTS IX_OtpRequests_Identifier 
ON dbo.OtpRequests(Identifier);
GO

CREATE INDEX IF NOT EXISTS IX_OtpRequests_ExpiresAt 
ON dbo.OtpRequests(ExpiresAt);
GO

CREATE INDEX IF NOT EXISTS IX_OtpRequests_Identifier_CreatedAt 
ON dbo.OtpRequests(Identifier, CreatedAt DESC);
GO


/* ============================================
   3) AUDIT LOGS
============================================ */
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuditLogs (
        LogId BIGINT IDENTITY(1,1) CONSTRAINT PK_AuditLogs PRIMARY KEY,
        UserId UNIQUEIDENTIFIER NULL,
        Action NVARCHAR(50) NOT NULL,
        MetadataJson NVARCHAR(MAX) NULL,
        Ip NVARCHAR(45) NULL,
        UserAgent NVARCHAR(255) NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_AuditLogs_CreatedAt DEFAULT (SYSUTCDATETIME())
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AuditLogs_UserId_CreatedAt')
BEGIN
    CREATE INDEX IX_AuditLogs_UserId_CreatedAt 
    ON dbo.AuditLogs(UserId, CreatedAt);
END
GO


/* ============================================
   4) REFRESH TOKENS
============================================ */
IF OBJECT_ID('dbo.RefreshTokens', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.RefreshTokens (
        TokenId BIGINT IDENTITY(1,1) CONSTRAINT PK_RefreshTokens PRIMARY KEY,
        UserId UNIQUEIDENTIFIER NOT NULL,
        TokenHash NVARCHAR(255) NOT NULL,
        ExpiresAt DATETIME2 NOT NULL,
        RevokedAt DATETIME2 NULL,
        ReplacedByTokenHash NVARCHAR(255) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_RefreshTokens_Users
            FOREIGN KEY (UserId) 
            REFERENCES dbo.Users(UserId)
            ON DELETE CASCADE
    );
END
GO

CREATE INDEX IF NOT EXISTS IX_RefreshTokens_UserId 
ON dbo.RefreshTokens(UserId);
GO

CREATE INDEX IF NOT EXISTS IX_RefreshTokens_TokenHash 
ON dbo.RefreshTokens(TokenHash);
GO


/* ============================================
   5) VICTIM PROFILES
============================================ */
IF OBJECT_ID('dbo.VictimProfiles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.VictimProfiles (
        UserId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_VictimProfiles PRIMARY KEY,
        LocationText NVARCHAR(255) NULL,
        HelpCategoriesJson NVARCHAR(MAX) NULL,
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_VictimProfiles_Users
            FOREIGN KEY (UserId) 
            REFERENCES dbo.Users(UserId)
            ON DELETE CASCADE
    );
END
GO


/* ============================================
   6) VOLUNTEER PROFILES
============================================ */
IF OBJECT_ID('dbo.VolunteerProfiles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.VolunteerProfiles (
        UserId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_VolunteerProfiles PRIMARY KEY,
        LocationText NVARCHAR(255) NULL,
        SkillsJson NVARCHAR(MAX) NULL,
        Availability NVARCHAR(100) NULL,
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_VolunteerProfiles_Users
            FOREIGN KEY (UserId) 
            REFERENCES dbo.Users(UserId)
            ON DELETE CASCADE
    );
END
GO

/* ============================================
   7)create relief requests table
============================================ */
IF OBJECT_ID('dbo.ReliefRequests', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ReliefRequests (
        RequestId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        CreatedByUserId UNIQUEIDENTIFIER NOT NULL,
        Area NVARCHAR(255) NOT NULL,
        Description NVARCHAR(1000) NULL,
        Urgency NVARCHAR(50) NOT NULL, -- 'Low' | 'Medium' | 'High' | 'Critical'
        Status NVARCHAR(50) NOT NULL DEFAULT 'Open', -- 'Open' | 'Assigned' | 'Completed'
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT PK_ReliefRequests PRIMARY KEY (RequestId),
        CONSTRAINT FK_ReliefRequests_Users
            FOREIGN KEY (CreatedByUserId) REFERENCES dbo.Users(UserId)
    );
END
GO

/* ============================================
   8) RESOURCES TABLE
  
============================================ */
IF OBJECT_ID('dbo.Resources', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Resources (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Category NVARCHAR(50) NULL,
        Quantity INT NOT NULL DEFAULT 0,
        AllocationStatus NVARCHAR(20) NOT NULL DEFAULT 'NotAllocated',
        AllocatedRequestId UNIQUEIDENTIFIER NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Resources_ReliefRequests
            FOREIGN KEY (AllocatedRequestId)
            REFERENCES dbo.ReliefRequests(RequestId)
    );
END
GO

/* ============================================
   9) RESOURCE ALLOCATIONS TABLE
  
============================================ */
IF OBJECT_ID('dbo.ResourceAllocations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ResourceAllocations (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ResourceId INT NOT NULL,
        ReliefRequestId UNIQUEIDENTIFIER NOT NULL,
        AllocatedQuantity INT NOT NULL,
        AllocatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_ResourceAllocations_Resources
            FOREIGN KEY (ResourceId)
            REFERENCES dbo.Resources(Id),
        CONSTRAINT FK_ResourceAllocations_ReliefRequests
            FOREIGN KEY (ReliefRequestId)
            REFERENCES dbo.ReliefRequests(RequestId)
    );
END
GO