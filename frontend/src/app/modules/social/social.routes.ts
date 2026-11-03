import { Routes } from '@angular/router';
import { CreateBlog } from './blog-authoring/create-blog/create-blog';
import { EditBlog } from './blog-authoring/edit-blog/edit-blog';
import { MyBlogs } from './blog-authoring/my-blogs/my-blogs';
import { BlogDetail } from './blog-reading/blog-detail/blog-detail';
import { BlogList } from './blog-reading/blog-list/blog-list';

export const socialRoutes: Routes = [
  { path: '', component: BlogList },
  { path: 'mine', component: MyBlogs },
  { path: 'create', component: CreateBlog },
  { path: ':id/edit', component: EditBlog },
  { path: ':id', component: BlogDetail },
];
