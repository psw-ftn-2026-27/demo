using Microsoft.EntityFrameworkCore;
using Shared.Domain;
using Social.Application.Blogs;
using Social.Domain.Blogs;

namespace Social.Infrastructure.Persistence.Blogs;

internal sealed class BlogReadRepository : IBlogReadRepository
{
    private readonly SocialDbContext _dbContext;

    public BlogReadRepository(SocialDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<BlogDto?> GetByIdAsync(Guid id)
    {
        return ProjectToDtos(_dbContext.Blogs.Where(blog => blog.Id == id)).FirstOrDefaultAsync();
    }

    public Task<List<BlogDto>> GetByAuthorAsync(Guid authorId)
    {
        return ProjectToDtos(_dbContext.Blogs.Where(blog => blog.AuthorId == authorId)).ToListAsync();
    }

    public async Task<PageResult<BlogDto>> GetPublishedAsync(int page, int pageSize)
    {
        var published = _dbContext.Blogs
            .Where(blog => blog.Status == BlogStatus.Published)
            .OrderByDescending(blog => blog.CreatedAt);

        var totalCount = await published.CountAsync();
        var items = await ProjectToDtos(published)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PageResult<BlogDto>(items, totalCount);
    }

    private static IQueryable<BlogDto> ProjectToDtos(IQueryable<Blog> blogs)
    {
        return blogs
            .Select(blog => new BlogDto(
                blog.Id,
                blog.AuthorId,
                blog.Title,
                blog.Description,
                blog.CreatedAt,
                blog.LastModifiedAt ?? blog.CreatedAt,
                blog.Images,
                blog.Status,
                blog.Comments
                    .Select(comment => new CommentDto(comment.Id, comment.UserId, comment.Text, comment.CreatedAt))
                    .ToList()));
    }
}
