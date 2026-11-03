using FluentAssertions;
using Shared.Domain.Exceptions;
using Shared.Tests;
using Social.Domain.Blogs;
using Xunit;

namespace Social.Tests.Unit.Blogs;

public class BlogTests
{
    private static Blog CreateBlog() =>
        new(WellKnownUsers.Explorer, "Utisci sa tvrđave", "Opis obilaska tvrđave.", ["https://example.com/tvrdjava.jpg"]);

    private static Blog CreatePublishedBlog()
    {
        var blog = CreateBlog();
        blog.Publish();
        return blog;
    }

    [Fact]
    public void New_blog_starts_as_a_draft()
    {
        var blog = CreateBlog();

        blog.Status.Should().Be(BlogStatus.Draft);
        blog.AuthorId.Should().Be(WellKnownUsers.Explorer);
        blog.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        blog.Comments.Should().BeEmpty();
    }

    [Fact]
    public void New_blog_was_last_modified_when_it_was_created()
    {
        var blog = CreateBlog();

        blog.LastModifiedAt.Should().Be(blog.CreatedAt);
    }

    [Fact]
    public void Author_changes_the_title_description_and_images_of_a_blog()
    {
        var blog = CreateBlog();
        var createdAt = blog.CreatedAt;
        var updateStart = DateTime.UtcNow;

        blog.Update("Nov naslov", "Nov opis obilaska.", ["https://example.com/nova.jpg", "https://example.com/druga.jpg"]);

        blog.Title.Should().Be("Nov naslov");
        blog.Description.Should().Be("Nov opis obilaska.");
        blog.Images.Should().Equal("https://example.com/nova.jpg", "https://example.com/druga.jpg");
        blog.LastModifiedAt.Should().BeOnOrAfter(updateStart);
        blog.CreatedAt.Should().Be(createdAt);
    }

    [Theory]
    [InlineData("", "Nov opis obilaska.")]
    [InlineData("   ", "Nov opis obilaska.")]
    [InlineData("Nov naslov", "")]
    [InlineData("Nov naslov", "   ")]
    public void Blog_cannot_be_changed_to_have_an_empty_title_or_description(string title, string description)
    {
        var blog = CreateBlog();

        var update = () => blog.Update(title, description, []);

        update.Should().Throw<DomainException>();
    }

    [Fact]
    public void New_blog_without_images_has_no_images()
    {
        var blog = new Blog(WellKnownUsers.Explorer, "Utisci sa tvrđave", "Opis obilaska tvrđave.", null);

        blog.Images.Should().BeEmpty();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void New_blog_requires_a_title(string title)
    {
        var creation = () => new Blog(WellKnownUsers.Explorer, title, "Opis obilaska tvrđave.", []);

        creation.Should().Throw<DomainException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void New_blog_requires_a_description(string description)
    {
        var creation = () => new Blog(WellKnownUsers.Explorer, "Utisci sa tvrđave", description, []);

        creation.Should().Throw<DomainException>();
    }

    [Fact]
    public void Draft_blog_is_published()
    {
        var blog = CreateBlog();

        blog.Publish();

        blog.Status.Should().Be(BlogStatus.Published);
    }

    [Fact]
    public void Published_blog_cannot_be_published_again()
    {
        var blog = CreatePublishedBlog();

        var publishing = () => blog.Publish();

        publishing.Should().Throw<DomainException>();
    }

    [Fact]
    public void User_comments_on_a_published_blog()
    {
        var blog = CreatePublishedBlog();

        blog.AddComment(WellKnownUsers.Administrator, "Odlična tura!");

        blog.Comments.Should().ContainSingle(comment =>
            comment.UserId == WellKnownUsers.Administrator && comment.Text == "Odlična tura!");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Comment_requires_text(string text)
    {
        var blog = CreatePublishedBlog();

        var addition = () => blog.AddComment(WellKnownUsers.Administrator, text);

        addition.Should().Throw<DomainException>();
    }

    [Fact]
    public void User_edits_their_own_comment()
    {
        var blog = CreatePublishedBlog();
        blog.AddComment(WellKnownUsers.Administrator, "Odlična tura!");
        var comment = blog.Comments.Single();

        blog.UpdateComment(comment.Id, WellKnownUsers.Administrator, "Ipak prosečna tura.");

        blog.Comments.Single().Text.Should().Be("Ipak prosečna tura.");
    }

    [Fact]
    public void User_cannot_edit_another_users_comment()
    {
        var blog = CreatePublishedBlog();
        blog.AddComment(WellKnownUsers.Administrator, "Odlična tura!");
        var comment = blog.Comments.Single();

        var update = () => blog.UpdateComment(comment.Id, WellKnownUsers.Explorer, "Izmena tuđeg komentara.");

        update.Should().Throw<NotFoundException>();
    }

    [Fact]
    public void User_deletes_their_own_comment()
    {
        var blog = CreatePublishedBlog();
        blog.AddComment(WellKnownUsers.Administrator, "Odlična tura!");
        var comment = blog.Comments.Single();

        blog.DeleteComment(comment.Id, WellKnownUsers.Administrator);

        blog.Comments.Should().BeEmpty();
    }

}
