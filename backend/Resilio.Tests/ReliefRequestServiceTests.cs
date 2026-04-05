using Moq;
using Resilio.API.Services;
using Resilio.Core.DTOs;
using Resilio.Core.Interfaces;
using Xunit;

namespace Resilio.Tests;

public class ReliefRequestServiceTests
{
    
    private readonly Mock<IReliefRequestRepository> _repo = new();
    private ReliefRequestService Svc() => new(_repo.Object);

    // helper to make a fake record quickly
    private static ReliefRequestRecord FakeRecord(
        Guid id, string status = "Open", string urgency = "High") =>
        new(id, Guid.NewGuid(), "Colombo 07", "Need food",
            urgency, status, DateTime.UtcNow, DateTime.UtcNow);

    //create

    //normal successful creation
    [Fact]
    public async Task Create_ValidRequest_ReturnsResponse() //
    {
        var uid = Guid.NewGuid();
        _repo.Setup(r => r.CreateAsync(It.IsAny<ReliefRequestRecord>(), default))
             .ReturnsAsync((ReliefRequestRecord rec, CancellationToken _) => rec);

        var result = await Svc().CreateAsync(
            uid, new("Colombo 07", "Need food", "High"), default);

        Assert.Equal("Colombo 07", result.Area);
        Assert.Equal("Open", result.Status);
        Assert.Equal(uid, result.CreatedByUserId);
        Assert.Equal("High", result.Urgency);
    }

    //checks new request is set to open
    [Fact]
    public async Task Create_StatusIsAlwaysOpen()
    {
        _repo.Setup(r => r.CreateAsync(It.IsAny<ReliefRequestRecord>(), default))
             .ReturnsAsync((ReliefRequestRecord rec, CancellationToken _) => rec);

        var result = await Svc().CreateAsync(
            Guid.NewGuid(), new("Galle", null, "Low"), default);

        Assert.Equal("Open", result.Status);
    }

//checks ""
    [Fact]
    public async Task Create_MissingArea_ThrowsArgumentException() 
    {
        await Assert.ThrowsAsync<ArgumentException>(
            () => Svc().CreateAsync(
                Guid.NewGuid(), new("", null, "High"), default));
    }
//checks " "
    [Fact]
    public async Task Create_WhitespaceArea_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(
            () => Svc().CreateAsync(
                Guid.NewGuid(), new("   ", null, "High"), default));
    }

//This checks invalid urgency.
    [Fact]
    public async Task Create_InvalidUrgency_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(
            () => Svc().CreateAsync(
                Guid.NewGuid(), new("Colombo", null, "EXTREME"), default));
    }

//checks urgency is null
    [Fact]
    public async Task Create_NullUrgency_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(
            () => Svc().CreateAsync(
                Guid.NewGuid(), new("Colombo", null, null!), default));
    }

    
    //get all
    [Fact]
    public async Task GetAll_NoFilter_ReturnsAllRecords()
    {
        var records = new List<ReliefRequestRecord>
        {
            FakeRecord(Guid.NewGuid(), "Open"),
            FakeRecord(Guid.NewGuid(), "Completed"),
        };
        _repo.Setup(r => r.GetAllAsync(null, default))
             .ReturnsAsync(records);

        var result = await Svc().GetAllAsync(null, default);

        Assert.Equal(2, result.Count);
    }

    //valid filter
    [Fact]
    public async Task GetAll_ValidStatusFilter_ReturnsFilteredRecords()
    {
        var records = new List<ReliefRequestRecord>
        {
            FakeRecord(Guid.NewGuid(), "Open"),
        };
        _repo.Setup(r => r.GetAllAsync("Open", default))
             .ReturnsAsync(records);

        var result = await Svc().GetAllAsync("Open", default);

        Assert.Single(result);
        Assert.Equal("Open", result[0].Status);
    }

//invalid filter after input
    [Fact]
    public async Task GetAll_InvalidStatusFilter_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(
            () => Svc().GetAllAsync("Pending", default));
    }

