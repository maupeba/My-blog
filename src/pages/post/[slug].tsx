/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable prettier/prettier */
import { GetStaticPaths, GetStaticProps } from 'next';

import { FiCalendar, FiUser } from 'react-icons/fi'

import Head from 'next/head';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';


import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { content } = post.data;
  const router = useRouter();

  console.log('PROPS',post.data.content)

  if (router.isFallback) {
    return <h1>Carregando...</h1>
  }

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <img className={styles.banner} src={post.data.banner.url} alt="Banner" />
      <main className={commonStyles.posts}>
        <h1>{post.data.title}</h1>
        <div className={commonStyles.timeAndUserInfo}>
          <FiCalendar />
          <time>{post.first_publication_date}</time>
          <FiUser />
          <span>{post.data.author}</span>
        </div>
        { content.map(art => (
          <article>
            <div
              className={styles.postContent}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{__html: RichText.asHtml(art.body)}}
            />
          </article>
        )) }
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
      pageSize: 2,
  });

  // const slugs = posts.results.map(post => {
  //   return {
  //     params: { slug: post.uid }
  //   }
  // })

  return {
    paths: [{ params: { slug: posts.results[0].uid } },
            { params: { slug: posts.results[1].uid } }
           ],
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  console.log('RESPONSE', response.data.content)

  const post = {
    first_publication_date: new Date(response.first_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: [...response.data.content]
    }
  }

  return {
    props: { post },
    revalidate: 60 * 60 // 1h
  };

};
