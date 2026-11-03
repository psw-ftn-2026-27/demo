using Shared.Domain.Exceptions;
using Social.Application.Blogs;

namespace Social.Application.BlogAuthoring;

public sealed class BlogAuthoringQueries
{
    private readonly IBlogReadRepository _blogReadRepository;

    public BlogAuthoringQueries(IBlogReadRepository blogReadRepository)
    {
        _blogReadRepository = blogReadRepository;
    }

    public Task<List<BlogDto>> GetByAuthorAsync(Guid authorId)
    {
        return _blogReadRepository.GetByAuthorAsync(authorId);
    }

    public async Task<BlogDto> GetOwnByIdAsync(Guid blogId, Guid authorId)
    {
        var blog = await _blogReadRepository.GetByIdAsync(blogId);
        if (blog is null || blog.AuthorId != authorId)
        {
            throw new NotFoundException($"Blog {blogId} does not exist.");
        }

        return blog;
    }
}
