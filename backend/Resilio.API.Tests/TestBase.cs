using Microsoft.EntityFrameworkCore;
using Resilio.API.Data;
using System;

namespace Resilio.API.Tests;

public class TestBase
{
    protected ResilioDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ResilioDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new ResilioDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }
}
