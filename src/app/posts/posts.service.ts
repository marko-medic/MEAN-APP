import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post } from './post.model';
import { Router } from '@angular/router';

interface PostsData {
  message?: string;
  data: any[];
  maxPosts: number;
}

interface PostData {
  message: string;
  post: any;
}

const url = 'http://localhost:3000/api/posts';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  private postUpdated = new Subject<PostsData>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(page: number, pageSize: number): void {
    const queryString = `?page=${page}&pagesize=${pageSize}`;
    this.http
      .get<PostsData>(url + queryString)
      .pipe(
        map(resp => ({
          data: resp.data.map(post => ({
            title: post.title,
            content: post.content,
            imagePath: post.imagePath,
            authorId: post.authorId,
            id: post._id
          })),
          maxPosts: resp.maxPosts
        }))
      )
      .subscribe(transormedData => {
        this.posts = transormedData.data;
        this.postUpdated.next({
          data: [...this.posts],
          maxPosts: transormedData.maxPosts
        });
      });
  }

  addPost(post: Post): void {
    const formData = this.createFormData(post);
    this.http.post<PostData>(url, formData).subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  deletePost(id: string): Observable<object> {
    return this.http.delete(`${url}/${id}`);
  }

  updatePost(id: string, post: Post): void {
    let postData: Post | FormData;

    if (typeof post.imagePath === 'object') {
      postData = this.createFormData(post);
    } else {
      postData = post;
    }

    this.http.put(`${url}/${id}`, postData).subscribe(() => {
      // moze ovde da se updateuje lokalni niz postova ali nema smisla
      this.router.navigate(['/']);
    });
  }

  // koristi se subscribe 'na drugoj strani'
  getPost(id: string): Observable<PostData> {
    return this.http.get<PostData>(`${url}/${id}`);
  }

  getUpdateListener(): Observable<PostsData> {
    return this.postUpdated.asObservable();
  }

  private createFormData(post: Post): FormData {
    const formData = new FormData();
    for (const key in post) {
      if (key in post && key !== 'imagePath') {
        formData.append(key, post[key]);
      }
    }
    formData.set('image', post.imagePath, post.title);

    return formData;
  }
}
