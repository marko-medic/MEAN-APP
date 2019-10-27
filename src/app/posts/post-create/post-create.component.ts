import { Component, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from './mime-type.validator.ts';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  post: Post;
  isLoading = false;
  form: FormGroup;
  imageString: string;
  private mode = 'create';
  private id: string;

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute
  ) {}

  onSavePost(): void {
    if (!this.form.valid) {
      return;
    }

    const post: Post = {
      title: this.form.value.title,
      content: this.form.value.content,
      imagePath: this.form.value.image
    };

    if (this.mode === 'create') {
      this.postsService.addPost(post);
      this.form.reset();
    } else {
      this.postsService.updatePost(this.id, post);
    }
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imageString = reader.result.toString();
    };
    reader.readAsDataURL(file);
  }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, {
        validators: [Validators.required]
      }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('id')) {
        this.mode = 'update';
        const postId = paramMap.get('id');
        this.id = postId;
        this.isLoading = true;
        this.postsService.getPost(postId).subscribe(resp => {
          this.isLoading = false;
          this.post = {
            id: resp.post._id,
            title: resp.post.title,
            content: resp.post.content,
            imagePath: resp.post.imagePath
          };

          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
        });
      } else {
        this.mode = 'create';
        this.id = null;
      }
    });
  }
}
