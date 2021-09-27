/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { GetStaticProps } from 'next';
import Link from 'next/link';

import Head from 'next/head';

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
  console.log(postsPagination)
  const { results } = postsPagination;
  return(
    <>
      <Head>
        <title>Home | My Blog</title>
      </Head>

      <main>
      <div className={styles.posts}>
          { results.map(post => (
            <Link key={post.uid} href={`/posts/${post.uid}`}>
              <a >
                <strong>{post.data.title}</strong>
                <span>{post.data.subtitle}</span>
                <time>{post.first_publication_date}</time>
              </a>
            </Link>
          )) }
        </div>
      </main>
    </>
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

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts
  }

  return {
    props: {
      postsPagination
    },
  };
};
