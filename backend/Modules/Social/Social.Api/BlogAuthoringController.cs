using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Api;
using Social.Application.BlogAuthoring;
using Social.Application.Blogs;

namespace Social.Api;

[ApiController]
[Route("api/social/blogs")]
[Authorize(Roles = "explorer")]
public sealed class BlogAuthoringController : ControllerBase
{
    private readonly BlogAuthoringService _authoringService;
    private readonly BlogAuthoringQueries _authoringQueries;

    public BlogAuthoringController(
        BlogAuthoringService authoringService,
        BlogAuthoringQueries authoringQueries)
    {
        _authoringService = authoringService;
        _authoringQueries = authoringQueries;
    }

    [HttpPost]
    public async Task<ActionResult<BlogDto>> Create(CreateBlogDto dto)
    {
        return await _authoringService.CreateAsync(User.GetUserId(), dto);
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult> Publish(Guid id)
    {
        await _authoringService.PublishAsync(id, User.GetUserId());
        return NoContent();
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, UpdateBlogDto dto)
    {
        await _authoringService.UpdateAsync(id, User.GetUserId(), dto);
        return NoContent();
    }

    [HttpGet("mine")]
    public async Task<ActionResult<List<BlogDto>>> GetMine()
    {
        return await _authoringQueries.GetByAuthorAsync(User.GetUserId());
    }

    [HttpGet("mine/{id:guid}")]
    public async Task<ActionResult<BlogDto>> GetOwn(Guid id)
    {
        return await _authoringQueries.GetOwnByIdAsync(id, User.GetUserId());
    }
}
