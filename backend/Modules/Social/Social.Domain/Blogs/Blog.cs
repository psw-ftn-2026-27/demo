using Shared.Domain;
using Shared.Domain.Exceptions;

namespace Social.Domain.Blogs;

public sealed class Blog : AggregateRoot
{
    public Guid AuthorId { get; private set; }
    public string Title { get; private set; }
    public string Description { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? LastModifiedAt { get; private set; }
    public List<string> Images { get; private set; }
    public BlogStatus Status { get; private set; }
    private readonly List<Comment> _comments = [];
    public IReadOnlyList<Comment> Comments => _comments;

    private Blog()
    {
        Title = null!;
        Description = null!;
        Images = null!;
    }

    public Blog(Guid authorId, string title, string description, List<string>? images)
        : base(Guid.NewGuid())
    {
        EnsureTitleAndDescription(title, description);

        AuthorId = authorId;
        Title = title;
        Description = description;
        CreatedAt = DateTime.UtcNow;
        LastModifiedAt = CreatedAt;
        Images = images ?? [];
        Status = BlogStatus.Draft;
    }

    public void Update(string title, string description, List<string>? images)
    {
        EnsureTitleAndDescription(title, description);

        Title = title;
        Description = description;
        Images = images ?? [];
        LastModifiedAt = DateTime.UtcNow;
    }

    public void Publish()
    {
        if (Status != BlogStatus.Draft)
        {
            throw new DomainException("Only a draft blog can be published.");
        }

        Status = BlogStatus.Published;
    }

    public void AddComment(Guid userId, string text)
    {
        EnsurePublished();

        _comments.Add(new Comment(userId, text));
    }

    public void UpdateComment(Guid commentId, Guid userId, string text)
    {
        EnsurePublished();

        GetOwnComment(commentId, userId).Update(text);
    }

    public void DeleteComment(Guid commentId, Guid userId)
    {
        EnsurePublished();

        _comments.Remove(GetOwnComment(commentId, userId));
    }

    private static void EnsureTitleAndDescription(string title, string description)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new DomainException("A blog requires a title.");
        }
        if (string.IsNullOrWhiteSpace(description))
        {
            throw new DomainException("A blog requires a description.");
        }
    }

    private void EnsurePublished()
    {
        if (Status != BlogStatus.Published)
        {
            throw new DomainException("Comments are allowed only on a published blog.");
        }
    }

    private Comment GetOwnComment(Guid commentId, Guid userId)
    {
        var comment = _comments.FirstOrDefault(comment => comment.Id == commentId && comment.UserId == userId);
        if (comment is null)
        {
            throw new NotFoundException($"Comment {commentId} does not exist.");
        }
        return comment;
    }
}
