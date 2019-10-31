import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  paging = {
    rowsPerPage: 2,
    pageLength: 0,
    currentPage: 1,
    options: [1, 2, 5, 10]
  };
  isUserAuth = false;
  userId: string;
  private postsSub: Subscription;
  private authSub: Subscription;

  constructor(
    private postsService: PostsService,
    private authService: AuthService
  ) {}

  onDeletePost(id: string) {
    this.isLoading = true;
    this.postsService
      .deletePost(id)
      .subscribe(() =>
        this.postsService.getPosts(
          this.paging.currentPage,
          this.paging.rowsPerPage
        )
      );
  }

  onChangePage(page: PageEvent) {
    this.isLoading = true;
    this.paging.currentPage = page.pageIndex + 1; // jer pageIndex krece od 0
    this.paging.rowsPerPage = page.pageSize;
    this.postsService.getPosts(
      this.paging.currentPage,
      this.paging.rowsPerPage
    );
  }

  ngOnInit() {
    this.postsService.getPosts(
      this.paging.currentPage,
      this.paging.rowsPerPage
    );
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.postsSub = this.postsService
      .getUpdateListener()
      .subscribe((resp: { data: any[]; maxPosts: number }) => {
        this.isLoading = false;
        this.posts = resp.data;
        this.paging.pageLength = resp.maxPosts;
      });
    this.authSub = this.authService.getAuthSubject().subscribe(isAuth => {
      this.isUserAuth = isAuth; // problematicno jer kasni (onInit se poziva tek kada se prikaze stranica)
      this.userId = this.authService.getUserId();
    });
    this.isUserAuth = this.authService.getIsAuth();
    // isto vazi i za header (kasni)
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authSub.unsubscribe();
  }
}
