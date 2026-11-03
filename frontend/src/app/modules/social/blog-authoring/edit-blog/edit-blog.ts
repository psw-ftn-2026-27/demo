import { httpResource } from '@angular/common/http';
import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { serverMessage } from '../../../../shared/util/server-message';
import { BlogDto } from '../../api/social-api-types';
import { BlogAuthoring } from '../blog-authoring';

@Component({
  imports: [FormField],
  selector: 'app-edit-blog',
  styleUrl: './edit-blog.scss',
  templateUrl: './edit-blog.html',
})
export class EditBlog {
  private readonly blogAuthoring = inject(BlogAuthoring);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly blog = httpResource<BlogDto>(() => `/api/social/blogs/mine/${this.id()}`);

  private readonly model = linkedSignal(() => {
    const blog = this.blog.value();
    return {
      title: blog?.title ?? '',
      description: blog?.description ?? '',
      images: blog?.images.join('\n') ?? '',
    };
  });

  protected readonly form = form(this.model, (path) => {
    required(path.title, { message: 'Title is required.' });
    required(path.description, { message: 'Description is required.' });
  });

  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    this.pending.set(true);
    this.error.set(null);
    try {
      await this.blogAuthoring.update(this.id(), {
        title: this.form.title().value(),
        description: this.form.description().value(),
        images: this.form
          .images()
          .value()
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line !== ''),
      });
      await this.router.navigate(['/social/mine']);
    } catch (failure) {
      this.error.set(serverMessage(failure, 'Could not save the blog.'));
    } finally {
      this.pending.set(false);
    }
  }
}
