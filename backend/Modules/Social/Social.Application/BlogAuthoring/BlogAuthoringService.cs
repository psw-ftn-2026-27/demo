using AutoMapper;
using Shared.Domain.Exceptions;
using Social.Application.Blogs;
using Social.Domain.Blogs;

namespace Social.Application.BlogAuthoring;

public sealed class BlogAuthoringService
{
    private readonly IBlogRepository _blogRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public BlogAuthoringService(IBlogRepository blogRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _blogRepository = blogRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<BlogDto> CreateAsync(Guid authorId, CreateBlogDto dto)
    {
        var blog = new Blog(authorId, dto.Title, dto.Description, dto.Images);

        _blogRepository.Add(blog);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<BlogDto>(blog);
    }

    public async Task PublishAsync(Guid blogId, Guid authorId)
    {
        var blog = await GetOwnedBlogAsync(blogId, authorId);

        blog.Publish();
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task UpdateAsync(Guid blogId, Guid authorId, UpdateBlogDto dto)
    {
        var blog = await GetOwnedBlogAsync(blogId, authorId);

        blog.Update(dto.Title, dto.Description, dto.Images);
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task<Blog> GetOwnedBlogAsync(Guid blogId, Guid authorId)
    {
        var blog = await _blogRepository.GetByIdAsync(blogId);
        if (blog is null || blog.AuthorId != authorId)
        {
            throw new NotFoundException($"Blog {blogId} does not exist.");
        }
        return blog;
    }
}
