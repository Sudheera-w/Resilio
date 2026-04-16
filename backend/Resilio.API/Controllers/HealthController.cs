using Microsoft.AspNetCore.Mvc;

namespace Resilio.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { message = "Resilio Backend Running" });
        }
    }
}