//case when filter is effectively empty and repository returns nothing.
    [Fact]
    public async Task GetAll_EmptyFilter_ReturnsAll()
    {
        _repo.Setup(r => r.GetAllAsync(null, default))
             .ReturnsAsync(new List<ReliefRequestRecord>());

        var result = await Svc().GetAllAsync(null, default);

        Assert.Empty(result);
    }

    //update
    [Fact]
    public async Task Update_ValidRequest_ReturnsUpdatedResponse()
    {
        var id = Guid.NewGuid();
        _repo.Setup(r => r.GetByIdAsync(id, default))
             .ReturnsAsync(FakeRecord(id, "Open", "Low"));
        _repo.Setup(r => r.UpdateAsync(It.IsAny<ReliefRequestRecord>(), default))
             .ReturnsAsync((ReliefRequestRecord rec, CancellationToken _) => rec);

        var result = await Svc().UpdateAsync(
            id, new("Kandy", null, "Critical"), default);

        Assert.Equal("Kandy", result.Area);
        Assert.Equal("Critical", result.Urgency);
    }

    [Fact]
    public async Task Update_PartialUpdate_KeepsOldValues()
    {
        var id = Guid.NewGuid();
        _repo.Setup(r => r.GetByIdAsync(id, default))
             .ReturnsAsync(new ReliefRequestRecord(
                 id, Guid.NewGuid(), "Old Area", "Old Desc",
                 "Low", "Open", DateTime.UtcNow, DateTime.UtcNow));
        _repo.Setup(r => r.UpdateAsync(It.IsAny<ReliefRequestRecord>(), default))
             .ReturnsAsync((ReliefRequestRecord rec, CancellationToken _) => rec);

        // only send urgency — area and description should stay the same
        var result = await Svc().UpdateAsync(
            id, new(null, null, "High"), default);

        Assert.Equal("Old Area", result.Area);
        Assert.Equal("Old Desc", result.Description);
        Assert.Equal("High", result.Urgency);
    }

    [Fact]
    public async Task Update_CompletedRequest_ThrowsInvalidOperation()
    {
        var id = Guid.NewGuid();
        _repo.Setup(r => r.GetByIdAsync(id, default))
             .ReturnsAsync(FakeRecord(id, "Completed"));

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => Svc().UpdateAsync(id, new("New Area", null, null), default));
    }

    [Fact]
    public async Task Update_NotFound_ThrowsKeyNotFoundException()
    {
        var id = Guid.NewGuid();
        _repo.Setup(r => r.GetByIdAsync(id, default))
             .ReturnsAsync((ReliefRequestRecord?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => Svc().UpdateAsync(id, new("Area", null, null), default));
    }

    [Fact]
    public async Task Update_InvalidUrgency_ThrowsArgumentException()
    {
        var id = Guid.NewGuid();
        _repo.Setup(r => r.GetByIdAsync(id, default))
             .ReturnsAsync(FakeRecord(id, "Open"));

        await Assert.ThrowsAsync<ArgumentException>(
            () => Svc().UpdateAsync(id, new("Area", null, "INVALID"), default));
    }

    [Fact]
    public async Task Update_AssignedRequest_CanBeEdited()
    {
        var id = Guid.NewGuid();
        _repo.Setup(r => r.GetByIdAsync(id, default))
             .ReturnsAsync(FakeRecord(id, "Assigned"));
        _repo.Setup(r => r.UpdateAsync(It.IsAny<ReliefRequestRecord>(), default))
             .ReturnsAsync((ReliefRequestRecord rec, CancellationToken _) => rec);

        // Assigned requests CAN be edited — should not throw
        var result = await Svc().UpdateAsync(
            id, new("New Area", null, null), default);

        Assert.Equal("New Area", result.Area);
    }

    //delete
    [Fact]
    public async Task Delete_OpenRequest_Succeeds()
    {
        var id = Guid.NewGuid();
        _repo.Setup(r => r.GetByIdAsync(id, default))
             .ReturnsAsync(FakeRecord(id, "Open"));
        _repo.Setup(r => r.DeleteAsync(id, default))
             .Returns(Task.CompletedTask);

        await Svc().DeleteAsync(id, default); // should not throw

        // verify DeleteAsync was actually called once
        _repo.Verify(r => r.DeleteAsync(id, default), Times.Once);
    }

    [Fact]
    public async Task Delete_AssignedRequest_ThrowsInvalidOperation()
    {
        var id = Guid.NewGuid();
        _repo.Setup(r => r.GetByIdAsync(id, default))
             .ReturnsAsync(FakeRecord(id, "Assigned"));

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => Svc().DeleteAsync(id, default));
    }

    [Fact]
    public async Task Delete_CompletedRequest_ThrowsInvalidOperation()
    {
        var id = Guid.NewGuid();
        _repo.Setup(r => r.GetByIdAsync(id, default))
             .ReturnsAsync(FakeRecord(id, "Completed"));

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => Svc().DeleteAsync(id, default));
    }

    [Fact]
    public async Task Delete_NotFound_ThrowsKeyNotFoundException()
    {
        var id = Guid.NewGuid();
        _repo.Setup(r => r.GetByIdAsync(id, default))
             .ReturnsAsync((ReliefRequestRecord?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => Svc().DeleteAsync(id, default));
    }

    [Fact]
    public async Task Delete_OpenRequest_DeleteAsyncCalledOnce()
    {
        var id = Guid.NewGuid();
        _repo.Setup(r => r.GetByIdAsync(id, default))
             .ReturnsAsync(FakeRecord(id, "Open"));
        _repo.Setup(r => r.DeleteAsync(id, default))
             .Returns(Task.CompletedTask);

        await Svc().DeleteAsync(id, default);

        // ensure DeleteAsync was NOT called more than once
        _repo.Verify(r => r.DeleteAsync(id, default), Times.Once);
    }

    //get by user

    [Fact]
    public async Task GetByUser_ReturnsOnlyUsersRecords()
    {
        var uid = Guid.NewGuid();
        var records = new List<ReliefRequestRecord>
        {
            new(Guid.NewGuid(), uid, "Colombo", null,
                "High", "Open", DateTime.UtcNow, DateTime.UtcNow),
        };
        _repo.Setup(r => r.GetByUserIdAsync(uid, default))
             .ReturnsAsync(records);

        var result = await Svc().GetByUserAsync(uid, default);

        Assert.Single(result);
        Assert.Equal(uid, result[0].CreatedByUserId);
    }

    [Fact]
    public async Task GetByUser_NoRequests_ReturnsEmpty()
    {
        var uid = Guid.NewGuid();
        _repo.Setup(r => r.GetByUserIdAsync(uid, default))
             .ReturnsAsync(new List<ReliefRequestRecord>());

        var result = await Svc().GetByUserAsync(uid, default);

        Assert.Empty(result);
    }
}