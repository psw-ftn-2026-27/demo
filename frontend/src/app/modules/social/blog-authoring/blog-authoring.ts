import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BlogDto, CreateBlogDto, UpdateBlogDto } from '../api/social-api-types';

const BASE_URL = '/api/social/blogs';

@Injectable({ providedIn: 'root' })
export class BlogAuthoring {
  private readonly http = inject(HttpClient);

  async create(dto: CreateBlogDto): Promise<BlogDto> {
    return firstValueFrom(this.http.post<BlogDto>(BASE_URL, dto));
  }

  async update(id: string, dto: UpdateBlogDto): Promise<void> {
    await firstValueFrom(this.http.put<void>(`${BASE_URL}/${id}`, dto));
  }

  async publish(id: string): Promise<void> {
    await firstValueFrom(this.http.post<void>(`${BASE_URL}/${id}/publish`, {}));
  }
}
