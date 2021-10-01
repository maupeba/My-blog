/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { GetStaticProps } from 'next';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi'

import Head from 'next/head';

import Prismic from '@prismicio/client';
import { useState } from 'react';
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
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function handleFindMorePosts() {
    if (nextPage) {
      try {
        const requestOptions = {
          method: 'GET'
        }

        fetch(nextPage, requestOptions)
        .then(response => response.json())
        .then(response => {
          const newPosts = response.results.map((post: Post) => {
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
          setPosts([...posts, ...newPosts])
          setNextPage(response.next_page);
        })
      } catch (err) {
        console.log(err.message)
      }
    }
  }

  return(
    <>
      <Head>
        <title>Home | My Blog</title>
      </Head>

      <main className={styles.posts}>
        { posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <div className={styles.postInfo}>
              <a >
                <strong>{post.data.title}</strong>
                <span>{post.data.subtitle}</span>
                <div className={styles.timeAndUserInfo}>
                  <FiCalendar />
                  <time>{post.first_publication_date}</time>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </a>
            </div>
          </Link>
        )) }

        { nextPage ? (
          <button onClick={handleFindMorePosts} type="button">
          Carregar mais posts
        </button>
        ) : (
          null
        )}
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
