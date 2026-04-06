IF OBJECT_ID('dbo.Resources', 'U') IS NULL
BEGIN
    CREATE TABLE Resources (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Type NVARCHAR(50),
        Quantity INT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID('dbo.ResourceAllocations', 'U') IS NULL
BEGIN
    CREATE TABLE ResourceAllocations (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ResourceId INT NOT NULL,
        ReliefRequestId UNIQUEIDENTIFIER NOT NULL,
        AllocatedQuantity INT NOT NULL,
        AllocatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
        FOREIGN KEY (ResourceId) REFERENCES Resources(Id),
        FOREIGN KEY (ReliefRequestId) REFERENCES ReliefRequests(RequestId)
    );
END
GO