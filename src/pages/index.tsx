/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';


import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  // const { next_page, results } = postsPagination;
  return(
    <h1>
      TESTE
    </h1>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: [
      'posts.title',
      'posts.subtitle',
      'posts.author',
      'posts.banner',
      'posts.content'
    ],
    pageSize: 1,
  });

  console.log(postsResponse);

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
    }
  })

  return {
    props: {
      next_page: postsResponse?.next_page ?? null,
      results: posts
    },
  };
};
