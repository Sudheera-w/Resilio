-- ============================================================
-- Migration : V003__create_resources_table.sql
-- Sprint    : Sprint 3
-- Date      : 2026-03-23
-- Author    : DevOps (Nesanka) | RES-68
-- Description: Creates Resources and ResourceAllocations tables
--              for the Resource Management module (EPIC-03)
-- ============================================================

-- Resources table
IF OBJECT_ID('dbo.Resources', 'U') IS NULL
BEGIN
    CREATE TABLE Resources (
        Id                  INT             IDENTITY(1,1)   PRIMARY KEY,
        Name                NVARCHAR(100)   NOT NULL,
        Type                NVARCHAR(50)    NULL,
        Quantity            INT             NOT NULL DEFAULT 0,
        CreatedAt           DATETIME2       DEFAULT SYSUTCDATETIME(),
        UpdatedAt           DATETIME2       DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CHK_Resources_Quantity CHECK (Quantity >= 0)
    );
    PRINT 'Table Resources created successfully.';
END
ELSE
BEGIN
    PRINT 'Table Resources already exists. Skipping.';
END
GO

-- ResourceAllocations table
IF OBJECT_ID('dbo.ResourceAllocations', 'U') IS NULL
BEGIN
    CREATE TABLE ResourceAllocations (
        Id                  INT             IDENTITY(1,1)   PRIMARY KEY,
        ResourceId          INT             NOT NULL,
        ReliefRequestId     UNIQUEIDENTIFIER NOT NULL,
        AllocatedQuantity   INT             NOT NULL,
        AllocatedAt         DATETIME2       DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_ResourceAllocations_Resources
            FOREIGN KEY (ResourceId) REFERENCES Resources(Id),
        CONSTRAINT FK_ResourceAllocations_ReliefRequests
            FOREIGN KEY (ReliefRequestId) REFERENCES ReliefRequests(RequestId),
        CONSTRAINT CHK_AllocatedQuantity CHECK (AllocatedQuantity > 0)
    );
    PRINT 'Table ResourceAllocations created successfully.';
END
ELSE
BEGIN
    PRINT 'Table ResourceAllocations already exists. Skipping.';
END
GO
