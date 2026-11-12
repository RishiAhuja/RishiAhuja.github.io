import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths = (async () => {
  const papers = await getCollection('research');
  return papers.filter((paper) => paper.data.bibtex).map((paper) => ({
    params: { slug: paper.slug },
    props: { bibtex: paper.data.bibtex! },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(props.bibtex, { headers: { 'Content-Type': 'application/x-bibtex; charset=utf-8' } });
