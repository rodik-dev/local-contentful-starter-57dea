const { cssClassesFromUrlPath } = require('./src/utils/page-utils');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
    plugins: [
        /**
         * The `sourcebit-source-contentful` plugin pulls entries from contentful using the provided credentials,
         * and generates an array of objects that are passed to subsequent plugins.
         */
        {
            module: require('sourcebit-source-contentful'),
            options: {
                accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
                // deliveryToken is optional, if not specified will be automatically created and reused
                deliveryToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
                // previewToken is optional, if not specified will be automatically created and reused
                previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN,
                spaceId: process.env.CONTENTFUL_SPACE_ID,
                environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
                preview: isDev,
                watch: isDev
            }
        },

        /**
         * The `sourcebit-target-next` plugin receives objects generated by `sourcebit-source-contentful` plugin,
         * and generates new data that is consumed by Next.js `getStaticPaths` and `getStaticProps` methods.
         * The generated data is cached and stored inside `.sourcebit-nextjs-cache.json` file.
         *
         * The generated data is an object with three properties:
         * - objects: Array of objects representing all content entries loaded by the `sourcebit-source-contentful` plugin.
         * - pages: Array of objects representing site pages props. This array is generated by the `pages()` method.
         * - props: Object with common props that will be merged with props of every page. This object is generated by
         *          the `commonProps()` method.
         */
        {
            module: require('sourcebit-target-next'),
            options: {
                liveUpdate: isDev,
                flattenAssetUrls: true,
                commonProps: (objects) => {
                    const site = objects.find((page) => page.__metadata.modelName === 'Config');
                    return { site };
                },
                pages: (objects) => {
                    // const personObjects = objects.filter((object) => object.__metadata.modelName === 'Person' && !!object.slug);
                    // const personPages = personObjects.map((person) => {
                    //     const { __metadata, ...restProps } = person;
                    //     const urlPath = `/blog/author/${person.slug}`;
                    //     return {
                    //         __metadata: {
                    //             ...__metadata,
                    //             urlPath,
                    //             pageCssClasses: cssClassesFromUrlPath(urlPath)
                    //         },
                    //         ...restProps
                    //     };
                    // });

                    const pageObjects = objects.filter((page) => ['PageLayout', 'PostLayout', 'PostFeedLayout', 'PostFeedCategoryLayout'].includes(page.__metadata.modelName));
                    const pages = pageObjects.map((page) => {
                        const { __metadata, ...restProps } = page;
                        const urlPath = page.slug.startsWith('/') ? page.slug : `/${page.slug}`;
                        return {
                            __metadata: {
                                ...__metadata,
                                urlPath,
                                pageCssClasses: cssClassesFromUrlPath(urlPath)
                            },
                            ...restProps
                        };
                    });

                    return [...pages];
                }
            }
        }
    ]
};
