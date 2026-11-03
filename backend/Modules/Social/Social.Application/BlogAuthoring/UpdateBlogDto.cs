namespace Social.Application.BlogAuthoring;

public sealed record UpdateBlogDto(string Title, string Description, List<string>? Images);
