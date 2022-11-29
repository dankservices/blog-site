import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
    const fileNames = fs.readdirSync(postsDirectory);
    const postsData = fileNames.map((fileName) => {
        const id = fileName.replace(/\.md$/, '');

        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        return {
            id,
            ...matterResult.data,
        }
    });
    return postsData
}
export function getAllPostIds() {
    let parsedParams = [];
    const fileNames = fs.readdirSync(postsDirectory);
    for (const fileName of fileNames) {
        let seriesPath = path.join(postsDirectory, fileName);
        let seriesFileNames = fs.readdirSync(seriesPath);
        for (const seriesFileName of seriesFileNames) {
            parsedParams.push({
                params: {
                    slug: fileName,
                    id: seriesFileName.replace(/\.md$/, '')
                }
            });
        }
    }
    return parsedParams;
}

export async function getPostData(slug: string, id: string) {
    const fullPath = path.join(postsDirectory, `${slug}/${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const matterResult = matter(fileContents);

    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    return {
        id,
        contentHtml,
        ...matterResult.data,
    }
}