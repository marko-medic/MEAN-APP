export interface Post {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  imagePath: string | File;
}
